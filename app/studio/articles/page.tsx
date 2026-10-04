import {notFound,redirect} from 'next/navigation'
import {createSupabaseServerClient} from '@/lib/supabaseServer'

export const metadata={title:'Articles | Ganymai Studio',robots:{index:false,follow:false}}

export default async function StudioArticlesPage(){
  const supabase=await createSupabaseServerClient()
  if(!supabase)return notFound()

  const {data:{user}}=await supabase.auth.getUser()
  if(!user)redirect('/studio/sign-in')

  const {data:me}=await supabase.from('editor_accounts').select('role,active,display_name').eq('user_id',user.id).maybeSingle()
  if(!me?.active)return notFound()

  let query=supabase
    .from('articles')
    .select('id,title,status,slug,updated_at,published_on,created_by')
    .order('updated_at',{ascending:false})
    .limit(200)

  if(me.role!=='admin')query=query.eq('created_by',user.id)

  const {data:articles}=await query

  return <main className="studio-admin-page">
    <header className="studio-admin-header">
      <div><span>GANYMAI STUDIO</span><h1>{me.role==='admin'?'All articles':'My articles'}</h1></div>
      <nav><a href="/studio">New / current draft</a>{me.role==='admin'&&<a href="/studio/members">Members</a>}<a href="/">Public site</a></nav>
    </header>
    <p className="studio-admin-intro">{me.role==='admin'?'Admin view includes every member’s articles.':'This workspace only lists articles created by your member account.'}</p>
    <div className="studio-article-list">
      {(articles||[]).map(article=><article key={article.id}>
        <div>
          <span>{article.status}</span>
          <h2>{article.title}</h2>
          <small>{article.updated_at?new Date(article.updated_at).toLocaleString('en'):''}</small>
        </div>
        <div className="studio-article-actions">
          <a href={'/studio?article='+article.id}>Edit</a>
          {article.status==='published'&&<a href={'/essay/'+article.slug} target="_blank">View ↗</a>}
        </div>
      </article>)}
      {!articles?.length&&<p className="studio-empty">No articles yet.</p>}
    </div>
  </main>
}
