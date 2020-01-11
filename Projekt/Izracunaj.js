// get data from elastic search
async function getData () {
    // await response of fetch call
    let response = await fetch('http://localhost:9200/proracun_skupaj/_search?sort=stevilka:asc&size=1600&filter_path=hits.hits._source');
    // only proceed once promise is resolved
    let data = await response.json();
    // only proceed once second promise is resolved
    return data;
}


function izrisTreemap(){
    google.charts.load("current", {packages:["treemap"], 'language': 'sl'});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {

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
            var formatter = new google.visualization.NumberFormat({pattern: '#,##0.00', suffix: '\u20AC'}); //znak za EUR
            return '<div style="background:white; padding:10px; border-style:solid">' + 
                   '<span style="font-family:"Raleway"><b>' + graphData.getValue(row, 0) + '</span></b>'
                   + '<br>' + formatter.formatValue(graphData.getValue(row, 2)) + '</div>'        
            }
    }
}

var parent = {};
var razdeljeno = {};
var tip2 = 4;
var leto = 2019;
var skupaj;
var placa = 1800.00;

document.getElementById('izberiButton').onclick = function onClick (){
    placa = parseFloat(document.getElementById('placa').value);
    document.getElementById('bruto').innerHTML = placa.toFixed(2) + "€"
    document.getElementById('neto').innerHTML = (placa * 0.504 + 275.22 - placa * 0.081).toFixed(2) + "€"
    document.getElementById('delodajalec').innerHTML = (placa*1.161).toFixed(2) + "€"
    parent = {};
    razdeljeno = {};
    loadData();
};

function loadData(){
    getData()
    .then(data => {
        placa = placa * 0.221;
        for (let i = 0; i < data["hits"]["hits"].length; i++) {
            parent[data["hits"]["hits"][i]["_source"]["stevilka"]] = data["hits"]["hits"][i]["_source"]["tip"];
            if(data["hits"]["hits"][i]["_source"]["stevilka"] == "4"){
                skupaj = data["hits"]["hits"][i]["_source"][leto.toString()];
            }
        }
        for (let i = 0; i < data["hits"]["hits"].length; i++) {
            var delez = data["hits"]["hits"][i]["_source"][leto.toString()]/skupaj;
            if(data["hits"]["hits"][i]["_source"][leto.toString()] > 0 && !(data["hits"]["hits"][i]["_source"]["tip"] in razdeljeno)){
                if(data["hits"]["hits"][i]["_source"]["stevilka"] == tip2){ 
                    razdeljeno[data["hits"]["hits"][i]["_source"]["tip"]] = [data["hits"]["hits"][i]["_source"]["tip"], null, placa * delez, placa * delez];
                }
                if(data["hits"]["hits"][i]["_source"]["stevilka"] >= tip2*10 && data["hits"]["hits"][i]["_source"]["stevilka"] < tip2*10+10){
                    razdeljeno[data["hits"]["hits"][i]["_source"]["tip"]] = [data["hits"]["hits"][i]["_source"]["tip"], parent[tip2], placa * delez, placa * delez];
                }
                if(data["hits"]["hits"][i]["_source"]["stevilka"] >= tip2*100 && data["hits"]["hits"][i]["_source"]["stevilka"] < tip2*100+100){
                    razdeljeno[data["hits"]["hits"][i]["_source"]["tip"]] = [data["hits"]["hits"][i]["_source"]["tip"], parent[Math.floor(data["hits"]["hits"][i]["_source"]["stevilka"] / 10)], placa * delez, placa * delez];
                }
                if(data["hits"]["hits"][i]["_source"]["stevilka"] >= tip2*1000 && data["hits"]["hits"][i]["_source"]["stevilka"] < tip2*1000+1000){
                    razdeljeno[data["hits"]["hits"][i]["_source"]["tip"]] = [data["hits"]["hits"][i]["_source"]["tip"], parent[Math.floor(data["hits"]["hits"][i]["_source"]["stevilka"] / 10)], placa * delez, placa * delez];
                }
                if(data["hits"]["hits"][i]["_source"]["stevilka"] >= tip2*100000 && data["hits"]["hits"][i]["_source"]["stevilka"] < tip2*100000+100000){
                    razdeljeno[data["hits"]["hits"][i]["_source"]["tip"]] = [data["hits"]["hits"][i]["_source"]["tip"], parent[Math.floor(data["hits"]["hits"][i]["_source"]["stevilka"] / 1000)], placa * delez, placa * delez];
                }
            }
        }
    })
    .then(() => {
        izrisTreemap();
    })
    .catch(reason => console.log(reason.message))
}

//On page load
loadData();
