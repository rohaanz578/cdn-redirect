// src/handler.ts
import { nanoid } from "nanoid";

export async function handle(
  request: Request,
  database: KVNamespace,
  env: { CREATE_API_KEY: string },
): Promise<Response> {
  const url = new URL(request.url);
  const authHeader = request.headers.get("Authorization");

  try {
    // 🔐 Protected POST endpoints require API key
    const isProtected = request.method === "POST" && ["/create", "/bulk"].includes(url.pathname);
    if (isProtected) {
      const expected = `Bearer ${env.CREATE_API_KEY}`;
      if (authHeader !== expected) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    // ✅ Single URL creation
    if (request.method === "POST" && url.pathname === "/create") {
      const { target } = await request.json();
      if (!target) {
        return new Response("Missing target URL", { status: 400 });
      }
      const slug = nanoid(8);
      await database.put(slug, target);
      return new Response(JSON.stringify({ slug, target }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Bulk URL creation
    if (request.method === "POST" && url.pathname === "/bulk") {
      const { targets } = await request.json();
      if (!Array.isArray(targets) || targets.length === 0) {
        return new Response("Provide an array of target URLs", { status: 400 });
      }

      const results: { slug: string; target: string }[] = [];
      for (const target of targets) {
        const slug = nanoid(8);
        await database.put(slug, target);
        results.push({ slug, target });
      }

      return new Response(JSON.stringify(results), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Redirection for GET /:slug and root redirect
    if (request.method === "GET") {
      const path = url.pathname.slice(1); // remove leading "/"

      if (!path) {
        // Redirect root path to your homepage or a documentation page
        return new Response(null, {
          status: 302,
          headers: { Location: "https://1.pagedaddy.site/assets/favicon.ico?token=5mU-IoNNAX9w4_9jmleLdA" }, // <- CHANGE THIS
        });
      }

      const redirectionLocation = await database.get(path);
      if (!redirectionLocation) {
        return new Response("Not Found", { status: 404 });
      }

      return new Response(null, {
        status: 302,
        headers: { Location: redirectionLocation },
      });
    }

    // Method not allowed for anything else
    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    // Log error if you have a logger or just return generic error
    // console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
