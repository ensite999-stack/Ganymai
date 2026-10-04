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
  user_id:string
  body:string
  like_count:number
  created_at:string
  updated_at:string
  reader_profiles?:{display_name:string}|null
  comment_replies?:Reply[]
}

export function CommentsSection({articleId,slug}:{articleId:string;slug:string}){
  const [comments,setComments]=useState<Comment[]>([])
  const [userId,setUserId]=useState<string|null>(null)
  const [displayName,setDisplayName]=useState('')
  const [body,setBody]=useState('')
  const [agree,setAgree]=useState(false)
  const [liked,setLiked]=useState<Set<string>>(new Set())
  const [editing,setEditing]=useState<string|null>(null)
  const [editBody,setEditBody]=useState('')
  const [replying,setReplying]=useState<string|null>(null)
  const [replyBody,setReplyBody]=useState('')
  const [canReply,setCanReply]=useState(false)
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  const mine=useMemo(()=>comments.find(c=>c.user_id===userId)||null,[comments,userId])

  async function load(){
    const supabase=createSupabaseBrowserClient()
    if(!supabase) return
    const [{data:rows},{data:{user}}]=await Promise.all([
      supabase.from('comments')
        .select('id,user_id,body,like_count,created_at,updated_at,reader_profiles(display_name),comment_replies(id,body,created_at,reader_profiles(display_name))')
        .eq('article_id',articleId)
        .order('created_at',{ascending:true}),
      supabase.auth.getUser()
    ])
    setComments((rows||[]) as unknown as Comment[])
    setUserId(user?.id||null)
    if(user){
      const [{data:profile},{data:likes},{data:owned}]=await Promise.all([
        supabase.from('reader_profiles').select('display_name').eq('user_id',user.id).maybeSingle(),
        supabase.from('comment_likes').select('comment_id').eq('user_id',user.id),
        supabase.from('editor_accounts').select('role').eq('user_id',user.id).maybeSingle()
      ])
      setDisplayName(profile?.display_name||'')
      setLiked(new Set((likes||[]).map(x=>x.comment_id)))
      setCanReply(!!owned)
    }else{
      setDisplayName('')
      setLiked(new Set())
      setCanReply(false)
    }
  }

  useEffect(()=>{load()},[articleId])

  async function submit(e:FormEvent){
    e.preventDefault()
    const text=body.trim()
    if(!text){setMessage('Write a comment first.');return}
    if(!agree){setMessage('Agree to the community guidelines before posting.');return}
    const supabase=createSupabaseBrowserClient()
    if(!supabase||!userId){setMessage('Sign in to comment.');return}
    setBusy(true)
    setMessage('')
    const {error}=await supabase.from('comments').insert({
      article_id:articleId,user_id:userId,body:text,guidelines_accepted:true
    })
    setBusy(false)
    if(error){
      setMessage(error.code==='23505'?'You can make one comment on this article.':error.message)
      return
    }
    setBody('')
    setAgree(false)
    await load()
  }

  async function toggleLike(commentId:string){
    const supabase=createSupabaseBrowserClient()
    if(!supabase||!userId){setMessage('Sign in to like comments.');return}
    const next=new Set(liked)
    if(next.has(commentId)){
      const {error}=await supabase.from('comment_likes').delete().eq('comment_id',commentId).eq('user_id',userId)
      if(!error) next.delete(commentId)
    }else{
      const {error}=await supabase.from('comment_likes').insert({comment_id:commentId,user_id:userId})
      if(!error) next.add(commentId)
    }
    setLiked(next)
    await load()
  }

  function canEdit(comment:Comment){
    return comment.user_id===userId && Date.now()-new Date(comment.created_at).getTime()<60*60*1000
  }

  async function saveEdit(commentId:string){
    const text=editBody.trim()
    if(!text)return
    const supabase=createSupabaseBrowserClient()
    if(!supabase)return
    const {error}=await supabase.from('comments').update({body:text,updated_at:new Date().toISOString()}).eq('id',commentId)
    if(error){setMessage('Comments can be edited for one hour after posting.');return}
    setEditing(null)
    setEditBody('')
    await load()
  }

  async function remove(commentId:string){
    const supabase=createSupabaseBrowserClient()
    if(!supabase)return
    const {error}=await supabase.from('comments').delete().eq('id',commentId)
    if(error){setMessage('A comment cannot be deleted after an editor or author has replied.');return}
    await load()
  }

  async function submitReply(commentId:string){
    const text=replyBody.trim()
    if(!text||!userId)return
    const supabase=createSupabaseBrowserClient()
    if(!supabase)return
    const {error}=await supabase.from('comment_replies').insert({comment_id:commentId,user_id:userId,body:text})
    if(error){setMessage(error.message);return}
    setReplying(null)
    setReplyBody('')
    await load()
  }

  const loginHref='/login?next='+encodeURIComponent('/essay/'+slug+'#comments')
  const signupHref='/signup?next='+encodeURIComponent('/essay/'+slug+'#comments')

  return <section className="comments-section" id="comments" aria-labelledby="comments-title">
    <div className="comments-heading">
      <div>
        <span className="eyebrow">COMMENTS</span>
        <h2 id="comments-title">Considered responses</h2>
      </div>
      <span>{comments.length} {comments.length===1?'comment':'comments'}</span>
    </div>

    {!userId
      ?<p className="comments-signin"><Link href={loginHref}>Sign in</Link> or <Link href={signupHref}>create an account</Link> to like or post a comment.</p>
      :mine
        ?<p className="comments-one-note">You have made your one comment on this article. Make it count.</p>
        :<form className="comment-form" onSubmit={submit}>
          {displayName&&<p className="commenting-as">Commenting as <strong>{displayName}</strong></p>}
          <textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={5000} placeholder="Add a thoughtful response…" aria-label="Comment"/>
          <label className="comment-guidelines">
            <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/>
            <span>I agree to the <Link href="/community-guidelines">community guidelines</Link>.</span>
          </label>
          <div className="comment-submit-row"><small>{body.length}/5000</small><button type="submit" disabled={busy}>{busy?'Posting…':'Post comment'}</button></div>
        </form>}

    {message&&<p className="comment-message" aria-live="polite">{message}</p>}

    <div className="comment-list">
      {comments.map(comment=><article className="comment-item" key={comment.id}>
        <header>
          <strong>{comment.reader_profiles?.display_name||'Reader'}</strong>
          <time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleDateString('en',{year:'numeric',month:'short',day:'numeric'})}</time>
        </header>

        {editing===comment.id
          ?<div className="comment-edit">
            <textarea value={editBody} onChange={e=>setEditBody(e.target.value)} maxLength={5000}/>
            <div><button onClick={()=>saveEdit(comment.id)}>Save edit</button><button onClick={()=>setEditing(null)}>Cancel</button></div>
          </div>
          :<p className="comment-body">{comment.body}</p>}

        <div className="comment-actions">
          <button className={liked.has(comment.id)?'liked':''} onClick={()=>toggleLike(comment.id)} aria-pressed={liked.has(comment.id)}>
            ↑ {comment.like_count||0}
          </button>
          {canEdit(comment)&&editing!==comment.id&&<button onClick={()=>{setEditing(comment.id);setEditBody(comment.body)}}>Edit</button>}
          {comment.user_id===userId&&editing!==comment.id&&<button onClick={()=>remove(comment.id)}>Delete</button>}
          {canReply&&<button onClick={()=>{setReplying(replying===comment.id?null:comment.id);setReplyBody('')}}>Reply</button>}
        </div>

        {!!comment.comment_replies?.length&&<div className="comment-replies">
          {comment.comment_replies.map(reply=><div className="comment-reply" key={reply.id}>
            <div><strong>{reply.reader_profiles?.display_name||'Ganymai'}</strong><span>Editor / author</span></div>
            <p>{reply.body}</p>
          </div>)}
        </div>}

        {canReply&&replying===comment.id&&<div className="comment-reply-form">
          <textarea value={replyBody} onChange={e=>setReplyBody(e.target.value)} placeholder="Reply as editor / author…" maxLength={5000}/>
          <div><button onClick={()=>submitReply(comment.id)}>Post reply</button><button onClick={()=>setReplying(null)}>Cancel</button></div>
        </div>}
      </article>)}
    </div>
  </section>
}
