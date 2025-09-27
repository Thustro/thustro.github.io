const apiUrl = `https://api-gc.galvindev.me.uk/clicks`;
let lastClickCount = null;
let lastUpdateTime = null;
let latestClicks = 0;
let latestCPM = 0;
let latestNextMilestone = null;


setInterval(getsubs, 3000);
setInterval(getData, 3000);
setInterval(() => {
    updateETA(latestClicks, latestNextMilestone, latestCPM);
}, 3000);

getsubs();
charts();
getData();

async function getsubs() {
    const responseCarry = await fetch(apiUrl);
    const dataCarry = await responseCarry.json();

    const statsCarry = dataCarry.clicks;

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

    updateRates(statsCarry, nextMilestone);

    const carry = document.getElementById('odometer');
    carry.innerHTML = statsCarry;

    const toGoal = nextMilestone - statsCarry;
    const progressPercent = ((statsCarry - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    const clampedProgress = Math.min(Math.max(progressPercent, 0), 100);
    const remaining = nextMilestone - statsCarry;

    document.getElementById("toGoal").textContent = toGoal.toLocaleString();
    document.getElementById("goalLabel").textContent = `To Goal (${nextMilestone.toLocaleString()})`;
    document.getElementById("eta-goal").textContent = `To Goal (${nextMilestone.toLocaleString()})`;
    document.getElementById("currentvisits").textContent = statsCarry;

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    document.querySelector('.progress-fill').style.width = clampedProgress + '%';
    document.querySelector('.previous-milestone').textContent = formatNumber(previousMilestone);
    document.querySelector('.next-milestone').textContent = formatNumber(nextMilestone);
    document.querySelector('.current-visits').textContent = formatNumber(statsCarry);
    document.querySelector('.remaining').textContent = `${formatNumber(remaining)} remaining`;

    updateProgressBar(statsCarry, nextMilestone);

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

function updateRates(currentClicks, nextMilestone) {
    const now = Date.now();

    if (lastClickCount !== null && lastUpdateTime !== null) {
        const diffClicks = currentClicks - lastClickCount;
        const diffTime = (now - lastUpdateTime) / 1000;

        if (diffTime > 0 && diffClicks >= 0) {
            const clicksPerSecond = diffClicks / diffTime;
            const clicksPerMinute = Math.round(clicksPerSecond * 60);
            const clicksPerHour = Math.round(clicksPerSecond * 3600);

            document.getElementById("cpm").textContent = clicksPerMinute.toLocaleString();
            document.getElementById("cph").textContent = clicksPerHour.toLocaleString();

            latestCPM = clicksPerMinute;
            latestClicks = currentClicks;
            latestNextMilestone = nextMilestone;

            updateETA(currentClicks, nextMilestone, clicksPerMinute);
        }
    }

    lastClickCount = currentClicks;
    lastUpdateTime = now;
}

function updateETA(currentClicks, nextMilestone, clicksPerMinute) {
    if (!nextMilestone || clicksPerMinute <= 0) {
        document.getElementById("eta-date").textContent = "--";
        document.getElementById("eta-text").textContent = "Not enough data";
        return;
    }

    const remaining = nextMilestone - currentClicks;
    const minutesRemaining = remaining / clicksPerMinute;
    const etaDate = new Date(Date.now() + minutesRemaining * 60000);

    const dateStr = etaDate.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const totalSeconds = Math.max(0, Math.floor(minutesRemaining * 60));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const countdown = `in ${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}, and ${seconds} second${seconds !== 1 ? 's' : ''}`;

    document.getElementById("eta-date").textContent = dateStr;
    document.getElementById("eta-text").textContent = countdown;
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