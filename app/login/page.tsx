import type {Metadata} from 'next'
import {LoginForm} from '@/components/LoginForm'

export const metadata:Metadata={
  title:'Sign in',
  description:'Sign in to Ganymai.',
  robots:{index:false,follow:false}
}

export default function Login(){
  return <section className="account-page">
    <div className="eyebrow">SIGN IN</div>
    <h1>Welcome back.</h1>
    <p className="account-intro">Sign in with the email address connected to your account.</p>
    <LoginForm/>
  </section>
}
