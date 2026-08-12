import "./lib/error-capture";
import { timingSafeEqual } from "node:crypto";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const protectedPaths = new Set(["/admin", "/credenciamento"]);

type RuntimeEnv = {
  RESTRICTED_AREA_USERNAME?: string;
  RESTRICTED_AREA_PASSWORD?: string;
};

function getRestrictedAreaCredentials(env: unknown): RuntimeEnv {
  const runtimeEnv = env as RuntimeEnv | undefined;

  // Cloudflare fornece os secrets no argumento `env` do handler. O fallback
  // mantém o uso do .env no servidor de desenvolvimento local.
  return {
    RESTRICTED_AREA_USERNAME:
      runtimeEnv?.RESTRICTED_AREA_USERNAME ?? process.env.RESTRICTED_AREA_USERNAME,
    RESTRICTED_AREA_PASSWORD:
      runtimeEnv?.RESTRICTED_AREA_PASSWORD ?? process.env.RESTRICTED_AREA_PASSWORD,
  };
}

function hasRestrictedAreaAccess(request: Request, env: unknown): boolean {
  const { RESTRICTED_AREA_USERNAME: username, RESTRICTED_AREA_PASSWORD: password } =
    getRestrictedAreaCredentials(env);
  const authorization = request.headers.get("authorization");

  if (!username || !password || !authorization?.startsWith("Basic ")) return false;

  try {
    const received = Buffer.from(authorization.slice(6), "base64");
    const expected = Buffer.from(`${username}:${password}`);
    return received.length === expected.length && timingSafeEqual(received, expected);
  } catch {
    return false;
  }
}

function restrictedAreaResponse(request: Request, env: unknown): Response {
  const { RESTRICTED_AREA_USERNAME: username, RESTRICTED_AREA_PASSWORD: password } =
    getRestrictedAreaCredentials(env);
  const configured = username && password;

  if (!configured) {
    console.error("Restricted-area credentials have not been configured.");
    return new Response("A área restrita ainda não foi configurada.", { status: 503 });
  }

  const headers: Record<string, string> = { "cache-control": "no-store" };
  // A verificação feita pelo formulário não deve abrir o diálogo nativo do navegador.
  if (request.headers.get("x-restricted-area-check") !== "1") {
    headers["www-authenticate"] = 'Basic realm="Área restrita da Feira", charset="UTF-8"';
  }
  return new Response("Autenticação necessária.", { status: 401, headers });
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const { pathname } = new URL(request.url);
      if (protectedPaths.has(pathname) && !hasRestrictedAreaAccess(request, env)) {
        return restrictedAreaResponse(request, env);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
