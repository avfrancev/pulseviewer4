import { defineStore } from 'pinia'
import { sum } from "d3-array"


export const usePulses = defineStore(`pulses`, () => {
  const rawPulses = reactive([[10, 10, 10, 200, 320, 212, 42, 424, 242, 122, 10], [10, 10, 10, 120, 30, 50, 50, 300, 10]])

  const pulses = reactive([])

  watch(rawPulses, () => {
    const pp = rawPulses.map((arr, i) => {
      let time = 0
      arr = arr.map((d, i) => {
        if (i !== 0)
          time += arr[i - 1]
        return { level: i % 2, width: d, time }
      })
      arr.sum = computed(() => sum(arr, (d) => d.width))
      // console.log(arr.sum.value);
      arr.xOffset = 0
      pulses.push(arr)
      return arr
    })
  }, { immediate: true })

  // pulses[0].xOffset = -100
  pulses[1].xOffset = -30

  const maxSum = computed(() => Math.max(...pulses.map(d => d.sum)))
  const maxSumWithOffset = computed(() => Math.max(...pulses.map(d => d.sum - d.xOffset)))
  return { 
    rawPulses,
    pulses,
    maxSum, maxSumWithOffset
  }

})