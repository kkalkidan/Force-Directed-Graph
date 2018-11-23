d3.json ("data.json").get(function(error, data){
  console.log(data)

  var width = 800;
  var height = 800;

// change type to object
var links = data.links.map(d => Object.create(d));
var nodes = data.nodes.map(d => Object.create(d));



//assign random position to each node
  nodes.forEach((d)=> {

    d.x = Math.random() * width/2
    d.y = Math.random() * height/2
    d.disp = [0, 0]


  })



var t;
 var color = d3.scaleOrdinal(d3.schemeCategory10);

// attractive force
 var attractive = function(d, k) { return d*d/k }

// repulsive force
 var repulsive = function(d, k) { return k*k/d }


 var iteration =  500;


 var k = Math.sqrt(width * height / nodes.length)

 var t =  width/10




function Iter(iteration) {


   for (var i = 0; i < iteration; i++){

       // console.log(i)
       nodes.forEach((n)=>
       {
         n.disp = [0,0]
       })

       nodes.forEach((d)=>{

         calculateDispByRepulsive(d)

       })

      for (e in links){

        calculateDispByAttractive(links[e]);

      }


      nodes.forEach((d)=> {

         updatePosition(d)


       })

     t -= t/(iteration+1)

    }

}

  const svg = d3.select('body').append('svg').attr("width", "100%").attr("height", "100%")
                 // .attr("viewBox", [-width/2, -height / 2, width, height]);

  var link = svg.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", d => Math.sqrt(d.value))
      .attr("x1", d => {return nodes[obtainNodeIndex(d.source)].x})
      .attr("y1", d => {return nodes[obtainNodeIndex(d.source)].y})
      .attr("x2", d => {return nodes[obtainNodeIndex(d.target)].x})
      .attr("y2", d => {return nodes[obtainNodeIndex(d.target)].y})
      .attr("stroke", "#777")

  var node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 7)
      .attr("fill", function(d) { return color(d.group)})
      .attr("cx", (d)=> { return d.x})
      .attr("cy", (d)=> { return d.y})
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))



  Iter(iteration)
   // first iteration

// Used timer for dynamically loading the graph to reveal the tuning process from the
// initial status to a stable result
  var timer = d3.timer(ticked);

  function  ticked() {

    node
      .transition()
        .duration(100)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    link
          .transition()
          .duration(100)
          .attr("x1", d => {return nodes[obtainNodeIndex(d.source)].x})
          .attr("y1", d => {return nodes[obtainNodeIndex(d.source)].y})
          .attr("x2", d => {return nodes[obtainNodeIndex(d.target)].x})
          .attr("y2", d => {return nodes[obtainNodeIndex(d.target)].y})

   }


  node.append("title")
      .html(d => {return d.id})


  function dragstarted(d) {


    if (!d3.event.active) timer.stop()
     d.fx = d.x;
     d.fy = d.y;
  }

  function dragged(d) {


    d.fx = d3.event.x
    d.fy = d3.event.y
    d3.select(this).attr("cx", d.fx).attr("cy", d.fy);


    link.filter(function(l) { return l.source === d.id; }).transition().duration(0).attr("x1", d.fx).attr("y1", d.fy);
    link.filter(function(l) { return l.target === d.id; }).transition().duration(0).attr("x2", d.fx).attr("y2", d.fy);


}

  function dragended(d) {
    // run the iteration and restart timer to dynamically re-arrange the graph
    // when drag stops
      d.x = d.fx
      d.y = d.fy
      Iter(iteration)
      timer.restart(ticked)
      if (!d3.event.active) //cool()
      d.fx = null;
      d.fy = null;

}


// calculate repulsive force between each node and every other node

  function calculateDelta(v, u) {

      return [v.x - u.x, v.y - u.y];
  }

  function norm2D (arr){

    return Math.sqrt(arr[0]*arr[0]+arr[1]*arr[1]);

  }


  function multi(array, num){
    var arr = []

    for (var i=0; i < array.length; i++){
        arr[i] = array[i] * num
    }
    return arr

  }


 function obtainNodeIndex(n){

   var index = nodes.findIndex((d)=>d.id === n)

   return index
 }


  function calculateDispByRepulsive(v){

    nodes.forEach((u)=> {
      if(u.id != v.id){
        var delta = calculateDelta(v, u)
        var norm = norm2D(delta)
        if(norm != 0){
           var d = repulsive(norm, k);
           v.disp[0] += delta[0]/norm*d;
           v.disp[1] += delta[1]/norm*d;

        }
      }
    })

  }

  //attractive force between linked nodes
  function calculateDispByAttractive(edge) {

    var sourceIdx = obtainNodeIndex(edge.source)
    var targetIdx = obtainNodeIndex(edge.target)

    var delta = calculateDelta(nodes[sourceIdx], nodes[targetIdx])

    var norm = norm2D(delta)

    if (norm != 0){
        var d = attractive(norm, k);

        nodes[sourceIdx].disp[0] -= delta[0]/norm*d;
        nodes[sourceIdx].disp[1] -= delta[1]/norm*d;
        nodes[targetIdx].disp[0] += delta[0]/norm*d;
        nodes[targetIdx].disp[1] += delta[1]/norm*d;



    }

  }

  // update position
  function updatePosition(n){


      var disp = norm2D(n.disp)



      if(disp != 0){


        var d = Math.min(disp, t)/disp


        var arr = multi(n.disp, d)
        var x = n.x + arr[0]
        var y = n.y + arr[1]

        x =  Math.min(width, Math.max(0,x)) - width/2
        y =  Math.min(height,Math.max(0,y)) - height/2


        n.x = Math.min(Math.sqrt(width*width/4-y*y),Math.max(-Math.sqrt(width*width/4-y*y),x)) + width/2
        n.y = Math.min(Math.sqrt(height*height/4-x*x),Math.max(-Math.sqrt(height*height/4-x*x),y)) + height/2



  }
}


})
