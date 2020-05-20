export {
  globToRegExp,
  basename,
  join,
} from "https://deno.land/std@0.51.0/path/mod.ts";
export { walk, copy, emptyDir } from "https://deno.land/std@0.51.0/fs/mod.ts";
export { Marked } from "https://deno.land/x/markdown/mod.ts";

const decoder = new TextDecoder("utf-8");
export const getFileContents = async (path: string) =>
  decoder.decode(await Deno.readFile(path));
export const src = (name: string) =>
  new URL("../src/" + name, import.meta.url).pathname;
export const getLocalFileContents = async (name: string) =>
  decoder.decode(await Deno.readFile(src(name)));
