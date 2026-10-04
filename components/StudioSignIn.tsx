'use client'

import {FormEvent,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createSupabaseBrowserClient} from '@/lib/supabase'

export function StudioSignIn(){
  const router=useRouter()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  async function submit(e:FormEvent){
    e.preventDefault()
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setMessage('Studio access is unavailable.');return}

    setBusy(true)
    setMessage('')
    const {data,error}=await supabase.auth.signInWithPassword({
      email:email.trim().toLowerCase(),
      password
    })

    if(error||!data.user){
      setBusy(false)
      setMessage('Access denied.')
      return
    }

    const {data:member}=await supabase
      .from('editor_accounts')
      .select('role,active')
      .eq('user_id',data.user.id)
      .maybeSingle()

    if(!member?.active){
      await supabase.auth.signOut()
      setBusy(false)
      setMessage('This account does not have Studio access.')
      return
    }

    setBusy(false)
    router.replace('/studio')
    router.refresh()
  }

  return <form className="studio-signin-form" onSubmit={submit}>
    <label>Email
      <input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/>
    </label>
    <label>Password
      <input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/>
    </label>
    <button type="submit" disabled={busy}>{busy?'Checking…':'Enter Studio'}</button>
    {message&&<p aria-live="polite">{message}</p>}
  </form>
}
