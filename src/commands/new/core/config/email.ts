import prompts from "prompts";

import { getLabel, onCancel } from "~/utils";

import { EmailProvider, coreEnv } from "./definitions";

const getEmailProvider = async (): Promise<{
  provider: EmailProvider;
}> => {
  return prompts(
    [
      {
        type: "select",
        name: "provider",
        message: "What do you want to use for emails?",
        choices: Object.values(EmailProvider).map((provider) => ({
          title: getLabel(provider),
          value: provider,
        })),
      },
    ],
    {
      onCancel,
    },
  );
};

const getEmailProviderConfig = async (
  provider: EmailProvider,
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case EmailProvider.RESEND:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.email.resend.apiKey,
            message: "Enter your Resend API key",
            initial: configuredEnv[coreEnv.email.resend.apiKey],
          },
        ],
        {
          onCancel,
        },
      );
    case EmailProvider.SENDGRID:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.email.sendgrid.apiKey,
            message: "Enter your Sendgrid API key",
            initial: configuredEnv[coreEnv.email.sendgrid.apiKey],
          },
        ],
        {
          onCancel,
        },
      );
    case EmailProvider.PLUNK:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.email.plunk.apiKey,
            message: "Enter your Plunk API key",
            initial: configuredEnv[coreEnv.email.plunk.apiKey],
          },
        ],
        {
          onCancel,
        },
      );
    case EmailProvider.POSTMARK:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.email.postmark.apiKey,
            message: "Enter your Postmark API key",
            initial: configuredEnv[coreEnv.email.postmark.apiKey],
          },
        ],
        {
          onCancel,
        },
      );
    case EmailProvider.MAILGUN:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.email.mailgun.apiKey,
            message: "Enter your Mailgun API key",
            initial: configuredEnv[coreEnv.email.mailgun.apiKey],
          },
          {
            type: "text",
            name: coreEnv.email.mailgun.domain,
            message: "Enter your Mailgun domain",
            initial: configuredEnv[coreEnv.email.mailgun.domain],
          },
          {
            type: "text",
            name: coreEnv.email.mailgun.apiUrl,
            message: "Enter your Mailgun API URL",
            initial:
              configuredEnv[coreEnv.email.mailgun.apiUrl] ??
              "https://api.mailgun.net",
          },
        ],
        {
          onCancel,
        },
      );
    case EmailProvider.NODEMAILER:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.email.nodemailer.user,
            message: "Enter your Nodemailer user",
            initial: configuredEnv[coreEnv.email.nodemailer.user],
          },
          {
            type: "text",
            name: coreEnv.email.nodemailer.password,
            message: "Enter your Nodemailer user password",
            initial: configuredEnv[coreEnv.email.nodemailer.password],
          },
          {
            type: "text",
            name: coreEnv.email.nodemailer.host,
            message: "Enter your Nodemailer host",
            initial: configuredEnv[coreEnv.email.nodemailer.host],
          },
          {
            type: "number",
            name: coreEnv.email.nodemailer.port,
            message: "Enter your Nodemailer port",
            initial: configuredEnv[coreEnv.email.nodemailer.port],
          },
        ],
        {
          onCancel,
        },
      );
  }
};

export const getEmailConfig = async (configuredEnv: Record<string, string>) => {
  const { provider } = await getEmailProvider();
  const env = await getEmailProviderConfig(provider, configuredEnv);

  return { provider, env };
};
