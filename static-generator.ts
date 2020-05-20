import { basename, join, copy, emptyDir, src, isModule } from "./lib.ts";
export * from "./static-generator.ts";

import args from "https://deno.land/x/args@2.0.0/wrapper.ts";
import { Text } from "https://deno.land/x/args@2.0.0/value-types.ts";
import {
  EarlyExitFlag,
  PartialOption,
} from "https://deno.land/x/args@2.0.0/flag-types.ts";

import {
  writeFiles,
  getAllPages,
  createIndexFile,
  createToc,
  copyExternalFile,
} from "./api.ts";

if (import.meta.main) {
  // const foo = await fetch("https://static-generator.variant.dev/src/assets");

  // console.log(foo);
  // Deno.exit();

  const parser = args
    .describe("Generate simple static site from markdown files in directory")
    .with(
      EarlyExitFlag("help", {
        describe: "Show help",
        exit() {
          console.log(parser.help());
          return Deno.exit();
        },
      }),
    )
    .with(
      PartialOption("output", {
        alias: ["o"],
        type: Text,
        describe: "Output directory",
        default: undefined,
      }),
    )
    .with(
      PartialOption("index", {
        alias: ["i"],
        type: Text,
        describe:
          "Index template path (should include tag {{TOC}}, defaults to included index template)",
        default: undefined,
      }),
    )
    .with(
      PartialOption("template", {
        alias: ["t"],
        type: Text,
        describe:
          "Page template path  (should include tag {{BODY}}, defaults to included template)",
        default: undefined,
      }),
    )
    .with(
      PartialOption("assets", {
        alias: ["a"],
        type: Text,
        describe: "Assets directory (defaults to included assets) ",
        default: undefined,
      }),
    )
    .with(
      PartialOption("files", {
        alias: ["f"],
        type: Text,
        describe:
          "Files to look for as glob. Example `pages/*.md` (defaults to all markdowns except ignored ones) ",
        default: undefined,
      }),
    )
    .with(
      PartialOption("ignore", {
        alias: ["ig"],
        type: Text,
        describe:
          "Ignored files as glob. Example `*.doc.md` (defaults to README.md and LICENSE.md at any level) ",
        default: undefined,
      }),
    );

  const res = parser.parse(Deno.args);

  if (res.error) {
    console.error("Failed to parse CLI arguments");
    console.error(res.error.toString(), "\n");
    console.log(parser.help());
    Deno.exit(1);
  } else {
    generate({
      indexTemplate: res.value?.index,
      pageTemplate: res.value?.template,
      outputPath: res.value?.output,
      assetsPath: res.value?.assets,
      glob: res.value?.files,
      globExclude: res.value?.ignore,
    });
  }
}

type StaticSiteGeneratorOptions = {
  glob?: string;
  globExclude?: string;
  indexTemplate?: string;
  pageTemplate?: string;
  outputPath?: string;
  assetsPath?: string;
};

export default async function generate({
  indexTemplate,
  pageTemplate,
  assetsPath,
  glob = join("**", "*.md"),
  globExclude = join("**", "{README,LICENSE}.md"),
  outputPath = "docs",
}: StaticSiteGeneratorOptions = {}) {
  await emptyDir(outputPath);

  const pages = writeFiles(
    getAllPages(glob, globExclude, outputPath, pageTemplate),
  );
  let files = [];
  for await (let file of pages) {
    console.log(`[Generated] Wrote ${file.title} (${file.path})`);
    files.push(file);
  }

  const toc = await createToc(files);
  const indexPath = await createIndexFile(toc, outputPath, indexTemplate);
  console.log(`[Generated] Wrote index page (${indexPath})`);

  await copyAssets(outputPath, assetsPath);
}

async function copyAssets(outputPath: string, assetsPath?: string) {
  let assetsDestination;
  if (assetsPath) {
    assetsDestination = join(outputPath, basename(assetsPath));
    await copy(assetsPath, assetsDestination);
  } else {
    assetsDestination = join(outputPath, "assets");
    await emptyDir(assetsDestination);
    await copyExternalFile("assets/style.css", "assets/");
  }

  console.log(`[Generated] Copied assets (${assetsDestination}/)`);
}
