import type {Metadata} from 'next'
import {JoinForm} from '@/components/JoinForm'

export const metadata:Metadata={
  title:'Join us',
  description:'Apply to join the independent members who operate Ganymai.',
  alternates:{canonical:'/join'}
}

export default function JoinPage(){
  return <section className="join-page">
    <div className="eyebrow">JOIN US</div>
    <h1>Come for the work. Stay for the values.</h1>
    <p className="join-intro">Ganymai is operated by independent members who have come together around a shared view of people and the world.</p>

    <div className="join-belief">
      <p>We believe people and the world exist in a relationship of mutual dependence.</p>
      <p className="human-world">The human world is free and plural.</p>
      <p>Whether poor or wealthy, healthy or disabled, whatever a person’s appearance, each life belongs fully within that world.</p>
    </div>

    <div className="join-form-head">
      <span>APPLICATION</span>
      <h2>Tell us why you want to be part of Ganymai.</h2>
    </div>
    <JoinForm/>
  </section>
}
