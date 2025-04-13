import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { APP_TITLE } from "@/lib/constants";
import { Icons } from "../../../components/Icons";

export interface ResetPasswordTemplateProps {
    name: string;
    link: string;
}

export const ResetPasswordTemplate = ({ name, link }: ResetPasswordTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
        <Icons.logo className='fill-black-200 dark:fill-white text-black-200 dark:text-white h-8 w-8' />
          <Section>
            <Text style={title}>{APP_TITLE}</Text>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              Someone recently requested a password change for your {APP_TITLE} account. If this was
              you, you can set a new password here:
            </Text>
            <Button style={button} href={link}>
              Reset password
            </Button>
            <Text style={text}>
              If you don&apos;t want to change your password or didn&apos;t request this, just
              ignore and delete this message.
            </Text>
            <Text style={text}>
              To keep your account secure, please don&apos;t forward this email to anyone.
            </Text>
            <Text style={text}>Have a nice day!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "32px",
  maxWidth: "600px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "400",
  color: "#0f1729", // Based on --foreground value
  lineHeight: "24px",
};

const title = {
  ...text,
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#0f1729", // Based on --primary value
  borderRadius: "8px",
  color: "#f8fafc", // Based on --primary-foreground value
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  marginTop: "16px",
  marginBottom: "16px",
  border: "none",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};