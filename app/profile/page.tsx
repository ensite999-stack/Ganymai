import type {Metadata} from 'next'
import {ProfileClient} from '@/components/ProfileClient'
export const metadata:Metadata={title:'Profile',robots:{index:false,follow:false}}
export default function ProfilePage(){
  return <section className="reader-page">
    <div className="eyebrow">ACCOUNT</div>
    <h1>Your profile.</h1>
    <ProfileClient/>
  </section>
}
