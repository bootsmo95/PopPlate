/**
 * Scroll-reveal: fade-up + stagger using IntersectionObserver.
 *
 * Usage: call useScrollReveal() in your page/component setup.
 * Then mark elements with data-reveal. Children can use data-reveal-delay="1" etc.
 * SSR-safe: the .reveal-ready class is only added after hydration.
 */
export function useScrollReveal() {
  if (!import.meta.client) return

  onMounted(() => {
    // Mark body so CSS knows JS has hydrated (prevents FOIC — flash of invisible content)
    document.documentElement.classList.add('reveal-ready')

    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    )

    for (const el of targets) observer.observe(el)

    onUnmounted(() => observer.disconnect())
  })
}
