// Get the channel ID from URL (e.g. ?channel=UCX6OQ3DkcsbYNE6H8uQQuVA)
function getChannelIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("channel");
}

const channelId = getChannelIdFromURL();

if (!channelId) {
    alert("No channel ID provided in the URL. Example: ?channel=UCX6OQ3DkcsbYNE6H8uQQuVA");
    throw new Error("Channel ID missing");
}

let videoId = null;
let apiUrl = null;
let apiUrl2 = null;
let lastVideoId = null; // For detecting new uploads

async function fetchLatestVideoFromDecAPI(channelId) {
    const decapiUrl = `https://decapi.me/youtube/latest_video?id=${encodeURIComponent(channelId)}`;
    const response = await fetch(decapiUrl);
    const text = await response.text();

    const match = text.match(/(?:v=|youtu\.be\/)([\w\-]+)/);
    if (!match) {
        throw new Error("Could not extract video ID from DecAPI response: " + text);
    }

    return match[1]; // videoId
}

async function init() {
    try {
        videoId = await fetchLatestVideoFromDecAPI(channelId);
        lastVideoId = videoId;

        apiUrl2 = `https://mixerno.space/api/youtube-video-counter/user/${videoId}`;

        getsubs();
        charts();
        getData();
        getthumbnail();

        // Check for new video every 60 seconds
        setInterval(checkForNewVideo, 60000);

        // Refresh stats every 5 seconds
        setInterval(getsubs, 5000);
        setInterval(getData, 5000);

    } catch (error) {
        console.error("Error initializing app:", error);
        alert("Failed to get latest video ID. Check console for details.");
    }
}

// Check if a new video is posted and update if yes
async function checkForNewVideo() {
    try {
        const newVideoId = await fetchLatestVideoFromDecAPI(channelId);
        if (newVideoId !== lastVideoId) {
            console.log("New video detected:", newVideoId);

            videoId = newVideoId;
            lastVideoId = newVideoId;

            apiUrl2 = `https://mixerno.space/api/youtube-video-counter/user/${videoId}`;

            getsubs();
            getData();
            charts();
            getthumbnail();
        }
    } catch (error) {
        console.error("Error checking for new video:", error);
    }
}

async function getsubs() {
    if (!apiUrl2) return;

    try {
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
        const viewsapi = getCount("apiviews");

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
    } catch (e) {
        console.error("Error in getsubs:", e);
    }
}

async function getthumbnail() {
    if (!apiUrl2) return;

    try {
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
    } catch (e) {
        console.error("Error in getthumbnail:", e);
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
    if (!apiUrl2) return;

    fetch(apiUrl2)
        .then(blob => blob.json())
        .then(data => {
            // API response doesn't have results[], get views from counts[]
            const viewsCountObj = data.counts.find(c => c.value === 'views');
            if (!viewsCountObj || !viewsCountObj.count) {
                console.warn("No views count in API data");
                return;
            }
            const visits = parseInt(viewsCountObj.count);

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
    if (!apiUrl2) return;

    Highcharts.setOptions({ global: { useUTC: true } });

    try {
        const dataCarry = await fetch(apiUrl2).then(res => res.json());

        // Extract views from counts array
        const viewsCountObj = dataCarry.counts.find(c => c.value === 'views');
        if (!viewsCountObj || !viewsCountObj.count) {
            console.warn("No views count in chart API data");
            return;
        }
        const statsCarry = parseInt(viewsCountObj.count);

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
    } catch (e) {
        console.error("Error creating chart:", e);
    }
}

// Start the app!
init();
