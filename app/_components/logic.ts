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
  // The step player advances on its own every 5.2s; a click jumps there and restarts the count.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 5200);
    return () => clearInterval(t);
  }, [cycle]);
  // The floating WhatsApp pill waits until the hero (which has its own call to action) has scrolled away.
  useEffect(() => {
    const root = rootRef.current, hero = root?.querySelector(".hero");
    if (!root || !hero) return;
    const io = new IntersectionObserver(([e]) => root.toggleAttribute("data-past", !e.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
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
      v["go" + i] = () => { setStep(i); setCycle((c) => c + 1); };
      if (i < 3) v["sg" + i] = "seg" + (i < step ? " done" : i === step ? " on" : "");
    }
    return v;
  }, [menu, q, toggleMenu, closeMenu, step]);

  return { v, rootRef };
}
