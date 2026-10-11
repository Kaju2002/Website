(function () {
  "use strict";

  /* ---------- Intro splash ---------- */

  var intro = document.getElementById("intro");
  if (intro) {
    var skipIntro = function () {
      intro.setAttribute("data-skip", "");
    };
    intro.addEventListener("click", skipIntro);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") skipIntro();
    });
    intro.addEventListener("animationend", function (e) {
      if (e.target === intro && e.animationName === "intro-curtain") intro.remove();
    });
  }

  /* ---------- Mobile menu ---------- */

  var menuToggle = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menuToggle.querySelector('[data-icon="open"]').classList.toggle("hidden", open);
      menuToggle.querySelector('[data-icon="close"]').classList.toggle("hidden", !open);
    });
  }

  /* ---------- Back to top ---------- */

  var scrollTop = document.getElementById("scroll-top");
  if (scrollTop) {
    var hiddenClasses = ["pointer-events-none", "translate-y-4", "opacity-0"];
    var onScroll = function () {
      var visible = window.scrollY > 400;
      hiddenClasses.forEach(function (c) {
        scrollTop.classList.toggle(c, !visible);
      });
      scrollTop.classList.toggle("opacity-100", visible);
      scrollTop.tabIndex = visible ? 0 : -1;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    scrollTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Literature survey tabs ---------- */

  var tabList = document.getElementById("literature-tabs");
  if (tabList) {
    var tabs = Array.prototype.slice.call(tabList.querySelectorAll('[role="tab"]'));
    var TAB_BASE = "flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition";
    var TAB_ON = "border-primary bg-primary text-white";
    var TAB_OFF = "border-border bg-white text-foreground/80 hover:border-primary/30 hover:text-primary";
    var NUM_BASE = "font-display text-sm font-bold tabular-nums";

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t, i) {
          var selected = i === index;
          t.setAttribute("aria-selected", String(selected));
          t.className = TAB_BASE + " " + (selected ? TAB_ON : TAB_OFF);
          t.firstElementChild.className = NUM_BASE + " " + (selected ? "text-white/60" : "text-accent");
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !selected;
        });
      });
    });
  }

  /* ---------- Domain page section nav ---------- */

  var domainNav = document.getElementById("domain-nav");
  if (domainNav && "IntersectionObserver" in window) {
    var navLinks = Array.prototype.slice.call(domainNav.querySelectorAll("a"));
    var LINK_BASE = "flex items-center gap-2 border-b-2 px-3 py-3.5 text-sm transition-colors";
    var LINK_ON = "border-primary font-semibold text-primary";
    var LINK_OFF = "border-transparent font-medium text-foreground/60 hover:text-primary";

    var setActive = function (id) {
      navLinks.forEach(function (link) {
        var current = link.getAttribute("href") === "#" + id;
        link.className = LINK_BASE + " " + (current ? LINK_ON : LINK_OFF);
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        var visible = entries.filter(function (e) {
          return e.isIntersecting;
        });
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px" },
    );
    navLinks.forEach(function (link) {
      var el = document.getElementById(link.getAttribute("href").slice(1));
      if (el) observer.observe(el);
    });
  }

  /* ---------- Milestones (status worked out from today's date) ---------- */

  // Keep in sync with the timeline in milestones.html. `end` is the last day of each milestone.
  var MILESTONES = [
    { title: "Project Initialization", date: "November 2025", end: "2025-11-30" },
    { title: "Topic Assessment Form (TAF)", date: "January 2026", end: "2026-01-31" },
    { title: "Proposal Submission", date: "15 March 2026", end: "2026-03-15" },
    { title: "Proposal Presentation", date: "16 – 18 March 2026", end: "2026-03-18" },
    { title: "Progress Presentation 1", date: "11 – 13 May 2026", end: "2026-05-13" },
    { title: "Progress Presentation 2", date: "31 August – 2 September 2026", end: "2026-09-02" },
    { title: "Draft Thesis & Website Submission", date: "11 October 2026", end: "2026-10-11" },
    { title: "Final Presentation & Viva", date: "19 – 21 October 2026", end: "2026-10-21" },
    { title: "Research Paper Submission", date: "23 October 2026", end: "2026-10-23" },
    { title: "Final Thesis Submission", date: "28 October 2026", end: "2026-10-28" },
  ];

  var STATUS = {
    completed: {
      label: "Completed",
      text: "text-primary/50",
      dot: "h-3 w-3 bg-primary",
      segment: "bg-primary",
      title: "text-primary",
    },
    current: {
      label: "In progress",
      text: "text-accent",
      dot: "h-3.5 w-3.5 bg-accent ring-4 ring-accent/20",
      segment: "bg-accent animate-pulse",
      title: "text-primary",
    },
    upcoming: {
      label: "Upcoming",
      text: "text-muted",
      dot: "h-3 w-3 bg-white ring-2 ring-border",
      segment: "bg-primary-light",
      title: "text-primary/70",
    },
  };

  function resolveMilestones() {
    var today;
    try {
      today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
    } catch (e) {
      return null;
    }
    var hasCurrent = false;
    return MILESTONES.map(function (m) {
      var status = m.end < today ? "completed" : hasCurrent ? "upcoming" : "current";
      if (status === "current") hasCurrent = true;
      return { title: m.title, date: m.date, status: status };
    });
  }

  var resolved = resolveMilestones();

  if (resolved) {
    var completedCount = resolved.filter(function (m) {
      return m.status === "completed";
    }).length;
    var current = resolved.filter(function (m) {
      return m.status === "current";
    })[0];
    var next = resolved.filter(function (m) {
      return m.status !== "completed";
    })[0];

    var fact = document.querySelector("[data-milestone-fact]");
    if (fact) fact.textContent = completedCount + " of " + resolved.length + " completed";
    var nextEl = document.querySelector("[data-milestone-next]");
    if (nextEl) {
      nextEl.textContent = next ? "Next: " + next.title + ", " + next.date : "All milestones completed.";
    }

    var timeline = document.getElementById("timeline");
    if (timeline) {
      var q = function (root, role) {
        return root.querySelector('[data-role="' + role + '"]');
      };

      q(timeline, "progress").textContent = Math.round((completedCount / resolved.length) * 100) + "%";
      q(timeline, "completed").textContent = completedCount + " of " + resolved.length + " completed";

      timeline.querySelectorAll('[data-role="segment"]').forEach(function (seg, i) {
        seg.className = "h-2 flex-1 rounded-full " + STATUS[resolved[i].status].segment;
      });

      var currentBox = q(timeline, "current");
      currentBox.hidden = !current;
      if (current) {
        q(currentBox, "current-title").textContent = current.title;
        q(currentBox, "current-date").textContent = "Due " + current.date;
      }

      timeline.querySelectorAll("[data-milestone]").forEach(function (li, i) {
        var m = resolved[i];
        var s = STATUS[m.status];
        var isCurrent = m.status === "current";
        var dateColor = isCurrent ? "text-accent" : "text-foreground/60";

        q(li, "date").className =
          "hidden pr-10 pt-0.5 text-right text-sm font-semibold tabular-nums md:block " + dateColor;
        var line = q(li, "line");
        if (line) {
          line.className =
            "absolute bottom-0 left-0 top-3 w-px " + (m.status === "completed" ? "bg-primary" : "bg-border");
        }
        q(li, "dot").className = "absolute left-0 top-1.5 -translate-x-1/2 rounded-full " + s.dot;
        q(li, "card").className = isCurrent
          ? "-mt-4 rounded-xl bg-primary-soft px-5 py-4 ring-1 ring-primary/10"
          : "";
        var labelEl = q(li, "label");
        labelEl.className = s.text;
        labelEl.textContent = s.label;
        q(li, "mobile-date").className = "normal-case tracking-normal md:hidden " + dateColor;
        q(li, "title").className = "font-display text-lg font-bold " + s.title;
      });
    }
  }

  /* ---------- Contact form ---------- */

  var form = document.getElementById("contact-form");
  if (form) {
    var button = form.querySelector('button[type="submit"]');
    var sendIcon = form.querySelector('[data-role="send-icon"]');
    var loadingIcon = form.querySelector('[data-role="loading-icon"]');
    var buttonLabel = form.querySelector('[data-role="button-label"]');
    var sentMsg = form.querySelector('[data-role="sent"]');
    var errorMsg = form.querySelector('[data-role="error"]');

    var setStatus = function (status) {
      var sending = status === "sending";
      button.disabled = sending;
      sendIcon.classList.toggle("hidden", sending);
      loadingIcon.classList.toggle("hidden", !sending);
      buttonLabel.textContent = sending ? "Sending..." : "Send message";
      sentMsg.hidden = status !== "sent";
      errorMsg.hidden = status !== "error";
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      data.set("subject", "[R26-SE-002] " + (data.get("subject") || ""));

      setStatus("sending");
      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          if (!json.success) throw new Error(json.message);
          form.reset();
          setStatus("sent");
        })
        .catch(function () {
          setStatus("error");
        });
    });
  }
})();
