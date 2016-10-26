/* Drag & Drop */
var dragElem = null;

function handleDragStart(e) {
  this.classList.add('drop-over');

  dragElem = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
  e.preventDefault();

  e.dataTransfer.dropEffect = 'move';

  return false;
}

function handleDragEnter(e) {
  this.classList.add('drop-over');
}

function handleDragLeave(e) {
  this.classList.remove('drop-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (dragElem != this) {
    dragElem.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');
  }

  return false;
}

function handleDragEnd(e) {
  var cols = document.querySelectorAll('.sidebar .menu-item');

  [].forEach.call(cols, function (col) {
    col.classList.remove('drop-over');
  });
}

function initDragAndDrop(selector) {
  var cols = document.querySelectorAll('.sidebar .menu-item');

  [].forEach.call(cols, function(col) {
    col.addEventListener('dragstart', handleDragStart, false);
    col.addEventListener('dragenter', handleDragEnter, false);
    col.addEventListener('dragover', handleDragOver, false);
    col.addEventListener('dragleave', handleDragLeave, false);
    col.addEventListener('drop', handleDrop, false);
    col.addEventListener('dragend', handleDragEnd, false);
  });
}

/* Google Maps */
function initMap(latitude, longitude) {
  var pos = {lat: latitude, lng: longitude};
  
  var map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    scrollwheel: false,
    zoom: 15
  });

  var marker = new google.maps.Marker({
    position: pos,
    map: map
  });
}

/*
  D3.js : Force-Directed Graph
  http://bl.ocks.org/mbostock/4062045
*/
var simulation;

function initGraph(canvasId, dataUrl) {
  var svg = d3.select('#' + canvasId),
      width = +document.getElementById(canvasId).clientWidth,
      height = +document.getElementById(canvasId).clientHeight;

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2 + 40));

  d3.json(dataUrl, function(error, graph) {
    if (error) throw error;

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
        .on("start", circleDragStarted)
        .on("drag", circleDragged)
        .on("end", circleDragEnded));

    node.append("title")
      .text(function(d) { return d.id; });

    simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(graph.links);

    function ticked() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    }
  });
}

function circleDragStarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function circleDragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function circleDragEnded(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
