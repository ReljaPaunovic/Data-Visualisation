// Making a svg object to put visualisation in

var width = 940,
    height = 740;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("id", "map");

var temp; // helper for highlighting

var xAxisLabel = "Age"; 
var yAxesLabel = "Migration"; //  Initial label

var xCoordinateScale = 15; // for adjusting the representation of data
var yCoordinateScale = 35;
var yCoordinateTranslate = 0.5*height;

var flag = [0,1,1,1,1,1,1,1]; // flags for country groups
var zoom = .01; // default zoom value
	
var svgScatterPlot = d3.select("body").append("svg") // we make another svg element for scatterplot
	.attr("width", width)
	.attr("height", height)
	.attr("id", "scatterPlot");
    
// Axises
var xAxis = d3.svg.axis();
var yAxis = d3.svg.axis();

var xDomainRange = [0,width/15];  //  Age
var yDomainRange = [-height/(35*2), height/(35*2)]; // Migration initially

//Gridlines
function drawGridLines(n, translate, scale){
	svgScatterPlot.selectAll("line").remove();
	for(var i = 1; i < 13 ; i++){
		svgScatterPlot.append("line")
					.attr("x1", ""+ i * width / 12.5 +"")
					.attr("x2", ""+ i * width / 12.5 +"")
					.attr("y1", "" + 0 + "")
					.attr("y2", "" + height + "")
					.style("stroke", "gray")
					.style("stroke-width", "1px");
	}
	for(var i = 1; i < n ; i++){
		svgScatterPlot.append("line")
					.attr("x1", ""+ 0 +"")
					.attr("x2", ""+ width +"")
					.attr("y1", "" + (translate + height - i * height / scale) + "")
					.attr("y2", "" + (translate + height - i * height / scale) + "")
					.style("stroke", "gray")
					.style("stroke-width", "1px");
	}
}
drawGridLines(11, -17, 10.5);
// End of gridlines

