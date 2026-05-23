<script setup lang="ts">
// Route: /funktioner (features)
definePageMeta({ layout: "public" });
useHead({ title: "Funktioner · popplate" });
useScrollReveal();

const UNSPLASH = "https://images.unsplash.com/";
const FEATURES = [
	{
		num: "01",
		label: "Upload",
		title: "Upload billeder,",
		titleItalic: "f\u00e5 3D-modeller.",
		desc: "Tag tre billeder af jeres ret med en smartphone. Vores AI analyserer tekstur, form og farve \u2014 og bygger en fotorealistisk 3D-model p\u00e5 under fem minutter.",
		img: UNSPLASH + "photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
	},
	{
		num: "02",
		label: "AR-visning",
		title: "G\u00e6sten ser retten",
		titleItalic: "p\u00e5 bordet.",
		desc: "Med \u00e9n scanning af QR-koden kan g\u00e6sten placere retten i fuld st\u00f8rrelse direkte p\u00e5 bordet via Augmented Reality. Ingen app n\u00f8dvendig \u2014 det hele k\u00f8rer i browseren.",
		img: UNSPLASH + "photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
	},
	{
		num: "03",
		label: "QR-koder",
		title: "Print, del,",
		titleItalic: "og scan.",
		desc: "Gener\u00e9r unikke QR-koder til hver ret eller hele menukortet. Print dem p\u00e5 bordkort, menukort eller vinduer \u2014 g\u00e6sten scanner og oplever jeres mad i 3D.",
		img: UNSPLASH + "photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
	},
	{
		num: "04",
		label: "Menustyring",
		title: "Administr\u00e9r hele",
		titleItalic: "menukortet.",
		desc: "Tilf\u00f8j, redig\u00e9r og organis\u00e9r retter i et enkelt dashboard. Kategoris\u00e9r efter type, s\u00e6t priser, tilf\u00f8j allergener \u2014 og public\u00e9r \u00e6ndringer med \u00e9t klik.",
		img: UNSPLASH + "photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80",
	},
	{
		num: "05",
		label: "Analytics",
		title: "Spor visninger",
		titleItalic: "og engagement.",
		desc: "Se hvilke retter g\u00e6sterne kigger mest p\u00e5, hvor lang tid de bruger i AR, og hvilke QR-koder der performer bedst. Data der hj\u00e6lper jer med at optimere menukortet.",
		img: UNSPLASH + "photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
	},
	{
		num: "06",
		label: "Kort",
		title: "Find restauranter",
		titleItalic: "på kortet.",
		desc: "Gæster kan udforske popplate-restauranter i nærheden på et interaktivt kort. Se menukort, afstand og 3D-forhåndsvisninger — og find deres næste madoplevelse.",
		img: UNSPLASH + "photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80",
	},
];
</script>

<template>
	<main data-screen-label="Funktioner">
		<!-- Hero -->
		<section class="hero-section">
			<div class="wrap">
				<div class="text-center max-w-[720px] mx-auto" data-reveal>
					<div class="eyebrow mb-5 justify-center inline-flex">
						<span class="w-4 h-px bg-clay-deep" />
						Funktioner
					</div>
					<h1 class="section-title mx-auto" style="max-width: 700px">
						Alt hvad I beh&oslash;ver for <span class="italic text-clay-deep">den perfekte</span> menu.
					</h1>
					<p class="text-ink-mute mt-6 text-[17px] leading-[1.55] max-w-[540px] mx-auto">
						Fra smartphone-fotos til 3D-modeller i AR &mdash; popplate giver jeres gæster en helt ny måde at opleve menukortet på.
					</p>
				</div>
			</div>
		</section>

		<!-- Features -->
		<section class="features-section">
			<div class="wrap">
				<div
					v-for="(f, i) in FEATURES"
					:key="f.num"
					class="feature-block"
					:class="i % 2 === 1 && 'feature-block--reversed'"
					data-reveal
				>
					<!-- Image -->
					<div class="feature-img-wrap">
						<img :src="f.img" :alt="f.label" class="feature-img" loading="lazy" />
					</div>

					<!-- Text -->
					<div class="feature-text">
						<div class="eyebrow mb-6">
							<span class="w-4 h-px bg-clay-deep" />
							<strong>{{ f.num }}</strong> {{ f.label }}
						</div>
						<h2 class="feature-title">
							{{ f.title }}<br />
							<span class="italic text-clay-deep">{{ f.titleItalic }}</span>
						</h2>
						<p class="feature-desc">{{ f.desc }}</p>
					</div>
				</div>
			</div>
		</section>

		<!-- CTA -->
		<section class="cta-section" data-reveal>
			<div class="wrap text-center">
				<h2 class="section-title mx-auto mb-10">
					Klar til at komme <span class="italic text-clay-deep">i gang?</span>
				</h2>
				<div class="flex items-center justify-center gap-4 flex-wrap">
					<NuxtLink to="/platform/signup" class="btn-primary">
						<span>Start gratis pr&oslash;ve</span>
						<span
							class="w-7 h-7 rounded-full grid place-items-center"
							style="background: rgba(255, 255, 255, 0.12)"
						>
							<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
								<path
									d="M1 7h12m0 0L8 2m5 5l-5 5"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</span>
					</NuxtLink>
					<NuxtLink to="/kontakt" class="btn-ghost">Book demo</NuxtLink>
				</div>
			</div>
		</section>
	</main>
