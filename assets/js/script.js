window.NL = (function () {
  var KEY = "nexlearn:course";
  return {
    get: function () { try { var v = localStorage.getItem(KEY); return v === "functional" || v === "development" ? v : null; } catch (e) { return null; } },
    set: function (v) { try { if (v === "functional" || v === "development") localStorage.setItem(KEY, v); } catch (e) {} }
  };
})();

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
  var pickLink = document.querySelector("#pick a");
  var radios = document.querySelectorAll('input[name="goal"]');
  function render() {
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        var p = picks[radios[i].value];
        nameEl.textContent = p.name;
        textEl.textContent = p.text;
        if (pickLink) pickLink.setAttribute("href", "#" + radios[i].value);
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
      NL.set(t);
    } else if (NL.get()) {
      trackSelect.value = NL.get();          // pick up the course they last looked at
    }
    trackSelect.addEventListener("change", function () { NL.set(trackSelect.value); });
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
  var navLinks = document.querySelectorAll(".nb-link, .sm-item");
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
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;   // page links keep their server-set active state
      link.classList.toggle("active", href === current);
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
  // Navbar: glass-on-scroll, reading progress, sliding underline indicator
  var head = document.getElementById("site-head");
  if (!head) return;
  var bar = head.querySelector(".nb-progress");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    head.classList.toggle("is-scrolled", y > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    head.style.setProperty("--p", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  var list = head.querySelector(".nb-list");
  var ind = head.querySelector(".nb-indicator");
  if (!list || !ind) return;
  var links = Array.prototype.slice.call(list.querySelectorAll(".nb-link"));
  function activeLink() { return list.querySelector(".nb-link.active"); }
  function moveTo(a) {
    if (!a) { ind.classList.remove("on"); return; }
    var l = list.getBoundingClientRect(), r = a.getBoundingClientRect();
    ind.style.width = (r.width - 28) + "px";
    ind.style.transform = "translateX(" + (r.left - l.left + 14) + "px)";
    ind.classList.add("on");
  }
  links.forEach(function (a) {
    a.addEventListener("mouseenter", function () { moveTo(a); });
    a.addEventListener("focus", function () { moveTo(a); });
  });
  list.addEventListener("mouseleave", function () { moveTo(activeLink()); });
  list.addEventListener("focusout", function () { moveTo(activeLink()); });
  var start = activeLink();
  if (start) {
    // place without animating on first paint, then enable the slide
    ind.style.transition = "none"; moveTo(start); void ind.offsetWidth; ind.style.transition = "";
  }
  window.addEventListener("resize", function () { moveTo(activeLink()); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveTo(activeLink()); });
})();

(function () {
  // Home: the hero stays pinned, darkens and fades while the solid sheet slides over it
  var hero = document.querySelector(".hero-home");
  if (!hero) return;
  var raf = 0;
  function pin() {
    // a hero taller than the viewport scrolls until its bottom edge is visible, then pins
    var h = hero.offsetHeight;
    hero.style.setProperty("--hero-top", Math.min(0, window.innerHeight - h) + "px");
  }
  function update() {
    raf = 0;
    var h = hero.offsetHeight, vh = window.innerHeight;
    var start = Math.max(0, h - vh);
    var len = Math.max(1, h - start);
    var p = Math.min(1, Math.max(0, (window.scrollY - start) / len));
    var e = p * p * (3 - 2 * p);                       // smoothstep
    hero.style.setProperty("--hd", (e * 0.92).toFixed(3));                    // darkness
    hero.style.setProperty("--hf", Math.max(0, 1 - e * 1.35).toFixed(3));      // text fades out first
    hero.style.setProperty("--hy", (-e * 48).toFixed(1) + "px");              // gentle upward drift
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update); }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", function () { pin(); schedule(); });
  window.addEventListener("load", function () { pin(); schedule(); });
  pin(); update();
})();

