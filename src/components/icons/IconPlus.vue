
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round" 
    stroke-linejoin="round" 
  >
    <line
      data-line-y
      x1="12"
      y1="5"
      x2="12"
      y2="19"
    ></line>
    <line
      data-line-x
      x1="5"
      y1="12"
      x2="19"
      y2="12"
    ></line>
  </svg>
</template>


<style scoped>
  [data-line-y] {
    @apply duration-1000;
    @apply rotate-0;
    @apply origin-center;
  }
  [data-line-x] {
    @apply duration-1000;
    @apply rotate-0;
    @apply origin-center;
  }
  .closed [data-line-y] {
    @apply rotate-[270deg];
  }
  .closed [data-line-x] {
    @apply rotate-360;
  }
</style> 