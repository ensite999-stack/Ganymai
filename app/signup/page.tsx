import type {Metadata} from 'next'
import {AuthForm} from '@/components/AuthForm'

export const metadata:Metadata={
  title:'Create account',
  description:'Create a Ganymai account.',
  robots:{index:false,follow:false}
}

export default function Page(){
  return <section className="account-page">
    <div className="eyebrow">SIGN UP</div>
    <h1>Create your account.</h1>
    <p className="account-intro">A simple Ganymai account, using your email address.</p>
    <AuthForm/>
  </section>
}
