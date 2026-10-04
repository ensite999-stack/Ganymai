import {redirect} from 'next/navigation'
import {BrandName} from '@/components/BrandName'
import {StudioSignIn} from '@/components/StudioSignIn'
import {createSupabaseServerClient} from '@/lib/supabaseServer'

export const metadata={title:'Studio access',robots:{index:false,follow:false}}

export default async function StudioSignInPage(){
  const supabase=await createSupabaseServerClient()
  if(supabase){
    const {data:{user}}=await supabase.auth.getUser()
    if(user){
      const {data:member}=await supabase.from('editor_accounts').select('active').eq('user_id',user.id).maybeSingle()
      if(member?.active) redirect('/studio')
    }
  }

  return <main className="studio-signin-page">
    <div className="studio-signin-card">
      <div className="studio-signin-mark">Γ</div>
      <p className="studio-signin-brand"><BrandName /> Studio</p>
      <h1>Member access.</h1>
      <p className="studio-signin-intro">Internal editorial workspace. Access is provisioned privately to Ganymai members.</p>
      <StudioSignIn/>
      <a className="studio-signin-back" href="/">← Public site</a>
    </div>
  </main>
}
