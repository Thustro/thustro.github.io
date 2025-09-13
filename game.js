// Function to get the "universeId" from the URL
function getUniverseIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("universeId");
}

const universeId = getUniverseIdFromURL();

// If no universeId in URL, stop execution
if (!universeId) {
    alert("No universeId provided in the URL.");
    throw new Error("universeId missing");
}

const apiUrl = `https://games.roproxy.com/v1/games?universeIds=${universeId}`;
const apivotesUrl = `https://games.roproxy.com/v1/games/${universeId}/votes`;

setInterval(getsubs, 5000);
setInterval(getData, 5000);
setInterval(getvotes, 10000);

getsubs();
getvotes();
fetchGameIcon(universeId);
charts();
getData();

async function getsubs() {
    const responseCarry = await fetch(apiUrl);
    const dataCarry = await responseCarry.json();

    const statsCarry = dataCarry.data[0].visits;
    const gameName = dataCarry.data[0].name;
    const playing = dataCarry.data[0].playing;
    const favourites = dataCarry.data[0].favoritedCount;

    const rootCarry = document.getElementById('count');
    const carry = document.getElementById('odometer');
    odometer.innerHTML = statsCarry;

    const nameElement = document.getElementById('name');
    nameElement.textContent = gameName;

    const players = document.getElementById('statPlaying');
    players.textContent = playing;

    const favorites = document.getElementById('statFavorites');
    favorites.textContent = favourites;

    function calculateNextGoal(n) {
        if (n < 1_000_000) {
            const digits = Math.floor(Math.log10(n));
            const magnitude = Math.pow(10, digits);
            return Math.ceil(n / magnitude) * magnitude;
        } else {
            return Math.ceil(n / 1_000_000) * 1_000_000;
        }
    }

    const nextMilestone = calculateNextGoal(statsCarry);
    const toGoal = nextMilestone - statsCarry;
    const previousMilestone = nextMilestone - 1_000_000;
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
    document.querySelector('.current-visits').textContent = formatNumber(currentVisits);
    document.querySelector('.remaining').textContent = `${formatNumber(remaining)} remaining`;

    updateProgressBar(statsCarry, nextMilestone)

    document.title = `${gameName} Live Statistics`;
}

async function getvotes() {
    const responseCarry = await fetch(apivotesUrl);
    const dataCarry = await responseCarry.json();

    const likes = dataCarry.upVotes;
    const dislikes = dataCarry.downVotes;

    const likescount = document.getElementById('statLikes');
    likescount.textContent = likes;

    const dislikescount = document.getElementById('statDislikes');
    dislikescount.textContent = dislikes;
}

async function fetchGameIcon(universeId) {
    const iconUrl = `https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=true`;

    try {
        const response = await fetch(iconUrl);
        const data = await response.json();

        const imageUrl = data.data[0]?.imageUrl;
        if (imageUrl) {
            const iconElement = document.getElementById('gameIcon');
            if (iconElement) {
                iconElement.src = imageUrl;
            }
        }
    } catch (error) {
        console.error("Failed to fetch game icon:", error);
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

async function fetchLikesDislikes(universeId) {
  // Replace this with the actual API for likes/dislikes if different
  const url = `https://games.roblox.com/v1/games/${universeId}/votes`;
  const response = await fetch(url);
  const data = await response.json();
  return data;  // assuming { likes: ..., dislikes: ... }
}

var chart = null;
var apiData = [];

function getData() {
    fetch(apiUrl)
        .then(blob => blob.json())
        .then(data => {
            const visits = Math.round(data.data[0].visits);

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
    const statsCarry = dataCarry.data[0].visits;

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
            name: 'Visits',
            data: apiData,
            lineWidth: 5,
            color: 'white'
        }]
    }, function (ch) {
        chart = ch;
    });
}