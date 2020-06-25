

function drawCharts(results){
	// results = mydata
	var compatible_format = [["President","Vote Total"]]
	candidates = Object.keys(results)
	candidates.forEach(function(cand){
		compatible_format.push([cand,results[cand]])
	})

	var chartData = google.visualization.arrayToDataTable(compatible_format)
	var view = new google.visualization.DataView(chartData);
	view.setColumns([0, 1,
	                   { calc: "stringify",
	                     sourceColumn: 1,
	                     type: "string",
	                     role: "annotation" }]);

	var options = {
        title: "Election Results",
        width: 600,
        height: 400,
        bar: {groupWidth: "95%"},
        legend: { position: "none" },
      };

    var chart = new google.visualization.ColumnChart(document.getElementById("columnchart_values"));
    chart.draw(view, options);

}

function loadingHelper(){
	google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(getData);
    // getData()
}

function getData(){
	fetch('./data')
	  .then(
	    function(response) {
	      if (response.status !== 200) {
	        console.log('Looks like there was a problem. Status Code: ' +
	          response.status);
	        return;
	      }

	      // Examine the text in the response
	      response.json().then(function(data) {
	        console.log(data);
	        drawCharts(data)
	      });
	    }
	  )
	  .catch(function(err) {
	    console.log('Fetch Error :-S', err);
	  });
}


window.onload = loadingHelper()
