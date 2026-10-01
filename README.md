# Sahil — Portfolio Site

A portfolio built around your signature logo, on a teal background
with white cards and one blue accent. It's plain HTML and CSS — **no
build tools, no installs, no frameworks.** The only JavaScript is the
showreel player (Section 6), the animated logo's player (Section 5)
and a few lines for the jump links (Section 6).
Open it straight in a browser or drop it on any web host.

This file explains everything you need to customize it, even if you've
never edited a website before. Read top to bottom the first time; after
that, use it as a reference.

---

## 1. How the site is organized

```
portfolio-site/
├── index.html            ← the homepage (logo header + reel/CV row + grid of case cards)
├── README.md              ← this file
├── assets/
│   ├── style.css           ← all colors, fonts, spacing — one file controls the look
│   ├── cases.js            ← builds the homepage grid & Prev/Next nav from manifest.json (Section 8)
│   └── logo-motion.js      ← plays the animated logo
├── images/
│   ├── sahil-logo-motion-ss02.mp4          ← animated logo, wide screens (colors on top, transparency below)
│   ├── sahil-logo-motion-mobile-ss04.mp4   ← animated logo, phones (a different animation: see Section 5)
│   ├── sahil-logo-still-ss02.webp / sahil-logo-mobile-still-ss04.webp  ← first frames, shown before / instead of the animation
│   ├── sahil-logo-ext.webp            ← the ribbon's extended tail and arm (wide screens)
│   ├── sahil-profile.webp / .jpg       ← portrait in the header's profile card
│   ├── og-image-ss02.jpg                    ← the picture shown when the site link is shared
│   ├── favicon-32.png                  ← browser-tab icon
│   └── apple-touch-icon.png            ← icon used when saved to a phone home screen
├── videos/
│   ├── showreel.webm                   ← the showreel, first choice (see Section 6)
│   ├── showreel.mp4                    ← the showreel, fallback
│   └── showreel-poster.webp            ← still shown before it plays
├── files/
│   └── Sahil_Singh_CV_2026.pdf   ← downloaded by the "Full Resume" button
└── cases/
    ├── manifest.json         ← the ordered list of cases — the one file you edit to add, remove or reorder one (Section 8)
    ├── template.html        ← blank starting point for a NEW case
    ├── case-01.html          ← example case: "Neon Static"
    ├── case-02.html          ← example case: "Chrome Interface"
    └── case-03.html          ← example case: "Static Frequency"
```

**The core idea:** `index.html` is an index page with a card for each
project, and each card is a link to its own file inside `cases/`. That
file is a normal HTML page you can write and design freely — the
homepage just points to it. Which cases exist, what order they're in,
and what their homepage card says all live in one place,
`cases/manifest.json` (Section 8) — you never hand-edit a card or a
Prev/Next link directly.

---

## 2. Previewing the site

**Use a local server, not a double-click.** The homepage's case grid
and every case page's Prev/Next links are built by a small script
(`assets/cases.js`) that reads `cases/manifest.json` — see Section 8.
Browsers block that kind of read for a page opened straight from disk
(a `file://` address), so double-clicking `index.html` shows a plain
"couldn't load the case list" message instead of your work, and each
case page's Prev/Next is simply blank. Two other things need the same
thing: the animated logo (Section 5) and scrubbing the showreel
(Section 6).

None of this needs installing a real web server — any of these give
you a `file://`-free address in seconds:

- **VS Code's free "Live Server" extension** — right-click
  `index.html`, "Open with Live Server."
- **`npx serve`**, run once in the site folder, if you have Node
  installed.
- Avoid `python -m http.server` for anything with video in it: it
  doesn't support the "range requests" browsers need to scrub a video,
  though the case grid and Prev/Next links work fine with it.

Click a case card to see it navigate to `cases/case-01.html`.

When you're happy with it, publish it for free on something like
[Netlify Drop](https://app.netlify.com/drop) or [GitHub Pages](https://pages.github.com/) —
both just want the whole `portfolio-site` folder, and both serve it
properly (this local-server requirement is only about *previewing it
on your own computer*; once it's on any real host, everything just
works).

---

## 3. Why this looks the way it does

- **The logo sets the type system.** The logo's lettering ("MOTION
  DESIGN") is a condensed grotesque (Akzidenz-Grotesk BQ Condensed
  Medium), which is why every short label on the site — case numbers,
  tags, nav, footer — is set in condensed, tracked-out caps. See
  **Section 7** for the free stand-in font used here and how to switch
  to the real one. The logo is also why cards use a small, precise
  corner radius: the signature is a fine chrome line, not an inflated
  shape.
- **Two shades of one teal.** The top of every page — the homepage's
  landing screen and each case page's header — is teal (`#286a6d`).
  Everything below it sits on a deeper teal (`#123c3e`), so the change
  of color marks where the landing ends and the work begins, with no
  divider line needed. The logo always sits on the lighter shade,
  because its dark chrome ribbon loses its shading on the darker one.
  In the HTML, the lighter band is the `<div class="stage">` (homepage)
  or `<header class="stage">` (case pages); in `style.css` the two
  colors are `--bg` and `--bg-deep`.
- **Two directions of text.** Text sitting directly on either teal
  (headings, footer, case pages) is light. Text inside the white
  surfaces — the profile card, the CV card and the case cards — is
  dark.
- **One accent.** Signal Blue (`#2f5de3`) at full strength inside the
  white cards, and a light tint of it (`#a5b9f3`) for text on the teal.
- **No glow, no gradient text, no fake "system status" chrome.** The
  one dramatic moment is the reel: while it plays, the rest of the page
  dims so the video reads as a spotlight — see **Section 6**.
- **Every text size comes from one shared scale.** See **Section 7 →
  "The type scale"**.
