export interface ServerConfig {
  port: number;
  allowedOrigins: readonly string[];
  googleCloudProject: string;
  googleCloudLocation: string;
  vertexModel: string;
  aiTimeoutMs: number;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Environment variable ${name} wajib diisi.`);
  return value;
}

function positiveInteger(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} harus berupa bilangan positif.`);
  }
  return value;
}

export function readServerConfig(): ServerConfig {
  const allowedOrigins = required("ALLOWED_ORIGINS")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (allowedOrigins.some((origin) => origin === "*")) {
    throw new Error("ALLOWED_ORIGINS tidak boleh memakai wildcard.");
  }

  return {
    port: positiveInteger("PORT", 8080),
    allowedOrigins,
    googleCloudProject: required("GOOGLE_CLOUD_PROJECT"),
    googleCloudLocation: process.env.GOOGLE_CLOUD_LOCATION?.trim() || "global",
    vertexModel: process.env.VERTEX_MODEL?.trim() || "gemini-3.5-flash",
    aiTimeoutMs: positiveInteger("AI_TIMEOUT_MS", 10_000),
  };
}
