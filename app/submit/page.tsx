import type {Metadata} from 'next'

export const metadata:Metadata={
  title:'Submit an essay',
  description:'Submit an essay to Ganymai by email.'
}

const email='hello@Ganymai.com'
const subject=encodeURIComponent('Essay submission — ')
const mailto='mailto:'+email+'?subject='+subject

export default function SubmitPage(){
  return <article className="text-page submission-page">
    <div className="eyebrow">SUBMISSIONS</div>
    <h1>Submit an essay.</h1>
    <p>Ganymai accepts submissions by email. There is no writer portal and contributors do not receive publishing access.</p>

    <div className="submission-grid">
      <section>
        <span>01</span>
        <h2>Send the work</h2>
        <p>You can paste the complete essay directly into the email, or attach it as a Word or PDF document.</p>
      </section>
      <section>
        <span>02</span>
        <h2>Include the essentials</h2>
        <p>Include the essay title, your name, a short author biography, and any image or source credits that are relevant to the submission.</p>
      </section>
      <section>
        <span>03</span>
        <h2>Editorial review</h2>
        <p>Submission does not create a publishing account. Ganymai reviews, edits and publishes accepted work through its internal editorial process.</p>
      </section>
    </div>

    <div className="submission-email">
      <span>SUBMIT BY EMAIL</span>
      <a href={mailto}>{email}</a>
      <p>Use an essay title in the subject line.</p>
    </div>
  </article>
}