- **Case pages are narrower than the homepage.** The homepage sits in
  an 1100px frame; case pages use 900px for the header, visuals and
  navigation, and 700px for paragraphs, so lines stay comfortable to
  read. The logo is shifted on case pages to make up the difference,
  so it lines up with the homepage's frame and its ribbon still runs
  off the left edge of the window.
- **The homepage's headings form a real outline.** The logo is wrapped
  in an `<h1>`, "Experiences" and "Selected Works" are `<h2>`, and the
  case titles are `<h3>`. See **Section 5 → "Headings, not just
  styling"** before adding new sections.

### Sizing: rem, vw and vh

The site mixes three kinds of unit on purpose:

- **rem for text and spacing.** It scales with the visitor's own font
  settings and browser zoom, which text sized in vw would not (that's
  an accessibility requirement, not a style choice).
- **vw (via the grid) for the artwork.** The logo is sized from the
  width of the grid's columns (`--logo-gw` in `style.css`), so the
  landing screen keeps the same composition from a laptop to a large
  monitor.
- **vh for the full-screen sections.** Their spacing and the
  portrait's height follow the window's height, so they always fit
  (see "Click your way down the page" in Section 6).

Layout changes (columns, stacking) are left to breakpoints rather than
being scaled smoothly, since a three-column layout squeezed into a
small window is worse than a two-column one at a readable size.

### How the contrast actually works

