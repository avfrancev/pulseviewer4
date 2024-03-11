import paper, { Group, Path, Point, PointText, Rect } from 'paper/dist/paper-core'
import { nextTick } from 'vue';

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

function createTicks({ paper, props, scaleingGroup }) {
    
  const ticksGroup = new Group()

  let ticks = []
  // watchEffect( () => {
  //   // console.log(tickz.value.toString());
  //   let tickz_ = props.xScale.value.ticks()
  //   if (tickz.value.toString() !== tickz_.toString()) {
  //     // console.log('tickz changed');
  //     tickz.value = tickz_
  //   }
  // })
  // scaleingGroup.addChild(ticksGroup)
  
  watchEffect(() => {
    // let x = tickFormat("~s")
    // console.log(xScale.value.tickFormat(0, 1, 20));
    // console.log(123);
    
    let ticks_ = props.xScale.value.ticks(3)
    if (ticks.toString() === ticks_.toString()) {
      // console.log('tickz changed');
      ticksGroup.children.forEach((t) => {
        t.scaling.x = 1/props.tz.k
      })
      return
    }

    ticks = ticks_
    ticksGroup.removeChildren()
    // scaleingGroup.addChild(ticksGroup)
    nextTick(() => {
    ticks.forEach((t) => {
      let x = props.xScale.value(t)
      let tt = new PointText({
        // pivot: [x, 0],
        point: [paper.view.viewToProject(x).x, 10],
        visible: true,
        content: `${t/1000}ms`,
        fillColor: '#fff',
        justification: 'center',
        // fontFamily: 'Mono',
        // fontWeight: 'bold',
        fontSize: 12,
        parent: ticksGroup
      })
      tt.scale(1/props.tz.k, 1)
      // g.addChild(tt)
      // ticksGroup.addChild(tt)
    })
    })

    // paper.view.update()
    // console.log(xScale.value.ticks().map(d => xScale.value(d)));
    // console.log(xScale.value.format);
    // console.log(xScale.value.ticks().map(xScale.value.format("~s")))
  })
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

function setup(props) {
  const { tz } = props
  let m = new paper.Matrix()

  paper.setup(props.canvas.value)

  let scaleingGroup = new Group()

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
  const { ticksGroup } = createTicks({ paper, props, scaleingGroup })
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

  var pulsesPath = new Path({
    pathData: props.genLine.value(props.data),
    strokeColor: 'lightblue',
    strokeWidth: 2,
    strokeScaling: false,
  });

  


  const { throttledUpdateWidthLabels, debouncedUpdateWidthLabels } = createWidthLabels({paper, props, scaleingGroup})

  watch(tz, (p, n) => {
    let v = paper.view

    v.scaling.x = tz.k
    v.center = new Point(-tz.x / tz.k + v.bounds.width / 2, v.center.y)

    // v.update()
    
    scaleingGroup.getItems().forEach((item) => {
      item.scale(m.a / tz.k, 1)
    })
    m.a = tz.k
    throttledUpdateWidthLabels()
    debouncedUpdateWidthLabels()
  })


}

export default (props) => {

  onMounted(() => {
    nextTick(() => {
      setup(props)
    })
  })

  return {
    paper
  }
}