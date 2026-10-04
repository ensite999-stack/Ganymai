import type { MetadataRoute } from 'next'
import { createPublicContentClient } from '@/lib/publicContent'
import { SITE_URL } from '@/lib/site'

export const dynamic='force-dynamic'

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const now=new Date()
  const staticPaths=['','/about','/archive','/submit','/contact','/subscribe','/donate','/privacy','/terms','/accessibility','/community-guidelines','/donation-statement']
  const items:MetadataRoute.Sitemap=staticPaths.map(path=>({
    url:`${SITE_URL}${path}`,
    lastModified:now,
    changeFrequency:path===''?'weekly':'monthly',
    priority:path===''?1:path==='/archive'?0.8:0.5
  }))

  const supabase=createPublicContentClient()
  if(!supabase) return items
  const {data}=await supabase
    .from('articles')
    .select('slug,published_on,updated_at')
    .eq('status','published')
    .order('published_on',{ascending:false})

  for(const article of data||[]){
    const modified=article.updated_at||article.published_on
    items.push({
      url:`${SITE_URL}/essay/${article.slug}`,
      lastModified:modified?new Date(modified):now,
      changeFrequency:'monthly',
      priority:0.8
    })
  }
  return items
}
