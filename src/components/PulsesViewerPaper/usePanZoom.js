import { useGesture } from '@vueuse/gesture'
import { inertia } from 'popmotion'

export default (store) => {
  const { tz } = store
  // console.log(tz, domTarget);

  
  const gestures = useGesture({
    onWheel: (e) => {
      e.event.preventDefault()
      if (e.delta[1] !== 0) {
        let x = store.state.mouse.elementX
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
      // return
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
    domTarget: store.state.wrapper,
    // domTarget: domTarget,
    // drag: {
    //   delay: 1000,
    // },
    wheel: {
      // lockDirection: true,
      passive: true
    },
    eventOptions: { passive: false },
  })

  // HACK
  gestures.clean()
  gestures.bind()

  return {gestures}
}