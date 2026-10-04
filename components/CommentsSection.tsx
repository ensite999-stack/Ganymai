'use client'

import {FormEvent,useEffect,useState} from 'react'
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
  body:string
  created_at:string
  comment_replies?:Reply[]
}

export function CommentsSection({articleId}:{articleId:string}){
  const [comments,setComments]=useState<Comment[]>([])
  const [body,setBody]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  async function load(){
    const supabase=createSupabaseBrowserClient()
    if(!supabase) return
    const {data}=await supabase.from('comments')
      .select('id,body,created_at,comment_replies(id,body,created_at,reader_profiles(display_name))')
      .eq('article_id',articleId)
      .eq('status','published')
      .order('created_at',{ascending:true})
    setComments((data||[]) as unknown as Comment[])
  }

  useEffect(()=>{load()},[articleId])

  async function submit(e:FormEvent){
    e.preventDefault()
    const text=body.trim()
    if(text.length<2){setMessage('Write a comment first.');return}

    const supabase=createSupabaseBrowserClient()
    if(!supabase){setMessage('Comments are unavailable right now.');return}

    setBusy(true)
    setMessage('')
    const {error}=await supabase.from('comments').insert({
      article_id:articleId,
      user_id:null,
      body:text,
      status:'pending',
      guidelines_accepted:true
    })
    setBusy(false)

    if(error){
      setMessage('We could not submit your comment. Please try again.')
      return
    }

    setBody('')
    setMessage('Submitted for review. It will appear here if approved.')
  }

  return <section className="comments-section" id="comments" aria-labelledby="comments-title">
    <div className="comments-heading">
      <div>
        <span className="eyebrow">COMMENTS</span>
        <h2 id="comments-title">Anonymous responses</h2>
      </div>
      <span>{comments.length} {comments.length===1?'comment':'comments'}</span>
    </div>

    <p className="anonymous-comment-note">No account is required and we do not ask for your name or email. Comments are reviewed before publication.</p>

    <form className="comment-form" onSubmit={submit}>
      <textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={5000} placeholder="Write an anonymous response…" aria-label="Anonymous comment"/>
      <p className="comment-policy-note">By submitting, you agree that the comment may be withheld if it contains threats or violence, sexual exploitation or explicit pornography, gambling promotion, advertising or spam, terrorist advocacy, criminal facilitation, severe harassment or hate, or other clearly unlawful material. Political disagreement or criticism is not rejected merely for its viewpoint. <Link href="/community-guidelines">Read the guidelines.</Link></p>
      <div className="comment-submit-row">
        <small>{body.length}/5000</small>
        <button type="submit" disabled={busy}>{busy?'Submitting…':'Submit for review'}</button>
      </div>
    </form>

    {message&&<p className="comment-message anonymous-comment-message" aria-live="polite">{message}</p>}

    <div className="comment-list">
      {comments.map(comment=><article className="comment-item" key={comment.id}>
        <header>
          <strong>Anonymous</strong>
          <time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleDateString('en',{year:'numeric',month:'short',day:'numeric'})}</time>
        </header>
        <p className="comment-body">{comment.body}</p>

        {!!comment.comment_replies?.length&&<div className="comment-replies">
          {comment.comment_replies.map(reply=><div className="comment-reply" key={reply.id}>
            <div><strong>{reply.reader_profiles?.display_name||'Ganymai'}</strong><span>Editor</span></div>
            <p>{reply.body}</p>
          </div>)}
        </div>}
      </article>)}
    </div>
  </section>
}
