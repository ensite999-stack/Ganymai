import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export const runtime='nodejs'

function cleanGeo(value:string|null,max=80){
  if(!value)return null
  try{return decodeURIComponent(value).trim().slice(0,max)||null}
  catch{return value.trim().slice(0,max)||null}
}

export async function POST(request:Request){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url||!key)return NextResponse.json({ok:false,error:'Comments are unavailable.'},{status:503})

  let input:any
  try{input=await request.json()}catch{
    return NextResponse.json({ok:false,error:'Invalid request.'},{status:400})
  }

  const articleId=typeof input?.articleId==='string'?input.articleId:''
  const displayName=typeof input?.displayName==='string'?input.displayName.trim():''
  const body=typeof input?.body==='string'?input.body.trim():''
  const avatarData=typeof input?.avatarData==='string'&&input.avatarData?input.avatarData:null

  if(!articleId||displayName.length<1||displayName.length>40||body.length<2||body.length>5000){
    return NextResponse.json({ok:false,error:'Check your name and comment.'},{status:400})
  }

  const countryCode=cleanGeo(request.headers.get('x-vercel-ip-country'),2)?.toUpperCase()||null
  const rawRegion=cleanGeo(request.headers.get('x-vercel-ip-country-region'))
  const regionName=rawRegion&&/[A-Za-z\u00C0-\u024F\u3400-\u9FFF]/.test(rawRegion)?rawRegion:null

  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
  const {data,error}=await supabase.rpc('submit_public_comment',{
    p_article_id:articleId,
    p_display_name:displayName,
    p_body:body,
    p_avatar_data:avatarData,
    p_country_code:countryCode,
    p_region_name:regionName
  })

  if(error)return NextResponse.json({ok:false,error:'We could not publish your comment.'},{status:500})

  const row=Array.isArray(data)?data[0]:data
  if(!row?.accepted){
    return NextResponse.json({
      ok:false,
      moderated:true,
      error:'This comment could not be published under the community rules. No comment or avatar data was retained.'
    },{status:422})
  }

  return NextResponse.json({ok:true,id:row.comment_id})
}
