
var ROUND = 1;

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function play() {
    //increment; settimeout
}

function increment() {
    // start with .round1 on
    // all others off

    d3.selectAll('.round'+ROUND).attr('class','faded');
    ROUND++;
    d3.selectAll('.round'+ROUND).attr('class','on');
}


//create your containing svg
var svg = d3.select('body').append('svg');

var map = mapsense.map() // init the map
    .container(svg.node()) //tell it where to go
    .add(mapsense.interact()) //add interaction
    //.center({lon: -122.437, lat: 37.757}) // sf-ish
    .center({lon: -96.0, lat: 39.83}) // us48 39.828175,-98.5795
    .zoom(4.5); //set a zoom


url_query = "https://{S}-tiles.mapsense.co/mapsense.demographics/tile/{Z}/{X}/{Y}.topojson?where=layer=='state'";
var layer = mapsense.topoJson() //init a topojson layer
    .url(mapsense.url(url_query).hosts(['a', 'b', 'c', 'd'])) //tell it where to look
    .selection(
        function(d){
            d.attr("class", "states")
        }
    )

map.add(layer); //add the topojson layer to your map


geojson_url = "src/ncaa64.json";
//var ncaa_layer = mapsense.topoJson() //init a topojson layer
/*var ncaa_data = {};
*/

var TEMP;

var ncaa_layer = mapsense.geoJson() //init a geojson layer
    .url(geojson_url) //tell it where to look
    //.features()
    .selection( // sets/gets the selection function
        function(d){
            d.attr("class", "ncaa_pts") //use a d3 selection to class each feature 
            //.style("fill", "none")
            /*.style("stroke", "black")
            .style("fill", "orange")
            .style("fill-opacity", "0.3")
            .attr("rank","foo")*/

            TEMP=d;
            /*console.log(d);
            console.log(d.node());
            console.log(d.node().getBBox().x);
*/
            /*var x = d.node().getBBox().x;
            var y = d.node().getBBox().y;

            var parent = d3.select(this.parentNode);
            parent.append("text")
                .text("foo")
                    .attr("x", x)
                    .attr("y", y)*/
            
        }
    )

    //.attr("id", "ncaa_pts")
//map.add(ncaa_layer); //add the geojson layer to the map

// instead of assigning the url via mapsense, we'll use a basic d3 object:
var ncaa_pts, seeds_01;
d3.json(geojson_url, function(the_geojson) {
    ncaa_pts = the_geojson;
    var ncaa_features = the_geojson.features;
    var ncaa_layer = mapsense.geoJson()
        .features(the_geojson.features)
        .selection(function(d){
            d.attr('id', function(feature) {
                var id = '';
                if (feature.properties){
                    if (feature.properties.Team)       
                        id = feature.properties.Team;          
                }
                return id;
            }),
            d.attr('class', function(feature) {
                var classes = ['shape_on','team-pt'];
                if (feature.properties){
                    if (feature.properties.Seed)
                        classes.push(feature.properties.Seed);
                }
                return classes.join(' ');
            }),
            d.attr('data-seed', function(feature) {
                var seed = '';
                if (feature.properties){
                    if (feature.properties.Seed)       
                        seed = feature.properties.Seed;          
                }
                return seed;
            })


        });

    map.add(ncaa_layer);

/*var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + 'd' + "</span>";
  })

  d3.selectAll('.shape_on').call(tip);*/

  d3.selectAll('.shape_on')
    .on('mouseover', function(d) {
        //console.log(d.attr('class'));
        console.log(d.properties.Seed, d.properties.Team);
    })

    // Add labels. (To fix)
    // replace the shape-pt with a container containing the shape-pt and a text node
/*    d3.selectAll('.shape_on').data(['testing'])
            .enter()
            .append('text')
            .text('test text')*/

        /*
    select(function() {
        var orig_obj = this;
        console.log(orig_obj);
        //d3.select(this).html('');

        d3.select(this).data(['testing'])
            .enter()
            .append('text')
            .text('test text')

        var container = d3.select(document.createElement("g"))
            .attr('class','empty')
            .data
            //.moveToFront();

        return container;

        container.append(orig_obj)
            .on('mouseover', function(d) {
                console.log('fee');
            })

        container.append("text")
            .text('fubar')     

        this.append(container); 
    })
    */          
    


    var GJ_ARCS = [];


    // "First" round: i <= 8; underdogs 16-1+1
    // "Second" round: i <= 4; underdogs 8-1+1
    ROUND = 1;

});


