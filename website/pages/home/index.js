import { useRect } from '@studio-freight/hamo'
import cn from 'clsx'
import { Button } from 'components/button'
import { Card } from 'components/card'
import { HorizontalSlides } from 'components/horizontal-slides'
import { ListItem } from 'components/list-item'
import { Parallax } from 'components/parallax'
import { useScroll } from 'hooks/use-scroll'
import { Layout } from 'layouts/default'
import { clamp, mapRange } from 'lib/maths'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import { useWindowSize } from 'react-use'
import s from './home.module.scss'

const SFDR = dynamic(() => import('icons/sfdr.svg'), { ssr: false })
const GitHub = dynamic(() => import('icons/github.svg'), { ssr: false })

export default function Home() {
  const [hasScrolled, setHasScrolled] = useState()
  const zoomRef = useRef(null)
  const [zoomWrapperRectRef, zoomWrapperRect] = useRect()
  const { height: windowHeight } = useWindowSize()

  useScroll(({ scroll }) => {
    setHasScrolled(scroll > 10)
    if (!zoomWrapperRect.top) return

    const start = zoomWrapperRect.top + windowHeight * 0.5
    const end = zoomWrapperRect.top + zoomWrapperRect.height - windowHeight

    const progress = clamp(0, mapRange(start, end, scroll, 0, 1), 1)
    const center = 0.6
    const progress1 = clamp(0, mapRange(0, center, progress, 0, 1), 1)
    const progress2 = clamp(0, mapRange(center - 0.055, 1, progress, 0, 1), 1)

    zoomRef.current.style.setProperty('--progress1', progress1)
    zoomRef.current.style.setProperty('--progress2', progress2)

    if (progress === 1) {
      zoomRef.current.style.setProperty('background-color', 'currentColor')
    } else {
      zoomRef.current.style.removeProperty('background-color')
    }
  })

  return (
    <Layout
      theme="dark"
      seo={{
        title: 'Lenis – Get smooth or die trying',
        description:
          'A new smooth scroll library fresh out of the Studio Freight Darkroom',
      }}
    >
      <section className={s.hero}>
        <div className="layout-grid">
          <h1 className={s.title}>Lenis</h1>
          <SFDR className={s.icon} />
          <span className={s.sub}>
            <h2 className={cn('h3', s.subtitle)}>Smooth Scroll</h2>
            <h2 className={cn('p-s', s.tm)}>
              <span>©</span> {new Date().getFullYear()} sTUDIO FREIGHT
            </h2>
          </span>
        </div>

        <div className={cn(s.bottom, 'layout-grid')}>
          <div
            className={cn(
              'hide-on-mobile',
              s['scroll-hint'],
              hasScrolled && s.hide
            )}
          >
            <p className={s.text}>
              scroll <br /> to explore
            </p>
          </div>
          <p className={cn(s.description, 'p-s')}>
            A new smooth scroll library <br /> fresh out of the <br /> Studio
            Freight Darkroom
          </p>
          <Button
            className={s.cta}
            arrow
            icon={<GitHub />}
            href="https://github.com/studio-freight/lenis"
          >
            Check it out on github
          </Button>
        </div>
      </section>
      <section className={s.why}>
        <div className="layout-grid">
          <p className={cn(s.sticky, 'h2')}>
            <a href="#top">Why smooth scroll?</a>
          </p>
          <aside className={s.features}>
            <div className={s.feature}>
              <p className="p">
                We’ve heard all the reasons to not use smooth scroll. It feels
                hacky. It’s inaccessible. It’s not performant. It’s
                over-engineered. And historically, those were all true. But we
                like to imagine things as they could be, then build them. So,
                why should you use smooth scroll?
              </p>
            </div>
            <div className={s.feature}>
              <h4 className={cn(s.title, 'h4')}>
                Create more immersive interfaces
              </h4>
              <p className="p">
                Unlock the creative potential and impact of your web
                experiences. Smoothing the scroll pulls users into the flow of
                the experience that feels so substantial that they forget
                they’re navigating a web page.
              </p>
            </div>
            <div className={s.feature}>
              <h4 className={cn(s.title, 'h4')}>
                Normalize all your user inputs
              </h4>
              <p className="p">
                Give all your users the same (dope) experience whether they’re
                using trackpads, mouse wheels, or otherwise. With smooth scroll,
                you control how silky, heavy, or responsive the experience
                should be — no matter the input. Magic!
              </p>
            </div>
            <div className={s.feature}>
              <h4 className={cn(s.title, 'h4')}>
                Make your animations flawless
              </h4>
              <p className="p">
                Synchronization with native scroll is not reliable. Those jumps
                and delays with scroll-linked animations are caused by
                multi-threading, where modern browsers run animations/effects
                asynchronously with the scroll. Smooth scroll fixes this.
              </p>
            </div>
          </aside>
        </div>
      </section>
      <section className={s.rethink}>
        <div className={cn('layout-grid', s.pre)}>
          <div className={s.highlight}>
            <Parallax speed={-0.5}>
              <p className="h2">Rethinking smooth scroll</p>
            </Parallax>
          </div>
          <div className={s.comparison}>
            <Parallax speed={0.5}>
              <p className="p">
                We have to give props to libraries like{' '}
                <span className="contrast">Locomotive Scroll</span> and{' '}
                <span className="contrast">GSAP SmoothScroller</span>. They’re
                well built and well documented – and we’ve used them a lot. But
                they still have issues that keep them from being bulletproof.
              </p>
            </Parallax>
          </div>
        </div>
        <div className={s.cards}>
          <HorizontalSlides>
            <Card
              className={s.card}
              number="01"
              text="Loss of performance budget due to using CSS transforms"
            />
            <Card
              className={s.card}
              number="02"
              text="Inaccessibility from no page search support and native scrollbar"
            />
            <Card
              className={s.card}
              number="03"
              text="Non-negligible import costs (12.1kb - 24.34kb gzipped)"
            />
            <Card
              className={s.card}
              number="04"
              text="Limited animation systems for complex, scroll-based animations"
            />
            <Card
              className={s.card}
              number="05"
              text="Erasing native APIs like Intersection-Observer, CSS Sticky, etc."
            />
          </HorizontalSlides>
        </div>
      </section>
      <section
        ref={(node) => {
          zoomWrapperRectRef(node)
          zoomRef.current = node
        }}
        className={s.solution}
      >
        <div className={s.inner}>
          <div className={s.zoom}>
            <h2 className={cn(s.first, 'h1 vh')}>
              so we built <br />
              <span className="contrast">web scrolling</span>
            </h2>
            <h2 className={cn(s.enter, 'h3 vh')}>
              Enter <br /> Lenis
            </h2>
            <h2 className={cn(s.second, 'h1 vh')}>As it should be</h2>
          </div>
        </div>
      </section>
      <section className={cn('theme-light', s.featuring)}>
        <div className="layout-block">
          <p className="p-l">
            Lenis is an <span className="contrast">open-source library</span>{' '}
            built to standardize scroll experiences and sauce up websites with
            butter-smooth navigation, all while using the platform and keeping
            it accessible.
          </p>
        </div>
      </section>
      <section className={cn('theme-light', s['in-use'])}>
        <div className="layout-grid">
          <aside className={s.title}>
            <p className="h3">
              Lenis <br />
              <span className="grey">in use</span>
            </p>
          </aside>
          <ul className={s.list}>
            <li>
              <ListItem
                title="Wyre"
                source="Studio Freight"
                href="https://sendwyre.com"
              />
            </li>
            <li>
              <ListItem
                title="Lunchbox"
                source="Studio Freight"
                href="https://lunchbox.io"
              />
            </li>
            <li>
              <ListItem
                title="Scroll Animation Ideas for Image Grids"
                source="Codrops"
                href="https://tympanus.net/Development/ScrollAnimationsGrid/"
              />
            </li>
            <li>
              <ListItem
                title="Easol"
                source="Studio Freight"
                href="https://easol.com"
              />
            </li>
            <li>
              <ListItem
                title="Repeat"
                source="Studio Freight"
                href="https://getrepeat.io"
              />
            </li>
            <li>
              <ListItem
                title="How to Animate SVG Shapes on Scroll"
                source="Codrops"
                href="https://tympanus.net/codrops/2022/06/08/how-to-animate-svg-shapes-on-scroll"
              />
            </li>
            <li>
              <ListItem
                title="Dragonfly"
                source="Studio Freight"
                href="https://dragonfly.xyz"
              />
            </li>
            <li>
              <ListItem
                title="Yuga Labs"
                source="Antinomy Studio"
                href="https://yuga.com"
              />
            </li>
          </ul>
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      id: 'home',
    }, // will be passed to the page component as props
  }
}
