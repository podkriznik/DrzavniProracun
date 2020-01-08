// get data from elastic search
async function getData () {
    // await response of fetch call
    let response = await fetch('http://localhost:9200/proracun_skupaj/_search?sort=stevilka:asc&size=1600&filter_path=hits.hits._source');
    // only proceed once promise is resolved
    let data = await response.json();
    // only proceed once second promise is resolved
    return data;
}

function izrisHistogram(){
    google.charts.load('current', {packages: ['corechart', 'bar'], 'language': 'sl'});
    google.charts.setOnLoadCallback(drawMaterial);
    
    function drawMaterial() {
        //Napolni podatke za graf
        var graphData = new google.visualization.DataTable();
        graphData.addColumn('string', 'Leto', 'pattern: ####');
        graphData.addColumn('number', 'Prihodek',);
        graphData.addColumn('number', 'Odhodek',);
        graphData.addColumn('number', 'Prihodek ali primankljaj');
        for (let i = 0; i < podatki.length; i++) {  
            graphData.addRow(podatki[i]);  
        }

        var formatter = new google.visualization.NumberFormat({suffix: '\u20AC'}); //znak za EUR
        formatter.format(graphData, 1);
        formatter.format(graphData, 2); 
        formatter.format(graphData, 3); 
        
        var options = {
            width: 1440,
            height: 550,
            lineWidth: 3,
            curveType: 'function',
            vAxis: {'format': 'long'},

            colors:['#4ea2a2', '#b34233', '#d28f33'],
            bars: 'vertical'

        };
        var materialChart = new google.visualization.LineChart(document.getElementById('histogram'));

        function selectHandler() {        
            //Nastavi vrsto podatkov za naslednji graf
            var selectedItem = materialChart.getSelection();
            if (selectedItem.length > 0){
                leto = graphData.getValue(materialChart.getSelection()[0].row, 0);
                if(graphData.getValue(selectedItem[0].row, selectedItem[0].column) == graphData.getValue(materialChart.getSelection()[0].row, 1))
                    tip1 = 70;
                else if(graphData.getValue(selectedItem[0].row, selectedItem[0].column) == graphData.getValue(materialChart.getSelection()[0].row, 2))
                    tip1 = 40;
                else tip1 = 0;
            }
            else tip1 = 0;


            //pripravi podatke
            getData()
                .then(data => {
                    //Spraznimo, ker so notri še podatki od prej
                    prihodki = [];
                    odhodki = [];
                    if(tip1 == 70){
                        for (let i = 0; i < data["hits"]["hits"].length; i++) {
                            if(data["hits"]["hits"][i]["_source"]["stevilka"] >= 70 && data["hits"]["hits"][i]["_source"]["stevilka"] < 80){
                                prihodki.push([data["hits"]["hits"][i]["_source"]["tip"], data["hits"]["hits"][i]["_source"][leto.toString()], data["hits"]["hits"][i]["_source"]["stevilka"]])
                            }
                        }
                    }
                    else if (tip1 == 40){
                        for (let i = 0; i < data["hits"]["hits"].length; i++) {
                            if(data["hits"]["hits"][i]["_source"]["stevilka"] >= 40 && data["hits"]["hits"][i]["_source"]["stevilka"] < 50){
                                odhodki.push([data["hits"]["hits"][i]["_source"]["tip"], data["hits"]["hits"][i]["_source"][leto.toString()], data["hits"]["hits"][i]["_source"]["stevilka"]])
                            }
                        }
                    }
                })
                .then(() => {
                    izrisDonut()
                })
            }

        // Listen for the 'select' event, and call my function selectHandler() when
        // the user selects something on the chart.
        google.visualization.events.addListener(materialChart, 'select', selectHandler);
        materialChart.draw(graphData, options);
    }
}

