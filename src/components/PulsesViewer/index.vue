<template lang="pug">
.chart.relative
  .join.my-6
    button.join-item.btn(@click="zoomObj.scaleTo(svgElWrapperSel, 100, [0,0])") svgElWrapperSel
    button.join-item.btn(@click="svgElWrapperSel.transition().duration(1200).ease(easeElasticOut).call(zoomObj.scaleBy, 1.2, [pos.x,0])") TEST
    button.join-item.btn(
      @click="svgElWrapperSel.transition().duration(750).call(zoomObj.transform, zoomIdentity)"
      :class="{'btn-disabled': t.k === 1}"
      )
      i-fluent:scale-fit-16-regular.h-8.w-8
  //- .h-7
    .absolute(:style="{transform: `translateX(${pos.sx}px)`}")
      .btn.btn-xs.btn-accent( :style="{transform: `translateX(-50%) rotate(${pos.angle + 90}deg)`,  transformOrigin: `50% 150%`}") 123
    //- :width="svgElBounds.width.value"
  svg.pointer-events-none.hidden
    defs
      pattern(id="pattern_stripe_lines2",
          preserveAspectRatio="none"
          patternUnits="userSpaceOnUse"
          :width="4/1"
          :height="4"
        )
        //- :patternTransform="`scale(${1/1},1)`"
        //- line(x1="0", y="0", x2="12.5", :y2="12.5" shape-rendering="geometricPrecision" )
        <g fill="white">
          <polygon :points="`0 ${4/1} ${4/1} 0 2 0 0 2`" />
          <polygon :points="`${4/1} ${4/1} ${4/1} 2 2 ${4/1}`" />
        </g>          
      mask#stripe-mask2(x="0", y="0", width="13", height="13")
        rect(x="0", y="0", :width="svgElBounds.width.value", height="1000", fill="url(#pattern_stripe_lines2)")
  div.flex
    .flex.flex-col.mr-2.join.join-vertical
      button.join-item.btn.btn-sma.btn-square(@click="isMeasurementsOpened = !isMeasurementsOpened")
        i-tabler:ruler-measure.h-6.w-6
      button.join-item.btn.btn-sma.btn-square(
        @click="svgElWrapperSel.transition().duration(750).call(zoomObj.transform, zoomIdentity)"
        :class="{'btn-disabled': t.k === 1}"
        )
        i-fluent:scale-fit-16-regular.h-6.w-6

    div.w-full(ref="svgElWrapper" class="h-[200px]")
      svg.pointer-events-none.select-none.touch-none(
        :viewBox="`${-t.x/t.k} -1 ${svgElBounds.width.value/t.k} ${201}`"
        ref="svgEl"
        preserveAspectRatio="none"
        style="backface-visibility: hidden; transform-style: flat;"
        :height="`${svgElBounds.height.value}px`"
        :width="`${svgElBounds.width.value}px`"
        )
        //- :viewBox="`0 0 ${svgElBounds.width.value} ${svgElBounds.height.value}`"
        defs
          //- patternUnits="objectBoundingBox",
          pattern(id="pattern_stripe_lines",
              preserveAspectRatio="none"
              patternUnits="userSpaceOnUse"
              :width="4/t.k"
              :height="4"
            )
            //- :patternTransform="`scale(${1/t.k},1)`"
            //- line(x1="0", y="0", x2="12.5", :y2="12.5" shape-rendering="geometricPrecision" )
            <g fill="white">
              <polygon :points="`0 ${4/t.k} ${4/t.k} 0 2 0 0 2`" />
              <polygon :points="`${4/t.k} ${4/t.k} ${4/t.k} 2 2 ${4/t.k}`" />
            </g>          
          mask#stripe-mask(x="0", y="0", width="13", height="13")
            rect(x="0", y="0", :width="svgElBounds.width.value", height="1000", fill="url(#pattern_stripe_lines)")
          marker( 
            markerUnits="userSpaceOnUse"
            id='head' 
            :viewBox="`0 0 10 10`"
            :refX="10/t.k"
            :refY="5"
            :markerWidth="6"
            :markerHeight="6"
            orient="auto-start-reverse")
            path.fill-base-content(
              :transform="`scale(${1/t.k},${1})`"
              :d='`M 0 0 L 10 5 L 0 10 z`')
        //- svg(
          :viewBox="`${-t.x/t.k} -1 ${svgElBounds.width.value/t.k} ${201}`"
          preserveAspectRatio="none"
          style="backface-visibility: hidden; transform-style: flat;"
          :height="`${svgElBounds.height.value}px`"
          :width="`${svgElBounds.width.value}px`"        
          )
        g(transform="translate(0,0)")
          //- g
            path.fill-none.stroke-secondary( stroke-width="2" :d="l(arr)")
          //- g(style="backface-visibility: hidden; transform-style: flat;" ref="svgGroupEl" :transform="`scale(${t.k},1) translate(${t.x/t.k},0)`")
            //- g(style="backface-visibility: hidden; transform-style: flat;" ref="svgGroupEl"
              :style="{transform: `translate(${t.x/t.k}px,0px) scaleX(${t.k})`}"
              )
          //- svg(:viewBox="`${-t.x/t.k} 0 ${svgElBounds.width.value/t.k} ${200}`"
            preserveAspectRatio="none"
            )
          g(v-if="dO.isDrawing")
            //- rect.fill-accent(:x="dO.sp[0]" y="0" :width="Math.abs(dO.mp[0] - dO.sp[0])" height="200")
            //- path.fill-accent(:d="` M ${dO.sp[0] + t.x} 0 V 200 H ${dO.mp[0] +t.x} V -200`")
            path.fill-accent(:d="` M ${dO.sp[0]} 0 V 200 H ${dO.mp[0]} V -200`")

          //- measurementsComp
          Measurements.pointer-events-auto
          //- Measurements(v-bind="{ measurementsProps }")
          //- g(
            v-for="m in mm"
            )
            path.fill-accent(
              :d="` M ${m.x1} 0 V 200 H ${m.x2} V -200`")

          g.ticks(
              v-if="xScale.ticks"
            )
            g(
              v-for="tick in xScale.ticks(4)"
              )
              path(
                class="stroke-base-content/30"
                stroke-dasharray="7 10"
                stroke-width="1"
                :d="`M ${xScaleOrigin(tick)} 20 V200`")
              text.fill-base-content.text-xs(
                :x="xScaleOrigin(tick)"
                :transform-origin="`${xScaleOrigin(tick)} 0`"
                dy="0"
                :transform="`scale(${1/t.k},1)`"
                dominant-baseline="hanging"
                text-anchor="middle"
                ) {{ tick/1000 }}
          //- g.chart(:transform="`translate(0,${sizes.chart.y})`")
          g.chart
            path.fill-none.stroke-secondary(stroke-width="2" :d="genLine(props.data)")
          g.arrows(
            v-if="xScaleOrigin((props.data[pulseIdUnderCursor]?.width) * t.k) > 15"
            )
            path.fill-none.stroke-base-content(
              marker-start='url(#head)'
              marker-end='url(#head)'
              :transform="`translate(0,${sizes.chart.y - 8})`"
              stroke-width="1" :d="`M${xScaleOrigin(props.data[pulseIdUnderCursor]?.time)} 0 L${xScaleOrigin(cumsumData[pulseIdUnderCursor])} 0`")
            path.fill-none.stroke-base-content(
              v-if="props.data[pulseIdUnderCursor+1]"
              marker-start='url(#head)'
              marker-end='url(#head)'
              :transform="`translate(0,${sizes.bottom.y + 8})`"
              stroke-width="1" :d="`M${xScaleOrigin(props.data[pulseIdUnderCursor]?.time)} 0 L${xScaleOrigin(cumsumData[pulseIdUnderCursor+1])} 0`")
            g(:transform="`scale(${1/t.k},1)`")
              text.text-xs.font-bold.fill-base-content(
                dy="-16"
                :y="sizes.chart.y"
                :dx="xScaleOrigin(props.data[pulseIdUnderCursor]?.width / 2 * t.k)"
                :x="xScaleOrigin(props.data[pulseIdUnderCursor]?.time) * t.k"
                text-anchor="middle"
                ) {{ props.data[pulseIdUnderCursor]?.width.toFixed() }} 
              text.text-xs.font-bold.fill-base-content(
                v-if="props.data[pulseIdUnderCursor+1]"
                dy="16"
                :transform="`translate(0,${sizes.bottom.y})`"
                dominant-baseline="hanging"
                :x="xScaleOrigin(props.data[pulseIdUnderCursor].time) * t.k"
                :dx="xScaleOrigin((props.data[pulseIdUnderCursor].width + props.data[pulseIdUnderCursor+1].width) / 2 * t.k)"
                text-anchor="middle"
                ) {{ (props.data[pulseIdUnderCursor].width + props.data[pulseIdUnderCursor+1].width).toFixed() }} 
                //- ) {{ props.data[pos.bb+1] }} 
              //- circle.fill-success(:cx="(xScaleOrigin(cumsumData[pos.bb]*t.k))" cy="2" r=3  )

          //- circle.fill-blue-400(:cx="xScaleOrigin.invert(1500) " cy="150" r=10 )
          //- path.fill-none.stroke-accent( stroke-width="2" :d="`M${pos.sx},0 ${pos.q1} ${pos.q2}`")
    //- .lala.absolute.bottom-0(
      v-for="m in measurements"
      :style="{transform: `translateX(${t.applyX(m.selection.maxX )}px)`}")
      div(
        class="-translate-x-full pr-2"
        )
        .btn.btn-xs(
          @click="m.selected = !m.selected") {{ m.selected }}
