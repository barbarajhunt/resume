# Barbara Hunt Portfolio

Static HTML/CSS/JS portfolio site for Barbara Hunt.

## Local Preview

From this directory:

```sh
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

## GitHub Pages

This repo includes `.github/workflows/pages.yml` for GitHub Pages deployment
through GitHub Actions. In the repository settings, set **Pages > Build and
deployment > Source** to **GitHub Actions**.

The current remote is `barbarajhunt/resume`, so GitHub project Pages will publish
at:

```text
https://barbarajhunt.github.io/resume/
```

To make the site appear at the root URL:

```text
https://barbarajhunt.github.io/
```

Barbara can either rename this repository to `barbarajhunt.github.io`, or create
a separate `barbarajhunt.github.io` repository with an `index.html` that redirects
to `/resume/`.
