<script setup lang="ts">
// Route: /kontakt (contact page)
definePageMeta({ layout: "public" });
useHead({ title: "Kontakt \u00b7 popplate" });
useScrollReveal();

const form = reactive({
	navn: "",
	email: "",
	restaurant: "",
	besked: "",
});

function handleSubmit() {
	console.log("Form submitted:", { ...form });
}
</script>

<template>
	<main data-screen-label="Kontakt">
		<!-- Hero -->
		<section class="relative pt-28 pb-20 max-[720px]:pt-20 max-[720px]:pb-14" data-reveal>
			<div class="wrap text-center">
				<div class="eyebrow mb-7 justify-center">Kontakt</div>
				<h1 class="section-title mx-auto">
					Lad os <span class="italic">tale</span>.
				</h1>
				<p
					class="font-body text-ink-mute mt-6 mx-auto"
					style="max-width: 520px; font-size: clamp(16px, 1.6vw, 20px); line-height: 1.6"
				>
					Har I sp&oslash;rgsm&aring;l om PopPlate, vil I booke en demo, eller bare sige hej?
					Vi h&oslash;rer gerne fra jer.
				</p>
			</div>
		</section>

		<!-- Contact form + info -->
		<section class="pb-32 max-[720px]:pb-20">
			<div class="wrap">
				<div class="contact-grid" data-reveal>
					<!-- Form -->
					<form class="contact-form" @submit.prevent="handleSubmit">
						<div class="form-group">
							<label for="navn" class="form-label">Navn</label>
							<input
								id="navn"
								v-model="form.navn"
								type="text"
								class="form-input"
								required
								autocomplete="name"
							/>
						</div>

						<div class="form-group">
							<label for="email" class="form-label">Email</label>
							<input
								id="email"
								v-model="form.email"
								type="email"
								class="form-input"
								required
								autocomplete="email"
							/>
						</div>

						<div class="form-group">
							<label for="restaurant" class="form-label">Restaurant <span class="text-ink-faint">(valgfrit)</span></label>
							<input
								id="restaurant"
								v-model="form.restaurant"
								type="text"
								class="form-input"
								autocomplete="organization"
							/>
						</div>

						<div class="form-group">
							<label for="besked" class="form-label">Besked</label>
							<textarea
								id="besked"
								v-model="form.besked"
								class="form-input form-textarea"
								rows="5"
								required
							/>
						</div>

						<button type="submit" class="btn-primary mt-4">
							<span>Send besked</span>
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
						</button>
					</form>

					<!-- Sidebar -->
					<aside class="contact-info" data-reveal>
						<div class="info-block">
							<div class="eyebrow mb-4">Email</div>
							<a href="mailto:info@popplate.dk" class="info-link">info@popplate.dk</a>
						</div>

						<div class="info-block mt-10">
							<div class="eyebrow mb-4">Lokation</div>
							<p class="font-body text-ink-soft" style="font-size: 17px; line-height: 1.6">
								Odense, Danmark
							</p>
						</div>
					</aside>
				</div>
			</div>
		</section>
	</main>
</template>

<style scoped>
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

/* ── Section title ── */
.section-title {
	font-family: theme("fontFamily.display");
	font-weight: 400;
	font-size: clamp(44px, 5.4vw, 88px);
	letter-spacing: -0.025em;
	line-height: 0.96;
}

/* ── Contact grid ── */
.contact-grid {
	display: grid;
	grid-template-columns: 1fr 0.65fr;
	gap: 80px;
	align-items: start;
}
@media (max-width: 820px) {
	.contact-grid {
		grid-template-columns: 1fr;
		gap: 48px;
	}
}

/* ── Form ── */
.contact-form {
	@apply bg-card rounded-2xl;
	padding: 48px;
}
@media (max-width: 720px) {
	.contact-form {
		padding: 28px;
	}
}

.form-group {
	margin-bottom: 28px;
}

.form-label {
	@apply font-mono text-[11px] uppercase font-medium text-ink-mute block mb-2;
	letter-spacing: 0.15em;
}

.form-input {
	@apply w-full font-body text-ink bg-transparent text-[16px];
	border: none;
	border-bottom: 1.5px solid rgba(26, 20, 16, 0.10);
	padding: 10px 0;
	outline: none;
	transition: border-color 250ms;
}
.form-input:focus {
	border-bottom-color: theme("colors.clay.deep");
}
.form-textarea {
	resize: vertical;
	min-height: 120px;
}

/* ── Button ── */
.btn-primary {
	@apply font-body font-medium text-[15px] rounded-full bg-ink text-ink-inv inline-flex items-center gap-3.5 whitespace-nowrap;
	padding: 18px 28px;
	transition:
		transform 250ms,
		background 250ms,
		box-shadow 250ms;
}
.btn-primary:hover {
	transform: translateY(-2px);
	background: theme("colors.clay.deep");
	box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
}

/* ── Contact info ── */
.contact-info {
	padding-top: 16px;
	display: flex;
	flex-direction: column;
}

.info-block {
	display: flex;
	flex-direction: column;
}

.info-link {
	@apply font-body text-ink-soft;
	font-size: 17px;
	line-height: 1.6;
	text-decoration: underline;
	text-decoration-color: rgba(26, 20, 16, 0.22);
	text-underline-offset: 4px;
	transition: color 200ms;
}
.info-link:hover {
	@apply text-clay-deep;
}

/* ── Scroll reveal ── */
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
</style>
