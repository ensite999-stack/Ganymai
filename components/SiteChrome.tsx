'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ui } from '@/lib/content'
import { BrandName } from '@/components/BrandName'
import { BrandMark } from '@/components/BrandMark'
import { FooterNewsletter } from '@/components/FooterNewsletter'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export function SiteChrome({children}:{children:React.ReactNode}) {
  const pathname=usePathname()
  const [dark,setDark] = useState(false)
  const [menuMounted,setMenuMounted] = useState(false)
  const [menuOpen,setMenuOpen] = useState(false)
  const [search,setSearch] = useState(false)
  const [visible,setVisible] = useState(true)
  const [solid,setSolid] = useState(false)
  const [signedIn,setSignedIn] = useState(false)
  const t = ui.en
  const currentYear = new Date().getFullYear()

  useEffect(()=>{
    setDark(localStorage.getItem('ganymai-theme')==='dark')
  },[])
  useEffect(()=>{
    document.documentElement.dataset.theme=dark?'dark':'light'
    localStorage.setItem('ganymai-theme',dark?'dark':'light')
  },[dark])
  useEffect(()=>{
    const supabase=createSupabaseBrowserClient()
    if(!supabase) return
    let active=true
    supabase.auth.getSession().then(({data})=>{ if(active) setSignedIn(!!data.session) })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(active) setSignedIn(!!session)
    })
    return()=>{active=false;subscription.unsubscribe()}
  },[])
  useEffect(()=>{
    let last=window.scrollY
    const onScroll=()=>{ const y=window.scrollY; setSolid(y>32); setVisible(y<80 || y<last); last=y }
    window.addEventListener('scroll',onScroll,{passive:true})
    return()=>window.removeEventListener('scroll',onScroll)
  },[])
  useEffect(()=>{
    if(!menuMounted) return
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') closeMenu() }
    document.body.style.overflow='hidden'
    window.addEventListener('keydown',onKey)
    return()=>{
      document.body.style.overflow=''
      window.removeEventListener('keydown',onKey)
    }
  },[menuMounted])

  function goBack(){
    if(window.history.length>1){
      window.history.back()
      return
    }
    window.location.assign('/')
  }

  function openMenu(){
    setSearch(false)
    setMenuMounted(true)
    requestAnimationFrame(()=>setMenuOpen(true))
  }
  function closeMenu(){
    setMenuOpen(false)
    window.setTimeout(()=>setMenuMounted(false),320)
  }

  if(pathname.startsWith('/studio')) return <>{children}</>

  return <>
    <header className={`topbar ${solid?'solid':''} ${visible?'show':'hide'} ${menuMounted?'menu-active':''}`}>
      <button type="button" className="logo" aria-label="Back" onClick={goBack}><BrandMark className="brand-mark" /><span className="header-brand-name"><BrandName /></span></button>
      <div className="top-actions">
        <button className="search-button" onClick={()=>setSearch(v=>!v)}>{t.search}</button>
        <Link className="desktop-only top-link" href="/subscribe">{t.subscribe}</Link>
        <Link className="desktop-only top-link" href="/archive">{t.archive}</Link>
        <Link className="desktop-only top-link" href={signedIn?"/profile":"/login"}>{signedIn?'Account':'Log in'}</Link>
        <button className="menu-button" aria-label={menuMounted?t.closeMenu:t.menu} aria-expanded={menuOpen} onClick={menuMounted?closeMenu:openMenu}><i/><i/><i/></button>
      </div>
      {search && <div className="search-panel"><input autoFocus placeholder={`${t.search}…`} /><button onClick={()=>setSearch(false)}>×</button></div>}
    </header>

    {menuMounted && <div className={`menu-layer ${menuOpen?'open':''}`}>
      <button className="menu-backdrop" aria-label={t.closeMenu} onClick={closeMenu}/>
      <aside className="menu-drawer" role="dialog" aria-modal="true" aria-label={t.menu}>
        <nav className="menu-links">
          <Link onClick={closeMenu} href="/about">{t.about}</Link>
          <Link onClick={closeMenu} href="/join">Join us</Link>
          <Link onClick={closeMenu} href="/">{t.essays}</Link>
          <Link className="mobile-only" onClick={closeMenu} href="/subscribe">{t.subscribe}</Link>
          <Link className="mobile-only" onClick={closeMenu} href="/archive">{t.archive}</Link>
          {signedIn
            ?<>
              <Link onClick={closeMenu} href="/library">My Library</Link>
              <Link onClick={closeMenu} href="/profile">Account</Link>
            </>
            :<>
              <Link onClick={closeMenu} href="/login">Log in</Link>
              <Link onClick={closeMenu} href="/signup">{t.signup}</Link>
            </>}
          <Link onClick={closeMenu} href="/submit">Submit an essay</Link>
          <Link onClick={closeMenu} href="/contact">{t.contact}</Link>
          <Link onClick={closeMenu} href="/donate">{t.donate}</Link>
        </nav>
        <div className="menu-controls">
          <button className="setting-button" onClick={()=>setDark(v=>!v)}>
            <span>{t.theme}</span><b>{dark?t.dark:t.light}</b>
          </button>
          <div className="social" aria-label="Social links">
            <a className="social-icon" href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
            </a>
            <a className="social-icon" href="https://www.patreon.com" target="_blank" rel="noreferrer" aria-label="Patreon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.957 7.21c-.004-3.064-2.391-5.576-5.191-6.482-3.478-1.125-8.064-.962-11.384.604C2.357 3.231 1.093 7.391 1.046 11.54c-.039 3.411.302 12.396 5.369 12.46 3.765.047 4.326-4.804 6.068-7.141 1.24-1.662 2.836-2.132 4.801-2.618 3.376-.836 5.678-3.501 5.673-7.031Z"/></svg>
            </a>
          </div>
        </div>
      </aside>
    </div>}

    <main>{children}</main>
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <div className="footer-brand"><BrandName /></div>
          <p className="footer-motto">{t.motto}</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <Link href="/about">{t.aboutUs}</Link>
          <Link href="/join">Join us</Link>
          <Link href="/archive">{t.ourArchive}</Link>
          <Link href="/submit">Submit an essay</Link>
          <Link href="/privacy">{t.privacyPolicy}</Link>
          <Link href="/terms">{t.termsOfUse}</Link>
          <Link href="/accessibility">{t.accessibilityStatement}</Link>
          <Link href="/community-guidelines">Community Guidelines</Link>
          <Link href="/donation-statement">{t.donationStatement}</Link>
          <Link href="/contact">{t.contactUs}</Link>
        </nav>

        <FooterNewsletter/>

        <div className="footer-social-row" aria-label="Social links">
          <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
          </a>
          <a href="https://www.patreon.com" target="_blank" rel="noreferrer" aria-label="Patreon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.957 7.21c-.004-3.064-2.391-5.576-5.191-6.482-3.478-1.125-8.064-.962-11.384.604C2.357 3.231 1.093 7.391 1.046 11.54c-.039 3.411.302 12.396 5.369 12.46 3.765.047 4.326-4.804 6.068-7.141 1.24-1.662 2.836-2.132 4.801-2.618 3.376-.836 5.678-3.501 5.673-7.031Z"/></svg>
          </a>
        </div>

        <div className="footer-bottom">
          <p>© <span suppressHydrationWarning>{currentYear}</span> <BrandName /></p>
          <p className="footer-note">Independent essays on people and the world.</p>
        </div>
      </div>
    </footer>
  </>
}
