/* Tools list — builds the cards on tool/index.html from
   tool/manifest.json, the same way assets/cases.js builds the
   homepage's case grid from cases/manifest.json. To add, remove,
   reorder or reword a tool, edit only the manifest (see README.md →
   "The tools folder").

   Each manifest entry:
     file   the tool's page, inside tool/            (required)
     title  the card's heading                       (required)
     desc   one or two sentences                     (required)
     tags   short labels, shown in the accent color  (optional)
     media  a preview image or video, same format as
            cases/manifest.json                      (optional)

   It also writes a schema.org ItemList of the tools into the page, so
   search engines can read the list as structured data.

   Like the case grid, this needs the site served over http(s): opened
   straight from disk (file://) the browser can't read the manifest. */
(function () {
  var grid = document.querySelector(".tools__grid");
  if (!grid) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function mediaMarkup(m) {
    if (!m || !m.src) return "";
    var inner;
    if (m.type === "video") {
      var poster = m.poster ? ' poster="' + esc(m.poster) + '"' : "";
      inner = '<video autoplay muted loop playsinline' + poster + '>' +
        '<source src="' + esc(m.src) + '" type="' + esc(m.mime || "video/mp4") + '"></video>';
    } else {
      inner = '<img src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '" loading="lazy">';
    }
    return '<div class="case-card__media">' + inner + '</div>';
  }

  function cardHTML(t) {
    var tags = (t.tags || []).map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("");
    return '<a class="case-card" href="' + esc(t.file) + '">' +
      mediaMarkup(t.media) +
      '<div class="case-card__body">' +
      '<h2 class="case-card__title">' + esc(t.title) + '</h2>' +
      '<p class="case-card__desc">' + esc(t.desc) + '</p>' +
      (tags ? '<div class="case-card__tags">' + tags + '</div>' : '') +
      '<span class="case-card__arrow">Open tool →</span>' +
      '</div></a>';
  }

  function structuredData(list) {
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Tools",
      "itemListElement": list.map(function (t, i) {
        return {
          "@type": "ListItem",
          "position": i + 1,
          "name": t.title,
          "description": t.desc,
          "url": new URL(t.file, location.href).href
        };
      })
    });
    document.head.appendChild(s);
  }

  fetch("manifest.json")
    .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function (list) {
      grid.innerHTML = list.length
        ? list.map(cardHTML).join("\n")
        : '<p class="cases__empty">No tools yet — add one to tool/manifest.json.</p>';
      structuredData(list);
    })
    .catch(function () {
      grid.innerHTML = '<p class="cases__empty">Couldn’t load the list of tools here — open this site through a local server (see README → "Previewing the site"), not by double-clicking the file.</p>';
    });
})();