</template>

<style scoped>
/* ── Reveal ── */
[data-reveal] {
	opacity: 0;
	transform: translateY(32px);
	transition:
		opacity 800ms cubic-bezier(0.2, 0.9, 0.3, 1),
		transform 800ms cubic-bezier(0.2, 0.9, 0.3, 1);
}
:global(.reveal-ready) [data-reveal].revealed {
	opacity: 1;
	transform: none;
}

/* ── Eyebrow ── */
.eyebrow {
	@apply font-mono text-[11px] uppercase font-medium text-clay-deep inline-flex items-center gap-3;
	letter-spacing: 0.22em;
}
.eyebrow::before {
	display: none;
}

/* ── Section layout ── */
.wrap {
	max-width: 1320px;
	margin: 0 auto;
	padding: 0 40px;
}
@media (max-width: 720px) {
	.wrap {
		padding: 0 20px;
	}
}

.section-title {
	font-family: theme("fontFamily.display");
	font-weight: 400;
	font-size: clamp(44px, 5.4vw, 88px);
	letter-spacing: -0.025em;
	line-height: 0.96;
}

/* ── Hero ── */
.hero-section {
	padding: 180px 0 120px;
}
@media (max-width: 720px) {
	.hero-section {
		padding: 100px 0 60px;
	}
}

/* ── Features ── */
.features-section {
	padding: 0 0 60px;
}

.feature-block {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 80px;
	align-items: center;
}

.feature-block + .feature-block {
	margin-top: 160px;
}

@media (max-width: 900px) {
	.feature-block {
		grid-template-columns: 1fr;
		gap: 40px;
	}
	.feature-block + .feature-block {
		margin-top: 80px;
	}
}

.feature-block--reversed {
	direction: rtl;
}
.feature-block--reversed > * {
	direction: ltr;
}

.feature-img-wrap {
	aspect-ratio: 4 / 5;
	overflow: hidden;
	border-radius: 4px;
}

.feature-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 1200ms cubic-bezier(0.2, 0.9, 0.3, 1);
}

.feature-img-wrap:hover .feature-img {
	transform: scale(1.04);
}

.feature-title {
	font-family: theme("fontFamily.display");
	font-weight: 400;
	font-size: clamp(36px, 4vw, 56px);
	letter-spacing: -0.02em;
	line-height: 1;
	margin-bottom: 24px;
}

.feature-desc {
	font-size: 17px;
	color: theme("colors.ink.mute");
	line-height: 1.6;
	max-width: 460px;
}

/* ── CTA ── */
.cta-section {
	padding: 120px 0 180px;
}
@media (max-width: 720px) {
	.cta-section {
		padding: 60px 0 100px;
	}
}

/* ── Buttons ── */
.btn-primary {
	@apply font-body font-medium text-[15px] rounded-full bg-ink text-ink-inv inline-flex items-center gap-3.5 whitespace-nowrap;
	padding: 18px 28px;
	transition:
		transform 250ms cubic-bezier(0.2, 0.9, 0.3, 1),
		background 250ms,
		box-shadow 250ms;
}
.btn-primary:hover {
	transform: translateY(-2px);
	background: theme("colors.clay.deep");
	box-shadow: 0 18px 40px rgba(139, 78, 44, 0.3);
}
.btn-ghost {
	@apply font-body font-medium text-[15px] rounded-full border border-line-strong text-ink inline-flex items-center gap-3 whitespace-nowrap;
	padding: 18px 28px;
	transition:
		border-color 250ms,
		background 250ms;
}
.btn-ghost:hover {
	border-color: theme("colors.ink.DEFAULT");
	background: rgba(26, 20, 16, 0.04);
}
</style>
