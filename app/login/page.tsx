import type {Metadata} from 'next'
import {LoginForm} from '@/components/LoginForm'

export const metadata:Metadata={
  title:'Sign in',
  description:'Sign in to Ganymai.',
  robots:{index:false,follow:false}
}

export default function Login(){
  return <section className="login-page">
    <div className="eyebrow">SIGN IN</div>
    <h1>Welcome back.</h1>
    <LoginForm/>
  </section>
}
