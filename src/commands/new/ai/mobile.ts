import prompts from "prompts";
import { Node, SyntaxKind } from "ts-morph";
import * as z from "zod";

import { onCancel } from "~/utils";
import {
  applyFileModifications,
  directory,
  file,
  removeDependency,
  removePatchedDependency,
} from "~/utils/file";

export const chooseMobile = async () => {
  const result = await prompts(
    {
      type: "confirm",
      name: "mobile",
      message: "Include the mobile app?",
      initial: false,
    },
    { onCancel },
  );
  return z.object({ mobile: z.boolean() }).parse(result).mobile;
};

export const removeMobile = async (cwd: string) => {
  await applyFileModifications(cwd, [
    ...["apps/mobile", "packages/ui/mobile", "patches"].map((path) =>
      directory({ path, action: "remove" }),
    ),
    ...[
      "packages/auth/src/client/mobile.ts",
      ".github/workflows/publish-mobile.yml",
    ].map((path) => file({ path, action: "remove" })),
    file({
      path: "pnpm-workspace.yaml",
      action: "modify",
      modify: (content) =>
        removePatchedDependency(
          removePatchedDependency(content, "react-native-ios-utilities@5.2.0"),
          "react-native-pdf@7.0.4",
        ),
    }),
    file({
      path: "packages/auth/package.json",
      action: "modify",
      schema: z.looseObject({
        dependencies: z.record(z.string(), z.string()),
      }),
      modify: (data) => removeDependency(data, "@better-auth/expo"),
    }),
    file({
      path: "packages/auth/src/server.ts",
      action: "modify",
      modify: (source) => {
        const expoImport = source.getImportDeclaration("@better-auth/expo");
        const auth = source
          .getVariableDeclaration("auth")
          ?.getInitializerIfKind(SyntaxKind.CallExpression)
          ?.getArguments()[0]
          ?.asKind(SyntaxKind.ObjectLiteralExpression);
        const trustedOrigins = auth?.getProperty("trustedOrigins");
        const plugins = auth?.getProperty("plugins");

        if (
          !expoImport ||
          !trustedOrigins ||
          !Node.isPropertyAssignment(trustedOrigins) ||
          !plugins ||
          !Node.isPropertyAssignment(plugins)
        ) {
          throw new Error(
            "AI template changed: Expo auth integration not found.",
          );
        }

        const origins = trustedOrigins.getInitializerIfKind(
          SyntaxKind.ArrayLiteralExpression,
        );
        const pluginList = plugins.getInitializerIfKind(
          SyntaxKind.ArrayLiteralExpression,
        );
        const originIndex = origins
          ?.getElements()
          .findIndex((element) => element.getText() === '"turbostarter-ai://"');
        const pluginIndex = pluginList
          ?.getElements()
          .findIndex((element) => element.getText() === "expo()");

        if (
          !origins ||
          !pluginList ||
          originIndex === undefined ||
          originIndex < 0 ||
          pluginIndex === undefined ||
          pluginIndex < 0
        ) {
          throw new Error(
            "AI template changed: Expo auth integration not found.",
          );
        }

        expoImport.remove();
        origins.removeElement(originIndex);
        pluginList.removeElement(pluginIndex);
      },
    }),
  ]);
};
