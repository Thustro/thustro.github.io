function getGameIdsFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        game1: params.get("game1"),
        game2: params.get("game2")
    };
}

const { game1, game2 } = getGameIdsFromURL();

// Stop if game1 or game2 is missing
if (!game1 || !game2) {
    alert("Both game1 and game2 must be provided in the URL.");
    throw new Error("Missing game1 or game2 in URL");
}

let game1Visits = null;
let game2Visits = null;


const apiUrls = {
    1: `https://games.roproxy.com/v1/games?universeIds=${game1}`,
    2: `https://games.roproxy.com/v1/games?universeIds=${game2}`
};

const gameIds = { 1: game1, 2: game2 };
const chartsMap = {};
const apiDataMap = { 1: [], 2: [] };

// Fetch data every 5 seconds
setInterval(() => {
    updateGameData(game1, 1);
    updateGameData(game2, 2);
}, 5000);

// Initial fetch
updateGameData(game1, 1);
updateGameData(game2, 2);
fetchGameIcon(game1, 1);
fetchGameIcon(game2, 2);
charts(game1, 'container', 1);
charts(game2, 'container2', 2);

function updateVisitDifference(visit1, visit2) {
  const difference = Math.abs(visit1 - visit2);
  document.getElementById("visitDifference").textContent = difference.toLocaleString();
}

async function updateGameData(universeId, index) {
    const response = await fetch(apiUrls[index]);
    const data = await response.json();

    const visits = data.data[0].visits;
    const gameName = data.data[0].name;

    // Set the correct visit variable
    if (index === 1) {
        game1Visits = visits;
    } else {
        game2Visits = visits;
    }

    // Update DOM elements
    document.getElementById(`odometer${index === 1 ? '' : '2'}`).innerHTML = visits;
    document.getElementById(`name${index === 1 ? '' : '2'}`).textContent = gameName;
    document.getElementById(`currentvisits${index === 1 ? '' : '2'}`).textContent = formatNumber(visits);
    document.title = `${gameName} Live Statistics`;

    updateProgressUI(visits, index);
    updateChartData(index, visits);

    // Update difference (only if both are loaded)
    if (game1Visits !== null && game2Visits !== null) {
        updateVisitDifference(game1Visits, game2Visits);
    }
}


async function fetchGameIcon(universeId, index) {
    const iconUrl = `https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=true`;

    try {
        const response = await fetch(iconUrl);
        const data = await response.json();

        const imageUrl = data.data[0]?.imageUrl;
        if (imageUrl) {
            document.getElementById(`gameIcon${index === 1 ? '' : '2'}`).src = imageUrl;
        }
    } catch (error) {
        console.error("Failed to fetch game icon:", error);
    }
}

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

    return { next, previous };
}

function updateProgressUI(visits, index) {
    const { previous, next } = calculateMilestones(visits);
    const percent = ((visits - previous) / (next - previous)) * 100;
    const clampedPercent = Math.min(Math.max(percent, 0), 100);
    const remaining = next - visits;

    document.querySelector(`.progress-fill${index === 1 ? '' : '2'}`).style.width = clampedPercent + '%';
    document.querySelector(`.previous-milestone${index === 1 ? '' : '2'}`).textContent = formatNumber(previous);
    document.querySelector(`.next-milestone${index === 1 ? '' : '2'}`).textContent = formatNumber(next);
    document.querySelector(`#currentvisits${index === 1 ? '' : '2'}`).textContent = formatNumber(visits);
    document.querySelector(`.remaining${index === 1 ? '' : '2'}`).textContent = `${formatNumber(remaining)} remaining`;
}

function updateChartData(index, visits) {
    const now = Date.now();
    const dataArray = apiDataMap[index];

    dataArray.push([now, visits]);

    if (chartsMap[index]) {
        if (dataArray.length > 8) {
            dataArray.shift();
            chartsMap[index].series[0].setData(dataArray);
        } else {
            chartsMap[index].series[0].addPoint([now, visits]);
        }
    }
}

function formatNumber(num) {
    return num.toLocaleString();
}

async function charts(universeId, containerId, index) {
    Highcharts.setOptions({ global: { useUTC: true } });

    const response = await fetch(apiUrls[index]);
    const data = await response.json();
    const visits = data.data[0].visits;

    Highcharts.chart(containerId, {
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
            data: apiDataMap[index],
            lineWidth: 5,
            color: 'white'
        }]
    }, function (chartInstance) {
        chartsMap[index] = chartInstance;
    });
}
