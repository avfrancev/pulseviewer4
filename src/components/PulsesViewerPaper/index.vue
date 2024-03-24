<template lang="pug">
.chart.relative.flex.flex-col(class='h-1/2')
  //- button.btn(@click="mode = mode === 'dark' ? 'light' : 'dark'") {{ mode }}
  //- pre {{ pos }} {{ tz }}
  //- button.btn(@click="paper.project.activeLayer.matrix.apply()") scale
  //- pre(:style="{background: colors.p}") {{ mouse }}
  //- button.btn(@click="isDragEnabled = !isDragEnabled") isDragEnabled: {{ isDragEnabled }}
  //- pre.text-xs {{ measurements.map(m => m.state) }}
  //- pre {{ measurements.length }}
  //- .flex.text-xs
    div(v-for="m in measurements.sort((a,b) => a.state.getters.xMin - b.state.getters.xMin)")
      pre {{ m.state }}
  pre {{ store.tz.x }}
  input.input(type="number" v-model.number="props.data.xOffset")
  //- input.input(type="number" v-model.number="props.data[0].time")
  .flex-1.flex.flex-col.items-center.justify-center
    div(class="h-[200px] w-full" ref="wrapper")
      canvas.w-full.h-full.pointer-events-none1.select-none.touch-none(ref="canvas" resize)
    .bg-base-300.w-full.py-2
      div( v-if="store?.tz" ref="dragHandler" )
        .bg-accent.h-6.rounded(
          class="hover:border"
          :style="{ transform: `translateX(${-store.tz.x/store.tz.k}px)`, width: `calc(${100/store.tz.k}%)` }"
          v-drag="handleDrag"
          )
          //- pre 123
  

</template>

<script setup>
import * as pm from 'popmotion'
import { easeElasticOut } from "d3-ease"
import { line, curveStepBefore, curveStepAfter } from "d3-shape"
import { select, pointer } from "d3-selection"
import { zoom, ZoomTransform, zoomIdentity } from "d3-zoom"
import { extent, sum, cumsum, bisect, quantile, mean } from "d3-array"
import { scaleLinear, scaleOrdinal, tickFormat } from "d3-scale"
import { colors, mode } from '../../stores/colors'

import { useGesture } from '@vueuse/gesture'

import { v4 } from 'uuid'
const uuid = v4()

const props = defineProps({
  data: {
    type: Array,
    default: [],
  },
  xOffset: {
    type: Number,
    default: 0
  },
  zoomID: {
    type: Number,
    default: 0
  }
})



const dragHandler = ref(null)
const dragHandlerBounds = useElementBounding(dragHandler)
const canvas = ref()
const wrapper = ref()
const wrapperBounds = useElementBounding(wrapper)


const handleDrag = (s) => { 
  // console.log(-s.delta[0]);
  // store.$patch({ tz: { x: store.tz.x - s.delta[0] } })
  store.tz.translateBy(-s.delta[0]*store.tz.k)
}

import { useStore } from './store'

const store = useStore(uuid, props.zoomID)
store.$patch({
  state: {
    // uuid: v4(),
    canvas, wrapper, wrapperBounds,
    data: props.data,
    xOffset: props.xOffset,
  }
})




import usePaper from './usePaper'
const { paper } = usePaper(store)
// store.$patch({
//   state: {
//     paper
//   }
// })


/////////////////////////

// const mouse = useMouseInElement(wrapper, { touchAction: 'none' })
// const mouse = useMouseInElement(wrapper)

// import usePanZoom from './usePanZoom'
// const { gestures, tz, tests } = usePanZoom({ 
//   domTarget: wrapper,
//   wrapperBounds,
//   extent: computed(() => [[0, 0], [wrapperBounds.width.value, wrapperBounds.height.value]]),
//   xScale, xScaleOrigin,
//   mouse,
// })

// import usePaper from './usePaper'
// const { paper } = usePaper({ gestures, canvas, data: props.data, xScale, xScaleOrigin, yScale, tz, mouse, wrapperBounds })


// const wrapperSel = computed(() => {
//   return select(wrapper.value)
// })

// let zoomObj = ref()

// watch([wrapperBounds.width, sumData], () => {
//   // console.log(wrapperBounds.width.value, sumData.value);
//   // console.log('xScale changed', xScale.value.ticks(3));
  
//   xScale.value = scaleLinear([0, sumData.value], [0 ,wrapperBounds.width.value])
//   xScaleOrigin.value = xScale.value.copy()
//   xScale.value = tz.rescaleX(xScaleOrigin.value)
//   // console.log(tz.rescaleX(xScaleOrigin.value));
//   // setupZoom()
//   // nextTick(() => {
//   //   console.log('xScale changed2', xScale.value.ticks(3));
//   // })
// })

// console.log(gesture);

// zoomObj.value = setupZoom()



// function setupZoom() {
//   return zoom()
//     .scaleExtent([1, 10000])
//     .translateExtent([[0, 0], [wrapperBounds.width.value, wrapperBounds.height.value]])
//     // .filter(function (event) {
//     //   // const isMeasurement = event.target.getAttribute('isMeasurement')
//     //   // if (event.target !== event.currentTarget && event.type !== 'wheel' && !isMeasurement) return false
//     //   // return !event.shiftKey
//     //   // console.log(event);
//     //   return event.type === 'wheel'
//     //   return true
//     // })
//     // // .on("zoom.", null)
//     // .on('zoom', e => {
//     //   // console.log(e);
//     //   xScale.value = e.transform.rescaleX(xScaleOrigin.value)
//     //   Object.assign(tz, e.transform)
//     // })
// }

// function setupZoom_() {
//   zoomObj.value = zoom()
//     .scaleExtent([1, 10000])
//     .translateExtent([[0, 0], [wrapperBounds.width.value, wrapperBounds.height.value]])
//     .filter(function (event) {
//       // const isMeasurement = event.target.getAttribute('isMeasurement')
//       // if (event.target !== event.currentTarget && event.type !== 'wheel' && !isMeasurement) return false
//       // return !event.shiftKey
//       // console.log(event);
//       return event.type === 'wheel'
//       return true
//     })
//     // .on("zoom.", null)
//     .on('zoom', e => {
//       // console.log(e);
//       xScale.value = e.transform.rescaleX(xScaleOrigin.value)
//       Object.assign(tz, e.transform)
//     })
    
//     // console.log(zoomObj.value.transform)
    
//   wrapperSel.value.call(zoomObj.value)
//     .on('wheel', e => {
//       zoomObj.value.translateBy(wrapperSel.value, e.deltaX / tz.k, 0)
//       e.preventDefault()
//     });
// }


/////////////////////////

// import { extractThemeColorsFromDOM } from 'daisyui/src/helpers'

// import usePanZoom from './usePanZoom'







</script>

