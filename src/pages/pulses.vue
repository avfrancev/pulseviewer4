<template lang="pug">
.container.mx-auto.px-2.mt-4
  //- pre {{ pulses }}
  button.mr-12.btn(onclick="data_modal.showModal()") edit
  //- pre {{ currentPulsesId }}
  .join
    button.btn.join-item(
      v-for="d,i in pulses"
      :class="[ currentPulsesId === i ? 'btn-active':'']"
      @click="currentPulsesId = i") {{ i }} 
  dialog.modal#data_modal.px-2
    .modal-box(class="h-full w-full max-w-5xl")
      textarea.textarea.w-full.h-full(:value="pulses[currentPulsesId]" @input="(e) => setPulsesModel(e.target.value, currentPulsesId)")
  //- input(v-model="ss")
  PulsesViewer(v-bind="{data: currentPulses}")
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
  for (let i = 1; i < lines.length; i++) {
    let obj = {};
    let currentline = lines[i].split(",");
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = +currentline[j];
    }
    result.push(obj);
  }
  return result;
}



function convertFromLogic2Csv(csv) {
  let lines = csv.split("\n");
  let result = [0];
  // let headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    // let obj = {};
    let currentline = lines[i].split(",");
    let c = lines[i].split(',')
    let n = lines[i+1]
    let w = 0
    if (n) {
      // console.log(n.split(","));
      w = +n.split(",")[0] - +c[0]
      w *= 1000_000
      console.log(w);
      result.push(+w.toFixed(0));
    }
    // let width = 
    // for (let j = 0; j < headers.length; j++) {
    //   obj[headers[j]] = +currentline[j];
    // }
  }
  return result;
}

// console.log(convertFromLogic2Csv(digital_csv));
let csvL = convertCSVtoObject(digital_csv)
csvL = csvL.map((d) => { return {
  "time": d["Time [s]"],
  "level": d["Channel 0"],
}})
console.log(csvL);

//////////////////
let c = 0
let spl = sample_pulses_logic.map((d) => {
  let x = d * 1000_000 - c
  c += x
  return +x.toFixed()
})
//////////////////

const pulses = reactive([[0,23,23,233,323,212,42,424,242,122,324],[0,123,33,44,22,111,422]])
// const pulses = reactive([])
// pulses.push(csvL)
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