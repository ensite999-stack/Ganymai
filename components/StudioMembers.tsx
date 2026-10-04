'use client'

import {useState} from 'react'
import {createSupabaseBrowserClient} from '@/lib/supabase'

type Member={
  user_id:string
  display_name:string|null
  role:'editor'|'admin'
  active:boolean
  updated_at:string
}

export function StudioMembers({initial}:{initial:Member[]}){
  const [rows,setRows]=useState(initial)
  const [message,setMessage]=useState('')

  async function updateMember(userId:string,patch:Partial<Member>){
    const supabase=createSupabaseBrowserClient()
    if(!supabase)return
    setMessage('')
    const {error}=await supabase.from('editor_accounts').update({
      ...patch,
      updated_at:new Date().toISOString()
    }).eq('user_id',userId)

    if(error){setMessage(error.message);return}
    setRows(current=>current.map(row=>row.user_id===userId?{...row,...patch}:row))
  }

  return <div className="studio-members-list">
    {message&&<p className="studio-members-message">{message}</p>}
    {rows.map(member=><article className="studio-member-row" key={member.user_id}>
      <div>
        <input
          className="studio-member-name"
          defaultValue={member.display_name||'Editor'}
          maxLength={80}
          aria-label="Member display name"
          onBlur={e=>{
            const value=e.target.value.trim()||'Editor'
            if(value!==member.display_name) updateMember(member.user_id,{display_name:value})
          }}
        />
        <small>{member.user_id.slice(0,8)}…</small>
      </div>
      <label>Role
        <select value={member.role} onChange={e=>updateMember(member.user_id,{role:e.target.value as 'editor'|'admin'})}>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label className="studio-member-active">
        <input type="checkbox" checked={member.active} onChange={e=>updateMember(member.user_id,{active:e.target.checked})}/>
        <span>{member.active?'Active':'Disabled'}</span>
      </label>
    </article>)}
  </div>
}
