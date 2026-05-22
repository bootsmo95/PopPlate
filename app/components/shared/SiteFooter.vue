<template>
	<footer class="landing-footer">
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
					<NuxtLink to="/funktioner">Funktioner</NuxtLink>
					<NuxtLink to="/pricing">Priser</NuxtLink>
					<NuxtLink to="/r/folker">Demo</NuxtLink>
					<NuxtLink to="/roadmap">Roadmap</NuxtLink>
				</div>
				<div class="footer-col">
					<h5>Selskab</h5>
					<NuxtLink to="/kontakt">Kontakt</NuxtLink>
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
</template>

<style scoped>
.landing-footer {
	border-top: 1px solid rgba(26, 20, 16, 0.1);
	padding: 80px 0 60px;
	background: theme("colors.paper");
}
@media (max-width: 720px) {
	.landing-footer {
		padding: 48px 0 32px;
	}
}

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

.footer-top {
	display: grid;
	grid-template-columns: 2fr 1fr 1fr 1fr;
	gap: 60px;
	margin-bottom: 60px;
}
@media (max-width: 720px) {
	.footer-top {
		grid-template-columns: 1fr 1fr;
		gap: 32px;
	}
}

.footer-logo {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 16px;
}

.footer-tagline {
	font-family: theme("fontFamily.display");
	font-size: 24px;
	line-height: 1.25;
	color: theme("colors.ink.soft");
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
	color: theme("colors.ink.soft");
	padding: 7px 0;
	transition: color 200ms;
}
.footer-col a:hover {
	color: theme("colors.ink.DEFAULT");
}

.giant-wordmark {
	font-family: theme("fontFamily.display");
	font-style: italic;
	font-weight: 400;
	font-size: clamp(120px, 24vw, 360px);
	letter-spacing: -0.04em;
	line-height: 0.85;
	color: transparent;
	-webkit-text-stroke: 2px theme("colors.ink.light");
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
	border-top: 1px solid rgba(26, 20, 16, 0.1);
	@apply font-mono text-[11px] text-ink-faint uppercase font-medium;
	letter-spacing: 0.15em;
}
@media (max-width: 600px) {
	.footer-bottom {
		flex-direction: column;
		gap: 8px;
	}
}
</style>
