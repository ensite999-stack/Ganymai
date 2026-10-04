'use client'

import {FormEvent,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {createSupabaseBrowserClient} from '@/lib/supabase'

export function LoginForm(){
  const router=useRouter()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  function destination(){
    const next=new URLSearchParams(window.location.search).get('next')
    return next?.startsWith('/')?next:'/profile'
  }

  async function submit(e:FormEvent){
    e.preventDefault()
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setMessage('Sign in is unavailable.');return}
    if(!email.trim()||!password){setMessage('Enter your email and password.');return}
    setBusy(true)
    setMessage('')
    const {error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password})
    setBusy(false)
    if(error){setMessage(error.message);return}
    router.push(destination())
    router.refresh()
  }

  return <form className="login-form" onSubmit={submit}>
    <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <button type="submit" disabled={busy}>{busy?'Signing in…':'Sign in'}</button>
    {message&&<p className="login-message" aria-live="polite">{message}</p>}
    <p className="login-secondary">No account? <Link href="/signup">Create one</Link>.</p>
  </form>
}
