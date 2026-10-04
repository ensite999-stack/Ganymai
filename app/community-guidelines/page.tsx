import type {Metadata} from 'next'
export const metadata:Metadata={title:'Community guidelines'}
export default function CommunityGuidelines(){
  return <article className="text-page legal-page">
    <div className="eyebrow">COMMUNITY</div>
    <h1>Community guidelines.</h1>
    <p>Ganymai welcomes considered, civil responses to selected essays. Comments are a place to add thought, experience and disagreement without turning the page into a shouting match.</p>
    <h2>One comment per essay</h2>
    <p>You can make one main comment on each essay that has comments enabled. Make it count. You may edit your comment for one hour after posting.</p>
    <h2>Be rigorous, not hostile</h2>
    <p>Disagreement is welcome. Hate speech, personal attacks, harassment, defamation, intimidation, graphic abuse, advertising, impersonation, spam and off-topic promotion are not.</p>
    <h2>Likes and replies</h2>
    <p>Signed-in readers can upvote comments. Ganymai editors and authors may reply. Once an editor or author has replied, the original comment can no longer be deleted.</p>
    <h2>Moderation</h2>
    <p>Ganymai may moderate or remove comments that breach these guidelines. The aim is not to eliminate disagreement, but to protect a serious and useful discussion space.</p>
  </article>
}
