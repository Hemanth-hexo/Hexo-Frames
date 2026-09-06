import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/adminAuth";
import { worldCategories } from "@/data/categories";
import AdminLogin from "./AdminLogin";
import AdminUpload from "./AdminUpload";

export const metadata = { robots: "noindex, nofollow" };

export default async function AdminPage() {
  const store = await cookies();
  const authed = verifySessionToken(store.get(COOKIE_NAME)?.value);

  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center px-6 py-16">
      {authed ? (
        <AdminUpload categories={worldCategories.map((c) => ({ id: c.id, title: c.title }))} />
      ) : (
        <AdminLogin />
      )}
    </div>
  );
}
