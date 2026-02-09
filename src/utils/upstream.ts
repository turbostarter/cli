import { execa } from "execa";

export function sshUrl(repo: string) {
  return `git@github.com:${repo}`;
}

export function httpsUrl(repo: string) {
  return `https://github.com/${repo}`;
}

export async function hasSshAccess(): Promise<boolean> {
  try {
    await execa(
      "ssh",
      ["-T", "git@github.com", "-o", "StrictHostKeyChecking=no"],
      {
        timeout: 10_000,
      },
    );

    return true;
  } catch (error) {
    // ssh -T git@github.com exits with code 1 even on success,
    // but prints "successfully authenticated" in stderr
    const stderr =
      error instanceof Error && "stderr" in error
        ? String((error as { stderr: unknown }).stderr)
        : "";

    return stderr.includes("successfully authenticated");
  }
}

export function isUpstreamUrlValid(url: string, repo: string): boolean {
  const normalized = url.replace(/\/+$/, "").replace(/\.git$/, "");

  return normalized === sshUrl(repo) || normalized === httpsUrl(repo);
}

export async function getUpstreamRemoteUrl({ cwd }: { cwd: string }) {
  try {
    const { stdout } = await execa("git remote get-url upstream", { cwd });
    return stdout.trim() || undefined;
  } catch {
    return undefined;
  }
}

export async function setUpstreamRemote(url: string, { cwd }: { cwd: string }) {
  const currentUrl = await getUpstreamRemoteUrl({ cwd });

  if (currentUrl) {
    await execa("git", ["remote", "set-url", "upstream", url], { cwd });
  } else {
    await execa("git", ["remote", "add", "upstream", url], { cwd });
  }
}
