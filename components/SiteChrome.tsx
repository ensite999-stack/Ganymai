'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ui } from '@/lib/content'
import { BrandName } from '@/components/BrandName'
import { BrandMark } from '@/components/BrandMark'
import { FooterNewsletter } from '@/components/FooterNewsletter'

export function SiteChrome({children}:{children:React.ReactNode}) {
  const pathname=usePathname()
  const [dark,setDark] = useState(false)
  const [menuMounted,setMenuMounted] = useState(false)
  const [menuOpen,setMenuOpen] = useState(false)
  const [search,setSearch] = useState(false)
  const [visible,setVisible] = useState(true)
  const [solid,setSolid] = useState(false)
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
      <button className="logo" aria-label="Go back" onClick={()=>history.length>1?history.back():(location.href='/')}><BrandMark className="brand-mark" /><span className="header-brand-name"><BrandName /></span></button>
      <div className="top-actions">
        <button className="search-button" onClick={()=>setSearch(v=>!v)}>{t.search}</button>
        <Link className="desktop-only top-link" href="/subscribe">{t.subscribe}</Link>
        <Link className="desktop-only top-link" href="/archive">{t.archive}</Link>
        <Link className="desktop-only top-link" href="/login">Log in</Link>
        <button className="menu-button" aria-label={menuMounted?t.closeMenu:t.menu} aria-expanded={menuOpen} onClick={menuMounted?closeMenu:openMenu}><i/><i/><i/></button>
      </div>
      {search && <div className="search-panel"><input autoFocus placeholder={`${t.search}…`} /><button onClick={()=>setSearch(false)}>×</button></div>}
    </header>

    {menuMounted && <div className={`menu-layer ${menuOpen?'open':''}`}>
      <button className="menu-backdrop" aria-label={t.closeMenu} onClick={closeMenu}/>
      <aside className="menu-drawer" role="dialog" aria-modal="true" aria-label={t.menu}>
        <nav className="menu-links">
          <Link onClick={closeMenu} href="/about">{t.about}</Link>
          <Link onClick={closeMenu} href="/">{t.essays}</Link>
          <Link className="mobile-only" onClick={closeMenu} href="/subscribe">{t.subscribe}</Link>
          <Link className="mobile-only" onClick={closeMenu} href="/archive">{t.archive}</Link>
          <Link onClick={closeMenu} href="/login">Log in</Link>
          <Link onClick={closeMenu} href="/signup">{t.signup}</Link>
          <Link onClick={closeMenu} href="/contact">{t.contact}</Link>
          <Link onClick={closeMenu} href="/donate">{t.donate}</Link>
        </nav>
        <div className="menu-controls">
          <button className="setting-button" onClick={()=>setDark(v=>!v)}>
            <span>{t.theme}</span><b>{dark?t.dark:t.light}</b>
          </button>
          <div className="social" aria-label="Social links">
            <a className="social-icon" href="https://x.com" aria-label="X">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
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
          <Link href="/archive">{t.ourArchive}</Link>
          <Link href="/privacy">{t.privacyPolicy}</Link>
          <Link href="/terms">{t.termsOfUse}</Link>
          <Link href="/accessibility">{t.accessibilityStatement}</Link>
          <Link href="/donation-statement">{t.donationStatement}</Link>
          <Link href="/contact">{t.contactUs}</Link>
        </nav>

        <FooterNewsletter/>

        <div className="footer-social-row" aria-label="Social links">
          <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
          </a>
          <a href="https://www.patreon.com" target="_blank" rel="noreferrer" aria-label="Patreon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.62 4.08a6.04 6.04 0 1 1 0 12.08 6.04 6.04 0 0 1 0-12.08ZM3 4.08h3.18V20H3V4.08Z"/></svg>
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
