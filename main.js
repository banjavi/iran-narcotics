

var width = 2000,
		height = 1000;
var narcoticRanges = [ 'heroin', 'morphine', 'opium', 'hashish', 'other'],
			narcoticChartH = 250,
			narcoticChartW = 350,
			narcoticBarW = 0,
			narcoticChart = undefined,
			narcoticScale = undefined,
			narcoticAxisX = undefined,
			narcoticAxisY = undefined,
			narcoticAxisScale = undefined,
			narcoticChartP = 20
			mapType = 'button-narcotics';

var color = d3.scaleThreshold()
.domain([0, 20000, 40000, 60000, 80000, 100000, 120000, 140000])
.range(d3.schemeOranges[8]);

var x = d3.scaleLinear()
.domain([0, 140000])
		.rangeRound([10, 350]);
var svg = d3.select("#map-container-two").append("svg")
		.attr("id", "iran-map")
		.attr("width", width)
		.attr("height", height);

		var tooltip = d3.select("body").append("div")
								.attr("class", "tooltip")
								.style("opacity", 0)
								.style("width", 600);


var svgLegend = d3.select("#map-legend").append("svg")
		.attr("id", "legend")
		.attr("width", 800)
		.attr("height", 100);
		var g = svgLegend.append("g")
				.attr("class", "key")
				.attr("transform", "translate(0,40)");

		g.selectAll("rect")
			.data(color.range().map(function(d) {
					d = color.invertExtent(d);
					if (d[0] == null) d[0] = x.domain()[0];
					if (d[1] == null) d[1] = x.domain()[1];
					return d;
				}))
			.enter().append("rect")
				.attr("height", 12)
				.attr("x", function(d) { return x(d[0]); })
				.attr("width", function(d) { return x(d[1]) - x(d[0]); })
				.attr("fill", function(d) { return color(d[0]); });

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
				.tickValues(color.domain()))
			.select(".domain")
				.remove();


generateNarcoticsChart();


