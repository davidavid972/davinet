(() => {
  const STORAGE_KEY = "davinet_a11y_v1";
  const root = document.documentElement;

  const MODES = [
    "a11y-text-lg",
    "a11y-text-xl",
    "a11y-contrast",
    "a11y-invert",
    "a11y-gray",
    "a11y-links",
    "a11y-readable",
    "a11y-cursor",
    "a11y-motion",
    "a11y-focus",
    "a11y-spacing",
  ];

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function apply(state) {
    MODES.forEach((cls) => root.classList.toggle(cls, !!state[cls]));
    document.querySelectorAll(".a11y-btn[data-a11y]").forEach((btn) => {
      const key = btn.getAttribute("data-a11y");
      btn.classList.toggle("is-on", !!state[key]);
      btn.setAttribute("aria-pressed", state[key] ? "true" : "false");
    });
  }

  function toggle(key) {
    const state = load();
    if (key === "a11y-text-lg") {
      if (state["a11y-text-xl"]) {
        state["a11y-text-xl"] = false;
        state["a11y-text-lg"] = true;
      } else if (state["a11y-text-lg"]) {
        state["a11y-text-lg"] = false;
        state["a11y-text-xl"] = true;
      } else {
        state["a11y-text-lg"] = true;
      }
    } else if (key === "a11y-text-sm") {
      state["a11y-text-lg"] = false;
      state["a11y-text-xl"] = false;
    } else {
      state[key] = !state[key];
      // contrast modes exclusive-ish
      if (key === "a11y-contrast" && state[key]) state["a11y-invert"] = false;
      if (key === "a11y-invert" && state[key]) state["a11y-contrast"] = false;
      if (key === "a11y-gray" && state[key]) {
        /* can combine lightly; leave as is */
      }
    }
    save(state);
    apply(state);
  }

  function reset() {
    save({});
    apply({});
  }

  const fab = document.getElementById("a11yFab");
  const panel = document.getElementById("a11yPanel");
  const closeBtn = document.getElementById("a11yClose");

  function openPanel(open) {
    if (!panel || !fab) return;
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      panel.querySelector(".a11y-btn, .a11y-panel-close")?.focus();
    }
  }

  fab?.addEventListener("click", () => openPanel(panel.hidden));
  closeBtn?.addEventListener("click", () => {
    openPanel(false);
    fab?.focus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel && !panel.hidden) {
      openPanel(false);
      fab?.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!panel || panel.hidden) return;
    if (panel.contains(e.target) || fab?.contains(e.target)) return;
    openPanel(false);
  });

  document.querySelectorAll(".a11y-btn[data-a11y]").forEach((btn) => {
    btn.addEventListener("click", () => toggle(btn.getAttribute("data-a11y")));
  });

  document.getElementById("a11yReset")?.addEventListener("click", reset);

  apply(load());
})();
