import type { Metadata } from 'next'
import { BrandName } from '@/components/BrandName'

export const metadata:Metadata={
  title:'Terms of Use',
  description:'Terms governing access to and use of Ganymai, its editorial content and internal Studio tools.',
  alternates:{canonical:'/terms'}
}

export default function Page(){
  return <section className="text-page legal-page">
    <div className="eyebrow">TERMS</div>
    <h1>Terms of use.</h1>
    <p className="legal-updated">Last updated: 4 October 2026</p>

    <p>These terms govern access to and use of <BrandName />, including its essays, archive, comment features and internal editorial tools. By using the site, you agree to follow these terms and applicable law.</p>

    <h2>Editorial content</h2>
    <p>Essays and other editorial material are provided for reading, discussion and general informational purposes. They may express the views of individual authors and do not necessarily represent a single institutional position of <BrandName />.</p>

    <h2>Copyright and permitted use</h2>
    <p>Unless otherwise stated, text, design, branding and original site material are protected by copyright and other intellectual-property laws. You may link to public pages and make ordinary personal, non-commercial use of the site. Republishing substantial content, removing attribution, scraping for redistribution, or using material commercially requires permission unless an applicable legal exception permits it.</p>

    <h2>Third-party material and links</h2>
    <p>Articles may include third-party images, quotations, references or links. Rights in third-party material remain with their respective owners. A link does not imply endorsement, and <BrandName /> is not responsible for the availability, security or policies of external sites.</p>

    <h2>Internal Studio access</h2>
    <p><BrandName /> Studio is reserved for authorised members. Each member account has its own editorial workspace and access level. Members are responsible for keeping credentials secure and for activity performed through their account. Studio access may be changed or withdrawn by an administrator.</p>

    <h2>Acceptable use</h2>
    <p>You must not attempt to interfere with the site, bypass security controls, gain unauthorised access, introduce malicious code, misuse automated access, impersonate another person, or use the service in a way that infringes the rights of others.</p>

    <h2>No professional advice</h2>
    <p>Editorial content is not a substitute for legal, medical, financial or other professional advice. Readers should use independent judgment and, where appropriate, consult a qualified professional.</p>

    <h2>Availability and changes</h2>
    <p>We may change, suspend or remove features or content, correct errors, and maintain the service without guaranteeing uninterrupted availability. We may also update these terms; the revision date above indicates the current version.</p>

    <h2>Limitation</h2>
    <p>To the extent permitted by applicable law, the site is provided without warranties about uninterrupted availability or the completeness of every piece of editorial information. Nothing in these terms excludes rights or liabilities that cannot legally be excluded.</p>

    <h2>Privacy</h2>
    <p>Use of personal information is described in the <a href="/privacy">Privacy Policy</a>.</p>

    <h2>Contact</h2>
    <p>Questions about these terms, permissions or rights can be sent to <a href="mailto:hello@Ganymai.com">hello@Ganymai.com</a>.</p>
  </section>
}
