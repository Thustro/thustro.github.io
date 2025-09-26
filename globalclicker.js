const apiUrl = `https://api-gc.galvindev.me.uk/clicks`;

setInterval(getsubs, 5000);
setInterval(getData, 5000);

getsubs();
charts();
getData();

async function getsubs() {
    const responseCarry = await fetch(apiUrl);
    const dataCarry = await responseCarry.json();

    const statsCarry = dataCarry.clicks;

    const rootCarry = document.getElementById('count');
    const carry = document.getElementById('odometer');
    odometer.innerHTML = statsCarry;


    function calculateMilestones(n) {
        let step;
        if (n < 1_000_000) {
            const digits = Math.floor(Math.log10(n));
            step = Math.pow(10, digits);
        } else {
            step = 1_000_000;
        }

        const next = Math.ceil(n / step) * step;
        const previous = next - step;

        return { next, previous, step };
    }

    const { next: nextMilestone, previous: previousMilestone, step: milestoneStep } = calculateMilestones(statsCarry);
    const toGoal = nextMilestone - statsCarry;
    const progressPercent = ((statsCarry - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    const clampedProgress = Math.min(Math.max(progressPercent, 0), 100);
    const remaining = nextMilestone - statsCarry;


    document.getElementById("toGoal").textContent = toGoal.toLocaleString();
    document.getElementById("goalLabel").textContent = `To Goal (${nextMilestone.toLocaleString()})`;
    document.getElementById("currentvisits").textContent = statsCarry;

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Update DOM elements
    document.querySelector('.progress-fill').style.width = clampedProgress + '%';
    document.querySelector('.previous-milestone').textContent = formatNumber(previousMilestone);
    document.querySelector('.next-milestone').textContent = formatNumber(nextMilestone);
    document.querySelector('.current-visits').textContent = formatNumber(statsCarry);
    document.querySelector('.remaining').textContent = `${formatNumber(remaining)} remaining`;

    updateProgressBar(statsCarry, nextMilestone)

    document.title = `${gameName} Live Statistics`;
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
            const visits = Math.round(data.clicks);

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
    const statsCarry = dataCarry.clicks;

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
