<script setup lang="ts">
// Route: / (landing)
definePageMeta({ layout: 'public' })
useHead({ title: 'popplate · Menu i 3D' })

const UNSPLASH = 'https://images.unsplash.com/'
const IMG = {
  hero: UNSPLASH + 'photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=80',
  feature: UNSPLASH + 'photo-1607301406259-dfb186e15de8?w=1200&auto=format&fit=crop&q=80',
  dish1: UNSPLASH + 'photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  dish2: UNSPLASH + 'photo-1551218808-94e220e084d2?w=800&auto=format&fit=crop&q=80',
  dish3: UNSPLASH + 'photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
  mood1: UNSPLASH + 'photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop&q=80',
  mood2: UNSPLASH + 'photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80',
  mood3: UNSPLASH + 'photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
  mood4: UNSPLASH + 'photo-1424847651672-bf20a4b0982b?w=800&auto=format&fit=crop&q=80',
  mood5: UNSPLASH + 'photo-1592861956120-e524fc739696?w=800&auto=format&fit=crop&q=80',
}

const DISHES = [
  { name: 'Stenbider med dild', cat: 'Forret', price: '165 kr', italic: 'dild', img: IMG.dish1 },
  { name: 'Brændt selleri', cat: 'Vegetar', price: '145 kr', italic: 'selleri', img: IMG.dish2 },
  { name: 'Hindbær & havtorn', cat: 'Dessert', price: '95 kr', italic: 'havtorn', img: IMG.dish3 },
]

const TIERS = [
  {
    name: 'Free', price: '0', sub: 'kr / md',
    desc: 'Test platformen med jeres signaturretter.',
    features: ['Op til 3 retter', '1 restaurant', 'Standard 3D-kvalitet', 'popplate watermark', 'QR-koder'],
    cta: 'Start gratis', featured: false, tag: null,
  },
  {
    name: 'Basic', price: '499', sub: 'kr / md',
    desc: 'Til den daglige menu på den enkelte adresse.',
    features: ['Op til 30 retter', '1 restaurant', 'Høj 3D-kvalitet', 'Eget brand', 'Analytics', 'Allergen-mærkning'],
    cta: 'Vælg Basic', featured: true, tag: 'Populær',
  },
  {
    name: 'Pro', price: '1.299', sub: 'kr / md',
    desc: 'Kæder, hoteller og restaurantgrupper.',
    features: ['Ubegrænsede retter', 'Op til 10 restauranter', 'Premium 3D + animation', 'API + integrationer', 'Prioriteret support', 'Custom domain'],
    cta: 'Kontakt salg', featured: false, tag: null,
  },
]

// Count-up animation
function useCountUp(target: number, decimals = 0) {
  const value = ref(0)
  const started = ref(false)

  function start() {
    if (started.value) return
    started.value = true
    const duration = 1600
    const startTs = performance.now()
    function tick(now: number) {
      const t = Math.min(1, (now - startTs) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      value.value = target * eased
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const display = computed(() =>
    decimals > 0 ? value.value.toFixed(decimals) : Math.round(value.value).toString()
  )

  return { display, start }
}

const stat1 = useCountUp(34)
const stat2 = useCountUp(92)
const stat3 = useCountUp(0)
const stat4 = useCountUp(1.4, 1)

const statsRef = ref<HTMLElement | null>(null)
onMounted(() => {
  if (!statsRef.value) return
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      stat1.start(); stat2.start(); stat3.start(); stat4.start()
      io.disconnect()
    }
  }, { threshold: 0.4 })
  io.observe(statsRef.value)
})
</script>

