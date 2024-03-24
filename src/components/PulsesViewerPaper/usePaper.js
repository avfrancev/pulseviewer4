// import { Group, Path, Point, PointText, Rect } from 'paper/dist/paper-core'
import paperOrig from 'paper/dist/paper-core'
import { bisector } from 'd3-array';
import { colors } from '../../stores/colors'
import { watchEffect } from 'vue';

import useMeasurements from './useMeasurements.js'
import { usePulses } from '../../stores/pulses.js';
import { useStore } from './store';

const createDebounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

const createThrottle = (func, delay) => {
  let throttled = false;
  let savedArgs;
  let savedThis;

  return function wrapper(...args) {
    if (!throttled) {
      func.apply(this, args);
      throttled = true;
      setTimeout(() => (throttled = false), delay);
    } else {
      savedArgs = args;
      savedThis = this;
    }
  };
};


function createCursor({ paper, props, scaleingGroup, dataIDUnderCursor, projectedX, invertedX }) {
  // let p = new Path({
  //   segments: [[0, 0], [0, 200]],
  //   // pivot: [0, 0],
  //   // strokeColor: colors.n,
  //   strokeWidth: 0.5,
  //   strokeCap: 'round',
  //   // opacity: 0.3,
  //   locked: true,
  //   // selected: true,
  //   // parent: scaleingGroup,
  //   dashArray: [5,5],
  //   strokeScaling: false,
  //   strokeJoin: 'round',
  // })
  
  var circle = new Path.Circle({
    center: [200, 110],
    locked: true,
    // fillColor: 'yellow',
    radius: 3,
    parent: scaleingGroup,
  });
  

  watch(() => [projectedX.value], () => {
    // p.position.x = projectedX.value
    const pulsesPath = paper.project.activeLayer.children.pulsesPath
    // let intersection = pulsesPath.getIntersections(p)
    // circle.position = intersection[0]?.point
  })

  const intersection = computed(() => {
    const pulsesPath = paper.project.activeLayer.children.pulsesPath
    // let intersection = pulsesPath.getIntersections(p)
    return pulsesPath.getIntersections(p)
  })

  let arrowPath_ = new Path({
    segments: [[0, 0], [0, 6], [6, 3]],
    locked: true,
    // pivot: [6,0],
    // fillColor: 'white',
    strokeScaling: false,
    closed: true
  })
  
  const arrowDefinition = new paper.SymbolDefinition(arrowPath_);

  function createDimentionLine({ y, textDy=0 }) {
    let la = arrowDefinition.place()
    la.pivot = [3, 0]
    la.position.y = y
    la.parent = scaleingGroup
    la.rotate(180)
    la.locked = true
    
    let ra = arrowDefinition.place()
    ra.pivot = [3, 0]
    ra.position.y = y
    ra.parent = scaleingGroup
    ra.locked = true
    let l = new Path({
      segments: [[0, 0], [0, 0]],
      position: [0, y],
      strokeScaling: false,
      locked: true,
    })
    let t = new PointText({
      point: [0, 0],
      content: '0000',
      parent: scaleingGroup
    })
    function update(x1,x2,text='',_y=y) {
      la.position.x = x1
      la.data.x = x1
      ra.position.x = x2
      ra.data.x = x2
      l.segments[0].point.x = la.position.x
      l.segments[1].point.x = ra.position.x
      la.position.y = _y
      ra.position.y = _y
      l.position.y = _y
      t.position.x = x1 + (x2 - x1) / 2
      t.data.posX = t.position.x
      t.position.y = _y + textDy
      t.content = text
      updateLabelPosition()
    }
    function hide() {
      la.visible = false
      ra.visible = false
      l.visible = false
      t.visible = false
    }
    function show() {
      la.visible = true
      ra.visible = true
      l.visible = true
      t.visible = true
    }
    hide()

    function updateLabelPosition() {
      if (t.bounds.width > l.bounds.width) {
        hide()
        return
      }
      show()
      let v = paper.view
      t.position.x = t.data.posX
      if (t.bounds.left < v.bounds.left + 10 / props.tz.k) {
        let newLeft = v.bounds.left + 10 / props.tz.k
        // console.log(t.bounds.right, ra.bounds.right, t.position.x);
        if (t.bounds.width + newLeft > ra.bounds.left) {
          t.bounds.right = ra.bounds.left
          return
        }
        t.bounds.left = newLeft
      } else if (t.bounds.right > v.bounds.right - 10 / props.tz.k) {
        let newRight = v.bounds.right - 10 / props.tz.k
        if (newRight - t.bounds.width < la.bounds.right) {
          t.bounds.left = la.bounds.right
          return
        }
        t.bounds.right = newRight
      }
    }

    watch(props.tz, () => {
      updateLabelPosition()
    })
    watchEffect(() => {
      let color = new paper.Color(colors.bc)
      arrowPath_.fillColor = color
      l.strokeColor = color
      t.fillColor = color
      // la.fillColor = colors.a
      // circle.fillColor = colors.a
    })
    
    return { la, ra, l, update, show, hide }
  }

  const pulsesPath = paper.project.activeLayer.children.pulsesPath

  let topLine = createDimentionLine({y: 40, textDy: -10})
  let bottomLine = createDimentionLine({y: 160, textDy: 10})

  // watchEffect(() => {
  //   p.strokeColor = colors.bc
  //   circle.fillColor = colors.a
  // })

  // watch(dataIDUnderCursor, () => {
  //   // console.log(dataIDUnderCursor.value);
  //   if (!dataIDUnderCursor.value) {
  //     topLine.hide()
  //     bottomLine.hide()
  //     return
  //   }
  //   topLine.show()
  //   bottomLine.show()
  //   let d = props.data[dataIDUnderCursor.value - 1]
  //   let d2 = props.data[dataIDUnderCursor.value]
  //   topLine.update(props.xScaleOrigin.value(d?.time), props.xScaleOrigin.value(d?.time + d?.width), d.width.toFixed())
  //   if (!d2) return
  //   bottomLine.update(props.xScaleOrigin.value(d?.time), props.xScaleOrigin.value(d?.time + d?.width + d2?.width), (d.width + d2.width).toFixed())

  //   return
  // })
  


  
  
}

