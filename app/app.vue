<template>
  <div>
    <NuxtLoadingIndicator :color="'#b87a4e'" :height="2" :throttle="0" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </NuxtLayout>
  </div>
</template>

<style>
.page-enter-active {
  transition: opacity 150ms ease-out;
}
.page-leave-active {
  transition: opacity 100ms ease-in;
}
.page-enter-from {
  opacity: 0;
}
.page-leave-to {
  opacity: 0;
}
</style>
