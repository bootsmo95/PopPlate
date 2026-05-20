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
    <section ref="statsRef" class="section">
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
            <h3 class="dish-feature-title">Brændt porre, brunet smør & <span class="italic text-clay-deep">rugkrydder</span></h3>
            <p class="dish-feature-desc">Et af de signature-billeder vores AI brugte til at bygge en interaktiv 3D-model. Gæsten kan dreje retten, zoome ind på sprødheden, og se den i fuld størrelse på bordet via AR.</p>
            <div class="meta">
              <div class="meta-row"><span>Hovedret</span><strong>245 kr</strong></div>
              <div class="meta-row"><span>Allergener</span><strong>Mælk · gluten</strong></div>
              <div class="meta-row"><span>AR-visning</span><strong>5 min</strong></div>
            </div>
            <div class="scan-prompt">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect x="3" y="3" width="10" height="10" stroke="currentColor" stroke-width="1.5"/>
                <rect x="19" y="3" width="10" height="10" stroke="currentColor" stroke-width="1.5"/>
                <rect x="3" y="19" width="10" height="10" stroke="currentColor" stroke-width="1.5"/>
                <rect x="22" y="22" width="3" height="3" fill="currentColor"/>
              </svg>
              <span>Scan koden — og prøv selv.</span>
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
            <h4 class="dish-card-name">
              {{ d.name.split(d.italic)[0] }}<span class="italic text-clay-deep">{{ d.italic }}</span>{{ d.name.split(d.italic)[1] || '' }}
            </h4>
            <p class="dish-card-cat">{{ d.cat }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ MOODBOARD ═══ -->
    <section class="moodboard-section">
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
            <div class="cta-actions">
              <NuxtLink to="/platform/signup" class="btn-primary cta-btn-primary">
                <span>Start gratis prøve</span>
                <span class="w-7 h-7 rounded-full grid place-items-center" style="background: rgba(255,255,255,0.12);">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </span>
              </NuxtLink>
              <a href="#kontakt" class="btn-ghost cta-btn-ghost">Book demo</a>
            </div>
          </div>
          <div class="cta-qr-area">
            <div class="qr-mock">
              <PlatformQrCode />
              <div class="qr-corner-tag">scan mig</div>
            </div>
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
  font-size: clamp(120px, 22vw, 360px);
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
  width: clamp(320px, 36vw, 500px);
  aspect-ratio: 1 / 1.15;
  box-shadow: 0 60px 120px rgba(26, 20, 16, 0.32), 0 20px 40px rgba(26, 20, 16, 0.18);
  background: radial-gradient(circle at 50% 35%, #d4a880 0%, #b87a4e 30%, #8b4e2c 75%, #1a1410 100%);
}
@media (max-width: 720px) {
  .hero-centerpiece { width: clamp(200px, 78vw, 380px); }
}

/* ── Buttons ── */
.btn-primary {
  @apply font-body font-medium text-[15px] rounded-full bg-ink text-ink-inv inline-flex items-center gap-3.5 whitespace-nowrap;
  padding: 18px 28px;
  transition: transform 250ms cubic-bezier(0.2, 0.9, 0.3, 1), background 250ms, box-shadow 250ms;
}
.btn-primary:hover {
  transform: translateY(-2px);
  background: theme('colors.clay.deep');
  box-shadow: 0 18px 40px rgba(139, 78, 44, 0.3);
}
.btn-ghost {
  @apply font-body font-medium text-[15px] rounded-full border border-line-strong text-ink inline-flex items-center gap-3 whitespace-nowrap;
  padding: 18px 28px;
  transition: border-color 250ms, background 250ms;
}
.btn-ghost:hover { border-color: theme('colors.ink.DEFAULT'); background: rgba(26,20,16,0.04); }

/* ── Eyebrow ── */
.eyebrow {
  @apply font-mono text-[11px] uppercase font-medium text-clay-deep inline-flex items-center gap-3;
  letter-spacing: 0.22em;
}
.eyebrow::before {
  content: "";
  width: 16px;
  height: 1px;
  background: theme('colors.clay.deep');
}

/* ── Section layout ── */
.section { padding: 180px 0; position: relative; }
@media (max-width: 720px) { .section { padding: 80px 0; } }
.section-alt { background: rgba(26, 20, 16, 0.025); }
.wrap { max-width: 1320px; margin: 0 auto; padding: 0 40px; }
@media (max-width: 720px) { .wrap { padding: 0 20px; } }

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 60px;
  margin-bottom: 80px;
  flex-wrap: wrap;
}
@media (max-width: 800px) {
  .section-head { flex-direction: column; align-items: flex-start; gap: 24px; margin-bottom: 48px; }
}
.section-title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(44px, 5.4vw, 88px);
  letter-spacing: -0.025em;
  line-height: 0.96;
  max-width: 900px;
}
.section-aside {
  max-width: 380px;
  font-size: 17px;
  color: theme('colors.ink.mute');
  line-height: 1.55;
}
@media (max-width: 800px) {
  .section-aside { max-width: none; }
}