function createTestsShapes({paper, props, scaleingGroup}) {
  let xx = props.xScaleOrigin.value(props.data[400].time)

  var circle = new Path.Circle({
    center: [xx, 110],
    fillColor: 'red',
    radius: 3
  });
  var circle2 = new Path.Circle({
    center: [xx, 110],
    fillColor: 'skyblue',
    radius: 13
  });

  let p = new Path({
    segments: [[20, 20], [80, 80], [140, 20]],
    pivot: [20, 20],
    strokeColor: 'red',
    strokeWidth: 20,
    strokeCap: 'round',
    selected: true,
    parent: scaleingGroup,
    strokeScaling: false,
    strokeJoin: 'round',
  })

  p.position.x = xx


  // watch(() => [props.tz.x], () => {
  //   nextTick(() => {
  //     console.log(123123);
  //     p.lastSegment.point.x = paper.view.viewToProject(props.mouse.elementX.value).x
  //     p.segments[1].point.x = (p.lastSegment.point.x - p.firstSegment.point.x) / 2 + p.segments[0].point.x
  //     p.smooth({ type: 'continuous' })
  //   })
  // })

  // watch(() => [props.mouse.elementX.value, props.tz.k], () => {
  watch(() => [props.mouse.elementX.value, props.tz.k], () => {
    // let x = e.point.x
    // console.log((e.point.x + tz.x) / tz.k );
    // circle2.position.x = props.mouse.elementX.value / props.tz.k
    nextTick(() => {
      let x = paper.view.viewToProject(props.mouse.elementX.value).x
      circle2.position.x = x
      p.lastSegment.point.x = x
      p.segments[1].point.x = (p.lastSegment.point.x - p.firstSegment.point.x) / 2 + p.segments[0].point.x
      p.smooth({ type: 'continuous' })
    })

    // p.needsUpdate = true
    // console.log(p.segments);
    // circle2.position.x = paper.view.projectToView(props.mouse.elementX.value).x
    // circle2.needsUpdate = true
    // console.log(paper.view.viewToProject(e.point));
    // console.log(123);
    // paper.view.update()
    // console.log(paper.view.requestUpdate);
  })  
  
  return {
    circle, circle2
  }
}

