<template lang="pug">
.chart.relative
  .join.my-6
    button.join-item.btn(@click="zoomObj.scaleTo(svgElWrapperSel, 100, [0,0])") svgElWrapperSel
    button.join-item.btn(@click="svgElWrapperSel.transition().duration(1200).ease(easeElasticOut).call(zoomObj.scaleBy, 1.2, [pos.x,0])") TEST
    button.join-item.btn(
      @click="svgElWrapperSel.transition().duration(750).call(zoomObj.transform, zoomIdentity)"
      :class="{'btn-success': t.k === 1}"
      ) Reset
  //- .h-7
    .absolute(:style="{transform: `translateX(${pos.sx}px)`}")
      .btn.btn-xs.btn-accent( :style="{transform: `translateX(-50%) rotate(${pos.angle + 90}deg)`,  transformOrigin: `50% 150%`}") 123
    //- :width="svgElBounds.width.value"
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
      g
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
            path.stroke-base-content(
              :d="`M ${xScaleOrigin(tick)} 15 V20`")
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
          path.fill-none.stroke-secondary(stroke-width="2" :d="genLine(cumsumData)" dy="123")
        g.arrows(
          v-if="xScaleOrigin((props.data[pos.bb]) * t.k) > 15"
          )
          path.fill-none.stroke-base-content(
            marker-start='url(#head)'
            marker-end='url(#head)'
            :transform="`translate(0,${sizes.chart.y - 8})`"
            stroke-width="1" :d="`M${xScaleOrigin(cumsumData[pos.bb-1])} 0 L${xScaleOrigin(cumsumData[pos.bb])} 0`")
          path.fill-none.stroke-base-content(
            marker-start='url(#head)'
            marker-end='url(#head)'
            :transform="`translate(0,${sizes.bottom.y + 8})`"
            stroke-width="1" :d="`M${xScaleOrigin(cumsumData[pos.bb-1])} 0 L${xScaleOrigin(cumsumData[pos.bb+1])} 0`")
          g(:transform="`scale(${1/t.k},1)`")
            text.text-xs.font-bold.fill-base-content(
              dy="0"
              dominant-baseline="hanging"
              :dx="xScaleOrigin(props.data[pos.bb] / 2 * t.k)"
              :x="xScaleOrigin(cumsumData[pos.bb-1]) * t.k"
              text-anchor="middle"
              ) {{ props.data[pos.bb] }} 
            text.text-xs.font-bold.fill-base-content(
              dy="16"
              :transform="`translate(0,${sizes.bottom.y})`"
              dominant-baseline="hanging"
              :x="xScaleOrigin(cumsumData[pos.bb - 1]) * t.k"
              :dx="xScaleOrigin((props.data[pos.bb] + props.data[pos.bb+1]) / 2 * t.k)"
              text-anchor="middle"
              ) {{ props.data[pos.bb] + props.data[pos.bb+1] }} 
              //- ) {{ props.data[pos.bb+1] }} 
            //- circle.fill-success(:cx="(xScaleOrigin(cumsumData[pos.bb]*t.k))" cy="2" r=3  )

        //- circle.fill-blue-400(:cx="xScaleOrigin.invert(1500) " cy="150" r=10 )
        //- path.fill-none.stroke-accent( stroke-width="2" :d="`M${pos.sx},0 ${pos.q1} ${pos.q2}`")
    //- .lala.absolute(:style="{transform: `translateX(${t.applyX(measurements[0].x1)}px)`}")
      .btn SDSDSDSD
//- pre {{ props.data[pos.bb] }}
//- pre {{ pos }}
//- pre {{ props.data }}
//- pre {{ sizes }}
//- pre {{ measurements }}

//- pre {{ mm }}
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
import { brushX } from "d3-brush"
import { computed, h, onMounted, reactive, watchEffect } from 'vue';


import useMeasurements from './useMeasurements'

const props = defineProps({
  data: Array,
})

const svgEl = ref()
const svgElWrapper = ref()
const svgElBounds = useElementBounding(svgElWrapper)

// let arr = props.data
props.data.unshift(0)

/////////////////////////
let sizes = reactive({
  top: { y: 0, height: 30},
  chart: { y: 30, height: 0},
  bottom: { y: 0, height: 30},
})
sizes.chart.height = computed(() => svgElBounds.height.value - sizes.bottom.height - sizes.top.height)
sizes.bottom.y = computed(() => sizes.chart.height + sizes.chart.y)
/////////////////////////

const minmaxData = computed(() => extent(props.data.filter(Boolean)))
const sumData = computed(() => sum(props.data))
const cumsumData = computed(() => cumsum(props.data))


const genLine = computed(() => 
  line()
    .x((d,i) => xScaleOrigin.value(d))
    .y((d,i) => yScale.value((i+1) % 2))
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

let zoomObj

watch(svgElBounds.width, () => {
  xScale.value = scaleLinear([0, sumData.value], [0,svgElBounds.width.value])
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
      const m = createMeasurement(x1,x2)
      measurements.push(m)
    }
    dO.isDrawing = false
  })
  
  zoomObj = zoom()
    .scaleExtent([1, sizes.chart.height])
    .translateExtent([[0,0],[svgElBounds.width.value,svgElBounds.height.value]])
    // .on('mousemove', e => {
      // console.log('start');
    // })
    .filter(function(event) {
      // console.log(event);
      if (event.target !== event.currentTarget && event.type !== 'wheel') return false
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
  svgElWrapperSel.value.call(zoomObj);
  // svgSel.value.call(zoomObj)


  
  svgElWrapperSel.value.on('mousemove click', (e) => {
    const [x,y] = pointer(e)
    pos.bb = bisect(cumsumData.value, xScale.value.invert(x))
  })

})
/////////////////////////


const pos = reactive({
  x:0, y:0,
  q1:'', q2:'',
  ss: {k:1,x:0},
})


const { Measurements, measurements, createMeasurement } = useMeasurements({
  data: props.data,
  cumsumData,
  t, sizes,
  xScaleOrigin,
  svgEl,
})

measurements.push(createMeasurement(100,200,'green'))



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
