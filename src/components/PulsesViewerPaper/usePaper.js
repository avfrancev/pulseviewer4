import paper, { Group, Path, Point, PointText, Rect } from 'paper/dist/paper-core'
import { nextTick } from 'vue';

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
  const { circle, circle2 } = createTestsShapes({ paper, props, scaleingGroup })
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

  const d = props.genLine.value(props.data)
  // console.log(paper.project.importSVG(d));
  var path = new Path(d);
  // path.importSVG(d);
  path.fillColor = 'transparent'; // Set fill color
  path.strokeColor = 'lightblue'; // Set stroke color
  path.strokeWidth = 2; // Set stroke width
  path.strokeScaling = false


  // let p1 = new Path([[xx, 100], [xx + 100, 100]])
  // p1.strokeColor = 'pink'; // Set stroke color
  // var text = new paper.PointText({
  //   // applyMatrix: false,
  //   // justification: 'center',
  //   pivot: [0, 0],
  //   selected: true,
  //   point: [xx, 100],
  //   content: 'The contents of the point text',
  //   fillColor: '#fff',
  //   // fontFamily: 'Courier New',
  //   fontWeight: 'bold',
  //   fontSize: 15,
  // });

  // // Add the path to the project
  // paper.project.activeLayer.addChild(path);

  // let g = new Group()
  // scaleingGroup.addChildren([circle, circle2, text])
  // g.addChild(circle2)
  // g.addChild(text)
  // g.addChild(path)

  ////////////////
  // let tg = new Group()
  // function aaa(e) {
  //   console.log(1232);
  // }
  // props.data.forEach((d) => {
  //   const debouncedDoSomething = debounce(aaa, 400)
  //   let px = xScaleOrigin.value(d.time)
  //   let t = new PointText({
  //     pivot: [0, 0],
  //     point: [px, 180],
  //     visible: false,
  //     content: px,
  //     fillColor: '#fff',
  //     // fontFamily: 'Courier New',
  //     fontWeight: 'bold',
  //     fontSize: 15,
  //     onFrame: debounce(aaa, 100)
  //     // onFrame: () => {
  //     //   console.log(t.position);
  //     //   if (t.bounds.x / tz.k > 10) {
  //     //   }
  //     //   // if (t.bounds.width / tz.k > 10) {
  //     //   //   t.visible = false
  //     //   // } else {
  //     //   //   t.visible = true
  //     //   // }
  //     // }
  //   })
  //   g.addChild(t)
  // })
  ////////////////



  // watch(mouse.x, () => {
  //   let al = paper.project.activeLayer
  //   console.log(al.localToGlobal(al.position));
  //   path._globalMatrix = null
  //   console.log(path.localToGlobal([mouse.elementX.value, 0]));
  //   console.log(al.parentToLocal([mouse.elementX.value, 0]));
  //   console.log(al.localToGlobal([mouse.elementX.value, 0]));
  //   console.log(al);
  // })

  // let al = paper.project.activeLayer
  // let al = paper.view
  // let view = paper.view
  // g.applyMatrix = false

  // const tool = new paper.Tool()
  // tool.onMouseMove = (e) => {
  //   // console.log(e.point);
  //   // let x = (e.point.x ) / tz.k - tz.x / tz.k
  //   // let x = e.point.x
  //   // // console.log((e.point.x + tz.x) / tz.k );
  //   // circle2.position.x = x
  //   // // console.log(paper.view.viewToProject(e.point));
  //   // paper.view.update()
  // }

  // path.onMouseMove = (e) => {
  //   // console.log(view.globalToLocal(e.point));
  //   console.log(e);
  // }

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

    console.log(w, tz.k);
    texts.forEach((t) => {
      // console.log(d);
      let sw = props.xScaleOrigin.value(t.data.width)

      if (t.bounds.width < sw * tz.k * 0.75) {
        t.visible = true
      } else {
        t.visible = false
        return
      }
      if (t.bounds.right < 0 || (t.bounds.left) > w) {
        t.visible = false
      } else {
        t.visible = true
      }
    })
    
    // console.debug('visible texts count:', texts.filter(t => t.visible).length);

  }

  
  
  const throttledUpdateData = createThrottle(updateData, 300)

  watch(tz, (p, n) => {
    let v = paper.view
    v.scaling.x = tz.k
    v.center = new Point(-tz.x / tz.k + v.bounds.width / 2, v.center.y)
    scaleingGroup.getItems().forEach((item) => {
      item.scale(m.a / tz.k, 1)
    })
    m.a = tz.k
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