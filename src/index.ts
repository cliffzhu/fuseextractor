import Fuse from "fuse.js";

export interface Env {
  // Optionally bind KV or D1 here later if you want dynamic synonym maps
  // SYNONYMS_KV: KVNamespace;
}

interface NormalizeRequest {
  text?: string;
}

interface NormalizeResponse {
  input: string;
  keywords: string[];
}

interface ErrorResponse {
  error: string;
}

// Domain-specific synonym map
const synonymMap: Record<string, string> = {
  signin: "login",
  signon: "login",
  "sign-in": "login",
  "sign-on": "login",
  authenticate: "auth",
  authentication: "auth",
  signup: "register",
};

const fuse = new Fuse(Object.keys(synonymMap), {
  includeScore: true,
  threshold: 0.4, // lower = stricter, higher = fuzzier
});

function normalizeToken(token: string): string {
  const cleaned = token.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!cleaned) {
    return "";
  }

  // Direct synonym match
  if (synonymMap[cleaned]) {
    return synonymMap[cleaned];
  }

  // Fuzzy match against synonym keys
  const results = fuse.search(cleaned);
  if (results.length > 0) {
    const result = results[0];
    if (result.score !== undefined && result.score <= 0.4) {
      return synonymMap[result.item];
    }
  }

  return cleaned;
}

function extractKeywords(text: string): string[] {
  const tokens = text.split(/\s+/);
  const normalized = tokens
    .map(normalizeToken)
    .filter((token): token is string => Boolean(token))
    .filter((token, index, array) => array.indexOf(token) === index); // deduplicate

  return normalized;
}

function createJsonResponse<T>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // tighten in production
      ...headers,
    },
  });
}

function createCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: createCorsHeaders(),
      });
    }

    // GET endpoint for health check and documentation
    if (request.method === "GET" && url.pathname === "/") {
      return createJsonResponse({
        service: "fuse-extractor",
        version: "1.0.0",
        endpoints: {
          POST: "/normalize - Extract and normalize keywords from text",
          GET: "/ - Service information",
        },
      });
    }

    // POST endpoint for keyword normalization
    if (request.method === "POST" && url.pathname === "/normalize") {
      try {
        const body = (await request.json()) as NormalizeRequest;
        const text = body.text ?? "";

        if (typeof text !== "string") {
          return createJsonResponse<ErrorResponse>(
            { error: "Text field must be a string" },
            400
          );
        }

        const keywords = extractKeywords(text);

        return createJsonResponse<NormalizeResponse>({
          input: text,
          keywords,
        });
      } catch (error) {
        const errorMessage =
          error instanceof SyntaxError
            ? "Invalid JSON body"
            : "Internal server error";
        return createJsonResponse<ErrorResponse>(
          { error: errorMessage },
          error instanceof SyntaxError ? 400 : 500
        );
      }
    }

    return createJsonResponse<ErrorResponse>(
      { error: "Not found. Use GET / for service info" },
      404
    );
  },
};
