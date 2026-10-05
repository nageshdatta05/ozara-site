"use client";

/** Last resort: the root layout itself failed. Plain, self-contained, no details. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f2ec", color: "#1d1a17", fontFamily: "Georgia, serif", textAlign: "center", padding: 24 }}>
        <div>
          <p style={{ letterSpacing: "0.3em", fontSize: 14 }}>OZARA</p>
          <h1 style={{ fontWeight: 400, fontSize: 32 }}>Something went wrong.</h1>
          <p style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: 15, opacity: 0.7 }}>Please try again in a moment.</p>
          <button onClick={reset} style={{ marginTop: 24, padding: "14px 28px", background: "#00072b", color: "#f6f2ec", border: 0, letterSpacing: "0.2em", fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
