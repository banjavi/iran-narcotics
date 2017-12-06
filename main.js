/* ------------------------------------------------------------------------
   File Name: main.js
   Author: Bijan Anjavi
	 Description: An interactive choropleth of Iran depicting the amount of narcotic disclosure (kg) per Ostan.
   ------------------------------------------------------------------------ */

/************ Begin Global Variables ************/
var iranMapWidth = 1200,
	iranMapHeight = 800,
	iranMap = undefined;

var tooltipWidth = 600,
	tooltip = undefined;

var legendWidth = 800,
	legendHeight = 100,
	legend = undefined;

var narcoticRanges = [ 'heroin', 'morphine', 'opium', 'hashish', 'other'],
	narcoticChartHeight = 250,
	narcoticChartWidth = 350,
	narcoticBarWidth = 0,
	narcoticChart = undefined,
	narcoticScale = undefined,
	narcoticAxisX = undefined,
	narcoticAxisY = undefined,
	narcoticAxisScale = undefined,
	narcoticChartPadding = 20
	mapType = 'button-narcotics';

var colorPopulation = d3.scaleThreshold()
	//.domain([0, 20000, 40000, 60000, 80000, 100000, 120000, 140000])
	.range(d3.schemePurples[8]);
var colorNarcoticDisclosure = d3.scaleThreshold()
	.domain([0, 20000, 40000, 60000, 80000, 100000, 120000, 140000])
	.range(d3.schemeOranges[8]);
var colorIncome = d3.scaleThreshold()
	//.domain([0, 20000, 40000, 60000, 80000, 100000, 120000, 140000])
	.range(d3.schemeGreens[8]);

var x = d3.scaleLinear()
	.domain([0, 140000])
	.rangeRound([10, 350]);

var projection = undefined,
	path = undefined;

var nameById = {},
	totalById = {},
	heroinById = {},
	morphineById = {},
	opiumById = {},
	hashishById = {},
	otherById = {},
	narcoticArray = {};
/************ End Global Variables ************/



/************ Begin Main Calls ************/
// draw the legend for the iranMap
drawLegend();

// initialize bar chart in sidebar
initializeNarcoticsChart();

// initialize projections, paths, etc.
initializeIranMap();

/************ End Main Calls ************/



/************ Begin Functions ************/

/* Description: initialize svg, tooltip, projection and path + load data files. */
function initializeIranMap(){
	iranMap = d3.select("#container-two").append("svg")
		.attr("id", "iran-map")
		.attr("width", iranMapWidth)
		.attr("height", iranMapHeight);
	tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0)
		.style("width", tooltipWidth);

	// wait till topoJSON and CSV are loaded completely prior to drawing the svg map
	d3.queue()
		.defer(d3.json, "iran_topo.json")
		.defer(d3.csv, "narcotics.csv")
		.await(drawIranMap); // call to draw the svg

	//c.tile.openstreetmap 4/10/6 - 1st prokection - find corners find the 4 corners
	//4/9/6 -- more corners onkeyup="
	///"
	// user mercator instead for iran projection
	projection = d3.geoMercator()
		.center([53, 35])
		.scale(2000)
		.translate([iranMapWidth / 3, iranMapHeight / 3]);
	path = d3.geoPath().projection(projection);
}

