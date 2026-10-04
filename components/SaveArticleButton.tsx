'use client'

import {useEffect,useState} from 'react'
import Link from 'next/link'
import {createSupabaseBrowserClient} from '@/lib/supabase'

export function SaveArticleButton({articleId}:{articleId:string}){
  const [signedIn,setSignedIn]=useState<boolean|null>(null)
  const [saved,setSaved]=useState(false)
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setSignedIn(false);return}
    let live=true
    ;(async()=>{
      const {data:{user}}=await supabase.auth.getUser()
      if(!live) return
      setSignedIn(!!user)
      if(user){
        const {data}=await supabase.from('saved_articles').select('article_id').eq('user_id',user.id).eq('article_id',articleId).maybeSingle()
        if(live) setSaved(!!data)
      }
    })()
    return()=>{live=false}
  },[articleId])

  async function toggle(){
    const supabase=createSupabaseBrowserClient()
    if(!supabase) return
    const {data:{user}}=await supabase.auth.getUser()
    if(!user){setSignedIn(false);return}
    setBusy(true)
    if(saved){
      const {error}=await supabase.from('saved_articles').delete().eq('user_id',user.id).eq('article_id',articleId)
      if(!error)setSaved(false)
    }else{
      const {error}=await supabase.from('saved_articles').insert({user_id:user.id,article_id:articleId})
      if(!error)setSaved(true)
    }
    setBusy(false)
  }

  if(signedIn===false) return <Link className="save-article-button" href="/login">Save</Link>
  return <button className={'save-article-button '+(saved?'saved':'')} onClick={toggle} disabled={busy} aria-pressed={saved}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.75 3.75h10.5v16.5L12 16.65l-5.25 3.6V3.75Z"/></svg>
    {saved?'Saved':'Save'}
  </button>
}
