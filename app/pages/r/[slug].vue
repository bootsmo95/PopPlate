<template>
  <div class="r-page">
    <!-- Loading skeleton -->
    <main v-if="pending" class="wrap animate-pulse">
      <header class="r-header">
        <div class="flex items-center gap-3.5 mb-6">
          <div class="h-px w-7" style="background: rgba(139, 78, 44, 0.3);" />
          <div class="h-2.5 w-36 rounded" style="background: rgba(139, 78, 44, 0.15);" />
        </div>
        <div class="h-[clamp(72px,11vw,180px)] w-[70%] rounded mb-9" style="background: rgba(26, 20, 16, 0.06);" />
        <div class="grid grid-cols-4 gap-6 pt-8 border-t border-ink/10 max-[800px]:grid-cols-2">
          <div v-for="i in 4" :key="i" class="space-y-2">
            <div class="h-2.5 w-16 rounded" style="background: rgba(26, 20, 16, 0.08);" />
            <div class="h-5 w-20 rounded" style="background: rgba(26, 20, 16, 0.05);" />
          </div>
        </div>
      </header>

      <div class="r-menu-grid">
        <div v-for="i in 3" :key="i" class="r-dish" style="cursor: default;">
          <div class="r-dish-text">
            <div class="flex items-center gap-3 mb-3.5">
              <div class="h-px w-5" style="background: rgba(139, 78, 44, 0.3);" />
              <div class="h-2.5 w-6 rounded" style="background: rgba(139, 78, 44, 0.15);" />
            </div>
            <div class="flex justify-between gap-6 mb-5 pb-5 border-b border-dashed border-ink/10">
              <div class="h-8 rounded" :style="{ width: ['65%','50%','75%'][i-1], background: 'rgba(26, 20, 16, 0.07)' }" />
              <div class="h-6 w-16 rounded shrink-0" style="background: rgba(26, 20, 16, 0.05);" />
            </div>
            <div class="space-y-2.5 mb-6">
              <div class="h-3.5 w-full rounded" style="background: rgba(26, 20, 16, 0.05);" />
              <div class="h-3.5 w-3/4 rounded" style="background: rgba(26, 20, 16, 0.05);" />
            </div>
            <div class="h-12 w-28 rounded-full" style="background: rgba(26, 20, 16, 0.06);" />
          </div>
          <div class="r-dish-3d">
            <div class="r-dish-3d-chrome">
              <div class="r-dish-3d-corner tl" />
              <div class="r-dish-3d-corner tr" />
              <div class="r-dish-3d-corner bl" />
              <div class="r-dish-3d-corner br" />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Error -->
    <div v-else-if="error || !menu" class="flex min-h-screen items-center justify-center px-6">
      <div class="max-w-sm text-center">
        <div class="eyebrow mb-4">popplate</div>
        <h1 class="font-display font-normal text-[36px] tracking-[-0.025em] leading-[1]">Menu ikke fundet</h1>
        <p class="mt-4 text-[15px] text-ink-mute leading-relaxed">Denne menu er muligvis ikke publiceret endnu.</p>
      </div>
    </div>

    <!-- Menu -->
    <main v-else class="wrap">
      <!-- Restaurant header -->
      <header class="r-header">
        <div class="r-eyebrow">3D restaurant menu</div>
        <h1 class="r-name">{{ menu.restaurant.name }}</h1>
        <div class="r-meta">
          <div class="r-meta-item">
            <span>Retter</span>
            <strong>{{ menu.dishes.length }}</strong>
          </div>
          <div class="r-meta-item">
            <span>3D-modeller</span>
            <strong>{{ menu.dishes.filter(d => d.hasModel).length }}</strong>
          </div>
          <div class="r-meta-item">
            <span>Format</span>
            <strong>AR-ready</strong>
          </div>
          <div class="r-meta-item">
            <span>App</span>
            <strong>Ikke påkrævet</strong>
          </div>
        </div>
      </header>

      <!-- Empty state -->
      <div v-if="menu.dishes.length === 0" class="empty-state">
        <h2 class="font-display font-normal text-[28px] tracking-[-0.015em]">Ingen publicerede retter endnu</h2>
        <p class="text-ink-mute mt-3 text-[15px]">Publicerede retter vises her automatisk.</p>
      </div>

      <!-- Dish list -->
      <div v-else class="r-menu-grid">
        <div
          v-for="(dish, i) in menu.dishes"
          :key="dish.publicDishId"
          class="r-dish"
          :class="{ 'signature': i === 0, 'selected': dish.publicDishId === selectedPublicDishId }"
          @click="selectDish(dish.publicDishId)"
        >
          <!-- Left: text -->
          <div class="r-dish-text">
            <div class="r-dish-num">
              <span class="bar" />
              {{ String(i + 1).padStart(2, '0') }}
            </div>
            <div class="r-dish-head">
              <h3>{{ dish.name }}</h3>
              <span v-if="dish.priceText" class="r-dish-price">{{ dish.priceText }}</span>
            </div>
            <p v-if="dish.shortDescription" class="r-dish-desc">{{ dish.shortDescription }}</p>
            <div v-if="allergenList(dish).length" class="r-dish-meta-row">
              <div>
                <h5>Allergener</h5>
                <p>{{ allergenList(dish).join(' · ') }}</p>
              </div>
            </div>
            <NuxtLink
              v-if="dish.hasModel"
              :to="`/d/${dish.publicDishId}`"
              class="r-dish-ar-btn"
              @click.stop="trackMenuArClick(dish)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              Se i AR
            </NuxtLink>
            <span v-else class="r-dish-info-tag">Kun info</span>
          </div>

          <!-- Right: 3D preview -->
          <div class="r-dish-3d">
            <div class="r-dish-3d-chrome">
              <div class="r-dish-3d-corner tl" />
              <div class="r-dish-3d-corner tr" />
              <div class="r-dish-3d-corner bl" />
              <div class="r-dish-3d-corner br" />
              <div class="r-dish-3d-label"><span class="dot" /> 3D Preview</div>
            </div>
            <div class="r-dish-shine" />

            <div v-if="dish.hasModel && dish.publicDishId === selectedPublicDishId" class="r-dish-viewer-wrap">
              <ViewerDishViewer
                :key="dish.publicDishId"
                :glb-url="modelGlbUrl(dish)"
                :usdz-url="modelUsdzUrl(dish)"
                :poster-url="posterUrl(dish)"
                :alt="dish.name"
                :scale="viewerScale(dish)"
                height="100%"
                rotation-per-second="14deg"
                @viewer-loaded="trackSelectedViewerLoaded"
                @ar-clicked="trackSelectedArClicked"
              />
            </div>
            <div v-else-if="dish.hasPoster" class="r-dish-model">
              <img :src="posterUrl(dish)" :alt="dish.name" />
            </div>
            <div v-else class="r-dish-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(212, 168, 128, 0.4);">
                <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>

            <div class="r-dish-3d-foot">
              <span><span class="ctrl">↻</span> Drej</span>
              <span><span class="ctrl">⇕</span> Zoom</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { trackArLaunchClicked, trackEvent, trackViewerLoaded } from '~/lib/analytics/events'

