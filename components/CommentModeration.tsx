'use client'

import {useEffect,useState} from 'react'
import Link from 'next/link'
import {createSupabaseBrowserClient} from '@/lib/supabase'

type Row={
  id:string
  display_name:string|null
  country_code:string|null
  region_name:string|null
  body:string
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
      .select('id,display_name,country_code,region_name,body,created_at,article_id,articles(title,slug)')
      .eq('status','published')
      .order('created_at',{ascending:false})
      .limit(200)
    if(error){setMessage(error.message);setLoading(false);return}
    setRows((data||[]) as unknown as Row[])
    setLoading(false)
  }

  useEffect(()=>{load()},[])

  async function remove(id:string){
    const supabase=createSupabaseBrowserClient()
    if(!supabase)return
    const {error}=await supabase.from('comments').delete().eq('id',id)
    if(error){setMessage(error.message);return}
    setRows(current=>current.filter(row=>row.id!==id))
  }

  if(loading)return <p className="moderation-loading">Loading comments…</p>

  return <div className="moderation-shell">
    {message&&<p className="moderation-message">{message}</p>}
    <section className="moderation-section">
      <div className="moderation-heading"><h2>Published comments</h2><span>{rows.length}</span></div>
      {!rows.length&&<p className="moderation-empty">There are no published comments.</p>}
      {rows.map(row=><article className="moderation-card" key={row.id}>
        <div className="moderation-meta">
          <span>{row.display_name||'Anonymous'} · {[row.country_code,row.region_name].filter(Boolean).join(' · ')||'Location unavailable'} · {new Date(row.created_at).toLocaleString('en')}</span>
          {row.articles&&<Link href={'/essay/'+row.articles.slug} target="_blank">{row.articles.title} ↗</Link>}
        </div>
        <p>{row.body}</p>
        <div className="moderation-actions">
          <button onClick={()=>remove(row.id)}>Delete comment and data</button>
        </div>
      </article>)}
    </section>
  </div>
}
