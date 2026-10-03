'use client'

import {FormEvent,useState} from 'react'
import Link from 'next/link'
import {createSupabaseBrowserClient} from '@/lib/supabase'

export function FooterNewsletter(){
  const [email,setEmail]=useState('')
  const [status,setStatus]=useState('')
  const [busy,setBusy]=useState(false)

  async function submit(e:FormEvent){
    e.preventDefault()
    const value=email.trim().toLowerCase()
    if(!/^\S+@\S+\.\S+$/.test(value)){setStatus('Enter a valid email address.');return}
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setStatus('Newsletter service is unavailable.');return}
    setBusy(true)
    setStatus('')
    const {error}=await supabase.from('subscribers').insert({email:value,locale:'en'})
    setBusy(false)
    if(error){
      if(error.code==='23505') setStatus('Already subscribed.')
      else setStatus('Could not subscribe. Please try again.')
      return
    }
    setEmail('')
    setStatus('Subscribed.')
  }

  return <section className="footer-newsletter" aria-labelledby="footer-newsletter-title">
    <h2 id="footer-newsletter-title">Newsletter</h2>
    <form onSubmit={submit}>
      <input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" aria-label="Email address"/>
      <button type="submit" disabled={busy} aria-label="Subscribe">{busy?'…':'→'}</button>
    </form>
    <div className="newsletter-meta">
      {status&&<span className="newsletter-status" aria-live="polite">{status}</span>}
      <Link href="/privacy">Privacy</Link>
    </div>
  </section>
}
