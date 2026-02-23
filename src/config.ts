import { createVanaConfig } from "@opendatalabs/connect/server";

const SCOPES = [
  "instagram.profile",
  "instagram.posts",
  "spotify.profile",
  "spotify.top_artists",
  "spotify.top_tracks",
];

let _config: ReturnType<typeof createVanaConfig> | null = null;

export function getConfig() {
  if (!_config) {
    _config = createVanaConfig({
      privateKey: (process.env.VANA_PRIVATE_KEY ??
        process.env.VANA_APP_PRIVATE_KEY) as `0x${string}`,
      scopes: SCOPES,
      appUrl: process.env.APP_URL ?? "",
      environment:
        (process.env.VANA_ENVIRONMENT as "dev" | "prod" | undefined) ?? "dev",
    });
  }
  return _config;
}
