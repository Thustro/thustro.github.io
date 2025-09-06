setInterval(getsubs, 5000);
setInterval(getData, 5000);

getsubs();
charts();
getData();

async function getsubs(){

	const urlCarry = "https://games.roproxy.com/v1/games?universeIds=7346235080";
	const responseCarry = await fetch(urlCarry);
	const dataCarry = await responseCarry.json();
	const statsCarry = dataCarry.data[0].visits
	const rootCarry = document.getElementById('count');
	const carry = document.getElementById('odometer');
	const nodeCarry = odometer.innerHTML = statsCarry
	rootCarry.append(carry);
}

var chart = null;
var apiData = [];

function getData() {
	fetch("https://games.roproxy.com/v1/games?universeIds=7346235080")
	.then(blob => blob.json())
    .then(data => {
      const visits = Math.round(data.data[0].visits);

      apiData.push([Date.now(), visits]);

      if (chart) {
        chart.series[0].setData(apiData);
      }
      if (apiData.length > 8) {
        apiData.shift();
        chart.series[0].setData(apiData);
      } else {
        chart.series[0].addPoint([Date.now(), visits]);
      }
    });
}

async function charts(){

  Highcharts.setOptions({
    global: {
      useUTC: true
    }
  });
  
  const urlCarry = "https://games.roproxy.com/v1/games?universeIds=7346235080";
const responseCarry = await fetch(urlCarry);
const dataCarry = await responseCarry.json();
const statsCarry = dataCarry.data[0].visits
	
	
var formatTime = function(ms){
    var h, m, s = ((ms-xAxisFirstValue)/1000)|0;

    m = (s/60)|0;
    h = (m/60)|0;
        
    m-=h*60;
    s-=m*60;    
    s-=h*3600;

    return h+'h '+m+'m '+s+'s';
}
	
  // Create the chart
  
  window.graphDx = [];
  window.graphDy = [];
			

Highcharts.chart('container', {
  chart: {
    backgroundColor: 'transparent',
    type: 'area',
    zoomType: 'x'
  },
  title: {
    text: ''
  },
  xAxis: {
    visible: false
  },
  yAxis: {
    visible: false
  },
  plotOptions: {
    series: {
        threshold: null,
        fillOpacity: 0.1
    },
    area: {
        fillOpacity: 0.1
    }
  },
  credits: {
    text: 'norfolkcounts',
    href: 'https://thustro.github.io/',
  },
  series: [{
    name: 'Visits',
    data: apiData,
	lineWidth: 5,
    color: 'white', // or light gray
  }]
}, function (ch) {
  chart = ch;
});
}