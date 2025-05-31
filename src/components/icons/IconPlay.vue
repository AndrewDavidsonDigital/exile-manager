<!-- eslint-disable prettier/prettier -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <!-- Animated waveform bars, perfectly centered -->
    <rect
      x="2"
      :y="barY(6)"
      width="2"
      :height="6"
      rx="1"
    >
      <animate
        attributeName="height"
        values="6;10;6"
        dur="1s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="9;7;9"
        dur="1s"
        repeatCount="indefinite"
      />
    </rect>
    <rect
      x="6"
      :y="barY(10)"
      width="2"
      :height="10"
      rx="1"
    >
      <animate
        attributeName="height"
        values="10;14;10"
        dur="1s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="7;5;7"
        dur="1s"
        repeatCount="indefinite"
        begin="0.2s"
      />
    </rect>
    <rect
      x="10"
      :y="barY(8)"
      width="2"
      :height="8"
      rx="1"
    >
      <animate
        attributeName="height"
        values="8;12;8"
        dur="1s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="8;6;8"
        dur="1s"
        repeatCount="indefinite"
        begin="0.4s"
      />
    </rect>
    <rect
      x="14"
      :y="barY(10)"
      width="2"
      :height="10"
      rx="1"
    >
      <animate
        attributeName="height"
        values="10;14;10"
        dur="1s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="7;5;7"
        dur="1s"
        repeatCount="indefinite"
        begin="0.6s"
      />
    </rect>
    <rect
      x="18"
      :y="barY(6)"
      width="2"
      :height="6"
      rx="1"
    >
      <animate
        attributeName="height"
        values="6;10;6"
        dur="1s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="9;7;9"
        dur="1s"
        repeatCount="indefinite"
        begin="0.8s"
      />
    </rect>
  </svg>
</template>

<script setup lang="ts">
// Helper to calculate y for a given height to center the bar
function barY(height: number) {
  return 12 - height / 2;
}
defineOptions({
  name: 'IconPlay'
})
</script>

<style>
@keyframes wave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.1); }
}
</style> 