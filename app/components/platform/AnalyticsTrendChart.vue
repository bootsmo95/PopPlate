<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
  daily: Array<{ date: string; count: number }>
}>()

const chartData = computed(() => ({
  labels: props.daily.map(d => {
    const date = new Date(d.date)
    return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
  }),
  datasets: [{
    data: props.daily.map(d => d.count),
    borderColor: '#b87a4e',
    backgroundColor: 'rgba(184,122,78,0.12)',
    fill: true,
    tension: 0.3,
    pointRadius: 0,
    pointHoverRadius: 4,
    pointHoverBackgroundColor: '#b87a4e',
    borderWidth: 2,
  }],
}))

const reducedMotion = import.meta.client
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#f8f3e9',
      borderColor: 'rgba(26,20,16,0.10)',
      borderWidth: 1,
      titleColor: '#1a1410',
      bodyColor: '#1a1410',
      titleFont: { family: 'JetBrains Mono', size: 11 },
      bodyFont: { family: 'JetBrains Mono', size: 11 },
      padding: 8,
      cornerRadius: 6,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9a8773', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 7 },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(26,20,16,0.06)' },
      ticks: { color: '#9a8773', font: { family: 'JetBrains Mono', size: 10 } },
      border: { display: false },
      beginAtZero: true,
    },
  },
  animation: {
    duration: reducedMotion ? 0 : 400,
  },
}
</script>

<template>
  <div style="height: 240px">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
