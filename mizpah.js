setInterval(getsubs, 10000);
setInterval(getData, 10000);

getsubs();
charts();
getData();

async function getsubs(){

	const urlCarry = "http://asia-adds.gl.at.ply.gg:34496/fetchmizpah";
	const responseCarry = await fetch(urlCarry);
	const dataCarry = await responseCarry.json();
	const statsCarry = dataCarry.counter
	const rootCarry = document.getElementById('count');
	const carry = document.getElementById('odometer');
	const nodeCarry = odometer.innerHTML = statsCarry
	rootCarry.append(carry);
}

var chart = null;
var apiData = [];

function getData() {
	fetch("http://asia-adds.gl.at.ply.gg:34496/fetchmizpah")
	.then(blob => blob.json())
    .then(data => {
      const counter = data.counter;

      apiData.push([Date.now(), counter]);

      if (chart) {
        chart.series[0].setData(apiData);
      }
      if (apiData.length > 8) {
        apiData.shift();
        chart.series[0].setData(apiData);
      } else {
        chart.series[0].addPoint([Date.now(), counter]);
      }
    });
}

async function charts(){

  Highcharts.setOptions({
    global: {
      useUTC: true
    }
  });
  
  const urlCarry = "http://asia-adds.gl.at.ply.gg:34496/fetchmizpah";
const responseCarry = await fetch(urlCarry);
const dataCarry = await responseCarry.json();
const statsCarry = dataCarry.counter
	
	
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
    name: 'Votes',
    data: apiData,
	lineWidth: 5,
    color: 'white', // or light gray
  }]
}, function (ch) {
  chart = ch;
});
}