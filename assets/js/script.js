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
  }, { threshold: 0.12 });
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
  var list = document.getElementById("nav-list");
  if (toggle && list) {
    toggle.addEventListener("click", function () {
      var open = list.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    // Close on item click
    list.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        list.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Active state on scroll (activeHref behavior)
  var navLinks = document.querySelectorAll(".pill-item");
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
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