function filterGeoJSON(gj_data, prop, val) {
        var features = [];
        var geojson = { 'type': 'FeatureCollection',
                        'features': features
                      };
        
        var data = gj_data.features;
        for(var i=0, len=data.length-1; i<len; i++){
            if ( data[i].properties[prop] == val ) {
                features.push(data[i]);
            }
        }

        return geojson;
};


function setStateFromRound(round) {
    var teams_in_region = 16 / Math.pow(2,round-1);
    /*
    Round | teams in region | total teams
    1   16  64
    2   8   32      1 vs 8
    3   4   16      1 vs 4
    4   2   8       1 vs 2
    5   1   4       1 vs 1
    6   -   2
    r   16/2^r
    */ 
    /*
    First fade out any previous elements
    */
    d3.selectAll('.path_on').attr('class','path_fade');
    d3.selectAll('.shape_on').attr('class','shape_fade');
    var GJ_ARCS = [];

    if (round == 6) {
        teams_in_region = 1;
        i = 1, j = 0;
        GJ_ARCS[i] = [];
        var final_four = filterGeoJSON(ncaa_pts, 'Seed', i);    
        // turn on the point shapes that survive:
        var odds = d3.selectAll('[data-seed="'+i+'"]').select(function() {
            var index = Array.prototype.indexOf.call(this.parentElement.children, this);
            return (index % 2) == 1 ? this : null;
        })
        .attr('class','shape_on'); 

        var gj_arc = twoCoords2geojsonArc( final_four.features[0].geometry.coordinates, final_four.features[2].geometry.coordinates );
        GJ_ARCS[i][j] = mapsense.geoJson() //init a geojson layer
            .features(gj_arc.features)
            .selection( 
                function(d){
                    d.attr('class','path_on round-6')
                }
            )        
        map.add(GJ_ARCS[i][j]);         
        return;        
    }

    if (round == 5) {
        teams_in_region = 1;
        i = 1, j = 0;
        GJ_ARCS[i] = [];
        var final_four = filterGeoJSON(ncaa_pts, 'Seed', i);
        // turn on the point shapes that survive:
        d3.selectAll('[data-seed="'+i+'"]').attr('class','shape_on');

        var gj_arc = twoCoords2geojsonArc( final_four.features[0].geometry.coordinates, final_four.features[1].geometry.coordinates );
        GJ_ARCS[i][j] = mapsense.geoJson() //init a geojson layer
            .features(gj_arc.features)
            .selection( 
                function(d){
                    d.attr('class','path_on round-5')
                }
            )        
        map.add(GJ_ARCS[i][j]);       

        i = 1, j = 1;
        var gj_arc = twoCoords2geojsonArc( final_four.features[2].geometry.coordinates, final_four.features[3].geometry.coordinates );
        GJ_ARCS[i][j] = mapsense.geoJson() //init a geojson layer
            .features(gj_arc.features)
            .selection( 
                function(d){
                    d.attr('class','path_on round-5')
                }
            )        
        map.add(GJ_ARCS[i][j]);         
        return;        
    }

    for (var i = 1; i <= teams_in_region/2; i++) {
        GJ_ARCS[i] = [];
        udog_seed = teams_in_region-i+1;
        var favorites = filterGeoJSON(ncaa_pts, 'Seed', i);
        var underdogs = filterGeoJSON(ncaa_pts, 'Seed', udog_seed);
        // turn on the point shapes that survive:
        d3.selectAll('[data-seed="'+i+'"]').attr('class','shape_on');
        d3.selectAll('[data-seed="'+udog_seed+'"]').attr('class','shape_on');
        
        for (j = 0; j < 4; j++) {
            if ( favorites.features[j] && underdogs.features[j] ) {
                //console.log(i, j);
                //console.log(i, favorites.features[j].properties.Team);
                //console.log(teams_in_region-i+1,  underdogs.features[j].properties.Team);
                var gj_arc = twoCoords2geojsonArc( favorites.features[j].geometry.coordinates, underdogs.features[j].geometry.coordinates );
                // temp hack
                GJ_ARCS[i][j] = mapsense.geoJson() //init a geojson layer
                    .features(gj_arc.features)
                    .selection( // sets/gets the selection function
                        function(d){
                            d.attr('class','path_on round-'+round)
                            //.style("fill", "none")
                            //.style("stroke", "black")
                        }
                    )        
                map.add(GJ_ARCS[i][j]); 
            }
        }
    }

    d3.selectAll('.path_on').moveToFront();
}


