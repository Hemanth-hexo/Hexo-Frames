/**
 * Minimal wrapper around GitHub's Contents API — this is the entire
 * "backend" for the admin upload feature. There's no database: the admin
 * panel commits a resized image + an updated photos.json straight to the
 * repo, and Netlify's existing git-linked auto-deploy picks it up from
 * there, the same as any commit pushed from a terminal.
 */

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function apiBase() {
  const repo = env("GITHUB_REPO"); // "owner/repo"
  return `https://api.github.com/repos/${repo}/contents`;
}

function branch() {
  return process.env.GITHUB_BRANCH || "main";
}

function headers() {
  return {
    Authorization: `Bearer ${env("GITHUB_TOKEN")}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${apiBase()}/${path}?ref=${branch()}`, { headers: headers() });
  if (!res.ok) {
    throw new Error(`GitHub getFile failed for ${path}: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { content: string; sha: string; encoding: string };
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function putFile(
  path: string,
  contentBuffer: Buffer,
  message: string,
  sha?: string,
): Promise<void> {
  const res = await fetch(`${apiBase()}/${path}`, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: contentBuffer.toString("base64"),
      branch: branch(),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub putFile failed for ${path}: ${res.status} ${await res.text()}`);
  }
}
