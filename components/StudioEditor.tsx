// @ts-nocheck
'use client'

import {useEffect,useRef,useState} from 'react'
import {createSupabaseBrowserClient} from '@/lib/supabase'
import {BRAND_NAME} from '@/lib/brand'
import {BrandName} from '@/components/BrandName'
import {ArticleLabel} from '@/components/ArticleLabel'

type Block={
  id:string
  type:'paragraph'|'image'
  html?:string
  text?:string
  url?:string
  caption?:string
  author?:string
  source?:string
  fingerprint?:string
}
type Draft={
  title:string
  dek:string
  author:string
  authorBio:string
  editor:string
  coverCaption:string
  category:string
  label:string
  icon:'bookmark'|'book'|'document'|'eye'|'leaf'
  tags:string
  cover:string
  date:string
  commentsEnabled:boolean
  blocks:Block[]
  articleId?:string|null
  articleSlug?:string|null
  articleStatus?:'draft'|'published'|'archived'
}
type SavedSelection={blockId:string;range:Range}

const uid=()=>typeof crypto!=='undefined'&&'randomUUID' in crypto?crypto.randomUUID():`b-${Date.now()}-${Math.random().toString(36).slice(2)}`
const fiveParagraphs=():Block[]=>Array.from({length:5},(_,i)=>({id:`paragraph-${i+1}`,type:'paragraph',html:'',text:''}))
const emptyDraft=():Draft=>({title:'',dek:'',author:'',authorBio:'',editor:'',coverCaption:'',category:'',label:'Essay',icon:'bookmark',tags:'',cover:'',date:new Date().toISOString().slice(0,10),commentsEnabled:false,blocks:fiveParagraphs(),articleId:null,articleSlug:null,articleStatus:'draft'})

