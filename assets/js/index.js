$(document).ready(function() {

    var uk_data, asia_data, europe_data, world_data, america_data_1, america_data_2;
    var us_hours_data = [[], [], [], []];
    var uk_hours_data = [[], [], [], []];
    var cemea_hours_data = [[], [], [], []];
    var asia_hours_data = [[], [], [], []];
    var mid_east_hours_data = [[], [], [], []];
    var world_hours_data = [[], [], [], [], []];
    var percent_data = [[], [], [], [], []];
    var curr_hour_graph = 0;
    var graph;
    var non_countries = ['Antarctica', 'French Southern and Antarctic Lands', 'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'];
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

        var svg = d3.select(".world-map-wrapper").append("svg:svg")
                .attr("width", 750)
                .attr("height", 500)
                .on("mousedown", mousedown);
        svg.append("circle")
                .attr("cx", 750 / 2 + 100)
                .attr("cy", 500 / 2)
                .attr("r", 250)
                .attr("fill", "#ffffff");
//    if (frameElement)
//      frameElement.style.height = '800px';

        // d3.json("assets/json/world-countries.json", function(collection) {
        collection = world_data;
        // console.log('world json', collection);
        feature = svg.selectAll("path")
                .data(collection.features)
                .enter().append("svg:path")
                .attr("d", clip)
                .attr("class", function(d) {
                    var name = d.properties.name;
                    // console.log(name,name.length,non_countries);
                    if ($.inArray(name, non_countries) > -1)
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
        //});

        function stopAnimation() {
            done = true;
            //  d3.select('#animate').node().checked = false;
        }

        function startAnimation() {
            done = false;
            d3.timer(function() {
                var origin = projection.origin();
                //origin = [origin[0] + 0.4, origin[1] + 0.1];
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

        var svg = d3.select('.world-map-wrapper')
                .append("svg")
                .attr("width", width)
                .attr("height", height);

        // queue()
        //         .defer(d3.json, "assets/json/us-10m.json")
        //         .defer(d3.csv, "assets/csv/us-county-names.csv")
        //         .await(usReady);

        var us = america_data_1;
        var rate = america_data_2;

        //  function usReady(error, us, rate) {
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
        //  }
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

        var svg = d3.select('.world-map-wrapper')
                .append("svg")
                .attr("width", width)
                .attr("height", height);

        // d3.json("assets/json/uk.json", function(error, uk) {
        var uk = uk_data;
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
        //  });
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

        var svg = d3.select('.world-map-wrapper')
                .append("svg")
                .attr("width", width)
                .attr("height", height);

        //  d3.json("assets/json/continent_Europe_subunits.json", function(error, europe) {
        europe = europe_data;
        // console.log(europe.objects.layer1);

        var obj_new = new Object();
        var del_arr = [];

        obj_new = europe.objects.layer1;

        $.each(obj_new, function(k, v) {

            // console.log(k);
            if (k == "geometries")
            {
                // console.log('ok');
                $.each(v, function(k1, v2) {

                    //  console.log(k1,v2.properties.admin);
                    $.each(v2.properties, function(k3, v3) {
                        if (k3 == "admin")
                        {

                            var str_ = v3;

                            if (str_ == "United Kingdom")
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
        console.log('old arr', europe.objects.layer1);
        $.each(obj_new, function(k, v) {

            // console.log(k);
            if (k == "geometries")
            {
                // console.log('ok');
                $.each(v, function(k1, v1) {
                    // 15 50 60 69
                    if (k1 == 16 || k1 == 50 - 1 || k1 == 60 - 2 || k1 == 69 - 3)
                    {
                        //console.log(k1,'came');
                        v.splice(k1, 1);
                    }
                });
            }
        });
        console.log('new arr', obj_new);

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

        // });
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

        var svg = d3.select('.world-map-wrapper').append("svg")
                .attr("width", width)
                .attr("height", height);

        //   d3.json("assets/json/africa.json", function(error, asia) {

        asia = africa_data;

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
        // });
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

        var svg = d3.select('.world-map-wrapper').append("svg")
                .attr("width", width)
                .attr("height", height);

        // d3.json("assets/json/asia.json", function(error, asia) {
        asia = asia_data;

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
        // });
    }

    function drawPieChart(data) {
        var testdata = [
            {
                key: "UK",
                y: data[0]
            },
            {
                key: "Americas",
                y: data[1]
            },
            {
                key: "Europe",
                y: data[2]
            },
            {
                key: "Asia",
                y: data[3]
            },
            {
                key: "Africa & Mid East",
                y: data[4]
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
    // drawPieChart();
    d3.json("assets/json/world-countries.json", function(error, data) {
        world_data = data;
        if (world_data)
            drawWorldGraph();
    });
    /**
     * This function is used to draw the LineChart based on minutes.
     * 
     * @version     0.0.1
     * @since       0.0.1
     * @access      public
     * @author      Maninder Singh  <manindersingh221@gmail.com> 
     */
    function drawHoursGraph()
    {
        switch (curr_hour_graph)
        {
            case 0 :
                data_real = world_hours_data;
                break;
            case 1 :
                data_real = us_hours_data;
                break;
            case 2 :
                data_real = cemea_hours_data;
                break;
            case 3 :
                data_real = uk_hours_data;
                break;
            case 4 :
                data_real = mid_east_hours_data;
                break;
            case 5 :
                data_real = asia_hours_data;
                break;

            default:
                data_real = world_hours_data;
                break;

        }
        var val;
        if ($('#range_start').val() <= 6)
            val = parseFloat(3.6 + ($('#range_start').val() * 0.2));
        else
            val = parseFloat(4.6 + ($('#range_start').val() * 0.0));
        var left_val = parseFloat(parseFloat($('#range_start').val()) * val);
        
        $('#amount').css({'left': left_val + '%'});
        var data = [[], [], [], [], []];
        var range_start = parseInt($('#range_start').val()) * 60;
        if (parseInt($('#range_start').val()) == 20)
            var range_end = parseInt($('#range_end').val() - 1) * 60;
        else
            var range_end = parseInt($('#range_end').val()) * 60;

        if (curr_hour_graph == 0)
        {
            for (var i = range_start; i <= range_end; i++)
            {
                data[0].push(data_real[0][i]);
                data[1].push(data_real[1][i]);
                data[2].push(data_real[2][i]);
                data[3].push(data_real[3][i]);
                data[4].push(data_real[4][i]);
            }
            var graph_data = [
                {
                    color: "#c05020",
                    data: data[0],
                    name: 'UK'
                },
                {
                    color: "skyblue",
                    data: data[1],
                    name: 'US'
                },
                {
                    color: "black",
                    data: data[2],
                    name: 'CEMEA'
                },
                {
                    color: "lightgreen",
                    data: data[3],
                    name: 'ASIA'
                },
                {
                    color: "lightblue",
                    data: data[4],
                    name: 'MID EAST'
                }
            ];
        }
        else
        {
            for (var i = range_start; i <= range_end; i++)
            {
                data[0].push(data_real[0][i]);
                data[1].push(data_real[1][i]);
                data[2].push(data_real[2][i]);
                data[3].push(data_real[3][i]);
            }
            var graph_data = [
                {
                    color: "#c05020",
                    data: data[0],
                    name: 'Desktop'
                },
                {
                    color: "skyblue",
                    data: data[1],
                    name: 'smartphone'
                },
                {
                    color: "black",
                    data: data[2],
                    name: 'tablet'
                },
                {
                    color: "lightgreen",
                    data: data[3],
                    name: 'other mobile'
                }
            ];
        }
        // console.log(data[0].length);

        $('#lineChart').html('');
        graph = new Rickshaw.Graph({
            element: document.getElementById("lineChart"),
            width: 700,
            //height: 500,
            renderer: 'line',
            series: graph_data
        });

        graph.render();

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: graph
        });
    }
//
    /**
     * This function is used for autoslider.
     * 
     * @version     0.0.1
     * @since       0.0.1
     * @access      public
     * @author      Maninder Singh  <manindersingh221@gmail.com> 
     */
    function auto_slider()
    {
        // console.log('called');
        var curr_start_point = parseInt($('#range_start').val());
        var curr_end_point = parseInt($('#range_end').val());

        curr_start_point += 1;
        curr_end_point = curr_start_point + 1;

        if (curr_end_point >= 20 )
        {
            curr_start_point = 0;
            curr_end_point = 4;
        }

        $('#range_start').val(curr_start_point);
        $('#range_end').val(curr_end_point);

        $("#slider-range").slider({values: [curr_start_point]});
        $("#amount").text("" + $("#slider-range").slider("values", 0) +
                ":00 - " + ($("#slider-range").slider("values", 0) + 4) + ":00 (Hours)");
        
         var val;
        if ($('#range_start').val() <= 6)
            val = parseFloat(3.6 + ($('#range_start').val() * 0.2));
        else
            val = parseFloat(4.6 + ($('#range_start').val() * 0.0));
        var left_val = parseFloat(parseFloat($('#range_start').val()) * val);
        
        $('#amount').css({'left': left_val + '%'});
        drawHoursGraph();


    }
    // uk data
    $('.world-map-wrapper svg').css('right', '100px');
    d3.json("assets/json/uk.json", function(error, data) {
        uk_data = data;

    });

    // us data
    d3.json("assets/json/us-10m.json", function(error, data) {
        america_data_1 = data;

    });
    d3.csv("assets/csv/us-county-names.csv", function(error, data) {
        america_data_2 = data;

    });

    // europe data
    d3.json("assets/json/continent_Europe_subunits.json", function(error, europe) {
        europe_data = europe;
    });

    //africa data
    d3.json("assets/json/africa.json", function(error, africa) {
        africa_data = africa;
    });
    //asia data
    d3.json("assets/json/asia.json", function(error, asia) {
        asia_data = asia;
    });


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
                curr_hour_graph = 1;
                drawHoursGraph();
                drawUSGraph();
                $('.world-map-wrapper svg').css('right', '');
                break;
            case 'europe':
                transition();
                $('.world-map-wrapper, .location-name').empty();
                curr_hour_graph = 2;
                drawHoursGraph();
                drawEuropeGraph();
                $('.world-map-wrapper svg').css('right', '');
                break;
            case 'uk':
                transition();
                $('.world-map-wrapper, .location-name').empty();
                curr_hour_graph = 3;
                drawHoursGraph();
                drawUKGraph();
                $('.world-map-wrapper svg').css('right', '');
                break;
            case 'africa':
                transition();
                $('.world-map-wrapper, .location-name').empty();
                curr_hour_graph = 4;
                drawHoursGraph();
                drawAfricaGraph();
                $('.world-map-wrapper svg').css('right', '');
                break;
            case 'asia':
                transition();
                $('.world-map-wrapper, .location-name').empty();
                curr_hour_graph = 5;
                drawHoursGraph();
                //$('.world-map-wrapper').addClass('text-center').append('<h3>Map coming soon.</h3>');
                drawAsiaGraph();
                break;
            case 'world':
                transition();
                $('.world-map-wrapper, .location-name').empty();
                curr_hour_graph = 0;
                drawHoursGraph();
                drawWorldGraph();
                $('.world-map-wrapper svg').css('right', '100px');
                break;
            default:
                transition();
                $('.world-map-wrapper, .location-name').empty();
                curr_hour_graph = 0;
                // drawWorldGraph();
                $('.world-map-wrapper svg').css('right', '100px');
                break;
        }
    });

    // line chart 
    // range slider js
    $("#slider-range").slider({
        // range: true,
        min: 0,
        max: 20,
        values: [parseInt($('#range_start').val())],
        slide: function(event, ui) {
            //var h,m;
            //  var h = Math.floor( $('.totalMin').html() / 60);          
            //   var m = $('.totalMin').html() % 60;
            //  console.log(ui.values[ 0 ]);
            // console.log($('.ui-slider-handle').css('left'));
            $("#amount").text("" + ui.values[ 0 ] + ":00 - " + (ui.values[0  ] + 4) + ":00 (Hours)");
            $("#range_start").val(ui.values[ 0 ]);
            $("#range_end").val(ui.values[ 0 ] + 4);

            //reDrawHoursGraph(us_hours_data);
            drawHoursGraph();


        }
    });
//

    $("#amount").text("" + $("#slider-range").slider("values", 0) +
            ":00 - " + ($("#slider-range").slider("values", 0) + 4) + ":00 (Hours)");
    // ----
    // 
    // 
    // 

    //WORLD hours data with percentages
    d3.csv('assets/csv/world_hours_data_new.csv', function(data) {

        //var brake_point = 60;
        var temp_1 = 0;
        var temp_2 = 0;
        var temp_3 = 0;
        var temp_4 = 0;
        var temp_5 = 0;

        for (var i = 0; i < data.length; i++)
        {
            world_hours_data[0].push({'x': i, 'y': parseInt(data[i]['UK'])});
            world_hours_data[1].push({'x': i, 'y': parseInt(data[i]['US'])});
            world_hours_data[2].push({'x': i, 'y': parseInt(data[i]['CEMEA'])});
            world_hours_data[3].push({'x': i, 'y': parseInt(data[i]['Asia'])});
            world_hours_data[4].push({'x': i, 'y': parseInt(data[i]['Mid_East'])});
            //
            temp_1 += parseInt(data[i]['UK_p']);
            temp_2 += parseInt(data[i]['US_p']);
            temp_3 += parseInt(data[i]['CEMEA_p']);
            temp_4 += parseInt(data[i]['Asia_p']);
            temp_5 += parseInt(data[i]['Mid_East_p']);
            //console.log(parseInt(data[i]['Mid_East_p']));

        }
        percent_data[0] = temp_1 / data.length;
        percent_data[1] = temp_2 / data.length;
        percent_data[2] = temp_3 / data.length;
        percent_data[3] = temp_4 / data.length;
        percent_data[4] = temp_5 / data.length;
        //console.log(percent_data);
        drawPieChart(percent_data);
        drawHoursGraph();

    });
    // US hours data
    d3.csv('assets/csv/us_hours_data_new.csv', function(data) {

        //var brake_point = 60;
        for (var i = 0; i < data.length; i++)
        {
            us_hours_data[0].push({'x': i, 'y': parseInt(data[i]['desktop'])});
            us_hours_data[1].push({'x': i, 'y': parseInt(data[i]['smartphone'])});
            us_hours_data[2].push({'x': i, 'y': parseInt(data[i]['tablet'])});
            us_hours_data[3].push({'x': i, 'y': parseInt(data[i]['other'])});

        }
        //  console.log(us_hours_data[0]);
        // drawHoursGraph();

    });

    // UK hours data
    d3.csv('assets/csv/uk_hours_data_new.csv', function(data) {

        //var brake_point = 60;
        for (var i = 0; i < data.length; i++)
        {
            uk_hours_data[0].push({'x': i, 'y': parseInt(data[i]['desktop'])});
            uk_hours_data[1].push({'x': i, 'y': parseInt(data[i]['smartphone'])});
            uk_hours_data[2].push({'x': i, 'y': parseInt(data[i]['tablet'])});
            uk_hours_data[3].push({'x': i, 'y': parseInt(data[i]['other'])});

        }
        //  console.log(us_hours_data[0]);
        // drawHoursGraph();

    });
    // CEMEA hours data
    d3.csv('assets/csv/cemea_hours_data_new.csv', function(data) {

        //var brake_point = 60;
        for (var i = 0; i < data.length; i++)
        {
            cemea_hours_data[0].push({'x': i, 'y': parseInt(data[i]['desktop'])});
            cemea_hours_data[1].push({'x': i, 'y': parseInt(data[i]['smartphone'])});
            cemea_hours_data[2].push({'x': i, 'y': parseInt(data[i]['tablet'])});
            cemea_hours_data[3].push({'x': i, 'y': parseInt(data[i]['other'])});

        }
        //  console.log(us_hours_data[0]);
        // drawHoursGraph();

    });
    // ASIA hours data
    d3.csv('assets/csv/asia_hours_data_new.csv', function(data) {

        //var brake_point = 60;
        for (var i = 0; i < data.length; i++)
        {
            asia_hours_data[0].push({'x': i, 'y': parseInt(data[i]['desktop'])});
            asia_hours_data[1].push({'x': i, 'y': parseInt(data[i]['smartphone'])});
            asia_hours_data[2].push({'x': i, 'y': parseInt(data[i]['tablet'])});
            asia_hours_data[3].push({'x': i, 'y': parseInt(data[i]['other'])});

        }
        //  console.log(us_hours_data[0]);
        // drawHoursGraph();

    });
    // Mid East hours data
    d3.csv('assets/csv/mid_east_hours_data_new.csv', function(data) {

        //var brake_point = 60;
        for (var i = 0; i < data.length; i++)
        {
            mid_east_hours_data[0].push({'x': i, 'y': parseInt(data[i]['desktop'])});
            mid_east_hours_data[1].push({'x': i, 'y': parseInt(data[i]['smartphone'])});
            mid_east_hours_data[2].push({'x': i, 'y': parseInt(data[i]['tablet'])});
            mid_east_hours_data[3].push({'x': i, 'y': parseInt(data[i]['other'])});

        }
        //  console.log(us_hours_data[0]);
        // drawHoursGraph();

    });

    // auto slider call
    setInterval(function() {
        // console.log('called');
         auto_slider();
    }, 20000);
    //
});