import {notFound,redirect} from 'next/navigation'
import {CommentModeration} from '@/components/CommentModeration'
import {createSupabaseServerClient} from '@/lib/supabaseServer'

export const metadata={title:'Comment management | Ganymai Studio',robots:{index:false,follow:false}}

export default async function CommentModerationPage(){
  const supabase=await createSupabaseServerClient()
  if(!supabase)return notFound()

  const {data:{user}}=await supabase.auth.getUser()
  if(!user)redirect('/studio/sign-in')

  const {data:editor}=await supabase.from('editor_accounts').select('role,active').eq('user_id',user.id).maybeSingle()
  if(!editor?.active)return notFound()

  return <main className="moderation-page">
    <header>
      <div><span>GANYMAI STUDIO</span><h1>Comment management</h1></div>
      <nav><a href="/studio">Article Studio</a><a href="/studio/articles">Articles</a><a href="/">Public site</a></nav>
    </header>
    <p className="moderation-principle">Ordinary comments publish automatically after the high-confidence safety check. Use this page only for post-publication removal when a comment clearly breaches the rules or creates a serious legal or safety problem. Deleting here removes the stored comment record and associated avatar/location data.</p>
    <CommentModeration/>
  </main>
}