<template>
  <main data-screen-label="Landing">
    <!-- ═══ HERO ═══ -->
    <section class="relative pt-20 pb-16 overflow-hidden max-[720px]:pt-16 max-[720px]:pb-10">
      <div class="absolute inset-0 pointer-events-none z-0 opacity-50"
           style="background: radial-gradient(ellipse 1200px 700px at 50% 20%, rgba(212, 168, 128, 0.35), transparent 65%), radial-gradient(ellipse 800px 600px at 20% 80%, rgba(139, 78, 44, 0.18), transparent 60%);" />

      <div class="relative z-[2] grid place-items-center pt-5 max-[720px]:pt-0 hero-area">
        <!-- Giant wordmark IN FRONT with blend-mode -->
        <div class="wordmark-wrap">
          <div class="wordmark-text">popplate<span class="wordmark-dot">.</span></div>
        </div>

        <!-- Centerpiece image -->
        <div class="hero-centerpiece">
          <img :src="IMG.hero" alt="Signaturret" class="w-full h-full object-cover" />
        </div>

        <!-- Editorial corner labels -->
        <div class="absolute top-8 left-10 z-[6] mono-label flex items-center gap-3 max-[900px]:text-[9px] max-[600px]:hidden">
          <span class="font-display italic text-[18px] text-clay-deep tracking-[-0.01em] normal-case">N° 01</span>
          <span class="w-6 h-px bg-clay-deep" />
          Studio Notes
        </div>
        <div class="absolute top-8 right-10 z-[6] mono-label flex items-center gap-3 max-[900px]:text-[9px] max-[600px]:hidden">
          A/W 2026
          <span class="font-display italic text-[18px] text-clay-deep tracking-[-0.01em] normal-case">— Folkér</span>
        </div>
      </div>

      <!-- Caption -->
      <div class="relative z-[5] text-center mx-auto mt-10 max-[720px]:mt-6" style="width: min(680px, 90vw);">
        <h1 class="font-display font-normal text-ink-soft max-w-[540px] mx-auto" style="font-size: clamp(26px, 2.8vw, 40px); letter-spacing: -0.015em; line-height: 1.15;">
          En menu der ikke <span class="italic text-clay-deep">står stille</span> — gæsten kan se hver ret i 3D, før den ankommer.
        </h1>
        <div class="flex justify-center gap-3.5 mt-8 flex-wrap">
          <NuxtLink to="/platform/signup" class="btn-primary">
            <span>Få demo til din restaurant</span>
            <span class="w-7 h-7 rounded-full grid place-items-center" style="background: rgba(255,255,255,0.12);">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </NuxtLink>
          <NuxtLink to="/r/folker" class="btn-ghost">Se eksempel-menu</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══ FLOW: Sådan virker det ═══ -->
    <section class="section section-alt" id="hvordan">
      <div class="wrap">
        <div class="section-head">
          <div>
            <div class="eyebrow mb-7">Sådan virker det</div>
            <h2 class="section-title">
              Tre trin.<br />
              <span class="italic">Nul</span> teknisk besvær.
            </h2>
          </div>
          <p class="section-aside">
            Vi skjuler den tunge maskine — 3D-rekonstruktion, mesh-cleanup, materialer, AR-eksport — bag en enkelt knap. I uploader fotos. Vi leverer en menu der lever.
          </p>
        </div>

        <div class="flow">
          <!-- 01 Upload -->
          <div class="flow-card">
            <div class="flow-num"><strong>01</strong> Upload</div>
            <div class="flow-visual">
              <div class="stack">
                <div class="stack-img"><div class="photo" style="background: linear-gradient(135deg, #d4a880, #8b6e4a);" /></div>
                <div class="stack-img"><div class="photo" style="background: linear-gradient(135deg, #c89968, #8b4e2c);" /></div>
                <div class="stack-img"><div class="photo" style="background: linear-gradient(135deg, #b87a4e, #6e4a45);" /></div>
              </div>
            </div>
            <h3 class="flow-h">3-8 fotos pr. ret <span class="italic">— det er alt.</span></h3>
            <p class="flow-p">Tag billeder fra forskellige vinkler med jeres telefon, eller upload dem I allerede har. Vi gør resten.</p>
          </div>

          <!-- 02 Generate -->
          <div class="flow-card">
            <div class="flow-num"><strong>02</strong> Generér</div>
            <div class="flow-visual">
              <div class="mesh-wrap">
                <span class="pulse-ring" />
                <span class="pulse-ring delay" />
                <span class="pulse-ring delay2" />
                <svg viewBox="0 0 200 200">
                  <defs>
                    <radialGradient id="meshGrad" cx="50%" cy="50%">
                      <stop offset="0" stop-color="#8b4e2c" />
                      <stop offset="0.6" stop-color="#b87a4e" />
                      <stop offset="1" stop-color="#d4a880" stop-opacity="0.4" />
                    </radialGradient>
                  </defs>
                  <g fill="none" stroke="url(#meshGrad)" stroke-width="0.6" opacity="0.85">
                    <ellipse v-for="i in 14" :key="'h'+i" cx="100" :cy="100 + (i - 7.5) * 8" :rx="Math.sqrt(Math.max(0, 75*75 - ((i-7.5)*8)**2))" :ry="Math.sqrt(Math.max(0, 75*75 - ((i-7.5)*8)**2)) * 0.25" />
                    <ellipse v-for="i in 12" :key="'v'+i" cx="100" cy="100" rx="75" ry="75" :transform="`rotate(${(i/12)*180} 100 100) scale(${Math.cos((i/12)*Math.PI)} 1)`" />
                  </g>
                  <circle cx="100" cy="100" r="75" fill="url(#meshGrad)" opacity="0.18" />
                </svg>
              </div>
            </div>
            <h3 class="flow-h">AI bygger en <span class="italic">model.</span></h3>
            <p class="flow-p">Mesh, materialer, lyssætning — alt klar til AR. Typisk 90 sekunder per ret. Vi sender besked når den er klar.</p>
          </div>

          <!-- 03 Serve -->
          <div class="flow-card">
            <div class="flow-num"><strong>03</strong> Servér</div>
            <div class="flow-visual">
              <div class="ar-phone">
                <div class="ar-screen">
                  <div class="ar-corner tl" />
                  <div class="ar-corner tr" />
                  <div class="ar-corner bl" />
                  <div class="ar-corner br" />
                  <div class="ar-dish-3d" />
                </div>
              </div>
            </div>
            <h3 class="flow-h">Retten lander <span class="italic">på bordet.</span></h3>
            <p class="flow-p">Én QR-kode per ret — eller én for hele menuen. Virker på alle nyere telefoner uden app.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ STATS ═══ -->
    <section ref="statsRef" class="section" style="padding: 60px 0 100px;">
      <div class="wrap">
        <div class="stats">
          <div class="stat">
            <div class="stat-num">+<span class="ital">{{ stat1.display.value }}</span><span class="sub-unit">%</span></div>
            <div class="stat-label">Gennemsnitlig<br />ordreværdi</div>
          </div>
          <div class="stat">
            <div class="stat-num"><span class="ital">{{ stat2.display.value }}</span><span class="sub-unit">s</span></div>
            <div class="stat-label">Tid pr. ret<br />i 3D</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ stat3.display.value }}</div>
            <div class="stat-label">Apps gæsten<br />skal hente</div>
          </div>
          <div class="stat">
            <div class="stat-num"><span class="ital">{{ stat4.display.value }}</span><span class="sub-unit">k</span></div>
            <div class="stat-label">Retter sidste<br />måned</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ DISHES: Live på menuen ═══ -->
    <section class="dishes-section" id="menu">
      <div class="wrap">
        <div class="section-head">
          <div>
            <div class="eyebrow mb-7">Live på menuen</div>
            <h2 class="section-title">
              Hver ret. <span class="italic">Drejelig.</span><br />
              Zoombar. <span class="italic">Tilgængelig</span>.
            </h2>
          </div>
          <p class="section-aside">
            Et glimt af hvad jeres gæster ser. På den rigtige menu kan de holde telefonen op til bordet — og retten dukker op i fuld størrelse.
          </p>
        </div>

        <!-- Feature dish -->
        <div class="dish-feature">
          <div class="dish-img-large">
            <img :src="IMG.feature" alt="Brændt porre, brunet smør & rugkrydder" loading="lazy" />
          </div>
          <div>
            <div class="eyebrow mb-6">Signaturret · Restaurant Folkér</div>
            <h3 class="font-display text-[28px] font-normal mb-4 max-[720px]:text-[22px]" style="letter-spacing: -0.02em; line-height: 1.2;">Brændt porre, brunet smør & rugkrydder</h3>
            <p class="text-ink-mute text-[15px] leading-relaxed mb-6">Et af de signature-billeder vores AI brugte til at bygge en interaktiv 3D-model. Gæsten kan dreje retten, zoome ind på sprødheden, og se den i fuld størrelse på bordet via AR.</p>
            <div class="meta-list">
              <div class="meta-row"><span>Hovedret</span><strong>245 kr</strong></div>
              <div class="meta-row"><span>Allergener</span><strong>Mælk · gluten</strong></div>
              <div class="meta-row"><span>AR-visning</span><strong>5 min visning</strong></div>
            </div>
            <div class="flex items-center gap-3 mt-6 text-ink-mute">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect x="3" y="3" width="10" height="10" stroke="currentColor" stroke-width="1.5"/>
                <rect x="19" y="3" width="10" height="10" stroke="currentColor" stroke-width="1.5"/>
                <rect x="3" y="19" width="10" height="10" stroke="currentColor" stroke-width="1.5"/>
                <rect x="22" y="22" width="3" height="3" fill="currentColor"/>
              </svg>
              <span class="font-body text-[14px]">Scan koden — og prøv selv.</span>
            </div>
          </div>
        </div>

        <!-- Dish grid -->
        <div class="dish-row">
          <div v-for="(d, i) in DISHES" :key="i" class="dish-card">
            <div class="dish-img">
              <img :src="d.img" :alt="d.name" loading="lazy" />
              <div class="badge-3d">3D · AR</div>
              <div class="price-tag">{{ d.price }}</div>
            </div>
            <h4 class="font-display text-[18px] font-normal mt-3 mb-1" style="letter-spacing: -0.01em;">
              {{ d.name.split(d.italic)[0] }}<span class="italic text-clay-deep">{{ d.italic }}</span>{{ d.name.split(d.italic)[1] || '' }}
            </h4>
            <p class="text-ink-faint text-[13px]">{{ d.cat }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ MOODBOARD ═══ -->
    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <div>
            <div class="eyebrow mb-7">Stemning · Inspiration</div>
            <h2 class="section-title">
              For restauranter der <span class="italic">tror på</span><br />
              detaljerne.
            </h2>
          </div>
          <p class="section-aside">
            popplate er bygget til steder hvor præsentationen betyder noget. Hvor lyssætningen er overvejet, og hvor gæsten husker retten lige så meget som smagen.
          </p>
        </div>

        <div class="moodboard-grid">
          <div class="mood-img m1"><img :src="IMG.feature" alt="Plating" loading="lazy" /><span class="mood-caption">01 — Plating</span></div>
          <div class="mood-img m2"><img :src="IMG.mood1" alt="Atmosphere" loading="lazy" /><span class="mood-caption">02 — Atmosphere</span></div>
          <div class="mood-img m3"><img :src="IMG.mood2" alt="Detail" loading="lazy" /><span class="mood-caption">03 — Detail</span></div>
          <div class="mood-img m4"><img :src="IMG.mood3" alt="Craft" loading="lazy" /><span class="mood-caption">04 — Craft</span></div>
          <div class="mood-img m5"><img :src="IMG.mood4" alt="Setting" loading="lazy" /><span class="mood-caption">05 — Setting</span></div>
          <div class="mood-img m6"><img :src="IMG.mood5" alt="Pairing" loading="lazy" /><span class="mood-caption">06 — Pairing</span></div>
        </div>
      </div>
    </section>

    <!-- ═══ PRICING ═══ -->
    <section class="section section-alt" id="priser">
      <div class="wrap">
        <div class="section-head">
          <div>
            <div class="eyebrow mb-7">Priser</div>
            <h2 class="section-title">
              Klar pris. <span class="italic">Klar ret.</span>
            </h2>
          </div>
          <p class="section-aside">
            Vælg en plan. Skift eller annullér når som helst. Ingen opsætningsgebyrer, ingen overraskelser på regningen.
          </p>
        </div>

        <div class="pricing-grid">
          <div v-for="t in TIERS" :key="t.name" class="tier" :class="{ featured: t.featured }">
            <div class="tier-head">
              <div class="tier-name">{{ t.name }}</div>
              <span v-if="t.tag" class="tier-tag">{{ t.tag }}</span>
            </div>
            <div class="tier-price">{{ t.price }}<span class="sub"> {{ t.sub }}</span></div>
            <div class="tier-desc">{{ t.desc }}</div>
            <ul class="tier-list">
              <li v-for="(f, fi) in t.features" :key="fi">
                <span class="check">
                  <svg viewBox="0 0 10 10" fill="none"><path d="M1 5l3 3 5-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <span>{{ f }}</span>
              </li>
            </ul>
            <NuxtLink :to="t.featured ? '/platform/signup' : (t.name === 'Free' ? '/platform/signup' : '/platform/signup')" class="tier-cta">{{ t.cta }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA STRIP ═══ -->
    <section class="cta-strip" id="start">
      <div class="wrap">
        <div class="cta-card">
          <div class="cta-bg" />
          <div class="cta-content">
            <div class="eyebrow mb-6" style="color: var(--clay-soft, #d4a880);">Klar når I er</div>
            <h2 class="cta-title">
              Jeres første ret i 3D — <br />
              <span class="italic">på under fem minutter.</span>
            </h2>
            <p class="cta-sub">
              Opret konto, upload tre billeder af én ret, og se den i AR. Ingen kreditkort. Ingen kontrakt. Bare en QR-kode I kan vise gæsterne i aften.
            </p>
            <div class="flex gap-3.5 mt-10 flex-wrap">
              <NuxtLink to="/platform/signup" class="btn-primary" style="background: rgba(243, 237, 226, 0.15); border: 1px solid rgba(243, 237, 226, 0.2);">
                <span>Start gratis prøve</span>
                <span class="w-7 h-7 rounded-full grid place-items-center" style="background: rgba(255,255,255,0.12);">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </span>
              </NuxtLink>
              <a href="#kontakt" class="btn-ghost" style="color: rgba(243, 237, 226, 0.8); border-color: rgba(243, 237, 226, 0.2);">Book demo</a>
            </div>
          </div>
          <div class="cta-qr-area">
            <div class="qr-mock">
              <!-- Simplified QR art -->
              <svg viewBox="0 0 189 189" width="100%" height="100%">
                <rect width="189" height="189" fill="#f3ede2" rx="4" />
                <!-- Corner patterns -->
                <rect x="9" y="9" width="54" height="54" fill="#1a1410" />
                <rect x="18" y="18" width="36" height="36" fill="#f3ede2" />
                <rect x="27" y="27" width="18" height="18" fill="#1a1410" />
                <rect x="126" y="9" width="54" height="54" fill="#1a1410" />
                <rect x="135" y="18" width="36" height="36" fill="#f3ede2" />
                <rect x="144" y="27" width="18" height="18" fill="#1a1410" />
                <rect x="9" y="126" width="54" height="54" fill="#1a1410" />
                <rect x="18" y="135" width="36" height="36" fill="#f3ede2" />
                <rect x="27" y="144" width="18" height="18" fill="#1a1410" />
                <!-- Center logo -->
                <circle cx="94.5" cy="94.5" r="20" fill="#f3ede2" />
                <ellipse cx="94.5" cy="96.5" rx="13" ry="3.5" fill="#8b4e2c" />
                <ellipse cx="94.5" cy="94" rx="11" ry="2.6" fill="#b87a4e" />
                <!-- Data dots -->
                <rect v-for="n in 40" :key="n" :x="72 + ((n * 17) % 7) * 9" :y="72 + (Math.floor((n * 13) % 5)) * 9" width="7" height="7" fill="#1a1410" opacity="0.7" />
              </svg>
            </div>
            <div class="qr-corner-tag">scan mig</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="landing-footer" id="kontakt">
      <div class="wrap">
        <div class="footer-top">
          <div class="footer-col">
            <NuxtLink to="/" class="footer-logo">
              <span class="inline-block w-6 h-6">
                <svg viewBox="0 0 30 30" fill="none" class="w-full h-full">
                  <ellipse cx="15" cy="18" rx="13" ry="4" fill="#b87a4e" opacity="0.25" />
                  <ellipse cx="15" cy="15" rx="11" ry="3" fill="#8b4e2c" />
                  <ellipse cx="15" cy="13" rx="9" ry="2.4" fill="#b87a4e" />
                </svg>
              </span>
              <span class="font-display italic font-medium text-[20px] tracking-tight">popplate</span>
            </NuxtLink>
            <p class="footer-tagline">
              Det nye <span class="italic">menukort.</span><br />
              Bare smukkere.
            </p>
          </div>
          <div class="footer-col">
            <h5>Produkt</h5>
            <a href="#hvordan">Funktioner</a>
            <NuxtLink to="/pricing">Priser</NuxtLink>
            <NuxtLink to="/r/folker">Demo</NuxtLink>
            <a href="#">Roadmap</a>
          </div>
          <div class="footer-col">
            <h5>Selskab</h5>
            <a href="#">Om os</a>
            <a href="#">Kunder</a>
            <a href="#">Job</a>
            <a href="#kontakt">Kontakt</a>
          </div>
          <div class="footer-col">
            <h5>Juridisk</h5>
            <a href="#">Vilkår</a>
            <a href="#">Privatliv</a>
            <a href="#">Cookies</a>
            <a href="#">GDPR</a>
          </div>
        </div>

        <div class="giant-wordmark">popplate.</div>

        <div class="footer-bottom">
          <span>&copy; 2026 popplate ApS &middot; Odense, DK</span>
          <span>Hostet i EU &middot; CO₂-neutral</span>
          <span>info@popplate.dk</span>
        </div>
      </div>
    </footer>

    <!-- Spacer for dock nav -->
    <div class="h-24 max-[768px]:h-4" />
  </main>
</template>

<style scoped>
/* ── Wordmark blend-mode ── */
.wordmark-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  pointer-events: none;
  user-select: none;
  mix-blend-mode: difference;
}
.wordmark-text {
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-weight: 500;
  font-size: clamp(100px, 22vw, 360px);
  line-height: 1;
  letter-spacing: -0.04em;
  color: white;
  white-space: nowrap;
}
.wordmark-dot { color: white; }

/* ── Hero ── */
.hero-area { height: min(78vh, 720px); }
@media (max-width: 720px) { .hero-area { height: min(55vh, 440px); } }

.hero-centerpiece {
  position: relative;
  z-index: 3;
  overflow: hidden;
  width: clamp(240px, 36vw, 500px);
  aspect-ratio: 1 / 1.15;
  box-shadow: 0 60px 120px rgba(26, 20, 16, 0.32), 0 20px 40px rgba(26, 20, 16, 0.18);
  background: radial-gradient(circle at 50% 35%, #d4a880 0%, #b87a4e 30%, #8b4e2c 75%, #1a1410 100%);
}
@media (max-width: 720px) {
  .hero-centerpiece { width: clamp(200px, 65vw, 380px); }
}

/* ── Buttons ── */
.btn-primary {
  @apply font-body font-medium text-[15px] px-7 py-4.5 rounded-full bg-ink text-ink-inv inline-flex items-center gap-3.5 transition whitespace-nowrap;
}
.btn-primary:hover {
  @apply -translate-y-0.5 bg-clay-deep;
  box-shadow: 0 18px 40px rgba(139, 78, 44, 0.3);
}
.btn-ghost {
  @apply font-body font-medium text-[15px] px-7 py-4.5 rounded-full border border-line-strong text-ink inline-flex items-center gap-3 transition whitespace-nowrap;
}
.btn-ghost:hover { border-color: theme('colors.ink.DEFAULT'); background: rgba(26,20,16,0.04); }

/* ── Section layout ── */
.section { padding: 100px 0; }
@media (max-width: 720px) { .section { padding: 60px 0; } }
.section-alt { background: rgba(26, 20, 16, 0.025); }
.wrap { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 60px;
  margin-bottom: 64px;
}
@media (max-width: 800px) {
  .section-head { flex-direction: column; gap: 24px; margin-bottom: 40px; }
}
.section-title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(32px, 5vw, 56px);
  letter-spacing: -0.025em;
  line-height: 1.08;
}
.section-aside {
  max-width: 340px;
  font-size: 15px;
  color: theme('colors.ink.mute');
  line-height: 1.6;
  padding-top: 12px;
}
@media (max-width: 800px) {
  .section-aside { max-width: none; padding-top: 0; }
}

/* ── Flow cards ── */
.flow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  border-top: 1px solid rgba(26, 20, 16, 0.10);
  padding-top: 48px;
}
@media (max-width: 800px) {
  .flow { grid-template-columns: 1fr; gap: 48px; }
}
.flow-num {
  @apply font-mono text-[11px] uppercase font-medium text-clay-deep mb-8;
  letter-spacing: 0.2em;
}
.flow-num strong { color: theme('colors.ink.DEFAULT'); }
.flow-visual {
  height: 260px;
  display: grid;
  place-items: center;
  margin-bottom: 28px;
}
@media (max-width: 720px) { .flow-visual { height: 200px; } }
.flow-h {
  font-family: theme('fontFamily.display');
  font-size: 22px;
  font-weight: 400;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
  line-height: 1.25;
}
.flow-p {
  font-size: 14px;
  color: theme('colors.ink.mute');
  line-height: 1.6;
}