function izrisDonut(){
    google.charts.load("current", {packages:["corechart"], 'language': 'sl'});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {

        var graphData = new google.visualization.DataTable();
        
        if (tip1 == 70){
            document.getElementById('outerTreemap').hidden = true;
            document.getElementById('naslovTreemap').innerHTML = "";
            document.getElementById('ponastaviButton').style.visibility = 'hidden';
            document.getElementById('donut').hidden = false;
            document.getElementById('naslovDonut').innerHTML = "Prihodki za leto " + leto;
            graphData.addColumn('string', 'Vrsta prihodka')
            graphData.addColumn('number', 'Vsota')
            graphData.addColumn('number', 'Tip')
            for (let i = 0; i < prihodki.length; i++) {
                graphData.addRow(prihodki[i]); 
            }
        }
        else if (tip1 == 40){
            document.getElementById('outerTreemap').hidden = true;
            document.getElementById('naslovTreemap').innerHTML = "";
            document.getElementById('ponastaviButton').style.visibility = 'hidden';
            document.getElementById('donut').hidden = false;
            document.getElementById('naslovDonut').innerHTML = "Odhodki za leto " + leto;
            graphData.addColumn('string', 'Vrsta odhodka')
            graphData.addColumn('number', 'Vsota')
            graphData.addColumn('number', 'Tip')
            for (let i = 0; i < odhodki.length; i++) {
                graphData.addRow(odhodki[i]); 
            }
        }
        else {
            document.getElementById('donut').hidden = true;
            document.getElementById('naslovDonut').innerHTML = "";
            document.getElementById('ponastaviButton').style.visibility = 'hidden';
            document.getElementById('outerTreemap').hidden = true;
            document.getElementById('naslovTreemap').innerHTML = "";
        }

        if (graphData.wg.length){ //Če je velikost tabele večja od 0
            var formatter = new google.visualization.NumberFormat({suffix: '\u20AC'}); //znak za EUR
            formatter.format(graphData, 1);
        }

        var options = {
            pieHole: 0.4,
            width: 1440,
            height: 550,
            colors:['#1a8693', '#751a33', '#d4b95e', '#b34233', '#d28f33', '#4ea2a2', '#885845'],
            view: {'columns': [0,1]},
        };

        var chart = new google.visualization.PieChart(document.getElementById('donut'));
        if (tip1){ //Če je številka različna od 0
            chart.draw(graphData, options);

        function selectHandler(){
            let selection = chart.getSelection()
            razdeljeno = {};
            if (selection.length > 0){
                tip2 = graphData.getValue(selection[0].row, 2)

                getData()
                .then(data => {
                    for (let i = 0; i < data["hits"]["hits"].length; i++) {
                        parent[data["hits"]["hits"][i]["_source"]["stevilka"]] = data["hits"]["hits"][i]["_source"]["tip"];
                    }
                    for (let i = 0; i < data["hits"]["hits"].length; i++) {
                        if(data["hits"]["hits"][i]["_source"][leto.toString()] > 0 && !(data["hits"]["hits"][i]["_source"]["tip"] in razdeljeno)){
                            if(data["hits"]["hits"][i]["_source"]["stevilka"] == tip2){
                                razdeljeno[data["hits"]["hits"][i]["_source"]["tip"]] = [data["hits"]["hits"][i]["_source"]["tip"], null, data["hits"]["hits"][i]["_source"][leto.toString()], data["hits"]["hits"][i]["_source"][leto.toString()]];
                            }
                            if(data["hits"]["hits"][i]["_source"]["stevilka"] >= tip2*10 && data["hits"]["hits"][i]["_source"]["stevilka"] < tip2*10+10){
                                razdeljeno[data["hits"]["hits"][i]["_source"]["tip"]] = [data["hits"]["hits"][i]["_source"]["tip"], parent[tip2], data["hits"]["hits"][i]["_source"][leto.toString()], data["hits"]["hits"][i]["_source"][leto.toString()]];
                            }
                            if(data["hits"]["hits"][i]["_source"]["stevilka"] >= tip2*100 && data["hits"]["hits"][i]["_source"]["stevilka"] < tip2*100+100){
                                razdeljeno[data["hits"]["hits"][i]["_source"]["tip"]] = [data["hits"]["hits"][i]["_source"]["tip"], parent[Math.floor(data["hits"]["hits"][i]["_source"]["stevilka"] / 10)], data["hits"]["hits"][i]["_source"][leto.toString()], data["hits"]["hits"][i]["_source"][leto.toString()]];
                            }
                            if(data["hits"]["hits"][i]["_source"]["stevilka"] >= tip2*10000 && data["hits"]["hits"][i]["_source"]["stevilka"] < tip2*10000+10000){
                                razdeljeno[data["hits"]["hits"][i]["_source"]["tip"]] = [data["hits"]["hits"][i]["_source"]["tip"], parent[Math.floor(data["hits"]["hits"][i]["_source"]["stevilka"] / 100)], data["hits"]["hits"][i]["_source"][leto.toString()], data["hits"]["hits"][i]["_source"][leto.toString()]];
                            }
                        }
                    }
                })
                .then(() => {
                    izrisTreemap();
                })
            }
            else{
                document.getElementById('outerTreemap').hidden = true;
                document.getElementById('ponastaviButton').style.visibility = 'hidden';
                document.getElementById('naslovTreemap').innerHTML = "";
            }
        }
        google.visualization.events.addListener(chart, 'select', selectHandler);
        }
    }
}

