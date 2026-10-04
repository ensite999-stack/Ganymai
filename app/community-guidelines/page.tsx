import type {Metadata} from 'next'

export const metadata:Metadata={title:'Community guidelines'}

export default function CommunityGuidelines(){
  return <article className="text-page legal-page">
    <div className="eyebrow">COMMUNITY</div>
    <h1>Community guidelines.</h1>
    <p>Ganymai comments are anonymous. You do not need an account, and the comment form does not ask for your name or email. Every comment is reviewed before it becomes public.</p>

    <h2>What can be published</h2>
    <p>Disagreement, criticism, unpopular opinions and strong political or social arguments are welcome when they are expressed without crossing the safety boundaries below. A comment is not rejected merely because it criticises a government, institution, ideology or social order.</p>

    <h2>What we withhold</h2>
    <p>We may withhold material involving credible threats or incitement to violence, sexual exploitation or explicit pornography, gambling promotion, advertising or spam, terrorist advocacy or recruitment, instructions that materially facilitate crime, severe harassment or hate, and other clearly unlawful material or serious violations of public safety.</p>

    <h2>Moderation</h2>
    <p>Submission does not guarantee publication. Editors review comments for these boundaries rather than for agreement with Ganymai. Approved comments appear as Anonymous. Editors may reply publicly where useful.</p>
  </article>
}
