'use client'

import {FormEvent,useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {createSupabaseBrowserClient} from '@/lib/supabase'

export function ProfileClient(){
  const router=useRouter()
  const [loading,setLoading]=useState(true)
  const [userId,setUserId]=useState('')
  const [email,setEmail]=useState('')
  const [name,setName]=useState('')
  const [bio,setBio]=useState('')
  const [message,setMessage]=useState('')

  useEffect(()=>{
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setLoading(false);return}
    ;(async()=>{
      const {data:{user}}=await supabase.auth.getUser()
      if(!user){router.replace('/login?next=/profile');return}
      setUserId(user.id);setEmail(user.email||'')
      const {data}=await supabase.from('reader_profiles').select('display_name,bio').eq('user_id',user.id).maybeSingle()
      setName(data?.display_name||'')
      setBio(data?.bio||'')
      setLoading(false)
    })()
  },[router])

  async function save(e:FormEvent){
    e.preventDefault()
    const supabase=createSupabaseBrowserClient()
    if(!supabase||!userId)return
    const value=name.trim()
    if(value.length<2){setMessage('Display name must be at least two characters.');return}
    const {error}=await supabase.from('reader_profiles').upsert({user_id:userId,display_name:value,bio:bio.trim()||null,updated_at:new Date().toISOString()})
    setMessage(error?error.message:'Profile updated.')
  }

  async function signOut(){
    const supabase=createSupabaseBrowserClient()
    await supabase?.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if(loading)return <p className="account-loading">Loading…</p>

  return <div className="profile-grid">
    <form className="profile-form" onSubmit={save}>
      <label>Display name<input value={name} onChange={e=>setName(e.target.value)} maxLength={50}/><small>Shown with your comments.</small></label>
      <label>Email<input value={email} readOnly/></label>
      <label>Short bio<textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength={300}/></label>
      <button type="submit">Save profile</button>
      {message&&<p>{message}</p>}
    </form>
    <aside className="profile-links">
      <Link href="/library"><span>My Library</span><b>Saved essays →</b></Link>
      <Link href="/community-guidelines"><span>Comments</span><b>Community guidelines →</b></Link>
      <Link href="/donate"><span>Support</span><b>Support Ganymai →</b></Link>
      <button onClick={signOut}>Sign out</button>
    </aside>
  </div>
}
