import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleShare } from '@/components/ArticleShare'
import { SaveArticleButton } from '@/components/SaveArticleButton'
import { CommentsSection } from '@/components/CommentsSection'
import { BRAND_NAME } from '@/lib/brand'
import { createPublicContentClient, sanitizePublishedHtml, type PublicBlock } from '@/lib/publicContent'
import { SITE_URL } from '@/lib/site'

export const dynamic='force-dynamic'

async function getPublishedArticle(slug:string){
  const supabase=createPublicContentClient()
  if(!supabase) return {supabase:null,article:null}
  const {data:article}=await supabase
    .from('articles')
    .select('id,slug,title,dek,author_name,author_bio,editor_name,cover_caption,category_id,tags,cover_url,published_on,updated_at,comments_enabled')
    .eq('slug',slug)
    .eq('status','published')
    .maybeSingle()
  return {supabase,article}
}

function plainTextFromBlocks(blocks:PublicBlock[]){
  return blocks
    .filter(block=>block.block_type==='paragraph')
    .map(block=>typeof block.content?.text==='string'?block.content.text:'')
    .join(' ')
    .replace(/\s+/g,' ')
    .trim()
}

function countWords(text:string){
  const latin=text.match(/[A-Za-z0-9À-ž’'-]+/g)?.length||0
  const cjk=text.match(/[\u3400-\u9FFF\uF900-\uFAFF]/g)?.length||0
  return latin+cjk
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params
  const {supabase,article}=await getPublishedArticle(slug)
  if(!supabase||!article) return {title:'Essay',robots:{index:false,follow:false}}

  const {data:firstBlock}=await supabase
    .from('article_blocks')
    .select('content')
    .eq('article_id',article.id)
    .eq('block_type','paragraph')
    .order('position',{ascending:true})
    .limit(1)
    .maybeSingle()

  const firstText=typeof firstBlock?.content?.text==='string'
    ?firstBlock.content.text.replace(/\s+/g,' ').trim()
    :''
  const description=(article.dek?.trim()||firstText||`An essay by ${article.author_name} on ${BRAND_NAME}.`).slice(0,160)
  const canonical=`/essay/${article.slug}`
  const images=article.cover_url?[{url:article.cover_url,alt:article.title}]:undefined

  return {
    title:article.title,
    description,
    authors:[{name:article.author_name}],
    keywords:article.tags||[],
    alternates:{canonical},
    openGraph:{
      type:'article',
      url:canonical,
      siteName:BRAND_NAME,
      title:article.title,
      description,
      publishedTime:article.published_on||undefined,
      modifiedTime:article.updated_at||undefined,
      authors:[article.author_name],
      tags:article.tags||[],
      images
    },
    twitter:{
      card:article.cover_url?'summary_large_image':'summary',
      title:article.title,
      description,
      images:article.cover_url?[article.cover_url]:undefined
    }
  }
}

export default async function Essay({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const {supabase,article}=await getPublishedArticle(slug)
  if(!supabase||!article) return notFound()

  const [{data:blocksRaw},{data:category}]=await Promise.all([
    supabase.from('article_blocks').select('id,position,block_type,content').eq('article_id',article.id).order('position',{ascending:true}),
    article.category_id
      ?supabase.from('categories').select('name').eq('id',article.category_id).maybeSingle()
      :Promise.resolve({data:null})
  ])

  const blocks=(blocksRaw||[]) as PublicBlock[]
  const bodyText=plainTextFromBlocks(blocks)
  const wordCount=countWords(bodyText)
  const url=`${SITE_URL}/essay/${article.slug}`
  const topicNames=Array.from(new Set([category?.name,...(article.tags||[])].filter(Boolean))) as string[]

  const articleJsonLd={
    '@context':'https://schema.org',
    '@type':'Article',
    headline:article.title,
    description:article.dek||undefined,
    author:{'@type':'Person',name:article.author_name},
    editor:article.editor_name?{'@type':'Person',name:article.editor_name}:undefined,
    publisher:{'@type':'Organization',name:BRAND_NAME,url:SITE_URL},
    mainEntityOfPage:url,
    datePublished:article.published_on||undefined,
    dateModified:article.updated_at||article.published_on||undefined,
    articleSection:category?.name||undefined,
    wordCount:wordCount||undefined,
    keywords:(article.tags||[]).join(', '),
    image:article.cover_url?[article.cover_url]:undefined
  }

  let firstParagraph=true

  return <article className="aeon-essay">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleJsonLd)}}/>

    <section className={`aeon-essay-hero ${article.cover_url?'has-cover':'no-cover'}`}>
      {article.cover_url&&<img className="aeon-essay-hero-image" src={article.cover_url} alt="" />}
      <div className="aeon-essay-hero-shade"/>
      <div className="aeon-essay-hero-copy">
        <h1>{article.title}</h1>
        {article.dek&&<p className="aeon-essay-dek">{article.dek}</p>}
        <p className="aeon-essay-byline">by {article.author_name}</p>
      </div>
    </section>

    {article.cover_caption&&<p className="aeon-cover-caption">{article.cover_caption}</p>}

    <div className="aeon-essay-layout">
      <aside className="aeon-essay-meta">
        <section className="aeon-author-card">
          <h2>{article.author_name}</h2>
          {article.author_bio&&<p>{article.author_bio}</p>}
        </section>

        <div className="aeon-meta-list">
          {article.editor_name&&<p><span>Edited by</span><strong>{article.editor_name}</strong></p>}
          {!!wordCount&&<p><span>Length</span><strong>{wordCount.toLocaleString()} words</strong></p>}
        </div>

        {!!topicNames.length&&<div className="aeon-topic-list">
          {topicNames.map(topic=><span key={topic}>{topic}</span>)}
        </div>}

        <SaveArticleButton articleId={article.id}/>
        <ArticleShare title={article.title} url={url}/>
      </aside>

      <div className="aeon-essay-body">
        {blocks.map(block=>{
          const content=block.content||{}
          if(block.block_type==='paragraph'){
            const html=typeof content.html==='string'?sanitizePublishedHtml(content.html):''
            const text=typeof content.text==='string'?content.text:''
            const isFirst=firstParagraph
            firstParagraph=false
            return html
              ?<div className={`rich-paragraph ${isFirst?'opening-paragraph':''}`} key={block.id} dangerouslySetInnerHTML={{__html:html}}/>
              :<p className={`rich-paragraph ${isFirst?'opening-paragraph':''}`} key={block.id}>{text}</p>
          }
          if(block.block_type==='image'&&typeof content.url==='string'&&content.url){
            const caption=typeof content.caption==='string'?content.caption:''
            return <figure className="published-figure" key={block.id}>
              <div className="published-image"><img src={content.url} alt={caption}/></div>
              {caption&&<figcaption>{caption}</figcaption>}
            </figure>
          }
          return null
        })}
        {article.published_on&&<p className="article-date">{article.published_on}</p>}
      </div>
    </div>

    {article.comments_enabled&&<CommentsSection articleId={article.id} slug={article.slug}/>}
  </article>
}
