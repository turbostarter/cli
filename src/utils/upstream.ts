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
      [
        "-T",
        "git@github.com",
        "-o",
        "StrictHostKeyChecking=yes",
        "-o",
        "BatchMode=yes",
      ],
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

export async function hasRepoAccess(
  repo: string,
  options?: { useSsh?: boolean; timeout?: number },
): Promise<boolean> {
  try {
    const useSsh = options?.useSsh ?? (await hasSshAccess());
    const url = useSsh ? sshUrl(repo) : httpsUrl(repo);

    await execa("git", ["ls-remote", "--exit-code", url, "HEAD"], {
      timeout: options?.timeout ?? 8_000,
      env: { GIT_TERMINAL_PROMPT: "0" },
    });

    return true;
  } catch {
    return false;
  }
}

export function isUpstreamUrlValid(url: string, repo: string): boolean {
  const normalized = url.replace(/\/+$/, "").replace(/\.git$/, "");

  return normalized === sshUrl(repo) || normalized === httpsUrl(repo);
}

export async function getUpstreamRemoteUrl({ cwd }: { cwd: string }) {
  try {
    const { stdout } = await execa(
      "git",
      ["config", "--get", "remote.upstream.url"],
      { cwd },
    );
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

export async function isGitClean({ cwd }: { cwd: string }): Promise<boolean> {
  try {
    const { stdout } = await execa("git", ["status", "--porcelain"], { cwd });
    return stdout.trim() === "";
  } catch {
    return false;
  }
}
