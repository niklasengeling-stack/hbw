// HBW – shared site behaviour (vanilla JS, no dependencies)

document.addEventListener("DOMContentLoaded", () => {
  // Page transitions (Brand-Wipe in Petrol + animierte Bildmarke)
  const transitionOverlay = document.querySelector("[data-page-transition]");
  const transitionLogo = document.querySelector("[data-page-transition-logo]");
  if (transitionOverlay) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SAFETY_FALLBACK = 2500; // falls 'complete' nie feuert
    const COVER_DURATION = 340; // nur Wipe schließen, kein Logo (spielt nur einmal, bei Ankunft)

    let logoAnim = null;
    if (window.lottie && transitionLogo) {
      logoAnim = window.lottie.loadAnimation({
        container: transitionLogo,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "/assets/lottie/page-transition-loader-v2.json",
      });
      logoAnim.setSpeed(2.5);
    }

    // Logo einmal komplett durchlaufen lassen, dann callback
    const playLogoOnce = (onDone) => {
      if (!logoAnim) {
        onDone();
        return;
      }
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(fallback);
        onDone();
      };
      const fallback = setTimeout(finish, SAFETY_FALLBACK);
      logoAnim.addEventListener("complete", finish, { once: true });
      logoAnim.goToAndPlay(0, true);
    };

    const isInternalLink = (link) => {
      if (!link || !link.href) return false;
      if (link.target && link.target !== "_self") return false;
      if (link.hasAttribute("download")) return false;
      if (link.origin !== window.location.origin) return false;
      if (link.protocol === "mailto:" || link.protocol === "tel:") return false;
      if (link.hash && link.pathname === window.location.pathname) return false;
      return true;
    };

    const reveal = () => {
      requestAnimationFrame(() => {
        transitionOverlay.classList.add("is-animating");
        if (transitionLogo) transitionLogo.classList.add("is-animating");
        requestAnimationFrame(() => {
          transitionOverlay.classList.remove("is-covering");
          if (transitionLogo) transitionLogo.classList.remove("is-visible");
        });
      });
    };

    // Ankunft: neue Seite ist bereits geladen, Overlay + Logo waren instant sichtbar gesetzt (kein Flash).
    // Logo läuft einmal komplett durch, erst danach öffnet sich der Balken.
    if (sessionStorage.getItem("hbw-transition") === "1") {
      sessionStorage.removeItem("hbw-transition");
      if (reduceMotion) {
        transitionOverlay.classList.remove("is-covering");
        if (transitionLogo) transitionLogo.classList.remove("is-visible");
      } else {
        playLogoOnce(reveal);
      }
    }

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest("a[href]");
      if (!isInternalLink(link)) return;
      e.preventDefault();
      sessionStorage.setItem("hbw-transition", "1");

      if (reduceMotion) {
        window.location.href = link.href;
        return;
      }

      // Nur der Balken schließt sich – das Logo läuft nur einmal, bei der Ankunft auf der neuen Seite
      transitionOverlay.classList.add("is-animating", "is-covering");

      setTimeout(() => {
        window.location.href = link.href;
      }, COVER_DURATION);
    });
  }

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

  // Tabs component (Werte / Feature slider) – Pfeile + Fortschrittsbalken, Text + Bild als ein Element
  document.querySelectorAll("[data-tabs]").forEach((tabsEl) => {
    const buttons = Array.from(tabsEl.querySelectorAll("[data-tab-btn]"));
    const pairs = Array.from(tabsEl.querySelectorAll("[data-tab-pair]"));
    const titleEl = tabsEl.querySelector("[data-tab-title]");
    const prevBtn = tabsEl.querySelector("[data-tab-prev]");
    const nextBtn = tabsEl.querySelector("[data-tab-next]");

    const activate = (key) => {
      buttons.forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-tab-btn") === key));
      pairs.forEach((p) => {
        const isActive = p.getAttribute("data-tab-pair") === key;
        p.classList.toggle("is-active", isActive);
        if (isActive && titleEl) titleEl.textContent = p.getAttribute("data-tab-title-text") || "";
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => activate(btn.getAttribute("data-tab-btn")));
    });

    const step = (dir) => {
      const currentIndex = buttons.findIndex((b) => b.classList.contains("is-active"));
      const nextIndex = (currentIndex + dir + buttons.length) % buttons.length;
      activate(buttons[nextIndex].getAttribute("data-tab-btn"));
    };

    if (prevBtn) prevBtn.addEventListener("click", () => step(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => step(1));
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
