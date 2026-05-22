<script setup lang="ts">
// Route: /roadmap
definePageMeta({ layout: "public" });
useHead({ title: "Roadmap · popplate" });
useScrollReveal();

type Status = "done" | "in-progress" | "planned";

const TIMELINE: { quarter: string; status: Status; items: { title: string; desc: string }[] }[] = [
	{
		quarter: "Q1 2026",
		status: "done",
		items: [
			{
				title: "3D-generering fra billeder",
				desc: "Upload tre billeder af en ret og få en fotorealistisk 3D-model genereret af AI på under fem minutter.",
			},
			{
				title: "AR-visning i browser",
				desc: "Gæster scanner en QR-kode og ser retten i fuld størrelse på bordet — ingen app nødvendig.",
			},
			{
				title: "QR-kode generator",
				desc: "Generér unikke QR-koder til hver ret eller hele menukortet. Print og del frit.",
			},
			{
				title: "Restaurant dashboard",
				desc: "Administrér retter, kategorier, priser og allergener i et enkelt overblik.",
			},
		],
	},
	{
		quarter: "Q2 2026",
		status: "in-progress",
		items: [
			{
				title: "Optimerede 3D-modeller",
				desc: "Lettere filstørrelser og hurtigere indlæsning uden at gå på kompromis med kvaliteten. Bedre teksturer og mere præcise farver.",
			},
			{
				title: "Forbedret AR-oplevelse",
				desc: "Bedre overfladeregistrering, realistisk belysning der matcher omgivelserne, og mulighed for at dele AR-visningen med andre.",
			},
			{
				title: "Analytics dashboard",
				desc: "Se hvilke retter gæsterne kigger mest på, AR-visningstid, og QR-kode performance.",
			},
		],
	},
	{
		quarter: "Q3 2026",
		status: "planned",
		items: [
			{
				title: "Brugerdefineret menudesign",
				desc: "Pro-brugere kan tilpasse menuens udseende med egne farver, typografi og branding — så menukortet matcher restaurantens identitet.",
			},
			{
				title: "Flersproget menukort",
				desc: "Automatisk oversættelse af menukort til flere sprog. Gæsten vælger sprog via QR-koden.",
			},
			{
				title: "Bordbestilling via menu",
				desc: "Gæsten kan bestille direkte fra det digitale menukort og sende ordren til køkkenet.",
			},
		],
	},
	{
		quarter: "Q4 2026",
		status: "planned",
		items: [
			{
				title: "AI-anbefalinger",
				desc: "Personlige retanbefalinger baseret på gæstens præferencer, allergener og tidligere valg.",
			},
			{
				title: "Sæsonmenu automation",
				desc: "Automatisk opdatering af menukortet baseret på sæson, tilgængelighed og trends.",
			},
			{
				title: "Integrations-API",
				desc: "Åbent API til integration med kassesystemer, bookingplatforme og leverandører.",
			},
		],
	},
];

const statusLabel: Record<Status, string> = {
	done: "Lanceret",
	"in-progress": "I gang",
	planned: "Planlagt",
};
</script>

<template>
	<main data-screen-label="Roadmap">
		<!-- Hero -->
		<section class="hero-section">
			<div class="wrap">
				<div class="text-center max-w-[720px] mx-auto" data-reveal>
					<div class="eyebrow mb-5 justify-center">Roadmap</div>
					<h1 class="section-title mx-auto" style="max-width: 700px">
						Hvad vi bygger <span class="italic text-clay-deep">næste gang.</span>
					</h1>
					<p class="text-ink-mute mt-6 text-[17px] leading-[1.55] max-w-[540px] mx-auto">
						Vi bygger popplate i tæt dialog med vores restauranter. Her er hvad vi arbejder på — og hvad der
						kommer.
					</p>
				</div>
			</div>
		</section>

		<!-- Timeline -->
		<section class="timeline-section">
			<div class="wrap">
				<div class="timeline">
					<div v-for="(period, pi) in TIMELINE" :key="period.quarter" class="timeline-period" data-reveal>
						<!-- Period header -->
						<div class="period-header">
							<div class="period-dot" :class="`dot--${period.status}`" />
							<div>
								<h2 class="period-quarter">{{ period.quarter }}</h2>
								<span class="period-status" :class="`status--${period.status}`">
									{{ statusLabel[period.status] }}
								</span>
							</div>
						</div>

						<!-- Items -->
						<div class="period-items">
							<div v-for="item in period.items" :key="item.title" class="timeline-item">
								<h3 class="item-title">{{ item.title }}</h3>
								<p class="item-desc">{{ item.desc }}</p>
							</div>
						</div>

						<!-- Connector line -->
						<div v-if="pi < TIMELINE.length - 1" class="timeline-connector" />
					</div>
				</div>
			</div>
		</section>

		<!-- CTA -->
		<section class="cta-section" data-reveal>
			<div class="wrap text-center">
				<h2 class="cta-title">
					Har I et <span class="italic text-clay-deep">ønske?</span>
				</h2>
				<p class="text-ink-mute mt-4 text-[17px] leading-[1.55] max-w-[480px] mx-auto mb-10">
					Vi prioriterer features baseret på hvad vores restauranter har brug for. Fortæl os hvad I mangler.
				</p>
				<NuxtLink to="/kontakt" class="btn-primary">
					<span>Send forslag</span>
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

