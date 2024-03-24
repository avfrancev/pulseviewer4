<template lang="pug">
.container.mx-auto.px-2.h-full
  //- pre {{ pulses }}
  //- PulsesViewerPaper(v-bind="{data: pulses[0]}")
  PulsesViewerPaper(v-bind="{data: ppp[0], zoomID: 1 }")
  PulsesViewerPaper(v-bind="{data: ppp[1], zoomID: 1, xOffset: -1100 }")

</template>

<script setup>

import { computed, reactive } from 'vue';
import sample_pulses from '../sample_pulses.json'
import sample_pulses_logic from '../sample_pulses_logic.json'
import digital_csv from '../digital.csv?raw'

function convertCSVtoObject(csv) {
  let lines = csv.split("\n");
  let result = [];
  let headers = lines[0].split(",");
  for (let i = 1; i < lines.length - 1; i++) {
    let obj = {};
    let currentline = lines[i].split(",");
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = +currentline[j];
    }
    result.push(obj);
  }
  return result;
}

import '../../tests_route'
// console.log(convertFromLogic2Csv(digital_csv));
let csvL = convertCSVtoObject(digital_csv)
csvL = csvL.map((d,i) => {
  const next = csvL[i+1]
  let time = d["Time [s]"] * 1_000_000
  let level = d["Channel 0"] 
  let width = 0
  if (next) {
    width = next['Time [s]'] * 1_000_000 - time
  }
  return {
    time, level, width,
  }
})
csvL = csvL.filter(d => d.width > 0)
// console.log(csvL);

//////////////////
let c = 0
let spl = sample_pulses_logic.map((d) => {
  let x = d * 1000_000 - c
  c += x
  return +x.toFixed()
})
//////////////////

// const pulses2 = reactive([[10,23,23,233,323,212,42,424,242,122,324],[10,123,33,44,22,111,422]])

// const ppp = pulses2.map((arr,i) => {
//   let time = 0
//   return arr.map((d,i) => {
//     if (i !== 0)
//       time += arr[i-1]
//     return { level: i % 2, width: d, time }
//   })
// })

// console.log(ppp[1]);

import { usePulses } from '../stores/pulses'
const {pulses: ppp} = usePulses()


const pulses = reactive([])
// let csvL1 = csvL.map((d,i) => {
//   return {...d, time: d.time*2, width: d.width*2}
// })
// csvL1[0].width = 1000_000
// csvL1[1].time = 1000_000
// console.log(csvL1);
pulses.push(csvL)
// // console.log(pulses);



const currentPulsesId = ref(0)
const currentPulses = computed(() => pulses[currentPulsesId.value])


const setPulsesModel = (v,cp) => {
  // let v = e.target.value
  // console.log({v,cp});
  let o = v.split(',').map(Number)
  pulses[cp] = [...o]
  // console.log(pulses);
  // Object.assign(pulses, )
} 

</script>