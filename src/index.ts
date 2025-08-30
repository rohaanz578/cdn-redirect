// src/index.ts
import { handle } from "./handler";

export interface Env {
  redirectiontool: KVNamespace;
  CREATE_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env.redirectiontool, env);
  },
};
