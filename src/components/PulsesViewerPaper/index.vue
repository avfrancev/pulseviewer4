<template lang="pug">
.chart.relative
  //- pre {{ pos }} {{ tz }}
  //- button.btn(@click="paper.project.activeLayer.matrix.apply()") scale
  pre {{ mouse }}
  div(class="h-[200px] border1" ref="wrapper")
    canvas.w-full.h-full.pointer-events-none.select-none.touch-none(ref="canvas")
  

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
import { nextTick, watch } from 'vue'
import { useMouseInElement } from '@vueuse/core'

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

const emit = defineEmits(['update:xOffset'])
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

const genLine = computed(() => 
  line()
    .x((d,i) => xScaleOrigin.value(d.time))
    .y((d,i) => yScale.value(d.level))
    .curve(curveStepAfter)
)


/////////////////////////

const mouse = useMouseInElement(wrapper, { touchAction: 'none' })
import usePaper from './usePaper'


const tz = reactive(new ZoomTransform(1,0,0))

const { paper } = usePaper({ canvas, data: props.data, genLine, xScale, xScaleOrigin, yScale, tz, mouse })


const wrapperSel = computed(() => {
  return select(wrapper.value)
})

let zoomObj = ref()

watch([wrapperBounds.width, sumData, xOffset], () => {
  // console.log(xOffset.value);
  xScale.value = scaleLinear([0, sumData.value], [0 ,wrapperBounds.width.value])
  xScaleOrigin.value = xScale.value.copy()
})




onMounted(() => {  
  zoomObj.value = zoom()
  // .scaleExtent([1, sizes.chart.height])
  .scaleExtent([1, 1000])
    .translateExtent([[0,0],[wrapperBounds.width.value, wrapperBounds.height.value]])
    // .on('mousemove', e => {
      // console.log('start');
    // })
    .filter(function(event) {
      const isMeasurement = event.target.getAttribute('isMeasurement')
      if (event.target !== event.currentTarget && event.type !== 'wheel' && !isMeasurement) return false
      return !event.shiftKey
    })

    .on('zoom', e => {
      // console.log(e.sourceEvent.target === wrapper.value);
      // console.log(e);
      // console.log('zoom	');
      xScale.value = e.transform.rescaleX(xScaleOrigin.value)
      // pos.ss = e.transform
      Object.assign(tz, e.transform)
    });
    
  wrapperSel.value.call(zoomObj.value).on('wheel', e => {
    zoomObj.value.translateBy(wrapperSel.value, e.deltaX / tz.k, 0)
  });

  wrapperSel.value.on('mousemove click', (e) => {
    const [x] = pointer(e)
    pos.bb = bisect(cumsumData.value, xScale.value.invert(x))
    // pulseIdUnderCursor.value = bisect(cumsumData.value, xScale.value.invert(x))
  })


})
/////////////////////////


const pos = reactive({
  x:0, y:0,
  q1:'', q2:'',
  ss: {k:1,x:0},
})





</script>

