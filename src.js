
var data = [];
var filteredData = [];
var dataToDiplay = [];
var fuelFilteredData = [];
var fuelType = [];
var worldMapData = [];
var colors = [];
var others = ['Other', 'Wave and Tidal', 'Petcoke', 'Cogeneration'];
var capacityScale = [];
var path = "";
var fuelSlected = false;
var slider = "";
var Tooltip = "";
var selectedPlant = null;




var width = window.innerHeight - 5 + 200;
var height = window.innerHeight - 5;
var projection = d3.geoMercator()
    .scale((width - 3) / (2 * Math.PI))
    .translate([width / 2, height / 2]);

//Fetching data from github
Promise.all([d3.csv("https://raw.githubusercontent.com/MaridiTeja/powerPlantDataset/main/global_power_plant_database.csv", d3.autotype), d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")])
    .then((d) => {
        data = d[0];
        console.log(data)
        filteredData = data
        var fuelType = new Set(data.map(p => p.primary_fuel))
        fuelType = [...fuelType]
        fuels = []
        for (var i = 0; i < fuelType.length; i++) {
            var opt = fuelType[i];
            if (others.includes(opt))
                continue
            fuels.push(opt);
        }
        fuels.push("Others");
        console.log(fuels)
        colors = d3.scaleOrdinal()
            .domain(fuels)
            .range(d3.schemePaired)
        var temp = document.createElement('div');
        temp.innerHTML = "<lable><b>Primary Fuels</b></lable>" + Swatches(colors);
        document.getElementById("legend").appendChild(temp);

        var swatchesTexts = d3.selectAll('.swatches');

        swatchesTexts.on('click', function (event, d) {
            let type = d3.select(this).text();
            filteredData = data.filter((d) => {
                if (type == 'Others') {
                    return others.includes(d.primary_fuel)
                }
                return d.primary_fuel == type
            });

            updateMap(clickon = "legend", colName = 'primary_fuel', value = d3.select(this).text());
        })



        worldMapData = d[1];
        createMap();
        createPieChart(data);
        createSlider(data);
        document.getElementById("loader").classList.add("hide-loader");
        document.getElementById("span-element").style.display = null
        console.log(document.getElementById("span-element"))


    })

//Function is called when reset button is clicked
function resetData() {
    console.log("reset clicked")
    document.getElementById('displaySelectedPlant').innerHTML = "";
    document.getElementById('display-range').innerHTML = "";
    document.getElementById("range").value = 100;
    selectedPlant = null

    filteredData = data;
    createMap();
    createPieChart(data);
    resetSlider(data);

}

//function to reset the noUiSlider slider
function resetSlider() {

    years = [...new Set(data.map(d => Math.floor(d.commissioning_year)))].filter((d) => d != 0);

    var min = d3.min(years);
    var max = d3.max(years)
    slider.noUiSlider.set([min, max]);
    document.getElementById("input-min").value = min;
    document.getElementById("input-max").value = max;

}

//creating slider using noUiSlider
//for slider adapated code from https://refreshless.com/nouislider/
function createSlider(data) {

    years = [...new Set(data.map(d => Math.floor(d.commissioning_year)))].filter((d) => d != 0);

    document.getElementById('slider').innerHTML = ""
    slider = document.getElementById('slider');
    var min = d3.min(years);
    var max = d3.max(years)

    document.getElementById("input-min").value = min;
    document.getElementById("input-max").value = max;


    noUiSlider.create(slider, {
        start: [min, max],
        connect: true,
        range: {
            'min': min,
            'max': max
        }
    });

    slider.noUiSlider.on('slide', function (values, handle) {
        values = [Math.floor(values[0]), Math.floor(values[1])]

        document.getElementById("input-min").value = values[0]
        document.getElementById("input-max").value = values[1]
        updateMap(clickon = "slider", colName = 'commissioning_year', value = values);
    });


}

//creating pie chart
//used canvas js to create pie chart
//adaped code syntax from https://canvasjs.com/html5-javascript-pie-chart/
function createPieChart() {

    const pieData = {};
    for (let f of fuels) {
        pieData[f] = 0;
    }

    for (let d of filteredData) {
        if (others.includes(d['primary_fuel'])) {
            pieData['Others'] += parseInt(d['capacity_mw']);
        }
        else {
            pieData[d['primary_fuel']] += parseInt(d['capacity_mw']);
        }
    }

    pieDataArray = [];

    for (let key in pieData) {
        if (pieData[key] == 0) continue;
        let obj = {}
        obj['label'] = key;
        obj['y'] = pieData[key]
        obj['color'] = colors(key);
        pieDataArray.push(obj);
    }

    d3.select('#pie-chart').html("")

    d3.select('#pie-chart').append(new CanvasJS.Chart('pie-chart', {
        // animationEnabled: true,
        title: {
            text: "Capacity chart by primary fuel",
            fontSize: 15,
        },
        data: [{
            type: "pie",
            startAngle: 240,
            // yValueFormatString: "##0.00\"%\"",
            indexLabel: "{label} {y} mw",
            dataPoints: pieDataArray,
            click: ((d) => {
                d.dataPoint.exploded = false;
                let data = d.dataPoint.label;
                console.log(d.dataPoint.label, "createPieChart");
                filteredData = window.data.filter((d) => d['primary_fuel'] == data);
                updateMap(clickon = "piechart");
            })
        }]
    }).render())


}


//creating pie chart
//used canvas js to create pie chart
//adaped code syntax from https://canvasjs.com/html5-javascript-pie-chart/
function createPieChart1(data) {
    console.log('createPieChart1')

    const pieData = {};
    for (let f of fuels) {
        pieData[f] = 0;
    }

    for (let d of data) {
        if (others.includes(d['primary_fuel'])) {
            pieData['Others'] += parseInt(d['capacity_mw']);
        }
        else {
            pieData[d['primary_fuel']] += parseInt(d['capacity_mw']);
        }
    }

    pieDataArray = [];

    for (let key in pieData) {
        if (pieData[key] == 0) continue;
        let obj = {}
        obj['label'] = key;
        obj['y'] = pieData[key]
        obj['color'] = colors(key);
        pieDataArray.push(obj);
    }

    d3.select('#pie-chart').html("")

    d3.select('#pie-chart').append(new CanvasJS.Chart('pie-chart', {
        // animationEnabled: true,
        title: {
            text: "Capacity chart by primary fuel",
            fontSize: 15,
        },
        data: [{
            type: "pie",
            startAngle: 240,
            // yValueFormatString: "##0.00\"%\"",
            indexLabel: "{label} {y} mw",
            dataPoints: pieDataArray,
            click: ((d) => {
                d.dataPoint.exploded = false;
                let data = d.dataPoint.label;
                console.log(d.dataPoint.label, "createPieChart1");
                filteredData = dataToDiplay.filter((d) => d['primary_fuel'] == data);
                console.log(filteredData)
                updateMap(clickon = "piechart1");
            })
        }]
    }).render())


}


//fuction will be called when any changes are being made
function updateMap(clickon = null, colName = null, value = null) {

    console.log(colName, value, colName == 'primary_fuel', clickon);

    dataToDiplay = filteredData

    if (colName == 'commissioning_year') {
        dataToDiplay = filteredData.filter((d) => {

            return d[colName].length > 0 && parseInt(d[colName]) >= value[0] && parseInt(d[colName]) <= value[1]
        });
        createPieChart1(dataToDiplay)
    }
    else if (clickon != 'piechart' && clickon != "legend" && clickon != 'piechart1') {
        createPieChart()
    }
    else if (clickon == "legend") {
        createPieChart1(dataToDiplay)

    }

    d3.selectAll("circle").remove();
    d3.select("svg").selectAll("g.markers circle")
        .data(dataToDiplay)
        .join("circle")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", d => capacityScale(d.capacity_mw))
        .attr("fill", d => colors(value == 'Others' ? "Others" : d.primary_fuel))
        .attr("title", d => JSON.stringify(d))
        .on("click", (event, d) => { console.log(this, event, d) })
        .on("mouseover", mouseover)
        .on("mousemove", mousemoveontooltip)
        .on("mouseleave", mouseleave)
        .on("click", function () {
            console.log(this);
            console.log(d3.select(this).attr('title'))
            selectedPlant = JSON.parse(d3.select(this).attr('title'));
            document.getElementById('displaySelectedPlant').innerHTML = `
        <div><b>Selected Power plant</b></div>

        <table>
            <tr>
                <td>Name:</td>
                <td>${selectedPlant.name}</td>
            </tr>
            <tr>
                <td>Primary Fuel:</td>
                <td>${selectedPlant.primary_fuel}</td>
            </tr>
            <tr>
                <td>Capacity in mw:</td>
                <td>${selectedPlant.capacity_mw}</td>
            </tr>
            <tr>
                <td>Year of comission:</td>
                <td>${Math.floor(selectedPlant.commissioning_year) == 0 ? "N/A" : Math.floor(selectedPlant.commissioning_year)}</td>
            </tr>
            <tr>
                <td>Country:</td>
                <td>${selectedPlant.country_long}</td>
            </tr>
        </table>
        `
        })



}

//fucntion called when range input is changed
function rangeChange(value) {

    if (!selectedPlant) {
        document.getElementById('display-range').innerHTML = "<span>Click on any power plant to select it and try again</span>";
        document.getElementById("display-range").style.color = "red"
        return
    }


    document.getElementById("display-range").style.color = "black"
    document.getElementById("display-range").innerHTML = "<span>Displaying power plants within range <b>" + value + "</b> miles</span>"

    let longitude = selectedPlant.longitude
    let latitue = selectedPlant.latitude
    console.log(document.getElementById("display-range"), "ggkhkhk")
    filteredData = data.filter(d => distance(latitue, d.latitude, longitude, d.longitude) < value)
    console.log(filteredData)
    updateMap("range")

}

// Creating the map in the intail load
function createMap() {

    filteredData = data;

    var capcity = [...new Set(data.map(d => d.capacity_mw))].filter((d) => d != 0)

    capacityScale = d3.scaleSqrt() 
        .domain([d3.min(capcity), d3.max(capcity)])
        .range([0.2, 2])




    d3.select("#map").html("")
    var mapSvg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("id", "mapsvg")

    shape = document.getElementsByTagName("svg")[0];
    shape.addEventListener("mousemove", mousemove);
    shape.addEventListener("mousedown", mousedown);
    shape.addEventListener("wheel", wheel);



    var path = d3.geoPath()
        .projection(projection);
    Tooltip = d3.select("#map")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    mapSvg.selectAll('path')
        .data(worldMapData.features)
        .enter()
        .append('path')
        .attr("d", path)
        .style("stroke", "black")
        .style("fill", "white")
        .attr("class", "feature")
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1')
                .style("fill", "#d3d3d3");

        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '0.6')
                .style("fill", "white");
        })
        .on("click", function (event, d) {
            let value = event.properties.name;
            filteredData = data.filter((d) => {
                if (value == "USA") {
                    return d['country_long'] == "United States of America"
                }
                if (value == 'Others') {
                    return others.includes(d['country_long'])
                }
                return d['country_long'] == value
            })
            updateMap("path")
            createPieChart()

        })


    d3.selectAll("circle").remove();
    mapSvg.selectAll("g.markers circle")
        .data(filteredData)
        .join("circle")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", d => capacityScale(d.capacity_mw))
        .attr("fill", d => colors(d.primary_fuel))
        .attr("title", d => JSON.stringify(d))
        .on("click", function () {
            console.log(this);
            console.log(d3.select(this).attr('title'))
            selectedPlant = JSON.parse(d3.select(this).attr('title'));
            document.getElementById('displaySelectedPlant').innerHTML = `
        <div><b>Selected Power plant</b></div>
        <table>
            <tr>
                <td>Name:</td>
                <td>${selectedPlant.name}</td>
            </tr>
            <tr>
                <td>Primary Fuel:</td>
                <td>${selectedPlant.primary_fuel}</td>
            </tr>
            <tr>
                <td>Capacity in mw:</td>
                <td>${selectedPlant.capacity_mw}</td>
            </tr>
            <tr>
                <td>Year of comission:</td>
                <td>${Math.floor(selectedPlant.commissioning_year) == 0 ? "N/A" : Math.floor(selectedPlant.commissioning_year)}</td>
            </tr>
            <tr>
                <td>Country:</td>
                <td>${selectedPlant.country_long}</td>
            </tr>
        </table>
        `
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemoveontooltip)
        .on("mouseleave", mouseleave)


    mapSvg.node();
}


