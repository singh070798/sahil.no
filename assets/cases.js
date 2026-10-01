/* Cases manifest — powers two things from one file, cases/manifest.json:
     - the homepage's case grid (index.html, inside .cases__grid)
     - every case page's prev/next nav (cases/*.html, inside .case-nav)
   Whichever of those this page has, this script fills it in from the
   manifest, so you only ever edit one file to add, remove or reorder a
   case — see README.md → "Adding a new case".

   Requires the site to be served over http(s) (Live Server, npx serve,
   or any real host) — a browser opened straight from disk (file://)
   can't fetch a local file, so both the grid and the nav show a short
   explanation instead. See README.md → "Previewing the site". */
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function mediaMarkup(m) {
    if (m && m.type === "image" && m.src) {
      return '<img src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '">';
    }
    if (m && m.type === "video" && m.src) {
      var poster = m.poster ? ' poster="' + esc(m.poster) + '"' : "";
      var mime = m.mime || "video/mp4";
      return '<video autoplay muted loop playsinline' + poster + '>' +
        '<source src="' + esc(m.src) + '" type="' + esc(mime) + '"></video>';
    }
    return '<span class="case-card__media-placeholder">Add preview</span>';
  }

  function cardHTML(entry) {
    var tags = (entry.tags || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
    return '<a class="case-card" href="cases/' + esc(entry.file) + '">' +
      '<div class="case-card__media">' + mediaMarkup(entry.media) + '</div>' +
      '<div class="case-card__body">' +
      '<h3 class="case-card__title">' + esc(entry.title) + '</h3>' +
      '<p class="case-card__desc">' + esc(entry.desc || "") + '</p>' +
      '<div class="case-card__tags">' + tags + '</div>' +
      '<span class="case-card__arrow">View file \u2192</span>' +
      '</div></a>';
  }

  function renderGrid(grid, list) {
    if (!list.length) {
      grid.innerHTML = '<p class="cases__empty">No cases yet — add one to cases/manifest.json.</p>';
      return;
    }
    grid.innerHTML = list.map(cardHTML).join("\n");
  }

  // Prev/next wrap around (the last case's "next" is the first case, and
  // the first case's "prev" is the last), so every case page always has
  // both links and the layout never has to handle a missing side.
  function renderNav(nav, list) {
    var file = location.pathname.split("/").pop();
    var i = list.findIndex(function (e) { return e.file === file; });
    if (i === -1 || list.length < 2) { nav.innerHTML = ""; return; }
    var prev = list[(i - 1 + list.length) % list.length];
    var next = list[(i + 1) % list.length];
    nav.innerHTML =
      '<a class="case-nav__prev" href="' + esc(prev.file) + '">&larr; ' + esc(prev.title) + '</a>' +
      '<a class="case-nav__next" href="' + esc(next.file) + '">' + esc(next.title) + ' &rarr;</a>';
  }

  var grid = document.querySelector(".cases__grid");
  var nav = document.querySelector(".case-nav");
  if (!grid && !nav) return;

  fetch(grid ? "cases/manifest.json" : "manifest.json")
    .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function (list) {
      if (grid) renderGrid(grid, list);
      if (nav) renderNav(nav, list);
    })
    .catch(function () {
      if (grid) grid.innerHTML = '<p class="cases__empty">Couldn\u2019t load the case list here \u2014 open this site through a local server (see README \u2192 "Previewing the site"), not by double-clicking the file.</p>';
      if (nav) nav.innerHTML = "";
    });
})();