/* Description: Draw the paths for each of the Ostans making up the country of Iran, adding js interactivity along the way. */
function drawIranMap(error, json, data) {
	if (error) throw error;
	console.log(json);

	// populate dictionaries
	data.forEach(function(d) {
		nameById[d.id] = d.ostan;
		totalById[d.id] = +d.total;
		heroinById[d.id] = d.heroin;
		morphineById[d.id] = d.morphine;
		opiumById[d.id] = d.opium;
		hashishById[d.id] = d.hashish;
		otherById[d.id] = d.other;
		// might not need above after this
		narcoticArray = {name: d.ostan, total: d.total, heroin: d.heroin, morphine: d.morphine, opium: d.opium, hahish: d.hashish, other: d.other};
	});

	// draw ostans
	iranMap.selectAll('.ostan')
		.data(topojson.feature(json, json.objects.ir).features)
		.enter().append('path')
			.attr("fill", function(d) {console.log("name: " + d.properties.name + " | id: " + totalById[d.properties.adm1_code]); return colorNarcoticDisclosure(totalById[d.properties.adm1_code]);})
			.attr('stroke', 'gray')
			.attr('stroke-width', '0.5')
			.attr('id', function (d) { return d.properties.adm1_code})
			.attr('class', 'ostan')
			.attr('d', path)
				.on("mouseover", function (d) {
					var tip = "<h3>" + d.properties.name + "</h3>"; // update tooltip with new ostan name

					tooltip.html(tip)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY) + "px");
					tooltip.transition()
						.duration(500)
						.style("opacity", .7);

					updateChart(d.properties.adm1_code); // update bar chart upon hovering new ostan

				})
				.on("mouseout", function (d) { // fade tooltip away
					tooltip.transition()
					.duration(500)
					.style("opacity", 0);
				});
}


/* Description: initialize svg and all associated variables for bar chart display. */
function initializeNarcoticsChart(){
	setNarcoticScales();
	// svg
	narcoticChart = d3.select("#chart").append("svg")
		.attr("width", narcoticChartWidth)
		.attr("height", narcoticChartHeight)
		.append('svg:g')
			.attr('transform', 'translate('+ (narcoticChartPadding) +',0)');

	// y-axis sidebar chart
	narcoticChart.append('svg:g')
		.attr('class', 'chart-axis')
		.attr('id', 'chart-narcotic-yaxis')
		.attr('transform', 'translate(20,'+ (narcoticChartPadding  ) +')')
		.call(narcoticAxisY);

	narcoticChart.selectAll('#chart-narcotic-yaxis line')
	.attr("x1", 0)
	.attr("x2", narcoticChartWidth - narcoticChartPadding-narcoticChartPadding-narcoticChartPadding)
	.style("stroke", "#ccc");

	// x-axis sidebar chart
	var xaxis = narcoticChart.append('svg:g')
		.attr('class', 'chart-axis')
		.attr('id', 'chart-narcotic-xaxis')
		.attr('transform', 'translate(' + narcoticChartPadding +',' + (narcoticChartHeight - narcoticChartPadding/3) +')');

	xaxis.selectAll('.narcotic-axis-x')
		.data(narcoticRanges)
		.enter().append('text')
			.attr('x', function(i,d){console.log(d); return narcoticBarWidth * (d + .5);})
			.attr('text-anchor', 'middle')
			.attr('class', 'narcotic-axis-x')
			.text(function(d){return d;});

	// bars
	narcoticChart.selectAll('.narcotic-bar')
		.data(narcoticRanges)
		.enter()
		.append('rect')
			.attr('class', 'narcotic-bar')
			.attr('width', narcoticBarWidth-1)
			.attr('y', narcoticChartHeight - narcoticChartPadding)
			.attr('x', function(d,i){return narcoticChartPadding +  i * narcoticBarWidth});
}


/* Description: set scales for axes and values of the sidebar chart. */
function setNarcoticScales(){
	narcoticBarWidth = (narcoticChartWidth-narcoticChartPadding -narcoticChartPadding-narcoticChartPadding) / narcoticRanges.length;
	narcoticScale = d3.scaleLinear()
		.domain([0, 100])
		.range([0,narcoticChartHeight - 2*narcoticChartPadding]);
	narcoticAxisScale = d3.scaleLinear()
		.domain([100,0])
		.range([0,narcoticChartHeight - 2*narcoticChartPadding]);

	// y-axis
	narcoticAxisY = d3.axisLeft(narcoticAxisScale)
		.ticks(10)
		.tickFormat(function(d){return d + '%';});

	// x-axis
	narcoticAxisX = d3.axisBottom(narcoticRanges)
	.ticks(narcoticRanges.length)
}

