import { reactive } from "vue";
import { colors } from "../../stores/colors.js";
import paper, { Color, Group, Path, Point, PointText, Rect } from 'paper/dist/paper-core'

var hitOptions = {
  // segments: false,
  stroke: true,
  fill: true,
  // curves: true,
  // 'handle-in': true,
  // fill: false,
  // tolerance: 5
};

function setupEvents({ props, scaleingGroup, backgroundGroup }, measurements) {
  // console.log(props);
  function getCurrentMeasurement(hitResult) {
    // console.log(hitResult);
    if (!hitResult) return null
    if (hitResult.type == 'fill') {
      return measurements.find(m => m.group.id === hitResult.item.parent.id )
    }
    if (hitResult.type == 'stroke') {
      return measurements.find(m => m.group.id === hitResult.item.parent.id )
    }
    return null
  }

  let hitResult = null
  let currMeasurement = null
  let curve = null
  // const curves = computed(() => {
  //   console.log(measurements, 'curves');
  //   return {}
  // })
  // watchEffect(() => {
  //   console.log('curves', curves.value);
  // })

  paper.view.onKeyDown = function (e) {
    if (e.key !== 'alt') return
    hitOptions.tolerance = 3 / props.tz.k
    let x = props.mouse.elementX.value
    let y = props.mouse.elementY.value
    hitResult = paper.project.hitTest(paper.view.viewToProject([x, y]), hitOptions)

    if (!hitResult) {
      paper.view.element.style.cursor = 'default'
      currMeasurement = null
      return
    } else if (hitResult.type === 'fill' && e.key === 'alt') {
      currMeasurement = getCurrentMeasurement(hitResult)
      paper.view.element.style.cursor = 'move'
    } else if (hitResult.type === 'stroke') {
      paper.view.element.style.cursor = 'ew-resize'
    } 
  }

  paper.view.onKeyUp = function (e) {
    hitOptions.tolerance = 3 / props.tz.k
    let x = props.mouse.elementX.value
    let y = props.mouse.elementY.value
    hitResult = paper.project.hitTest(paper.view.viewToProject([x, y]), hitOptions)
    if (hitResult && hitResult.type === 'fill')
      paper.view.element.style.cursor = 'default'
    // currMeasurement = null
  }

  paper.view.onMouseMove = function (e) {
    // console.log(e);
    hitOptions.tolerance = 3 / props.tz.k
    hitResult = paper.project.hitTest(e.point, hitOptions)
    // console.log(hitResult);
    paper.view.element.style.cursor = 'default'
    if (!hitResult) {
      paper.view.element.style.cursor = 'default'
      return
    }
    props.gestures.state.drag.cancel()
    props.gestures.state.wheel.cancel()
    // rect.opacity = 0.3
    curve = null
    if (hitResult.location?.curve && hitResult.location?.curve.isVertical()) {
      curve = hitResult.location.curve
    }
    if (hitResult.segment?.curve && hitResult.segment?.curve.isVertical()) {
      curve = hitResult.segment.location.curve
    }
    if (curve) {
      paper.view.element.style.cursor = 'ew-resize'
      currMeasurement = getCurrentMeasurement(hitResult)
      // console.log(currMeasurement);
      // return
    }
    else if (hitResult.type === 'fill' && e.modifiers.alt) {
      // rect.opacity = 0.4
      // console.log(hitResult, measurements);
      currMeasurement = getCurrentMeasurement(hitResult)
      paper.view.element.style.cursor = 'move'
      return
      // } else if (hitResult.type === 'stroke' && curve) {
      // rect.fillColor = 'rgba(0,0,0,0.0001)'
    } else {
      currMeasurement = null
      paper.view.element.style.cursor = 'normal'
    }
  }

  // const [curveLeft, curveRight] = [rect.curves[0], rect.curves[2]]
  
  let creatingNewMeasurement = false
  let newMeasurement = null
  
  paper.view.onMouseDown = function (e) {
    creatingNewMeasurement = false
    if (e.modifiers.shift) {
      props.gestures.state.drag.cancel()
      props.gestures.state.wheel.cancel()
      
      creatingNewMeasurement = true
      newMeasurement = createMeasurement.call({ props, measurements, scaleingGroup, backgroundGroup }, e.point.x, e.point.x+1, 'p')
      
      return
    }
  }

  paper.view.onMouseDrag = function (e) {
    // console.log({creatingNewMeasurement});
    if (e.modifiers.shift && creatingNewMeasurement) {
      // console.log('shift')
      props.gestures.state.drag.cancel()
      props.gestures.state.wheel.cancel()

      return
    }
    if (!hitResult || !currMeasurement) return
    if (hitResult.type === 'fill' ) {
      paper.view.element.style.cursor = 'move'
      props.gestures.state.drag.cancel()
      props.gestures.state.wheel.cancel()
      currMeasurement.move(e.delta.x)
      // console.log(currMeasurement);
      // currMeasurement.group.rect.position.x += e.delta.x
      
    }
    if (hitResult.type === 'stroke') {
      props.gestures.state.drag.cancel()
      props.gestures.state.wheel.cancel()
      currMeasurement.resize(e.delta.x, curve, e.modifiers.alt)
    }
    return
    if (hitResult && hitResult.type === 'fill' && e.modifiers.alt) {
      props.gestures.state.drag.cancel()
      hitResult.item.position.x += e.delta.x
      return
    }
    if (curve && hitResult && hitResult.type === 'stroke') {
      props.gestures.state.drag.cancel()
      console.log(measurements);
      if (e.modifiers.alt) {
        if (curve === curveLeft) {
          curveRight.point1.x -= e.delta.x
          curveRight.point2.x -= e.delta.x
        } else if (curve === curveRight) {
          curveLeft.point1.x -= e.delta.x
          curveLeft.point2.x -= e.delta.x
        }
      }
      curve.point1.x += e.delta.x
      curve.point2.x += e.delta.x
      crect.bounds = rect.bounds.clone()
      return
    }
  }  
}