/* ── Layout ── */
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

/* ── Eyebrow ── */
.eyebrow {
	@apply font-mono text-[11px] uppercase font-medium text-clay-deep inline-flex items-center gap-3;
	letter-spacing: 0.22em;
}
.eyebrow::before {
	content: "";
	width: 16px;
	height: 1px;
	background: theme("colors.clay.deep");
}

/* ── Hero ── */
.section-title {
	font-family: theme("fontFamily.display");
	font-weight: 400;
	font-size: clamp(44px, 5.4vw, 88px);
	letter-spacing: -0.025em;
	line-height: 0.96;
}

.hero-section {
	padding: 180px 0 100px;
}
@media (max-width: 720px) {
	.hero-section {
		padding: 100px 0 60px;
	}
}

/* ── Timeline ── */
.timeline-section {
	padding: 0 0 60px;
}

.timeline {
	max-width: 720px;
	margin: 0 auto;
	position: relative;
}

.timeline-period {
	position: relative;
	padding-left: 48px;
}
@media (max-width: 720px) {
	.timeline-period {
		padding-left: 36px;
	}
}

/* ── Period header ── */
.period-header {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 32px;
}

.period-dot {
	position: absolute;
	left: 0;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	border: 2px solid theme("colors.clay.DEFAULT");
	background: theme("colors.paper");
	z-index: 2;
}
.dot--done {
	background: theme("colors.clay.DEFAULT");
}
.dot--in-progress {
	background: theme("colors.paper");
	box-shadow: 0 0 0 4px rgba(184, 122, 78, 0.2);
}
.dot--planned {
	border-color: rgba(26, 20, 16, 0.2);
}

.period-quarter {
	font-family: theme("fontFamily.display");
	font-size: 28px;
	font-weight: 400;
	letter-spacing: -0.01em;
	line-height: 1;
}

.period-status {
	@apply font-mono text-[10px] uppercase font-medium;
	letter-spacing: 0.15em;
}
.status--done {
	color: theme("colors.status.ready");
}
.status--in-progress {
	color: theme("colors.clay.DEFAULT");
}
.status--planned {
	color: theme("colors.ink.faint");
}

/* ── Items ── */
.period-items {
	display: flex;
	flex-direction: column;
	gap: 20px;
	margin-bottom: 16px;
}

.timeline-item {
	background: theme("colors.card");
	border-radius: 8px;
	padding: 28px 32px;
	transition: transform 300ms cubic-bezier(0.2, 0.9, 0.3, 1);
}
@media (max-width: 720px) {
	.timeline-item {
		padding: 20px 24px;
	}
}
.timeline-item:hover {
	transform: translateY(-2px);
}

.item-title {
	font-family: theme("fontFamily.display");
	font-size: 20px;
	font-weight: 500;
	letter-spacing: -0.01em;
	margin-bottom: 8px;
	color: theme("colors.ink.DEFAULT");
}

.item-desc {
	font-size: 15px;
	color: theme("colors.ink.mute");
	line-height: 1.6;
}

/* ── Connector ── */
.timeline-connector {
	position: absolute;
	left: 6px;
	top: 14px;
	bottom: -14px;
	width: 1.5px;
	background: rgba(26, 20, 16, 0.1);
	z-index: 1;
}

/* ── CTA ── */
.cta-section {
	padding: 80px 0 180px;
}
@media (max-width: 720px) {
	.cta-section {
		padding: 40px 0 100px;
	}
}

.cta-title {
	font-family: theme("fontFamily.display");
	font-weight: 400;
	font-size: clamp(36px, 4vw, 56px);
	letter-spacing: -0.02em;
	line-height: 1;
}

/* ── Button ── */
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
</style>
