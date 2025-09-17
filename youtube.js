function getYoutubeUserFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("channel");
}

const user = getYoutubeUserFromURL();

if (!user) {
    alert("No channel provided in the URL.");
    throw new Error("channel missing");
}

const apiUrl = `https://api-v2.nextcounts.com/api/youtube/channel/estimate/mixerno/${user}`;

setInterval(getsubs, 5000);
setInterval(getData, 5000);

getsubs();
charts();
getData();

async function getsubs() {
    const responseCarry = await fetch(apiUrl);
    const dataCarry = await responseCarry.json();

    const statsCarry = dataCarry.estimatedSubCount;
    const name = dataCarry.channelName;
    const apisubcount = dataCarry.subCountAPI;
    const apiviews = dataCarry.totalViewsAPI;
    const views = dataCarry.totalViews;
    const videos = dataCarry.videos;
    const pfp = dataCarry.avatar;

    const rootCarry = document.getElementById('count');
    const carry = document.getElementById('odometer');
    odometer.innerHTML = statsCarry;

    const pfppic = document.getElementById('gameIcon');
    pfppic.src = pfp;

    const username = document.getElementById('name');
    username.textContent = name;

    const statsubsapi = document.getElementById('statSubsAPI');
    statsubsapi.textContent = apisubcount;

    const statviewsest = document.getElementById('statViewsEST');
    statviewsest.textContent = views;

    const statviewsapi = document.getElementById('statViewsAPI');
    statviewsapi.textContent = apiviews;

    const vids = document.getElementById('statVideos');
    vids.textContent = videos;

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
            const visits = data.estimatedSubCount

            apiData.push([Date.now(), visits]);

            if (chart) {
                if (apiData.length > 8) {
                    apiData.shift();
                    chart.series[0].setData(apiData);
                } else {
                    chart.series[0].addPoint([Date.now(), visits]);
                }
            }
        })
        .catch(error => {
            console.error("Error fetching chart data:", error);
        });
}

async function charts() {
    Highcharts.setOptions({
        global: { useUTC: true }
    });

    const responseCarry = await fetch(apiUrl);
    const dataCarry = await responseCarry.json();
    const statsCarry = dataCarry.followersCount;

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
            name: 'Subscribers',
            data: apiData,
            lineWidth: 5,
            color: 'white'
        }]
    }, function (ch) {
        chart = ch;
    });


}