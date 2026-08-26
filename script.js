const nav = document.getElementById("siteNav");
const linksWrap = document.getElementById("navLinks");
const burger = document.getElementById("navBurger");
const navLinks = document.querySelectorAll("#navLinks a");

function onScroll() {
  if (!nav) return;
  const show = window.scrollY > 120;
  nav.classList.toggle("is-visible", show);
  if (!show && linksWrap) linksWrap.classList.remove("is-open");
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (burger && linksWrap) {
  burger.addEventListener("click", () => {
    const open = linksWrap.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.forEach((a) =>
    a.addEventListener("click", () => {
      linksWrap.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );
}

const sections = [
  document.getElementById("home"),
  document.getElementById("about"),
  document.getElementById("services"),
  document.getElementById("why"),
  document.getElementById("contact"),
].filter(Boolean);

function syncActive() {
  const y = window.scrollY + 100;
  let current = "home";
  sections.forEach((s) => {
    if (s.offsetTop <= y) current = s.id;
  });
  navLinks.forEach((a) => {
    a.classList.toggle("is-active", a.getAttribute("data-nav") === current);
  });
}

window.addEventListener("scroll", syncActive, { passive: true });
syncActive();

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ===== Cookies ===== */
const COOKIE_KEY = "davinet_cookie_consent";

function readConsent() {
  try {
    return JSON.parse(localStorage.getItem(COOKIE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveConsent(data) {
  localStorage.setItem(
    COOKIE_KEY,
    JSON.stringify({
      essential: true,
      analytics: !!data.analytics,
      marketing: !!data.marketing,
      updatedAt: new Date().toISOString(),
    })
  );
}

function applyConsent(consent) {
  // Hook point for Analytics / Ads scripts when approved
  window.davinetConsent = consent;
  if (consent?.analytics) {
    document.documentElement.dataset.analytics = "1";
  } else {
    delete document.documentElement.dataset.analytics;
  }
  if (consent?.marketing) {
    document.documentElement.dataset.marketing = "1";
  } else {
    delete document.documentElement.dataset.marketing;
  }
}

const overlay = document.getElementById("cookieOverlay");
const prefsPanel = document.getElementById("cookiePrefs");
const prefAnalytics = document.getElementById("prefAnalytics");
const prefMarketing = document.getElementById("prefMarketing");

function openCookieBanner(forcePrefs) {
  if (!overlay) return;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  if (forcePrefs && prefsPanel) {
    prefsPanel.hidden = false;
    const existing = readConsent();
    if (prefAnalytics) prefAnalytics.checked = !!existing?.analytics;
    if (prefMarketing) prefMarketing.checked = !!existing?.marketing;
  }
}

function closeCookieBanner() {
  if (!overlay) return;
  overlay.hidden = true;
  document.body.style.overflow = "";
  if (prefsPanel) prefsPanel.hidden = true;
}

function acceptAll() {
  const consent = { analytics: true, marketing: true };
  saveConsent(consent);
  applyConsent(readConsent());
  closeCookieBanner();
}

function essentialOnly() {
  const consent = { analytics: false, marketing: false };
  saveConsent(consent);
  applyConsent(readConsent());
  closeCookieBanner();
}

function savePrefs() {
  saveConsent({
    analytics: !!prefAnalytics?.checked,
    marketing: !!prefMarketing?.checked,
  });
  applyConsent(readConsent());
  closeCookieBanner();
}

document.getElementById("cookieAcceptAll")?.addEventListener("click", acceptAll);
document.getElementById("cookieEssential")?.addEventListener("click", essentialOnly);
document.getElementById("cookieSavePrefs")?.addEventListener("click", savePrefs);
document.getElementById("cookiePrefsBtn")?.addEventListener("click", () => {
  if (prefsPanel) prefsPanel.hidden = !prefsPanel.hidden;
});
document.getElementById("cookieClose")?.addEventListener("click", () => {
  // Closing without choice = essential only (privacy-friendly)
  if (!readConsent()) essentialOnly();
  else closeCookieBanner();
});
document.getElementById("openCookiePrefs")?.addEventListener("click", () => {
  openCookieBanner(true);
});

overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) {
    if (!readConsent()) essentialOnly();
    else closeCookieBanner();
  }
});

const existingConsent = readConsent();
if (existingConsent) {
  applyConsent(existingConsent);
} else {
  openCookieBanner(false);
}
