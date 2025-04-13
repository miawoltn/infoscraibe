import "server-only";

import { EmailVerificationTemplate } from "./templates/email-verification";
import { ResetPasswordTemplate } from "./templates/reset-password";
import { render } from "@react-email/render";
import { createTransport, type TransportOptions } from "nodemailer";
import type { ComponentProps } from "react";
import { APP_TITLE, EMAIL_SENDER } from "../constants";
import { Resend } from 'resend';
import { WelcomeTemplate } from "./templates/welcome";
import { GettingStartedTemplate } from "./templates/get-started";

type NoInfer<T> = [T][T extends any ? 0 : never];

export enum EmailTemplate {
  EmailVerification = "EmailVerification",
  PasswordReset = "PasswordReset",
  Welcome = "Welcome",
  GettingStarted = "GettingStarted"
}

export type PropsMap = {
  [EmailTemplate.EmailVerification]: ComponentProps<typeof EmailVerificationTemplate>;
  [EmailTemplate.PasswordReset]: ComponentProps<typeof ResetPasswordTemplate>;
  [EmailTemplate.Welcome]: ComponentProps<typeof WelcomeTemplate>;
  [EmailTemplate.GettingStarted]: ComponentProps<typeof GettingStartedTemplate>;
};

const getEmailTemplate = <T extends EmailTemplate>(template: T, props: PropsMap[NoInfer<T>]) => {
  switch (template) {
    case EmailTemplate.EmailVerification:
      return {
        subject: "Verify your email address",
        body: render(
          <EmailVerificationTemplate {...(props as PropsMap[EmailTemplate.EmailVerification])} />,
        ),
      };
    case EmailTemplate.PasswordReset:
      return {
        subject: "Reset your password",
        body: render(
          <ResetPasswordTemplate {...(props as PropsMap[EmailTemplate.PasswordReset])} />,
        ),
      };
    case EmailTemplate.Welcome:
        return {
          subject: `Welcome to ${APP_TITLE}!`,
          body: render(
            <WelcomeTemplate {...(props as PropsMap[EmailTemplate.Welcome])} />,
          ),
        };
    case EmailTemplate.GettingStarted:
        return {
          subject: `Get Started - ${APP_TITLE}!`,
          body: render(
            <GettingStartedTemplate {...(props as PropsMap[EmailTemplate.GettingStarted])} />,
          ),
        };
    default:
      throw new Error("Invalid email template");
  }
};

const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

const transporter = createTransport(smtpConfig as TransportOptions);
const resend = new Resend(process.env.RESEND_API_KEY || "");

export const sendEmail = async <T extends EmailTemplate>(
  to: string,
  template: T,
  props: PropsMap[NoInfer<T>],
) => {
  if (process.env.MOCK_SEND_EMAIL) {
    console.info("📨 Email sent to:", to, "with template:", template, "and props:", props);
    return;
  }

  const { subject, body } = getEmailTemplate(template, props);

  // return transporter.sendMail({ from: EMAIL_SENDER, to, subject, html: await body });
  const { data, error } = await resend.emails.send({
    from: EMAIL_SENDER,
    to,
    subject,
    html: await body,
  });

  console.log({ data, error });

  return { data, error };
};