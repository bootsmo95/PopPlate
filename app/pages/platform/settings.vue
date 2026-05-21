<script setup lang="ts">
import TopBar from "~/components/platform/TopBar.vue";
import PageHead from "~/components/platform/PageHead.vue";
import Icon from "~/components/shared/Icon.vue";

definePageMeta({ layout: "platform" });
useHead({ title: "Indstillinger · popplate" });

const route = useRoute();
const ssrHeaders = useAuthHeaders();
const { user, logout } = useAuth();

// Counts for tier tab
const { data: restaurants } = useLazyFetch<Array<{ id: string }>>("/api/restaurants", { headers: ssrHeaders });
const { data: apiDishes } = useLazyFetch<Array<{ id: string }>>("/api/dishes", { headers: ssrHeaders });
const apiDishCount = computed(() => apiDishes.value?.length ?? 0);

// Generation usage
interface UsageData {
	used: number
	limit: number | null
	tierName: string
	cycleStart: string
	unlimited: boolean
}
const { data: usageData } = useLazyFetch<UsageData>("/api/user/usage", { headers: ssrHeaders });

type Tab = "tier" | "team" | "account" | "api";
const validTabs: Tab[] = ["tier", "team", "account", "api"];
const initialTab = validTabs.includes(route.query.tab as Tab) ? (route.query.tab as Tab) : "account";
const tab = ref<Tab>(initialTab);

// Account tab state
const profileDisplayName = ref("");
const profileSaving = ref(false);
const profileSaved = ref(false);

async function loadProfile() {
	try {
		const profile = await $fetch<{ displayName: string }>("/api/user/profile");
		profileDisplayName.value = profile.displayName ?? "";
	} catch {}
}

async function saveProfile() {
	profileSaving.value = true;
	profileSaved.value = false;
	try {
		await $fetch("/api/user/profile", {
			method: "PATCH",
			body: { displayName: profileDisplayName.value },
		});
		profileSaved.value = true;
		setTimeout(() => (profileSaved.value = false), 3000);
	} catch {}
	profileSaving.value = false;
}

watch(
	tab,
	(t) => {
		if (t === "account") loadProfile();
	},
	{ immediate: true },
);

const TABS = computed<Array<{ key: Tab; label: string; count?: number }>>(() => [
	{ key: "tier", label: "Tier & fakturering" },
	{ key: "team", label: "Team" },
	{ key: "account", label: "Konto" },
	// { key: "api", label: "API & Webhooks" },
]);

const INVOICES = [
	"20. maj 2026 · 499 kr",
	"20. april 2026 · 499 kr",
	"20. marts 2026 · 499 kr",
	"20. februar 2026 · 499 kr",
];

</script>

