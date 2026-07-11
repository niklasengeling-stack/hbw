// HBW – shared site behaviour (vanilla JS, no dependencies)

document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    const icon = toggle.querySelector("i");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (icon) icon.className = open ? "ri-close-line" : "ri-menu-line";
    });
  }

  // Tabs component (Werte / Feature tabs) – Text + Bild als ein Element
  document.querySelectorAll("[data-tabs]").forEach((tabsEl) => {
    const buttons = tabsEl.querySelectorAll("[data-tab-btn]");
    const pairs = tabsEl.querySelectorAll("[data-tab-pair]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-tab-btn");
        buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
        pairs.forEach((p) =>
          p.classList.toggle("is-active", p.getAttribute("data-tab-pair") === key)
        );
      });
    });
  });

  // Count-up animation (Fakten stat cards)
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    const animate = (el) => {
      const target = parseInt(el.getAttribute("data-count-to"), 10);
      const suffix = el.getAttribute("data-count-suffix") || "";
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => observer.observe(el));
  }

  // Rechtsgebiete-Liste (Anwaltsseiten): nach 6 Einträgen einklappen
  document.querySelectorAll(".profile-areas").forEach((list) => {
    const limit = 6;
    const items = Array.from(list.children).filter((el) => el.tagName === "LI");
    if (items.length <= limit) return;

    const hiddenItems = items.slice(limit);
    const collapse = document.createElement("div");
    collapse.className = "profile-areas__collapse";
    const inner = document.createElement("div");
    inner.className = "profile-areas__collapse-inner";
    hiddenItems.forEach((li) => inner.appendChild(li));
    collapse.appendChild(inner);
    list.appendChild(collapse);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "profile-areas__toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<span>Mehr anzeigen</span><i class="ri-arrow-down-s-line" aria-hidden="true"></i>';
    list.appendChild(toggle);

    toggle.addEventListener("click", () => {
      const isOpen = !collapse.classList.contains("is-open");
      collapse.classList.toggle("is-open", isOpen);
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.querySelector("span").textContent = isOpen ? "Weniger anzeigen" : "Mehr anzeigen";
    });
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Custom round cursor (brand colors)
  const cursor = document.querySelector(".cursor-dot");
  if (cursor && hasFinePointer && !reduceMotion) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    const raf = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

});