/* ── Flow cards ── */
.flow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  position: relative;
}
@media (max-width: 900px) {
  .flow { grid-template-columns: 1fr; gap: 56px; }
}
.flow-card {
  border-top: 1px solid rgba(26, 20, 16, 0.22);
  padding: 32px 0 0;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  transition: transform 500ms cubic-bezier(0.2, 0.9, 0.3, 1);
}
.flow-num {
  @apply font-mono text-[11px] uppercase font-medium text-clay-deep flex items-baseline gap-3.5;
  letter-spacing: 0.22em;
}
.flow-num strong {
  color: theme('colors.ink.DEFAULT');
  font-family: theme('fontFamily.body');
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  font-variant-numeric: lining-nums;
  letter-spacing: 0;
}
.flow-visual {
  flex: 1;
  margin: 32px -8px;
  position: relative;
  display: grid;
  place-items: center;
  min-height: 220px;
}
.flow-h {
  font-family: theme('fontFamily.display');
  font-size: 30px;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
  line-height: 1.1;
  color: theme('colors.ink.DEFAULT');
}
.flow-h .italic { color: theme('colors.clay.deep'); }
.flow-p {
  font-size: 15px;
  color: theme('colors.ink.mute');
  line-height: 1.55;
}

/* Polaroid stack */
.stack { position: relative; width: 220px; height: 220px; }
.stack-img {
  position: absolute;
  inset: 0;
  background: theme('colors.paper');
  padding: 8px 8px 24px;
  box-shadow: 0 20px 40px rgba(26, 20, 16, 0.18);
  transition: transform 600ms cubic-bezier(0.2, 0.9, 0.3, 1);
}
.stack-img .photo {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  aspect-ratio: 1;
}
.stack-img:nth-child(1) { transform: rotate(-8deg) translate(-14px, -8px); z-index: 1; }
.stack-img:nth-child(2) { transform: rotate(-2deg) translate(-4px, 2px); z-index: 2; }
.stack-img:nth-child(3) { transform: rotate(5deg) translate(10px, -2px); z-index: 3; }
.flow-card:hover .stack-img:nth-child(1) { transform: rotate(-14deg) translate(-26px, -12px); }
.flow-card:hover .stack-img:nth-child(2) { transform: rotate(-4deg) translate(-10px, 4px); }
.flow-card:hover .stack-img:nth-child(3) { transform: rotate(10deg) translate(20px, -6px); }

/* Mesh wireframe */
.mesh-wrap {
  position: relative;
  width: 240px;
  height: 240px;
}
.mesh-wrap svg { width: 100%; height: 100%; overflow: visible; }
.pulse-ring {
  position: absolute;
  inset: 50% 50% auto auto;
  width: 100px;
  height: 100px;
  border: 1px solid theme('colors.clay.DEFAULT');
  border-radius: 50%;
  transform: translate(50%, -50%);
  opacity: 0;
  animation: pulse-expand 3.5s ease-out infinite;
}
.pulse-ring.delay { animation-delay: 1.2s; }
.pulse-ring.delay2 { animation-delay: 2.4s; }
@keyframes pulse-expand {
  0% { opacity: 0.6; width: 60px; height: 60px; }
  100% { opacity: 0; width: 240px; height: 240px; }
}

