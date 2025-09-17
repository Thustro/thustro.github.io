function getYoutubeUserFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("video");
}

const videoId = getYoutubeUserFromURL();

if (!videoId) {
    alert("No video provided in the URL.");
    throw new Error("video missing");
}

const apiUrl = `https://api-v2.nextcounts.com/api/youtube/videos/stats/${videoId}`;
const apiUrl2 = `https://mixerno.space/api/youtube-video-counter/user/${videoId}`;

setInterval(getsubs, 5000);
setInterval(getData, 5000);

getsubs();
charts();
getData();
getthumbnail();

async function getsubs() {
    const responseCarry = await fetch(apiUrl2);
    const dataCarry = await responseCarry.json();

    const getCount = (key) => {
        const item = dataCarry.counts.find(c => c.value === key);
        return item?.count ? parseInt(item.count) : 0;
    };

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const statsCarry = getCount("views");
    const likes = getCount("likes");
    const comments = getCount("comments");
    const viewsapi = getCount("apiviews")

    const name = dataCarry.user.find(u => u.value === "name")?.count || "Unknown Video";

    const odometer = document.getElementById('odometer');
    odometer.innerHTML = statsCarry;

    document.getElementById('statLikes').textContent = likes.toLocaleString();
    document.getElementById('statComments').textContent = comments.toLocaleString();
    document.getElementById('statViewsAPI').textContent = viewsapi.toLocaleString();

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

    const { next: nextMilestone, previous: previousMilestone } = calculateMilestones(statsCarry);
    const toGoal = nextMilestone - statsCarry;
    const progressPercent = ((statsCarry - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    const clampedProgress = Math.min(Math.max(progressPercent, 0), 100);
    const remaining = nextMilestone - statsCarry;

    document.getElementById("toGoal").textContent = toGoal.toLocaleString();
    document.getElementById("goalLabel").textContent = `To Goal (${nextMilestone.toLocaleString()})`;
    document.getElementById("currentvisits").textContent = statsCarry.toLocaleString();

    document.querySelector('.progress-fill').style.width = clampedProgress + '%';
    document.querySelector('.previous-milestone').textContent = formatNumber(previousMilestone);
    document.querySelector('.next-milestone').textContent = formatNumber(nextMilestone);
    document.querySelector('.current-visits').textContent = formatNumber(statsCarry);
    document.querySelector('.remaining').textContent = `${formatNumber(remaining)} remaining`;

    updateProgressBar(statsCarry, nextMilestone);

    document.title = `Video: ${name} Live Statistics`;
}

async function getthumbnail() {
    const responseCarry = await fetch(apiUrl2);
    const dataCarry = await responseCarry.json();

    const userArray = dataCarry.user;

    const nameObj = userArray.find(item => item.value === "name");
    const pfpObj = userArray.find(item => item.value === "pfp");

    const name = nameObj?.count || "Unknown Title";
    const pfp = pfpObj?.count || "";

    document.getElementById('name').textContent = name;

    const gameIcon = document.getElementById('gameIcon');

    if (gameIcon.tagName === 'IMG') {
        gameIcon.src = pfp;
    } else {
        gameIcon.innerHTML = `<img src="${pfp}" alt="Thumbnail" style="max-width: 100%;">`;
    }
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

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var chart = null;
var apiData = [];

function getData() {
    fetch(apiUrl)
        .then(blob => blob.json())
        .then(data => {
            const videoData = data.results[0]; // ✅
            const visits = parseInt(videoData.views); // ✅

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
    Highcharts.setOptions({ global: { useUTC: true } });

    const responseCarry = await fetch(apiUrl);
    const dataCarry = await responseCarry.json();
    const videoData = dataCarry.results[0]; // ✅ FIX
    const statsCarry = parseInt(videoData.views); // ✅ FIX

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
            name: 'Views',
            data: [[Date.now(), statsCarry]],
            lineWidth: 5,
            color: 'white'
        }]
    }, function (ch) {
        chart = ch;
    });
}
