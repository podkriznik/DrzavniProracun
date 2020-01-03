// get data from elastic search
async function getData () {
    // await response of fetch call
    let response = await fetch('http://localhost:9200/proracun_skupaj/_search?size=1600&filter_path=hits.hits._source');
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
            leto = graphData.getValue(materialChart.getSelection()[0].row, 0);
            
            //Nastavi vrsto podatkov za naslednji graf
            var selectedItem = materialChart.getSelection()[0];
            if(graphData.getValue(selectedItem.row, selectedItem.column) == graphData.getValue(materialChart.getSelection()[0].row, 1))
                stevilka = 70;
            else if(graphData.getValue(selectedItem.row, selectedItem.column) == graphData.getValue(materialChart.getSelection()[0].row, 2))
                stevilka = 40;
            else stevilka = 0;


            //pripravi podatke
            getData()
                .then(data => {
                    //Spraznimo, ker so notri še podatki od prej
                    prihodki = [];
                    odhodki = [];
                    if(stevilka == 70){
                        for (let i = 0; i < data["hits"]["hits"].length; i++) {
                            if(data["hits"]["hits"][i]["_source"]["stevilka"] >= 70 && data["hits"]["hits"][i]["_source"]["stevilka"] < 80){
                                prihodki.push([data["hits"]["hits"][i]["_source"]["tip"], data["hits"]["hits"][i]["_source"][leto.toString()]])
                            }
                        }
                    }
                    else if (stevilka == 40){
                        for (let i = 0; i < data["hits"]["hits"].length; i++) {
                            if(data["hits"]["hits"][i]["_source"]["stevilka"] >= 40 && data["hits"]["hits"][i]["_source"]["stevilka"] < 50){
                                odhodki.push([data["hits"]["hits"][i]["_source"]["tip"], data["hits"]["hits"][i]["_source"][leto.toString()]])
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
        
        if (stevilka == 70){
            document.getElementById('donut').hidden = false;
            document.getElementById('naslovDonut').innerHTML = "Prihodki za leto " + leto;
            graphData.addColumn('string', 'Vrsta prihodka')
            graphData.addColumn('number', 'Vsota')
            for (let i = 0; i < prihodki.length; i++) {
                graphData.addRow(prihodki[i]); 
            }
        }
        else if (stevilka == 40){
            document.getElementById('donut').hidden = false;
            document.getElementById('naslovDonut').innerHTML = "Odhodki za leto " + leto;
            graphData.addColumn('string', 'Vrsta odhodka')
            graphData.addColumn('number', 'Vsota')
            for (let i = 0; i < odhodki.length; i++) {
                graphData.addRow(odhodki[i]); 
            }
        }
        else {
            document.getElementById('donut').hidden = true;
            document.getElementById('naslovDonut').innerHTML = "";
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
        };

        var chart = new google.visualization.PieChart(document.getElementById('donut'));
        if (stevilka){ //Če je številka različna od 0
            chart.draw(graphData, options);
        }
    }

}

var leto;
var stevilka;
var podatki = [];
var prihodki = [];
var odhodki = [];

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