function showValue(newValue)
{
	document.getElementById("range").innerHTML=newValue;
	drawVisualisations();
}
function drawVisualisations(){
	// MAP
	d3.json("./Data/result.json", function(error, world) {
		svg.selectAll("*").remove();
		if (error) 
			return console.error(error);
		var subunits = topojson.feature(world, world.objects.subunits);
		var projection = d3.geo.mercator()
			.translate([width / 2 , height / 1.5]);
		var path = d3.geo.path()
			.projection(projection);
		//borders
		svg.append("path")
			.datum(topojson.mesh(world, world.objects.subunits, function(a, b) { return a !== b }))
			.attr("d", path)
			.attr("class", "borders");
		//countries
		svg.selectAll(".subunit")
			.data(topojson.feature(world, world.objects.subunits).features)
			.enter().append("path")
			.attr("class", function(d){
					if( d["properties"][document.getElementById("range").innerHTML] <= 20)
						return "class1";
					if( d["properties"][document.getElementById("range").innerHTML] <= 30 && d["properties"][document.getElementById("range").innerHTML] > 20)
						return "class2";
					if( d["properties"][document.getElementById("range").innerHTML] <= 40 && d["properties"][document.getElementById("range").innerHTML] > 30)
						return "class3";
					if( d["properties"][document.getElementById("range").innerHTML] <= 50 && d["properties"][document.getElementById("range").innerHTML] > 40)
						return "class4";
					if( d["properties"][document.getElementById("range").innerHTML] <= 60 && d["properties"][document.getElementById("range").innerHTML] > 50)
						return "class5";
					else
						return "class6";
					})
			.attr("id", function(d){
					var newName = d["properties"]["name"];
					if (newName in countryNames){
						return countryNames[newName]["OldName"] + "map";//d["properties"]["name"] + "map";
					}
					return newName + "map";
				})
			.attr("d", path)
			.on("mouseover", function(d){ 
				d3.select(this).style({stroke: "black", "stroke-width": "2px"});
				document.getElementById("countryName").innerHTML = d["properties"]["name"];
				// Highlight the country on scatterplot
				var newName = d["properties"]["name"];
				if (newName in countryNames){
					temp = document.getElementById( countryNames[newName]["OldName"] ).style.fill;				
					document.getElementById( countryNames[newName]["OldName"] ).style.fill = "hsl(120, 75%, 0%)";
				}
				else{
					temp = document.getElementById( newName ).style.fill;				
					document.getElementById( newName ).style.fill = "hsl(120, 75%, 0%)";
				}
				
			})
			.on("mouseout", function(d){ 
					d3.select(this).style({stroke: "black", "stroke-width": "0px"});
					// Change back to original color on scatterplot
					var newName = d["properties"]["name"];
					if (newName in countryNames){
						document.getElementById( countryNames[newName]["OldName"] ).style.fill = temp;
					}
					else{
						document.getElementById( newName ).style.fill = temp;
					}	
				});
	});
	// END OF MAP
	//Axis
	xScale = d3.scale.linear()
		.range([ 0, width])
		.domain(xDomainRange);
	yScale = d3.scale.linear()
		.range([ height,0])
		.domain(yDomainRange);
				
	xAxis.scale(xScale);
	yAxis.scale(yScale);
			
	xAxis.orient("top");
	yAxis.orient("right");
	
	svgScatterPlot.selectAll("g").remove();
	svgScatterPlot.append("g")
		.attr("transform", "translate(0, " + height + ")")
		.call(xAxis)
		.append("text")
			.attr("class", "axisText")
			.attr("x", width)
			.attr("y", -30)
			.style("text-anchor", "end")
			.text("Age");
	svgScatterPlot.append("g")
		.attr("class", "axis")
		.call(yAxis)
		.append("text")
			.attr("class", "axisText")
			.attr("x", 125)
			.attr("y", 30)
			.style("text-anchor", "end")
			.text(yAxesLabel);
	// End Of Axis
	// Scatterplot
	d3.json("./Data/1950-2015MigrationVsAgeFinal.json", function(error, ageVsMigration) {
		svgScatterPlot.selectAll("circle").remove();
		if (error) 
			return console.error(error);
		//axis was here
		svgScatterPlot.selectAll("points")
			.data(ageVsMigration)
			.enter()
			.append("circle")
			.attr("cx", function(d){ return xCoordinateScale * d[document.getElementById("range").innerHTML + xAxisLabel];}) //d[document.getElementById("range").innerHtml + "Age"];})
			.attr("cy", function(d){ 
				//alert( document.getElementById("range").innerHTML + xAxisLabel);
				return yCoordinateTranslate - yCoordinateScale * d[document.getElementById("range").innerHTML + yAxesLabel];})
			.attr("r", function(d){
                if ((flag[0] == 1) && (d["name"] == "India" || d["name"] == "China"))
					return d[document.getElementById("range").innerHTML + "Population"]*zoom/ 200;
				return d[document.getElementById("range").innerHTML + "Population"]*zoom / 50;
				})
			.style("stroke", "black")
			.style("stroke-width", "2px")
			.attr("class", function(d){
				if( flag[1] == 1 && d["Region"] == "Africa")	
					return "Africa";
				if( flag[2] == 1 && d["Region"] == "Asia")
					return "Asia";
				if( flag[3] == 1 && d["Region"] == "Australia")
					return "Australia";
				if( flag[4] == 1 && d["Region"] == "Europe")
					return "Europe";
				if( flag[5] == 1 && d["Region"] == "Latin America")
					return "LatinAmerica";
				if( flag[6] == 1 && d["Region"] == "North America")
					return "NorthAmerica";
				if( flag[7] == 1 && d["Region"] == "others")
                    return "Others";
                else
					return "Invisible";
				})
			.attr("id", function(d){
						return d["name"];
				})
			.on("mouseover", function(d){
				document.getElementById("countryName").innerHTML = d["name"];
				d3.select(this).style({stroke: "gray", "stroke-width": "2px"});
				// Highligh on map
				temp = document.getElementById( d["name"] + "map").style.fill;
				document.getElementById( d["name"] + "map").style.fill = "hsl(120, 75%, 0%)";
			})
			.on("mouseout", function(d){
				d3.select(this).style({stroke : "black"});
				// Change back to original color on map
				document.getElementById( d["name"] + "map" ).style.fill = temp;
			});
	});
	// End of Scatterplot
}
var temp;
var Stopped;
function runAnimation(){
	Stopped = 0;
	setTimeout(moveScroll, 1000);
}
function moveScroll(){
	temp = parseInt(document.getElementById("range").innerHTML);
	if (temp < 2015){
		temp += 5;
		document.getElementById("range").innerHTML = temp + "";
		drawVisualisations();
		if (!Stopped)
			setTimeout(moveScroll, 1000);
		
	}
}


function filterarea(box) {
var x=[];
x[0] = document.getElementById("shrink");
x[1] = document.getElementById("africa");
x[2] = document.getElementById("asia");
x[3] = document.getElementById("australia");
x[4] = document.getElementById("europe");
x[5] = document.getElementById("latinamerica");
x[6] = document.getElementById("northamerica");
x[7] = document.getElementById("others");
   
   for(var i = 0; i < 8 ; i++){
        if(x[i].checked)
            flag[i] = 1;                       
        else
            flag[i] = 0;
    }
    
    drawVisualisations();
}
function zoomscatter(z) {
    zoom = z/10000;
    drawVisualisations();
}
function selectVariable(){
	switch(document.getElementById("yAxisSelect").value){
	case "Migration":
		yDomainRange = [-height/(35*2), height/(35*2)];
		yCoordinateScale = 35;  // scale to multiply the data
		yCoordinateTranslate = height*0.5; //converting to bottom - top orientation
		break;
	case "SexRatio":
		drawGridLines(12, 0, 12);   //drawGridLines(number of lines, translate from the bottom, distance between lines);
		yDomainRange = [70 , 130];
        yCoordinateScale = 13;
		yCoordinateTranslate = height*2.25;
		break;
	case "PopulationGrowth":
		drawGridLines(12, -16, 10.5);      
		yDomainRange = [-5.25,5.25];
		yCoordinateScale = 70;
		yCoordinateTranslate = height*0.5;
      	break;
	}
	yAxesLabel = document.getElementById("yAxisSelect").value;
	drawVisualisations();
}
drawVisualisations();