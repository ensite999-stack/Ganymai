'use client'

import {FormEvent,useState} from 'react'
import Link from 'next/link'
import {createSupabaseBrowserClient} from '@/lib/supabase'

export function AuthForm(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  async function submit(e:FormEvent){
    e.preventDefault()
    const value=email.trim().toLowerCase()
    if(!value||!password){setMessage('Enter your email and password.');return}
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setMessage('Account creation is unavailable.');return}

    setBusy(true)
    setMessage('')
    const {data,error}=await supabase.auth.signUp({email:value,password})
    setBusy(false)

    if(error){setMessage(error.message);return}
    setPassword('')
    setMessage(data.session
      ?'Account created. You are signed in.'
      :'Account created. Check your email to confirm your address.')
  }

  return <form className="account-form" onSubmit={submit}>
    <label>Email
      <input
        type="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        required
      />
    </label>
    <label>Password
      <input
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        minLength={6}
        required
      />
    </label>
    <button className="account-primary" type="submit" disabled={busy}>
      {busy?'Creating…':'Create account'}
    </button>
    {message&&<p className="account-message" aria-live="polite">{message}</p>}
    <p className="account-secondary">Already have an account? <Link href="/login">Sign in</Link>.</p>
  </form>
}
