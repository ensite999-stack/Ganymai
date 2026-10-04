'use client'

import {useEffect,useState} from 'react'
import Link from 'next/link'
import {createSupabaseBrowserClient} from '@/lib/supabase'

type Row={
  id:string
  body:string
  status:'pending'|'published'|'rejected'|'removed'
  created_at:string
  article_id:string
  articles:{title:string;slug:string}|null
}

export function CommentModeration(){
  const [rows,setRows]=useState<Row[]>([])
  const [loading,setLoading]=useState(true)
  const [message,setMessage]=useState('')

  async function load(){
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setLoading(false);return}
    const {data,error}=await supabase.from('comments')
      .select('id,body,status,created_at,article_id,articles(title,slug)')
      .in('status',['pending','published','rejected'])
      .order('created_at',{ascending:false})
      .limit(200)
    if(error){setMessage(error.message);setLoading(false);return}
    setRows((data||[]) as unknown as Row[])
    setLoading(false)
  }

  useEffect(()=>{load()},[])

  async function review(id:string,status:'published'|'rejected'){
    const supabase=createSupabaseBrowserClient()
    if(!supabase)return
    const {data:{user}}=await supabase.auth.getUser()
    if(!user)return

    const {error}=await supabase.from('comments').update({
      status,
      reviewed_at:new Date().toISOString(),
      reviewed_by:user.id
    }).eq('id',id)

    if(error){setMessage(error.message);return}
    setRows(current=>current.map(row=>row.id===id?{...row,status}:row))
  }

  if(loading)return <p className="moderation-loading">Loading comments…</p>

  const pending=rows.filter(row=>row.status==='pending')
  const decided=rows.filter(row=>row.status!=='pending')

  return <div className="moderation-shell">
    {message&&<p className="moderation-message">{message}</p>}

    <section className="moderation-section">
      <div className="moderation-heading"><h2>Pending review</h2><span>{pending.length}</span></div>
      {!pending.length&&<p className="moderation-empty">No comments are waiting for review.</p>}
      {pending.map(row=><article className="moderation-card" key={row.id}>
        <div className="moderation-meta">
          <span>{new Date(row.created_at).toLocaleString('en')}</span>
          {row.articles&&<Link href={'/essay/'+row.articles.slug} target="_blank">{row.articles.title} ↗</Link>}
        </div>
        <p>{row.body}</p>
        <div className="moderation-actions">
          <button className="approve" onClick={()=>review(row.id,'published')}>Approve</button>
          <button onClick={()=>review(row.id,'rejected')}>Reject</button>
        </div>
      </article>)}
    </section>

    {!!decided.length&&<section className="moderation-section moderation-recent">
      <div className="moderation-heading"><h2>Recent decisions</h2><span>{decided.length}</span></div>
      {decided.slice(0,50).map(row=><article className="moderation-card decided" key={row.id}>
        <div className="moderation-meta">
          <strong>{row.status}</strong>
          {row.articles&&<Link href={'/essay/'+row.articles.slug} target="_blank">{row.articles.title} ↗</Link>}
        </div>
        <p>{row.body}</p>
        {row.status==='rejected'&&<button className="moderation-restore" onClick={()=>review(row.id,'published')}>Approve instead</button>}
        {row.status==='published'&&<button className="moderation-restore" onClick={()=>review(row.id,'rejected')}>Withdraw</button>}
      </article>)}
    </section>}
  </div>
}