/* AR phone */
.ar-phone {
  width: 170px;
  height: 300px;
  border: 1px solid theme('colors.ink.soft');
  border-radius: 28px;
  background: theme('colors.deep');
  position: relative;
  overflow: hidden;
  transition: transform 600ms cubic-bezier(0.2, 0.9, 0.3, 1);
  box-shadow: 0 30px 60px rgba(26, 20, 16, 0.25);
}
.flow-card:hover .ar-phone { transform: perspective(900px) rotateY(-14deg) rotateX(4deg) translateY(-4px); }
.ar-phone::before {
  content: "";
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}
.ar-screen {
  position: absolute;
  inset: 24px 8px 8px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 50% 45%, rgba(200, 153, 104, 0.5), transparent 65%),
    linear-gradient(180deg, #1a1410, #0c0907);
  display: grid;
  place-items: center;
}
.ar-dish-3d {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 50%),
    radial-gradient(circle at 60% 60%, theme('colors.clay.deep'), theme('colors.clay.DEFAULT') 60%, theme('colors.clay.soft'));
  box-shadow:
    0 20px 40px rgba(184, 122, 78, 0.5),
    inset 0 -12px 20px rgba(0,0,0,0.3);
  animation: float 4s ease-in-out infinite;
  transform: rotateX(58deg);
}
@keyframes float {
  0%, 100% { transform: translateY(0) rotateX(58deg); }
  50% { transform: translateY(-10px) rotateX(58deg); }
}
.ar-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1.5px solid theme('colors.clay.soft');
}
.ar-corner.tl { top: 30px; left: 16px; border-right: none; border-bottom: none; }
.ar-corner.tr { top: 30px; right: 16px; border-left: none; border-bottom: none; }
.ar-corner.bl { bottom: 16px; left: 16px; border-right: none; border-top: none; }
.ar-corner.br { bottom: 16px; right: 16px; border-left: none; border-top: none; }

/* ── Stats ── */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(26, 20, 16, 0.22);
  border-bottom: 1px solid rgba(26, 20, 16, 0.22);
}
@media (max-width: 800px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .stats .stat:nth-child(2) { border-right: none; }
  .stats .stat:nth-child(1),
  .stats .stat:nth-child(2) { border-bottom: 1px solid rgba(26, 20, 16, 0.10); }
}
@media (max-width: 480px) { .stats { grid-template-columns: 1fr; } }
.stat {
  padding: 56px 36px;
  border-right: 1px solid rgba(26, 20, 16, 0.10);
}
.stat:last-child { border-right: none; }
.stat-num {
  font-family: theme('fontFamily.body');
  font-weight: 300;
  font-size: clamp(56px, 6vw, 96px);
  letter-spacing: -0.05em;
  line-height: 0.9;
  color: theme('colors.ink.DEFAULT');
  font-variant-numeric: lining-nums tabular-nums;
}
.stat-num .ital { color: theme('colors.clay.deep'); }
.stat-num .sub-unit {
  font-size: 0.5em;
  color: theme('colors.clay.deep');
  font-weight: 400;
  letter-spacing: 0;
}
.stat-label {
  @apply font-mono text-[11px] uppercase text-ink-mute font-medium;
  letter-spacing: 0.18em;
  line-height: 1.5;
  margin-top: 18px;
}

/* ── Dishes section ── */
.dishes-section { padding: 180px 0; position: relative; }
@media (max-width: 720px) { .dishes-section { padding: 80px 0; } }

