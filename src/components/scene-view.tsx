import { useCallback, useEffect, useRef, useState } from "react";
import { SceneEngine } from "@/lib/scene/engine";
import { INITIAL_HUD, type HudSnapshot } from "@/lib/scene/types";
import { formatVisit, recordVisit } from "@/lib/visits";

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const;

let visitOnce: Promise<number> | null = null;

function takeVisit(): Promise<number> {
  visitOnce ??= recordVisit();
  return visitOnce;
}

function exportLabel(hud: HudSnapshot): string {
  if (hud.exporting === "png") return "WRITING PNG24 4K";
  if (hud.exporting === "h264") {
    const total = hud.exportFrames || 450;
    const secs = (hud.exportFrame / 30).toFixed(1);
    const end = (total / 30).toFixed(1);
    return `H264 4K  ${secs} / ${end}`;
  }
  return hud.exportNote;
}

export function SceneView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [paneOpen, setPaneOpen] = useState(false);
  const [boot, setBoot] = useState(true);
  const [visit, setVisit] = useState<number | null>(null);

  useEffect(() => {
    setPaneOpen(window.innerWidth > 720);
  }, []);

  useEffect(() => {
    let alive = true;
    void takeVisit()
      .then((n) => {
        if (alive) setVisit(n);
      })
      .catch(() => {
        if (alive) setVisit(1);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const pane = paneRef.current;
    const canvas = glRef.current;
    if (!host || !pane || !canvas) return;
    const instance = new SceneEngine(
      host,
      pane,
      (snap) => {
        setHud(snap);
        setBoot(false);
      },
      canvas,
    );
    engineRef.current = instance;
    return () => {
      instance.dispose();
      engineRef.current = null;
    };
  }, []);

  const onDigit = useCallback((n: number) => {
    engineRef.current?.typeDigit(n);
  }, []);

  const busy = Boolean(hud.exporting);
  const statusLine = exportLabel(hud);
  const h264Progress =
    hud.exporting === "h264" && hud.exportFrames > 0 ? hud.exportFrame / hud.exportFrames : busy ? 0.08 : 0;

  return (
    <main className={busy ? "stage is-exporting" : "stage"}>
      <div ref={hostRef} className="scene-host" aria-label="PHOSPHENE FIELD">
        <canvas ref={glRef} className="gl-layer" aria-hidden="true" />
      </div>
      <div className="film-grain" style={{ opacity: hud.grain }} aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      {hud.flashDigit !== null && (
        <div key={hud.flashNonce} className="digit-flash" aria-hidden="true">
          {hud.flashDigit}
        </div>
      )}

      <div className="hud">
        <header className="hud-top">
          <div className="brand">
            <p className="eyebrow">
              <a
                className="credit-link"
                href="https://www.leonofsky.tv"
                target="_blank"
                rel="noopener noreferrer"
              >
                PHOSPHENE BY LEON OFSKY
              </a>
              <span className="credit-sep" aria-hidden="true">
                {" / "}
              </span>
              <a
                className="credit-link"
                href="https://github.com/leonofsky/phosphene"
                target="_blank"
                rel="noopener noreferrer"
              >
                GITHUB
              </a>
            </p>
            <h1>
              PHOSPHENE{" "}
              {visit !== null ? <span className="visit-serial">{formatVisit(visit)}</span> : null}
            </h1>
            <p className="descriptor">
              CHARGED GLASS, INDEXED BY NUMBER. TYPE A DIGIT TO SEED AND DISPERSE THE LATTICE.
            </p>
          </div>
          <div className="status">
            <p className="eyebrow">LIVE SPECIMEN</p>
            <strong>SEED / {hud.seed}</strong>
            <span className="seq">{hud.sequence || "—"}</span>
            {statusLine ? <span className="export-note">{statusLine}</span> : null}
          </div>
        </header>

        <footer className="hud-bottom">
          <div className="meta">
            <p>
              REFRACTION INDEX <span className="val">{hud.ior}</span>
              <br />
              ANGULAR DRIFT <span className="val">{hud.angle}</span>
            </p>
            <p className="position">POSITION {hud.position}</p>
            <p className="position">
              PARTICLES <span className="val">{hud.particles}</span>
              {"  "}ASCII <span className="val">{hud.ascii ? "ON" : "OFF"}</span>
            </p>
          </div>
          <div className="actions">
            <button
              type="button"
              className="ghost"
              disabled={busy}
              onClick={() => engineRef.current?.toggleAscii()}
            >
              {hud.ascii ? "WEBGL VIEW" : "ASCII VIEW"}
            </button>
            <button type="button" className="ghost" disabled={busy} onClick={() => setPaneOpen((v) => !v)}>
              {paneOpen ? "HIDE CONTROLS" : "SPECIMEN CONTROLS"}
            </button>
            <button
              type="button"
              className="export-btn"
              disabled={busy}
              onClick={() => void engineRef.current?.exportPng24()}
            >
              {hud.exporting === "png" ? "WRITING PNG24…" : "EXPORT PNG24"}
            </button>
            <button
              type="button"
              className="export-btn"
              disabled={busy}
              onClick={() => void engineRef.current?.exportH264()}
            >
              {hud.exporting === "h264"
                ? `H264 ${((hud.exportFrame || 0) / 30).toFixed(1)} / 15.0`
                : "EXPORT H264 15SECS MP4"}
            </button>
            <button
              type="button"
              className="solid span-all"
              disabled={busy}
              onClick={() => engineRef.current?.generate()}
            >
              GENERATE NEW PIECE
            </button>
            <p className="hint span-all">TYPE 0–9 TO SEED · A ASCII · DRAG TO ORBIT · PNG24 / H264 TO DESKTOP</p>
          </div>
        </footer>
      </div>

      <div className="keypad" role="group" aria-label="INDEX DIGITS">
        {KEYS.map((n) => (
          <button
            key={n}
            type="button"
            className={hud.digit === n ? "key active" : "key"}
            disabled={busy}
            onClick={() => onDigit(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div
        ref={paneRef}
        className={paneOpen ? "tp-root is-open" : "tp-root"}
        data-open={paneOpen ? "true" : "false"}
      />

      {busy && (
        <div className="export-veil" role="status" aria-live="polite">
          <p className="eyebrow">{hud.exporting === "h264" ? "ENCODING H264 4K" : "WRITING PNG24 4K"}</p>
          <p>{statusLine || "EXPORTING"}</p>
          <div className="export-track" aria-hidden="true">
            <span className="export-fill" style={{ transform: `scaleX(${Math.min(1, h264Progress || 0.12)})` }} />
          </div>
        </div>
      )}

      {boot && (
        <div className="boot">
          <p className="eyebrow">INITIALIZING FIELD</p>
          <p>PHOSPHENE / 09</p>
        </div>
      )}
    </main>
  );
}
