<template lang="pug">
.container.mx-auto.px-2.h-full
  //- pre {{ pulses }}
  PulsesViewerPaper(v-bind="{data: currentPulses}")
  //- PulsesViewerPaper(v-bind="{data: currentPulses}")

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

// const pulses = reactive([[0,23,23,233,323,212,42,424,242,122,324],[0,123,33,44,22,111,422]])
const pulses = reactive([])
pulses.push(csvL)



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