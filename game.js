// ----------------------
// GET UNIVERSE ID
// ----------------------
function getUniverseIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("universeId");
}

const universeId = getUniverseIdFromURL();
if (!universeId) {
    alert("No universeId provided in the URL.");
    throw new Error("universeId missing");
}

const apiUrl = `http://45.130.164.109:3000/visits?universeId=${universeId}`;

// ----------------------
// GLOBAL VARIABLES
// ----------------------
let lastClickCount = null;
let lastUpdateTime = null;
let chart = null;
let apiData = [];

// ----------------------
// WAIT FOR DOM
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    charts();           // initialize chart
    updateStats();      // first fetch
    setInterval(updateStats, 2000);  // update every 2s
    fetchGameIcon(universeId);
});

// ----------------------
// UPDATE STATS
// ----------------------
async function updateStats() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const statsCarry = Math.floor(data.estimatedVisits);
        const gameName = data.name || "Unknown Game";
        const favourites = data.favoritedCount || 0;
        const likes = data.likes || 0;
        const dislikes = data.dislikes || 0;
        const players = data.playing || 0;
        const cpm = data.cpm || 0;
        const cph = data.cph || 0;
        const apiVisits = data.realVisits || 0;

        // Update DOM
        document.getElementById('odometer').textContent = statsCarry.toLocaleString();
        document.getElementById('name').textContent = gameName;
        document.getElementById('statFavorites').textContent = favourites.toLocaleString();
        document.getElementById('statLikes').textContent = likes.toLocaleString();
        document.getElementById('statDislikes').textContent = dislikes.toLocaleString();
        document.getElementById('statPlaying').textContent = players.toLocaleString();
        document.getElementById('statAPIVisits').textContent = apiVisits.toLocaleString();
        document.getElementById('cpm').textContent = cpm.toLocaleString();
        document.getElementById('cph').textContent = cph.toLocaleString();

        // Milestones and progress
        const { next: nextMilestone, previous: previousMilestone } = calculateMilestones(statsCarry);
        const toGoal = nextMilestone - statsCarry;
        const progressPercent = ((statsCarry - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
        const clampedProgress = Math.min(Math.max(progressPercent, 0), 100);
        const remaining = nextMilestone - statsCarry;

        document.getElementById("toGoal").textContent = toGoal.toLocaleString();
        document.getElementById("goalLabel").textContent = `To Goal (${nextMilestone.toLocaleString()})`;
        document.getElementById("currentvisits").textContent = statsCarry.toLocaleString();
        document.querySelector('.progress-fill').style.width = clampedProgress + '%';
        document.querySelector('.previous-milestone').textContent = previousMilestone.toLocaleString();
        document.querySelector('.next-milestone').textContent = nextMilestone.toLocaleString();
        document.querySelector('.remaining').textContent = `${remaining.toLocaleString()} remaining`;

        document.title = `${gameName} Live Statistics`;

        // Chart
        apiData.push([Date.now(), statsCarry]);
        if (chart && chart.series[0]) {
            chart.series[0].setData(apiData, true, false, false);
        }

        // Update ETA
        updateETA(statsCarry, nextMilestone, cpm);

    } catch (err) {
        console.error("Failed to fetch estimation API:", err);
    }
}

// ----------------------
// CALCULATE MILESTONES
// ----------------------
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

// ----------------------
// UPDATE ETA
// ----------------------
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
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
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

// ----------------------
// CHART
// ----------------------
function charts() {
    Highcharts.setOptions({ global: { useUTC: true } });

    chart = Highcharts.chart('container', {
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
            name: 'Visits',
            data: apiData,
            lineWidth: 5,
            color: 'white'
        }]
    });
}

// ----------------------
// FETCH GAME ICON
// ----------------------
async function fetchGameIcon(universeId) {
    const iconUrl = `https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=true`;
    try {
        const response = await fetch(iconUrl);
        const data = await response.json();
        const imageUrl = data.data[0]?.imageUrl;
        if (imageUrl) document.getElementById('gameIcon').src = imageUrl;
    } catch (err) { console.error("Failed to fetch game icon:", err); }
}
