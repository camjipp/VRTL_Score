"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-text">Privacy Policy</h1>
          <p className="mt-2 text-sm text-text-3">VRTL Score — Version 1.1</p>
          <p className="mt-1 text-sm text-text-3">Last updated / Effective Date: February 3, 2026</p>
        </header>

        <div className="prose prose-slate max-w-none">
          <p>
            This Privacy Policy explains how VRTL Score (“VRTL,” “we,” “us,” or “our”) collects, uses, discloses, and
            protects information when you access or use our website, application, and related services (collectively,
            the “Service”). By using the Service, you agree to the practices described in this Privacy Policy. This
            Policy is incorporated into and subject to our{" "}
            <Link className="text-text underline underline-offset-4" href="/terms">
              Terms of Service
            </Link>
            .
          </p>

          <h2>Definitions</h2>
          <p>
            <strong>“Personal Information”</strong> means information that identifies, relates to, describes, is
            reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a
            particular individual or household.
          </p>
          <p>
            <strong>“User Data”</strong> means any data you submit to the Service, including brand/domain inputs and
            generated reports.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect the following categories of information:</p>

          <h3>a. Account Information</h3>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Organization or agency name</li>
            <li>
              Billing information (processed securely by our third-party payment processor; we do not store full card
              details)
            </li>
          </ul>

          <h3>b. User Data and Client Data</h3>
          <ul>
            <li>Domains, brands, competitors, prompts, configurations, and related inputs you submit</li>
            <li>Reports, scores, analyses, and metadata generated through the Service</li>
          </ul>

          <h3>c. Usage and Technical Information</h3>
          <ul>
            <li>IP address</li>
            <li>Browser type, device information, and operating system</li>
            <li>Log data (pages viewed, actions taken, timestamps)</li>
            <li>Cookies and similar technologies for authentication, session management, and analytics</li>
          </ul>

          <h2>2. How We Use Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide, operate, maintain, and improve the Service (including generating reports and analyses)</li>
            <li>Authenticate users, manage accounts, and provide support</li>
            <li>
              Communicate with you (e.g., service updates, security notices, responses to inquiries)
            </li>
            <li>Ensure security, detect/prevent fraud or abuse, and enforce our Terms of Service</li>
            <li>Comply with legal obligations</li>
            <li>For legitimate business interests (e.g., product enhancement via aggregated data)</li>
          </ul>
          <p>
            Our primary lawful bases for processing (where applicable, e.g., under GDPR) are contractual necessity (to
            deliver the Service) and legitimate interests (e.g., security, improvements).
          </p>

          <h2>3. AI Model Interactions and Third-Party Processing</h2>
          <p>
            To provide analyses and reports, we send necessary prompts, inputs, or content (e.g., brand/domain queries)
            to third-party AI providers (such as OpenAI, Anthropic, Google, or similar).
          </p>
          <p>Key points:</p>
          <ul>
            <li>We do not control these third-party AI systems or their outputs.</li>
            <li>We do not use your Personal Information or User Data to train or fine-tune our own AI models.</li>
            <li>
              We do not authorize or instruct third-party providers to use your data for training their models beyond
              what&apos;s necessary to process your specific request (subject to their policies).
            </li>
            <li>
              Third-party providers process data solely to generate responses for us and are bound by their own privacy
              policies/terms. We select reputable providers with strong data protection commitments.
            </li>
          </ul>

          <h2>4. Aggregated and Anonymized Data</h2>
          <p>
            We may aggregate, de-identify, or anonymize data for analytics, product improvement, benchmarking, or
            research. Such data cannot reasonably identify you or your clients and is not subject to this Policy.
          </p>

          <h2>5. Data Sharing and Disclosure</h2>
          <p>We do not sell Personal Information (as defined under CCPA/CPRA).</p>
          <p>We may share information with:</p>
          <ul>
            <li>
              Service providers/subprocessors (e.g., hosting, databases, analytics, payment processors, AI providers)
              who are contractually obligated to protect it and use it only for our purposes
            </li>
            <li>
              To comply with legal obligations, respond to lawful requests, protect rights/safety, or enforce our Terms
            </li>
            <li>
              In connection with a merger, acquisition, bankruptcy, or asset sale (with notice where required)
            </li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>
            We retain Personal Information and User Data only as long as necessary to provide the Service, fulfill
            obligations, resolve disputes, or meet legal/compliance requirements. Upon account deletion or request, we
            will delete or anonymize data subject to backups, legal holds, or aggregated use.
          </p>

          <h2>7. Your Rights and Choices</h2>
          <p>
            Depending on your location (e.g., California under CCPA/CPRA, EU/EEA under GDPR), you may have rights
            including:
          </p>
          <ul>
            <li>Access to your Personal Information</li>
            <li>Correction of inaccuracies</li>
            <li>Deletion of your data (subject to exceptions)</li>
            <li>Opt-out of sale/sharing of Personal Information (if applicable; we do not sell)</li>
            <li>Limit use of sensitive Personal Information (if collected)</li>
            <li>Object to or restrict certain processing</li>
            <li>Withdraw consent (where consent is the basis)</li>
            <li>Non-discrimination for exercising rights</li>
          </ul>
          <p>
            To exercise rights, email <a href="mailto:contact@vrtlscore.com">contact@vrtlscore.com</a> with details. We
            respond within required timelines (e.g., 45 days under CCPA, 1 month under GDPR). Verification may be
            required. Authorized agents may submit on your behalf with proof.
          </p>

          <h3>CCPA/CPRA Notice for California Residents</h3>
          <p>
            We collect the categories of Personal Information listed in Section 1. We use them for business/commercial
            purposes described in Section 2. We disclose to service providers as noted. No sale/sharing occurs. You
            have the rights above; submit requests to <a href="mailto:contact@vrtlscore.com">contact@vrtlscore.com</a>.
          </p>

          <h2>8. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies for essential functions (authentication, sessions) and analytics.
            You can manage preferences via browser settings, though disabling may limit functionality.
          </p>

          <h2>9. Security</h2>
          <p>
            We implement commercially reasonable administrative, technical, and organizational measures to protect
            information from unauthorized access, loss, or misuse. However, no method is 100% secure, and we cannot
            guarantee absolute security.
          </p>

          <h2>10. International Users and Data Transfers</h2>
          <p>
            The Service is hosted in the United States. If you access from outside the US (e.g., EU/EEA), your
            information may be transferred to and processed in the US or other jurisdictions. We use appropriate
            safeguards (e.g., Standard Contractual Clauses where required) for international transfers.
          </p>

          <h2>11. Children’s Privacy</h2>
          <p>
            The Service is not directed to individuals under 18 (or 16/13 in some jurisdictions). We do not knowingly
            collect Personal Information from children. If we learn we have, we will delete it.
          </p>

          <h2>12. Changes to This Privacy Policy</h2>
          <p>
            We may update this Policy. Changes will be posted here with the updated date. We will notify registered
            users via email or in-app notice for material changes. Continued use after the effective date constitutes
            acceptance.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            For questions, rights requests, or concerns:
            <br />
            VRTL Score
            <br />
            <a href="mailto:contact@vrtlscore.com">contact@vrtlscore.com</a>
          </p>
        </div>
      </div>
    </main>
  );
}

