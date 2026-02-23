// Serves a signed web app manifest.
// The DataConnect Desktop App reads this to verify your app's identity.

import { ConnectError } from "@opendatalabs/connect/core";
import { signVanaManifest } from "@opendatalabs/connect/server";
import { NextResponse } from "next/server";
import { getConfig } from "@/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cfg = getConfig();
    const vanaBlock = await signVanaManifest({
      privateKey: cfg.privateKey,
      appUrl: cfg.appUrl,
      privacyPolicyUrl: `${cfg.appUrl}/privacy`,
      termsUrl: `${cfg.appUrl}/terms`,
      supportUrl: `${cfg.appUrl}/support`,
      webhookUrl: `${cfg.appUrl}/api/webhook`,
    });

    const manifest = {
      name: "Tee Designer — Vana Connect",
      short_name: "Tee Designer",
      start_url: "/",
      display: "standalone",
      background_color: "#09090b",
      theme_color: "#09090b",
      icons: [
        {
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
        },
      ],
      vana: vanaBlock,
    };

    return NextResponse.json(manifest, {
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    const message =
      err instanceof ConnectError ? err.message : "Failed to sign manifest";
    const status = err instanceof ConnectError ? (err.statusCode ?? 500) : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
