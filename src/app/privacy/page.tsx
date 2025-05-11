'use client'

import { APP_TITLE } from '@/lib/constants'

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">A. Data Collection and Purpose</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">1. Minimal Collection</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>We collect only the personal and usage data necessary for the operation and improvement of {APP_TITLE}</li>
                <li>This includes uploaded documents, chat content, and related metadata solely for app functionality</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">2. Purpose of Use</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Data is used exclusively for providing, maintaining, and enhancing the core functionalities of {APP_TITLE}</li>
                <li>User data is never used for marketing, profiling, or any secondary purposes without explicit, informed consent</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">3. Consent</h3>
              <p>By using {APP_TITLE}, users provide their explicit consent to collect and store the data described herein solely for the stated purposes.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">B. Data Storage and Security</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">1. Encryption</h3>
              <p>All documents, chat histories, and user information are stored using industry-standard encryption both in transit (via TLS/SSL) and at rest.</p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">2. Access Controls</h3>
              <p>Access to user data is strictly limited; each user is provided unique credentials. Only the user has the permission to access their stored data.</p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">3. Cloud Provider Standards</h3>
              <p>We partner with reputable cloud service providers that comply with rigorous international security standards (e.g., ISO/IEC 27001, SOC 2).</p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">4. Regular Audits</h3>
              <p>Our systems undergo periodic independent security audits to ensure compliance with best practices and industry standards.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">C. Data Retention and Deletion</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">1. Retention Period</h3>
              <p>User data is retained for as long as necessary to provide {APP_TITLE}'s functionality or until the user explicitly requests deletion.</p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">2. User Rights</h3>
              <p>Users have the right to access, rectify, or request the deletion of their personal data. Requests can be submitted through our designated support channels.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">D. Confidentiality and Non-Disclosure</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">1. Commitment to Confidentiality</h3>
              <p>We maintain stringent confidentiality protocols for all user data. Confidential Information is never disclosed to third parties except where required by law.</p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">2. No Unauthorized Access</h3>
              <p>Our technical and organizational measures ensure that no unauthorized internal or external parties can access user data.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">E. Third-Party Disclosures</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">No Sale of Data</h3>
              <p>We do not sell or rent user data to third parties.</p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Mandatory Disclosures</h3>
              <p>Disclosures may only occur pursuant to a legally binding order by a court or governmental authority or with the explicit consent of the user.</p>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>
      </div>
    </div>
  )
}