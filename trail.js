(() => {
  const STORAGE_KEY = "davinet_trail_v1";
  const MAX_PARTICLES = 14;
  const MIN_DIST = 22;
  const SIZE = 26;
  const LIFE_MS = 520;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function loadEnabled() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw == null) return true;
      const data = JSON.parse(raw);
      return data.enabled !== false;
    } catch {
      return true;
    }
  }

  function saveEnabled(enabled) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: !!enabled }));
  }

  function canRun(enabled) {
    if (!enabled) return false;
    if (!finePointer.matches) return false;
    if (reduceMotion.matches) return false;
    if (document.documentElement.classList.contains("a11y-motion")) return false;
    return true;
  }

  const layer = document.createElement("div");
  layer.className = "logo-trail";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const pool = [];
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const el = document.createElement("span");
    el.className = "logo-trail-dot";
    el.style.backgroundImage = 'url("images/logo.svg")';
    layer.appendChild(el);
    pool.push({ el, alive: false, born: 0 });
  }

  let enabled = loadEnabled();
  let lastX = 0;
  let lastY = 0;
  let hasPos = false;
  let idx = 0;
  let raf = 0;
  let running = false;

  function syncToggle() {
    const btn = document.getElementById("trailToggle");
    if (!btn) return;
    const show = finePointer.matches;
    btn.hidden = !show;
    if (!show) return;
    btn.classList.toggle("is-on", enabled);
    btn.setAttribute("aria-pressed", enabled ? "true" : "false");
  }

  function spawn(x, y) {
    const p = pool[idx % pool.length];
    idx += 1;
    p.alive = true;
    p.born = performance.now();
    const el = p.el;
    el.style.left = `${x - SIZE / 2}px`;
    el.style.top = `${y - SIZE / 2}px`;
    el.style.opacity = "0.42";
    el.style.transform = "scale(1)";
    el.classList.add("is-live");
  }

  function tick(now) {
    let any = false;
    for (const p of pool) {
      if (!p.alive) continue;
      any = true;
      const t = (now - p.born) / LIFE_MS;
      if (t >= 1) {
        p.alive = false;
        p.el.classList.remove("is-live");
        p.el.style.opacity = "0";
        continue;
      }
      const ease = 1 - t;
      p.el.style.opacity = String(0.42 * ease);
      p.el.style.transform = `scale(${0.55 + 0.45 * ease})`;
    }
    if (any) raf = requestAnimationFrame(tick);
    else raf = 0;
  }

  function onMove(e) {
    if (!canRun(enabled)) return;
    const x = e.clientX;
    const y = e.clientY;
    if (!hasPos) {
      hasPos = true;
      lastX = x;
      lastY = y;
      return;
    }
    const dx = x - lastX;
    const dy = y - lastY;
    if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) return;
    lastX = x;
    lastY = y;
    spawn(x, y);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function setRunning(on) {
    if (on === running) return;
    running = on;
    layer.classList.toggle("is-active", on);
    if (on) {
      document.addEventListener("pointermove", onMove, { passive: true });
    } else {
      document.removeEventListener("pointermove", onMove);
      hasPos = false;
      for (const p of pool) {
        p.alive = false;
        p.el.classList.remove("is-live");
        p.el.style.opacity = "0";
      }
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function refresh() {
    syncToggle();
    setRunning(canRun(enabled));
  }

  document.getElementById("trailToggle")?.addEventListener("click", () => {
    enabled = !enabled;
    saveEnabled(enabled);
    refresh();
  });

  finePointer.addEventListener?.("change", refresh);
  reduceMotion.addEventListener?.("change", refresh);

  const mo = new MutationObserver(refresh);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  refresh();
})();
