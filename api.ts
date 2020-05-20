import {
  globToRegExp,
  basename,
  join,
  Marked,
  walk,
  getFileContents,
  getLocalFileContents,
} from "./lib.ts";

const decoder = new TextDecoder("utf-8");

export type PageType = {
  filename: string;
  path: string;
  title: string;
  content: string;
};

type PageTypeList = AsyncGenerator<PageType> | PageType[];

export async function createIndexFile(
  toc: string,
  outputPath: string,
  templatePath?: string,
) {
  const index = templatePath
    ? await getFileContents(templatePath)
    : await getLocalFileContents("index.html");

  const content = replaceTemplate(index, { TOC: toc });

  const path = join(outputPath, "index.html");
  const encoder = new TextEncoder();
  await Deno.writeFile(path, encoder.encode(content));

  return path;
}

export async function* getAllPages(
  glob: string,
  globExclude: string,
  outputPath: string,
  templatePath?: string,
): PageTypeList {
  const template = templatePath
    ? await getFileContents(templatePath)
    : await getLocalFileContents("layout.html");

  const globOpts = {
    flags: "g",
    extended: true,
    globstar: true,
  };
  for await (
    let file of walk(Deno.cwd(), {
      match: [globToRegExp(glob, globOpts)],
      skip: [globToRegExp(globExclude, globOpts)],
    })
  ) {
    const content = decoder.decode(await Deno.readFile(file.path));
    const parsed = Marked.parse(content);
    const baseFilename = basename(file.name, ".md");
    const filename = baseFilename + ".html";
    const path = join(outputPath, filename);
    const title = getFirstTitle(parsed, baseFilename);

    yield {
      filename,
      path,
      content: replaceTemplate(template, { BODY: parsed, TITLE: title }),
      title,
    };
  }
}

export async function* writeFiles(
  pages: PageTypeList,
): PageTypeList {
  const encoder = new TextEncoder();
  for await (let page of pages) {
    await Deno.writeFile(page.path, encoder.encode(page.content));
    yield page;
  }
}

export async function createToc(
  pages: PageTypeList,
) {
  let toc = "";
  for await (let page of pages) {
    toc +=
      `<li><a href="${page.path}" title="${page.filename}">${page.title}</a></li>`;
  }
  return `<ul>${toc}</ul>`;
}

function getFirstTitle(content: string, filename: string) {
  const title = content.match(/<h1.*>([^<]+)<\/h1>/i);
  return title ? title[1] : basename(filename, ".html");
}

function replaceTemplate(
  template: string,
  obj: { [templateKey: string]: string },
) {
  return template.replace(
    /\{\{\s*([^\}]+)\s*\}\}/i,
    (_, key) => (!obj[key]) ? `{{${key}}}` : obj[key],
  );
}