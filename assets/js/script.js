(function () {
  // Clear history state on load so nothing is restored from a previous entry,
  // and stop the browser from auto-restoring scroll position.
  try { history.replaceState(null, document.title, location.href); } catch (e) {}
  if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; }
})();

(function () {
  var picks = {
    functional: {
      name: "ERPNext Functional Learning",
      text: "Configure and manage ERPNext modules across sales, purchasing, accounting, stock, manufacturing, projects and HR, using real business scenarios."
    },
    development: {
      name: "ERPNext Development Programme",
      text: "Customise ERPNext, build custom apps and modules on the Frappe Framework, integrate with external systems and deploy real business solutions."
    }
  };
  var nameEl = document.getElementById("pick-name");
  var textEl = document.getElementById("pick-text");
  var radios = document.querySelectorAll('input[name="goal"]');
  function render() {
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        var p = picks[radios[i].value];
        nameEl.textContent = p.name;
        textEl.textContent = p.text;
        return;
      }
    }
  }
  for (var i = 0; i < radios.length; i++) radios[i].addEventListener("change", render);
  render();

  var buttons = document.querySelectorAll(".copy");
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      var node = document.getElementById(btn.getAttribute("data-target"));
      var text = node.textContent.trim();
      function reset() { setTimeout(function () { btn.textContent = "Copy"; }, 1600); }
      function fallback() {
        try {
          var r = document.createRange();
          r.selectNodeContents(node);
          var s = window.getSelection();
          s.removeAllRanges();
          s.addRange(r);
        } catch (e) {}
        btn.textContent = "Selected";
        reset();
      }
      try {
        navigator.clipboard.writeText(text).then(function () { btn.textContent = "Copied"; reset(); }, fallback);
      } catch (e) { fallback(); }
    });
  });
})();

(function () {
  // Scroll reveal (triggers on both scroll down and scroll up)
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      } else {
        entry.target.classList.remove("revealed");
      }
    });
  }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
  });

  // Counter animation
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1400;
        var startTime = performance.now();
        function update(now) {
          var elapsed = now - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(target * ease);
          el.textContent = current + suffix;
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target + suffix;
          }
        }
        requestAnimationFrame(update);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll(".count-up").forEach(function (el) {
    countObserver.observe(el);
  });

  // Pill nav active state
  var pills = document.querySelectorAll(".pill-nav a");
  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
    });
  });

  // Swipe toast
  var toast = document.getElementById("enq-toast");
  function showToast(message, kind) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = "swipe-toast " + (kind || "");
    toast.classList.add("show");
    setTimeout(function () {
      toast.classList.remove("show");
    }, 4000);
  }

  // Form submission + track pre-select
  var form = document.querySelector("form[name='enquiry']");
  var trackSelect = document.getElementById("enq-track");

  if (trackSelect) {
    var params = new URLSearchParams(window.location.search);
    var t = params.get("track");
    if (t === "functional" || t === "development") {
      trackSelect.value = t;
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var oldLabel = btn.textContent;
      btn.textContent = "Sending…";
      btn.disabled = true;
      var action = form.getAttribute("action");
      if (!action || action.indexOf("your-form-id-here") !== -1) {
        showToast("Endpoint not configured — please call or WhatsApp instead.", "error");
        btn.textContent = oldLabel;
        btn.disabled = false;
        return;
      }
      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          showToast("Thank you! We'll get back within one working day.", "success");
          form.reset();
          if (trackSelect) trackSelect.selectedIndex = 0;
        } else {
          throw new Error("submit failed");
        }
      }).catch(function () {
        showToast("Something went wrong — please call or WhatsApp instead.", "error");
      }).finally(function () {
        btn.textContent = oldLabel;
        btn.disabled = false;
      });
    });
  }
})();

