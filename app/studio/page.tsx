import {notFound} from 'next/navigation'
import {StudioEditor} from '@/components/StudioEditor'
import {createSupabaseServerClient} from '@/lib/supabaseServer'

export const metadata={title:'Ganymai Studio',robots:{index:false,follow:false}}

export default async function Studio(){
  const supabase=await createSupabaseServerClient()
  if(!supabase) return notFound()

  const {data:{user}}=await supabase.auth.getUser()
  if(!user) return notFound()

  const {data:editor}=await supabase
    .from('editor_accounts')
    .select('role')
    .eq('user_id',user.id)
    .maybeSingle()

  if(!editor) return notFound()
  return <StudioEditor/>
}
