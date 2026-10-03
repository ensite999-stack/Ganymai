'use client'

import {FormEvent,useState} from 'react'
import {createSupabaseBrowserClient} from '@/lib/supabase'

export function FooterNewsletter(){
  const [email,setEmail]=useState('')
  const [status,setStatus]=useState('')
  const [busy,setBusy]=useState(false)

  async function submit(e:FormEvent){
    e.preventDefault()
    const value=email.trim().toLowerCase()
    if(!/^\S+@\S+\.\S+$/.test(value)){setStatus('Enter a valid email.');return}
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setStatus('Unavailable.');return}
    setBusy(true)
    setStatus('')
    const {error}=await supabase.from('subscribers').insert({email:value,locale:'en'})
    setBusy(false)
    if(error){
      setStatus(error.code==='23505'?'Already subscribed.':'Try again.')
      return
    }
    setEmail('')
    setStatus('Subscribed.')
  }

  return <div className="footer-newsletter">
    <form onSubmit={submit}>
      <span className="footer-newsletter-label">New essays by email</span>
      <input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" aria-label="Email address"/>
      <button type="submit" disabled={busy}>{busy?'…':'Subscribe'}</button>
    </form>
    {status&&<span className="newsletter-status" aria-live="polite">{status}</span>}
  </div>
}