function createTicks({ paper, store, scaleingGroup }) {
  
  const ticksGroup = new paper.Group({locked: true})

  let ticks = []

  function generateTicks(ticks_) {
    // console.log({ticks_});
    ticks = [...ticks_]
    ticksGroup.removeChildren()
    // ticksGroup.sendToBack()
    // console.log(paper);

    // scaleingGroup.addChild(ticksGroup)
    nextTick(() => {
      ticks_.forEach((t) => {
        let x = store.xScale(t)
        let tt = new paper.PointText({
          // pivot: [x, 0],
          point: [paper.view.viewToProject(x).x, 10],
          visible: true,
          content: `${t / 1000}ms`,
          data: t,
          fillColor: colors.bc,
          justification: 'center',
          // fontFamily: 'Mono',
          // fontWeight: 'bold',
          fontSize: 12,
          parent: ticksGroup
        })
        tt.scale(1 / store.tz.k, 1)
        new paper.Path.Line({
          from: [paper.view.viewToProject(x).x, 15],
          to: [paper.view.viewToProject(x).x, 200],
          // pivot: [paper.view.viewToProject(x).x, 0],
          dashArray: [4, 4],
          opacity: 0.3,
          strokeScaling: false,
          strokeColor: colors.bc,
          parent: ticksGroup
        })
        // g.addChild(tt)
        // ticksGroup.addChild(tt)
      })
    })
  }

  watchEffect(() => {
    let color = new paper.Color(colors.bc)
    ticksGroup.children.forEach((t) => {
      t.fillColor = color
    })
  })

  // console.log(store.xScale.ticks());

  let computedTicks = computed(() => store.xScale.ticks(3))
  
  // watch(store.state.wrapperBounds.width, () => {
  //   // console.log('wrapperBounds.width changed');
  //   // // ticksGroup.fitBounds(paper.view.bounds)
  //   // setTimeout(() => {
  //   //   console.log(props.xScale.ticks(3), props.xScaleOrigin.value.ticks(3));
  //   //   generateTicks(props.xScale.ticks(3))
  //   // }, 1000)
  // })

  // watch(props.xScale, () => {
  //   console.log('xScale changed', props.xScale.ticks(3));
  // })
  
  watch(store.tz, () => {
    // let x = tickFormat("~s")
    // console.log(xScale.tickFormat(0, 1, 20));
    
    // console.log('TICKS');
    if (ticks.toString() === computedTicks.value.toString()) {
      // console.log('tickz changed');
      nextTick(() => {
        ticksGroup.children.forEach((t) => {
          // let x = props.xScale(t.data)
          // t.point = [paper.view.viewToProject(x).x, 10]
          t.scaling.x = 1/store.tz.k
        })
      })
      return
    }

    // ticks = ticks_
    generateTicks(computedTicks.value)

    // paper.view.update()
    // console.log(xScale.ticks().map(d => xScale(d)));
    // console.log(xScale.format);
    // console.log(xScale.ticks().map(xScale.format("~s")))
  }, {immediate: true})
  return { ticksGroup }
}

function createWidthLabels({ paper, props, scaleingGroup }) {
  const texts = []
  props.data.forEach((d) => {
    let x = props.xScaleOrigin.value(d.time + d.width / 2)
    let t = new PointText({
      pivot: [0, 0],
      point: [x, 185],
      visible: false,
      content: d.width.toFixed(),
      fillColor: '#fff',
      justification: 'center',
      // fontFamily: 'Mono',
      // fontWeight: 'bold',
      fontSize: 12,
      data: d,
    })
    scaleingGroup.addChild(t)
    texts.push(t)
  })


  function updateData() {

    const w = paper.view.bounds.width

    let v = paper.view
    
    texts.forEach((t) => {
      let sw = props.xScaleOrigin.value(t.data.width)
      // console.log(t.bounds.left);
      if (t.bounds.width < sw * 0.75) {
        t.visible = true
      } else {
        t.visible = false
        return
      }
      if (t.bounds.right < v.bounds.left || t.bounds.left > v.bounds.right) {
        t.visible = false
      } else {
        t.visible = true
      }
    })
    
    v.update()
    // console.debug('visible texts count:', texts.filter(t => t.visible).length);
    // debouncedUpdateData()
  }
  const throttledUpdateWidthLabels = createThrottle(updateData, 50)
  // FIXME: remove debounced function
  const debouncedUpdateWidthLabels = createDebounce(updateData, 100)

  return {
    throttledUpdateWidthLabels, debouncedUpdateWidthLabels
  }
}

const papers = {}

