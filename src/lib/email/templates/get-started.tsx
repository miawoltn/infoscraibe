import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { APP_TITLE } from "@/lib/constants";

export interface GettingStartedTemplateProps {
  name: string;
}

export const GettingStartedTemplate = ({ name }: GettingStartedTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Get Started with {APP_TITLE} - Your Quick Guide</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>Getting Started with {APP_TITLE}</Text>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              Let&apos;s help you get the most out of your 1000 free credits with {APP_TITLE}. 
              Here&apos;s a simple guide to get you started:
            </Text>

            <Text style={stepTitle}>1. Upload Your First Document</Text>
            <Text style={stepContent}>
              Simply drag and drop your PDF onto the dashboard or click the upload button. 
              Your document will be processed and ready for interaction in seconds.
            </Text>

            <Text style={stepTitle}>2. Start a Conversation</Text>
            <Text style={stepContent}>
              Ask questions about your document in natural language. Try something like:
              • "What are the main points of this document?"
              • "Summarize the key findings"
              • "What does paragraph 3 say about...?"
            </Text>

            <Text style={stepTitle}>3. Explore Features</Text>
            <Text style={stepContent}>
              • Use highlights to mark important sections
              • Share insights with your team
              • Export conversations for later reference
            </Text>

            <Text style={callout}>
              We&apos;d love to hear your thoughts! Try these features with your free credits 
              and let us know what you think. Your feedback helps us improve {APP_TITLE} 
              for everyone.
            </Text>

            <Button style={button} href={process.env.NEXT_PUBLIC_APP_URL}>
              Start Your First Chat
            </Button>

            <Text style={text}>
              Need help? We&apos;re here for you!<br />
              The {APP_TITLE} Team
            </Text>
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
  color: "#0f1729",
  lineHeight: "24px",
  marginBottom: "16px",
};

const title = {
  ...text,
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  marginBottom: "24px",
};

const stepTitle = {
  ...text,
  fontSize: "18px",
  fontWeight: "600",
  marginTop: "24px",
  marginBottom: "8px",
};

const stepContent = {
  ...text,
  paddingLeft: "16px",
};

const button = {
  backgroundColor: "#0f1729",
  borderRadius: "8px",
  color: "#f8fafc",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  marginTop: "24px",
  marginBottom: "24px",
  border: "none",
};

const callout = {
  ...text,
  backgroundColor: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "24px",
  marginBottom: "24px",
  textAlign: "center" as const,
};