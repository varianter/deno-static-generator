# Simplistic specialized Static Site Generator

Written for [Deno](https://deno.land/).

This is a tool used for generating simple HTML pages from Markdown by specifying templates and assets. It is used by Variant in different projects but can also by used by anyone. By default a simple design and template is provided.

Basic usage (with default style):

With root as:

```
- my-page1.md
- my-page2.md
```

We can run

```sh
deno run --allow-read --allow-write --unstable https://static-generator.variant.dev/static-generator.ts
```

And it will create an HTML site in directory `docs/` which you can host through GitHub (`docs/` can be in `.gitignore`).

Options as CLI:

```
DESCRIPTION:
  Generate simple static site from markdown files in directory
OPTIONS:
  --help
    Show help
  --output, -o <text> [default: undefined]
    Output directory
  --index, -i <text> [default: undefined]
    Index template path (should include tag {{TOC}}, defaults to included index template)
  --template, -t <text> [default: undefined]
    Page template path  (should include tag {{BODY}}, defaults to included template)
  --assets, -a <text> [default: undefined]
    Assets directory (defaults to included assets)
  --files, -f <text> [default: undefined]
    Files to look for as glob. Example `pages/*.md` (defaults to all markdowns except ignored ones)
  --ignore, --ig <text> [default: undefined]
    Ignored files as glob. Example `*.doc.md` (defaults to README.md and LICENSE.md at any level)
```

## Programmatic API

You can use it programmatically through Deno:

```ts
import generate from "https://static-generator.variant.dev/static-generator.ts";
```

With the options

```ts
type StaticSiteGeneratorOptions = {
  indexTemplate?: string; // Defaults to included index template
  pageTemplate?: string; // Defaults to included page template
  assetsPath?: string; // Defaults to included assets

  glob?: string; // Default: `./**/*.md`
  globExclude?: string; // Default: `{README,LICENSE}.md`
  outputPath?: string; // Default:  `docs/`
};
```

You can also use `api.ts` directly through:

```ts
import {} from "https://static-generator.variant.dev/api.ts";
```