/* Polaroid stack */
.stack { position: relative; width: 180px; height: 220px; }
.stack-img {
  position: absolute;
  width: 150px;
  height: 180px;
  background: white;
  padding: 10px 10px 32px;
  box-shadow: 0 4px 20px rgba(26, 20, 16, 0.12);
}
.stack-img:nth-child(1) { transform: rotate(-8deg); top: 10px; left: 0; z-index: 1; }
.stack-img:nth-child(2) { transform: rotate(3deg); top: 0; left: 20px; z-index: 2; }
.stack-img:nth-child(3) { transform: rotate(-2deg); top: 5px; left: 10px; z-index: 3; }
.stack-img .photo { width: 100%; height: 100%; border-radius: 2px; }

/* Mesh wireframe */
.mesh-wrap {
  position: relative;
  width: 200px;
  height: 200px;
}
.pulse-ring {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  border: 1px solid rgba(184, 122, 78, 0.15);
  animation: pulse-expand 3s ease-out infinite;
}
.pulse-ring.delay { animation-delay: 1s; }
.pulse-ring.delay2 { animation-delay: 2s; }
@keyframes pulse-expand {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* AR phone */
.ar-phone {
  width: 140px;
  height: 260px;
  border-radius: 24px;
  background: #1a1410;
  padding: 12px 8px;
  box-shadow: 0 20px 60px rgba(26, 20, 16, 0.25);
}
.ar-screen {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: radial-gradient(circle at 50% 60%, #3a2515, #1a1410);
  position: relative;
  overflow: hidden;
}
.ar-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: rgba(184, 122, 78, 0.6);
}
.ar-corner.tl { top: 16px; left: 16px; border-top: 2px solid; border-left: 2px solid; }
.ar-corner.tr { top: 16px; right: 16px; border-top: 2px solid; border-right: 2px solid; }
.ar-corner.bl { bottom: 16px; left: 16px; border-bottom: 2px solid; border-left: 2px solid; }
.ar-corner.br { bottom: 16px; right: 16px; border-bottom: 2px solid; border-right: 2px solid; }
.ar-dish-3d {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(ellipse, #d4a880, #8b4e2c);
  box-shadow: 0 10px 30px rgba(184, 122, 78, 0.3);
}

/* ── Stats ── */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  text-align: center;
}
@media (max-width: 800px) { .stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .stats { grid-template-columns: 1fr; } }
.stat-num {
  font-family: theme('fontFamily.display');
  font-size: clamp(48px, 6vw, 72px);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 12px;
}
.stat-num .ital { font-style: italic; }
.stat-num .sub-unit {
  font-size: 0.45em;
  color: theme('colors.clay.deep');
  font-style: italic;
  margin-left: 2px;
}
.stat-label {
  @apply font-mono text-[11px] uppercase text-ink-faint font-medium;
  letter-spacing: 0.15em;
  line-height: 1.5;
}

/* ── Dishes section ── */
.dishes-section { padding: 100px 0; }
@media (max-width: 720px) { .dishes-section { padding: 60px 0; } }

.dish-feature {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 48px;
  align-items: center;
  margin-bottom: 48px;
}
@media (max-width: 800px) {
  .dish-feature { grid-template-columns: 1fr; gap: 32px; }
}
.dish-img-large {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 4px;
  background: theme('colors.card');
}
.dish-img-large img { width: 100%; height: 100%; object-fit: cover; }

.meta-list { border-top: 1px solid rgba(26, 20, 16, 0.10); }
.meta-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(26, 20, 16, 0.10);
  font-size: 14px;
}
.meta-row span { color: theme('colors.ink.mute'); }
.meta-row strong { font-weight: 500; }

