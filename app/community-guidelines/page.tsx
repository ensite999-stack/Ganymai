import type {Metadata} from 'next'

export const metadata:Metadata={title:'Community guidelines'}

export default function CommunityGuidelines(){
  return <article className="text-page legal-page">
    <div className="eyebrow">COMMUNITY</div>
    <h1>Community guidelines.</h1>
    <p>You do not need an account to comment. Choose a display name before publishing; it may be a pseudonym. An avatar is optional. A coarse country or region may be shown automatically from network location.</p>

    <h2>Ordinary comments publish immediately</h2>
    <p>Ganymai does not place every comment into a manual approval queue. Most comments appear as soon as they pass the automated high-confidence safety check.</p>

    <h2>What is blocked automatically</h2>
    <p>Comments can be rejected when they clearly involve threats or violent incitement, sexual exploitation, gambling promotion, advertising or spam, extremist recruitment, serious-crime assistance, severe hate or harassment, or similar clearly unlawful material. Rejected comment and avatar data are not retained in the comments database.</p>

    <h2>Viewpoint is not the rule</h2>
    <p>Disagreement, criticism, unpopular opinions and strong political or social arguments are welcome. A comment is not blocked merely because it criticises a government, institution, ideology or social order.</p>

    <h2>After publication</h2>
    <p>Editors may remove a published comment that clearly breaches these rules or creates a serious legal or safety problem. When removed through our comment management tools, its stored comment data is deleted.</p>
  </article>
}
