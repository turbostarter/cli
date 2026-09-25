import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

import { removeMobile } from "~/commands/new/ai/mobile";
import { modifyFilesForMissingApps } from "~/commands/new/core/apps";
import { App } from "~/commands/new/core/config/definitions";
import { fileModificationsByMissingApp } from "~/commands/new/core/config/file-modifications";
import { applyFileModifications } from "~/utils/file";
import { logger } from "~/utils/logger";

const withFixture = async (run: (cwd: string) => Promise<void>) => {
  const cwd = await fs.mkdtemp(join(tmpdir(), "turbostarter-bootstrap-"));
  try {
    await run(cwd);
  } finally {
    await fs.rm(cwd, { recursive: true, force: true });
  }
};

const write = async (cwd: string, path: string, content: string) => {
  const fullPath = join(cwd, path);
  await fs.mkdir(dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content);
};

const read = (cwd: string, path: string) =>
  fs.readFile(join(cwd, path), "utf8");

const exists = async (cwd: string, path: string) =>
  fs.access(join(cwd, path)).then(
    () => true,
    () => false,
  );

const authServer = (origin: string, expoCall: string) => `
import { expo } from "@better-auth/expo";
const auth = betterAuth({
  plugins: [${expoCall}, otherPlugin()],
  trustedOrigins: ["${origin}", "https://example.com"],
});
`;

