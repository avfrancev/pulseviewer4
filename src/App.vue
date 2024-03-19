<template lang="pug">
//- div.flex.items-center.justify-center
  .join
    .join-item.btn.btn-outline.btn-accent.btn-active(ref="hello") Button
    .join-item.btn.btn-outline.btn-accent(ref="hello") Button 2
  //- pre {{ mouse }}
//- .overflow-hidden
router-view
</template>

<script setup>
import { useGesture } from '@vueuse/gesture'

const hello = ref()
// const mouse = reactive(useMouse({ target: hello }))
</script>



<style lang="sass">
html, body
  scroll-behavior: smooth
  height: 100%
  display: grid
</style>

<style lang="sass">
#app
  // overflow-x: hidden
  position: relative
  width: 100%
  min-height: 100vh
</style>