function generateNarcoticsChart(){


		setNarcoticScales();
		narcoticChart = d3.select("#map-distribution-chart").append("svg")
		    .attr("width", narcoticChartW)
		    .attr("height", narcoticChartH)
			.append('svg:g')
						.attr('transform', 'translate('+ (narcoticChartP) +',0)')

		narcoticChart.append('svg:g')
						.attr('class', 'chart-axis')
						.attr('id', 'chart-narcotic-yaxis')
						.attr('transform', 'translate(20,'+ (narcoticChartP  ) +')')
						.call(narcoticAxisY);


		narcoticChart.selectAll('#chart-narcotic-yaxis line')
				.attr("x1", 0)
		    	.attr("x2", narcoticChartW - narcoticChartP-narcoticChartP-narcoticChartP)
		    	.style("stroke", "#ccc");

		var xaxis = narcoticChart.append('svg:g')
			.attr('class', 'chart-axis')
			.attr('id', 'chart-narcotic-xaxis')
			.attr('transform', 'translate(' + narcoticChartP +',' + (narcoticChartH - narcoticChartP/3) +')')

		xaxis.selectAll('.narcotic-axis-x')
			.data(narcoticRanges)
			.enter().append('text')
			.attr('x', function(i,d){
				console.log(d);
				return narcoticBarW * (d + .5);
			})
			.attr('text-anchor', 'middle')
			.attr('class', 'narcotic-axis-x')
			.text(function(d){
				return d;
			})


			narcoticChart.selectAll('.narcotic-bar')
				.data(narcoticRanges)
				.enter()
				.append('rect')
						.attr('class', 'narcotic-bar')
						.attr('width', narcoticBarW-1)
						.attr('y', narcoticChartH - narcoticChartP)
						.attr('x', function(d,i){
							return narcoticChartP +  i * narcoticBarW
						})





	}



	function setNarcoticScales(){
		narcoticBarW = (narcoticChartW-narcoticChartP -narcoticChartP-narcoticChartP) / narcoticRanges.length
		narcoticScale = d3.scaleLinear()
		    .domain([0, 100])
		    .range([0,narcoticChartH - 2*narcoticChartP]);
		narcoticAxisScale = d3.scaleLinear()
		    .domain([100,0])
		    .range([0,narcoticChartH - 2*narcoticChartP]);


		narcoticAxisY = d3.axisLeft(narcoticAxisScale)
		    .ticks(10)
		    .tickFormat(function(d){
			return d + '%';
		})

		narcoticAxisX = d3.axisBottom(narcoticRanges)
		    .ticks(narcoticRanges.length)


	}











	function populateChart(id){

				var chartLabel = '';
				var chartLabelValue = '';
			if( mapType == 'button-narcotics'){
				chartLabel = 'Total Narcotic Disclosure (kg)';
				chartLabelValue = totalById[id];
			} else if( mapType == 'button-population'){
				chartLabel = 'Total Population';
				//chartLabelValue = obj['census']['nativePopPct'] + '%'
			} else if( mapType == 'button-income'){
				chartLabel = 'Total Household Income'
				//chartLabelValue = '$' + addCommas(obj['census']['medianHouseholdIncome'])
			}

			var chartTitle = nameById[id] + " Narcotic Distribution";

			d3.select(".map-popup-type").text(chartLabel);
			d3.select(".map-popup-value").text(chartLabelValue);

			d3.select("#popup-title").text(chartTitle);

			var narcoticTotal = totalById[id];
			var narcoticDistributionPercentages = [heroinById[id]/narcoticTotal*100, morphineById[id]/narcoticTotal*100, opiumById[id]/narcoticTotal*100, hashishById[id]/narcoticTotal*100, otherById[id]/narcoticTotal*100];
			console.log("HEY " + narcoticDistributionPercentages);
			var rect = narcoticChart.selectAll('.narcotic-bar')
				.data(narcoticRanges)
				rect.enter()
				.append('rect')
						.attr('class', 'narcotic-bar')
						.attr('width', narcoticBarW-1)
						.attr('x', function(d,i){
							return narcoticChartP +  i * narcoticBarW
						})


				rect.transition()
					.duration(500).attr('height', function(d,i){
						//console.log("HEIGHT | i:" + i + "| array: " + narcoticDistributionPercentages[d] + " scale:" + narcoticScale(narcoticDistributionPercentages[i]) );

						 	return narcoticScale(narcoticDistributionPercentages[i]);
						})
						.attr('y', function(d,i){
							//console.log("Y | i:" + i + "| array: " + narcoticDistributionPercentages[i] + " scale:" + narcoticScale(narcoticDistributionPercentages[i]) );

							return narcoticChartH - narcoticChartP - narcoticScale(narcoticDistributionPercentages[i]);
						})

	}



































d3.queue()
.defer(d3.json, "iran_topo.json")

		.defer(d3.csv, "narcotics.csv")
		.await(ready);

		//c.tile.openstreetmap 4/10/6 - 1st prokection - find corners find the 4 corners
		//4/9/6 -- more corners onkeyup="
		///"
// user mercator instead for iran projection
var projection = d3.geoMercator()
.center([53, 35])
.scale(2000)
.translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);

var nameById = {};
var totalById = {};
var heroinById = {};
var morphineById = {};
var opiumById = {};
var hashishById = {};
var otherById = {};
var x;
function ready(error, json, data) {
	if (error) throw error;
	console.log(json);


	data.forEach(function(d) {
	 nameById[d.id] = d.ostan;
	 totalById[d.id] = +d.total;
	 heroinById[d.id] = d.heroin;
	 morphineById[d.id] = d.morphine;
	 opiumById[d.id] = d.opium;
	 hashishById[d.id] = d.hashish;
	 otherById[d.id] = d.other;

 });





	svg.selectAll('.ostan')
		.data(topojson.feature(json, json.objects.ir).features)
	.enter().append('path')
		.attr("fill", function(d) {console.log("name: " + d.properties.name + " | id: " + totalById[d.properties.adm1_code]); return color(totalById[d.properties.adm1_code]);})
		.attr('stroke', 'gray')
		.attr('stroke-width', '0.5')
		.attr('id', function (d) { return 'state_' + d.properties.adm1_code})
		.attr('class', 'ostan')
		.attr('d', path)
		.on("mouseover", function (d) {
				var tip = "<h3>" + d.properties.name + "</h3>";
				tooltip.html(tip)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY) + "px");
				tooltip.transition()
						.duration(500)
						.style("opacity", .7);

				populateChart(d.properties.adm1_code);




		})
		.on("mouseout", function (d) {
				tooltip.transition()
						.duration(500)
						.style("opacity", 0);
		});
		}