definePageMeta({ layout: 'public' })

const route = useRoute()
const slug = route.params.slug as string

interface MenuDish {
  id: string
  publicDishId: string
  name: string
  shortDescription: string | null
  priceText: string | null
  allergens: string | null
  ingredients: string | null
  hasModel: boolean
  hasUsdz: boolean
  hasPoster: boolean
  scaleCm: number | null
  publishedAt: string | null
  createdAt: string
}

interface RestaurantMenu {
  restaurant: {
    id: string
    name: string
    slug: string
    status: string
  }
  dishes: MenuDish[]
}

const { data: menu, pending, error } = await useFetch<RestaurantMenu>(`/api/public/restaurants/${slug}/menu`)
const selectedPublicDishId = ref<string | null>(null)
const trackedViewerLoads = new Set<string>()

const selectedDish = computed(() => {
  if (!menu.value?.dishes.length) return null
  return menu.value.dishes.find((dish) => dish.publicDishId === selectedPublicDishId.value) ?? menu.value.dishes[0]!
})

watch(
  () => menu.value?.dishes,
  (dishes) => {
    if (!selectedPublicDishId.value && dishes?.length) {
      selectedPublicDishId.value = dishes[0]!.publicDishId
    }
  },
  { immediate: true },
)

useHead({
  title: computed(() => menu.value ? `${menu.value.restaurant.name} · popplate` : 'Menu · popplate'),
  meta: [
    {
      name: 'description',
      content: computed(() => menu.value ? `Se ${menu.value.restaurant.name}s 3D-menu på popplate.` : 'Se en 3D-menu på popplate.'),
    },
  ],
})

onMounted(() => {
  if (selectedDish.value && menu.value) {
    trackEvent('menu_open', selectedDish.value.publicDishId, menu.value.restaurant.id)
  }
})