function izrisTreemap(){
    google.charts.load("current", {packages:["treemap"], 'language': 'sl'});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {

        document.getElementById('outerTreemap').hidden = false;
        document.getElementById('naslovTreemap').innerHTML = parent[tip2];
        document.getElementById('ponastaviButton').style.visibility = 'visible';

        var graphData = new google.visualization.DataTable();
        graphData.addColumn('string', 'Vrsta');
        graphData.addColumn('string', 'Parent');
        graphData.addColumn('number', 'Vsota');
        graphData.addColumn('number', 'tip');

        for (var key in razdeljeno){
            graphData.addRow(razdeljeno[key]);
        }

        tree = new google.visualization.TreeMap(document.getElementById('treemap'));

        var options = {
            width: 1200,
            height: 550,
            fontSize: 15,
            fontFamily: "Raleway",
            highlightOnMouseOver: true,
            maxPostDepth: 3,                    
            minColor: '#95c8d8',
            midColor: '#588bae',
            maxColor: '#0e4d92',
            headerHeight: 0,
            generateTooltip: showTooltip,
        };
        tree.draw(graphData, options);

        function showTooltip(row, size, value){
            var formatter = new google.visualization.NumberFormat({pattern: '#,###.00', suffix: '\u20AC'}); //znak za EUR
            return '<div style="background:white; padding:10px; border-style:solid">' + 
                   '<span style="font-family:"Raleway"><b>' + graphData.getValue(row, 0) + '</span></b>'
                   + '<br>' + formatter.formatValue(size) + '</div>'        
            }
    }
}


var leto;
var tip1; //Ali gre za prihodek ali odhodek
var tip2; //Tip prihodka ali odhodka
var podatki = []; //LineChart data
var prihodki = []; //DonutChart data
var odhodki = []; //DonutChart data
var razdeljeno = {}; //TreeMap data
var parent = {}; //gnezdenje za TreeMap

document.getElementById('ponastaviButton').style.visibility = 'hidden';
document.getElementById('ponastaviButton').onclick = function onClick (){
    izrisTreemap();
};
//On page load
getData()
    .then(data => {
        for (let i = 0; i < data["hits"]["hits"].length; i++) {
            if (data["hits"]["hits"][i]["_source"]["stevilka"] == 7){ //Prihodki skupaj
                for (let j = 1998; j < 2020; j++){
                    prihodki.push([j.toString(), data["hits"]["hits"][i]["_source"][j.toString()]])
                }
            }
            else if (data["hits"]["hits"][i]["_source"]["stevilka"] == 4){ //Odhodki skupaj
                for (let j = 1998; j < 2020; j++){
                    odhodki.push([j.toString(), -data["hits"]["hits"][i]["_source"][j.toString()]])
                }
            }
        }
        for (let i = 0; i < prihodki.length; i++){
            podatki.push([prihodki[i][0], prihodki[i][1], odhodki[i][1], prihodki[i][1] + odhodki[i][1]])
        }
    })
    .then(() => {
        izrisHistogram();
    })
    .catch(reason => console.log(reason.message))
