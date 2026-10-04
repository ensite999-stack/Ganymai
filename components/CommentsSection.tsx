'use client'

import {FormEvent,useEffect,useMemo,useState} from 'react'
import Link from 'next/link'
import {createSupabaseBrowserClient} from '@/lib/supabase'

type Reply={
  id:string
  body:string
  created_at:string
  reader_profiles?:{display_name:string}|null
}
type Comment={
  id:string
  display_name:string|null
  avatar_data:string|null
  country_code:string|null
  region_name:string|null
  body:string
  created_at:string
  comment_replies?:Reply[]
}

function locationLabel(comment:Comment){
  const code=(comment.country_code||'').toUpperCase()
  let country=''
  if(code){
    try{country=new Intl.DisplayNames(['en'],{type:'region'}).of(code)||code}catch{country=code}
  }
  const region=comment.region_name?.trim()||''
  if(country&&region)return country+' · '+region
  return country||region
}

async function resizeAvatar(file:File){
  if(file.size>5*1024*1024) throw new Error('Choose an image under 5 MB.')
  if(!file.type.startsWith('image/')) throw new Error('Choose an image file.')

  const objectUrl=URL.createObjectURL(file)
  try{
    const img=await new Promise<HTMLImageElement>((resolve,reject)=>{
      const image=new Image()
      image.onload=()=>resolve(image)
      image.onerror=()=>reject(new Error('That image could not be read.'))
      image.src=objectUrl
    })

    const canvas=document.createElement('canvas')
    const size=96
    canvas.width=size
    canvas.height=size
    const ctx=canvas.getContext('2d')
    if(!ctx) throw new Error('That image could not be processed.')

    const side=Math.min(img.naturalWidth,img.naturalHeight)
    const sx=(img.naturalWidth-side)/2
    const sy=(img.naturalHeight-side)/2
    ctx.drawImage(img,sx,sy,side,side,0,0,size,size)

    let data=canvas.toDataURL('image/webp',.78)
    if(!data.startsWith('data:image/webp')) data=canvas.toDataURL('image/jpeg',.8)
    if(data.length>145000) data=canvas.toDataURL('image/jpeg',.62)
    if(data.length>145000) throw new Error('That image is still too large after processing.')
    return data
  }finally{
    URL.revokeObjectURL(objectUrl)
  }
}

export function CommentsSection({articleId}:{articleId:string}){
  const [comments,setComments]=useState<Comment[]>([])
  const [displayName,setDisplayName]=useState('')
  const [body,setBody]=useState('')
  const [avatarData,setAvatarData]=useState<string|null>(null)
  const [avatarMessage,setAvatarMessage]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  const initial=useMemo(()=>displayName.trim().slice(0,1).toUpperCase()||'A',[displayName])

  async function load(){
    const supabase=createSupabaseBrowserClient()
    if(!supabase) return
    const {data}=await supabase.from('comments')
      .select('id,display_name,avatar_data,country_code,region_name,body,created_at,comment_replies(id,body,created_at,reader_profiles(display_name))')
      .eq('article_id',articleId)
      .eq('status','published')
      .order('created_at',{ascending:true})
    setComments((data||[]) as unknown as Comment[])
  }

  useEffect(()=>{
    load()
    const saved=localStorage.getItem('ganymai-comment-name')
    if(saved)setDisplayName(saved.slice(0,40))
  },[articleId])

  async function chooseAvatar(file:File|null){
    if(!file){setAvatarData(null);setAvatarMessage('');return}
    setAvatarMessage('Processing image…')
    try{
      const data=await resizeAvatar(file)
      setAvatarData(data)
      setAvatarMessage('')
    }catch(e){
      setAvatarData(null)
      setAvatarMessage(e instanceof Error?e.message:'That image could not be used.')
    }
  }

  async function submit(e:FormEvent){
    e.preventDefault()
    const name=displayName.trim()
    const text=body.trim()
    if(name.length<1){setMessage('Choose a display name first.');return}
    if(text.length<2){setMessage('Write a comment first.');return}

    setBusy(true)
    setMessage('')
    try{
      const response=await fetch('/api/comments',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({articleId,displayName:name,body:text,avatarData})
      })
      const result=await response.json()
      if(!response.ok){
        setMessage(result?.error||'We could not publish your comment.')
        return
      }

      localStorage.setItem('ganymai-comment-name',name)
      setBody('')
      setMessage('Published.')
      await load()
    }catch{
      setMessage('We could not publish your comment. Please try again.')
    }finally{
      setBusy(false)
    }
  }

  return <section className="comments-section" id="comments" aria-labelledby="comments-title">
    <div className="comments-heading">
      <div>
        <span className="eyebrow">COMMENTS</span>
        <h2 id="comments-title">Open responses</h2>
      </div>
      <span>{comments.length} {comments.length===1?'comment':'comments'}</span>
    </div>

    <p className="anonymous-comment-note">No account is required. Choose any display name; it does not need to be your real name. A coarse country or region is added automatically from network location, without storing your raw IP address.</p>

    <form className="comment-form comment-form-open" onSubmit={submit}>
      <div className="comment-identity">
        <label className="comment-avatar-picker">
          {avatarData?<img src={avatarData} alt="Selected avatar"/>:<span aria-hidden="true">{initial}</span>}
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>chooseAvatar(e.target.files?.[0]||null)}/>
          <b>{avatarData?'Change avatar':'Add avatar'}</b>
        </label>

        <label className="comment-name-field">Display name
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={40} placeholder="Any name you choose" required/>
        </label>
      </div>
      {avatarMessage&&<p className="comment-avatar-message">{avatarMessage}</p>}

      <textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={5000} placeholder="Write a response…" aria-label="Comment"/>
      <p className="comment-policy-note">Ordinary comments publish immediately. Clear violations of the community rules are rejected automatically and not retained. Political disagreement or criticism is not blocked merely for its viewpoint. <Link href="/community-guidelines">Read the guidelines.</Link></p>
      <div className="comment-submit-row">
        <small>{body.length}/5000</small>
        <button type="submit" disabled={busy}>{busy?'Publishing…':'Publish comment'}</button>
      </div>
    </form>

    {message&&<p className="comment-message anonymous-comment-message" aria-live="polite">{message}</p>}

    <div className="comment-list">
      {comments.map(comment=>{
        const place=locationLabel(comment)
        const letter=(comment.display_name||'A').trim().slice(0,1).toUpperCase()
        return <article className="comment-item" key={comment.id}>
          <header className="comment-public-header">
            <div className="comment-author">
              {comment.avatar_data?<img src={comment.avatar_data} alt=""/>:<span className="comment-avatar-fallback" aria-hidden="true">{letter}</span>}
              <div>
                <strong>{comment.display_name||'Anonymous'}</strong>
                {place&&<small>{place}</small>}
              </div>
            </div>
            <time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleDateString('en',{year:'numeric',month:'short',day:'numeric'})}</time>
          </header>
          <p className="comment-body">{comment.body}</p>

          {!!comment.comment_replies?.length&&<div className="comment-replies">
            {comment.comment_replies.map(reply=><div className="comment-reply" key={reply.id}>
              <div><strong>{reply.reader_profiles?.display_name||'Ganymai'}</strong><span>Editor</span></div>
              <p>{reply.body}</p>
            </div>)}
          </div>}
        </article>
      })}
    </div>
  </section>
}
