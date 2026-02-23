"use client";

import type { ConnectionStatus } from "@opendatalabs/connect/core";
import { useVanaData } from "@opendatalabs/connect/react";
import { useEffect, useRef, useState } from "react";

const STATUS_DISPLAY: Record<
  ConnectionStatus,
  { dot: string; label: string; className: string }
> = {
  idle: { dot: "\u25CB", label: "Idle", className: "status-default" },
  connecting: { dot: "\u25CB", label: "Connecting", className: "status-default" },
  waiting: { dot: "\u25CB", label: "Waiting for approval", className: "status-waiting" },
  approved: { dot: "\u25CF", label: "Approved", className: "status-approved" },
  denied: { dot: "\u25CF", label: "Denied", className: "status-denied" },
  expired: { dot: "\u25CF", label: "Expired", className: "status-expired" },
  error: { dot: "\u25CF", label: "Error", className: "status-error" },
};

interface GenerationResult {
  image: string;
  prompt: string;
}

export default function ConnectFlow() {
  const {
    status,
    data,
    error,
    connectUrl,
    initConnect,
    fetchData,
    isLoading,
  } = useVanaData({ environment: "dev" });

  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      void initConnect();
    }
  }, [initConnect]);

  // Auto-fetch data once approved
  const fetchRef = useRef(false);
  useEffect(() => {
    if (status === "approved" && !fetchRef.current && !data) {
      fetchRef.current = true;
      void fetchData();
    }
  }, [status, data, fetchData]);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const generate = async () => {
    if (!data) return;
    setGenerating(true);
    setGenError(null);
    setResult(null);

    try {
      const raw = data as Record<string, unknown>;

      // Extract Instagram and Spotify data from the Vana response
      const instagram = {
        profile: raw["instagram.profile"] ?? null,
        posts: raw["instagram.posts"] ?? null,
      };
      const spotify = {
        profile: raw["spotify.profile"] ?? null,
        topArtists: raw["spotify.top_artists"] ?? null,
        topTracks: raw["spotify.top_tracks"] ?? null,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagram, spotify }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generation failed");

      setResult(json);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const display = STATUS_DISPLAY[status];
  const sessionReady = !!connectUrl;
  const hasConnectFailure = !sessionReady && !!error;
  const hasData = data != null;

  // ---------------------------------------------------------------------------
  // Step 1: Connect flow
  // ---------------------------------------------------------------------------
  if (!hasData) {
    return (
      <div>
        {status !== "approved" && (
          <div className="card">
            <div style={{ marginBottom: 20 }}>
              <div className="field-row">
                <span className="label">Status</span>
                <span className={`mono ${display.className}`}>
                  {display.dot} {display.label}
                </span>
              </div>
            </div>

            {sessionReady ? (
              <a
                href={connectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  display: "inline-block",
                  boxSizing: "border-box",
                  fontSize: 13,
                  textDecoration: "none",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Connect Instagram &amp; Spotify
              </a>
            ) : (
              <button
                type="button"
                onClick={() => void initConnect()}
                disabled={isLoading}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" /> Creating session...
                  </>
                ) : hasConnectFailure ? (
                  "Retry session"
                ) : (
                  "Create session"
                )}
              </button>
            )}
          </div>
        )}

        {status === "approved" && (
          <div className="card">
            <div className="generating">
              <span className="spinner" style={{ width: 20, height: 20 }} />
              <p style={{ marginTop: 12 }}>Fetching your data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="card card-error">
            <p className="text-error" style={{ margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {status !== "idle" && status !== "connecting" && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-ghost"
            style={{ marginTop: 12 }}
          >
            Reset
          </button>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 2: Data loaded — generate t-shirt
  // ---------------------------------------------------------------------------
  return (
    <div>
      <div className="card card-approved">
        <div style={{ marginBottom: 16 }}>
          <div className="field-row">
            <span className="label">Status</span>
            <span className="mono status-approved">{"\u25CF"} Data loaded</span>
          </div>
        </div>

        {generating && (
          <div className="generating">
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎨</div>
            <p>Analyzing your vibe and generating a design...</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              This may take 15-30 seconds
            </p>
          </div>
        )}

        {!generating && !result && (
          <button
            type="button"
            onClick={generate}
            className="btn-primary"
            style={{ width: "100%", fontSize: 15, padding: "14px 20px" }}
          >
            Generate My Tee
          </button>
        )}

        {result && (
          <div>
            <img
              src={result.image}
              alt="Generated t-shirt design"
              className="generated-image"
            />
            <div className="prompt-text">
              <span className="label" style={{ display: "block", marginBottom: 8 }}>
                Design prompt
              </span>
              {result.prompt}
            </div>
            <button
              type="button"
              onClick={generate}
              className="btn-primary"
              style={{ width: "100%", marginTop: 16 }}
            >
              Regenerate
            </button>
          </div>
        )}

        {genError && (
          <div style={{ marginTop: 12 }}>
            <p className="text-error">{genError}</p>
            <button
              type="button"
              onClick={generate}
              className="btn-ghost"
              style={{ marginTop: 8 }}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="btn-ghost"
        style={{ marginTop: 12 }}
      >
        Start over
      </button>
    </div>
  );
}
