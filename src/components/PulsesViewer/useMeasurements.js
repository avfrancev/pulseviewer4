import { select, pointer } from "d3-selection"
import { zoom, ZoomTransform, zoomIdentity } from "d3-zoom"
import { extent, sum, cumsum, bisect, quantile, mean } from "d3-array"


export default  (props) => {

  const {
    data,
    cumsumData,
    t, sizes,
    xScaleOrigin,
    svgEl,
  } = props

  const measurements = reactive([])
  
  const Measurements = () => {
    // return h('div', 'LALALA')
    const rect = (m) => {
      // const state = reactive({
      //   isMoving: false,
      // })
      // m.isMoving = false
      const handlePointerMove = (type, e) => {
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
      }
      const handlePointerUp = (e) => {
        document.removeEventListener("pointermove", handlePointerMoveFn)
        document.removeEventListener("pointerup", handlePointerUp)
      }
      
      const handlePointerDown = (type, e) => {
        m.sp = t.invert(pointer(e, svgEl.value))
        m.origin = [m.x1,m.x2]
        handlePointerMoveFn = handlePointerMove.bind(null, type)
        document.addEventListener("pointermove", handlePointerMoveFn)
        document.addEventListener("pointerup", handlePointerUp)
      }
      
      let handlePointerMoveFn, handlePointerUpFn
      
      const p = [
        h('path', {
          d: `M ${m.x1} 0 V 200 H ${m.x2} V -200`,
          class: 'pointer-events-none',
          style: {
            opacity: 0.1,
            fill: m.color,
          },
          // onPointerdown: handlePointerDown.bind(null, 'move')
        }),
  
        h('g',
          {class: 'group'},
          [
            h('path', {
              d: `M ${Math.min(m.x1,m.x2) + 10/t.k} ${sizes.bottom.y + sizes.bottom.height/2} H ${Math.max(m.x1,m.x2) - 10/t.k}`,
              'stroke-width': "3",
              'stroke-linecap': 'round',
              // class: 'hover:stroke-base-content/50 cursor-move',
              class: 'group-hover:brightness-200s transition',
              style: {
                cursor: 'move',
                opacity: 1,
                stroke: m.color,
              },
              // onPointerdown: handlePointerDown.bind(null, 'move')
            }),
            h('path', {
              d: `M ${Math.min(m.x1,m.x2) + 10/t.k} ${sizes.bottom.y + sizes.bottom.height/2} H ${Math.max(m.x1,m.x2) - 10/t.k}`,
              'stroke-width': "20",
              'stroke-linecap': 'round',
              // class: 'hover:stroke-base-content/50 cursor-move',
              style: {
                cursor: 'move',
                opacity: 0,
                stroke: m.color,
              },
              onPointerdown: handlePointerDown.bind(null, 'move')
            }),
          ]
        ),      
        h('g',
          {class: 'group'},
          [h('path', {
            'stroke-width': "2",
            // class: 'stroke-orange-600 group-hover:stroke-orange-300 cursor-col-resize',
            d: `M ${m.x1} 0 V 200`,
            style: { cursor: 'col-resize', opacity: 0.5, stroke: m.color, },
            // onPointerdown: handlePointerDown.bind(null, "resize-x1")
          }),
          h('path', {
            'stroke-width': "12",
            class: 'stroke-transparent cursor-col-resize',
            d: `M ${m.x1} 0 V 200`,
            onPointerdown: handlePointerDown.bind(null, "resize-x1")
          })]
        ),
        h('g',
          {class: 'group'},
          [h('path', {
            'stroke-width': "2",
            // class: 'stroke-orange-600 group-hover:stroke-orange-300 cursor-col-resize',
            d: `M ${m.x2} 0 V 200`,
            style: { cursor: 'col-resize', opacity: 0.5, stroke: m.color, },
            // onPointerdown: handlePointerDown.bind(null, "resize-x2")
          }),
          h('path', {
            'stroke-width': "12",
            class: 'stroke-transparent cursor-col-resize',
            d: `M ${m.x2} 0 V 200`,
            onPointerdown: handlePointerDown.bind(null, "resize-x2")
          })]
        ),
        // h('path', {
        //   'stroke-width': "6",
        //   class: 'stroke-red-600 hover:stroke-red-300 cursor-col-resize',
        //   d: `M ${m.x2} 0 V 200`,
        //   onPointerdown: handlePointerDown.bind(null, "resize-x2")
        //   // onPointerDown: handlePointerDown.bind(null, "resize")
        // }),
      ]
      return p
    }
    return h('g', {class: 'measurements'}, measurements.map((m) => {
      return rect(m)
    }))
  }

  function createMeasurement(x1=0,x2=100,color='red') {
    const state = reactive({
      x1,x2,color,
      width: computed(() => Math.abs(state.x1 - state.x2)),
      selection: computed(() => {
        // let b = bisect(cumsumData.value, o.x1)
        const x1 = xScaleOrigin.value.invert(state.x1)
        const x2 = xScaleOrigin.value.invert(state.x2)
        const minX = Math.min(x1,x2)
        const maxX = Math.max(x1,x2)
        const dT = xScaleOrigin.value.invert(state.width)
        let rangeIds = [bisect(cumsumData.value, x1), bisect(cumsumData.value, x2)].sort((a,b) => a-b)
        const cumsumPulses = cumsumData.value.slice(rangeIds[0], rangeIds[1])
        const pulses = props.data.slice(rangeIds[0], rangeIds[1])
        const minmaxFreq = extent(pulses)
        // quantile @pulses.value.map((d)->d.w), 0.05
        const q = quantile(props.data, 0.05)
        const baud = parseInt(1 / q*1000*1000)
        return {
          x1,x2,dT,
          minX, maxX,
          rangeIds,
          pulses,
          cumsumPulses,
          minmaxFreq,
          baud,
        }
      })
    })
    return state
  }

  return {
    Measurements,
    measurements,
    createMeasurement,
  }
}