.dish-feature {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 80px;
  align-items: end;
  margin-bottom: 100px;
}
@media (max-width: 900px) {
  .dish-feature { grid-template-columns: 1fr; gap: 40px; }
}
.dish-img-large {
  height: 600px;
  overflow: hidden;
  background: theme('colors.card');
  position: relative;
}
@media (max-width: 720px) { .dish-img-large { height: 400px; } }
.dish-img-large img { width: 100%; height: 100%; object-fit: cover; }

.dish-feature-title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(36px, 4vw, 56px);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 24px;
}
.dish-feature-desc {
  color: theme('colors.ink.mute');
  margin-bottom: 24px;
  line-height: 1.6;
  font-size: 16px;
}
.meta {
  display: flex;
  gap: 24px;
  padding: 24px 0;
  border-top: 1px solid rgba(26, 20, 16, 0.10);
  border-bottom: 1px solid rgba(26, 20, 16, 0.10);
  font-family: theme('fontFamily.mono');
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: theme('colors.ink.mute');
}
.meta .meta-row { flex: 1; }
.meta .meta-row strong {
  display: block;
  color: theme('colors.ink.DEFAULT');
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-size: 18px;
  letter-spacing: -0.01em;
  text-transform: none;
  margin-top: 4px;
  font-weight: 400;
}
.scan-prompt {
  margin-top: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: theme('colors.ink.soft');
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-size: 22px;
}

.dish-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
@media (max-width: 900px) { .dish-row { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .dish-row { grid-template-columns: 1fr; } }
.dish-card {
  background: transparent;
  position: relative;
  cursor: pointer;
}
.dish-img {
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  position: relative;
  background: theme('colors.card');
  margin-bottom: 20px;
}
.dish-img img { width: 100%; height: 100%; object-fit: cover; }
.badge-3d {
  position: absolute;
  top: 14px;
  left: 14px;
  @apply font-mono text-[10px] uppercase font-medium flex items-center gap-2;
  letter-spacing: 0.15em;
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(243, 237, 226, 0.9);
  backdrop-filter: blur(10px);
  color: theme('colors.ink.DEFAULT');
}
.badge-3d::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: theme('colors.clay.DEFAULT');
}
.price-tag {
  position: absolute;
  bottom: 14px;
  right: 14px;
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-size: 18px;
  padding: 6px 14px;
  border-radius: 999px;
  background: theme('colors.paper');
  color: theme('colors.ink.DEFAULT');
}
.dish-card-name {
  font-family: theme('fontFamily.display');
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.dish-card-cat {
  font-family: theme('fontFamily.mono');
  font-size: 10px;
  color: theme('colors.ink.faint');
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 500;
}

/* ── Moodboard ── */
.moodboard-section { padding: 60px 0 180px; position: relative; }
@media (max-width: 720px) { .moodboard-section { padding: 40px 0 80px; } }
.moodboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(6, 80px);
  gap: 18px;
  margin-top: 60px;
}
@media (max-width: 900px) {
  .moodboard-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(8, 90px);
  }
}
.mood-img {
  position: relative;
  overflow: hidden;
  background: theme('colors.card');
}
.mood-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 1200ms cubic-bezier(0.2, 0.9, 0.3, 1);
}
.mood-img:hover img { transform: scale(1.04); }
.mood-img.m1 { grid-column: 1 / 6;  grid-row: 1 / 5; }
.mood-img.m2 { grid-column: 6 / 10; grid-row: 1 / 4; }
.mood-img.m3 { grid-column: 10 / 13; grid-row: 1 / 3; }
.mood-img.m4 { grid-column: 6 / 9;  grid-row: 4 / 7; }
.mood-img.m5 { grid-column: 9 / 13; grid-row: 3 / 7; }
.mood-img.m6 { grid-column: 1 / 6;  grid-row: 5 / 7; }
@media (max-width: 900px) {
  .mood-img.m1 { grid-column: 1 / 5;  grid-row: 1 / 3; }
  .mood-img.m2 { grid-column: 1 / 3;  grid-row: 3 / 5; }
  .mood-img.m3 { grid-column: 3 / 5;  grid-row: 3 / 5; }
  .mood-img.m4 { grid-column: 1 / 3;  grid-row: 5 / 7; }
  .mood-img.m5 { grid-column: 3 / 5;  grid-row: 5 / 7; }
  .mood-img.m6 { grid-column: 1 / 5;  grid-row: 7 / 9; }
}
.mood-caption {
  font-family: theme('fontFamily.mono');
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: theme('colors.ink.faint');
  position: absolute;
  bottom: 14px;
  left: 14px;
  z-index: 2;
  background: rgba(243, 237, 226, 0.85);
  backdrop-filter: blur(8px);
  padding: 6px 10px;
  font-weight: 500;
}