.dish-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 720px) { .dish-row { grid-template-columns: 1fr; } }
.dish-img {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
  background: theme('colors.card');
}
.dish-img img { width: 100%; height: 100%; object-fit: cover; }
.badge-3d {
  position: absolute;
  top: 12px;
  left: 12px;
  @apply font-mono text-[9px] uppercase font-medium px-2.5 py-1.5 rounded-full;
  letter-spacing: 0.15em;
  background: rgba(26, 20, 16, 0.65);
  color: white;
  backdrop-filter: blur(8px);
}
.price-tag {
  position: absolute;
  bottom: 12px;
  right: 12px;
  @apply font-mono text-[11px] font-medium px-3 py-1.5 rounded-full;
  background: rgba(243, 237, 226, 0.9);
  backdrop-filter: blur(8px);
}

/* ── Moodboard ── */
.moodboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 16px;
}
@media (max-width: 720px) {
  .moodboard-grid { grid-template-columns: 1fr 1fr; }
}
.mood-img {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background: theme('colors.card');
}
.mood-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mood-img.m1 { grid-row: span 2; }
.mood-img.m1 img, .mood-img.m4 img { aspect-ratio: auto; height: 100%; }
.mood-img:not(.m1) img { aspect-ratio: 4/3; }
.mood-caption {
  position: absolute;
  bottom: 12px;
  left: 12px;
  @apply font-mono text-[9px] uppercase font-medium px-3 py-1.5 rounded-full;
  letter-spacing: 0.15em;
  background: rgba(243, 237, 226, 0.85);
  backdrop-filter: blur(8px);
}

