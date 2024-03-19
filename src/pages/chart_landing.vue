<template>
<canvas class="w-full h-full" ref="canvas" style="border:1px solid black;" resize></canvas>
<div class="bg absolute inset-0"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import paper from 'paper'
import { generatePerlinNoise } from 'perlin-noise'
import { randomNormal } from 'd3-random'
import { createNoise2D, createNoise3D } from 'simplex-noise'
import alea from 'alea';
const canvas = ref(null)
const noise2D = createNoise2D(alea('hello'));
const noise3D = createNoise3D()
// console.log(noise3D(100,100,2));
// console.log(normal());

const noise = new generatePerlinNoise(20, 20, { octaveCount: 1 })
const noise2 = new generatePerlinNoise(20, 20, { octaveCount: 4 })
noise.sort()
// noise2.sort()
// let noise2 = noise2D(1000, 1000)
// console.log(noise2);
function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

function pyramid(arr) {
  var newArr = [];

  // sort numerically
  arr.sort(function (a, b) {
    return a - b;
  });

  // put the biggest in new array
  newArr.push(arr.pop());

  // keep grabbing the biggest remaining item and alternate
  // between pushing and unshifting onto the new array
  while (arr.length) {
    newArr[arr.length % 2 === 0 ? 'push' : 'unshift'](arr.pop());
  }

  return newArr;
}
// g = new paper.Group()