/* ── Pricing ── */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 64px;
  align-items: start;
}
@media (max-width: 900px) {
  .pricing-grid { grid-template-columns: 1fr; max-width: 420px; }
}
.tier {
  background: theme('colors.paper');
  border: 1px solid rgba(26, 20, 16, 0.10);
  border-radius: 4px;
  padding: 40px;
  position: relative;
  transition: border-color 300ms;
}
.tier:hover { border-color: rgba(26, 20, 16, 0.22); }
.tier.featured {
  background: theme('colors.deep');
  color: theme('colors.ink.inv');
  border-color: theme('colors.deep');
  box-shadow: 0 24px 60px rgba(26, 20, 16, 0.2);
}
.featured .tier-name, .featured .tier-price { color: theme('colors.ink.inv'); }
.featured .tier-desc { color: rgba(243, 237, 226, 0.65); }
.featured .tier-list li { color: rgba(243, 237, 226, 0.85); border-color: rgba(243, 237, 226, 0.12); }
.tier-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.tier-name {
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-size: 28px;
  font-weight: 400;
  letter-spacing: -0.01em;
}
.tier-tag {
  @apply font-mono text-[10px] uppercase font-medium px-3 py-1.5 rounded-full;
  letter-spacing: 0.15em;
  background: theme('colors.clay.DEFAULT');
  color: white;
}
.tier-price {
  font-family: theme('fontFamily.body');
  font-weight: 300;
  font-size: 76px;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: 6px;
  font-variant-numeric: lining-nums tabular-nums;
}
.tier-price .sub {
  font-family: theme('fontFamily.body');
  font-size: 14px;
  color: theme('colors.ink.faint');
  letter-spacing: 0;
  font-weight: 400;
  margin-left: 4px;
}
.featured .tier-price .sub { color: rgba(243, 237, 226, 0.55); }
.tier-desc {
  color: theme('colors.ink.mute');
  font-size: 14px;
  margin-bottom: 32px;
  line-height: 1.55;
}
.tier-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
}
.tier-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid rgba(26, 20, 16, 0.10);
  font-size: 14px;
  color: theme('colors.ink.soft');
}
.tier-list li:first-child { border-top: none; }
.check {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: theme('colors.clay.DEFAULT');
  display: grid;
  place-items: center;
  margin-top: 4px;
}
.check svg { width: 8px; height: 8px; }
.featured .check { background: theme('colors.clay.soft'); }
.tier-cta {
  display: block;
  width: 100%;
  text-align: center;
  padding: 16px;
  border-radius: 999px;
  font-family: theme('fontFamily.body');
  font-weight: 500;
  font-size: 14px;
  border: 1px solid rgba(26, 20, 16, 0.22);
  color: theme('colors.ink.DEFAULT');
  transition: background 250ms, border-color 250ms;
}
.tier-cta:hover { background: rgba(26,20,16,0.06); border-color: theme('colors.ink.DEFAULT'); }
.featured .tier-cta {
  background: theme('colors.clay.DEFAULT');
  color: white;
  border-color: theme('colors.clay.DEFAULT');
}
.featured .tier-cta:hover { background: theme('colors.clay.deep'); border-color: theme('colors.clay.deep'); }

