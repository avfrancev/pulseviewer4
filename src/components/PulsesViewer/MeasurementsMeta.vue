<template lang="pug">
//- .flex.flex-row
.carousel.carousel-centera.w-full.space-x-4
  div.carousel-item.text-xs(v-for="m in props.measurementsSorted")
    div.p-4.border.rounded.transition( :class="[ m.hovered ? 'border-base-content/100' : 'border-base-content/30' ]" )
      .btn.btn-circle.btn-xs(:style="{background: m.color}" disabled)
      pre ID: {{ m.selection.measurementId }}
      pre ID: {{ m.hovered }}
      table.table.table-xs.min-w-36
        tbody
          tr
            td.pl-0 &#916;T 
            td.pr-0.text-right {{ m.selection.dT?.toFixed(0) }} #[small ms]
          tr
            td.pl-0 #[i &#402;]#[sub min] 
            td.pr-0.text-right {{ m.selection.minmaxFreq[0] }} #[small ms]
          tr
            td.pl-0 #[i &#402;]#[sub max] 
            td.pr-0.text-right {{ m.selection.minmaxFreq[1] }} #[small ms]
          tr
            td.pl-0 #[i &#402;]#[sub baud] 
            td.pr-0.text-right {{ m.selection.baud }} #[small ms]
          //- tr
          //-   td.pl-0 #[i &#402;]#[sub ] 
          //-   td.pr-0.text-right {{ m.selection.pulses }} #[small ms]
      .join.mt-3.grid.grid-flow-col.justify-stretchs
        button.join-item.btn.btn-sm(@click="m.locateMeasurement")
          i-lucide:locate-fixed
        button.join-item.btn.btn-sm.btn-error(@click="m.remove")
          i-pajamas:remove
</template>

<script setup>
const props = defineProps({
  measurements: Array,
  measurementsSorted: Array,
  createMeasurement: Function,
})


</script>