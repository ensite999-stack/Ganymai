import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandName } from '@/components/BrandName'

export const metadata:Metadata={
  title:'About',
  description:'About Ganymai, an independent magazine publishing essays on people, nature, power, memory, history and society.',
  alternates:{canonical:'/about'}
}

export default function About(){
  return <section className="text-page about-page">
    <div className="eyebrow">ABOUT</div>
    <h1><BrandName /> writes about people in relation.</h1>

    <div className="about-values">
      <p><BrandName /> is operated by independent members brought together by shared values.</p>
      <p>We believe people and the world exist in a relationship of mutual dependence.</p>
      <p className="human-world">The human world is free and plural.</p>
      <p>Whether poor or wealthy, healthy or disabled, whatever a person’s appearance, each life belongs fully within that world.</p>
    </div>

    <p>We publish essays on philosophy, nature, human rights, environment, society, history and politics. The subject is broad by design: a person is shaped by institutions, landscapes, memory, language, conflict and care.</p>
    <p>Our aim is to use vivid, direct prose and serious thought without turning complexity into obscurity.</p>

    <p className="about-join"><Link href="/join">Join us →</Link></p>

    <h2>The name</h2>
    <p><em><BrandName /></em> is drawn from Ancient Greek <em>γάνυμαι</em>, a verb associated with brightening, gladness and delight. We keep the spelling as a brand name rather than presenting it as a scholarly transliteration.</p>

    <h2>Motto</h2>
    <p className="big-quote">Life is unfinished…</p>
  </section>
}