function selectDish(publicDishId: string) {
  selectedPublicDishId.value = publicDishId
  const dish = menu.value?.dishes.find((item) => item.publicDishId === publicDishId)
  if (dish && menu.value) {
    trackEvent('menu_dish_selected', dish.publicDishId, menu.value.restaurant.id)
  }
}

function modelGlbUrl(dish: MenuDish) {
  return `/m/${dish.publicDishId}.glb`
}

function modelUsdzUrl(dish: MenuDish) {
  return dish.hasUsdz ? `/m/${dish.publicDishId}.usdz` : undefined
}

function posterUrl(dish: MenuDish) {
  return dish.hasPoster ? `/m/${dish.publicDishId}.png` : undefined
}

function viewerScale(dish: MenuDish) {
  return dish.scaleCm && dish.scaleCm > 0 ? dish.scaleCm / 100 : 0.05
}

function allergenList(dish: MenuDish) {
  if (!dish.allergens) return []
  return dish.allergens
    .split(',')
    .map((allergen) => allergen.trim())
    .filter(Boolean)
}

function trackSelectedViewerLoaded() {
  if (!selectedDish.value || !menu.value) return
  if (trackedViewerLoads.has(selectedDish.value.publicDishId)) return

  trackedViewerLoads.add(selectedDish.value.publicDishId)
  trackViewerLoaded(selectedDish.value.publicDishId, menu.value.restaurant.id)
}

function trackSelectedArClicked() {
  if (!selectedDish.value || !menu.value) return
  trackArLaunchClicked(selectedDish.value.publicDishId, menu.value.restaurant.id)
}

function trackMenuArClick(dish: MenuDish) {
  if (!menu.value) return
  trackEvent('menu_ar_launch_clicked', dish.publicDishId, menu.value.restaurant.id)
}
</script>

<style scoped>
.r-page { padding: 80px 0 120px; }
@media (max-width: 720px) { .r-page { padding: 48px 0 100px; } }
.wrap { max-width: 1320px; margin: 0 auto; padding: 0 40px; }
@media (max-width: 720px) { .wrap { padding: 0 20px; } }

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

/* ── Restaurant header ── */
.r-header {
  position: relative;
  padding: 40px 0 60px;
  border-bottom: 1px solid rgba(26, 20, 16, 0.10);
}
@media (max-width: 720px) { .r-header { padding: 24px 0 40px; } }
.r-eyebrow {
  @apply font-mono text-[11px] uppercase font-medium text-clay-deep flex items-center gap-3.5 mb-6;
  letter-spacing: 0.22em;
}
.r-eyebrow::before {
  content: "";
  width: 28px;
  height: 1px;
  background: theme('colors.clay.deep');
}
.r-name {
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-weight: 400;
  font-size: clamp(72px, 11vw, 180px);
  letter-spacing: -0.04em;
  line-height: 0.9;
  color: theme('colors.ink.DEFAULT');
  margin-bottom: 36px;
}
.r-meta {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding-top: 32px;
  border-top: 1px solid rgba(26, 20, 16, 0.10);
}
@media (max-width: 800px) { .r-meta { grid-template-columns: 1fr 1fr; gap: 28px; } }
.r-meta-item {
  @apply font-mono text-[11px] uppercase font-medium text-ink-faint;
  letter-spacing: 0.18em;
}
.r-meta-item strong {
  display: block;
  margin-top: 6px;
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-size: 18px;
  font-weight: 400;
  color: theme('colors.ink.DEFAULT');
  letter-spacing: -0.01em;
  text-transform: none;
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 100px 24px;
  border: 1px dashed rgba(26, 20, 16, 0.15);
  border-radius: 4px;
  margin-top: 60px;
}

/* ── Menu grid ── */
.r-menu-grid {
  display: flex;
  flex-direction: column;
}

.r-dish {
  cursor: pointer;
  position: relative;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 60px;
  padding: 40px 0;
  border-bottom: 1px solid rgba(26, 20, 16, 0.10);
  align-items: center;
  transition: background 300ms;
}
.r-dish:first-child { border-top: 1px solid rgba(26, 20, 16, 0.10); }
.r-dish:hover { background: rgba(184, 122, 78, 0.04); }
.r-dish.selected { background: rgba(184, 122, 78, 0.06); }
@media (max-width: 800px) {
  .r-dish { grid-template-columns: 1fr; gap: 24px; padding: 32px 0; }
}

