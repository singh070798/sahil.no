#!/usr/bin/env python3
"""Apply seo.json to the site and build sitemap.xml.

    python3 scripts/apply_seo.py SOURCE OUTPUT
    python3 scripts/apply_seo.py . _site

Copies the site from SOURCE to OUTPUT, then, in the copy only:
  - sets each page's <title>, description, link-preview tags (og:*),
    canonical address and preview image from seo.json;
  - writes sitemap.xml listing every page.
The files in SOURCE are never changed. GitHub runs this on every push
(.github/workflows/deploy.yml) and publishes OUTPUT; you can run it
yourself to check the result. Standard library only, Python 3.8+.
See README.md → "Titles and descriptions (seo.json)".
"""
import html
import json
import os
import re
import shutil
import sys

SKIP_DIRS = {".git", ".github", "scripts", "_site", "node_modules"}
SKIP_FILES = {"seo.json"}
# system files that end up in folders on Windows and Mac; never published
SKIP_ANYWHERE = {"desktop.ini", "Thumbs.db", ".DS_Store"}

warnings = []


def warn(msg):
    warnings.append(msg)
    # GitHub shows lines like this as yellow warnings on the run's page
    print("::warning::" + msg if os.environ.get("GITHUB_ACTIONS") else "warning: " + msg)


# ---------------------------------------------------------------- setup
def load_config(src):
    path = os.path.join(src, "seo.json")
    try:
        with open(path, encoding="utf-8") as f:
            cfg = json.load(f)
    except json.JSONDecodeError as e:
        # Stop here: publishing with a broken seo.json would quietly undo
        # every title. The site that's already live stays as it is.
        sys.exit("seo.json isn't valid JSON: %s (line %d, column %d). Nothing was published."
                 % (e.msg, e.lineno, e.colno))
    cfg.setdefault("pages", {})
    cfg["site"] = cfg.get("site", "").rstrip("/")
    if not cfg["site"].startswith("http"):
        sys.exit('seo.json needs "site", the full address, like "https://sahil.no".')
    return cfg


def copy_site(src, out):
    if os.path.abspath(src) == os.path.abspath(out):
        sys.exit("Give a different output folder, for example: python3 scripts/apply_seo.py . _site")
    if os.path.exists(out):
        shutil.rmtree(out)

    def ignore(folder, names):
        top = os.path.abspath(folder) == os.path.abspath(src)
        return [n for n in names if n in SKIP_ANYWHERE or (top and (n in SKIP_DIRS or n in SKIP_FILES))]

    shutil.copytree(src, out, ignore=ignore)


def address(rel):
    """The address GitHub Pages serves a file at: x.html -> /x, folder/index.html -> /folder/."""
    rel = rel.replace(os.sep, "/")
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel[:-5]


def listed_cases(out):
    """Case pages on the homepage (cases/manifest.json), or None if there's no list."""
    path = os.path.join(out, "cases", "manifest.json")
    if not os.path.isfile(path):
        warn("cases/manifest.json is missing, so every case page goes in the sitemap. "
             "(It also builds the homepage grid, so check it's in the cases folder.)")
        return None
    try:
        with open(path, encoding="utf-8") as f:
            return {"cases/" + e["file"] for e in json.load(f) if isinstance(e, dict) and e.get("file")}
    except (ValueError, KeyError):
        warn("cases/manifest.json isn't valid JSON, so every case page goes in the sitemap. "
             "The homepage grid won't load either until it's fixed.")
        return None


def find_pages(out, cfg):
    exclude = set(cfg.get("exclude", []))
    pages = []
    for folder, dirs, files in os.walk(out):
        dirs[:] = sorted(d for d in dirs if not d.startswith("."))
        for name in sorted(files):
            if not name.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(folder, name), out).replace(os.sep, "/")
            if rel in exclude:
                continue
            pages.append(rel)
    return pages


