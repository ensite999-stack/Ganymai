import type { Metadata } from 'next'
import { Manrope, Parisienne } from 'next/font/google'
import './globals.css'
import { SiteChrome } from '@/components/SiteChrome'
import { BrandTitleGuard } from '@/components/BrandTitleGuard'
import { BRAND_NAME } from '@/lib/brand'
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_URL } from '@/lib/site'

const manrope = Manrope({ subsets:['latin'], weight:['700','800'], variable:'--font-brand' })
const parisienne = Parisienne({ subsets:['latin'], weight:'400', variable:'--font-script' })

export const metadata: Metadata = {
  metadataBase:new URL(SITE_URL),
  title:{default:BRAND_NAME,template:`%s | ${BRAND_NAME}`},
  applicationName:BRAND_NAME,
  description:SITE_DESCRIPTION,
  keywords:SITE_KEYWORDS,
  creator:BRAND_NAME,
  publisher:BRAND_NAME,
  category:'Editorial',
  alternates:{canonical:'/'},
  referrer:'origin-when-cross-origin',
  openGraph:{
    type:'website',
    url:'/',
    siteName:BRAND_NAME,
    title:BRAND_NAME,
    description:SITE_DESCRIPTION
  },
  twitter:{
    card:'summary',
    title:BRAND_NAME,
    description:SITE_DESCRIPTION
  },
  robots:{
    index:true,
    follow:true,
    googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}
  }
}

const websiteJsonLd={
  '@context':'https://schema.org',
  '@type':'WebSite',
  name:BRAND_NAME,
  url:SITE_URL,
  description:SITE_DESCRIPTION
}

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en">
    <body className={`${manrope.variable} ${parisienne.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteJsonLd)}}/>
      <BrandTitleGuard/>
      <SiteChrome>{children}</SiteChrome>
    </body>
  </html>
}
