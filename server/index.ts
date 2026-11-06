import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readServerConfig } from "./config.ts";
import {
  MAX_API_BODY_BYTES,
  handleApiRequest,
  type ApiRequest,
  type ApiResponse,
} from "./handler.ts";
import { VertexAiExplainer } from "./vertex.ts";

const config = readServerConfig();
const ai = new VertexAiExplainer({
  project: config.googleCloudProject,
  location: config.googleCloudLocation,
  apiKey: config.geminiApiKey,
  model: config.vertexModel,
  timeoutMs: config.aiTimeoutMs,
});

function writeResponse(response: ServerResponse, result: ApiResponse): void {
  response.writeHead(result.status, result.headers);
  response.end(result.body);
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_API_BODY_BYTES) throw new Error("payload-too-large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (request, response) => {
  const startedAt = performance.now();
  const url = new URL(request.url ?? "/", "http://localhost");
  let status = 500;

  try {
    const body = await readBody(request);
    const apiRequest: ApiRequest = {
      method: request.method ?? "GET",
      path: url.pathname,
      headers: {
        origin: Array.isArray(request.headers.origin)
          ? request.headers.origin[0]
          : request.headers.origin,
        "content-type": request.headers["content-type"],
      },
      body,
    };
    const result = await handleApiRequest(apiRequest, {
      allowedOrigins: config.allowedOrigins,
      ai,
    });
    status = result.status;
    writeResponse(response, result);
  } catch (error) {
    const payloadTooLarge =
      error instanceof Error && error.message === "payload-too-large";
    status = payloadTooLarge ? 413 : 500;
    writeResponse(response, {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
      body: JSON.stringify({
        error: {
          code: payloadTooLarge ? "payload-too-large" : "ai-unavailable",
          message: payloadTooLarge
            ? "Teks terlalu panjang untuk diperiksa."
            : "Layanan penjelasan AI belum tersedia.",
        },
      }),
    });
  } finally {
    console.info(
      JSON.stringify({
        event: "http_request",
        method: request.method ?? "GET",
        path: url.pathname,
        status,
        durationMs: Math.round(performance.now() - startedAt),
      }),
    );
  }
});

server.listen(config.port, "0.0.0.0", () => {
  console.info(
    JSON.stringify({
      event: "server_started",
      port: config.port,
      model: config.vertexModel,
      location: config.googleCloudLocation,
    }),
  );
});