function twoCoords2geojsonArc(coord_a, coord_b) { // [lon, lat], [lon, lat]
// --- Add paths
        // Format of object is an array of objects, each containing

        var features = [];
        var geojson = { 'type': 'FeatureCollection',
                        'features': features
                      };
        
            var start = {
                x: coord_a[0],
                y: coord_a[1]
            };
            var end = {
                x: coord_b[0],
                y: coord_b[1]
            }
            var generator = new arc.GreatCircle(start, end, {'name': ''});
            var line = generator.Arc(100,{offset:10}); // lines w/in 10deg of dateline will be split
            var gj_line = line.json();
            features.push(line.json());
        

        return geojson;
        //console.log(JSON.stringify(geojson));
}


function connectTheDots(gj_data) {
// --- Add paths
        // Format of object is an array of objects, each containing


        var features = [];
        var geojson = { 'type': 'FeatureCollection',
                        'features': features
                      };
        
        var data = gj_data.features;
        for(var i=0, len=data.length-1; i<len; i++){
            // (note: loop until length - 1 since we're getting the next
            //  item with i+1)
            var start = {
                x: data[i].geometry.coordinates[0],
                y: data[i].geometry.coordinates[1]
            };
            var end = {
                x: data[i+1].geometry.coordinates[0],
                y: data[i+1].geometry.coordinates[1]
            }
            var generator = new arc.GreatCircle(start, end, {'name': 'arc_' + i});
            var line = generator.Arc(100,{offset:10}); // lines w/in 10deg of dateline will be split
            var gj_line = line.json();
            features.push(line.json());
        }

        return geojson;
        //console.log(JSON.stringify(geojson));
        

}


var button_group = svg.append('g');
for (var i = 1; i < 7; i++) {
    // first create container for both the circle and the text
    container = button_group.append('g')
        .attr('transform','translate('+110*i+',50)')
        .moveToFront();

    temp_circle = container.append('circle')
        .attr('class','round-button')
        .attr('data-round', i)
        .attr('r', 50)
        .on('mouseover', function(d) {
            d3.select(this).attr('class','round-button-hover')
            var round = d3.select(this).attr('data-round');
            setStateFromRound(round);
        })
        .on('mouseout', function(d) {
            d3.select(this).attr('class','round-button')
        })

    var round_names = {
        3: 'Sweet Sixteen',
        4: 'Elite Eight',
        5: 'Final<br>Four',
        6: 'Finals'
    }
    /*container.append("text")
        .attr("dx", function(d){return -33})
        .attr("dx", function(d){return -33})
        .attr("dy", function(d){return -3})
     */ 

    if ( i < 3) {
        //container.select('text').text('Round '+i);
        cont_text = 'Round '+i;
    } else {
        cont_text = round_names[i];
    }

    container.append('foreignObject')
                        .attr('x', -50)
                        .attr('y', -50)
                        .attr('width', 100)
                        .attr('height', 100)
                        .attr('style', 'pointer-events: none')
                        .append("xhtml:body")
    .html('<div class="button-text-wrap"><div class="button-text-inner">'+cont_text+'</div></div>')

    //container.select('text').call(wrap, 30); // wrap the text in <= 30 pixels
 }; 

/*
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1, // ems
        //lineHeight = 1.1, // ems
        //y = text.attr("y"),
        y = 0,
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        var new_y = ++lineNumber * lineHeight + dy + "em";
        console.log(word, new_y);
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", new_y).text(word);
      }
    }
  });
}*/