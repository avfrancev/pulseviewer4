<template lang="pug">
.chart.relative.h-full.flex.flex-col
  //- pre {{ pos }} {{ tz }}
  //- button.btn(@click="paper.project.activeLayer.matrix.apply()") scale
  //- pre(:style="{background: colors.p}") {{ mouse }}
  button.btn(@click="mode = mode === 'dark' ? 'light' : 'dark'") {{ mode }}
  //- button.btn(@click="isDragEnabled = !isDragEnabled") isDragEnabled: {{ isDragEnabled }}
  //- pre.text-xs {{ measurements.map(m => m.state) }}
  //- pre {{ measurements.length }}
  //- .flex.text-xs
    div(v-for="m in measurements.sort((a,b) => a.state.getters.xMin - b.state.getters.xMin)")
      pre {{ m.state }}
  .flex-1.flex.flex-col.items-center.justify-center
    div(class="h-[200px] w-full" ref="wrapper")
      canvas.w-full.h-full.pointer-events-none1.select-none.touch-none(ref="canvas" resize)
    .bg-base-300.w-full.py-2
      div( ref="dragHandler" )
        .bg-accent.h-6.rounded(
          class="hover:border"
          :style="{ transform: `translateX(${-tz.x/tz.k}px)`, width: `calc(${100/tz.k}%)` }"
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
// import paper, { Group, Path, Point, PointText, Rect } from 'paper/dist/paper-core'
import { nextTick, watch, watchEffect } from 'vue'
import { useMouseInElement } from '@vueuse/core'

import { useStore } from './store'

const dragHandler = ref(null)
const dragHandlerBounds = useElementBounding(dragHandler)

const handleDrag = (s) => {
  // console.log(s);
  tz.translateBy(-s.delta[0]*tz.k)
  return
  tz.x -= s.delta[0]*tz.k
  // let r = wrapperBounds.width.value - wrapperBounds.width.value / tz.k
  let r = dragHandlerBounds.width.value - dragHandlerBounds.width.value * tz.k
  if (tz.x > 0) {
    tz.x = 0
  } else if (tz.x < r) {
    tz.x = r
  }
  // console.dir(ZoomTransform);
  // zoomObj.value.transform(wrapperSel.value, tz)
  // xScale.value = tz.rescaleX(xScaleOrigin.value)
  // setupZoom()

  // if (tz.x / tz.k < r) tz.x = r
  // console.log(tz.x / tz.k,r);
}

// import useMeasurements from './useMeasurements'

const props = defineProps({
  data: {
    type: Array,
    default: [],
  },
  xOffset: {
    type: Number,
    default: 1
  }
})

// const emit = defineEmits(['update:xOffset'])
// const xOffset = useVModel(props, 'xOffset', emit)
const xOffset = ref(1)

const canvas = ref()
const wrapper = ref()
const wrapperBounds = useElementBounding(wrapper)

// let arr = props.data
// props.data.unshift(0)
// watchEffect(() => {
//   console.log(props.data)
// })
const isMeasurementsOpened = ref(true)

/////////////////////////
let sizes = reactive({
  top: { y: 0, height: 40},
  chart: { y: 40, height: 0},
  bottom: { y: 0, height: 30},
})
sizes.chart.height = computed(() => wrapperBounds.height.value - sizes.bottom.height - sizes.top.height)
sizes.bottom.y = computed(() => sizes.chart.height + sizes.chart.y)
/////////////////////////

const minmaxData = computed(() => extent(props.data, (d) => d.width))
const sumData = computed(() => sum(props.data, (d) => d.width))
const cumsumData = computed(() => cumsum(props.data, (d) => d.width))

const yScale = computed(() => scaleLinear([1,0],[sizes.top.height,sizes.chart.y + sizes.chart.height]))
const xScaleOrigin = ref(scaleLinear())
const xScale = ref(scaleLinear())

// const genLine = computed(() => 
//   line()
//     .x((d,i) => xScaleOrigin.value(d.time))
//     .y((d,i) => yScale.value(d.level))
//     .curve(curveStepAfter)
// )


/////////////////////////

// const mouse = useMouseInElement(wrapper, { touchAction: 'none' })
const mouse = useMouseInElement(wrapper)

import usePanZoom from './usePanZoom'
const { gestures, tz, tests } = usePanZoom({ 
  domTarget: wrapper,
  wrapperBounds,
  extent: computed(() => [[0, 0], [wrapperBounds.width.value, wrapperBounds.height.value]]),
  xScale, xScaleOrigin,
  mouse,
})

import usePaper from './usePaper'
const { paper } = usePaper({ gestures, canvas, data: props.data, xScale, xScaleOrigin, yScale, tz, mouse, wrapperBounds })


// const wrapperSel = computed(() => {
//   return select(wrapper.value)
// })

// let zoomObj = ref()

watch([wrapperBounds.width, sumData, xOffset], () => {
  // console.log(wrapperBounds.width.value, sumData.value);
  // console.log('xScale changed', xScale.value.ticks(3));
  
  xScale.value = scaleLinear([0, sumData.value], [0 ,wrapperBounds.width.value])
  xScaleOrigin.value = xScale.value.copy()
  xScale.value = tz.rescaleX(xScaleOrigin.value)
  // console.log(tz.rescaleX(xScaleOrigin.value));
  // setupZoom()
  // nextTick(() => {
  //   console.log('xScale changed2', xScale.value.ticks(3));
  // })
})

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

import {colors, mode} from '../../stores/colors'
// import usePanZoom from './usePanZoom'







</script>

