"""Bundle index.html + assets into one self-contained HTML file (dist/core-pos-admin.html).

The output omits the <!doctype>/<html>/<head>/<body> wrappers so it can be published
as a hosted page that supplies its own document skeleton. Open index.html locally instead.
"""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text()

html = re.sub(r'<link rel="stylesheet" href="(assets/[^"]+)">',
              lambda m: "<style>\n" + (root / m.group(1)).read_text() + "</style>", html)
html = re.sub(r'<script src="(assets/[^"]+)"></script>',
              lambda m: "<script>\n" + (root / m.group(1)).read_text() + "</script>", html)
for tag in (r"<!doctype html>\n", r'<html lang="en">\n', r"<head>\n", r"</head>\n", r"<body>\n",
            r"</body>\n", r"</html>\n", r'<meta charset="utf-8">\n', r'<meta name="viewport"[^>]*>\n'):
    html = re.sub(tag, "", html, count=1)

out = root / "dist" / "core-pos-admin.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html)
print(f"wrote {out.relative_to(root)} ({len(html) // 1024} KB)")