// Copyright 2021, Observable Inc.
// Released under the ISC license.
// adapted code from https://observablehq.com/@d3/color-legend
// for the creation of the legend
function Swatches(color, {
    columns = null,
    format,
    unknown: formatUnknown,
    swatchSize = 15,
    swatchWidth = swatchSize,
    swatchHeight = swatchSize,
    marginLeft = 0
} = {}) {
    const id = `swatches`;
    const unknown = formatUnknown == null ? undefined : color.unknown();
    const unknowns = unknown == null || unknown === d3.scaleImplicit ? [] : [unknown];
    const domain = color.domain().concat(unknowns);
    if (format === undefined) format = x => x === unknown ? formatUnknown : x;

    function entity(character) {
        return `&#${character.charCodeAt(0).toString()};`;
    }

    if (columns !== null) return `<div style="display: flex; align-items: center; margin-left: ${+marginLeft}px; min-height: 33px; font: 10px sans-serif;">
    <style>
  
  .${id}-item {
    break-inside: avoid;
    display: flex;
    align-items: center;
    padding-bottom: 1px;
  }
  
  .${id}-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - ${+swatchWidth}px - 0.5em);
    font-size: 20px;
  }
  
  .${id}-swatch {
    width: ${+swatchWidth}px;
    height: ${+swatchHeight}px;
    margin: 0 0.5em 0 0;
  }
  
    </style>
    <div style=${{ width: "100%", columns }}>${domain.map(value => {
        const label = `${format(value)}`;
        return html`<div class=${id}-item>
        <div class=${id}-swatch style=${{ background: color(value) }}></div>
        <div class=${id}-label title=${label}>${label}</div>
      </div>`;
    })}
    </div>
  </div>`;

    return `<div style="display: flex; align-items: center; min-height: 33px; margin-left: ${+marginLeft}px; font: 10px sans-serif;">
    <style>
  
  .${id} {
    display: inline-flex;
    align-items: center;
    margin-right: 1em;
    font-size:13px;
  }
  
  .${id}::before {
    content: "";
    width: ${+swatchWidth}px;
    height: ${+swatchHeight}px;
    margin-right: 0.5em;
    background: var(--color);
  }
  
    </style>
    <div>${domain.map(value => `<span class="${id}" style="--color: ${color(value)}">${value}</span>`)}</div>`;
}

