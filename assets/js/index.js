$(document).ready(function() {

  /**
   * This function is used to end the d3 tansition.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   */
  function transition() {
    d3.transition()
            .transition()
            .each("end", transition);
  }
  /*  ----------------------------------------------------------------------  */
  /**
   * This function is used to plot the world map with tour transition effect.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   */
  function drawWorldGraph_old() {
    var width = 960,
            height = 500;

    var projection = d3.geo.orthographic()
            .scale(248)
            .clipAngle(90);

    var canvas = d3.select('.world-map-wrapper')
            .append("canvas")
            .attr("width", width)
            .attr("height", height);

    var c = canvas.node().getContext("2d");

    var path = d3.geo.path()
            .projection(projection)
            .context(c);

    var title = d3.select('.location-name');

    queue()
            .defer(d3.json, "assets/json/world-110m.json")
            .defer(d3.tsv, "assets/csv/world-country-names.tsv")
            .await(ready);

    function ready(error, world, names) {
      var globe = {type: "Sphere"},
      land = topojson.feature(world, world.objects.land),
              countries = topojson.feature(world, world.objects.countries).features,
              borders = topojson.mesh(world, world.objects.countries, function(a, b) {
                return a !== b;
              }),
              i = -1,
              n = countries.length;

      countries = countries.filter(function(d) {
        return names.some(function(n) {
          if (d.id == n.id)
            return d.name = n.name;
        });
      }).sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });

      (function transition() {
        d3.transition()
                .duration(1250)
                .each("start", function() {
                  title.text(countries[i = (i + 1) % n].name);
                })
                .tween("rotate", function() {
                  var p = d3.geo.centroid(countries[i]),
                          r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);

                  return function(t) {
                    projection.rotate(r(t));
                    c.clearRect(0, 0, width, height);
                    c.fillStyle = "#bbb", c.beginPath(), path(land), c.fill();
                    c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
                    c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
                    c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
                  };
                })
                .transition()
                .each("end", transition);
      })();
      $.unblockUI();
    }
  }


  function drawWorldGraph() {
    var feature // eventually: all svg paths (countries) of the world
            , toggle; // animation on/off control

    var projection = d3.geo.azimuthal()
            .scale(250)
            .origin([-71.03, 0])
            .mode("orthographic")
           // .translate([400, 400]);

    var circle = d3.geo.greatCircle()
            .origin(projection.origin());

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select(".world-map-wrapper").append("svg:svg")
            .attr("width", 960)
            .attr("height", 500)
            .on("mousedown", mousedown);

    if (frameElement)
      frameElement.style.height = '800px';

    d3.json("assets/json/world-countries.json", function(collection) {
      feature = svg.selectAll("path")
              .data(collection.features)
              .enter().append("svg:path")
              .attr("d", clip);

      feature.append("svg:title")
              .text(function(d) {
                return d.properties.name;
              });

      startAnimation();
      d3.select('#animate').on('click', function() {
        if (done)
          startAnimation();
        else
          stopAnimation();
      });
    });

    function stopAnimation() {
      done = true;
      d3.select('#animate').node().checked = false;
    }

    function startAnimation() {
      done = false;
      d3.timer(function() {
        var origin = projection.origin();
        origin = [origin[0] + 1, origin[1] + 0];
        projection.origin(origin);
        circle.origin(origin);
        refresh();
        return done;
      });
    }

    function animationState() {
      return 'animation: ' + (done ? 'off' : 'on');
    }

    d3.select(window)
            .on("mousemove", mousemove)
            .on("mouseup", mouseup);

//      d3.select("select").on("change", function() {
//        stopAnimation();
//        projection.mode(this.value).scale(scale[this.value]);
//        refresh(750);
//      });

    var m0
            , o0
            , done
            ;

    function mousedown() {
      stopAnimation();
      m0 = [d3.event.pageX, d3.event.pageY];
      o0 = projection.origin();
      d3.event.preventDefault();
    }

    function mousemove() {
      if (m0) {
        var m1 = [d3.event.pageX, d3.event.pageY]
                , o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
        projection.origin(o1);
        circle.origin(o1);
        refresh();
      }
    }

    function mouseup() {
      if (m0) {
        mousemove();
        m0 = null;
      }
    }

    function refresh(duration) {
      (duration ? feature.transition().duration(duration) : feature).attr("d", clip);
    }

    function clip(d) {
      return path(circle.clip(d));
    }

    function reframe(css) {
      for (var name in css)
        frameElement.style[name] = css[name] + 'px';
    }
    $.unblockUI();
  }
  /*  ----------------------------------------------------------------------  */
  /**
   * 
   * @param {type} d
   * @returns {undefined}
   */
  function clicked(d) {
    var centroid = path.centroid(d),
            translate = projection.translate();

    projection.translate([
      translate[0] - centroid[0] + width / 2,
      translate[1] - centroid[1] + height / 2
    ]);
  }

  /*  ----------------------------------------------------------------------  */
  /**
   * This function is used to draw the map of United States.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   * 
   */
  function drawUSGraph() {

    var width = 960,
            height = 500;

    var projection = d3.geo.albersUsa()
            .scale(1000)
            .translate([width / 2, height / 2]);

    /*  var color = d3.scale.category20c();*/
    var color = d3.scale.threshold()
            .domain([1, 10, 20, 30, 40, 50])
            .range(["rgb(247,251,255)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('.world-map-wrapper')
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    queue()
            .defer(d3.json, "assets/json/us-10m.json")
            .defer(d3.csv, "assets/csv/us-county-names.csv")
            .await(usReady);

    function usReady(error, us, rate) {
      var rateById = {};

      rate.forEach(function(d) {
        rateById[d.id] = +d.rate;
      });

      svg.append("g")
              .attr("class", "counties")
              .selectAll("path")
              .data(topojson.feature(us, us.objects.counties).features)
              .enter().append("path")
              .attr("d", path)
              .style("fill", function(d) {
                if (color(rateById[d.id])) {
                  // return color(rateById[d.id]);
                  return '#BBBBBB';
                } else {
                  return '#BBBBBB';
                }
                /* if (color(d.id)) {
                 return color(d.id);
                 } else {
                 return '#BBBBBB';
                 }*/
              });

      svg.append("path")
              .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a.id !== b.id;
              }))
              .attr("class", "states")
              .attr("d", path);
      $.unblockUI();
    }
  }

  /*  ----------------------------------------------------------------------  */
  /**
   * This function is used to draw the United Kingdom(UK) graph.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   */
  function drawUKGraph() {

    var width = 960,
            height = 600;

    var projection = d3.geo.albers()
            .center([0, 55.4])
            .rotate([4.4, 0])
            .parallels([50, 60])
            .scale(3000)
            .translate([width / 3, height / 3]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('.world-map-wrapper')
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    d3.json("assets/json/uk.json", function(error, uk) {
      svg.selectAll(".subunit")
              .data(topojson.feature(uk, uk.objects.subunits).features)
              .enter().append("path")
              /*.attr("class", function(d) {
               return "subunit " + d.id;
               })*/
              .attr("class", "region")
              .attr("d", path)
              .style("stroke", "#fff")
              .style("stroke-width", 0.2)
              .style('fill', function(d) {
                return '#BBBBBB';
              });
      $.unblockUI();
    });
  }

  /*  ----------------------------------------------------------------------  */
  /**
   * This function is used to draw the Europe Graph.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   */
  function drawEuropeGraph() {

    var width = 960,
            height = 500;

    var projection = d3.geo.stereographic()
            .center([3.9, 43.0])
            .scale(1260)
            .translate([width / 3, height / 2]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('.world-map-wrapper')
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    d3.json("assets/json/europe-regions.json", function(error, europe) {
      svg.selectAll(".region")
              .data(topojson.feature(europe, europe.objects.regions).features)
              .enter()
              .append("path")
              /*.filter(function(d) {
               return !isNaN(parseFloat(data[d.properties.NUTS_ID]));
               })*/
              .attr("class", "region")
              .attr("d", path)
              .style("stroke", "#fff")
              .style("stroke-width", 0.2)
              .style("fill", function(d) {
                return '#BBBBBB';
              });
      $.unblockUI();
    });
  }

  /*  ----------------------------------------------------------------------  */
  /**
   * This function is used to draw the Africa and Middle East projection on map.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com> 
   */
  function drawAfricaGraph_old() {

    var width = 960,
            height = 550;

//    var projection = d3.geo.chamberlin()
//            .points([[0, 22], [45, 22], [22.5, -22]])
//            .center([0, -1])
//            .scale(200)
//            .translate([width / 2, height / 2])
    //.precision(.1)
    //.clipAngle(80);

    var projection = d3.geo.mercator()
            .center([20, 10])
            .scale((width + 1) / 2 / Math.PI)
            .translate([width / 2, height / 2])
            .precision(.1);


    var path = d3.geo.path()
            .projection(projection);

    var graticule = d3.geo.graticule()
            .extent([[-30, -40], [70, 50]]);

    var svg = d3.select('.world-map-wrapper')
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    var defs = svg.append("defs");

    defs.append("path")
            .attr("id", "outline")
            .datum(graticule.outline)
            .attr("d", path);

//    defs.append("clipPath")
//            .attr("id", "clip")
//            .append("use")
//            .attr("xlink:href", "#outline");
//
//    svg.append("use")
//            .attr("class", "stroke")
//            .attr("xlink:href", "#outline");

    /*svg.append("use")
     .attr("class", "fill")
     .attr("xlink:href", "#outline");*/

//    svg.append("path")
//            .datum(graticule)
//            .attr("class", "graticule")
//            .attr("d", path);

    d3.json("assets/json/world-50m.json", function(error, world) {
      console.log(world.objects.countries.geometries);
      var russia = world.objects.countries.geometries.filter(function(d) {
        return d.id === 298;
      })[0]
      //console.log(russia);
      //console.log(world);
      var g = svg.insert("g", ".graticule")
              .attr("clip-path", "url(#clip)");

      g.append("path")
              //.datum(topojson.feature(world, world.objects.land))
              .datum(topojson.feature(world, russia))
              .attr("class", "land")
              .style("fill", function(d) {
                return '#BBBBBB';
              })
              .attr("d", path);

      g.append("path")
              .datum(topojson.mesh(world, world.objects.countries, function(a, b) {
                return a !== b;
              }))
              .attr("class", "boundary")
              .attr("d", path);

      $.unblockUI();
    });
  }



  function drawAfricaGraph() {

    var width = 560,
            height = 560;

    var projection = d3.geo.mercator()
            .center([0, -10])
            .scale(300)
            .rotate(1, 0)
            .translate([width / 2, height / 2]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('.world-map-wrapper').append("svg")
            .attr("width", width)
            .attr("height", height);

    d3.json("assets/json/africa.json", function(error, asia) {

      svg.selectAll(".subunit")
              .data(topojson.feature(asia, asia.objects.layer1).features)
              .enter().append("path")
              .attr("class", 'maninder')
              .attr("d", path)
              .style("fill", function(d) {
                return '#BBBBBB';
              });

      svg.append("path")
              .datum(topojson.mesh(asia, asia.objects.layer1, function(a, b) {
                return a !== b;
              }))
              .attr("d", path)
              .attr("class", "subunit-boundary")
              .style("stroke", "#fff")
              .style("stroke-width", 0.2)
              .style("fill", function(d) {
                return '#BBBBBB';
              });

      $.unblockUI();
    });
  }




  /*  ----------------------------------------------------------------------  */

  function drawAsiaGraph() {

    var width = 560,
            height = 460;

    var projection = d3.geo.mercator()
            .center([70, 60])
            .scale(160)
            .rotate(1, 0)
            .translate([width / 2, height / 2]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('.world-map-wrapper').append("svg")
            .attr("width", width)
            .attr("height", height);

    d3.json("assets/json/asia.json", function(error, asia) {

      svg.selectAll(".subunit")
              .data(topojson.feature(asia, asia.objects.collection).features)
              .enter().append("path")
              .attr("class", 'maninder')
              .attr("d", path)
              .style("fill", function(d) {
                return '#BBBBBB';
              });

      svg.append("path")
              .datum(topojson.mesh(asia, asia.objects.collection, function(a, b) {
                return a !== b;
              }))
              .attr("d", path)
              .attr("class", "subunit-boundary")
              .style("stroke", "#fff")
              .style("stroke-width", 0.2)
              .style("fill", function(d) {
                return '#BBBBBB';
              });

      $.unblockUI();
    });
  }

  /*  ----------------------------------------------------------------------  */
  /**
   * Calling the function to draw the world graph on document loading time.
   */
  /*  blocking the UI by displaying a loading image on document ready */
  $.blockUI();
  drawWorldGraph();

  /*  ----------------------------------------------------------------------  */
  /**
   * This script is used to handle the click event on different location labels
   * and caal the different function to draw the graph accordingly.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   */
  $('span.label').on('click', function() {
    /*  blocking the UI by displaying a loading image   */
    $.blockUI();
    var countryName = $(this).attr('id');
    $('span.label').removeClass('label-info');
    $(this).addClass('label-info');
    switch (countryName)
    {
      case 'us':
        transition();
        $('.world-map-wrapper, .location-name').empty();
        drawUSGraph();
        break;
      case 'europe':
        transition();
        $('.world-map-wrapper, .location-name').empty();
        drawEuropeGraph();
        break;
      case 'uk':
        transition();
        $('.world-map-wrapper, .location-name').empty();
        drawUKGraph();
        break;
      case 'africa':
        transition();
        $('.world-map-wrapper, .location-name').empty();
        drawAfricaGraph();
        break;
      case 'asia':
        transition();
        $('.world-map-wrapper, .location-name').empty();
        //$('.world-map-wrapper').addClass('text-center').append('<h3>Map coming soon.</h3>');
        drawAsiaGraph();
        break;
      case 'world':
        transition();
        $('.world-map-wrapper, .location-name').empty();
        drawWorldGraph();
        break;
      default:
        transition();
        $('.world-map-wrapper, .location-name').empty();
        drawWorldGraph();
        break;
    }
  });
});