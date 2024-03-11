const distance = (a, b) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const avg = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;


export default (addresses) => {
  // console.log(addresses[0].x);
  // let centroids = Array.from({ length: 5 }, (x, i) => {
  //   return {
  //     id: i,
  //     x: 0, y: 0,
  //   }
  // });

  let centroids = reactive(addresses.slice(0,5).map((d) => {
    return {
      x: unref(d.x),
      y: unref(d.y),
    }
  }))
  // console.log(centroids);

  const closestCentroid = (point) => {
    const distances = centroids.map(centroid => distance(point, centroid));
    const i = distances.findIndex(d => d === Math.min(...distances));
    return i;
  }

  const updatePoints = (points) => {
    points.forEach(point => {
      point.cluster = closestCentroid(point);
    });
  }

  updatePoints(addresses)


  const updateCentroids = (points) => {
    centroids.forEach((centroid, i) => {
      const cluster = points.filter(point => point.cluster === i);
      if (cluster.length > 0) {
        centroid.x = avg(cluster.map(point => point.x));
        centroid.y = avg(cluster.map(point => point.y));
      }
    });
    // centroidsSvg.transition().duration(500).attr('cx', d => x(d.x)).attr('cy', d => y(d.y));
  }
  
  let groupedAddresses
  
  const groupedAddressesByDays = ref({})
  
  
  const update = () => {
    updateCentroids(addresses)
    updatePoints(addresses)

    // groupedAddresses = addresses.reduce((groups, address) => {
    //   const clusterId = address.cluster;
    //   if (!groups[clusterId]) {
    //     groups[clusterId] = [];
    //   }
    //   groups[clusterId].push(address);
    //   return groups;
    // }, {});

    // console.log(addresses.gr);
    // console.log(l)
    // console.log(aaa);

    // let currentDay = 0;

    // console.log(groupedAddresses);
    
    addresses.forEach((addr) => {
      addr.days = []
      let visit_frequency = addr.visit_frequency
      let cluster = addr.cluster
      // console.log(cluster);
      addr.days.push(+cluster) 

      while (visit_frequency-- > 1) {
        // console.log(addr.address);
        let clusterGroup = Object.groupBy(addresses, (d) => d.cluster)
        let sortedGroup = Object.entries(clusterGroup).sort((a,b) => a[1].length - b[1].length)
        let c = 0, isInDays = false
        while(true) {
          isInDays = sortedGroup[c][1].includes(addr)
          // console.log(c, isInDays);
          // console.log(sortedGroup);
          // console.log(sortedGroup[c][1], isInDays, c);
          if (!isInDays) {
            // console.count('LALAL')
            addr.days.push(+sortedGroup[c][0]) 
            break
          }
          c++
        }
      }
    })

    const g = addresses.reduce((groups, address) => {
      let days = address.days
      // console.log(days);
      days.forEach((day, i) => {
        if (!groups[day]) {
          groups[day] = [];
        }
        // let a = {...address}
        let a = address
        a.iid = `${a.address}_${days[i]}`
        groups[day].push(a);
      })
      return groups;
    }, {})

    groupedAddressesByDays.value = g

    // console.log(addresses)
    return

  }
  // updateCentroids(centroids, addresses)
  // updatePoints(data)
  return {
    centroids,
    updatePoints,
    updateCentroids,
    updateKMean: update,
    groupedAddressesByDays,
  }
}