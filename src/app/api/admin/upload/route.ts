import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import exifr from "exifr";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/adminAuth";
import { getFile, putFile } from "@/lib/github";
import type { WorldCategory } from "@/data/categories";

const PHOTOS_JSON_PATH = "src/data/photos.json";

async function isAuthed() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

/** Real EXIF only — if the camera didn't record something, we don't guess it. */
async function extractExif(buffer: Buffer): Promise<{ camera?: string; settings?: string }> {
  try {
    const data = await exifr.parse(buffer, ["Make", "Model", "FNumber", "ExposureTime", "ISO"]);
    if (!data) return {};

    const camera = data.Make && data.Model ? `${data.Make} ${data.Model}`.replace(/^SONY\s+/i, "Sony ") : undefined;

    const parts: string[] = [];
    if (typeof data.FNumber === "number") parts.push(`f/${Math.round(data.FNumber * 10) / 10}`);
    if (typeof data.ExposureTime === "number") {
      parts.push(data.ExposureTime < 1 ? `1/${Math.round(1 / data.ExposureTime)}s` : `${data.ExposureTime}s`);
    }
    if (data.ISO) parts.push(`ISO ${data.ISO}`);

    return { camera, settings: parts.length > 0 ? parts.join(" · ") : undefined };
  } catch {
    return {};
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export async function POST(request: NextRequest) {
  try {
    return await handleUpload(request);
  } catch (error) {
    // Last-resort net — every expected failure above already returns its own
    // clear JSON error; this only catches something genuinely unexpected,
    // so the client never has to handle an opaque empty 500 body.
    console.error("Unhandled error in /api/admin/upload:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 },
    );
  }
}

async function handleUpload(request: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const categoryId = form.get("categoryId") as string | null;
  const title = (form.get("title") as string | null)?.trim();
  const location = (form.get("location") as string | null)?.trim() || "";
  const description = (form.get("description") as string | null)?.trim() || "";
  const cameraOverride = (form.get("camera") as string | null)?.trim();
  const settingsOverride = (form.get("settings") as string | null)?.trim();

  if (!file || !categoryId || !title) {
    return NextResponse.json({ error: "file, categoryId, and title are required" }, { status: 400 });
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());

  const exif = await extractExif(originalBuffer);
  const camera = cameraOverride || exif.camera || "";
  const settings = settingsOverride || exif.settings || "";

  // Same treatment every other photo in this project gets: longest edge
  // capped at 1400px, ~75% JPEG quality — a full-res original here would
  // undo the entire point of keeping public/ small.
  let resized: Buffer;
  try {
    resized = await sharp(originalBuffer)
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();
  } catch (error) {
    return NextResponse.json(
      { error: `Couldn't process that image: ${error instanceof Error ? error.message : String(error)}` },
      { status: 400 },
    );
  }

  const filename = `${slugify(title)}-${Date.now()}.jpg`;
  const assetPath = `public/assets/${filename}`;

  // Validate the category and read the current photos.json BEFORE committing
  // anything — a bad categoryId or a GitHub read failure should never leave
  // an orphaned image committed with no matching entry.
  let content: string;
  let sha: string;
  try {
    ({ content, sha } = await getFile(PHOTOS_JSON_PATH));
  } catch (error) {
    return NextResponse.json(
      { error: `Couldn't read the current content from GitHub: ${error instanceof Error ? error.message : String(error)}` },
      { status: 502 },
    );
  }

  const categories = JSON.parse(content) as WorldCategory[];
  const category = categories.find((c) => c.id === categoryId);
  if (!category) {
    return NextResponse.json({ error: `Unknown category "${categoryId}"` }, { status: 400 });
  }

  const newPhoto = {
    id: `${categoryId}-${Date.now()}`,
    src: `/assets/${filename}`,
    title,
    location,
    camera,
    settings,
    description,
  };

  try {
    // 1) Commit the image itself.
    await putFile(assetPath, resized, `Add photo: ${title}`);

    // 2) Commit the updated photos.json.
    category.photos.push(newPhoto);
    await putFile(
      PHOTOS_JSON_PATH,
      Buffer.from(JSON.stringify(categories, null, 2) + "\n"),
      `Add "${title}" to ${categoryId}`,
      sha,
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: `Committing to GitHub failed: ${error instanceof Error ? error.message : String(error)}. If the image itself was committed, check the repo before retrying to avoid an orphaned file.`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, photo: newPhoto });
}