<template>
	<div data-screen-label="Settings">
		<TopBar :show-search="false" cta-label="Indstillinger" cta-href="#" />

		<PageHead :eyebrow="`Konto · ${user?.displayName ?? user?.email ?? ''}`">
			<template #title>
				<h1 class="page-title">Indstillinger</h1>
			</template>
			<template #sub>
				<p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">Restauranter, tier og kontoindstillinger.</p>
			</template>
		</PageHead>

		<!-- Tabs -->
		<div class="flex gap-2 mb-6 flex-wrap">
			<button
				v-for="t in TABS"
				:key="t.key"
				type="button"
				class="filter-pill"
				:class="tab === t.key && 'filter-pill--active'"
				@click="tab = t.key"
			>
				{{ t.label }}
				<span v-if="t.count != null" class="count">{{ t.count }}</span>
			</button>
		</div>

		<!-- Tier tab -->
		<template v-if="tab === 'tier'">
			<div class="two-col">
				<div>
					<!-- <div
						class="p-card relative overflow-hidden mb-5"
						style="background: #2b1f15; color: #f3ede2; border: none"
					>
						<div
							class="absolute inset-0 pointer-events-none"
							style="
								background: radial-gradient(
									circle at 80% 50%,
									rgba(184, 122, 78, 0.35),
									transparent 55%
								);
							"
						/>
						<div class="relative">
							<div class="mono-label !text-clay-soft mb-3">Nuvaerende tier</div>
							<h3 class="font-display font-normal text-[48px] tracking-[-0.025em]" style="color: #f3ede2">
								<span class="italic text-clay-soft">Basic</span> &mdash; 499 kr/md
							</h3>
							<p class="mt-3" style="color: rgba(243, 237, 226, 0.7)">
								Op til 30 retter &middot; Eget brand &middot; Analytics &middot; Allergen-maerkning
							</p>
							<div
								class="mt-6 pt-5 grid grid-cols-3 gap-6 max-[600px]:grid-cols-1"
								style="border-top: 1px solid rgba(243, 237, 226, 0.12)"
							>
								<div>
									<div class="mono-label !text-[rgba(243,237,226,0.5)] mb-2">Retter brugt</div>
									<div class="font-body text-[32px] font-light" style="color: #f3ede2">
										{{ apiDishCount
										}}<span class="text-sm ml-1" style="color: rgba(243, 237, 226, 0.5)">/30</span>
									</div>
								</div>
								<div>
									<div class="mono-label !text-[rgba(243,237,226,0.5)] mb-2">Restauranter</div>
									<div class="font-body text-[32px] font-light" style="color: #f3ede2">
										{{ restaurants?.length ?? 0
										}}<span class="text-sm ml-1" style="color: rgba(243, 237, 226, 0.5)">/1</span>
									</div>
								</div>
								<div>
									<div class="mono-label !text-[rgba(243,237,226,0.5)] mb-2">Naeste betaling</div>
									<div class="font-body text-[18px] font-medium mt-2" style="color: #f3ede2">--</div>
								</div>
							</div>
							<div class="flex gap-2.5 mt-5">
								<button type="button" class="top-btn top-btn--clay">Opgrader til Pro</button>
								<button
									type="button"
									class="top-btn"
									style="border-color: rgba(243, 237, 226, 0.3); color: #f3ede2"
								>
									Nedgrader
								</button>
							</div>
						</div>
					</div> -->

					<!-- <div class="p-card">
						<div class="flex justify-between items-center mb-4">
							<h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Fakturahistorik</h3>
						</div>
						<div class="flex flex-col">
							<div
								v-for="(it, i) in INVOICES"
								:key="i"
								class="flex gap-3.5 py-3.5 items-center"
								:class="i < INVOICES.length - 1 && 'border-b border-line'"
							>
								<span class="w-2 h-2 rounded-full shrink-0" style="background: #6e7d8b" />
								<div class="flex-1 text-[13px] text-ink-soft">
									<strong class="text-ink font-medium">{{ it.split(" · ")[0] }}</strong>
									&middot; Basic tier &middot; {{ it.split(" · ")[1] }}
								</div>
								<a href="#dl" class="font-mono text-[11px] text-clay-deep">PDF &rarr;</a>
							</div>
						</div>
					</div> -->
				</div>

				<aside class="p-card">
					<!-- <div class="flex justify-between items-center mb-4">
						<h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Betaling</h3>
					</div>
					<div class="py-4 border-b border-line flex justify-between items-center">
						<div>
							<div class="font-mono text-[13px]">VISA &middot; &bull;&bull;&bull;&bull; 4242</div>
							<div class="text-xs text-ink-faint mt-1">Udloeber 09/27</div>
						</div>
						<button type="button" class="top-btn !py-2 !px-3.5 !text-xs">Aendr</button>
					</div>
					<div class="mt-4 text-xs text-ink-faint">
						Faktura sendes automatisk til <strong class="text-ink">{{ user?.email ?? "--" }}</strong> hver
						maaned.
					</div> -->
				</aside>
			</div>
		</template>

		<!-- Account tab -->
		<template v-if="tab === 'account'">
			<div class="two-col">
				<div>
					<div class="p-card">
						<div class="flex items-center gap-5 mb-8">
							<span
								class="grid place-items-center w-16 h-16 rounded-full bg-clay text-white font-display italic text-2xl shrink-0"
							>
								{{ (profileDisplayName || user?.email)?.charAt(0)?.toUpperCase() ?? "?" }}
							</span>
							<div>
								<div class="font-display text-[22px] font-normal tracking-[-0.015em]">
									{{ profileDisplayName || user?.email }}
								</div>
								<div class="mono-label !text-clay-deep mt-1">
									{{ user?.accountTier?.toUpperCase() ?? "FREE" }}
								</div>
							</div>
						</div>

						<form @submit.prevent="saveProfile">
							<div class="mb-6">
								<label class="field-label">Visningsnavn</label>
								<input
									v-model="profileDisplayName"
									type="text"
									placeholder="Dit navn"
									class="field-input"
									:disabled="profileSaving"
								/>
							</div>

							<div class="mb-6">
								<label class="field-label">Email</label>
								<input
									type="email"
									:value="user?.email ?? ''"
									disabled
									class="field-input !bg-card !text-ink-mute"
								/>
								<div class="field-hint">Administreres via din identity provider.</div>
							</div>

							<div class="mb-6">
								<label class="field-label">Plan</label>
								<div class="flex items-center gap-3">
									<span class="status-badge status-badge--published">{{
										user?.accountTier ?? "free"
									}}</span>
									<button
										type="button"
										class="text-clay-deep font-mono text-[11px] uppercase font-medium tracking-[0.15em]"
										@click="tab = 'tier'"
									>
										Aendr plan &rarr;
									</button>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<button type="submit" :disabled="profileSaving" class="top-btn top-btn--primary">
									<span>{{ profileSaving ? "Gemmer..." : "Gem aendringer" }}</span>
									<Icon name="check" :size="13" />
								</button>
								<span v-if="profileSaved" class="text-sm text-[#4a6240] font-medium">Gemt!</span>
							</div>
						</form>
					</div>

					<div v-if="usageData && !usageData.unlimited" class="p-card mt-5">
						<div class="mb-4">
							<h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Forbrug</h3>
						</div>
						<div class="mono-label !text-[rgba(107,96,86,0.6)] mb-2">Generationer brugt denne maaned</div>
						<div class="font-body text-[32px] font-light text-ink">
							{{ usageData.used }}<span class="text-sm ml-1 text-ink-faint">/{{ usageData.limit }}</span>
						</div>
						<div class="text-[13px] text-ink-mute mt-3">
							{{ usageData.tierName }} plan
						</div>
					</div>
				</div>

				<aside>
					<div
						class="p-card relative overflow-hidden"
						style="background: #2b1f15; color: #f3ede2; border: none"
					>
						<div
							class="absolute inset-0 pointer-events-none"
							style="
								background: radial-gradient(
									circle at 80% 50%,
									rgba(184, 122, 78, 0.35),
									transparent 55%
								);
							"
						/>
						<div class="relative">
							<div class="mono-label !text-clay-soft mb-3">Rolle</div>
							<h3 class="font-display font-normal text-[28px] tracking-[-0.015em]" style="color: #f3ede2">
								{{ user?.role ?? "user" }}
							</h3>
							<p class="mt-3 text-[13px]" style="color: rgba(243, 237, 226, 0.6)">
								Din rolle bestemmer hvad du kan goere paa platformen.
							</p>
						</div>
					</div>

					<div class="p-card mt-4">
						<h3 class="font-display font-normal text-[18px] tracking-[-0.015em] mb-4">Konto</h3>
						<button
							type="button"
							class="w-full py-3 rounded-full border border-line-strong text-ink font-body text-sm font-medium transition hover:border-[#8a4838] hover:text-[#8a4838]"
							@click="logout()"
						>
							Log ud
						</button>
					</div>
				</aside>
			</div>
		</template>

		<!-- Placeholder tabs (Team, API) -->
		<div
			v-if="tab === 'team' || tab === 'api'"
			class="p-card relative overflow-hidden p-16 text-center"
			style="background: #2b1f15; border: none"
		>
			<div
				class="absolute inset-0 pointer-events-none"
				style="background: radial-gradient(circle at 50% 40%, rgba(184, 122, 78, 0.3), transparent 60%)"
			/>
			<div class="relative">
				<div class="mono-label !text-clay-soft mb-4">Kommer snart</div>
				<div class="font-display italic text-[28px] tracking-[-0.015em] mb-3" style="color: #f3ede2">
					{{ tab === "team" ? "Team-administration" : "API & Webhooks" }}
				</div>
				<p class="text-[15px] max-w-[420px] mx-auto" style="color: rgba(243, 237, 226, 0.6)">
					{{ tab === "team" ? "Inviter teammedlemmer og tildel roller. Under udvikling." : "" }}
				</p>
			</div>
		</div>
	</div>
</template>

