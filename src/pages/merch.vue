<template lang="pug">
.container.mx-auto.px-2.mt-4.text-xs
  //- pre {{ pulses }}
  button.mr-12.btn(@click="clickGenPlan") clickGenPlan
  button.mr-12.btn(@click="fillCoordinates") fillCoordinates
  button.mr-12.btn(@click="makeBins(addresses)") makeBins
  button.mr-12.btn(@click="isMapExpanded = !isMapExpanded") isMapExpanded
  button.mr-12.btn(@click="kmean.updateKMean") updateKMean
  //- input.input(type="number" v-model.number="currDay")
  .join
    button.join-item.btn(:class="[ currDay === -1 ? 'btn-active':'']" @click="currDay = -1") Все
    button.join-item.btn(v-for="d,i in days" :class="[ currDay === i ? 'btn-active':'']" @click="currDay = i") {{ d }}

  //- pre {{ kmean.centroids }}

  .w-full(:class="[isMapExpanded ? 'h-screen':'h-96']")
    yandex-map(:settings="{location: {center: [addresses[3].x, addresses[20].y], zoom: 12.3,}}")
      yandex-map-default-scheme-layer
      yandex-map-default-features-layer

      //- v-for="(addr, i) in filteredAddresses" :key="i"
      yandex-map-marker(
        v-for="(addr, i) in addresses" :key="i"
        position="center left-center"
        :settings="{ coordinates: [addr.x, addr.y], properties: { hint: `${addr.address}` }, }"
        )
        //- .mask.mask-squircle
        //- pre {{ addr.store.toLowerCase() }}
        //- button.btn
        //- .h-10.w-10
          //- a(:href="`#${addr.id}`")
          a(
            @click="scrollToAddr(addr)"
            @pointerover="onAddrOver(addr)"
            @pointerout="addr.hovered = false"
            )
            img.bg-transparent.mask1.mask-squircle1.rounded-lg(
              class="border-2 border-red-500"
              :class="addr.hovered ? 'border-primary':''"
              :src="`${addr.store.toLowerCase()}.png`")
        //- .absolute(class="1left-1/2 1-bottom-2")
          .h-1.w-1.rounded.bg-error(style="left: 0%; transform: translateX(-50%)")
        //- div.absolute
        //- .absolute2
          PieChart.rounded-full.h-5.w-5.shadow-lg(v-bind="{days: addr.days, colors}" style="left: 0%; transform: translate(0%,50%)")
        .absolute(
          class="left-1/2 -bottom-2 transform-gpu transition border rounded-full"
          :class="[addr.hovered ? 'scale-150 z-10 border-neutral':'scale-100 -z-1 border-transparent']"
          )
          .h-6.w-6.rounded-full.shadow-lg(
            :style="{...addr.pieChartStyles, transform: `translate(0%,0%)`}"
            :class="[addr.isInDay ? 'opacity-100':'opacity-30']"
            )

        //- .tooltip.tooltip-open.tooltip-primary(data-tip="error")
        //- button.block.h-auto.btn.btn-secondary.py-2 {{addr.address}}
      //- yandex-map-marker(
        v-for="(addr, i) in kmean.centroids" :key="i"
        class="transition"
        :container-attrs="{ 'class': `transition` }"
        position="top left-center"
        :settings="{ coordinates: [addr.x, addr.y], properties: { hint: `${addr.address}` }, }"
        )
        .absolute(class="left-1/2 -bottom-2")
          .h-8.w-8.rounded-full.bg-success.border.border-black(style="left: 0%; transform: translateX(-50%)")
        
      //- YandexMapClusterer(zoom-on-cluster-click)
      //- YandexMapCollection(zoom-on-cluster-click)
        //- template(v-for="(addr, i) in addresses" :key="i")
        YandexMapDefaultMarker(
          v-for="(addr, i) in filteredAddresses" :key="i"
          :settings="{ coordinates: [addr.x, addr.y], properties: { hint: `${addr.address} [ ${addr.store} ]` } }"
          )
          //- :position="`left-center top`"
          template
            div asdasdasd!!
        template(#cluster="{ length }")
          .cluster {{ length }}
      YandexMapHint(hint-property="hint")
        template(#default="{ content }")
          div.hint {{ content }}
        
  //- pre {{ currentPulsesId }}
  .flex.carousel
    .carousel-item.rounded.flex.flex-col.max-w-96.border-2.m-2(
      v-for="d,i in kmean.groupedAddressesByDays.value"
      :class="[currDay == i ? 'border-accent':'border-neutral']"
      )
      .text-xl.text-center.flex.items-center.justify-between.space-x-2.px-6.py-4
        .flex.items-center
          .inline-block.rounded-full.h-6.w-6(:style="{ background: colors[i] }") 
          .ml-2.font-bold.uppercase {{days[i]}}
        span [ {{ d.length }} ]
      .divider.divider-neutral.my-0
      draggable.menu(
        v-model="kmean.groupedAddressesByDays.value[i]"
        v-bind="dragOptions"
        itemKey="address"
        tag="ul"
        @end="handleDropEnd"
        :data-day-id="i"
      )
        template(#item="{ element, index }")
          li.item(
            :id="element.iid"
            :ref="(el) => element.li = el"
            @pointerover="onAddrOver(element)"
            )
            div.flex
              span {{ element.address }}
              //- span.text-xs [{{ element.iid }}]
              //- span.text-lg [{{ element.visit_frequency }}]
              span.text-nowrap.text-lg {{ element.days }}

      //- draggable.menu(
        v-bind="dragOptions"
        draggable=".item"
        @change="handleDayChange"
        @end="handleDropEnd"
        )
        //- @change="(e) => e.added.element.day = e.added.newIndex"
        //- tag="transition-group"
        //- :component-data="{ tag: 'ul', type: 'transition-group', name: !drag ? 'flip-list' : null }"
        //- v-model="plan[0]"
        //- @start="drag.value = true"
        //- @end="drag.value = false"
        //- group="people"
        
        template(#item="{ element, index }")
          li.item(
            :id="element.id"
            :ref="(el) => element.li = el"
            @pointerover="onAddrOver(element)"
            )
            div.flex.space-x-2(
              :class="element.hovered ? `border` : ``"
              )
              //- pre {{ element.store }}
              img.bg-transparent.h-8.w-8.mask.mask-squircle(:src="`${element.store.toLowerCase()}.png`")
              span.flex-1 {{ element.address.trim() }} [{{ element.day }}] {{ element.XXX }}
              //- pre ---{{ element.id }}---
              span {{ element.cluster }}
              span {{ element.days }}
              .join
                //- .join-item()`
                a.btn.btn-sm(
                  target="_blank"
                  v-if="element.geocode"
                  :href="`https://yandex.ru/maps/?pt=${element.geocode.Point.pos.split(' ')}&z=18`"
                  ) YA

                button.join-item.btn.btn-sm(@click="locateAddress(element)") Locate

</template>

<script setup>

import draggable from "vuedraggable"

import {
  YandexMap, YandexMapDefaultSchemeLayer, YandexMapDefaultFeaturesLayer, YandexMapClusterer, 
  YandexMapHint, YandexMapDefaultMarker, YandexMapMarker, YandexMapCollection } from 'vue-yandex-maps';

import { computed, nextTick, reactive, shallowReactive, toRaw, unref, watch, watchEffect } from 'vue';
import route_csv from '../../route2.csv?raw'
import aaa from '../../addresses.json'
console.log(aaa); 


const dragOptions = {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };

function parseCSVWithDoubleQuotes(input) {
  const rows = input.split('\n');
  rows.shift()
  return rows.map(row => {
    // Split the row by commas not enclosed in double quotes
    let r = row.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(field => {
      // Remove leading and trailing spaces and double quotes from the field
      return field.trim().replace(/^\"|\"$/g, '');
    });
    return {
      store: r[0],
      address: r[1],
      visit_frequency: +r[2],
    }
    return r
  })
  .filter(row => row.visit_frequency > 0);
}

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']; 

import { interpolateRainbow } from 'd3-scale-chromatic'
const colors = Array.from(Array(5)).map((d,i) => {
  return interpolateRainbow(i/5)
})

// const addresses = reactive( parseCSVWithDoubleQuotes(route_csv) )
const addresses = reactive( aaa )
addresses.forEach( (d,i) => {
  // let pos = d.geocode.Point.pos.split(" ").map(Number)  
  // console.log(pos);
  d.id = i
  // d.x = pos[0]
  // d.y = pos[1]
  // d.ya = {
  //   geometry: {
  //     coordinates: [0,0]
  //   }
  // }
  d.cluster = 0
  d.x = computedEager(() => {
    if (d.ya.features?.length > 0) {
      return d.ya?.features[0].geometry?.coordinates[0]
    }
    return d.ya?.geometry?.coordinates[0] || null
  })
  d.y = computedEager(() => {
    if (d.ya?.features?.length > 0) {
      return d.ya?.features[0].geometry?.coordinates[1]
    }
    return d.ya?.geometry?.coordinates[1] || null
  })
  d.pieChartStyles = computedEager(() => {
    if (!d.days) return null
    const numOfDays = d.days.length;
    const gradientFragments = d.days.map((day, index) => {
      const color = colors[day % colors.length];
      const share = 100 / numOfDays;
      const start = share * index;
      const end = start + share;
      return `${color} ${start}% ${end}%`;
    });
    return {
      background: `conic-gradient(${gradientFragments.join(', ')})`
    };
  });

  d.isInDay = computed(() => {
    return d.days.includes(currDay.value) || currDay.value === -1
  })
})

const currDay = ref(-1) 

const filteredAddresses = computed(() => {
  if (currDay.value < 0) return addresses
  return kmean.groupedAddressesByDays.value[currDay.value]
})

const isMapExpanded = ref(false)


function generatePlan(arr, days=5) {
    // const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    // const plan = {};
  
    // Initialize plan object with empty arrays for each day
    // for (let day of days) {
    //   plan[day] = [];
    // }
    let p = []
    // Sort addresses based on visit frequency in descending order
    // arr.sort((a, b) => b.visit_frequency - a.visit_frequency);
  
    // Repeat addresses on different days
    let currentDay = 0;
    for (let i = 0; i < arr.length; i++) {
      const address = arr[i].address;
      const visitFrequency = arr[i].visit_frequency;
  
      // Repeat the address on different days based on visit frequency
      for (let j = 0; j < visitFrequency; j++) {
        if (!p[currentDay])
            p[currentDay] = []
        p[currentDay].push(arr[i])
        arr[i].day = currentDay
        // plan[days[currentDay]].push(address);
  
        // Move to the next day
        // currentDay = (currentDay + 1) % days.length;
        currentDay = (currentDay + 1) % days;
      }
    }
    // console.log(p);
    return p
    // return plan;
}

// watchEffect(() => {
//   console.log(plan2.value);
// })

const plan = reactive(generatePlan(addresses))
// console.log(plan); 

import useKMean from '../composables/kmean.js'
const kmean = useKMean(addresses)
kmean.updateKMean()


const clickGenPlan = () => {
  Object.assign(plan, generatePlan(addresses))
}



async function searchYandexMaps(str) {
  const apiKey = '4e3567e5-9ea1-47ec-89d0-a09424478672'; // YANDEX API
  const apiUrl = `https://search-maps.yandex.ru/v1/?type=geo&lang=Ru_RU&apikey=4e3567e5-9ea1-47ec-89d0-a09424478672&text=${str}`

  try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log(data);
      // if (data && data.response) {
        // geocode = data.response
      // }
      return data
  } catch (error) {
    console.error('Error:', error);
  }


}

async function getGeocode(address) {
  // const apiKey = 'a0212be8-caa5-4f01-8dc3-9ec59a4348bb'; // YANDEX API
  // const apiUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=`;
  // const apiUrl = `https://search-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&text=`;
  // const apiUrl = `https://search-maps.yandex.ru/v1/?text=Bank Alfalah&type=biz&lang=en_US&apikey=${apiKey}`
                  // https://search-maps.yandex.ru/v1/?text=Bank%20Alfalah&type=biz&lang=en_US&apikey=4e3567e5-9ea1-47ec-89d0-a09424478672
  let geocode = null;

  try {
      const response = await fetch(`${apiUrl}${encodeURIComponent(address)}`);
      const data = await response.json();
      console.log(data);
      if (data && data.response) {
        geocode = data.response
      }
  } catch (error) {
    console.error('Error:', error);
  }

  return geocode;
}



const locateAddress = async (el) => {
  let res = await searchYandexMaps(`Москва, ${el.address}`)
  // console.log({res}, `${el.store} ${el.address}`);
  // el.geocode = res.GeoObjectCollection.featureMember[0].GeoObject
  el.ya = res.features[0]  
}


const fillCoordinates = async () => {
  // for (const item of addresses.slice(0, 3)) {
    console.log('-------------', addresses.length);
    for (const [i, item] of addresses.entries()) {
      await locateAddress(item)
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(i);
    }

    let o = []
    o = addresses.map((d) => {
      let { store, address, ya, visit_frequency, cluster, day, x, y } = d
      return {
        store, address, ya, visit_frequency, cluster, day, x, y
      }
    })
    console.log(o);
  // console.log(toRaw(addresses));
  // console.log(JSON.stringify((addresses), null, 2));

}

const mmm = ref([])

// watch(plan, (newVal, oldVal) => {
//   // mmm.value = newVal
//   console.log(newVal, oldVal);
// })

function handleDayChange(e) {
  console.log(e);
  if (e.added) {
    addresses.forEach((d) => {

    })
  }
}

function handleDropEnd(e, ee) {
  let fromDay = +e.from.dataset.dayId
  let toDay = +e.to.dataset.dayId
  // console.log({fromId, toId});
  let a = addresses.find(el => el.iid === e.item.id)
  if (a) {
    // console.log(fromId);
    let fromDayId = a.days.indexOf(fromDay)
    // toDayId = a.days.indexOf(toDay)
    a.days[fromDayId] = toDay
    // a.days.splice(fromDayId, 1)
    // a.days.splice(toDayId, 0, fromDay)
    
  }
  // console.log(e.item.id);
}




function handleDayChange__(e) {
  if (e.added) {
    // let id = addresses.indexOf(e.added.element)
    nextTick(() => {
      let newGroupId = 0
      for (let i = 0; i < plan.length; i++) {
        // const element = plan[i];
        const isExist = plan[i].includes(e.added.element)
        if (isExist)
          newGroupId = i
      }
      console.log(e.added, newGroupId)
      e.added.element.day = newGroupId
    })
    // let id2 = plan.flat().indexOf(e.added.element)
    // console.log(addresses[id], id,id2);
    // console.log(plan[id2], id,id2);
    // e.added.element.day = e.added.newIndex
  }
}

function scrollToAddr(addr) {
  // addresses.forEach((a) => a.hovered = false)
  // addr.hovered = true
  addr.li.scrollIntoView({ behavior: 'smooth' })
}

function onAddrOver(addr) {
  // console.log(addr)
  addresses.forEach((a) => a.hovered = false)
  addr.hovered = true
}

/////////////////////////////////////

function makeBins(items) {
  // Calculate the distance between each pair of coordinates
  // console.log(items);
  const coordinates = items.map(item => ({ x: item.x, y: item.y }));
  console.log(coordinates);
  // return
  var distances = [];
  for (var i = 0; i < coordinates.length; i++) {
    for (var j = i+1; j < coordinates.length; j++) {
      var dx = coordinates[j].x - coordinates[i].x;
      var dy = coordinates[j].y - coordinates[i].y;
      var distance = Math.sqrt(dx*dx + dy*dy);
      distances.push(distance);
    }
  }

  // Create an empty array to store the bins
  var bins = [];

  // Iterate through the coordinates array and calculate the minimum distance between each pair of coordinates
  for (var i = 0; i < distances.length; i++) {
    var minDistance = Infinity;
    var minIndex = void 0;
    for (var j = 0; j < distances.length; j++) {
      if (distances[j] === 0) continue;
      console.log(i);
      var dx = coordinates[j].x - coordinates[i].x;
      var dy = coordinates[j].y - coordinates[i].y;
      var distance = Math.sqrt(dx*dx + dy*dy);
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = j;
      }
    }
    // Find the index of the nearest coordinate and add it to the corresponding bin
    var nearestIndex = i;
    if (minIndex !== void 0) {
      var dx = coordinates[nearestIndex].x - coordinates[minIndex].x;
      var dy = coordinates[nearestIndex].y - coordinates[minIndex].y;
      var distance = Math.sqrt(dx*dx + dy*dy);
      if (distance < distances[minIndex]) {
        nearestIndex = minIndex;
      }
    }
    bins.push(coordinates[nearestIndex]);
    coordinates.splice(nearestIndex, 1);
  }
}

</script>

<style lang="sass">
  .ghost
    opacity: 0.5
  .hint
    position: absolute
    padding: 4px
    background: white
    border: 1px solid black
    white-space: nowrap
    opacity: 0.7
    transform: translate(8px, -50%)
</style>

<style scoped>
.bounds {
  user-select: all;
}

.marker {
  background: var(--background);
  border-radius: 100%;
  width: 20px;
  height: 20px;
}

.cluster {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background: green;
  color: #fff;
  border-radius: 100%;
  cursor: pointer;
  border: 2px solid limegreen;
  outline: 2px solid green;
}
</style>