function escapeHtml(value:string){
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
function normalizeBlocks(value:unknown):Block[]{
  if(!Array.isArray(value)||!value.length) return fiveParagraphs()
  return value.map((raw:any)=>raw?.type==='image'
    ?{id:raw.id||uid(),type:'image',url:raw.url||'',caption:raw.caption||'',author:raw.author||'',source:raw.source||'',fingerprint:raw.fingerprint||''}
    :{id:raw?.id||uid(),type:'paragraph',html:typeof raw?.html==='string'?raw.html:escapeHtml(raw?.text||''),text:raw?.text||''})
}
function normalizeHex(value:string){
  const v=value.trim()
  if(/^#[0-9a-fA-F]{3}$/.test(v)) return '#'+v.slice(1).split('').map(x=>x+x).join('').toUpperCase()
  if(/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase()
  return null
}
function sanitizeRichHtml(input:string){
  if(typeof window==='undefined') return input
  const doc=new DOMParser().parseFromString(`<div>${input}</div>`,'text/html')
  const root=doc.body.firstElementChild as HTMLElement
  const allowed=new Set(['STRONG','B','EM','I','U','SPAN','BR'])
  const all=Array.from(root.querySelectorAll('*')).reverse()
  for(const el of all){
    if(!allowed.has(el.tagName)){
      el.replaceWith(...Array.from(el.childNodes))
      continue
    }
    if(el.tagName==='SPAN'){
      const style=(el as HTMLElement).style
      const color=style.color
      const fontSize=style.fontSize
      Array.from(el.attributes).forEach(a=>el.removeAttribute(a.name))
      const safe:string[]=[]
      if(color&&(/^(#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\()/i.test(color))) safe.push(`color:${color}`)
      if(fontSize&&/^(1\.25em|1\.5em|2em)$/.test(fontSize)) safe.push(`font-size:${fontSize}`)
      if(safe.length) el.setAttribute('style',safe.join(';'))
    }else{
      Array.from(el.attributes).forEach(a=>el.removeAttribute(a.name))
    }
  }
  return root.innerHTML
}
function textFromHtml(html:string){
  if(typeof window==='undefined') return ''
  const doc=new DOMParser().parseFromString(html,'text/html')
  return doc.body.textContent||''
}

export function StudioEditor(){
  const initial=emptyDraft()
  const [title,setTitle]=useState(initial.title)
  const [dek,setDek]=useState(initial.dek)
  const [author,setAuthor]=useState(initial.author)
  const [authorBio,setAuthorBio]=useState(initial.authorBio)
  const [editor,setEditor]=useState(initial.editor)
  const [coverCaption,setCoverCaption]=useState(initial.coverCaption)
  const [category,setCategory]=useState(initial.category)
  const [articleLabel,setArticleLabel]=useState(initial.label)
  const [labelIcon,setLabelIcon]=useState<Draft['icon']>(initial.icon)
  const [tags,setTags]=useState(initial.tags)
  const [cover,setCover]=useState(initial.cover)
  const [date,setDate]=useState(initial.date)
  const [commentsEnabled,setCommentsEnabled]=useState(initial.commentsEnabled)
  const [blocks,setBlocks]=useState<Block[]>(initial.blocks)
  const [articleId,setArticleId]=useState<string|null>(null)
  const [articleSlug,setArticleSlug]=useState<string|null>(null)
  const [articleStatus,setArticleStatus]=useState<'draft'|'published'|'archived'>('draft')
  const [notice,setNotice]=useState('Draft autosaves locally.')
  const [preview,setPreview]=useState(false)
  const [color,setColor]=useState('#702691')
  const [activeBlock,setActiveBlock]=useState<string|null>(null)
  const [removed,setRemoved]=useState<{block:Block;index:number}|null>(null)
  const fileRef=useRef<HTMLInputElement>(null)
  const [target,setTarget]=useState<string|null>(null)
  const editors=useRef<Record<string,HTMLDivElement|null>>({})
  const savedSelection=useRef<SavedSelection|null>(null)

  useEffect(()=>{
    const d=localStorage.getItem('ganymai-draft')
    if(!d) return
    try{
      const x=JSON.parse(d)
      setTitle(x.title||'')
      setDek(x.dek||'')
      setAuthor(x.author||'')
      setAuthorBio(x.authorBio||'')
      setEditor(x.editor||'')
      setCoverCaption(x.coverCaption||'')
      setCategory(x.category||'')
      setArticleLabel(x.label||'Essay')
      setLabelIcon(['bookmark','book','document','eye','leaf'].includes(x.icon)?x.icon:'bookmark')
      setTags(x.tags||'')
      setCover(x.cover||'')
      setDate(x.date||initial.date)
      setCommentsEnabled(!!x.commentsEnabled)
      setBlocks(normalizeBlocks(x.blocks))
      setArticleId(x.articleId||null)
      setArticleSlug(x.articleSlug||null)
      setArticleStatus(x.articleStatus||'draft')
    }catch{}
  },[])

  useEffect(()=>{
    const capture=()=>{
      const selection=window.getSelection()
      if(!selection||!selection.rangeCount||selection.isCollapsed) return
      const range=selection.getRangeAt(0)
      const start=range.startContainer.nodeType===Node.ELEMENT_NODE?range.startContainer as Element:range.startContainer.parentElement
      const editor=start?.closest?.('[data-rich-block]') as HTMLDivElement|null
      if(!editor) return
      const blockId=editor.dataset.richBlock
      if(!blockId||!editor.contains(range.endContainer)) return
      savedSelection.current={blockId,range:range.cloneRange()}
      setActiveBlock(blockId)
    }
    document.addEventListener('selectionchange',capture)
    return()=>document.removeEventListener('selectionchange',capture)
  },[])

  const snapshot=():Draft=>({title,dek,author,authorBio,editor,coverCaption,category,label:articleLabel,icon:labelIcon,tags,cover,date,commentsEnabled,blocks,articleId,articleSlug,articleStatus})
  useEffect(()=>{
    const t=setTimeout(()=>localStorage.setItem('ganymai-draft',JSON.stringify(snapshot())),250)
    return()=>clearTimeout(t)
  },[title,dek,author,authorBio,editor,coverCaption,category,articleLabel,labelIcon,tags,cover,date,commentsEnabled,blocks,articleId,articleSlug,articleStatus])

  function loadDraft(d:Draft){
    setTitle(d.title||'')
    setDek(d.dek||'')
    setAuthor(d.author||'')
    setAuthorBio(d.authorBio||'')
    setEditor(d.editor||'')
    setCoverCaption(d.coverCaption||'')
    setCategory(d.category||'')
    setArticleLabel(d.label||'Essay')
    setLabelIcon(d.icon||'bookmark')
    setTags(d.tags||'')
    setCover(d.cover||'')
    setDate(d.date||new Date().toISOString().slice(0,10))
    setCommentsEnabled(!!d.commentsEnabled)
    setBlocks(normalizeBlocks(d.blocks))
    setArticleId(d.articleId||null)
    setArticleSlug(d.articleSlug||null)
    setArticleStatus(d.articleStatus||'draft')
  }
  function resetDraft(){
    loadDraft(emptyDraft())
    setRemoved(null)
    savedSelection.current=null
    setActiveBlock(null)
  }
  function patch(bid:string,p:Partial<Block>){setBlocks(bs=>bs.map(b=>b.id===bid?{...b,...p}:b))}
  function addAfter(after:string,type:Block['type']){
    setBlocks(bs=>{
      const i=bs.findIndex(b=>b.id===after)
      const n:Block=type==='paragraph'?{id:uid(),type:'paragraph',html:'',text:''}:{id:uid(),type:'image',url:'',caption:'',author:'',source:''}
      return [...bs.slice(0,i+1),n,...bs.slice(i+1)]
    })
  }
  function addParagraph(){
    setBlocks(bs=>[...bs,{id:uid(),type:'paragraph',html:'',text:''}])
  }
  function removeBlock(bid:string){
    setBlocks(bs=>{
      const index=bs.findIndex(b=>b.id===bid)
      if(index<0) return bs
      if(bs.length===1){setNotice('Keep at least one body section.');return bs}
      setRemoved({block:bs[index],index})
      return bs.filter(b=>b.id!==bid)
    })
  }
  function undoRemove(){
    if(!removed){setNotice('There is no removed section to restore.');return}
    setBlocks(bs=>[...bs.slice(0,removed.index),removed.block,...bs.slice(removed.index)])
    setRemoved(null)
    setNotice('Removed section restored.')
  }
  function syncEditor(blockId:string){
    const editor=editors.current[blockId]
    if(!editor) return
    const html=sanitizeRichHtml(editor.innerHTML)
    if(html!==editor.innerHTML) editor.innerHTML=html
    patch(blockId,{html,text:editor.innerText})
  }
  function applyWrap(kind:'bold'|'large'|'larger'|'color'){
    const saved=savedSelection.current
    if(!saved||saved.range.collapsed){setNotice('Select some text first. On mobile, long-press the text to make a selection.');return}
    const editor=editors.current[saved.blockId]
    if(!editor||!editor.contains(saved.range.commonAncestorContainer)){setNotice('Select text inside one paragraph first.');return}
    let wrapper:HTMLElement
    if(kind==='bold') wrapper=document.createElement('strong')
    else{
      wrapper=document.createElement('span')
      if(kind==='large') wrapper.style.fontSize='1.25em'
      if(kind==='larger') wrapper.style.fontSize='1.5em'
      if(kind==='color'){
        const hex=normalizeHex(color)
        if(!hex){setNotice('Use a HEX colour such as #702691 or #fff.');return}
        wrapper.setAttribute('style',`color:${hex}`)
        setColor(hex)
      }
    }
    try{
      const range=saved.range.cloneRange()
      const fragment=range.extractContents()
      wrapper.appendChild(fragment)
      range.insertNode(wrapper)
      const selection=window.getSelection()
      selection?.removeAllRanges()
      const next=document.createRange()
      next.selectNodeContents(wrapper)
      selection?.addRange(next)
      savedSelection.current={blockId:saved.blockId,range:next.cloneRange()}
      setActiveBlock(saved.blockId)
      syncEditor(saved.blockId)
      setNotice(kind==='color'?`Applied ${normalizeHex(color)} to the selection.`:'Formatting applied to the selection.')
    }catch{
      setNotice('That selection could not be formatted. Try selecting text within a single paragraph.')
    }
  }
  const preserveSelection=(e:any)=>e.preventDefault()

  const isDuplicate=(bid:string,url:string)=>blocks.some(b=>b.id!==bid&&b.type==='image'&&b.url===url)
  async function parseInto(bid:string,url:string){
    if(isDuplicate(bid,url)){setNotice('Duplicate image blocked: this URL already exists in the article.');return}
    setNotice('Parsing source…')
    try{
      const r=await fetch('/api/parse-link',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url})})
      const m=await r.json()
      if(!r.ok) throw new Error(m.error)
      const image=m.image||url
      if(isDuplicate(bid,image)){setNotice('Duplicate image blocked after link parsing.');return}
      patch(bid,{url:image,author:m.author||'',source:m.site||m.source||new URL(url).hostname,caption:m.title||''})
      setNotice('Source metadata parsed. Review attribution before publishing.')
    }catch(e){setNotice(e instanceof Error?e.message:'Parse failed')}
  }
  async function upload(bid:string,file:File){
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer()))).map(x=>x.toString(16).padStart(2,'0')).join('')
    if(blocks.some(b=>b.id!==bid&&b.fingerprint===digest)){setNotice('Duplicate upload blocked: the same file is already in this article.');return}
    const supabase=createSupabaseBrowserClient()
    if(supabase){
      const {data:{user}}=await supabase.auth.getUser()
      if(user){
        const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'-')
        const path=`${user.id}/${Date.now()}-${safe}`
        const {error}=await supabase.storage.from('media').upload(path,file,{upsert:false,contentType:file.type})
        if(!error){
          const {data}=supabase.storage.from('media').getPublicUrl(path)
          patch(bid,{url:data.publicUrl,caption:file.name,source:`${BRAND_NAME} upload`,fingerprint:digest})
          setNotice('Image uploaded to Supabase Storage.')
          return
        }
        setNotice(`Upload failed: ${error.message}. Showing a local preview instead.`)
      }
    }
    const u=URL.createObjectURL(file)
    patch(bid,{url:u,caption:file.name,source:'Local preview',fingerprint:digest})
    setNotice('Local preview inserted. Sign in and connect Supabase Storage for persistent uploads.')
  }

  async function resolveCategory(supabase:any){
    const name=category.trim()
    if(!name) return null
    const {data:found,error:findError}=await supabase.from('categories').select('id').ilike('name',name).limit(1).maybeSingle()
    if(findError) throw findError
    if(found?.id) return found.id
    const slug=name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,60)||`category-${Date.now()}`
    const {data:created,error:createError}=await supabase.from('categories').insert({name,slug}).select('id').single()
    if(createError) throw createError
    return created.id
  }

  function publishRows(idValue:string){
    return blocks.map((b,position)=>{
      if(b.type==='paragraph'){
        const editor=editors.current[b.id]
        const html=sanitizeRichHtml(editor?.innerHTML??b.html??escapeHtml(b.text||''))
        return {article_id:idValue,position,block_type:'paragraph',content:{html,text:textFromHtml(html)}}
      }
      return {article_id:idValue,position,block_type:'image',content:{url:b.url||'',caption:b.caption||'',original_author:b.author||'',source:b.source||'',fingerprint:b.fingerprint||''}}
    })
  }

  async function publish(){
    const supabase=createSupabaseBrowserClient()
    if(!supabase){setNotice('Publishing needs Supabase URL and publishable key. Preview and local drafting still work.');return}
    const {data:{user},error:userError}=await supabase.auth.getUser()
    if(userError||!user){setNotice('Sign in before publishing.');return}
    if(!title.trim()||!author.trim()){setNotice('Title and author are required.');return}
    setNotice(articleId?'Updating published article…':'Publishing…')
    try{
      const categoryId=await resolveCategory(supabase)
      const articleValues={title:title.trim(),dek:dek.trim()||null,author_name:author.trim(),author_bio:authorBio.trim()||null,editor_name:editor.trim()||null,cover_caption:coverCaption.trim()||null,category_id:categoryId,label_text:articleLabel.trim()||null,label_icon:labelIcon,cover_url:cover.trim()||null,status:'published' as const,published_on:date,updated_at:new Date().toISOString(),tags:tags.split(',').map(x=>x.trim()).filter(Boolean),comments_enabled:commentsEnabled,created_by:user.id}
      let idValue=articleId
      let slugValue=articleSlug
      if(idValue){
        const {data:updated,error:updateError}=await supabase.from('articles').update(articleValues).eq('id',idValue).select('id,slug').maybeSingle()
        if(updateError) throw updateError
        if(!updated){idValue=null;slugValue=null}
      }
      if(!idValue){
        const slugBase=title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,70)||'essay'
        slugValue=`${slugBase}-${Date.now().toString().slice(-6)}`
        const {data:article,error}=await supabase.from('articles').insert({...articleValues,slug:slugValue}).select('id,slug').single()
        if(error||!article) throw error||new Error('Could not create article')
        idValue=article.id
        slugValue=article.slug
      }else{
        const {error:deleteBlocksError}=await supabase.from('article_blocks').delete().eq('article_id',idValue)
        if(deleteBlocksError) throw deleteBlocksError
      }
      if(!idValue) throw new Error('Could not resolve the article id')
      const rows=publishRows(idValue)
      const {error:blockError}=await supabase.from('article_blocks').insert(rows)
      if(blockError) throw blockError
      setArticleId(idValue)
      setArticleSlug(slugValue)
      setArticleStatus('published')
      setNotice(`Published. Public URL: /essay/${slugValue}`)
    }catch(e:any){
      const msg=e?.message||'Publishing failed.'
      setNotice(`Publish failed: ${msg}`)
    }
  }

  function saveDraft(){
    blocks.filter(b=>b.type==='paragraph').forEach(b=>syncEditor(b.id))
    localStorage.setItem('ganymai-draft',JSON.stringify(snapshot()))
    setNotice('Draft saved locally.')
  }
  async function deleteArticle(){
    localStorage.setItem('ganymai-trash',JSON.stringify(snapshot()))
    if(articleId){
      const supabase=createSupabaseBrowserClient()
      if(supabase){
        const {error}=await supabase.from('articles').update({status:'archived',updated_at:new Date().toISOString()}).eq('id',articleId)
        if(!error){setArticleStatus('archived');setNotice('Article removed from publication and moved to archive. Use Restore to republish it.');return}
        setNotice(`Archive failed: ${error.message}. A local recovery copy was still saved.`)
        retur
      }
    }
    resetDraft()
    localStorage.removeItem('ganymai-draft')
    setNotice('Draft deleted locally. Use Restore to bring it back.')
  }
  async function restoreArticle(){
    if(articleId&&articleStatus==='archived'){
      const supabase=createSupabaseBrowserClient()
      if(supabase){
        const {error}=await supabase.from('articles').update({status:'published',updated_at:new Date().toISOString()}).eq('id',articleId)
        if(!error){setArticleStatus('published');setNotice('Article restored to published status.');return}
        setNotice(`Restore failed: ${error.message}`)
        return
      }
    }
    const trash=localStorage.getItem('ganymai-trash')
    if(!trash){setNotice('There is no deleted draft to restore.');return}
    try{
      const parsed=JSON.parse(trash)
      loadDraft({...parsed,blocks:normalizeBlocks(parsed.blocks)})
      setNotice('Deleted draft restored.')
    }catch{setNotice('The recovery copy could not be read.')}
  }

  return <div className="studio-shell">
    <aside>
      <div className="studio-logo">Γ</div>
      <b><BrandName /> Studio</b>
      <p>Article editor</p>
      <div className="studio-status"><span>Status</span><strong>{articleStatus}</strong></div>
      <a href="/studio/comments">Comment moderation</a>
      <a href="/">← Public site</a>
    </aside>

    <section className="studio-main">
      <div className="studio-top">
        <div><small>ARTICLE</small><h1>{title||'Untitled draft'}</h1></div>
        <div className="studio-actions">
          <button onClick={saveDraft}>Save</button>
          <button onClick={()=>setPreview(true)}>Preview</button>
          <button className="danger" onClick={deleteArticle}>Delete</button>
          <button onClick={restoreArticle}>Restore</button>
          <button className="primary" onClick={publish}>Publish</button>
        </div>
      </div>

      <div className="notice">{notice}</div>

      <div className="field-grid">
        <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Article title"/></label>
        <label>Author<input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Author"/></label>
        <label className="full">Subtitle / dek<textarea value={dek} onChange={e=>setDek(e.target.value)} placeholder="A concise standfirst shown over the cover image."/></label>
        <label className="full">Author bio<textarea value={authorBio} onChange={e=>setAuthorBio(e.target.value)} placeholder="Short author biography shown beside the article body."/></label>
        <label>Editor<input value={editor} onChange={e=>setEditor(e.target.value)} placeholder="Editor name (optional)"/></label>
        <label>Cover caption<input value={coverCaption} onChange={e=>setCoverCaption(e.target.value)} placeholder="Place, date, photographer / source"/></label>
        <label>Category<input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Type any category"/></label>
        <label>Homepage label<input value={articleLabel} onChange={e=>setArticleLabel(e.target.value)} placeholder="Essay / Human rights and justice" maxLength={120}/></label>
        <label>Homepage icon<select value={labelIcon} onChange={e=>setLabelIcon(e.target.value as Draft['icon'])}><option value="bookmark">Bookmark</option><option value="book">Book</option><option value="document">Document</option><option value="eye">Eye</option><option value="leaf">Leaf</option></select></label>
        <div className="homepage-label-preview"><small>HOME CARD PREVIEW</small><ArticleLabel icon={labelIcon}>{articleLabel.trim()||'Essay'}</ArticleLabel></div>
        <label>Tags<input value={tags} onChange={e=>setTags(e.target.value)} placeholder="world, memory, river"/></label>
        <label className="full">Cover<input value={cover} onChange={e=>setCover(e.target.value)} placeholder="Cover image URL"/></label>
        <label className="studio-toggle full">
          <input type="checkbox" checked={commentsEnabled} onChange={e=>setCommentsEnabled(e.target.checked)}/>
          <span><b>Enable comments</b><small>Selected essays only. Readers can make one considered comment each.</small></span>
        </label>
      </div>

      <div className="blocks">
        <div className="blocks-head">
          <div><h2>Body</h2><p>Five paragraph boxes by default. Add or remove sections freely.</p></div>
          <div className="body-actions"><button onClick={addParagraph}>+ Paragraph</button>{removed&&<button onClick={undoRemove}>Undo remove</button>}</div>
        </div>

        <div className="rich-toolbar" aria-label="Text formatting toolbar">
          <span>{activeBlock?'Selection active':'Select text to format'}</span>
          <button onMouseDown={preserveSelection} onClick={()=>applyWrap('bold')}><b>B</b></button>
          <button onMouseDown={preserveSelection} onClick={()=>applyWrap('large')}>A+</button>
          <button onMouseDown={preserveSelection} onClick={()=>applyWrap('larger')}>A++</button>
          <div className="color-tool">
            <span className="color-dot" style={{background:normalizeHex(color)||'#702691'}}/>
            <input value={color} onChange={e=>setColor(e.target.value)} placeholder="#702691" aria-label="HEX text colour"/>
            <button onMouseDown={preserveSelection} onClick={()=>applyWrap('color')}>Apply color</button>
          </div>
        </div>

        {blocks.map((b,i)=><div className="block studio-block" key={b.id}>
          <div className="block-index">{String(i+1).padStart(2,'0')}</div>
          <div className="block-content">
            {b.type==='paragraph'
              ?<div
                ref={node=>{editors.current[b.id]=node}}
                className="rich-editor"
                data-rich-block={b.id}
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{__html:b.html??escapeHtml(b.text||'')}}
                onFocus={()=>setActiveBlock(b.id)}
                onInput={e=>patch(b.id,{html:e.currentTarget.innerHTML,text:e.currentTarget.innerText})}
                onBlur={e=>{
                  const clean=sanitizeRichHtml(e.currentTarget.innerHTML)
                  if(clean!==e.currentTarget.innerHTML)e.currentTarget.innerHTML=clean
                  patch(b.id,{html:clean,text:e.currentTarget.innerText})
                }}
                data-placeholder={`Paragraph ${i+1}…`}
              />
              :<div className="image-block">
                <input value={b.url||''} onChange={e=>patch(b.id,{url:e.target.value})} placeholder="Image or source URL"/>
                <div className="image-actions"><button onClick={()=>b.url&&parseInto(b.id,b.url)}>Parse link</button><button onClick={()=>{setTarget(b.id);fileRef.current?.click()}}>Upload</button></div>
                {b.url&&<div className="media-preview"><div>IMAGE PREVIEW</div><small>{b.url}</small></div>}
                <input value={b.caption||''} onChange={e=>patch(b.id,{caption:e.target.value})} placeholder="Caption"/>
                <div className="split"><input value={b.author||''} onChange={e=>patch(b.id,{author:e.target.value})} placeholder="Original author"/><input value={b.source||''} onChange={e=>patch(b.id,{source:e.target.value})} placeholder="Source"/></div>
              </div>}
          </div>
          <div className="insert-rail">
            <button onClick={()=>addAfter(b.id,'paragraph')}>+ Text</button>
            <button onClick={()=>addAfter(b.id,'image')}>+ Image</button>
            <button className="remove-block" onClick={()=>removeBlock(b.id)}>− Remove</button>
          </div>
        </div>)}
      </div>

      <input ref={fileRef} hidden type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f&&target)upload(target,f);e.currentTarget.value=''}}/>
      <label className="date-field">Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/><small>Date remains at the end of the editing flow and published article.</small></label>
    </section>

    {preview&&<div className="studio-preview-backdrop" role="dialog" aria-modal="true" aria-label="Article preview" onMouseDown={e=>{if(e.currentTarget===e.target)setPreview(false)}}>
      <article className="studio-preview">
        <div className="preview-top"><span>PREVIEW</span><button onClick={()=>setPreview(false)}>Close ×</button></div>
        <header>
          <h1>{title||'Untitled draft'}</h1>
          {dek&&<p className="preview-dek">{dek}</p>}
          <p>{author||'Author'} · {date}</p>
        </header>
        {cover&&<div className="preview-cover" style={{backgroundImage:`url("${cover.replace(/"/g,'\\"')}")`}}/>}
        {coverCaption&&<p className="preview-cover-caption">{coverCaption}</p>}
        {(authorBio||editor)&&<aside className="preview-meta">{authorBio&&<p><strong>{author||'Author'}</strong><br/>{authorBio}</p>}{editor&&<p><small>Edited by</small><br/>{editor}</p>}</aside>}
        <div className="preview-body">
          {blocks.map(b=>b.type==='paragraph'
            ?<div className="preview-paragraph" key={b.id} dangerouslySetInnerHTML={{__html:sanitizeRichHtml(editors.current[b.id]?.innerHTML??b.html??escapeHtml(b.text||''))}}/>
            :<figure className="preview-image" key={b.id}><div className="preview-image-box">{b.url||'Image'}</div>{b.caption&&<figcaption>{b.caption}</figcaption>}</figure>)}
        </div>
      </article>
    </div>}
  </div>
}
