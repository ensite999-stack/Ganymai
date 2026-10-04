import {notFound,redirect} from 'next/navigation'
import {StudioMembers} from '@/components/StudioMembers'
import {createSupabaseServerClient} from '@/lib/supabaseServer'

export const metadata={title:'Members | Ganymai Studio',robots:{index:false,follow:false}}

export default async function StudioMembersPage(){
  const supabase=await createSupabaseServerClient()
  if(!supabase)return notFound()

  const {data:{user}}=await supabase.auth.getUser()
  if(!user)redirect('/studio/sign-in')

  const {data:me}=await supabase.from('editor_accounts').select('role,active').eq('user_id',user.id).maybeSingle()
  if(!me?.active||me.role!=='admin')return notFound()

  const {data:members}=await supabase
    .from('editor_accounts')
    .select('user_id,display_name,role,active,updated_at')
    .order('display_name',{ascending:true})

  return <main className="studio-admin-page">
    <header className="studio-admin-header">
      <div><span>GANYMAI STUDIO</span><h1>Members</h1></div>
      <nav><a href="/studio">Editor</a><a href="/studio/articles">Articles</a><a href="/">Public site</a></nav>
    </header>
    <p className="studio-admin-intro">Member accounts are provisioned privately. This page controls editorial access and role level after an account has been provisioned.</p>
    <StudioMembers initial={(members||[]) as any}/>
  </main>
}
