import { arc, pie } from 'd3-shape'

export default (props) => {
  let pies = pie()(props.days.map(d => 1))
  // console.log(p);
  let arcs = pies.map((d,i) => {
    return arc()({
      innerRadius: 0,
      outerRadius: 20,
      startAngle: d.startAngle,
      endAngle: d.endAngle
    })
  })
  // log arcs
  
  // console.log(arcs);
  return h('svg', {
    viewBox: '-20,-20,40,40',
    height: '100%', width: '100%'
    },
    arcs.map((d,i) => {
      return h('path',{
        fill: props.colors[props.days[i]],
        // stroke: 'red',
        d: d
      })
    })
    // h('path', {
    //   fill: 'red',
    //   d: arcs[0]
    // })
  )
}