/* Cases manifest — powers two things from one file, cases/manifest.json:
     - the homepage's case grid (index.html, inside .cases__grid)
     - every case page's prev/next nav (cases/*.html, inside .case-nav)
   Whichever of those this page has, this script fills it in from the
   manifest, so you only ever edit one file to add, remove or reorder a
   case — see README.md → "Adding a new case".

   Homepage grid: a two-column mosaic (styles in assets/works.css, which
   this script loads by itself). Each tile keeps the shape of its own
   media — a wide film gets a wide tile, a square loop a square one —
   and the columns pack up like a masonry wall, in manifest order.
   Videos play whenever they're on screen and pause when scrolled away.

   Optional manifest fields (leave out for sensible defaults):
     "client":  "Eika"            left part of the title
     "project": "Kredittkort"     right part of the title
                                   (default: "title" split at " — ")
     "kind":    "3D · Campaign"   small label beside the title
                                   (default: the first two tags)

   Requires the site to be served over http(s) (Live Server, npx serve,
   or any real host) — a browser opened straight from disk (file://)
   can't fetch a local file, so both the grid and the nav show a short
   explanation instead. See README.md → "Previewing the site". */
(function () {
  // Clean addresses: on the live site, links leave off ".html"
  // (GitHub Pages serves /cases/eika from cases/eika.html). On your own
  // computer, where preview servers like Live Server need the full file
  // name, the ".html" stays. The manifest keeps full file names.
  var LOCAL = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(location.hostname);
  function page(file) { return LOCAL ? file : String(file).replace(/\.html$/, ""); }

  var SCRIPT = document.currentScript || document.querySelector('script[src*="cases.js"]');

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function splitTitle(entry) {
    if (entry.client) return { client: entry.client, project: entry.project || "" };
    var parts = String(entry.title || "").split(/\s+[—–-]\s+/);
    return { client: parts[0], project: parts.slice(1).join(" — ") };
  }

  function mediaMarkup(m, name) {
    if (m && m.type === "image" && m.src) {
      return '<img src="' + esc(m.src) + '" alt="' + esc(m.alt || name) + '">';
    }
    if (m && m.type === "video" && m.src) {
      var poster = m.poster ? ' poster="' + esc(m.poster) + '"' : "";
      return '<video muted loop playsinline preload="metadata"' + poster +
        ' aria-label="' + esc(m.alt || name) + '">' +
        '<source src="' + esc(m.src) + '" type="' + esc(m.mime || "video/mp4") + '"></video>';
    }
    return '<span class="work__placeholder">Add preview</span>';
  }

  function tileHTML(entry) {
    var t = splitTitle(entry);
    var name = t.client + (t.project ? " — " + t.project : "");
    var kind = entry.kind || (entry.tags || []).slice(0, 2).join(" · ");
    return '<a class="work" href="cases/' + esc(page(entry.file)) + '">' +
      '<div class="work__media">' + mediaMarkup(entry.media, name) +
        '<span class="work__view" aria-hidden="true">View case →</span>' +
      '</div>' +
      '<div class="work__cap">' +
        '<h3 class="work__title">' + esc(t.client) +
          (t.project ? ' — ' + esc(t.project) : '') + '</h3>' +
        (kind ? '<span class="work__kind">' + esc(kind) + '</span>' : '') +
      '</div></a>';
  }

  /* ---- mosaic: each tile spans as many tiny grid rows as it is tall ---- */
  function wireMosaic(grid) {
    var tiles = [].slice.call(grid.querySelectorAll(".work"));

    function rowUnit() {
      var cs = getComputedStyle(grid);
      return parseFloat(cs.gridAutoRows) || 4;
    }

    function fit(tile) {
      var row = rowUnit();
      // Tiles are align-self: start (works.css), so this is their own
      // height (spacing below included), not the rows they span.
      var h = tile.getBoundingClientRect().height;
      tile.style.gridRowEnd = "span " + Math.ceil(h / row);
    }

    // Give each media box the real shape of its poster/video/image.
    function shape(tile) {
      var box = tile.querySelector(".work__media");
      var el = box.querySelector("video, img");
      if (!el) return;
      function set(w, h) {
        if (w && h) { box.style.aspectRatio = w + " / " + h; fit(tile); }
      }
      if (el.tagName === "IMG") {
        if (el.complete) set(el.naturalWidth, el.naturalHeight);
        el.addEventListener("load", function () { set(el.naturalWidth, el.naturalHeight); });
      } else {
        // Poster first (it arrives sooner), then the video's own size.
        if (el.poster) {
          var p = new Image();
          p.onload = function () { if (!el.videoWidth) set(p.naturalWidth, p.naturalHeight); };
          p.src = el.poster;
        }
        el.addEventListener("loadedmetadata", function () { set(el.videoWidth, el.videoHeight); });
        if (el.readyState >= 1) set(el.videoWidth, el.videoHeight);
      }
    }

    tiles.forEach(function (tile) { shape(tile); fit(tile); });

    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (e) {
          fit(e.target);
        });
      });
      tiles.forEach(function (tile) {
        ro.observe(tile);
      });
    } else {
      window.addEventListener("resize", function () { tiles.forEach(fit); });
    }
  }

  /* ---- video: play while on screen, pause when scrolled away ---- */
  function wireVideos(grid) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var vids = [].slice.call(grid.querySelectorAll("video"));
    function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    if (!("IntersectionObserver" in window)) { vids.forEach(play); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) play(e.target); else e.target.pause();
      });
    }, { rootMargin: "200px 0px" });
    vids.forEach(function (v) { io.observe(v); });
  }

  function renderGrid(grid, list) {
    if (!list.length) {
      grid.innerHTML = '<p class="cases__empty">No cases yet — add one to cases/manifest.json.</p>';
      return;
    }
    grid.classList.add("works-grid");
    grid.innerHTML = list.map(tileHTML).join("\n");
    wireMosaic(grid);
    wireVideos(grid);
  }

  // Prev/next wrap around (the last case's "next" is the first case, and
  // the first case's "prev" is the last), so every case page always has
  // both links and the layout never has to handle a missing side.
  function renderNav(nav, list) {
    // Which case is this? Compared without ".html", so it works at both
    // /cases/eika and /cases/eika.html.
    var here = location.pathname.split("/").pop().replace(/\.html$/, "");
    var i = list.findIndex(function (e) { return e.file.replace(/\.html$/, "") === here; });
    if (i === -1 || list.length < 2) { nav.innerHTML = ""; return; }
    var prev = list[(i - 1 + list.length) % list.length];
    var next = list[(i + 1) % list.length];
    nav.innerHTML =
      '<a class="case-nav__prev" href="' + esc(page(prev.file)) + '">&larr; ' + esc(prev.title) + '</a>' +
      '<a class="case-nav__next" href="' + esc(page(next.file)) + '">' + esc(next.title) + ' &rarr;</a>';
  }

  var grid = document.querySelector(".cases__grid");
  var nav = document.querySelector(".case-nav");
  if (!grid && !nav) return;

  // Load assets/works.css automatically on the homepage, so index.html
  // doesn't need its own <link> line. It's taken from the same folder as
  // this script, so it works locally and on the live site alike.
  if (grid && !document.querySelector('link[href*="works.css"]')) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = SCRIPT ? SCRIPT.src.replace(/cases\.js(\?.*)?$/, "works.css") : "assets/works.css";
    document.head.appendChild(link);
  }

  fetch(grid ? "cases/manifest.json" : "manifest.json")
    .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function (list) {
      if (grid) renderGrid(grid, list);
      if (nav) renderNav(nav, list);
    })
    .catch(function () {
      if (grid) grid.innerHTML = '<p class="cases__empty">Couldn’t load the case list here — open this site through a local server (see README → "Previewing the site"), not by double-clicking the file.</p>';
      if (nav) nav.innerHTML = "";
    });
})();