(function () {
  // Mobile collapse + open/close
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.getElementById("nav-panel");
  if (toggle && panel) {
    var scrim = panel.querySelector(".sm-scrim");
    function closeMenu() {
      panel.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    // Close on item click
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    // Close on scrim click
    if (scrim) { scrim.addEventListener("click", closeMenu); }
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) { closeMenu(); }
    });
  }

  // Active state on scroll (activeHref behavior)
  var navLinks = document.querySelectorAll(".pill-item, .sm-item");
  var sections = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href");
    if (id && id.startsWith("#")) {
      sections[id] = document.querySelector(id);
    }
  });
  function setActive() {
    var fromTop = window.scrollY + 120;
    var current = null;
    for (var id in sections) {
      var el = sections[id];
      if (el && el.offsetTop <= fromTop && el.offsetTop + el.offsetHeight > fromTop) {
        current = id;
      }
    }
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === current);
    });
  }
  window.addEventListener("scroll", setActive);
  setActive();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var target = null;
      try { target = document.querySelector(this.getAttribute("href")); } catch (err) {}
      var wanted = this.getAttribute("data-track");
      var sel = document.getElementById("enq-track");
      if (wanted && sel) sel.value = wanted;
      if (target) {
        e.preventDefault();
        // Replace the history entry instead of pushing, so in-page navigation
        // does not grow the stack and there is no previous state to load back.
        try { history.replaceState(null, document.title, this.getAttribute("href")); } catch (e) {}
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();

(function () {
  // Ghost Fibers WebGL background (fixed behind the whole page)
  var host = document.getElementById("fibers-bg");
  if (!host || !window.GhostFibers) return;
  var small = window.matchMedia("(max-width: 720px)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var fibers = null;

  function options() {
    small = window.matchMedia("(max-width: 720px)").matches;
    return {
      glowColor: "#3d6bff",
      lineColor: "#c3d4ff",
      secondaryColor: "#8f5eff",
      gradient: "depth",
      speed: 0.45,
      scale: small ? 1.25 : 1,
      rotation: small ? 62 : 18,
      layers: small ? 2 : 3,
      threads: small ? 38 : 72,
      density: small ? 0.7 : 1,
      particles: small ? 0.25 : 0.5,
      glow: 0.75,
      brightness: 1.2,
      vignette: 0.45,
      grain: 0.05,
      depthOfField: small ? 0.6 : 0.85,
      mouseInteraction: !coarse,
      pulseOnClick: !coarse,
      dpr: small ? 1.25 : Math.min(window.devicePixelRatio || 1, 1.5)
    };
  }

  function start() {
    try { fibers = window.GhostFibers.create(host, options()); } catch (e) { fibers = null; }
    if (fibers) document.documentElement.classList.add("has-fibers");
  }
  start();

  // re-tune when crossing the mobile breakpoint (rotate / resize)
  var mq = window.matchMedia("(max-width: 720px)");
  var onChange = function () { if (fibers) fibers.update(options()); };
  if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
})();

(function () {
  // Stroke text effect (ReactBits: stroke-text) for .stroke-text elements
  var strokeEls = document.querySelectorAll(".stroke-text");
  if (!strokeEls.length) return;

  var accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--band-accent")
    .trim();
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function build(el) {
    var text = el.textContent;
    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var style = getComputedStyle(el);
    var fontFamily = style.fontFamily;
    var fontSize = style.fontSize;
    var fontWeight = style.fontWeight;
    var letterSpacing = style.letterSpacing;

    var oldSvg = el.querySelector(".stroke-text__svg");
    if (oldSvg) oldSvg.remove();

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.className = "stroke-text__svg";
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = rect.width + "px";
    svg.style.height = rect.height + "px";
    svg.style.pointerEvents = "none";

    var strokeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    strokeText.className = "stroke-text__stroke";
    strokeText.setAttribute("x", "50%");
    strokeText.setAttribute("y", "50%");
    strokeText.setAttribute("dominant-baseline", "central");
    strokeText.setAttribute("text-anchor", "middle");
    strokeText.setAttribute("font-family", fontFamily);
    strokeText.setAttribute("font-size", fontSize);
    strokeText.setAttribute("font-weight", fontWeight);
    strokeText.setAttribute("letter-spacing", letterSpacing);
    strokeText.setAttribute("fill", "none");
    strokeText.setAttribute("stroke", accentColor);
    strokeText.setAttribute("stroke-width", "2");
    strokeText.textContent = text;

    var fillText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    fillText.className = "stroke-text__fill";
    fillText.setAttribute("x", "50%");
    fillText.setAttribute("y", "50%");
    fillText.setAttribute("dominant-baseline", "central");
    fillText.setAttribute("text-anchor", "middle");
    fillText.setAttribute("font-family", fontFamily);
    fillText.setAttribute("font-size", fontSize);
    fillText.setAttribute("font-weight", fontWeight);
    fillText.setAttribute("letter-spacing", letterSpacing);
    fillText.setAttribute("fill", "currentColor");
    fillText.textContent = text;

    svg.appendChild(strokeText);
    svg.appendChild(fillText);
    el.style.position = "relative";
    el.appendChild(svg);

    if (reduced) {
      strokeText.style.strokeDashoffset = "0";
      fillText.style.opacity = "1";
      return;
    }

    if (reduced) {
      strokeText.style.strokeDashoffset = "0";
      fillText.style.opacity = "1";
      return;
    }

    try {
      var length = Math.ceil(rect.width + 20);
      strokeText.style.setProperty("--stroke-length", length + "px");
      strokeText.classList.add("stroke-text__stroke--draw");

      setTimeout(function () {
        fillText.style.opacity = "1";
      }, 1600);
    } catch (e) {
      fillText.style.opacity = "1";
    }
  }

  strokeEls.forEach(build);
  window.addEventListener("resize", function () {
    strokeEls.forEach(build);
  });
})();
