import type { Metadata } from 'next'
import { BrandName } from '@/components/BrandName'

export const metadata:Metadata={
  title:'Privacy Policy',
  description:'How Ganymai handles personal information, comments, browser storage, editorial accounts, newsletter data and service providers.',
  alternates:{canonical:'/privacy'}
}

export default function Page(){
  return <section className="text-page legal-page">
    <div className="eyebrow">PRIVACY</div>
    <h1>Privacy policy.</h1>
    <p className="legal-updated">Last updated: 4 October 2026</p>

    <p><BrandName /> is an independent editorial website. This policy explains what information may be processed when you read the site, comment, subscribe, apply to join, contact us, submit work, or use authorised internal editorial tools.</p>

    <h2>Information we may collect</h2>
    <ul>
      <li><strong>Comments:</strong> the display name you choose, the text of your comment, an optional avatar, and a coarse country or region derived from network location.</li>
      <li><strong>Newsletter information:</strong> an email address and related subscription preferences when you choose to subscribe.</li>
      <li><strong>Join applications:</strong> the name, email address and written responses you choose to submit when applying to join <BrandName />.</li>
      <li><strong>Internal member accounts:</strong> identifiers, authentication data, role information and account-scoped editorial workspace data used by authorised members.</li>
      <li><strong>Editorial information:</strong> drafts, article metadata, uploaded media and other material entered through <BrandName /> Studio by authorised internal editors.</li>
      <li><strong>Communications:</strong> information you send when contacting us or submitting work.</li>
      <li><strong>Technical information:</strong> ordinary hosting, security and request logs generated when the site is delivered.</li>
    </ul>

    <h2>Comments, location and moderation</h2>
    <p>You do not need an account to comment. Before publishing, you choose a display name and may add an avatar. The display name may be a pseudonym. When a comment is submitted, third-party infrastructure can provide coarse geolocation derived from the request IP address. <BrandName /> stores only the resulting country code and, when available, a coarse region label with the published comment; we do not store the raw IP address in the comments database.</p>
    <p>Comment text is checked automatically against high-confidence rules for clear safety and abuse violations. Ordinary comments are published immediately. If a comment is rejected by this check, the comment and optional avatar are not inserted into the comments database. Editors can later delete a published comment; deleting it removes the stored comment record, avatar data and stored coarse location together.</p>
    <p>Third-party infrastructure providers may still process or temporarily retain IP addresses and request logs for delivery, abuse prevention and security under their own retention practices.</p>

    <h2>Browser storage</h2>
    <p>The public site uses browser storage for functions such as theme preference and remembering a chosen comment display name on your device. Internal editorial tools may also keep an account-scoped local recovery copy of a draft in addition to the member workspace stored by our data-service infrastructure.</p>

    <h2>How information is used</h2>
    <p>We use information to operate and secure the site, display and moderate comments, publish and manage editorial material, maintain account-separated internal workspaces, review membership applications, provide requested subscriptions, respond to enquiries, prevent abuse, and maintain the reliability of the service.</p>

    <h2>Third-party infrastructure</h2>
    <p><BrandName /> relies on third-party infrastructure providers for services such as website hosting and delivery, coarse request geolocation, data storage, authentication, media storage and other backend functions. These providers may process technical, editorial or account information as necessary to provide those services under their own contractual and privacy obligations.</p>

    <h2>Sharing and sale of personal information</h2>
    <p>We do not sell personal information. Information may be disclosed to third-party infrastructure providers that help operate the site, when required by law, or when reasonably necessary to protect the security, rights and integrity of the service or its users.</p>

    <h2>Retention</h2>
    <p>Published comments remain until removed by <BrandName /> or otherwise deleted as part of site administration. Automatically rejected comments are not retained in the comments database. Internal editorial workspace data is retained while needed for editorial work and account administration. Other information is retained only for as long as reasonably necessary for the purpose for which it was collected, for security and record-keeping, or as required by applicable law.</p>

    <h2>International processing</h2>
    <p>Because online infrastructure may operate across countries, information can be processed outside the country where you are located. Where applicable, third-party infrastructure providers use legal and contractual safeguards for international transfers.</p>

    <h2>Your choices and rights</h2>
    <p>Depending on where you live, you may have rights to request access, correction, deletion or restriction of certain personal information, object to certain processing, withdraw consent, or lodge a complaint with a relevant data-protection authority. Newsletter recipients may unsubscribe from future messages.</p>

    <h2>Security</h2>
    <p>We use reasonable technical and organisational measures, including access controls and database-level permissions, to reduce the risk of unauthorised access. No internet service can guarantee absolute security.</p>

    <h2>Children</h2>
    <p><BrandName /> is a general-audience editorial publication and is not designed to collect personal information from young children. If you believe a child has provided personal information inappropriately, contact us so it can be reviewed.</p>

    <h2>Changes to this policy</h2>
    <p>We may update this policy when the site, its infrastructure or applicable requirements change. The date at the top of this page shows the latest revision.</p>

    <h2>Contact</h2>
    <p>Privacy enquiries can be sent to <a href="mailto:hello@Ganymai.com">hello@Ganymai.com</a>.</p>
  </section>
}
