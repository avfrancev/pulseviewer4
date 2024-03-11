import paper, { Group, Path, Point, PointText, Rect } from 'paper/dist/paper-core'
import { nextTick } from 'vue';


const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
}

function throttle(func, ms) {

  let isThrottled = false,
    savedArgs,
    savedThis;

  function wrapper() {

    if (isThrottled) { // (2)
      savedArgs = arguments;
      savedThis = this;
      return;
    }

    func.apply(this, arguments); // (1)

    isThrottled = true;

    setTimeout(function () {
      isThrottled = false; // (3)
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper;
}

function setup(props) {
  const { tz } = props
  paper.setup(props.canvas.value)
  // paper.view.autoUpdate = false
  // console.log(paper.project);
  // Your Paper.js drawing code goes here
  let xx = props.xScaleOrigin.value(props.data[400].time)
  var circle = new Path.Circle(new Point(xx, 100), 3);
  var circle2 = new Path.Circle(new Point(xx, 100), 3);
  circle.fillColor = 'red';
  circle2.fillColor = 'green';
  // circle.onFrame = function() {
  //   circle.scaling.x = tz.k
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


  let p1 = new Path([[xx, 100], [xx + 100, 100]])
  p1.strokeColor = 'pink'; // Set stroke color
  var text = new paper.PointText({
    // applyMatrix: false,
    // justification: 'center',
    pivot: [0, 0],
    selected: true,
    point: [xx, 100],
    content: 'The contents of the point text',
    fillColor: '#fff',
    // fontFamily: 'Courier New',
    fontWeight: 'bold',
    fontSize: 15,
  });

  // Add the path to the project
  paper.project.activeLayer.addChild(path);

  let g = new Group()
  g.addChildren([circle, circle2, text])
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

  let m = new paper.Matrix()


  // watch(mouse.x, () => {
  //   let al = paper.project.activeLayer
  //   console.log(al.localToGlobal(al.position));
  //   path._globalMatrix = null
  //   console.log(path.localToGlobal([mouse.elementX.value, 0]));
  //   console.log(al.parentToLocal([mouse.elementX.value, 0]));
  //   console.log(al.localToGlobal([mouse.elementX.value, 0]));
  //   console.log(al);
  // })

  let al = paper.project.activeLayer
  // let al = paper.view
  let view = paper.view
  // g.applyMatrix = false

  const tool = new paper.Tool()
  tool.onMouseMove = (e) => {
    // console.log(e.point);
    // let x = (e.point.x ) / tz.k - tz.x / tz.k
    // let x = e.point.x
    // // console.log((e.point.x + tz.x) / tz.k );
    // circle2.position.x = x
    // // console.log(paper.view.viewToProject(e.point));
    // paper.view.update()
  }

  watch(props.mouse.elementX, () => {
    // let x = e.point.x
    // console.log((e.point.x + tz.x) / tz.k );
    circle2.position.x = props.mouse.elementX.value
    circle2.needsUpdate = true
    // console.log(paper.view.viewToProject(e.point));
    // console.log(123);
    // paper.view.update()
    // console.log(paper.view.requestUpdate);
  })
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
    g.addChild(t)
    texts.push(t)
  })
  

  function updateData() {

    const w = paper.view.bounds.width

  
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
  
  const ticksGroup = new Group()
  g.addChild(ticksGroup)
  
  watchEffect(() => {
    // let x = tickFormat("~s")
    // console.log(xScale.value.tickFormat(0, 1, 20));
    // console.log(123);
    
    let ticks = props.xScale.value.ticks()
    ticksGroup.removeChildren()
    
    ticks.forEach((t) => {
      let x = props.xScale.value(t)
      let tt = new PointText({
        pivot: [0, 0],
        point: [x, 10],
        visible: true,
        content: `${t/1000}ms`,
        fillColor: '#fff',
        justification: 'center',
        // fontFamily: 'Mono',
        // fontWeight: 'bold',
        fontSize: 12,
      })
      g.addChild(tt)
      ticksGroup.addChild(tt)
    })
    // paper.view.update()
    // console.log(xScale.value.ticks().map(d => xScale.value(d)));
    // console.log(xScale.value.format);
    // console.log(xScale.value.ticks().map(xScale.value.format("~s")))
  })
  
  
  const throttledUpdateData = throttle(updateData, 300)

  watch(tz, (p, n) => {
    g.getItems().forEach((item) => {
      item.scaling.x = m.a / tz.k
    })
    throttledUpdateData()  
    al.bounds.x = tz.x
    al.scale(tz.k / m.a, 1, [tz.x, 0])
    m.a = tz.k
    // console.log(g.getItems());
    // circle.scaling.x = m.a / tz.k
    // circle2.scaling.x = m.a / tz.k
    ///////////////
    // view.center = [tz.x,0]
    // view.matrix.tx = tz.x
    // // view.update()
    // // console.log(view);
    // // view.scaling.x = tz.k
    // view.scale(tz.k/m.a, 1, [0 ,0])
    // g.scaling.x = tz.k / m.a
    // // console.log(view.center.x);
    // // view.x = tz.x
    // m.a = tz.k
    // paper.view.update()

  })
  // paper.view.update()

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