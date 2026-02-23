import ConnectFlow from "@/components/ConnectFlow";

export default function Home() {
  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👕</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Tee Designer
        </h1>
        <p style={{ fontSize: 14, color: "#71717a" }}>
          Connect your Instagram &amp; Spotify to generate a t-shirt design
          that matches your vibe
        </p>
      </div>
      <ConnectFlow />
    </main>
  );
}
