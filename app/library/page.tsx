import type {Metadata} from 'next'
import {LibraryClient} from '@/components/LibraryClient'
export const metadata:Metadata={title:'My Library',robots:{index:false,follow:false}}
export default function LibraryPage(){
  return <section className="reader-page library-page">
    <div className="eyebrow">MY LIBRARY</div>
    <h1>Saved for later.</h1>
    <LibraryClient/>
  </section>
}
