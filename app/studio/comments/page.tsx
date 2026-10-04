import {notFound} from 'next/navigation'
import {CommentModeration} from '@/components/CommentModeration'
import {createSupabaseServerClient} from '@/lib/supabaseServer'

export const metadata={title:'Comment moderation | Ganymai Studio',robots:{index:false,follow:false}}

export default async function CommentModerationPage(){
  const supabase=await createSupabaseServerClient()
  if(!supabase)return notFound()

  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return notFound()

  const {data:editor}=await supabase.from('editor_accounts').select('role').eq('user_id',user.id).maybeSingle()
  if(!editor)return notFound()

  return <main className="moderation-page">
    <header>
      <div><span>GANYMAI STUDIO</span><h1>Comment moderation</h1></div>
      <nav><a href="/studio">Article Studio</a><a href="/">Public site</a></nav>
    </header>
    <p className="moderation-principle">Approve ordinary disagreement freely. Reject only material that clearly crosses the moderation policy: violence or threats, explicit sexual exploitation, gambling promotion, advertising or spam, terrorist advocacy, criminal facilitation, severe harassment or hate, or other clearly unlawful material.</p>
    <CommentModeration/>
  </main>
}
