'use client'

import { APP_TITLE } from '@/lib/constants'

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose dark:prose-invert">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using {APP_TITLE}, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.</p>

        <h2>2. Services Description</h2>
        <p>{APP_TITLE} provides an AI-powered document analysis and interaction platform. Users can upload documents, interact with them through natural language, and extract insights.</p>

        <h2>3. User Accounts</h2>
        <ul>
          <li>You must provide accurate registration information</li>
          <li>You are responsible for maintaining account security</li>
          <li>You must be at least 18 years old to use the service</li>
        </ul>

        <h2>4. Credits and Payment</h2>
        <ul>
          <li>Users receive 100 free credits upon email verification</li>
          <li>Additional credits can be purchased through our platform</li>
          <li>Credits are non-refundable and non-transferable</li>
          <li>We reserve the right to modify credit pricing</li>
        </ul>

        <h2>5. User Content</h2>
        <ul>
          <li>You retain ownership of your uploaded documents</li>
          <li>You grant us license to process and analyze your documents</li>
          <li>You must not upload illegal or unauthorized content</li>
        </ul>

        <h2>6. Privacy and Data Security</h2>
        <p>Your use of {APP_TITLE} is also governed by our Privacy Policy. We implement reasonable security measures to protect your data.</p>

        <h2>7. Service Availability</h2>
        <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. We reserve the right to modify or terminate the service at any time.</p>

        <h2>8. Limitation of Liability</h2>
        <p>{APP_TITLE} is provided "as is" without warranties. We are not liable for any damages arising from service use.</p>

        <h2>9. Changes to Terms</h2>
        <p>We may modify these terms at any time. Continued use after changes constitutes acceptance.</p>

        {/* <h2>10. Contact</h2>
        <p>For questions about these terms, contact us at [Your Contact Email].</p> */}

        {/* <p className="text-sm text-muted-foreground mt-8">Last updated: {new Date().toLocaleDateString()}</p> */}
      </div>
    </div>
  )
}