(function () {
  // Programmes: interactive track tabs
  var sw = document.querySelector(".tab-switch");
  if (sw) {
    var tabs = Array.prototype.slice.call(sw.querySelectorAll(".tab-btn"));
    var panels = {};
    tabs.forEach(function (t) { panels[t.dataset.tab] = document.getElementById(t.dataset.tab); });
    function activate(name, focus) {
      if (!panels[name]) return;
      sw.dataset.active = name;
      tabs.forEach(function (t) {
        var on = t.dataset.tab === name;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
        if (on) NL.set(t.dataset.tab);
        var pn = panels[t.dataset.tab];
        if (on) { pn.hidden = false; pn.classList.remove("enter"); void pn.offsetWidth; pn.classList.add("enter"); }
        else { pn.hidden = true; pn.classList.remove("enter"); }
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activate(t.dataset.tab); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); activate(n.dataset.tab, true); }
      });
    });
    // deep links (#functional / #development), from this page or the chooser
    var fromHash = location.hash.replace("#", "");
    activate(panels[fromHash] ? fromHash : (NL.get() || "functional"));
    window.addEventListener("hashchange", function () {
      var h = location.hash.replace("#", "");
      if (panels[h]) { activate(h); panels[h].scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var h = a.getAttribute("href").slice(1);
      if (panels[h]) activate(h);
    }, true);
  }

  // Programmes: week-by-week explorer built from the table
  var box = document.getElementById("wk");
  var tbl = document.querySelector(".wk-table table");
  if (box && tbl) {
    var rows = Array.prototype.slice.call(tbl.querySelectorAll("tbody tr")).map(function (tr) {
      var c = tr.querySelectorAll("td");
      return { n: tr.querySelector("th").textContent.trim(), f: c[0].textContent.trim(), d: c[1].textContent.trim() };
    });
    var rail = box.querySelector(".wk-rail");
    var topics = box.querySelectorAll(".wk-topic");
    var count = box.querySelector(".wk-count");
    var detail = box.querySelector(".wk-detail");
    var cur = 0;
    var btns = rows.map(function (r, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "wk-chip"; b.setAttribute("role", "tab");
      b.innerHTML = "<small>Week</small><b>" + r.n + "</b>";
      b.addEventListener("click", function () { show(i); });
      rail.appendChild(b); return b;
    });
    function show(i) {
      cur = Math.max(0, Math.min(rows.length - 1, i));
      btns.forEach(function (b, k) {
        b.classList.toggle("on", k === cur); b.classList.toggle("done", k < cur);
        b.setAttribute("aria-selected", k === cur ? "true" : "false");
      });
      rail.style.setProperty("--prog", (cur / (rows.length - 1)).toFixed(4));
      topics[0].textContent = rows[cur].f; topics[1].textContent = rows[cur].d;
      count.textContent = "Week " + rows[cur].n + " of " + rows.length;
      detail.classList.remove("swap"); void detail.offsetWidth; detail.classList.add("swap");
      var on = btns[cur];
      if (rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: on.offsetLeft - rail.clientWidth / 2 + on.offsetWidth / 2, behavior: "smooth" });
    }
    box.querySelectorAll("[data-wk]").forEach(function (b) {
      b.addEventListener("click", function () { show(cur + parseInt(b.getAttribute("data-wk"), 10)); });
    });
    box.hidden = false;
    var det = document.querySelector(".wk-table");
    if (det) det.open = false;
    show(0);
  }
})();

(function () {
  // Privacy policy: highlight the section being read in the contents list
  var links = Array.prototype.slice.call(document.querySelectorAll(".legal-toc a"));
  if (!links.length || !("IntersectionObserver" in window)) return;
  var map = {};
  links.forEach(function (a) { map[a.getAttribute("data-spy")] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove("on"); });
      var a = map[en.target.id];
      if (a) { a.classList.add("on"); if (a.scrollIntoView && window.matchMedia("(max-width: 860px)").matches) a.scrollIntoView({ inline: "center", block: "nearest" }); }
    });
  }, { rootMargin: "-20% 0px -70% 0px" });
  document.querySelectorAll(".legal-sec").forEach(function (s) { io.observe(s); });
  links[0].classList.add("on");
})();

(function () {
  // Home: remember which course was opened, and mark it the next time they visit
  var btns = document.querySelectorAll(".course-btn[data-course]");
  if (!btns.length) return;
  var last = NL.get();
  btns.forEach(function (b) {
    if (last && b.getAttribute("data-course") === last) b.classList.add("is-last");
    b.addEventListener("click", function () { NL.set(b.getAttribute("data-course")); });
  });
})();
