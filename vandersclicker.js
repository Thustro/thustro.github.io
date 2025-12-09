const apiUrl = `https://market-appreciate.gl.at.ply.gg:32396/total`;
let clickHistory = [];

setInterval(getsubs, 5000);
setInterval(getData, 5000);

getsubs();
charts();
getData();

async function getsubs() {
    const responseCarry = await fetch(apiUrl);
    const dataCarry = await responseCarry.json();
    const statsCarry = dataCarry.total;

    const now = Date.now();

    // Add current data point to history
    clickHistory.push({ time: now, totalClicks: statsCarry });

    // Remove points older than 1 hour to save memory
    clickHistory = clickHistory.filter(point => now - point.time <= 3600 * 1000);

    // Function to calculate average clicks over a timeframe in ms
    function calculateAverage(ms) {
        const relevantPoints = clickHistory.filter(point => now - point.time <= ms);
        if (relevantPoints.length < 2) return 0;

        const first = relevantPoints[0];
        const last = relevantPoints[relevantPoints.length - 1];
        const clicksDiff = last.totalClicks - first.totalClicks;
        const minutesDiff = (last.time - first.time) / 60000; // ms → minutes
        return clicksDiff / minutesDiff;
    }

    const avgPerMinute = calculateAverage(60 * 1000); // last 1 minute
    const avgPerHour = calculateAverage(3600 * 1000);  // last 1 hour

    document.getElementById("avgPerMinute").textContent = Math.round(avgPerMinute).toLocaleString();
    document.getElementById("avgPerHour").textContent = Math.round(avgPerHour).toLocaleString();

    // --- Existing milestone/progress code ---
    const { next: nextMilestone, previous: previousMilestone, step: milestoneStep } = calculateMilestones(statsCarry);
    const toGoal = nextMilestone - statsCarry;
    const progressPercent = ((statsCarry - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    const clampedProgress = Math.min(Math.max(progressPercent, 0), 100);
    const remaining = nextMilestone - statsCarry;

    document.getElementById("toGoal").textContent = toGoal.toLocaleString();
    document.getElementById("goalLabel").textContent = `To Goal (${nextMilestone.toLocaleString()})`;
    document.getElementById("currentvisits").textContent = statsCarry;

    document.querySelector('.progress-fill').style.width = clampedProgress + '%';
    document.querySelector('.previous-milestone').textContent = previousMilestone.toLocaleString();
    document.querySelector('.next-milestone').textContent = nextMilestone.toLocaleString();
    document.querySelector('.current-visits').textContent = statsCarry.toLocaleString();
    document.querySelector('.remaining').textContent = `${remaining.toLocaleString()} remaining`;

    updateProgressBar(statsCarry, nextMilestone);

    document.title = `Vanders Clicker Live Statistics`;
}

function updateProgressBar(current, goal) {
  const percent = (current / goal) * 100;
  const remaining = goal - current;

  const progressFill = document.getElementById("progressFill");
  const goalLabel = document.getElementById("goalLabel");
  const remainingLabel = document.getElementById("remainingLabel");

  progressFill.style.width = `${Math.min(percent, 100)}%`;
  goalLabel.textContent = `To Goal (${goal.toLocaleString()})`;
  remainingLabel.textContent = `${remaining.toLocaleString()} remaining`;
}

var chart = null;
var apiData = [];

function getData() {
    fetch(apiUrl)
        .then(blob => blob.json())
        .then(data => {
            const visits = Math.round(data.total);

            apiData.push([Date.now(), visits]);

            if (chart) {
                if (apiData.length > 8) {
                    apiData.shift();
                    chart.series[0].setData(apiData);
                } else {
                    chart.series[0].addPoint([Date.now(), visits]);
                }
            }
        });
}

async function charts() {
    Highcharts.setOptions({
        global: { useUTC: true }
    });

    const responseCarry = await fetch(apiUrl);
    const dataCarry = await responseCarry.json();
    const statsCarry = dataCarry.total;

    Highcharts.chart('container', {
        chart: {
            backgroundColor: 'transparent',
            type: 'area',
            zoomType: 'x'
        },
        title: { text: '' },
        xAxis: { visible: false },
        yAxis: { visible: false },
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
            name: 'Clicks',
            data: apiData,
            lineWidth: 5,
            color: 'white'
        }]
    }, function (ch) {
        chart = ch;
    });



}