Every text color was checked with [WCAG's contrast
formula](https://www.w3.org/TR/WCAG21/#contrast-minimum). All of them
clear WCAG AA for normal-size text (4.5:1):

Most text sits on the deeper teal (`#123c3e`):

| Color | Used for | Contrast |
|---|---|---|
| `--ink` (`#ede8e0`) | Headings and primary text | 9.89:1 |
| `--ink-dim` (`#d4d1cd`) | Paragraphs and secondary text | 7.92:1 |
| `--ink-faint` (`#c2beb9`) | Small labels — the footer | 6.52:1 |
| `--accent` (`#a5b9f3`) | Headings like "Experiences", links on hover | 6.22:1 |

The lighter band at the top (`#286a6d`) is a lighter background, so
text on it uses its own, lighter set of the same colors — set on
`.stage` in `style.css`. With the standard colors, everything but the
headings would fall below 4.5:1 there.

| Color on the band | Used for | Contrast |
|---|---|---|
| `#f5f2ec` | Case titles, detail values | 5.57:1 |
| `#e8e5e1` | "Index" link, "Showreel and experiences ↓" | 4.96:1 |
| `#e0ddd8` | Role / Year / Tools / Tags labels | 4.60:1 |
| `#d3ddfb` | Link hover color | 4.60:1 |

Because these sit so close together, the text hierarchy on the band
comes mostly from size and weight rather than color. The case number
("CASE_001") would have been a very pale blue there, so it's instead a
small white chip with Signal Blue text, matching the white cards and
blue tags elsewhere.

Inside the white cards:

| Color | Used for | Contrast |
|---|---|---|
| Signal Blue (`#2f5de3`) | Tags, the case-number chip; white text on the Contact button | 5.53:1 |
| `#6b6660` | Faint text inside cards (dates, case numbers) | 5.68:1 |

The placeholder text in empty media frames ("add preview") is lighter
(3.65:1) on purpose, since it's temporary and disappears once you add
an image.

### Why the cards need their own colors

`style.css` redefines the text colors inside `.case-card` and
`.intro__cv`:

```css
.case-card,
.intro__cv {
  --ink: #14110f;
  --ink-dim: #4a4642;
  --ink-faint: #6b6660;
  --accent: var(--signal-blue);
  --line: rgba(20, 17, 15, 0.14);
}
```

CSS custom properties cascade, so everything inside a case card or the
CV card picks up these dark values automatically. Add a new element
inside either card and it gets dark, legible text for free; add one
directly on the page background and it gets the light version.

---

## 4. Editing the text that's already there

Open any `.html` file in a plain text editor (VS Code, Notepad, TextEdit —
anything that edits plain text, **not** Word). Find the words you want to
change and type over them. HTML "tags" (the bits in `< >`) are the
formatting — leave those alone, just change what's between them.

For example, in `index.html` you'll find:

```html
<h3 class="case-card__title">Neon Static</h3>
```

Change `Neon Static` to your project's name and save. That's it.

---

## 5. Your header

The top of `index.html` is your landing screen: the logo on the left
with a short bio underneath, and a profile card on the right with your
portrait, role, location and contact details.
Look for the `<header class="masthead">` block and edit:

| What to change | Where |
|---|---|
| Logo | see "The logo: one image, two artworks" below |
| Portrait | `images/sahil-profile.webp` and `images/sahil-profile.jpg` (see below) |
| Bio | `<p class="masthead__bio">…</p>` — keep it to about 40–50 words (see below) |
| Name | `<p class="profile-card__name">Sahil Singh</p>` |
| Role | `<p class="profile-card__role">Motion designer and 3D artist</p>` |
| Location | `<p class="profile-card__place">Based in Oslo</p>` |
| Email | the `mailto:sahil_singh98@hotmail.com` link |
| Phone | the `tel:+4740140423` link |
| Showreel | the "Watch showreel" link: it scrolls to the reel and starts it (see "Play the reel from a link" in Section 6) |

Each contact line in `.profile-card__contact` is a small block with a
label (`<dt>`) and the link (`<dd>`):

```html
<div>
  <dt>Email</dt>
  <dd><a href="mailto:sahil_singh98@hotmail.com">sahil_singh98@hotmail.com</a></dd>
</div>
```

Copy one to add another (an Instagram or LinkedIn, for instance).
Keep the visible text short: the card is only one column wide.

### Breakpoints

A breakpoint is a window width where the layout changes. The homepage
has exactly two:

| Width | What changes |
|---|---|
| **1012px** | 3 columns → 2. Case cards, the landing screen (logo + bio beside the card), and the reel + CV row (reel two columns, CV one) all switch here. The full-screen sections and their links also start here. |
| **684px** | 2 columns → 1. The same things stack, and the logo switches between the full banner and the phone version. |

They aren't arbitrary. The grid's columns are at least 300px wide with
a 1.75rem gap and 1.75rem of padding on each side, so three columns
need 3 × 300 + 2 × 28 + 2 × 28 = 1012px and two need 2 × 300 + 28 +
2 × 28 = 684px. The case grid works this out for itself (its columns
are `auto-fill`); the landing screen and the reel row can't, so those
two numbers are written into their media queries. **If you ever change
the column minimum (300px), the gap or the side padding, change all
the `1012` and `684` values in `style.css`, in the `media=` attributes
of the logo `<picture>` sources on every page, and in
`assets/logo-motion.js`** — search for each number. The case pages have
their own single-column layout (900px wide) and don't use the grid,
but they switch the logo at 684px too, so it never changes at a
different width from the homepage.

There are two smaller changes that aren't layout: the side padding
drops from 1.75rem to 1.25rem below 640px, and the time readout in the
reel's controls is hidden below 420px.

### The landing screen and the grid

The header uses the same grid as the case cards (columns at least
300px wide, 1.75rem apart), so the profile card is always exactly as
wide as one case card:

- **1012px and wider (three columns):** the header fills the first
  screen. The logo and the bio span columns 1–2 and the card sits in
  column 3. The bio's last line sits exactly on the card's bottom
  edge, and the logo is centered in the space between the card's top
  edge and the bio. The logo scales with the column width, so
  the balance holds at any screen size. A small "Showreel and
  experiences ↓" link at the bottom left jumps down to the next
  screen.
- **684–1011px (two columns):** the logo sits at the top, with the
  card below it in the right-hand column and the bio beside the card
  on the left, bottom-aligned with it.
- **Under 684px (one column):** logo, then bio, then the card at full
  width.

**About the bio's length.** On the landing screen the bio spans the
two left-hand grid columns (two thirds of the grid, the same width as
two case cards). The logo centers itself automatically in the space
between the top of the card and the top of the bio, so you can edit
the bio freely and the balance holds. Keep it to about four lines,
though: much longer and it starts to crowd the logo on short laptop
screens.

To change the logo's size on the landing screen, find
`.masthead .masthead__logo` in the `@media (min-width: 1012px)` block
of `style.css`. The last number in `--logo-gw` (`0.86`) is how much of
the two left-hand columns the lettering fills: raise it for a bigger
logo, lower it for a smaller one. Much above 0.9, the ribbon's upper
arm starts to run into the card.

### The profile card

A square portrait on top, then your role and location, then the
contact details as labeled rows.

**To replace the portrait:** use a square image at least 700px wide
(the card shows it at up to about 410px, and high-resolution screens
need more pixels than that to look sharp — the current photo is 563px,
which is fine but not crisp on phones). Save it as both
`images/sahil-profile.webp` and `images/sahil-profile.jpg`, and update
the `width`/`height` on the `<img>` tag.

### The animated logo

The logo is a looping animation with a transparent background, in two
versions — the full banner on screens 684px and wider, and a separate
animation made for phones. All the files are in `images/`:

| File | What it is |
|---|---|
| `sahil-logo-motion-ss02.mp4` | the animation, wide framing (2000 × 1000 shown, 4 s loop, 1.2 MB) |
| `sahil-logo-motion-mobile-ss04.mp4` | the phone animation (1200 × 470 shown, 4 s loop, 0.59 MB) |
| `sahil-logo-still-ss02.webp` | first frame of the wide animation, as an image |
| `sahil-logo-mobile-still-ss04.webp` | first frame of the phone animation, as an image |
| `sahil-logo-ext.webp` | the ribbon's extended tail and upper arm (wide screens only), still, with a hole where the animation plays |

**How the transparency works.** Normal MP4 video can't be see-through,
but it plays in every browser, Safari and iPhone included. So each
video file holds two pictures stacked on top of each other: the logo's
colors in the top half, and its transparency as a black-and-white
picture in the bottom half (white = solid, black = see-through). If
you open one of the MP4s you'll see exactly that. `assets/logo-motion.js`
plays the video out of sight and recombines the two halves onto a
`<canvas>` in the header using the graphics card (WebGL), frame by
frame. The result is a transparent animation in every browser.

On wide screens three layers stack inside `<span class="logo-motion">`:
the still ribbon extensions, which let the ribbon run off the top and
left edges of the window; the first-frame still; and the animation on
top. Where the ribbon crosses from the extension into the animation,
the two cross-fade over a short distance, so there's no visible join.

The script also picks the right file for the screen size, swaps it if
the window is resized across 684px, and pauses the animation while the
logo is scrolled out of view. The still stays in place instead of the
animation for visitors with "reduce motion" turned on in their system
settings, and on the rare device without WebGL. Because the still is
the animation's first frame, there's no visible jump when it starts.

**Previewing on your own computer.** Browsers block the recombining
step for pages opened straight from your hard drive — see Section 2,
"Previewing the site," which covers this once for the whole site. If
you double-click `index.html` you'll see the still logo instead of the
animation; it plays as soon as the site is on a local server or a real
host.

**The phone version.** Its ribbon runs from the left edge of the frame
to the right edge (the banner's runs off the top and left instead), so
on phones the logo is simply centered and runs the full width of the
screen, edge to edge, with the ribbon leaving the screen on both
sides. The frame is cropped to 1200 × 470 around the lettering, which
makes the lettering about 80% of the screen width. It uses the same
file setup as the banner (colors in the top half of the MP4,
transparency in the bottom half). In `style.css` the edge-to-edge
effect is `.masthead__logo` cancelling the page's side padding
(`--edge`); to make the logo bigger or smaller on phones you would
re-crop the animation rather than change the CSS.

**Current versions:** the banner is built from `Porfolio_logo_SS02.webm`
and the phone version from `Porfolio_logo_SS04.webm`.

**Replacing the animation.** Export the new loop at the same framing
as the current one (2000 × 1000, logo in the same place, transparent
background — WebM with alpha or ProRes 4444 both work) and send it to
me: I'll build the stacked MP4s and the stills from it. The ribbon has
to meet the top and left edges of the frame where it does now (about x
1645 at the top, y 870 at the left) or the joins with the still
extensions won't line up.

**Replacing the phone animation** works the same way: 2000 × 1000,
transparent, the ribbon leaving the frame at the left and right edges,
and nothing touching the top or bottom edge. **Check that the export
really contains transparency** before sending it: a WebM without alpha
looks fine in a video player but has a solid black background. (The
first phone file had this problem. `ffprobe` shows a line
`alpha_mode=1` for files that have it.)

**Positioning (wide screens).** In `style.css`, find `.masthead__logo`
inside the `@media (min-width: 684px)` block. It's placed with three
values: `--logo-gw` (how wide the lettering is), `--logo-gx` and
`--logo-gy` (where the lettering's left and top edges go). The
multipliers next to them (`4.23537`, `2.85366`, `1.78049`) describe
where the lettering sits inside the 3473 × 2484 layered artwork, and
`0.2073` on the landing screen centers it vertically. They only change
if the artwork's framing does.

**Case pages.** There the logo links back to the homepage. Because
the wide logo is mostly transparent, it ignores clicks itself, and an
invisible box over the lettering is the clickable area instead —
`.case-topbar__logo-link::after` in `style.css`.

The logo markup is repeated in every HTML file (`index.html` and each
file in `cases/`), along with the `<script src="…logo-motion.js">`
line at the bottom of the page.

### Headings, not just styling

The logo sits inside an `<h1>` in `index.html` — that's
deliberate, not incidental markup. A page needs exactly one `<h1>`
establishing what the page is about, and since your brand name lives
entirely in the logo image rather than as text anywhere else on the
page, wrapping the logo in `<h1>` is the standard way to give the page
that heading without adding text that would just duplicate the logo.
Don't remove this wrapper or add a second `<h1>` elsewhere on the page.
Don't wrap the `<picture>` in a `<div>` — headings are only allowed to
contain inline-level content, and `<div>` is block-level.

If you ever add a new section to the homepage with its own title
(something at the same level as "Experiences" or "Selected Works"),
give that title an `<h2>` tag, not a `<p>` — even if you want it
styled small, like the existing eyebrows. Tag choice and font size are
independent: `<h2 class="hero__eyebrow">` renders exactly the same as
`<p class="hero__eyebrow">` visually (the CSS doesn't care which tag
it's attached to), but only the `<h2>` version tells a screen reader or
search engine that this text is a section heading. The class controls
what it looks like; the tag controls what it *is*.

---

## 6. The reel + CV row

Right after the landing screen, before the case grid, is a row under
one shared heading, "Experiences": your showreel and a short "recent
experience" CV card with two buttons. It follows the same grid as the
case cards, so on a wide screen the reel is two columns wide and the
CV card is one — exactly as wide as a case card and the profile card
above (see "Breakpoints" in Section 5). The reel keeps its own 16:9
shape and the CV card is as tall as its content needs to be; the two
line up at the top. It's already live and working — this section
explains how to keep it up to date.

### The showreel player

The reel is your own video file, played by a small custom player
instead of a Vimeo embed, so there's no Vimeo branding or extra
buttons — just play/pause, a time readout, a scrub bar, mute and full
screen. The files live in `videos/`:

- `showreel.webm` — the reel, first choice (1920×1080, VP9 + Opus,
  25 fps, about 5.8 Mbps, 60 s, 43.3 MB). Chrome, Edge, Firefox and
  recent Safari play this one.
- `showreel.mp4` — the same reel as H.264 + AAC (about 2.5 Mbps,
  19.8 MB). Browsers that can't play the WebM fall back to this.
- `showreel-poster.webp` — the still shown before it plays (the very
  first frame of the reel, 0:00)

The browser takes the first `<source>` in the `<video>` tag that it can
play, so the order matters. To serve only the MP4 (half the download
size), delete the `<source ... showreel.webm ...>` line.

Visitors download nothing but the poster until they press play.

**How it behaves:**
- Before playing, a large round play button with a drop shadow sits
  over the poster.
- Clicking the video itself also plays and pauses.
- **Scrubbing:** click or drag the bar to jump anywhere. While the bar
  is held, the film waits where it is and carries on when it's let go.
  The bar stops one second short of the end, so a scrub can never end
  the film by accident (the film still ends normally when it plays to
  its last frame, and returns to the poster). For jumping around in a
  video, a browser needs the server to support "range requests" (it
  asks for a piece of the file at a time). Every real web host does,
  and so do Live Server and `npx serve`. If the server doesn't (for
  instance `python -m http.server`), the first scrub downloads the
  whole film into memory and the bar pulses until it's ready, after
  which scrubbing works normally. Without that, every jump would send
  the film back to the start.
- While playing, the controls fade out after 2.5 seconds without
  mouse movement (the cursor hides too) and come back when the mouse
  moves. They stay visible while a keyboard user is on them, or while
  a finger is on the scrub bar.
- **On a phone or tablet,** the controls fade out after 3.5 seconds.
  While they're hidden, a tap only brings them back: it doesn't pause
  the film or press a button you can't see. The next tap then does
  what you tap. (Fullscreen is therefore one tap while the controls
  are showing, or two if they've faded.) On an iPhone, fullscreen hands
  the film to the phone's own player, since iPhones don't allow a web
  page to take over the screen itself.
- Keyboard, with focus on the player: space or K plays/pauses, ← and
  → jump 5 seconds, M mutes, F goes full screen.
- When it finishes, it returns to the poster and play button.
- Full screen takes the whole player, custom controls included. On
  iPhone, Safari only allows the video itself to go full screen, so
  there you'll see Apple's own controls in full screen.
- Without JavaScript, the browser's standard video controls show
  instead, so the reel always plays.

**To replace the reel:** export the new version and save it as
`videos/showreel.webm` and `videos/showreel.mp4` (same names, so
nothing else needs to change). Keep both files in sync, since
different visitors get different ones.
Recommended export: 1920×1080, H.264 MP4, your master's frame rate,
roughly 2.5–8 Mbps, AAC audio, with "fast start" / "web optimized"
turned on so it starts playing before it has fully downloaded.
If you change the aspect ratio from 16:9, also change `aspect-ratio`
in `.reel__frame` in `style.css`, and `width`/`height` on the
`<video>` tag.

**To change the poster:** replace `videos/showreel-poster.webp` with
any 1920×1080 image. To pull a frame straight from the video with
ffmpeg (here at 12 seconds):

```
ffmpeg -ss 12 -i videos/showreel.mp4 -frames:v 1 poster.png
```

then save it as WebP (or save as JPG and update `poster="..."` on the
`<video>` tag).

**Hosting:** the video is served by whatever hosts the site. Netlify,
Vercel, Cloudflare Pages and GitHub Pages all handle video properly.
Each full view downloads the whole file (about 43 MB for the WebM,
20 MB for the MP4), so check your host's monthly bandwidth allowance. GitHub Pages refuses single files
over 100 MB.

### The reel expands when played

On screens 684px and wider, the reel grows to fill the whole row while
it plays. The CV card is never resized or squeezed: it stays exactly
where it is, the reel grows over the top of it (the reel is stacked
above), and the card fades out and is then hidden. On pause the reel
shrinks back and the card fades back in as it's uncovered. (Behind the
scenes the reel's width goes up by exactly as much as the card's left
margin goes down, so the card doesn't move; see the comment above
`@media (min-width: 684px)` in the reel section of `style.css`.) On
phones, where the reel and the card are stacked, nothing happens to
the card while the reel plays: it just stays below the video.

At the same time, the rest of the page (masthead, "Selected Works",
the case grid, footer) dims under a 50% black overlay, so the video is
the only thing at full brightness. Pause or finish it and everything
reverses. The player script at the bottom of `index.html` does this by
toggling an `is-playing` class on both `#intro` (grows the reel, hides
the CV card) and `<body>` (fades in the overlay), and an `is-changing`
class on `#intro` for half a second around each change, which is what
switches the animation on (so resizing the window never animates).

The dimming layer is a single empty `<div class="cinema-overlay">`
sitting right after the opening `<body>` tag, styled in `style.css` to
sit fixed over the whole viewport. It's visual only — it doesn't block
clicks or scrolling on whatever's underneath it, so the rest of the
page stays usable while the video plays.

To turn the dimming off entirely and just keep the reel-expands
behavior, delete the `.cinema-overlay` rule and the `body.is-playing
.cinema-overlay` rule from `style.css`, and remove the `<div
class="cinema-overlay">` line from `index.html`.

### Click your way down the page

From 1012px wide, the homepage is built as screens, each with links
so visitors can click their way through instead of scrolling:

1. **The landing screen** — logo, bio and profile card. Bottom left:
   "Showreel and experiences ↓".
2. **Experiences** — reel and CV. Bottom left: "Works and cases ↓".
   Top right: "Back to top ↑".
3. **Selected Works** — the case grid, with the footer directly under
   it. Top right: "Back to experiences ↑". Bottom left: "Back to top ↑".

The links (class `cue` in the HTML and `style.css`) point at the `id`
of the section they lead to: `#start` for the top of the page,
`#intro` for Experiences and `#works` for Selected Works. All of them
land with the target section exactly at the top of the window. The
links in Experiences fade out while the reel plays, so they don't sit
over the video.

**Keeping each screen inside the window.** The landing and Experiences
screens are meant to be exactly one window tall, so the "↓" link is
always visible. That depends on the window's *height* as much as its
width, so on short windows (say a 1366 × 768 laptop, which leaves
about 625px once the browser's toolbars are counted):

- the spacing above and below the content shrinks in proportion to
  the window's height (`--screen-pad-top`, `--cue-gap` and
  `--screen-pad-bottom` at the top of `style.css`);
- the portrait on the landing screen is cropped a little, not
  squashed;
- the CV card tightens its spacing and line height;
- while the reel plays, it fills the row but is never taller than the
  space above the link.

Both screens fit windows down to about 550px tall. Below that there
simply isn't room for all that content, so the section grows a little
past the window and the "↓" link sits just below the fold, where one
small scroll reaches it. The link deliberately isn't "sticky": an
earlier version pinned it to the bottom of the window, which made it
follow you while you scrolled between screens and behave differently
from every other link.

On screens narrower than 1012px the sections are their natural height,
the links are hidden, and the page just scrolls.

### Play the reel from a link

The "Watch showreel" link in the profile card scrolls to the reel and
starts it, with sound. It's an ordinary link with one extra attribute:

```html
<a href="#intro" data-play-reel>Watch showreel</a>
```

Any link on the homepage with `data-play-reel` and `href="#intro"` does
the same. Browsers only allow video to start with sound straight after
a click or tap, which is why this works from a link but the reel can't
start by itself when the page opens. If a browser blocks it anyway, the
reel starts muted. If the reel is already playing, the link just
scrolls to it. Without JavaScript it still scrolls there, and the
browser's own play button is showing.

### Jump links and the mouse pointer

When you click a jump link, the page glides to the next screen while
the mouse pointer stays where it was. On some window sizes the first
case card ends up under that still pointer, and it used to lift by
itself as if it had been hovered. So right after any jump link is
clicked, the case cards ignore hover until the mouse really moves
(`html.is-jumping`, set by the small script at the bottom of
`index.html` and used by the case-card hover rule in `style.css`).
Keyboard focus on the cards is unaffected.

### Smooth scrolling

Jump links like these glide to their target instead of jumping. This is the
`scroll-behavior: smooth` rule near the top of `style.css`. It's
switched off automatically for visitors who have turned on "reduce
motion" in their system settings. To add another jump link, give the
target an `id` and link to it with `href="#that-id"`.

### Updating your experience list

Each role in `.cv__list` is one `<li>`:

```html
<li>
  <span class="cv__role">Motion Designer</span>
  <span class="cv__org">SDG / TBWA</span>
  <span class="cv__years">2020 — Present</span>
</li>
```

Copy/edit/delete `<li>` blocks the same way you would a case card. This
list is meant to stay short (3–5 roles) — it's a highlight reel of your
CV, not the whole thing; that's what the Full Resume button is for.

### The shared headline

`<h2 class="intro__eyebrow">Experiences</h2>`, right at the top of this
section in `index.html`, is the one heading that sits above both
columns. Change the text there to relabel the whole row.

### The two buttons

- **Contact** — currently a `mailto:` link straight to your email. Edit
  the address in the `href`.
- **Full Resume** — downloads the PDF in `files/`. To replace it with
  an updated resume, put the new PDF in the `files/` folder and update
  the `href` in `index.html` to match its filename; the `download`
  attribute is what makes it save instead of opening in the browser.

**Why the button text is centered the way it is.** Fonts reserve space
below the baseline for descenders (g, p, y), which all-caps text never
uses, so caps normally sit a little high inside a button. The `.btn`
rule in `style.css` trims the text to its cap height using `text-box`
(supported in current Chrome, Edge and Safari), which centers the caps
exactly. Older browsers fall back to a small manual offset,
`--btn-nudge` — raise it if text looks high in those, lower it if it
looks low. Both buttons also share an (invisible, on Contact) 1px
border so they're exactly the same height.

---

## 7. Changing the look (colors, fonts, spacing)

Everything visual is controlled from **one place**: the top of
`assets/style.css`, inside the `:root { ... }` block. Because every
page links to this same file, one edit updates the whole site.

```css
:root {
  --licorice: #14110f;
  --paper: #ffffff;
  --signal-blue: #2f5de3;
  --ash: #8a8580;

  --bg: #286a6d;                 /* top band (landing, case header) — teal */
  --bg-deep: #123c3e;            /* everything below it — deeper teal */
  --surface: var(--paper);       /* card background */
  --ink: #ede8e0;                /* primary text on the deeper teal */
  --ink-dim: #d4d1cd;            /* secondary text on the deeper teal */
  --ink-faint: #c2beb9;          /* small labels on the deeper teal */
  --accent: #a5b9f3;             /* Signal Blue, tinted light for the deeper teal */

  --font-display: "Archivo Narrow", ...;   /* labels — stand-in for Akzidenz-Grotesk BQ Condensed */
  --font-body: "IBM Plex Sans", ...;       /* paragraphs and headings */

  --page-width: 1100px;          /* the homepage frame */
}

/* Text INSIDE a white card uses dark values instead —
   see "Why the cards need their own colors" in Section 3. */
.case-card,
.intro__cv {
  --ink: #14110f;
  --ink-dim: #4a4642;
  --ink-faint: #6b6660;
  --accent: var(--signal-blue);
}
```

**About the label font.** Your logo's watermark type is set in
Akzidenz-Grotesk BQ Condensed Medium — a commercial font that isn't
available through Google Fonts, so it can't be linked into a plain HTML
site the way the other fonts here are. This build uses **Archivo
Narrow** instead, a free condensed grotesque with a similar tall,
tight, no-nonsense character. If you own a license for Akzidenz-Grotesk
BQ (as font files — `.woff2` is ideal):

1. Put the font file(s) in a new `fonts/` folder next to `index.html`.
2. Add this near the top of `style.css`, before the `:root` block:
   ```css
   @font-face {
     font-family: "Akzidenz-Grotesk BQ Condensed";
     src: url("fonts/AkzidenzGroteskBQ-CondMedium.woff2") format("woff2");
     font-weight: 600;
   }
   ```
   (adjust the filename to whatever your font file is actually called)
3. Change `--font-display` to:
   ```css
   --font-display: "Akzidenz-Grotesk BQ Condensed", "Archivo Narrow", sans-serif;
   ```
   Archivo Narrow stays listed as a fallback in case the font file
   fails to load.

**To change a color:** edit the hex value in `:root`. Signal Blue
inside cards comes from `--signal-blue`; text on the page background
uses the separate light tints (`--accent`, `--ink-dim`, etc.), because
the full-strength colors don't have enough contrast against the teal.
If you change `--bg` or `--bg-deep`, re-check every row of the table in **Section 3**
with [WebAIM's contrast
checker](https://webaim.org/resources/contrastchecker/) — blue and teal
are close in hue, so the accent tint is the first thing to fail. Also
update `<meta name="theme-color">` in each HTML file, which tints the
browser bar on phones.

**To change the page width:** `--page-width` sets the homepage frame.
Case pages have their own widths in the "Case detail pages" part of
`style.css` (`max-width: 900px` on `.case-topbar`, `.case-header`,
`.case-visual` and `.case-nav`; `700px` on `.case-body`). If you change
the 900px topbar width, also change the two `900px` values in
`--logo-shift`, and the `100px` there to the difference between
`--page-width` and the new topbar width, or the logo will drift on case
pages.

**To change the space between sections:** `--section-gap` at the top
of `style.css` (currently `clamp(6rem, 14vw, 8rem)`, which means 6rem
on phones growing to 8rem on wider windows). It's the total gap
between the content of two neighbouring sections, on the homepage
(stacked layouts, and above the "Selected Works" heading, and between
the last case card and the footer) and on the case pages (around the
hero image and above the previous/next links). Where the background
changes colour, the gap is split in half on either side of the colour
edge. Raise the numbers for an airier page, lower them for a tighter
one. On wide screens (1012px and up) the landing and Experiences are
full-screen sections whose spacing comes from the window's height
instead (`--screen-pad-top` and friends, see Section 6), so they
aren't affected.

**To change fonts generally:** the site loads its fonts from Google
Fonts (linked in the `<head>` of every HTML file). To swap one, pick a
font from [fonts.google.com](https://fonts.google.com), replace the
Google Fonts `<link href="...">` line in **every** HTML file with the
new one, and update the matching `--font-...` variable in `style.css`.

### The type scale

Every text size on the site comes from one of seven variables, defined
near the top of `style.css` right after the colors. Their names
describe a *size tier*, not a specific HTML tag — `--text-h2` is "the
second-largest size," and it's used by both an actual `<h2>` and by
the case card titles, which are `<h3>` (see **Section 5 → "Headings,
not just styling"** for why tag and size are kept independent on
purpose):

| Variable | Size | Used for |
|---|---|---|
| `--text-display` | ~36–52px, scales with screen width | The one big heading per page — case titles |
| `--text-h2` | 24px | Second-largest size — case card titles |
| `--text-h3` | ~19px | In-body subheadings, like "The problem" |
| `--text-lead` | 18px | Intro-line paragraphs — your role line, the hero tagline |
| `--text-body` | 16px | Running paragraph text and emphasized list items (CV roles) |
| `--text-body-sm` | 15px | Secondary/supporting text — descriptions, org names |
| `--text-label` | 14px | Every small tracked-out caps/meta string — case numbers, tags, nav links, footer, dates |

Before this, the site had 27 separate hand-picked font sizes (0.7rem
through 1.4rem) with no consistent logic between them, which is why it
read as uneven. Every text element on the site now points at one of
these seven variables instead of having its own number — change a
variable here and every element using that tier updates together.

There's also one shared `--tracking-label` variable (`0.08em`) for the
letter-spacing on every label-tier element, replacing what used to be
five slightly different values (0.04em through 0.14em) scattered
around the file.

**To make a specific tier bigger or smaller everywhere:** change its
variable — e.g. `--text-label: 0.875rem;` → `0.9375rem` makes every
case number, tag, and nav link on the site a bit bigger at once.

**To change one single element without affecting its whole tier:** find
that element's own rule in `style.css` (e.g. `.case-card__arrow`) and
replace `font-size: var(--text-label);` with a specific value like
`font-size: 0.9rem;` — this breaks it out of the shared system, so only
do this when an element genuinely needs to differ from its peers.

**To change spacing:** search `style.css` for `padding` or `margin`
values (they're in `rem` units — think of `1rem` ≈ the height of a
line of text) and adjust numbers up or down.

**To change the corner radius:** there's one variable, `--radius`, used
everywhere a card or media frame is rounded. Turn it up for softer
cards, down (or to `0`) for sharp corners.

---

## 8. Adding a new case (the main workflow)

The Case Page Builder tool does everything below for you — fill in a
form, get a live preview, and download the finished HTML. This section
is the manual, by-hand version of the same workflow, useful if you'd
rather edit the files directly or don't have the tool handy.

Two things you *don't* need to do any more, because they're both
automatic (see "How this works" below): copy a card onto the homepage,
or pick which cases a new page's Prev/Next links should point to.

Say you finished a new project and want to add it.

### Step 1 — Duplicate the template

Copy `cases/template.html` and rename the copy to something readable,
like `cases/chrome-orbit.html`. (You can also duplicate an existing
case file like `case-01.html` if you want to start from filled-in
content instead of a blank template.) The file no longer needs to
follow a `case-0X.html` numbering scheme — any name is fine, as long
as it matches what you put in the manifest in Step 3.

### Step 2 — Fill in the new file

Open your new file and edit these parts:

| What to change | Where |
|---|---|
| Browser tab title | `<title>CASE TITLE — Sahil</title>` |
| Big heading | `<h1 class="case-header__title">Case Title</h1>` |
| Role / Year / Tools / Tags | the four `<dd>` lines under `<dl class="case-meta">` |
| Hero image or video | the `<div class="case-visual__frame">` block — see **Section 9** |
| Body text | the paragraphs inside `<article class="case-body">` |

Leave `<nav class="case-nav"></nav>` empty — that's filled in
automatically (see below).

### Step 3 — Add one entry to the manifest

Open `cases/manifest.json`. It's a plain list, one entry per case, in
the order they should appear — both on the homepage grid and as the
Prev/Next chain on each case page (each case's neighbors are simply
the entries next to it in this list, wrapping around at the ends).
Add a new entry for your case, anywhere in the list:

```json
{
  "file": "chrome-orbit.html",
  "title": "Chrome Orbit",
  "desc": "A chrome-and-glass identity system for a hardware launch.",
  "tags": ["Product", "3D", "Branding"],
  "media": { "type": "placeholder" }
}
```

Make sure `"file"` matches the filename from Step 1 exactly (just the
filename — no `cases/` in front of it). Don't forget the comma between
entries if you're adding this in the middle of the list.

For the preview image or video (the `"media"` part), see **Section
9**.

That's the whole workflow: duplicate a file, edit the text, add one
manifest entry. The homepage card and this case's Prev/Next links (and
its neighbors' Prev/Next links, since they now point at it too) all
update themselves — nothing else to touch.

### How this works

`assets/cases.js` reads `cases/manifest.json` and uses it to build the
homepage's case grid and every case page's Prev/Next nav, in the
visitor's browser. This is the one part of the site that needs a real
local server to preview — see **Section 2**.

### Removing a case

Delete its entry from `cases/manifest.json` and delete the file from
`cases/`. Nothing else needs updating — the cases on either side of it
now link to each other automatically.

### Reordering cases

Move its entry to a different position in `cases/manifest.json`. The
homepage grid and every affected Prev/Next link update to match.

---

## 9. Adding a preview image or video to a case


There are two media spots per case: the small **preview** on its
homepage card, and the larger **hero** at the top of its own page. Both
work the same way. Since a motion reel is often exactly this — clips,
not just stills — video works well in both spots.

### Step 1 — Add your files

Put your files in the `images/` folder (next to `index.html`) — photos
as `.jpg`/`.png`, clips as `.webm`.

### Step 2 — Homepage card preview

In `cases/manifest.json`, find the case's entry and fill in its
`"media"` field, which starts out as just a placeholder:

```json
"media": { "type": "placeholder" }
```

**For an image**, use:

```json
"media": { "type": "image", "src": "images/case-01-preview.jpg", "alt": "Neon Static preview" }
```

**For a looping video** (silent, autoplays, no controls — the usual
portfolio-preview style), use:

```json
"media": {
  "type": "video",
  "src": "images/case-01-preview.webm",
  "mime": "video/webm",
  "poster": "images/case-01-poster.jpg"
}
```

`"poster"` shows for a moment before the video loads — optional, but
recommended. `"mime"` should match the file: `"video/webm"` for
`.webm`, `"video/mp4"` for `.mp4` (it defaults to `"video/mp4"` if you
leave it out).

### Step 3 — Case page hero

Same idea, inside `cases/case-01.html` — find `<div class="case-visual__frame">`
and swap its placeholder `<span>` for an `<img>` or `<video>` the same
way. The only difference is the file path needs an extra `../` since the
case page lives one folder deeper than `index.html`:

```html
<img src="../images/case-01-hero.jpg" alt="Describe the image">
```

Both spots are already sized and cropped for you (4:3 on cards, 16:9 on
case pages, rounded corners, `object-fit: cover`) — just drop in the tag
and the media fills the frame.

---

## 10. Quick troubleshooting

- **My new case page has no styling / looks like plain text.**
  Check the `<link rel="stylesheet" href="...">` path at the top of the
  file. Files inside `cases/` need `../assets/style.css` (with `../`);
  `index.html` needs `assets/style.css` (no `../`). The same rule applies
  to `images/` paths in `<img>`/`<video>` tags.
- **My homepage grid (or a case's Prev/Next) is empty / shows a
  "couldn't load" message.**
  Almost always means the page was opened straight from disk instead
  of through a local server — see Section 2, "Previewing the site."
  If you *are* using a server, check that `cases/manifest.json` is
  valid JSON: a missing comma between entries is the most common
  cause. Any JSON validator (search "JSON validator," paste the file
  in) will point at the exact problem.
- **My homepage card doesn't link anywhere, or shows the wrong
  title/tags.**
  Check the case's `"file"` value in `cases/manifest.json` matches the
  real filename exactly (just the filename, no `cases/` in front of
  it), and that the rest of that entry is filled in the way you want.
- **My video doesn't play automatically.**
  Browsers only autoplay video that's muted — make sure the `<video>`
  tag has both `autoplay` and `muted`.
- **I broke the layout while editing.**
  Undo your last change and try again — HTML is picky about matching
  opening and closing tags (`<div>` needs a `</div>`, etc.). It's safest
  to only edit the *text*, not the tags around it.
- **Rounded corners look blocky/pixelated while scrolling, then sharpen
  up once scrolling stops.** This is a known Chrome/Safari rendering
  bug, not something wrong with your edit — it shows up on elements
  that combine `border-radius`, `overflow: hidden`, and a hover
  animation (the case cards, mainly). It's already worked around with
  a `-webkit-mask-image` rule on `.case-card`, `.reel__frame`, and
  `.case-visual__frame` in `style.css` — if you add a new element with
  that same combination (rounded corners + clipped content + an
  animation) and see the same blockiness, copy that same
  `-webkit-mask-image: -webkit-radial-gradient(white, black);` line
  onto it.

---

## 11. Link previews and icons

When someone pastes your site's link into LinkedIn, Slack, iMessage or
email, those apps show a preview card using the `og:` tags in the
`<head>` of each page:

```html
<meta property="og:title" content="Sahil — Motion designer &amp; editor, Oslo">
<meta property="og:description" content="...">
<meta property="og:image" content="images/og-image-ss02.jpg">
```

**One thing to do once the site is online:** most preview services
ignore relative paths, so change `og:image` in every HTML file to the
full address, e.g. `https://your-domain.com/images/og-image-ss02.jpg`
(the case pages currently say `../images/og-image-ss02.jpg`, which should
become the same full address). `og-image-ss02.jpg` is 1200 × 630, the size
these services expect; swap in a still from your reel if you prefer.

The browser-tab icon is `images/favicon-32.png` and the phone
home-screen icon is `images/apple-touch-icon.png` (180 × 180). They're
a simple white condensed "S" on the teal — replace them with your own
at the same sizes if you have a mark you'd rather use.

