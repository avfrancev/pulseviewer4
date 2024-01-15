<template lang="pug">
.container.mx-auto
  PulsesViewer(v-bind="{data}")
</template>

<script setup>

import sample_pulses from '../sample_pulses.json'

const data = sample_pulses[0]


</script>