//Calculating distance between two points on earth
// adapted code from https://www.geeksforgeeks.org/program-distance-two-points-earth/
function distance(lat1,
    lat2, lon1, lon2) {

    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(lat1) * Math.cos(lat2)
        * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return (c * r) / 0.621371;
}


// for zooming adapated code from https://codepen.io/mrobin604/pen/yjmrjj
shape = document.getElementsByTagName("svg")[0];
shape.addEventListener("mousemove", mousemove);
shape.addEventListener("mousedown", mousedown);
shape.addEventListener("wheel", wheel);


var mouseStartPosition = { x: 0, y: 0 };
var mousePosition = { x: 0, y: 0 };
var viewboxStartPosition = { x: 0, y: 0 };
var viewboxPosition = { x: 0, y: 0 };
var viewboxSize = { x: 480, y: 480 };
var viewboxScale = 1.0;

var mouseDown = false;



function mousedown(e) {
    mouseStartPosition.x = e.pageX;
    mouseStartPosition.y = e.pageY;

    viewboxStartPosition.x = viewboxPosition.x;
    viewboxStartPosition.y = viewboxPosition.y;

    window.addEventListener("mouseup", mouseup);

    mouseDown = true;
}

function setviewbox() {
    var vp = { x: 0, y: 0 };
    var vs = { x: 0, y: 0 };

    vp.x = viewboxPosition.x;
    vp.y = viewboxPosition.y;

    vs.x = viewboxSize.x * viewboxScale;
    vs.y = viewboxSize.y * viewboxScale;

    shape = document.getElementsByTagName("svg")[0];
    shape.setAttribute("viewBox", vp.x + " " + vp.y + " " + vs.x + " " + vs.y);

}

