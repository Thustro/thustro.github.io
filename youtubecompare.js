function getChannelIdsFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        channel1: params.get("channel1"),
        channel2: params.get("channel2")
    };
}

const { channel1, channel2 } = getChannelIdsFromURL();

// Stop if channel1 or channel2 is missing
if (!channel1 || !channel2) {
    alert("Both channel1 and channel2 must be provided in the URL.");
    throw new Error("Missing channel1 or channel2 in URL");
}

let channel1Subs = null;
let channel2Subs = null;

const apiUrls = {
    1: `https://api-v2.nextcounts.com/api/youtube/channel/estimate/mixerno/${channel1}`,
    2: `https://api-v2.nextcounts.com/api/youtube/channel/estimate/mixerno/${channel2}`
};

const chartsMap = {};
const apiDataMap = { 1: [], 2: [] };

// Fetch data every 5 seconds
setInterval(() => {
    updateGameData(channel1, 1);
    updateGameData(channel2, 2);
}, 5000);

fetchGameIcon(channel1, 1);
fetchGameIcon(channel2, 2);
updateGameData(channel1, 1);
updateGameData(channel2, 2);
charts(channel1, 'container', 1);
charts(channel2, 'container2', 2);

function updateVisitDifference(visit1, visit2) {
    const difference = Math.abs(visit1 - visit2);
    document.getElementById("visitDifference").textContent = difference.toLocaleString();
}

async function updateGameData(channelId, index) {
    try {
        const response = await fetch(apiUrls[index]);
        const data = await response.json();

        console.log(`API response for channel ${channelId}:`, data);

        // Access properties directly, no nested data array
        const subs = data.estimatedSubCount || 0;
        const channelname = data.channelName || "Unknown";

        if (index === 1) {
            channel1Subs = subs;
        } else {
            channel2Subs = subs;
        }

        document.getElementById(`odometer${index === 1 ? '' : '2'}`).innerHTML = subs.toLocaleString();
        document.getElementById(`name${index === 1 ? '' : '2'}`).textContent = channelname;
        document.getElementById(`currentvisits${index === 1 ? '' : '2'}`).textContent = subs.toLocaleString();

        updateProgressUI(subs, index);
        updateChartData(index, subs);

        if (channel1Subs !== null && channel2Subs !== null) {
            updateVisitDifference(channel1Subs, channel2Subs);
        }
    } catch (error) {
        console.error(`Failed to update data for channel ${channelId}:`, error);
    }
}

async function fetchGameIcon(channelId, index) {
    const iconUrl = `https://api-v2.nextcounts.com/api/youtube/channel/estimate/mixerno/${channelId}`;

    try {
        const response = await fetch(iconUrl);
        const data = await response.json();

        const imageUrl = data.avatar;
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
    document.querySelector(`.previous-milestone${index === 1 ? '' : '2'}`).textContent = previous.toLocaleString();
    document.querySelector(`.next-milestone${index === 1 ? '' : '2'}`).textContent = next.toLocaleString();
    document.querySelector(`#currentvisits${index === 1 ? '' : '2'}`).textContent = visits.toLocaleString();
    document.querySelector(`.remaining${index === 1 ? '' : '2'}`).textContent = `${remaining.toLocaleString()} remaining`;
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

async function charts(channelId, containerId, index) {
    Highcharts.setOptions({ global: { useUTC: true } });

    try {
        const response = await fetch(apiUrls[index]);
        const data = await response.json();

        // Adjust data access depending on API response structure
        const visits = data.estimatedSubCount || 0;

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
    } catch (error) {
        console.error("Failed to initialize chart:", error);
    }
}