/* Dish text */
.r-dish-text { padding: 0 8px 0 0; }
.r-dish-num {
  @apply font-mono text-[11px] uppercase font-medium text-clay-deep flex items-center gap-3 mb-3.5;
  letter-spacing: 0.22em;
}
.r-dish-num .bar { width: 20px; height: 1px; background: theme('colors.clay.deep'); }
.r-dish-head {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: baseline;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px dashed rgba(26, 20, 16, 0.10);
}
.r-dish-head h3 {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(28px, 2.6vw, 38px);
  letter-spacing: -0.02em;
  line-height: 1.1;
  flex: 1;
}
.r-dish-price {
  font-family: theme('fontFamily.body');
  font-size: 20px;
  font-weight: 500;
  color: theme('colors.ink.DEFAULT');
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.r-dish-desc {
  font-size: 15px;
  color: theme('colors.ink.mute');
  line-height: 1.6;
  margin-bottom: 20px;
  max-width: 540px;
}
.r-dish-meta-row {
  display: flex;
  gap: 32px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.r-dish-meta-row h5 {
  @apply font-mono text-[10px] uppercase font-medium text-ink-faint mb-2;
  letter-spacing: 0.18em;
}
.r-dish-meta-row p {
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-size: 16px;
  color: theme('colors.ink.soft');
  line-height: 1.35;
}
.r-dish-ar-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  background: theme('colors.ink.DEFAULT');
  color: theme('colors.ink.inv');
  border-radius: 999px;
  font-family: theme('fontFamily.body');
  font-weight: 500;
  font-size: 14px;
  transition: background 220ms, transform 220ms;
  white-space: nowrap;
}
.r-dish-ar-btn:hover { background: theme('colors.clay.deep'); transform: translateY(-1px); }
.r-dish-info-tag {
  @apply font-mono text-[11px] uppercase font-medium text-ink-faint;
  letter-spacing: 0.18em;
}

/* 3D preview panel */
.r-dish-3d {
  position: relative;
  aspect-ratio: 1/1;
  background: linear-gradient(180deg, #1a1410 0%, #2b1f15 100%);
  overflow: hidden;
  border-radius: 4px;
  display: grid;
  place-items: center;
  box-shadow:
    0 30px 60px rgba(26, 20, 16, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.r-dish-3d::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 60%, rgba(184, 122, 78, 0.35), transparent 60%);
  z-index: 1;
}
.r-dish-3d::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  z-index: 1;
  pointer-events: none;
}
.r-dish-viewer-wrap {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}
.r-dish-model {
  position: relative;
  z-index: 2;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  box-shadow:
    0 30px 50px rgba(0, 0, 0, 0.5),
    inset 0 4px 12px rgba(255, 255, 255, 0.1),
    inset 0 -20px 30px rgba(0, 0, 0, 0.4);
  animation: rotateModel 14s linear infinite;
}
.r-dish-model img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(1.05) contrast(1.05);
}
@keyframes rotateModel {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.r-dish-3d:hover .r-dish-model { animation-play-state: paused; }
.r-dish-placeholder {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}
.r-dish-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.08) 45%, transparent 60%);
  z-index: 3;
  pointer-events: none;
  animation: shineMove 6s ease-in-out infinite;
}
@keyframes shineMove {
  0%, 100% { transform: translateX(-30%); }
  50% { transform: translateX(30%); }
}

/* 3D chrome */
.r-dish-3d-chrome { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
.r-dish-3d-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(212, 168, 128, 0.55);
}
.r-dish-3d-corner.tl { top: 14px; left: 14px; border-right: none; border-bottom: none; }
.r-dish-3d-corner.tr { top: 14px; right: 14px; border-left: none; border-bottom: none; }
.r-dish-3d-corner.bl { bottom: 14px; left: 14px; border-right: none; border-top: none; }
.r-dish-3d-corner.br { bottom: 14px; right: 14px; border-left: none; border-top: none; }
.r-dish-3d-label {
  position: absolute;
  top: 14px;
  right: 50%;
  transform: translateX(50%);
  @apply font-mono text-[10px] uppercase font-medium flex items-center gap-2;
  letter-spacing: 0.22em;
  color: theme('colors.clay.soft');
}
.r-dish-3d-label .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: theme('colors.clay.DEFAULT');
  animation: dotPulse 1.6s ease-out infinite;
}
@keyframes dotPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.r-dish-3d-foot {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  @apply font-mono text-[10px] uppercase font-medium flex gap-3.5;
  letter-spacing: 0.18em;
  color: rgba(243, 237, 226, 0.45);
  z-index: 4;
}
.r-dish-3d-foot span { display: flex; align-items: center; gap: 6px; }
.r-dish-3d-foot .ctrl {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(243, 237, 226, 0.35);
  display: grid;
  place-items: center;
  font-size: 8px;
}
</style>
