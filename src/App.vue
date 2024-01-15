<template lang="pug">
div.flex.items-center.justify-center
  .join
    .join-item.btn.btn-outline.btn-accent.btn-active(ref="hello") Button
    .join-item.btn.btn-outline.btn-accent(ref="hello") Button 2
  //- pre {{ mouse }}
router-view
</template>

<script setup>
import { useGesture } from '@vueuse/gesture'

const hello = ref()
// const mouse = reactive(useMouse({ target: hello }))
</script>



<style scoped lang="sass">
.lala
  background: green
</style>