input.range.w-48(type="range" v-model.number="xOffset" min="-1000" max="1000")
pre {{ xOffset }}
input(v-model.number="xOffset" type="number")
div.grid.mt-4(:style="['transition: grid-template-rows 0.2s ease-out', {'grid-template-rows': isMeasurementsOpened ? '1fr':'0fr'}]")
  MeasurementsMeta.overflow-hidden(v-bind="{ measurements, measurementsSorted, createMeasurement }")
  //- .lala.absolute(:style="{transform: `translateX(${t.applyX(measurements[0].x1)}px)`}")
//- pre {{ props.data[pos.bb] }}
//- pre {{ pos }}
//- pre {{ props.data }}
//- pre {{ sizes }}
//- pre {{ measurements[0].selected }}
pre {{ props.data[pos.bb] }}
</template>

<script setup>
import { useGesture } from '@vueuse/gesture'
import * as pm from 'popmotion'
import { easeElasticOut } from "d3-ease"
import { line, curveStepBefore, curveStepAfter } from "d3-shape"
import { select, pointer } from "d3-selection"
import { zoom, ZoomTransform, zoomIdentity } from "d3-zoom"
import { extent, sum, cumsum, bisect, quantile, mean } from "d3-array"
import { scaleLinear, scaleOrdinal } from "d3-scale"
// import { brushX } from "d3-brush"
import { computed, h, onMounted, reactive, watchEffect } from 'vue';


