<template lang="pug">
.chart.relative
  .join.my-6
    button.join-item.btn(@click="zoomObj.scaleTo(svgSel, 100, [0,0])") svgSel
    button.join-item.btn(@click="svgSel.transition().duration(1200).ease(easeElasticOut).call(zoomObj.scaleBy, 1.2, [pos.x,0])") TEST
    button.join-item.btn(
      @click="svgSel.transition().duration(750).call(zoomObj.transform, zoomIdentity)"
      :class="{'btn-success': t.k === 1}"
      ) Reset
  //- .h-7
    .absolute(:style="{transform: `translateX(${pos.sx}px)`}")
      .btn.btn-xs.btn-accent( :style="{transform: `translateX(-50%) rotate(${pos.angle + 90}deg)`,  transformOrigin: `50% 150%`}") 123
    //- :width="svgElBounds.width.value"
  div.w-full(ref="svgElWrapper" class="h-[200px]")
    svg.pointer-events-none(
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
          path.fill-accent(:d="` M ${(dO.sp[0] - t.x)/t.k} 0 V 200 H ${(dO.mp[0] - t.x)/t.k} V -200`")

        measurementsComp.pointer-events-auto
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
//- pre {{ props.data[pos.bb] }}
//- pre {{ pos }}
//- pre {{ props.data }}
//- pre {{ sizes }}
//- pre {{ measurements }}

pre {{ mm }}
</template>

<script setup>
import { useGesture } from '@vueuse/gesture'
import * as pm from 'popmotion'
import { easeElasticOut } from "d3-ease"
import { line, curveStepBefore, curveStepAfter } from "d3-shape"
import { select, pointer } from "d3-selection"
import { zoom, ZoomTransform, zoomIdentity } from "d3-zoom"
import { extent, sum, cumsum, bisect } from "d3-array"
import { scaleLinear, scaleOrdinal } from "d3-scale"
import { brushX } from "d3-brush"
import { computed, h, onMounted, reactive, watchEffect } from 'vue';

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

const mm = reactive([
  {x1: 300, x2: 400,},
  {x1: 500, x2: 700,},
])

const measurementsComp = () => {
  // return h('div', 'LALALA')
  const rect = (m) => {
    // const state = reactive({
    //   isMoving: false,
    // })
    // m.isMoving = false
    const handlePointerMove = (type, e) => {
      // console.log("MMMM");
      const [x,y] = t.invert(pointer(e, svgEl.value))
      let dx = x - m.sp[0]
      dx *= t.k
      if (type == 'resize-x1') {
        m.x1 = m.origin[0] + dx 
        return
      }
      if (type == 'resize-x2') {
        m.x2 = m.origin[1] + dx 
        return
      }
      m.x1 = m.origin[0] + dx 
      m.x2 = m.origin[1] + dx 
      // m.x2 = m.origin[1] + x - m.sp[0]
      // m.x1 /= t.k
      // m.x2 /= t.k
      // console.log(t.apply([x,y]));
      // m.x2 -= m.sp[0] - x
      // e.stopPropagation()
      // console.log(e.target, e.currentTarget);
      // console.log("MOVE");
    }
    const handlePointerUp = (e) => {
      // console.log("UP");
      document.removeEventListener("pointermove", handlePointerMoveFn)
      document.removeEventListener("pointerup", handlePointerUp)
    }
    
    const handlePointerDown = (type, e) => {
      console.log("DOWN", type);
      // console.log(e, type);
      m.sp = t.invert(pointer(e, svgEl.value))
      m.origin = [m.x1,m.x2]
      handlePointerMoveFn = handlePointerMove.bind(null, type)
      document.addEventListener("pointermove", handlePointerMoveFn)
      document.addEventListener("pointerup", handlePointerUp)
      // e.stopPropagation()
    }
    
    let handlePointerMoveFn, handlePointerUpFn
    
    const p = [
      h('path', {
        d: `M ${m.x1} 0 V 200 H ${m.x2} V -200`,
        class: 'fill-blue-300/20',
        onPointerdown: handlePointerDown.bind(null, 'move')
      }),
      h('path', {
        'stroke-width': "6",
        class: 'stroke-red-600 hover:stroke-green-300 cursor-col-resize',
        d: `M ${m.x1} 0 V 200`,
        onPointerdown: handlePointerDown.bind(null, "resize-x1")
      }),
      h('path', {
        'stroke-width': "6",
        class: 'stroke-red-600 hover:stroke-red-300 cursor-col-resize',
        d: `M ${m.x2} 0 V 200`,
        onPointerdown: handlePointerDown.bind(null, "resize-x2")
        // onPointerDown: handlePointerDown.bind(null, "resize")
      }),
    ]
    // console.log(p);
    // p.on('po')
    return p
  }

  return h('g', {class: 'measurements'}, mm.map((m) => {
    return rect(reactive(m))
  }))
}

let dO = reactive({
  isDrawing: false,
  sp: [0,0],
  mp: [0,0],
})

onMounted(() => {
  // const b = brushX()
  //   // .filter(function(event) {
  //   //   return event.shiftKey
  //   // })
  //   .keyModifiers((e) => {
  //     console.log(123123,e);
  //     return ['shiftKey']
  //   })
  //   .extent([[0,0], [svgElBounds.width.value,svgElBounds.height.value]])
  //   .on('brush', (e) => {
  //     e.sourceEvent.stopPropagation()
  //     console.log(e);
  //   })
  // svgSel.value.append("g")
  //   .call(b)



  svgSel.value.on('pointerdown', (e) => {
    if (e.shiftKey) {
      dO.isDrawing = true
      dO.sp = pointer(e)
      dO.mp = pointer(e)
    }
  })
  svgSel.value.on('pointermove', (e) => {
    if (dO.isDrawing) {
      console.log(dO);
      dO.mp = pointer(e, svgEl.value)
    }
  })
  svgSel.value.on('pointerup', (e) => {
    // console.log("MOVE", e);
    dO.isDrawing = false
  })
  
  zoomObj = zoom()
    .scaleExtent([1, sizes.chart.height])
    .translateExtent([[0,0],[svgElBounds.width.value,svgElBounds.height.value]])
    // .on('mousemove', e => {
      // console.log('start');
    // })
    .filter(function(event) {
      console.log(event);
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


// let a

// useGesture({
//   onMove: (s) => {
//     let x = s.initial[0] + s.movement[0] - svgElBounds.left.value
//     pos.x = x
//     pos.y = s.initial[1] + s.movement[1] - svgElBounds.top.value
//     // console.log(a);
//     pos.bb = bisect(cumsumData.value, xScale.value.invert(x))
//     // console.log(bb);
    
//     if (a)
//       a.stop()
//     a = pm.animate({
//       // from: s.initial[0] - svgElBounds.left.value,
//       from: pos.sx ? pos.sx : s.initial[0] - svgElBounds.left.value,
//       to: x,
//       stiffness: 1500,
//       damping: 20,
//       mass: 0.5,
//       type: "spring",
//       onUpdate: (v) => {
//         // console.log(v);
//         let dx = Math.abs(pos.x - v)
//         pos.dx = dx
//         pos.sx = v
//         pos.q1 = `Q ${pos.x} ${pos.y - 50} ${pos.x} ${pos.y}`
//         pos.q2 = `Q ${pos.x} ${pos.y + 50} ${pos.sx} ${sizes.chart.height}`
//         pos.angle = Math.atan2( 0 - pos.y, pos.sx - pos.x) * 180 / Math.PI
//       }
//     })
//   }

// },{
//   domTarget: svgEl
// })


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
