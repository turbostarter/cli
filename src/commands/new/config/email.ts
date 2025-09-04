import prompts from "prompts";

import { EmailProvider, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

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

const getEmailProviderConfig = async (provider: EmailProvider) => {
  switch (provider) {
    case EmailProvider.RESEND:
      return prompts(
        [
          {
            type: "text",
            name: config.env.email.resend.apiKey,
            message: "Enter your Resend API key",
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
            name: config.env.email.sendgrid.apiKey,
            message: "Enter your Sendgrid API key",
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
            name: config.env.email.plunk.apiKey,
            message: "Enter your Plunk API key",
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
            name: config.env.email.postmark.apiKey,
            message: "Enter your Postmark API key",
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
            name: config.env.email.nodemailer.user,
            message: "Enter your Nodemailer user",
          },
          {
            type: "text",
            name: config.env.email.nodemailer.password,
            message: "Enter your Nodemailer user password",
          },
          {
            type: "text",
            name: config.env.email.nodemailer.host,
            message: "Enter your Nodemailer host",
          },
          {
            type: "number",
            name: config.env.email.nodemailer.port,
            message: "Enter your Nodemailer port",
          },
        ],
        {
          onCancel,
        },
      );
  }
};

export const getEmailConfig = async () => {
  const { provider } = await getEmailProvider();
  const env = await getEmailProviderConfig(provider);

  return { provider, env };
};