/* ── Pricing ── */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: start;
}
@media (max-width: 800px) {
  .pricing-grid { grid-template-columns: 1fr; max-width: 420px; }
}
.tier {
  border: 1px solid rgba(26, 20, 16, 0.10);
  border-radius: 8px;
  padding: 32px 28px;
  background: theme('colors.paper');
}
.tier.featured {
  background: theme('colors.deep');
  color: theme('colors.ink.inv');
  border-color: transparent;
  box-shadow: 0 24px 60px rgba(26, 20, 16, 0.2);
}
.tier-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.tier-name {
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-size: 22px;
  font-weight: 400;
}
.tier-tag {
  @apply font-mono text-[9px] uppercase font-medium px-3 py-1.5 rounded-full;
  letter-spacing: 0.15em;
  background: theme('colors.clay.deep');
  color: white;
}
.tier-price {
  font-family: theme('fontFamily.display');
  font-size: clamp(48px, 5vw, 64px);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 8px;
}
.tier-price .sub {
  font-size: 14px;
  font-style: italic;
  opacity: 0.6;
  font-family: theme('fontFamily.body');
  letter-spacing: 0;
}
.tier-desc {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 28px;
  line-height: 1.5;
}
.tier-list {
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  border-top: 1px solid rgba(128, 128, 128, 0.15);
}
.tier-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  font-size: 14px;
}
.check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: theme('colors.clay.DEFAULT');
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.check svg { width: 10px; height: 10px; }
.featured .check { background: theme('colors.clay.soft'); }
.tier-cta {
  display: block;
  width: 100%;
  text-align: center;
  padding: 14px;
  border-radius: 999px;
  font-family: theme('fontFamily.body');
  font-weight: 500;
  font-size: 14px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  transition: all 200ms;
}
.tier-cta:hover { border-color: theme('colors.ink.DEFAULT'); }
.featured .tier-cta {
  background: theme('colors.clay.DEFAULT');
  color: white;
  border-color: transparent;
}
.featured .tier-cta:hover { background: theme('colors.clay.deep'); }

