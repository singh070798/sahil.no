/* The hidden tools card — turns the profile card over to show a list
   of the tools in tool/. See README.md → "The hidden tools card".

   - The button just above the card's top-right corner turns it, and
     turns it back. It's invisible until hovered or focused, but it can
     be clicked or tapped all the same if you know where it is.
   - Opening the homepage as sahil.no/#tools shows the card turned.
   - The list is read from tool/manifest.json, the same file that
     builds the /tool/ page, so it never needs editing here.

   Needs the site served over http(s), like the case grid; opened
   straight from disk the list falls back to a link to the tools page. */
(function () {
  var flip = document.querySelector(".profile-flip");
  if (!flip) return;
  var btn = flip.querySelector(".tools-toggle");
  var front = flip.querySelector(".profile-flip__front");
  var back = flip.querySelector(".tools-card");
  var list = back.querySelector(".tools-card__list");
  var loaded = false;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function load() {
    if (loaded) return;
    loaded = true;
    fetch("tool/manifest.json")
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (tools) {
        list.innerHTML = tools.map(function (t) {
          return '<li><a href="tool/' + esc(t.file) + '">' +
            '<span class="tools-card__name">' + esc(t.title) + '</span>' +
            '<span class="tools-card__desc">' + esc(t.desc) + '</span></a></li>';
        }).join("");
      })
      .catch(function () {
        list.innerHTML = '<li class="tools-card__empty">The list couldn’t load here. Use the link below.</li>';
      });
  }

  function set(open, instant) {
    if (open) load();
    if (instant) flip.classList.add("is-instant");
    flip.classList.toggle("is-flipped", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Show profile" : "Show tools");
    // Only the face you can see takes clicks and keyboard focus.
    front.inert = open;
    back.inert = !open;
    if (instant) {
      flip.offsetWidth; // apply the turned state before animations come back on
      flip.classList.remove("is-instant");
    }
  }

  btn.addEventListener("click", function () {
    set(!flip.classList.contains("is-flipped"));
  });

  // Escape turns it back, when you're on the card.
  flip.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && flip.classList.contains("is-flipped")) {
      set(false);
      btn.focus();
    }
  });

  // Coming back from a tool you opened here, the card is still turned,
  // so you can go from one tool to the next. Remembered for this tab
  // only, and only when a tool was opened from the card.
  var KEY = "tools-card-open";
  back.addEventListener("click", function (e) {
    if (e.target.closest("a")) { try { sessionStorage.setItem(KEY, "1"); } catch (err) {} }
  });
  var cameBack = false;
  try { cameBack = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch (err) {}

  function fromAddress(instant) {
    if (location.hash === "#tools") set(true, instant);
  }
  if (cameBack) set(true, true); else fromAddress(true);
  window.addEventListener("hashchange", function () { fromAddress(false); });
})();