import useMeasurements from './useMeasurements'

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

const svgEl = ref()
const svgElWrapper = ref()
const svgElBounds = useElementBounding(svgElWrapper)

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
sizes.chart.height = computed(() => svgElBounds.height.value - sizes.bottom.height - sizes.top.height)
sizes.bottom.y = computed(() => sizes.chart.height + sizes.chart.y)
/////////////////////////

const minmaxData = computed(() => extent(props.data, (d) => d.width))
const sumData = computed(() => sum(props.data, (d) => d.width))
const cumsumData = computed(() => cumsum(props.data, (d) => d.width))

// watchEffect(() => {
//   console.log(sumData.value);
// })

const genLine = computed(() => 
  line()
    .x((d,i) => xScaleOrigin.value(d.time))
    .y((d,i) => yScale.value(d.level))
    .curve(curveStepAfter)
)

/////////////////////////

const yScale = computed(() => scaleLinear([1,0],[sizes.top.height,sizes.chart.y + sizes.chart.height]))
const xScaleOrigin = ref(scaleLinear())
const xScale = ref(scaleLinear())

const t = reactive(new ZoomTransform(1,0,0))

const svgSel = computed(() => {
  return select(svgEl.value)
})
const svgElWrapperSel = computed(() => {
  return select(svgElWrapper.value)
})

