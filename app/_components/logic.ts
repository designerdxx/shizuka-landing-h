"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
/** WhatsApp deep link for every "Message us" action; falls back to the contact section until a number is set. */
const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent("Hello Shizuka, I'd like a valuation for my ")}` : "#h-contact";
const igHref = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#h-contact";
const liHref = process.env.NEXT_PUBLIC_LINKEDIN_URL || "#h-contact";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useSite() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState(0);

  // One-time reveals. Content is visible without JavaScript; once this runs, anything below the fold waits
  // for its rise, while whatever is already on screen stays exactly as rendered (no flash).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    root.querySelectorAll("[data-r],[data-m]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.setAttribute("data-in", "");
      else io.observe(el);
    });
    root.setAttribute("data-armed", "");
    return () => io.disconnect();
  }, []);

  // The phone menu: page scroll locks behind it, Escape closes it.
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
  }, [menu]);

  const toggleMenu = useCallback(() => setMenu((m) => !m), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [pinned, setPinned] = useState(false);
  const howGo = useRef<((i: number) => boolean) | null>(null);
  // Without a pinned player (a very tall window) it advances on its own every 5.2s; a click jumps there and restarts the count.
  useEffect(() => {
    if (pinned || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 5200);
    return () => clearInterval(t);
  }, [cycle, pinned]);
  // The step player holds, filling the screen, for half a screen of scrolling per step and the steps follow the scroll,
  // so all four are seen before the page moves on; the lines between numerals fill with --p. A numeral scrolls to its step.
  useEffect(() => {
    const track = rootRef.current?.querySelector<HTMLElement>(".how-track");
    const how = track?.querySelector<HTMLElement>(".how");
    if (!track || !how) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = -1, run = 0, top0 = 0;
    const measure = () => {
      raf = 0;
      const wh = window.innerHeight, pin = wh <= 1400;
      track.toggleAttribute("data-pin", pin);
      setPinned(pin);
      run = pin ? Math.round(wh * 0.5 * 4) : 0;
      top0 = pin ? Math.min(0, wh - how.offsetHeight) : 0;
      track.style.setProperty("--run", run + "px");
      track.style.setProperty("--htop", top0 + "px");
      const p = run ? Math.min(1, Math.max(0, (top0 - track.getBoundingClientRect().top) / run)) : 0;
      track.style.setProperty("--p", p.toFixed(3));
      if (run) { const s = Math.min(3, Math.floor(p * 4)); if (s !== last) { last = s; setStep(s); } }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    howGo.current = (i: number) => {
      if (!run) return false;
      const y = window.scrollY + track.getBoundingClientRect().top - top0 + (run * (i + 0.5)) / 4;
      window.scrollTo({ top: Math.round(y), behavior: reduce ? "auto" : "smooth" });
      return true;
    };
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); howGo.current = null; };
  }, []);
  // Stacks: each .stack holds its first section while the next slides over it. --stick lets a section taller than the
  // window scroll to its end before it holds; --cover (0 to 1) is how much of it is covered.
  useEffect(() => {
    const root = rootRef.current;
    const stacks = root ? Array.from(root.querySelectorAll<HTMLElement>(".stack")) : [];
    if (!root || !stacks.length) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const wh = window.innerHeight;
      stacks.forEach((s) => {
        const base = s.firstElementChild as HTMLElement, over = s.lastElementChild as HTMLElement;
        const bh = base.offsetHeight, view = Math.min(bh, wh), top = over.getBoundingClientRect().top;
        s.style.setProperty("--stick", Math.min(0, wh - bh) + "px");
        s.style.setProperty("--cover", Math.min(1, Math.max(0, 1 - top / view)).toFixed(3));
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const v = useMemo(() => {
    const v: Record<string, any> = {
      waHref, igHref, liHref,
      rootCls: menu ? "hh open" : "hh",
      menuOpen: menu ? "true" : "false",
      menuHidden: menu ? "false" : "true",
      menuLabel: menu ? "Close" : "Menu",
      toggleMenu, closeMenu,
    };
    for (let k = 0; k < 7; k++) {
      v["q" + k] = k === q ? "on" : "";
      v["qe" + k] = k === q ? "true" : "false";
      v["qt" + k] = () => setQ((cur) => (cur === k ? -1 : k));
    }
    const alts = ["A yellow Goyard clutch held against a black sweater", "A Shizuka chauffeur in a dark suit standing beside a black car", "A steel chronograph with a white dial on a wrist, resting on dark marble", "Seen from above: a woman in black on a cream bouclé sofa, a yellow Goyard clutch in her hands"];
    v.stageAlt = alts[step];
    for (let i = 0; i < 4; i++) {
      v["st" + i] = i === step ? "on" : "";
      v["sh" + i] = i === step ? "false" : "true";
      v["rb" + i] = i === step ? "on" : "";
      v["rp" + i] = i === step ? "true" : "false";
      v["go" + i] = () => { if (howGo.current?.(i)) return; setStep(i); setCycle((c) => c + 1); };
      if (i < 3) v["sg" + i] = "seg" + (i < step ? " done" : i === step ? " on" : "");
    }
    return v;
  }, [menu, q, toggleMenu, closeMenu, step]);

  return { v, rootRef };
}
