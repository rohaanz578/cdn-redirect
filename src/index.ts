// src/index.ts
import { handle } from "./handler";

export interface Env {
  "redirects-kv": KVNamespace;   // Use your KV binding name here
  CREATE_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env["redirects-kv"], env);
  },
};