function createMeasurementState(x1,x2,c, { props }) {
  const { tz, xScale, xScaleOrigin } = props
  const state = reactive({
    x1,x2,c,
    selected: false,
  })
  const getters = {
    x1Scaled: computed(() => xScaleOrigin.value.invert(state.x1)),
    x2Scaled: computed(() => xScaleOrigin.value.invert(state.x2)),
    xMin: computed(() => Math.min(getters.x1Scaled.value, getters.x2Scaled.value)),
    xMax: computed(() => Math.max(getters.x1Scaled.value, getters.x2Scaled.value)),
    dT: computed(() => getters.xMax.value - getters.xMin.value),
  }
  state.getters = getters
  return state
}

function createRasterStripes(props) {

  let rasterGroup = new paper.Group()
  // rrrg.parent = backgroundGroup
  // backgroundGroup.sendToBack()

  let size = 4
  var rasterSymbol = new paper.Raster({
    size: [size, size],
    smoothing: 'off',
    // parent: rasterGroup,
  });

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (j === i) {
        rasterSymbol.setPixel(i, j, new paper.Color('white'))
      }
      // rasterSymbol.setPixel(i, j, new paper.Color(0, 0, 255, 0.4));
    }
  }
  // rasterSymbol.scale(5)

  // return
  const definition = new paper.SymbolDefinition(rasterSymbol);

  // rasterSymbol.parent = scaleingGroup


  // console.log(props.wrapperBounds.width.value);
  for (let i = 0; i < props.wrapperBounds.width.value / size; i++) {
    for (let j = 0; j < 200 / size; j++) {
      let p = [i * size, j * size]
      // console.log(p);
      let instance = definition.place(p)
      instance.parent = rasterGroup
      // console.log(instance.parent);
    }
  }
  const raster = rasterGroup.rasterize()
  raster.locked = true
  rasterGroup.remove()
  return raster
}

// function createMeasurementFactory(props) {
//   return _createMeasurement.bind(props)
// }

function createMeasurement(x1,x2,c) {
  let color = colors[c]
  console.log('createMeasurement', x1, x2, color, this);
  const { props, measurements, scaleingGroup, backgroundGroup } = this
  // console.log('createMeasurement', x1, x2, color);

  const state = createMeasurementState(x1,x2,c, this)

  const g = new Group()
  g.parent = backgroundGroup
  
  const rect = new Path.Rectangle({
    point: [x1, 0],
    size: [x2, 200],
    // fillColor: 'rgba(0,0,0,0.1)',
    fillColor: new Color(colors[c]),
    strokeColor: 'rgba(0,0,0,0.001)',
    strokeWidth: 1,
    strokeScaling: false,
    parent: g,
    // strokeCap: 'round',
    // strokeJoin: 'round',
  })
  rect.fillColor.alpha = 0.2
  // const rasterStripesGroup = new Group()
  // rasterStripesGroup.parent = g

  const rasterStripes = createRasterStripes(props)
  rasterStripes.parent = g
  rasterStripes.blendMode = 'destination-in'

  watch(props.tz, () => {
    nextTick(() => {
      rasterStripes.scaling.x = 1 / props.tz.k
      rasterStripes.bounds.left = paper.view.bounds.x
    })
  })
  
  const [curveLeft, curveRight] = [rect.curves[0], rect.curves[2]]

  function updateState() {
    state.x1 = curveLeft.point1.x
    state.x2 = curveRight.point2.x
    state.width = rect.bounds.width
  }
  updateState()


  function resize(dx, curve, alt) {
    // console.log(dx, curve);
    if (alt) {
      if (curve === curveLeft) {
        curveRight.point1.x -= dx
        curveRight.point2.x -= dx
      } else if (curve === curveRight) {
        curveLeft.point1.x -= dx
        curveLeft.point2.x -= dx
      }
    }
    curve.point1.x += dx
    curve.point2.x += dx
    updateState()
  }

  function move(dx) {
    // console.log(dx);
    rect.position.x += dx
    updateState()
  }
  
  const obj = {
    state,
    group: g,
    curveLeft, curveRight,
    move, resize,
  }
  measurements.push(obj)
  return obj
}

export default (props) => {
  const measurements = reactive([])
  
  onMounted(() => {
    setupEvents(props, measurements)
  })
  
  return {
    measurements,
    createMeasurement: createMeasurement.bind({...props, measurements})
  }
}