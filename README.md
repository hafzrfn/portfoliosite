# Portfolio — Hafizh Rifan

A static portfolio site. No frameworks, no build step, no dependencies. Open
`index.html` in a browser and it runs.

## Editing the site

**Everything you'll want to change lives in [`content.js`](content.js).**

Your bio, experience, projects, stack, education, contact details and social
links are all values in a single object at the top of that file. Change one,
save, refresh the browser. You never have to touch the HTML.

To add an item to any list — a job, a project, a tool — copy an existing block
between its `{ }` braces, paste it below, and edit the copy. Each section has a
comment above it explaining what its fields do.

## The other files

| File | What it does |
| --- | --- |
| `content.js` | **All of your content.** The only file you need to edit. |
| `index.html` | Page skeleton and the templates each section is built from. |
| `style.css` | All styling. The colour and type tokens sit at the very top under `:root`. |
| `app.js` | Reads `content.js` and builds the page, then runs the interactions. |

## Running it locally

Double-clicking `index.html` works. If you'd rather serve it properly:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Notes

- Fonts load from Google Fonts (Inter Tight, Instrument Serif, JetBrains Mono),
  falling back to the local Google Sans in `fonts/` if they're unavailable.
- Icons come from a Font Awesome kit loaded in `index.html`.
- All animation is disabled automatically when the visitor has "reduce motion"
  turned on in their OS settings.
