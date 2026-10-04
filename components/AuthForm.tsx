'use client'

import {FormEvent,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {createSupabaseBrowserClient} from '@/lib/supabase'

export function AuthForm(){
  const router=useRouter()
  const [name,setName]=useState('')
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
    const displayName=name.trim()
    const value=email.trim().toLowerCase()
    if(displayName.length<2){setMessage('Choose a display name of at least two characters.');return}
    if(!value||!password){setMessage('Enter your email and password.');return}
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setMessage('Account creation is unavailable.');return}

    setBusy(true)
    setMessage('')
    const {data,error}=await supabase.auth.signUp({
      email:value,
      password,
      options:{data:{display_name:displayName}}
    })
    setBusy(false)

    if(error){setMessage(error.message);return}
    setPassword('')
    if(data.session){
      router.push(destination())
      router.refresh()
      return
    }
    setMessage('Account created. Check your email to confirm your address.')
  }

  return <form className="account-form" onSubmit={submit}>
    <label>Display name
      <input type="text" autoComplete="nickname" value={name} onChange={e=>setName(e.target.value)} maxLength={50} required/>
      <small>Used on your account profile.</small>
    </label>
    <label>Email
      <input type="email" autoComplete="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
    </label>
    <label>Password
      <input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/>
    </label>
    <button className="account-primary" type="submit" disabled={busy}>{busy?'Creating…':'Create account'}</button>
    {message&&<p className="account-message" aria-live="polite">{message}</p>}
    <p className="account-secondary">Already have an account? <Link href="/login">Sign in</Link>.</p>
  </form>
}