void test("Core without mobile removes mobile integration and keeps shared dependencies", () =>
  withFixture(async (cwd) => {
    await write(cwd, "apps/mobile/app.ts", "mobile app");
    await write(cwd, "packages/ui/mobile/index.ts", "mobile UI");
    await write(cwd, "patches/fix.patch", "patch");
    await write(cwd, ".github/workflows/publish-mobile.yml", "mobile");
    await write(
      cwd,
      "pnpm-workspace.yaml",
      "patchedDependencies:\n  react-native-ios-utilities@5.2.0: patches/fix.patch\n",
    );
    await write(
      cwd,
      "packages/api/package.json",
      JSON.stringify({
        dependencies: {
          "@workspace/billing-mobile": "workspace:*",
          "@workspace/billing-web": "workspace:*",
        },
      }),
    );
    await write(
      cwd,
      "packages/auth/package.json",
      JSON.stringify({
        dependencies: {
          "@better-auth/expo": "1.0.0",
          "better-auth": "1.0.0",
        },
      }),
    );
    await write(
      cwd,
      "packages/api/src/env.ts",
      'import { billingMobile } from "@workspace/billing-mobile";\nconst preset = createEnv({ extends: [billingMobile, base] });\n',
    );
    await write(
      cwd,
      "packages/api/src/modules/billing/router.ts",
      'import { mobile } from "@workspace/billing-mobile";\nconst router = { mobile: procedure.post(mobile.provider) };\n',
    );
    await write(
      cwd,
      "packages/auth/src/server.ts",
      authServer("turbostarter://", "expo()"),
    );

    await modifyFilesForMissingApps(cwd, [App.WEB, App.EXTENSION]);

    assert.equal(await exists(cwd, "apps/mobile"), false);
    assert.equal(await exists(cwd, "patches"), false);
    assert.equal(
      await exists(cwd, ".github/workflows/publish-mobile.yml"),
      false,
    );
    assert.equal(
      (await read(cwd, "pnpm-workspace.yaml")).includes("patchedDependencies"),
      false,
    );
    const api = JSON.parse(await read(cwd, "packages/api/package.json")) as {
      dependencies: Record<string, string>;
    };
    const auth = JSON.parse(await read(cwd, "packages/auth/package.json")) as {
      dependencies: Record<string, string>;
    };
    assert.deepEqual(api.dependencies, {
      "@workspace/billing-web": "workspace:*",
    });
    assert.deepEqual(auth.dependencies, { "better-auth": "1.0.0" });
    assert.doesNotMatch(
      await read(cwd, "packages/api/src/env.ts"),
      /billingMobile/,
    );
    assert.doesNotMatch(
      await read(cwd, "packages/api/src/modules/billing/router.ts"),
      /mobile\.provider|billing-mobile/,
    );
    const server = await read(cwd, "packages/auth/src/server.ts");
    assert.doesNotMatch(server, /@better-auth\/expo|expo\(|turbostarter:\/\//);
    assert.match(server, /otherPlugin\(\)|https:\/\/example.com/);
  }));

void test("Core without extension removes extension files and trusted origin", () =>
  withFixture(async (cwd) => {
    await write(cwd, "apps/extension/index.ts", "extension");
    await write(cwd, ".github/workflows/publish-extension.yml", "extension");
    await write(
      cwd,
      "packages/auth/src/server.ts",
      'const auth = betterAuth({ trustedOrigins: ["chrome-extension://", "https://example.com"] });',
    );

    await modifyFilesForMissingApps(cwd, [App.WEB, App.MOBILE]);

    assert.equal(await exists(cwd, "apps/extension"), false);
    assert.equal(
      await exists(cwd, ".github/workflows/publish-extension.yml"),
      false,
    );
    const server = await read(cwd, "packages/auth/src/server.ts");
    assert.doesNotMatch(server, /chrome-extension:\/\//);
    assert.match(server, /https:\/\/example.com/);
  }));

void test("AI without mobile removes Expo integration and keeps web auth", () =>
  withFixture(async (cwd) => {
    await write(cwd, "apps/mobile/app.ts", "mobile app");
    await write(cwd, "patches/fix.patch", "patch");
    await write(
      cwd,
      "pnpm-workspace.yaml",
      "patchedDependencies:\n  react-native-ios-utilities@5.2.0: patches/ios.patch\n  react-native-pdf@7.0.4: patches/pdf.patch\n",
    );
    await write(
      cwd,
      "packages/auth/package.json",
      JSON.stringify({
        dependencies: { "@better-auth/expo": "1.0.0", "better-auth": "1.0.0" },
      }),
    );
    await write(
      cwd,
      "packages/auth/src/server.ts",
      authServer("turbostarter-ai://", "expo()"),
    );

    await removeMobile(cwd);

    assert.equal(await exists(cwd, "apps/mobile"), false);
    assert.equal(await exists(cwd, "patches"), false);
    assert.doesNotMatch(await read(cwd, "pnpm-workspace.yaml"), /react-native/);
    const auth = JSON.parse(await read(cwd, "packages/auth/package.json")) as {
      dependencies: Record<string, string>;
    };
    assert.deepEqual(auth.dependencies, { "better-auth": "1.0.0" });
    const server = await read(cwd, "packages/auth/src/server.ts");
    assert.doesNotMatch(
      server,
      /@better-auth\/expo|expo\(|turbostarter-ai:\/\//,
    );
    assert.match(server, /otherPlugin\(\)|https:\/\/example.com/);
  }));

void test("template schema drift logs the skipped file and continues", () =>
  withFixture(async (cwd) => {
    await write(
      cwd,
      "packages/api/package.json",
      JSON.stringify({ name: "api" }),
    );
    await write(
      cwd,
      "packages/auth/package.json",
      JSON.stringify({
        dependencies: { "@better-auth/expo": "1.0.0", "better-auth": "1.0.0" },
      }),
    );

    const logs: string[] = [];
    const originalInfo = logger.info.bind(logger);
    logger.info = (message) => logs.push(String(message));
    try {
      await applyFileModifications(
        cwd,
        fileModificationsByMissingApp[App.MOBILE].filter((entry) =>
          entry.path.endsWith("/package.json"),
        ),
      );
    } finally {
      logger.info = originalInfo;
    }

    assert.ok(
      logs.some((message) =>
        /Skipping packages\/api\/package\.json:.*dependencies/.test(message),
      ),
    );
    assert.deepEqual(JSON.parse(await read(cwd, "packages/api/package.json")), {
      name: "api",
    });
    const auth = JSON.parse(await read(cwd, "packages/auth/package.json")) as {
      dependencies: Record<string, string>;
    };
    assert.deepEqual(auth.dependencies, { "better-auth": "1.0.0" });
  }));
