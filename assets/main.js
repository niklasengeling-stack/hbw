// HBW – shared site behaviour (vanilla JS, no dependencies)

document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Tabs component (Werte / Feature tabs)
  document.querySelectorAll("[data-tabs]").forEach((tabsEl) => {
    const buttons = tabsEl.querySelectorAll("[data-tab-btn]");
    const panels = tabsEl.querySelectorAll("[data-tab-panel]");
    const images = tabsEl.querySelectorAll("[data-tab-image]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-tab-btn");
        buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
        panels.forEach((p) =>
          p.classList.toggle("is-active", p.getAttribute("data-tab-panel") === key)
        );
        images.forEach((i) =>
          i.classList.toggle("is-active", i.getAttribute("data-tab-image") === key)
        );
      });
    });
  });
});