/* Description: update values and view of the sidebar chart when a new ostan is hovered over */
function updateChart(id){
	var chartLabel;
	var chartLabelValue;
	if( mapType == 'button-narcotics'){
		chartLabel = 'Total Narcotic Disclosure (kg)';
		chartLabelValue = totalById[id];
	}
	else if( mapType == 'button-population'){
		chartLabel = 'Total Population';
		//chartLabelValue = obj['census']['nativePopPct'] + '%'
	}
	else if( mapType == 'button-income'){
		chartLabel = 'Total Household Income'
		//chartLabelValue = '$' + addCommas(obj['census']['medianHouseholdIncome'])
	}
	var chartTitle = nameById[id] + " Narcotic Distribution";

	d3.select(".sidebar-type").text(chartLabel);
	d3.select(".sidebar-value").text(chartLabelValue);
	d3.select("#sidebar-title").text(chartTitle);

	var narcoticTotal = totalById[id];
	var narcoticDistributionPercentages = [heroinById[id]/narcoticTotal*100, morphineById[id]/narcoticTotal*100, opiumById[id]/narcoticTotal*100, hashishById[id]/narcoticTotal*100, otherById[id]/narcoticTotal*100];
	//console.log("HEY " + narcoticDistributionPercentages);
	var rect = narcoticChart.selectAll('.narcotic-bar')
		.data(narcoticRanges)
		rect.enter()
		.append('rect')
			.attr('class', 'narcotic-bar')
			.attr('width', narcoticBarWidth-1)
			.attr('x', function(d,i){return narcoticChartPadding +  i * narcoticBarWidth});

	// transition for bars changing upon new ostan
	rect.transition()
	.duration(500).attr('height', function(d,i){
	//console.log("HEIGHT | i:" + i + "| array: " + narcoticDistributionPercentages[d] + " scale:" + narcoticScale(narcoticDistributionPercentages[i]) );
	return narcoticScale(narcoticDistributionPercentages[i]);
	})
	.attr('y', function(d,i){
	//console.log("Y | i:" + i + "| array: " + narcoticDistributionPercentages[i] + " scale:" + narcoticScale(narcoticDistributionPercentages[i]) );
	return narcoticChartHeight - narcoticChartPadding - narcoticScale(narcoticDistributionPercentages[i]);
	});
}

/* Description: draws legend for iranMap */

function drawLegend(){
	var svgLegend = d3.select("#legend").append("svg")
			.attr("id", "legend")
			.attr("width", 800)
			.attr("height", 100);
			var g = svgLegend.append("g")
					.attr("class", "key")
					.attr("transform", "translate(0,40)");
			g.selectAll("rect")
				.data(colorNarcoticDisclosure.range().map(function(d) {
						d = colorNarcoticDisclosure.invertExtent(d);
						if (d[0] == null) d[0] = x.domain()[0];
						if (d[1] == null) d[1] = x.domain()[1];
						return d;
					}))
				.enter().append("rect")
					.attr("height", 12)
					.attr("x", function(d) { return x(d[0]); })
					.attr("width", function(d) { return x(d[1]) - x(d[0]); })
					.attr("fill", function(d) { return colorNarcoticDisclosure(d[0]); });
			g.append("text")
					.attr("class", "caption")
					.attr("x", x.range()[0])
					.attr("y", -6)
					.attr("fill", "#000")
					.attr("text-anchor", "start")
					.attr("font-weight", "bold")
					.text("Narcotic Disclosure (Thousands of kilograms)");
			g.call(d3.axisBottom(x)
					.tickSize(13)
					.tickFormat(function(x, i) { return i ? x : x  + "K"; })
					.tickFormat(function(x, i) { return x / 1000; })
					.tickValues(colorNarcoticDisclosure.domain()))
				.select(".domain")
					.remove();
}

/************ End Functions ************/
