import { defineStore } from 'pinia'
// import { useGesture } from '@vueuse/gesture'
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


export const useZoomStore = defineStore('zoomStore', () => {
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
  return tz
})

export const useMeasurementsStore = defineStore('measurementsStore', () => {
  const measurements = reactive([])

  function createMeasurement(x1,x2,c) {
    let m = { x1, x2, c }
    measurements.push(m)
    return m
  }
  
  return {
    measurements,
    createMeasurement
  }
})

export const useStore = defineStore('store', () => {
  const measurementsStore = useMeasurementsStore()
  const { measurements, createMeasurement } = measurementsStore

  measurementsStore.$onAction(({ name, store, after }) => {
    console.log({ name, store, after});
  })

  // watchEffect(() => {
  //   console.log(measurements, measurements.length);
  // })

  // setTimeout(() => {
  //   createMeasurement(0, 100, 'green')
  // }, 1000)
  
  const state = {
    measurements,
  }

  return {
    state,
  }
})