/* ── CTA strip ── */
.cta-strip { padding: 60px 0 100px; }
@media (max-width: 720px) { .cta-strip { padding: 40px 0 60px; } }
.cta-card {
  position: relative;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  gap: 40px;
  padding: 64px;
  border-radius: 12px;
  overflow: hidden;
  color: theme('colors.ink.inv');
}
@media (max-width: 800px) {
  .cta-card { grid-template-columns: 1fr; padding: 40px 28px; }
}
.cta-bg {
  position: absolute;
  inset: 0;
  background: theme('colors.deep');
  z-index: 0;
}
.cta-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 600px 400px at 80% 60%, rgba(184, 122, 78, 0.3), transparent 60%);
}
.cta-content { position: relative; z-index: 1; }
.cta-title {
  font-family: theme('fontFamily.display');
  font-size: clamp(28px, 3.5vw, 44px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 16px;
}
.cta-sub {
  font-size: 15px;
  color: rgba(243, 237, 226, 0.65);
  line-height: 1.6;
  max-width: 440px;
}
.cta-qr-area {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
}
.qr-mock {
  width: min(220px, 100%);
  aspect-ratio: 1;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.qr-corner-tag {
  @apply font-display italic text-[14px];
  color: theme('colors.clay.soft');
  margin-top: 12px;
  text-align: center;
}

/* ── Footer ── */
.landing-footer {
  border-top: 1px solid rgba(26, 20, 16, 0.10);
  padding: 80px 0 40px;
}
@media (max-width: 720px) { .landing-footer { padding: 48px 0 32px; } }
.footer-top {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 64px;
}
@media (max-width: 720px) {
  .footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
}
.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.footer-tagline {
  font-family: theme('fontFamily.display');
  font-size: 18px;
  color: theme('colors.ink.mute');
  line-height: 1.4;
}
.footer-col h5 {
  @apply font-mono text-[10px] uppercase font-medium text-ink-faint mb-5;
  letter-spacing: 0.2em;
}
.footer-col a {
  display: block;
  font-size: 14px;
  color: theme('colors.ink.soft');
  padding: 5px 0;
  transition: color 200ms;
}
.footer-col a:hover { color: theme('colors.ink.DEFAULT'); }

.giant-wordmark {
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-weight: 500;
  font-size: clamp(80px, 15vw, 220px);
  letter-spacing: -0.04em;
  line-height: 1;
  color: rgba(26, 20, 16, 0.04);
  text-align: center;
  margin: 40px 0;
  user-select: none;
  overflow: hidden;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(26, 20, 16, 0.10);
  @apply font-mono text-[11px] text-ink-faint uppercase;
  letter-spacing: 0.1em;
}
@media (max-width: 600px) {
  .footer-bottom { flex-direction: column; gap: 8px; }
}
</style>
