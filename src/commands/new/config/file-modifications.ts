import { Node, SyntaxKind } from "ts-morph";
import { z } from "zod";

import { App } from "~/config";
import { directory, file, removeDependency } from "~/utils/file";

import type { ArrayLiteralExpression } from "ts-morph";

export const fileModificationsByMissingApp = {
  [App.WEB]: [],
  [App.MOBILE]: [
    ...[
      "apps/mobile",
      "packages/analytics/mobile",
      "packages/billing/mobile",
      "packages/monitoring/mobile",
      "packages/ui/mobile",
    ].map((path) =>
      directory({
        path,
        action: "remove",
      }),
    ),
    ...[
      "packages/auth/src/client/mobile.ts",
      "packages/auth/src/server/mobile.ts",
    ].map((path) =>
      file({
        path,
        action: "remove",
      }),
    ),
    file({
      path: "packages/api/package.json",
      action: "modify",
      schema: z.looseObject({
        dependencies: z.record(z.string(), z.string()),
      }),
      modify: (file) => removeDependency(file, "@workspace/billing-mobile"),
    }),
    file({
      path: "packages/auth/package.json",
      action: "modify",
      schema: z.looseObject({
        dependencies: z.record(z.string(), z.string()),
      }),
      modify: (file) => removeDependency(file, "@better-auth/expo"),
    }),
    file({
      path: "packages/api/src/env.ts",
      action: "modify",
      modify: (file) => {
        file
          .getImportDeclaration((declaration) =>
            declaration
              .getModuleSpecifierValue()
              .startsWith("@workspace/billing-mobile"),
          )
          ?.remove();

        const extendsProperty = file
          .getVariableDeclaration("preset")
          ?.getInitializer()
          ?.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression)
          ?.getProperty("extends");

        if (!extendsProperty || !Node.isPropertyAssignment(extendsProperty)) {
          return;
        }

        const extendsArray = extendsProperty.getInitializerIfKind(
          SyntaxKind.ArrayLiteralExpression,
        );
        if (!extendsArray) {
          return;
        }

        const elements = extendsArray.getElements();
        for (let index = elements.length - 1; index >= 0; index--) {
          if (elements[index]?.getText() === "billingMobile") {
            extendsArray.removeElement(index);
          }
        }
      },
    }),
    file({
      path: "packages/api/src/modules/billing/router.ts",
      action: "modify",
      modify: (file) => {
        file
          .getImportDeclaration((declaration) =>
            declaration
              .getModuleSpecifierValue()
              .startsWith("@workspace/billing-mobile"),
          )
          ?.remove();

        const callExpression = file
          .getDescendantsOfKind(SyntaxKind.CallExpression)
          .find((node) => {
            const expression = node.getExpression();
            if (!Node.isPropertyAccessExpression(expression)) {
              return false;
            }

            const argumentsList = node.getArguments();
            if (!argumentsList.length) {
              return false;
            }
            const firstArgumentText = argumentsList[0].getText();
            return (
              expression.getName() === "post" &&
              firstArgumentText.includes("mobile.provider")
            );
          });

        if (!callExpression) {
          return;
        }

        const expression = callExpression.getExpression();
        if (!Node.isPropertyAccessExpression(expression)) {
          return;
        }

        callExpression.replaceWithText(expression.getExpression().getText());
      },
    }),
    file({
      path: "packages/auth/src/server.ts",
      action: "modify",
      modify: (file) => {
        const getArrayProperty = (
          propertyName: string,
        ): ArrayLiteralExpression | undefined => {
          const authConfig = file
            .getVariableDeclaration("auth")
            ?.getInitializerIfKind(SyntaxKind.CallExpression)
            ?.getArguments()[0]
            ?.asKind(SyntaxKind.ObjectLiteralExpression);
          const property = authConfig?.getProperty(propertyName);
          if (!property || !Node.isPropertyAssignment(property)) {
            return undefined;
          }

          return property.getInitializerIfKind(
            SyntaxKind.ArrayLiteralExpression,
          );
        };

        const removeMatchingArrayElements = (
          array: ArrayLiteralExpression | undefined,
          isMatch: (text: string) => boolean,
        ) => {
          if (!array) {
            return;
          }

          const elements = array.getElements();
          for (let index = elements.length - 1; index >= 0; index--) {
            if (isMatch(elements[index]?.getText() ?? "")) {
              array.removeElement(index);
            }
          }
        };

        file
          .getImportDeclaration(
            (declaration) =>
              declaration.getModuleSpecifierValue() === "@better-auth/expo",
          )
          ?.remove();

        removeMatchingArrayElements(getArrayProperty("plugins"), (text) =>
          text.startsWith("expo("),
        );
        removeMatchingArrayElements(
          getArrayProperty("trustedOrigins"),
          (text) => text === '"turbostarter://"',
        );
      },
    }),
  ],
  [App.EXTENSION]: [
    ...[
      "apps/extension",
      "packages/analytics/extension",
      "packages/monitoring/extension",
    ].map((path) =>
      directory({
        path,
        action: "remove",
      }),
    ),
    file({
      path: ".github/workflows/publish-extension.yml",
      action: "remove",
    }),
    file({
      path: "packages/auth/src/server.ts",
      action: "modify",
      modify: (file) => {
        const trustedOrigins = file
          .getVariableDeclaration("auth")
          ?.getInitializerIfKind(SyntaxKind.CallExpression)
          ?.getArguments()[0]
          ?.asKind(SyntaxKind.ObjectLiteralExpression)
          ?.getProperty("trustedOrigins");

        if (!trustedOrigins || !Node.isPropertyAssignment(trustedOrigins)) {
          return;
        }

        const trustedOriginsArray = trustedOrigins.getInitializerIfKind(
          SyntaxKind.ArrayLiteralExpression,
        );
        if (!trustedOriginsArray) {
          return;
        }

        const originElements = trustedOriginsArray.getElements();
        for (let index = originElements.length - 1; index >= 0; index--) {
          if (originElements[index]?.getText() === '"chrome-extension://"') {
            trustedOriginsArray.removeElement(index);
          }
        }
      },
    }),
  ],
};
