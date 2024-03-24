import { defineStore } from 'pinia'
import { ZoomTransform } from "d3-zoom"
import { extent, sum, cumsum, bisect, quantile, mean } from "d3-array"
import { scaleLinear, scaleOrdinal, tickFormat } from "d3-scale"
// import { inertia } from 'popmotion'
import { useGesture } from '@vueuse/gesture'
import { usePulses } from '../../stores/pulses.js'

import usePanZoom from './usePanZoom'

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


export const useZoomStore = (uuid, zoomUUID) => defineStore('zoomStore-' + (zoomUUID || uuid), () => {
  // console.log(zoomUUID, uuid, 'zoomStore-' + (zoomUUID || uuid));
  const store = useStore(uuid)
  
  const tz = reactive(new ZoomTransform(1, 0, 0))

  tz.translateBy = function (xOffset) {
    // console.log(store.state.wrapperBounds.width);
    let { width, height } = store.state.wrapperBounds
    let translateExtent = [[0, 0], [width, height]]
    this.x += xOffset
    let constrained = constrain(this, translateExtent, translateExtent)
    Object.assign(this, constrained)
    // props.xScale.value = tz.rescaleX(props.xScaleOrigin.value)
    // console.log(store.xScale, store.xScaleOrigin);
    // store.xScale = tz.rescaleX(store.xScaleOrigin)

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
  })

  
  return {tz}
})

export const useMeasurementsStore = (uuid) => defineStore('measurementsStore-' + uuid, () => {
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

export const useStore = (uuid, zoomUUID) => defineStore(`store-${uuid}`, () => {

  const pulsesStore = usePulses()
  
  const zoomStore = useZoomStore(uuid, zoomUUID)()
  const { tz } = zoomStore
  // console.log(uuid, zoomUUID, zoomStore);
  // console.log({ canvas, wrapper, wrapperBounds });
  // const measurementsStore = useMeasurementsStore()
  // const { measurements, createMeasurement } = measurementsStore

  // measurementsStore.$onAction(({ name, store, after }) => {
  //   console.log({ name, store, after});
  // })

  // let wrapper, wrapperBounds
  // let canvas = reactive({})
  const state = reactive({
    canvas: {},
    wrapper: null,
    wrapperBounds: {},
    data: [],
    mouse: {},
    xOffset: 0,
    // uuid,
  })

  // state.mouse = computed(() => {
  //   if (!state.wrapper) return {}
  //   return useMouseInElement(state.wrapper)
  // })

  watch(() => state.wrapper, () => {
    // console.log(state.wrapper);
    state.mouse = useMouseInElement(state.wrapper)
  })



  // watchEffect(() => {
  //   console.log(state.mouse?.elementX);
  // })

  let sizes = reactive({
    top: { y: 0, height: 40 },
    chart: { y: 40, height: 0 },
    bottom: { y: 0, height: 30 },
  })
  // sizes.chart.height = computed(() => wrapperBounds.height.value - sizes.bottom.height - sizes.top.height)
  // sizes.bottom.y = computed(() => sizes.chart.height + sizes.chart.y)

  // const minmaxData = computed(() => extent(state.data, (d) => d.width))
  // const cumsumData = computed(() => cumsum(state.data, (d) => d.width))
  const sumData = computed(() => sum(state.data, (d) => d.width))
  // console.log(state.data);
  // console.log(sumData);
  // const yScale = computed(() => scaleLinear([1, 0], [sizes.top.height, sizes.chart.y + sizes.chart.height]))
  const xScaleOrigin = ref(scaleLinear())
  const xScale = ref(scaleLinear())

  watch(() => [state.wrapperBounds.width, sumData.value, state.data.xOffset, pulsesStore.maxSumWithOffset], () => {
    if (!state.wrapperBounds.width && !sumData.value) return

    // xScale.value = scaleLinear([bound, sumData.value + 0], [0, state.wrapperBounds.width])
    // console.log(pulsesStore.maxSumWithOffset);
    // console.log(state.data.sum, state.data.xOffset);
    xScale.value = scaleLinear([state.data.xOffset, pulsesStore.maxSumWithOffset + state.data.xOffset], [0, state.wrapperBounds.width])
    xScaleOrigin.value = xScale.value.copy()
    xScale.value = tz.rescaleX(xScaleOrigin.value)
  })

  watch(tz, () => {
    xScale.value = tz.rescaleX(xScaleOrigin.value)
  }, { immediate: true })

  onMounted(() => {
    nextTick(() => {
      // tz.scaleToPointX(12, state.wrapperBounds.width / 2)
      usePanZoom({tz, state})
    })
  })

  return {
    state,
    tz,
    xScale, xScaleOrigin,
  }
})()
