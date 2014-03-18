$(document).ready(function() {

var non_countries = ['Antarctica','French Southern and Antarctic Lands','Australia','Fiji','Kiribati','Marshall Islands','Micronesia','Nauru','New Zealand','Palau','Papua New Guinea','Samoa','Solomon Islands','Tonga','Tuvalu','Vanuatu'];
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

  /**
   * This function is used to plot the world map with tour transition effect.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   */
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

    var svg = d3.select("#d3_map_wrapper").append("svg:svg")
            .attr("width", 750)
            .attr("height", 500)
            .on("mousedown", mousedown);
  svg.append("circle")
                .attr("cx",  750/ 2 +100)
                .attr("cy", 500 / 2)
                .attr("r", 250)
                .attr("fill","#ffffff");
//    if (frameElement)
//      frameElement.style.height = '800px';

    d3.json("assets/json/world-countries.json", function(collection) {
      console.log('world json',collection);
      feature = svg.selectAll("path")
              .data(collection.features)
              .enter().append("svg:path")
              .attr("d", clip)
              .attr("class", function(d) {
                var name = d.properties.name;
               // console.log(name,name.length,non_countries);
                if($.inArray(name,non_countries) > -1)
                  return 'color_1';
                else
                  return 'color_2';
                //var rand_num = Math.floor((Math.random() * 5) + 1);
                //return 'color_' + rand_num;
              });

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
      //  d3.select('#animate').node().checked = false;
    }

    function startAnimation() {
      done = false;
      d3.timer(function() {
        var origin = projection.origin();
       origin = [origin[0] + 0.4, origin[1] + 0.1];
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
    var width = 700,
            height = 500;

    var projection = d3.geo.albersUsa()
            .scale(800)
            .translate([width / 2, height / 2]);

    /*  var color = d3.scale.category20c();*/
    var color = d3.scale.threshold()
            .domain([1, 10, 20, 30, 40, 50])
            .range(["rgb(247,251,255)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('#d3_map_wrapper')
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
              .data(topojson.feature(us, us.objects.states).features)
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

//      svg.append("path")
//              .datum(topojson.mesh(us, us.objects.states, function(a, b) {
//                return a.id !== b.id;
//              }))
//              .attr("class", "states")
//              .attr("d", path);
      $.unblockUI();
    }
  }


  /**
   * This function is used to draw the United Kingdom(UK) graph.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   */
  function drawUKGraph() {

    var width = 700,
            height = 500;

    var projection = d3.geo.albers()
            .origin([-10, 55.4])
            // .rotate([4.4, 0])
            .parallels([50, 60])
            .scale(2400)
            .translate([width / 3, height / 3]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('#d3_map_wrapper')
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


  /**
   * This function is used to draw the Europe Graph.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   */
  function drawEuropeGraph() {

    var width = 700,
            height = 500;

    var projection = d3.geo.albers()
            .origin([14.9, 60.0])
            .scale(650)
            .translate([width / 2, height / 2]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('#d3_map_wrapper')
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    d3.json("assets/json/continent_Europe_subunits.json", function(error, europe) {
     // console.log(europe.objects.layer1);

      var obj_new = new Object();
      var del_arr = [];

      obj_new = europe.objects.layer1;
     
      $.each(obj_new,function(k,v){

        // console.log(k);
        if(k == "geometries")
        {
         // console.log('ok');
          $.each(v,function(k1,v2){
            
           //  console.log(k1,v2.properties.admin);
             $.each(v2.properties,function(k3,v3){
              if(k3 == "admin")
              {
            
              var str_ = v3 ;
            
                if(str_ == "United Kingdom")
                {
                  console.log('came');
                 // v.splice(k1,1);
                 del_arr.push(k1);



                }
            }


             });
        

          });
         
           }

      })

     console.log(del_arr);
     console.log('old arr',europe.objects.layer1);
      $.each(obj_new,function(k,v){

        // console.log(k);
        if(k == "geometries")
        {
        // console.log('ok');
          $.each(v,function(k1,v1){
            // 15 50 60 69
             if(k1 == 16 || k1 == 50-1 || k1 == 60-2 || k1 == 69-3) 
             {
              //console.log(k1,'came');
                 v.splice(k1,1);
              }
            });
        }
      });
        console.log('new arr',obj_new);
    
      svg.selectAll(".region")
              .data(topojson.feature(europe, obj_new).features)
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


  /**
   * This function is used to draw the Africa and Middle East projection on map.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com> 
   */
  function drawAfricaGraph() {

    var width = 700,
            height = 500;

    var projection = d3.geo.mercator()
            //.center([0, -10])
            .scale(2000)
            //.rotate(1, 0)
            .translate([width / 2, height / 2]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('#d3_map_wrapper').append("svg")
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


  /**
   * This function is used to draw the Asia projection on map.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com> 
   */
  function drawAsiaGraph() {

    var width = 700,
            height = 500;

    var projection = d3.geo.albers()
            .origin([100, 35])
            .scale(300)
            // .rotate(1, 0)
            .translate([width / 2, height / 2]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('#d3_map_wrapper').append("svg")
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

  function drawPieChart() {
    var testdata = [
      {
        key: "One",
        y: 5
      },
      {
        key: "Two",
        y: 2
      },
      {
        key: "Three",
        y: 9
      },
      {
        key: "Four",
        y: 7
      },
      {
        key: "Five",
        y: 4
      },
      {
        key: "Six",
        y: 3
      },
      {
        key: "Seven",
        y: .5
      }
    ];


    nv.addGraph(function() {
      var width = 300,
              height = 300;

      var chart = nv.models.pieChart()
              .x(function(d) {
                return d.key
              })
              .y(function(d) {
                return d.y
              })
              .color(d3.scale.category10().range())
              .width(width)
              .height(height)
      //.showLabels(false);

      d3.select("#test1")
              .datum(testdata)
              .transition().duration(1200)
              .attr('width', width)
              .attr('height', height)
              //.showLabels(false)
              .call(chart);


      chart.dispatch.on('stateChange', function(e) {
        nv.log('New State:', JSON.stringify(e));
      });

      return chart;
    });
  }


  /*  blocking the UI by displaying a loading image on document ready */
  $.blockUI();

  /**
   * Calling the function to draw the world graph on document loading time.
   */
  drawPieChart();
  drawWorldGraph();
   $('#d3_map_wrapper svg').css('right','100px');
//drawAfricaGraph()
  // drawAsiaGraph()
//  drawUKGraph()
//drawEuropeGraph()

  /**
   * This script is used to handle the click event on different location labels
   * and caal the different function to draw the graph accordingly.
   * 
   * @version     0.0.1
   * @since       0.0.1
   * @access      public
   * @author      Maninder Singh  <manindersingh221@gmail.com>
   */
  $('li.label').on('click', function() {
    /*  blocking the UI by displaying a loading image   */
    $.blockUI();
    var countryName = $(this).attr('id');
    $('li.label').removeClass('label-info');
    $(this).addClass('label-info');
    switch (countryName)
    {
      case 'us':
        transition();
        $('#d3_map_wrapper, .location-name').empty();
        drawUSGraph();
        $('#d3_map_wrapper svg').css('right','');
        break;
      case 'europe':
        transition();
        $('#d3_map_wrapper, .location-name').empty();
        drawEuropeGraph();
        $('#d3_map_wrapper svg').css('right','');
        break;
      case 'uk':
        transition();
        $('#d3_map_wrapper, .location-name').empty();
        drawUKGraph();
        $('#d3_map_wrapper svg').css('right','');
        break;
      case 'africa':
        transition();
        $('#d3_map_wrapper, .location-name').empty();
        drawAfricaGraph();
        $('#d3_map_wrapper svg').css('right','');
        break;
      case 'asia':
        transition();
        $('#d3_map_wrapper, .location-name').empty();
        //$('#d3_map_wrapper').addClass('text-center').append('<h3>Map coming soon.</h3>');
        drawAsiaGraph();
        break;
      case 'world':
        transition();
        $('#d3_map_wrapper, .location-name').empty();
        drawWorldGraph();
        $('#d3_map_wrapper svg').css('right','100px');
        break;
      default:
        transition();
        $('#d3_map_wrapper, .location-name').empty();
        drawWorldGraph();
        $('#d3_map_wrapper svg').css('right','100px');
        break;
    }
  });
});