# ---------------------------------------------------------------- <head> edits
def attr(v):
    """Escape for a double-quoted attribute (apostrophes can stay)."""
    return v.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def set_tag(head, pattern, new_tag, after=None):
    """Replace the tag matching pattern, or add new_tag (after the tag
    matching `after`, else before </head>). Returns the new head."""
    rx = re.compile(pattern, re.I | re.S)
    if rx.search(head):
        return rx.sub(lambda m: new_tag, head, count=1)
    if after:
        m = re.search(after, head, re.I | re.S)
        if m:
            return head[: m.end()] + "\n" + new_tag + head[m.end():]
    return head + new_tag + "\n"


def meta_rx(kind, key):
    return r'<meta\s+[^>]*%s\s*=\s*"%s"[^>]*>' % (kind, re.escape(key))


def get_meta(head, kind, key):
    m = re.search(meta_rx(kind, key), head, re.I | re.S)
    if not m:
        return None
    c = re.search(r'content\s*=\s*"([^"]*)"', m.group(0), re.I)
    return html.unescape(c.group(1)) if c else None


def absolute(url_or_path, page_rel, site):
    """A full address for an image path written relative to the page."""
    if not url_or_path or re.match(r"^[a-z]+:", url_or_path, re.I):
        return url_or_path
    if url_or_path.startswith("/"):
        return site + url_or_path
    base = os.path.dirname(page_rel)
    return site + "/" + os.path.normpath(os.path.join(base, url_or_path)).replace(os.sep, "/").lstrip("./")