function makeCool(idx=0, g) {
  const normal = randomNormal(0, 0.1)
  const { View, Group, Path, Point, PointText } = paper
  let arr = []
  for (let i = -2; i <= 2; i+=0.1) {
    // console.log(normal(), normal(), normal(), i)
    // console.log(Math.cos(i));
    // arr.push( randomNormal(Math.cos(i/1),0.07)()*10)
    arr.push(normal())
  }

  arr = pyramid(arr)

  const p = new Path({
    strokeColor: 'yellow',
    // fillColor: new paper.Color('rgba(255, 255, 0, 0.5)'),
    
  })

  
  // arr.sort()
  // let pivot = 0.5
  // arr.sort((a, b) => Math.abs(a - pivot) - Math.abs(b - pivot) || b - a);

  for (let i = 0; i < arr.length; i++) {
    // let id = (arr.length / 2 + i) % arr.length
    let id = i
    const el = arr[id];
    // console.log(el);

    p.add(new Point(i*10, el*50))
  }
  // arr.forEach((y, i) => {
  //   let xx = arr[50-i] 
  //   p.add(new Point(i*10, xx*1000))
  // })
  p.smooth()
  p.fitBounds(paper.view.bounds)
  p.position.y = idx*20
  // p.selected = true
  // console.log(p.segments[20]);
  return p
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

onMounted(() => {
  paper.setup(canvas.value)
  const points = Array.from({ length: 100 }, (i) => ({
    // x: normal(),
    // y: normal(),
    a: noise
    // g: randomGeometric(0.1)()
    // x: noise3D(100,100, i),
    // y: noise3D(100,100, i),
  }))
  // console.log(points);
  let pis = []
  for (let i = 0; i < 50; i++) {
    pis.push(makeCool(i))
  }
  let pp = pis[25]
  let s = pp.segments[20]
  console.log(pp, s.point);

  // let cc = new paper.Path.Circle({
  //   center: s.point,
  //   radius: 122,
  //   shadowColor: 'red',
  //   shadowBlur: 120,
  //   // set a fill color to make sure that the shadow is displayed
  //   fillColor: 'red',
  //   // use blendmode to hide the fill and only see the shadow
  //   blendMode: 'multiply',
  // })

  function drawBlurryCircle(center, radius, blurAmount, color) {
    const circle = new paper.Path.Circle({
      center,
      radius,
      shadowColor: color,
      shadowBlur: blurAmount,
      // set a fill color to make sure that the shadow is displayed
      fillColor: 'white',
      // use blendmode to hide the fill and only see the shadow
      blendMode: 'multiply'
    });

    const blurPlaceholder = circle
      .clone()
      .set({ shadowColor: null, fillColor: null })
      .scale((circle.bounds.width + (blurAmount * 2)) / circle.bounds.width);

    return new paper.Group({
      children: [circle, blurPlaceholder],
      blendMode: 'source-over'
    });
  }

  

  // new paper.CompoundPath({
  //   children: [pis[20], pis[22]],
  //   fillColor: 'red',
  //   closed: true,
  // })
  
  let sp = s.point.clone()
  // let segments = [...pp.segments]
  pis.forEach((_pi) => {
    _pi.segments.forEach((s) => {
      s.data = {op: s.point.clone()}
    })
  })
  const t = new paper.Tool()
  let gg = new paper.Group()
  // var gradient = new paper.Gradient(['yellow', 'red', 'purple', 'blue',]);
  var gradient = new paper.Gradient(['yellow', 'red', 'purple', 'blue',]);
  
  paper.view.zoom = 1.2
  
  let prev = null
  let areas = []

  pis.forEach((_pi, ii) => {
    _pi.visible = false
    // _pi.segments.forEach((s) => {
    //   let cp = new paper.Point(500,500)
    //   let dist = cp.getDistance(s.data.op)
    //   let x = s.data.op.add(cp.subtract(s.data.op).multiply(1 - dist / 300))
    //   // console.log(s);
    //   if (!s.next || !s.previous)
    //     return
    //   s.point = x
    //   if (dist < 300 && (s.next || s.previous)) {
    //     // cc.position = x
    //   }
    // })
    _pi.smooth()
    if (prev) {
      prev.reverse()
      let pppp = _pi.clone().join(prev)
      pppp.visible = true
      pppp.strokeColor = 'transparent'
      pppp.fillColor = new paper.Color(gradient, pppp.bounds.topCenter, pppp.bounds.bottomCenter)
      pppp.closed = true
      pppp.parent = gg
      pppp.blendMode = 'luminosity'
      pppp.scale(1, 1.4)

      pppp.segments.forEach((s) => {
        s.data = { op: s.point.clone() }
      })

      // pppp.smooth()

      areas.push(pppp)
    }
    prev = _pi.clone()
  })
  console.log(areas);

window.addEventListener('wheel', (e) => {
  // console.log(e);
  paper.view.zoom += e.deltaY * 0.001
})

  t.onMouseMove = function(e) {
    
    areas.forEach((_pi, ii) => {
      _pi.segments.forEach((s) => {
        let dist = e.point.getDistance(s.data.op)
        // console.log(dist, lerp(100, dist, 0.9), 1-dist/100)
        // s.point.x += 1
        let x = s.data.op.add(e.point.subtract(s.data.op).multiply(1 - dist / 200))
        // console.log(s);
        if (!s.next || !s.previous)
          return
        // s.selected = true
        // console.log(s);
        s.point = x
        // s.point.x += 1
        // console.log(x);
        if (dist < 200 && (s.next || s.previous)) {
          // cc.position = x
        }
      })
    _pi.fillColor = new paper.Color(gradient, _pi.bounds.topLeft, _pi.bounds.bottomLeft)
      // _pi.fillColor = new paper.Color(gradient, _pi.bounds.topCenter, [_pi.bounds.bottomCenter.x, e.point.y])

    })
  }

  t.onMouseMove__ = function(e) {
    gg.removeChildren()
    // let obj = {
    //   tl: pis[20].firstSegment,
    //   tr: pis[20].lastSegment,
    //   bl: pis[21].firstSegment,
    //   br: pis[21].lastSegment,
    // }
    // console.log(pis[20], obj);
    // let p2 = pis[21].clone()
    // p2.reverse()
    // // console.log(p2);
    // let pppp = pis[20].clone().join(p2)
    // pppp.fillColor = 'red'
    // pppp.closed = true
    // pppp.parent = gg
    // let lala = new paper.Path({
      //   segments: [...pis[20].segments, ...pis[21].segments,],
    //   fillColor: 'red',
    //   // closed: true,
    //   selected: true,
    //   parent: gg,
    // })
    // lala.simplify()
    // let ccc = drawBlurryCircle(e.point, 140, 30, 'yellow');
    // ccc.parent = gg
    let ip = new paper.Path({
      segments: [[e.point.x, 0], [e.point.x, 1000]],
      strokeColor: 'red',
      parent: gg
    })

    // let prev = null
    pis.forEach((_pi,ii) => {
      _pi.visible = false
      _pi.segments.forEach((s) => {
        let dist = e.point.getDistance(s.data.op)
        // console.log(dist, lerp(100, dist, 0.9), 1-dist/100)
        // s.point.x += 1
        let x = s.data.op.add(e.point.subtract(s.data.op).multiply(1 - dist / 300))
        // console.log(s);
        if (!s.next || !s.previous)
          return
        s.point = x
        if (dist < 300 && (s.next || s.previous)) {
          // cc.position = x
        }
      })
      _pi.smooth()
      if (prev) {
        prev.reverse()
        // console.log(p2);
        let pppp = _pi.clone().join(prev)
        // new paper.Path.Circle({
        //   center: pppp.bounds.center,
        //   radius: Math.random()*100,
        //   fillColor: 'red',
        //   parent: gg,
        //   blendMode: 'luminosity',
        // })
        pppp.visible = true
        pppp.strokeColor = 'transparent'
        // pppp.fillColor = new paper.Color(`hsla(${360/(ii+1)}deg, 80%, 50%, 0.5)`)
        // console.log(pppp.bounds);
        pppp.fillColor = new paper.Color(gradient, pppp.bounds.topCenter, pppp.bounds.bottomCenter)
        // pppp.shadowBlur = 115
        // pppp.shadowColor = 'black'
        pppp.closed = true
        // pppp.opacity = 0.1
        pppp.parent = gg
        pppp.blendMode = 'luminosity'
        // pppp.opacity = 0.1
        pppp.scale(1, 1.4)

        // ip.getIntersections(pppp).forEach((intersection) => {
        //   // console.log(intersection.point);
        //   let cc = new paper.Path.Circle({
        //     center: intersection.point,
        //     fillColor: 'red',
        //     radius: 3,
        //     parent: gg
        //   })
        //   cc.insertBelow(pppp)
        // })
      }
      prev = _pi.clone()
      // console.log(ip.getIntersections(prev))
    })


    // console.log(pis[22]);
    // pis[22].selected = true
    
    // console.log(gg.children[22]);
    // gg.reverseChildren()
    // let res = paper.project.hitTest(e.point)
    // console.log(res)
    // let ccc = drawBlurryCircle(e.point, 140, 30, 'blue');
    // ccc.parent = gg
    // ccc.position = e.point
    // ccc.insertAbove(gg.children[27])
    paper.view.zoom = 1.2
    // console.log(paper.view);
    let cc = new paper.Path.Circle({
      center: e.point,
      fillColor: 'red',
      radius: 23,
      parent: gg,
    })

    // let cc2 = cc.subtract(gg.getItems([22,23  ]))
    // console.log(gg.children(22));
    // let cc2 = cc.clone()
    // let nextSibling = gg.children[22]
    // while (nextSibling !== gg.lastChild) {
    //   console.log(nextSibling);
    //   if (!nextSibling) return
    //   cc = cc.subtract(nextSibling)
    //   nextSibling = nextSibling.nextSibling
    // }
    // cc.remove()
    // gg.insertChild(22,cc)
    // cc.clone().insertBelow(pis[22])
    // cc.remove()
  }
  // pp.onFrame = () => {
  //   // console.log(123);
    
  // }
  return
  // for (let x = 0; x < 20; x++) {
  //   // const y = Math.sin(x / 10) + noise.perlin2(x / 10, 0);
  //   // // Draw the point at (x, y)
  //   // console.log(y);
  // }

  // console.log(points);
  let g = new paper.Group()
  // let prev = null
  let p = new paper.Path({
    strokeColor: 'red',
  })

  let c = new paper.Color('red')
  
  for (let i = 0; i < 400; i++) {
    let j = i % 20


    const circle = new paper.Path.Circle({
      center: [0, 0],
      radius: 5,
      // fillColor: 'red',
      // fillColor: new paper.Color(noise2[j]/255, 23, 0),
      // fillColor: c.hue += 0.001,
      fillColor: c,
      parent: g,
    })
    // console.log(c.hue);
    c.hue += noise[i] / noise2[i] / 2
    // if (prev) {
    //   const l = new paper.Path.Line({
    //   from: prev,
    //   to: [1000 * noise2[i], noise[i] * 1000],
    //   strokeColor: 'red',
    //   opacity: 1,
    // })
    // }
    prev = [1000 * noise2[i], noise[i] * 1000]
    circle.position = prev
    if (prev)
      p.add(prev)
  }
  p.smooth({ type: 'continuous', factor: 10.1 })
  p.simplify(100)

  // for (let i = 0; i < 20; i++) {
  //   for (let j = 0; j < 20; j++) {
  //     const circle = new paper.Path.Circle({
  //       center: [0, 0],
  //       radius: 2,
  //       fillColor: 'red',
  //       parent: g,
  //     })
  //     circle.position = [1000 * noise[i*j], noise[i*j] * 1000]
  //   }    
  // }

  // noise.forEach((point,i) => {
  //   // console.log(point, i, normal(i));
  //   // normal(i)
  //   const circle = new paper.Path.Circle({
  //     center: [0, 0],
  //     radius: 10,
  //     fillColor: 'red',
  //     parent: g,
  //   })
  //   circle.position = [20 * i, point*1000 ]
  // })
  g.fitBounds(paper.view.bounds)
})

</script>

<style lang="sass">

.bg
  background-color: transparent
  background-image: radial-gradient(rgba(0, 0, 0, 0) 1px, rgba(0,0,0, 1) 1px)
  background-size: 4px 4px
  backdrop-filter: brightness(100%) blur(0px)

</style>