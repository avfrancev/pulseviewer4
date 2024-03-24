import { useGesture } from '@vueuse/gesture'
import { ZoomTransform } from "d3-zoom"
import { inertia } from 'popmotion'

function constrain(transform, extent, translateExtent) {
  var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
    dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0],
    dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
    dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}

export default (props) => {
  const tz = reactive(new ZoomTransform(1, 0, 0))

  tz.translateBy = function (xOffset) {
    // let translateExtent = [[0, 0], [wrapperBounds.width.value, wrapperBounds.height.value]]
    this.x += xOffset
    let constrained = constrain(this, props.extent.value, props.extent.value)
    Object.assign(this, constrained)
    props.xScale.value = tz.rescaleX(props.xScaleOrigin.value)

  }

  tz.scaleToPointX = function (scaleFactor, p0) {
    let scaleExtent = [1, 1000]
    // let translateExtent = [[0, 0], [wrapperBounds.width.value, wrapperBounds.height.value]]

    let p1 = this.invertX(p0)
    let newTz = this.scale(scaleFactor)
    newTz.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], newTz.k));
    Object.assign(this, newTz)
    this.x = p0 - p1 * tz.k
    this.translateBy(0)
    // let constrained = constrain(this, translateExtent, translateExtent)
    // Object.assign(this, constrained)
    // props.xScale.value = tz.rescaleX(props.xScaleOrigin.value)
  }

  onMounted(() => {
    setTimeout(() => {
      tz.scaleToPointX(1.5, 100)
      props.xScale.value = tz.rescaleX(props.xScaleOrigin.value)

    }, 0)
  })

  const tests = reactive({})
  
  
  const gestures = useGesture({
    onWheel: (e) => {
      e.event.preventDefault()
      if (e.delta[1] !== 0) {
        let x = props.mouse.elementX.value
        const scaleFactor = Math.exp(e.delta[1] * -0.001)
        tz.scaleToPointX(scaleFactor, x)
      }
      if (e.delta[0] !== 0)
        tz.translateBy(e.delta[0])
    },
    onDrag: (e) => {
      if (e.last) {
        // console.log(e.last);
        // tz.translateBy(e.delta[0])
        // let ina = inertia({ velocity: 200, from: 50, onUpdate: (v) => tz.translateBy(v) })
        // let lastv = e.vxvy[0]
        inertia({
          // velocity: e.vxvy[0]*120/tz.k, 
          velocity: e.vxvy[0] * e.distance , 
          from: tz.x ,
          // from: 0,
          power: 0.9,
          timeConstant: 100 ,
          onUpdate: (v) => tz.translateBy( v - tz.x)
        })
      }
      if (e.dragging) {
        tz.translateBy(e.delta[0])
        // console.log(ina);
          // .start(v => console.log(v))

      }
    },
    onPinch: (e) => {
      return
      // onPinch: (e) => {
      //   console.log(e, 'pich');
      //   let x = e.origin[0] - props.wrapperBounds.left.value
      //   if (e.touches === 0) {
      //     const scaleFactor = Math.exp(e.delta[1] * -0.01)
      //     tz.scaleToPointX(scaleFactor, x)
      //   } else if (e.touches === 2) {
      //     // tz.translateBy(e.delta[0])
      //     // const scaleFactor = Math.exp(e.delta[0] * 0.01)
      //     const scaleFactor = (1 - e.vdva[0])
      //     tz.scaleToPointX(scaleFactor, x)

      //   }
      //   // console.log(e.origin, props.mouse.elementX.value, xx);

      // }
      // console.log(e.da);
      // return
      // console.log(e.origin);
      // let lastDx
      let x = e.origin[0] - props.wrapperBounds.left.value
      if (e.pinching && e.touches === 2) {
        gestures.state.drag.cancel()

        let w = props.wrapperBounds.width.value 
        let dx =  e.delta[0] 
        let s = (w + dx * 2) / w 
        
        tz.scaleToPointX( s, x)
        return
      } else if (e.pinching) {
        gestures.state.wheel.cancel()
        if (e.delta[2] !== 0) {
          e.event.preventDefault()
          // let x = props.mouse.elementX.value
          const scaleFactor = Math.exp(e.delta[1] * -0.005)
          tz.scaleToPointX(scaleFactor, x)
        }
      }
    },
    // onMove: (e) => {}
  }, {
    domTarget: props.domTarget,
    // drag: {
    //   delay: 1000,
    // },
    wheel: {
      // lockDirection: true,
      passive: true
    },
    eventOptions: { passive: false },
  })

  return {gestures, tz}
}