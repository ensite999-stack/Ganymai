'use client'

import {FormEvent,useState} from 'react'
import {createSupabaseBrowserClient} from '@/lib/supabase'

export function JoinForm(){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [reason,setReason]=useState('')
  const [philosophy,setPhilosophy]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const [sent,setSent]=useState(false)

  async function submit(e:FormEvent){
    e.preventDefault()
    const n=name.trim()
    const em=email.trim().toLowerCase()
    const r=reason.trim()
    const p=philosophy.trim()

    if(n.length<2){setMessage('Please enter your name.');return}
    if(!/^\S+@\S+\.\S+$/.test(em)){setMessage('Please enter a valid email address.');return}
    if(r.length<20){setMessage('Tell us a little more about why you want to join.');return}
    if(p.length<20){setMessage('Tell us a little more about your values or philosophy.');return}

    const supabase=createSupabaseBrowserClient()
    if(!supabase){setMessage('Applications are unavailable right now.');return}

    setBusy(true)
    setMessage('')
    const {error}=await supabase.from('join_applications').insert({
      name:n,
      email:em,
      reason:r,
      philosophy:p
    })
    setBusy(false)

    if(error){
      setMessage('We could not submit your application. Please try again.')
      return
    }

    setSent(true)
    setName('')
    setEmail('')
    setReason('')
    setPhilosophy('')
  }

  if(sent) return <div className="join-success" role="status">
    <span>APPLICATION RECEIVED</span>
    <h2>Thank you.</h2>
    <p>We will read your application carefully. Joining Ganymai is based on shared values, not publishing access or status.</p>
  </div>

  return <form className="join-form" onSubmit={submit}>
    <div className="join-form-row">
      <label>Name
        <input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" maxLength={100} required/>
      </label>
      <label>Email
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" inputMode="email" maxLength={254} required/>
      </label>
    </div>

    <label>Why do you want to join Ganymai?
      <textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={4000} required/>
      <small>{reason.length}/4000</small>
    </label>

    <label>What do you believe about people and the world?
      <textarea value={philosophy} onChange={e=>setPhilosophy(e.target.value)} maxLength={4000} required/>
      <small>{philosophy.length}/4000</small>
    </label>

    <div className="join-submit">
      <p>Applications are reviewed privately. Membership does not provide editorial or publishing access.</p>
      <button type="submit" disabled={busy}>{busy?'Submitting…':'Submit application'}</button>
    </div>

    {message&&<p className="join-message" aria-live="polite">{message}</p>}
  </form>
}