function mousemove(e) {
    mousePosition.x = e.offsetX;
    mousePosition.y = e.offsetY;

    if (mouseDown) {
        viewboxPosition.x = viewboxStartPosition.x + (mouseStartPosition.x - e.pageX) * viewboxScale;
        viewboxPosition.y = viewboxStartPosition.y + (mouseStartPosition.y - e.pageY) * viewboxScale;

        setviewbox();
    }

    var mpos = { x: mousePosition.x * viewboxScale, y: mousePosition.y * viewboxScale };
    var vpos = { x: viewboxPosition.x, y: viewboxPosition.y };
    var cpos = { x: mpos.x + vpos.x, y: mpos.y + vpos.y }

    shape = document.getElementsByTagName("h1")[0];
}

function mouseup(e) {
    window.removeEventListener("mouseup", mouseup);

    mouseDown = false;
}

function wheel(e) {
    var scale = (e.deltaY < 0) ? 0.8 : 1.2;

    if ((viewboxScale * scale < 8.) && (viewboxScale * scale > 1. / 156.)) {
        var mpos = { x: mousePosition.x * viewboxScale, y: mousePosition.y * viewboxScale };
        var vpos = { x: viewboxPosition.x, y: viewboxPosition.y };
        var cpos = { x: mpos.x + vpos.x, y: mpos.y + vpos.y }

        viewboxPosition.x = (viewboxPosition.x - cpos.x) * scale + cpos.x;
        viewboxPosition.y = (viewboxPosition.y - cpos.y) * scale + cpos.y;
        viewboxScale *= scale;

        setviewbox();
    }
}





// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function (d) {
    Tooltip
        .style("opacity", 1)
    d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .style("opacity", 1)
}
var mousemoveontooltip = function (d) {
    Tooltip
        .html(`
    <table>
        <tr>
            <td>Name:</td>
            <td>${d.name}</td>
        </tr>
        <tr>
            <td>Primary Fuel:</td>
            <td>${d.primary_fuel}</td>
        </tr>
        <tr>
            <td>Capacity in mw:</td>
            <td>${d.capacity_mw}</td>
        </tr>
        <tr>
            <td>Year of comission:</td>
            <td>${Math.floor(d.commissioning_year) == 0 ? "N/A" : Math.floor(d.commissioning_year)}</td>
        </tr>
        <tr>
            <td>Country:</td>
            <td>${d.country_long}</td>
        </tr>
    </table>
    `)

        .style("left", (d3.mouse(this)[0] + 10) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
}
var mouseleave = function (d) {
    Tooltip
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
}

