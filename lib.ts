export {
  globToRegExp,
  basename,
  join,
  dirname,
} from "https://deno.land/std@0.51.0/path/mod.ts";
export {
  walk,
  copy,
  emptyDir,
  writeFileStr,
} from "https://deno.land/std@0.51.0/fs/mod.ts";
export { Marked } from "https://deno.land/x/markdown/mod.ts";

const decoder = new TextDecoder("utf-8");
export const getFileContents = async (path: string) =>
  decoder.decode(await Deno.readFile(path));

export const src = (name: string) => {
  return new URL("../src/" + name, import.meta.url).pathname;
};
export const href = (name: string) => {
  return new URL("../src/" + name, import.meta.url).href;
};

export const isModule = !import.meta.url.startsWith("file://");

export async function getModuleFileContents(name: string) {
  if (!isModule) {
    return decoder.decode(await Deno.readFile(src(name)));
  } else {
    const url = href(name);
    const data = await fetch(url);
    return data.text();
  }
}