/* ── CTA strip ── */
.cta-strip { padding: 180px 0; position: relative; overflow: hidden; }
@media (max-width: 720px) { .cta-strip { padding: 80px 0; } }
.cta-card {
  background: theme('colors.deep');
  color: theme('colors.ink.inv');
  border-radius: 8px;
  padding: 100px 80px;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 80px;
  align-items: center;
}
@media (max-width: 900px) {
  .cta-card { grid-template-columns: 1fr; padding: 60px 32px; gap: 40px; }
}
.cta-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 60%, rgba(184, 122, 78, 0.5), transparent 50%),
    radial-gradient(circle at 20% 100%, rgba(139, 78, 44, 0.4), transparent 50%);
  pointer-events: none;
}
.cta-content { position: relative; z-index: 1; }
.cta-title {
  font-family: theme('fontFamily.display');
  font-size: clamp(40px, 4.4vw, 68px);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.05;
  color: theme('colors.ink.inv');
  position: relative;
}
.cta-title .italic { color: theme('colors.clay.soft'); display: inline-block; }
.cta-sub {
  color: rgba(243, 237, 226, 0.7);
  margin-top: 32px;
  max-width: 480px;
  line-height: 1.55;
  position: relative;
  font-size: 17px;
}
.cta-actions {
  display: flex;
  gap: 14px;
  margin-top: 40px;
  flex-wrap: wrap;
  position: relative;
}
.cta-btn-primary {
  background: theme('colors.clay.soft') !important;
  color: theme('colors.deep') !important;
}
.cta-btn-primary:hover { background: theme('colors.ink.inv') !important; }
.cta-btn-ghost {
  color: theme('colors.ink.inv') !important;
  border-color: rgba(243, 237, 226, 0.3) !important;
}
.cta-btn-ghost:hover {
  border-color: theme('colors.ink.inv') !important;
  background: rgba(243, 237, 226, 0.06) !important;
}
.cta-qr-area {
  position: relative;
  z-index: 1;
}
.qr-mock {
  position: relative;
  width: 260px;
  height: 260px;
  margin-left: auto;
  background: theme('colors.ink.inv');
  border-radius: 8px;
  padding: 24px;
  display: grid;
  place-items: center;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}
.qr-corner-tag {
  position: absolute;
  bottom: -14px;
  right: 16px;
  padding: 10px 18px;
  background: theme('colors.clay.DEFAULT');
  color: white;
  border-radius: 999px;
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-size: 16px;
}

/* ── Footer ── */
.landing-footer {
  border-top: 1px solid rgba(26, 20, 16, 0.10);
  padding: 80px 0 60px;
  background: theme('colors.paper');
}
@media (max-width: 720px) { .landing-footer { padding: 48px 0 32px; } }
.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 60px;
  margin-bottom: 60px;
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
  font-size: 24px;
  line-height: 1.25;
  color: theme('colors.ink.soft');
  max-width: 300px;
  letter-spacing: -0.01em;
}
.footer-col h5 {
  @apply font-mono text-[11px] uppercase font-medium text-ink-faint mb-5;
  letter-spacing: 0.18em;
}
.footer-col a {
  display: block;
  font-size: 15px;
  color: theme('colors.ink.soft');
  padding: 7px 0;
  transition: color 200ms;
}
.footer-col a:hover { color: theme('colors.ink.DEFAULT'); }

.giant-wordmark {
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-weight: 400;
  font-size: clamp(120px, 24vw, 360px);
  letter-spacing: -0.04em;
  line-height: 0.85;
  color: transparent;
  -webkit-text-stroke: 1px theme('colors.ink.light');
  text-align: center;
  margin: 60px 0 40px;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 32px;
  border-top: 1px solid rgba(26, 20, 16, 0.10);
  @apply font-mono text-[11px] text-ink-faint uppercase font-medium;
  letter-spacing: 0.15em;
}
@media (max-width: 600px) {
  .footer-bottom { flex-direction: column; gap: 8px; }
}

/* ── Mono label (hero) ── */
.mono-label {
  @apply font-mono text-[11px] uppercase font-medium text-ink-mute;
  letter-spacing: 0.22em;
}
</style>
