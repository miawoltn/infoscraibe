import { Body, Container, Head, Html, Preview, Section, Text } from "@react-email/components";
import { APP_TITLE } from "@/lib/constants";

export interface EmailVerificationTemplateProps {
  code: string;
}

export const EmailVerificationTemplate = ({ code }: EmailVerificationTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address to complete your {APP_TITLE} registration</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>{APP_TITLE}</Text>
            <Text style={text}>Hi,</Text>
            <Text style={text}>
              Thank you for registering for an account on {APP_TITLE}. To complete your
              registration, please verify your your account by using the following code:
            </Text>
            <Text style={codePlaceholder}>{code}</Text>

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
  padding: "45px",
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

const codePlaceholder = {
  backgroundColor: "#fbfbfb",
  border: "1px solid #f0f0f0",
  borderRadius: "4px",
  color: "#1c1c1c",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};