function setup(store) {
  let paper

  const pulsesStore = usePulses()
  // console.log(pulsesStore);

  const { tz } = store
  // console.log(tz);
  papers[store.state.uuid] = new paperOrig.PaperScope()
  paper = papers[store.state.uuid]
  let m = new paper.Matrix()

  paper.setup(store.state.canvas)

  // var pulsesPath2 = new Path({
  //   name: "pulsesPath",
  //   pathData: props.genLine.value(props.data),
  //   strokeColor: 'lightblue',
  //   strokeWidth: 2,
  //   strokeScaling: false,
  // });

  const backgroundGroup = new paper.Group({ name: 'backgroundGroup'})
  
  let pulsesPath = new paper.Path({
    name: "pulsesPath",
    strokeColor: new paper.Color(colors.p),
    strokeWidth: 1,
    locked: true,
    strokeScaling: false,
  })
  // console.log(store.xScale);
  watch(() => [store.state.wrapperBounds.width, pulsesStore.maxSumWithOffset, store.xScale], () => {
    pulsesPath.removeSegments()
    // console.log(store.state.data);
    store.state.data.forEach((d) => {
      pulsesPath.add(new paper.Point(store.xScaleOrigin(d.time), d.level ? 150 : 50))
      pulsesPath.add(new paper.Point(store.xScaleOrigin(d.time+d.width), d.level ? 150 : 50))
    })
  },{ immediate: true })


  watchEffect(() => {
    pulsesPath.strokeColor = new paper.Color(colors.p)
  })
  
  
  let scaleingGroup = new paper.Group({locked: true})

  // createMeasurement({ props, scaleingGroup, backgroundGroup })
  // const { setupMeasurements, measurements } = useMeasurements()
  ////////////////////////////////////
  // const { measurements, createMeasurement } = useMeasurements({ props, scaleingGroup, backgroundGroup })
  // createMeasurement(100,100, 's')
  // createMeasurement(300,100, 'a')
  ////////////////////////////////////
  // const um2 = useMeasurements({LAS: 1223})
  // setupMeasurements()
  // um2.setupMeasurements({ props, scaleingGroup, backgroundGroup: null })

  // paper.view.autoUpdate = false
  // console.log(paper.project);
  // Your Paper.js drawing code goes here
  // let xx = props.xScaleOrigin.value(props.data[400].time)
  // var circle = new Path.Circle(new Point(xx, 100), 3, { fillColor : 'red' });
  // var circle = new Path.Circle({
  //   center: [xx, 110],
  //   fillColor: 'red',
  //   radius: 3
  // });
  // const { circle, circle2 } = createTestsShapes({ paper, props, scaleingGroup })
  const { ticksGroup } = createTicks({ paper, store, scaleingGroup })
  // var circle2 = new Path.Circle(new Point(xx, 100), 3);
  // circle.fillColor = 'red';
  // circle.pivot = [xx, 0]
  // circle2.fillColor = 'green';
  // circle.onFrame = function() {
  //   circle.scaling.x = 1/tz.k
  //   // console.log('frame', this.scaling.x = 1/this.scaling.x);
  //   // console.log(circle.scaling.x = 1);
  // }

  // const d = props.genLine.value(props.data)



  // createCursor({ paper, props, scaleingGroup, dataIDUnderCursor, projectedX, invertedX })
  


  // const { throttledUpdateWidthLabels, debouncedUpdateWidthLabels } = createWidthLabels({paper, props, scaleingGroup})
  watch(store.tz, (p, n) => {
    // console.log(tz);
    let v = paper.view

    v.scaling.x = tz.k
    v.center = new paper.Point(-tz.x / tz.k + v.bounds.width / 2, v.center.y)

    // v.update()
    
    scaleingGroup.getItems().forEach((item) => {
      item.scale(m.a / tz.k, 1)
    })
    m.a = tz.k
    // throttledUpdateWidthLabels()
    // debouncedUpdateWidthLabels()
  }, { immediate: true })


}

export default (store) => {
  // const store = useStore()
  // console.log(store.state.uuid);
  // const projectedX = computed(() => {
  //   // console.log(paper);
  //   if (store.state.mouse.isOutside.value) return null
  //   return paper?.view?.viewToProject(store.state.mouse.elementX.value).x || 0
  // })
  
  // const invertedX = computed(() => props.xScaleOrigin.value.invert(projectedX.value))

  // const dataIDUnderCursor = computedEager(() => {
  //   if (store.state.mouse.isOutside.value) return null
  //   let id = bisector((d) => d.time).right(props.data, invertedX.value)
  //   return id
  // })
  // watchEffect(() => {
  //   console.log(dataIDUnderCursor.value);
  // })

  // let measurements = reactive([])
  // let createMeasurement = function(){}
  // const { measurements, createMeasurement } = useMeasurements({ props, scaleingGroup, backgroundGroup })
  // createMeasurement(100, 100, 's')
  // createMeasurement(300, 100, 'a')

  
  onMounted(() => {
    nextTick(() => {
      // setup(store, { dataIDUnderCursor, projectedX, invertedX })
      setup(store)
      // Object.assign(measurements, setupResult.measurements)
    })
  })

  return {
    // paper,
    // measurements,
    // createMeasurement,
  }
}