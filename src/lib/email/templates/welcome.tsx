// import {
//   Body,
//   Button,
//   Container,
//   Head,
//   Html,
//   Img,
//   Preview,
//   Section,
//   Text,
// } from "@react-email/components";
// import { APP_TITLE } from "@/lib/constants";

// export interface WelcomeTemplateProps {
//   name: string;
// }

// export const WelcomeTemplate = ({ name }: WelcomeTemplateProps) => {
//   return (
//     <Html>
//       <Head />
//       <Preview>Welcome to {APP_TITLE} - Your AI-Powered Document Assistant</Preview>
//       <Body style={main}>
//         <Container style={container}>
//           <Section>
//             <Text style={title}>Welcome to {APP_TITLE}! 🎉</Text>
//             <Text style={text}>Hi {name},</Text>
//             <Text style={text}>
//               Thank you for joining {APP_TITLE}! We're excited to help you interact with your documents in a whole new way.
//             </Text>
            
//             <Text style={subtitle}>Here's what you can do with {APP_TITLE}:</Text>
//             <Text style={listItem}>• Upload your documents and chat with them naturally</Text>
//             <Text style={listItem}>• Ask questions and get instant, accurate answers</Text>
//             <Text style={listItem}>• Extract key information and insights effortlessly</Text>
//             <Text style={listItem}>• Share documents and conversations with others</Text>

//             <Text style={text}>
//               To get started:
//             </Text>
//             <Text style={listItem}>1. Upload your first PDF document</Text>
//             <Text style={listItem}>2. Ask any question about your document</Text>
//             <Text style={listItem}>3. Explore different ways to interact with your content</Text>


//             <Text style={callout}>
//               🎁 Your account has been credited with 100 credits - start exploring now!
//             </Text>

//             <Button style={button} href={process.env.NEXT_PUBLIC_APP_URL}>
//               Start Using {APP_TITLE}
//             </Button>

//             <Text style={text}>
//               Need help? Check out our documentation or reach out to our support team.
//             </Text>
//             <Text style={text}>
//               Best regards,<br />
//               The {APP_TITLE} Team
//             </Text>
//           </Section>
//         </Container>
//       </Body>
//     </Html>
//   );
// };

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

export interface WelcomeTemplateProps {
  name: string;
}

export const WelcomeTemplate = ({ name }: WelcomeTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {APP_TITLE} - Transform how you work with documents</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>Welcome to {APP_TITLE}! 🎉</Text>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              Thank you for joining {APP_TITLE}! We're thrilled to have you on board and can't 
              wait to transform how you interact with your documents.
            </Text>
            
            <Text style={text}>
              {APP_TITLE} is your intelligent document companion, designed to make document 
              interaction effortless and intuitive. Whether you're analyzing reports, 
              researching papers, or extracting insights from lengthy documents, we're here 
              to make that process seamless and efficient.
            </Text>

            <Text style={callout}>
              🎁 We've added 100 free credits to your account to help you get started!
            </Text>

            <Text style={text}>
              Keep an eye on your inbox – we'll be sending you a quick guide on how to make 
              the most of {APP_TITLE} and these credits.
            </Text>

            <Button style={button} href={process.env.NEXT_PUBLIC_APP_URL}>
              Explore {APP_TITLE}
            </Button>

            <Text style={text}>
              Welcome aboard!<br />
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

const subtitle = {
  ...text,
  fontSize: "18px",
  fontWeight: "600",
  marginTop: "24px",
};

const listItem = {
  ...text,
  paddingLeft: "8px",
  marginBottom: "8px",
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