import {notFound,redirect} from 'next/navigation'
import {StudioEditor} from '@/components/StudioEditor'
import {createSupabaseServerClient} from '@/lib/supabaseServer'

export const metadata={title:'Ganymai Studio',robots:{index:false,follow:false}}

export default async function Studio({searchParams}:{searchParams:Promise<{article?:string}>}){
  const supabase=await createSupabaseServerClient()
  if(!supabase)redirect('/studio/sign-in')

  const {data:{user}}=await supabase.auth.getUser()
  if(!user)redirect('/studio/sign-in')

  const {data:editor}=await supabase
    .from('editor_accounts')
    .select('role,display_name,active')
    .eq('user_id',user.id)
    .maybeSingle()

  if(!editor?.active)return notFound()

  const params=await searchParams
  return <StudioEditor
    memberName={editor.display_name||'Editor'}
    role={editor.role as 'editor'|'admin'}
    userId={user.id}
    initialArticleId={params.article||null}
  />
}