let zoomObj = ref()

watch([svgElBounds.width, sumData, xOffset], () => {
  // console.log(xOffset.value);
  xScale.value = scaleLinear([0, sumData.value], [0 ,svgElBounds.width.value])
  xScaleOrigin.value = xScale.value.copy()
})

let dO = reactive({
  isDrawing: false,
  sp: [0,0],
  mp: [0,0],
})

onMounted(() => {


  svgElWrapperSel.value.on('pointerdown', (e) => {
    if (e.shiftKey) {
      dO.isDrawing = true
      dO.sp = t.invert(pointer(e))
      dO.mp = t.invert(pointer(e))
    }
  })
  // svgElWrapperSel.value.on('pointerenter', (e) => {
  //   const measurementId = e.target.getAttribute('measurementId')
  //   console.log(measurementId);
  //   if (measurementId >= 0 && measurementId != null) {
  //     measurements[measurementId].hovered = true
  //   }
  // })
  svgElWrapperSel.value.on('pointermove', (e) => {

    if (dO.isDrawing) {
      // console.log(dO);
      dO.mp = t.invert(pointer(e))
    }
  })
  svgElWrapperSel.value.on('pointerup', (e) => {
    // console.log("MOVE", e);
    if (dO.isDrawing) {
      let x1 = dO.mp[0]
      let x2 = dO.sp[0]
      if (x2 - x1 == 0) return
      const m = createMeasurement(x1,x2)
      measurements.push(m)
    }
    dO.isDrawing = false
  })
  
  zoomObj.value = zoom()
    .scaleExtent([1, sizes.chart.height])
    .translateExtent([[0,0],[svgElBounds.width.value, svgElBounds.height.value]])
    // .on('mousemove', e => {
      // console.log('start');
    // })
    .filter(function(event) {
      const isMeasurement = event.target.getAttribute('isMeasurement')
      if (event.target !== event.currentTarget && event.type !== 'wheel' && !isMeasurement) return false
      return !event.shiftKey
    })
    .on('zoom', e => {
      // console.log(e);
      // console.log(e.sourceEvent.target === svgEl.value);
      // console.log(e);
      // console.log('zoom	');
      xScale.value = e.transform.rescaleX(xScaleOrigin.value)
      // pos.ss = e.transform
      Object.assign(t, e.transform)
    });
    
  zoomObj.value(svgElWrapperSel.value)
  // svgElWrapperSel.value.call(zoomObj.value);
  // svgSel.value.call(zoomObj)


  
  svgElWrapperSel.value.on('mousemove click', (e) => {
    const [x] = pointer(e)
    pos.bb = bisect(cumsumData.value, xScale.value.invert(x))
    pulseIdUnderCursor.value = bisect(cumsumData.value, xScale.value.invert(x))
  })

})
/////////////////////////


const pos = reactive({
  x:0, y:0,
  q1:'', q2:'',
  ss: {k:1,x:0},
})

const pulseIdUnderCursor = ref(0)


const { Measurements, measurements, measurementsSorted, createMeasurement } = useMeasurements({
  data: computed(() => props.data),
  cumsumData,
  t, sizes,
  xScaleOrigin,
  svgEl,
  svgElWrapperSel,
  zoomObj,
  svgElBounds,
})

onMounted(() => {
  measurements.push(createMeasurement(0,svgElBounds.width.value,'green'))
})




</script>


<style lang="sass">
\:root
  --test-color: oklch(var(--p) / 1)
  // --test-color: var(--fallback-pc)
path
  vector-effect: non-scaling-stroke
// svg
  // transform: translateZ(0)

</style>