def update_page(out, rel, cfg):
    path = os.path.join(out, rel)
    with open(path, encoding="utf-8") as f:
        doc = f.read()
    end = doc.lower().find("</head>")
    if end == -1:
        warn("%s has no <head>; left as it is." % rel)
        return None
    head, rest = doc[:end], doc[end:]

    site, page = cfg["site"], address(rel)
    url = site + page
    entry = cfg["pages"].get(page)
    if entry is None:
        warn("No entry for %s in seo.json; it keeps the title and description written in %s." % (page, rel))
        entry = {}

    # "noindex": true keeps the page out of search results and the sitemap.
    # The page still works for anyone with the link.
    if entry.get("noindex"):
        head = set_tag(head, meta_rx("name", "robots"), '<meta name="robots" content="noindex">', after=r"</title>")
    noindex = re.search(r'<meta\s+[^>]*name\s*=\s*"robots"[^>]*noindex', head, re.I)

    # title and description: seo.json first, else what the page already has
    t = re.search(r"<title>(.*?)</title>", head, re.I | re.S)
    title = (entry.get("title") or (html.unescape(t.group(1)) if t else "")).strip()
    desc = (entry.get("description") or get_meta(head, "name", "description") or "").strip()
    desc = re.sub(r"\s+", " ", desc)
    if entry and len(title) > 60:
        warn("%s: title is %d characters; Google usually shows about 60." % (page, len(title)))
    if entry and len(desc) > 160:
        warn("%s: description is %d characters; Google usually shows about 155-160." % (page, len(desc)))

    # preview image: seo.json, else the page's own, else the default
    default_img = cfg.get("defaultImage", "images/og-image-ss02.jpg")
    img_src = entry.get("image")
    if img_src:
        img_file = os.path.join(out, img_src.lstrip("/"))
        if not os.path.isfile(img_file):
            warn("%s: image %s isn't in the site; using the default preview image." % (page, img_src))
            img_src = None
        img = site + "/" + img_src.lstrip("/") if img_src else None
    else:
        img = absolute(get_meta(head, "property", "og:image"), rel, site)
    custom_img = bool(img_src)
    img = img or site + "/" + default_img

    head = set_tag(head, r"<title>.*?</title>", "<title>%s</title>" % html.escape(title, quote=False))
    head = set_tag(head, meta_rx("name", "description"), '<meta name="description" content="%s">' % attr(desc), after=r"</title>")
    head = set_tag(head, r'<link\s+[^>]*rel\s*=\s*"canonical"[^>]*>', '<link rel="canonical" href="%s">' % attr(url), after=meta_rx("name", "description"))
    head = set_tag(head, meta_rx("property", "og:url"), '<meta property="og:url" content="%s">' % attr(url), after=meta_rx("property", "og:type"))
    head = set_tag(head, meta_rx("property", "og:title"), '<meta property="og:title" content="%s">' % attr(title))
    head = set_tag(head, meta_rx("property", "og:description"), '<meta property="og:description" content="%s">' % attr(desc), after=meta_rx("property", "og:title"))
    head = set_tag(head, meta_rx("property", "og:image"), '<meta property="og:image" content="%s">' % attr(img), after=meta_rx("property", "og:description"))
    if custom_img:
        # the stated size belongs to the default image
        head = re.sub(meta_rx("property", "og:image:width") + r"\s*", "", head, flags=re.I | re.S)
        head = re.sub(meta_rx("property", "og:image:height") + r"\s*", "", head, flags=re.I | re.S)
    if not re.search(meta_rx("name", "twitter:card"), head, re.I | re.S):
        head = set_tag(head, meta_rx("name", "twitter:card"), '<meta name="twitter:card" content="summary_large_image">', after=meta_rx("property", "og:image"))

    # structured data (the tool pages): keep its description and address in step
    def fix_ld(m):
        try:
            data = json.loads(m.group(2))
        except ValueError:
            return m.group(0)
        if isinstance(data, dict):
            if "description" in data:
                data["description"] = desc
            if "url" in data:
                data["url"] = url
        return m.group(1) + "\n" + json.dumps(data, indent=2, ensure_ascii=False) + "\n" + m.group(3)

    head = re.sub(r'(<script\s+type="application/ld\+json">)\s*(.*?)\s*(</script>)', fix_ld, head, flags=re.S | re.I)

    # structured data from seo.json ("schema": a list of schema.org objects)
    head = re.sub(r'\s*<script\s+type="application/ld\+json"\s+data-seo>.*?</script>', "", head, flags=re.S | re.I)
    schema = entry.get("schema") or []
    if isinstance(schema, dict):
        schema = [schema]
    for obj in schema:
        if not isinstance(obj, dict) or "@type" not in obj:
            warn('%s: each item in "schema" needs an "@type"; one was skipped.' % page)
            continue
        obj = dict({"@context": "https://schema.org"}, **obj)
        text = json.dumps(obj, indent=2, ensure_ascii=False).replace("</", "<\\/")
        head = head.rstrip() + '\n<script type="application/ld+json" data-seo>\n%s\n</script>\n' % text

    with open(path, "w", encoding="utf-8") as f:
        f.write(head + rest)
    return None if noindex else url


# ---------------------------------------------------------------- main
def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, out = sys.argv[1], sys.argv[2]
    cfg = load_config(src)
    copy_site(src, out)

    # Cases taken off the homepage list stay reachable at their address
    # but are left out of the sitemap, so search engines aren't pointed at them.
    listed = listed_cases(out)
    pages = find_pages(out, cfg)
    urls = []
    for rel in pages:
        u = update_page(out, rel, cfg)
        if not u:
            continue
        if listed is not None and rel.startswith("cases/") and rel not in listed:
            print("note: %s isn't in cases/manifest.json, so it's left out of the sitemap." % address(rel))
            continue
        urls.append(u)

    addresses = {address(rel) for rel in pages}
    for page in cfg["pages"]:
        if page.startswith("/") and page not in addresses:
            warn("seo.json has an entry for %s, but there's no page at that address." % page)

    urls.sort(key=lambda u: (u != cfg["site"] + "/", u))
    with open(os.path.join(out, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n'
                "<!-- Written by scripts/apply_seo.py from the pages in the site. -->\n"
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for u in urls:
            f.write("  <url><loc>%s</loc></url>\n" % html.escape(u))
        f.write("</urlset>\n")

    print("Applied seo.json to %d pages; sitemap lists %d. %d warning(s)." % (len(pages), len(urls), len(warnings)))


if __name__ == "__main__":
    main()
