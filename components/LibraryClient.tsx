'use client'

import {useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {createSupabaseBrowserClient} from '@/lib/supabase'

type Saved={
  article_id:string
  created_at:string
  articles:{
    slug:string
    title:string
    dek:string|null
    author_name:string
    cover_url:string|null
    published_on:string|null
  }|null
}

export function LibraryClient(){
  const router=useRouter()
  const [items,setItems]=useState<Saved[]>([])
  const [userId,setUserId]=useState('')
  const [loading,setLoading]=useState(true)

  async function load(){
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setLoading(false);return}
    const {data:{user}}=await supabase.auth.getUser()
    if(!user){router.replace('/login?next=/library');return}
    setUserId(user.id)
    const {data}=await supabase.from('saved_articles')
      .select('article_id,created_at,articles(slug,title,dek,author_name,cover_url,published_on)')
      .eq('user_id',user.id)
      .order('created_at',{ascending:false})
    setItems((data||[]) as unknown as Saved[])
    setLoading(false)
  }

  useEffect(()=>{load()},[])

  async function remove(articleId:string){
    const supabase=createSupabaseBrowserClient()
    if(!supabase||!userId)return
    const {error}=await supabase.from('saved_articles').delete().eq('user_id',userId).eq('article_id',articleId)
    if(!error)setItems(xs=>xs.filter(x=>x.article_id!==articleId))
  }

  if(loading)return <p className="account-loading">Loading…</p>
  if(!items.length)return <div className="library-empty"><p>Your library is empty.</p><Link href="/">Browse essays →</Link></div>

  return <div className="library-list">
    {items.map(item=>item.articles&&<article className="library-item" key={item.article_id}>
      <Link href={'/essay/'+item.articles.slug}>
        <div>
          <span>{item.articles.author_name}</span>
          <h2>{item.articles.title}</h2>
          {item.articles.dek&&<p>{item.articles.dek}</p>}
        </div>
      </Link>
      <button onClick={()=>remove(item.article_id)}>Remove</button>
    </article>)}
  </div>
}
