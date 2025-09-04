import { promises } from "fs";
import { join } from "path";

export const replaceInFile = async ({
  cwd,
  path,
  pattern,
  value,
}: {
  cwd: string;
  path: string;
  pattern: RegExp | string;
  value: string;
}) => {
  const fullPath = join(cwd, path);
  const content = await promises.readFile(fullPath, "utf8");
  const newContent = content.replace(pattern, value);
  await promises.writeFile(fullPath, newContent);
};

export const replaceInFiles = async ({
  cwd,
  paths,
  pattern,
  value,
}: {
  cwd: string;
  paths: string[];
  pattern: RegExp | string;
  value: string;
}) => {
  await Promise.all(
    paths.map(async (path) => {
      await replaceInFile({ cwd, path, pattern, value });
    }),
  );
};
