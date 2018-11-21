d3.json ("data.json").get(function(error, data){
  console.log(data)

  width = 900;
  height = 900;

// change type to object
const links = data.links.map(d => Object.create(d));
const nodes = data.nodes.map(d => Object.create(d));

//assign random position to each node
  nodes.forEach((d)=> {

    d.x = Math.random() * width
    d.y = Math.random() * height
    d.disp = [0, 0]

    return d
  })

 t = 80

 var iteration = 10000;

 var color = d3.scaleOrdinal(d3.schemeCategory10);

 k = Math.sqrt(width * height / nodes.length)

 var attractive = function(d, k) {return (x*x)/2}

 var repulsive = function(d, k) {return (Math.pow(k, 2)) / x}


 for (var i = 0; i < iteration; i++){

     // console.log(i)

     nodes.forEach((d)=>{

       calculateDispByRepulsive(d)

     })

    for (e in links){

      calculateDispByAttractive(links[e]);

    }

    nodes.forEach((d)=> {

       updatePosition(d)

     })

     cool();
     // console.log(i)



  }


  // console.log(links, nodes)


  const svg = d3.select('body').append('svg').attr("width", "100%").attr("height", "100%")
                 // .attr("viewBox", [-width/2, -height / 2, width, height]);

  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", d => Math.sqrt(d.value))
      .attr("x1", d => {return nodes[obtainNodeIndex(d.source)].x})
      .attr("y1", d => {return nodes[obtainNodeIndex(d.source)].y})
      .attr("x2", d => {return nodes[obtainNodeIndex(d.target)].x})
      .attr("y2", d => {return nodes[obtainNodeIndex(d.target)].y})
      .attr("stroke", (d)=> {return color(d.target)})

  const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group)})
      .attr("cx", (d)=> { return d.x})
      .attr("cy", (d)=> { return d.y})
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))


  // ticked()

  node.append("title")
      .html(d => {return d.id})


  function dragstarted(d) {

    if (!d3.event.active)
       d.fx = d.x;
       d.fy = d.y;
  }

  function dragged(d) {
      d.x = d3.event.x, d.y = d3.event.y;
      d3.select(this).attr("cx", d.x).attr("cy", d.y);

      link.filter(function(l) { return l.source === d.id; }).attr("x1", d.x).attr("y1", d.y);
      link.filter(function(l) { return l.target === d.id; }).attr("x2", d.x).attr("y2", d.y);

      nodes.forEach((n)=> {
        if (n.id != d.id) updatePosition(n)
      })

      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)

      link
        .attr("x1", d => {return nodes[obtainNodeIndex(d.source)].x})
        .attr("y1", d => {return nodes[obtainNodeIndex(d.source)].y})
        .attr("x2", d => {return nodes[obtainNodeIndex(d.target)].x})
        .attr("y2", d => {return nodes[obtainNodeIndex(d.target)].y})

  }

  function dragended(d) {
      if (!d3.event.active)
          d.fx = null;
          d.fy = null;
      d3.select(this).classed("active", false);
  }

  // function ticked() {
  //
  //   link
  //       .attr("x1", d => d.source.x)
  //       .attr("y1", d => d.source.y)
  //       .attr("x2", d => d.target.x)
  //       .attr("y2", d => d.target.y);
  //
  //   node
  //       .attr("cx", d => d.x)
  //       .attr("cy", d => d.y);
  // }




// calculate repulsive force between each node and every other node

  function calculateDelta(d, v) {
      // console.log(d, v)
      arr = []
      arr[0] = d.x - v.x;
      arr[1] = d.y - v.y;
      return arr
  }

  function norm2D (arr){
    var sum =0;
    for (var i=0; i< arr.length; i++){
      sum += Math.pow(arr[i], 2)
    }
    return Math.sqrt(sum)
  }

  function div(delta, norm){
    var arr = []

    for (var i=0; i < delta.length; i++){
        arr[i] = delta[i] / norm
    }
    return arr
  }

  function multi(array, num){
    var arr = []

    for (var i=0; i < array.length; i++){
        arr[i] = array[i] * num
    }
    return arr

  }

 function add (arr1, arr2){

   var arr  = []

   for (var i=0; i < arr1.length; i++){
      arr[i] = arr1[i] + arr2[i]
   }
   return arr
 }

 function sub (arr1, arr2){

   var arr  = []

   for (var i=0; i < arr1.length; i++){
      arr[i] = arr1[i] - arr2[i]
   }
   return arr
 }

 function obtainNodeIndex(n){

   index = nodes.findIndex((d)=>d.id == n)

   return index
 }


  function calculateDispByRepulsive(v){

    nodes.forEach((d)=> {
      if(d.id != v.id){
        var delta = calculateDelta(v, d)
        var norm = norm2D(delta)
        if(norm != 0){
           v.disp = add (v.disp, multi(div(delta, norm), repulsive(norm)))
        }
      }
    })
  }

  //attractive force between linked nodes
  function calculateDispByAttractive(edge) {
   // console.log(edge)
    var sourceIdx = obtainNodeIndex(edge.source)
    var targetIdx = obtainNodeIndex(edge.target)
   // console.log(sourceIdx, targetIdx)
    var delta = calculateDelta(nodes[sourceIdx], nodes[targetIdx])

    var norm = norm2D(delta)

    if (norm != 0){
        nodes[sourceIdx].disp = sub(nodes[sourceIdx].disp, multi(div(delta, norm), attractive(norm)))
        nodes[targetIdx].disp = add(nodes[targetIdx].disp, multi(div(delta, norm), attractive(norm)))
    }
    // nodes.forEach((d)=> console.log(d))
  }

  // update position
  function updatePosition(n){

      var disp = norm2D(n.disp)

      if(disp != 0){

        //var abs_disp = Math.abs(n.disp[0]/n.disp[1])
        var temp =  multi(div(n.disp, norm2D(n.disp)), Math.min(norm2D(n.disp), t))
        n.x += temp[0]
        n.y += temp[1]
        x = Math.min(width/2, Math.max(-(width/2), n.x))
        y = Math.min(height/2, Math.max(-(height/2), n.y))

        n.x = Math.min(Math.sqrt(width*width/4-y*y),Math.max(-Math.sqrt(width*width/4-y*y),x)) + width/2
        n.y = Math.min(Math.sqrt(height*height/4-x*x),Math.max(-Math.sqrt(height*height/4-x*x),y)) + height/2

  }
}

  function cool() {

    t -= t/(iteration + 1)

  }


})
