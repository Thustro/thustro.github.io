document.addEventListener("DOMContentLoaded", () => {
  function getYoutubeUserFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("channel");
  }

  const user = getYoutubeUserFromURL();

  const embedLink = document.getElementById("embedLink");
  if (embedLink && user) {
    embedLink.href = `youtubeembed.html?channel=${encodeURIComponent(user)}`;
  }

  if (!user) {
    alert("No channel provided in the URL.");
    throw new Error("channel missing");
  }

  const apiUrl = `https://ests.sctools.org/api/get/${user}`;

  setInterval(getsubs, 3000);
  setInterval(getData, 3000);

  getsubs();
  charts();
  getData();

  async function getsubs() {
    const response = await fetch(apiUrl);
    const json = await response.json();

    const statsCarry = parseInt(json.stats.estCount);   // estimated subs
    const name = json.info.name;
    const apisubcount = parseInt(json.stats.apiCount);
    const views = parseInt(json.stats.viewCount);
    const videos = parseInt(json.stats.videoCount);
    const pfp = json.info.avatar;

    // Update odometer
    document.getElementById('odometer').innerHTML = statsCarry;

    // Update pfp
    document.getElementById('gameIcon').src = pfp;

    // Update name
    document.getElementById('name').textContent = name;

    // Update stat blocks
    document.getElementById('statSubsAPI').textContent = apisubcount.toLocaleString();
    document.getElementById('statViewsAPI').textContent = views.toLocaleString();
    document.getElementById('statVideos').textContent = videos.toLocaleString();

    // Calculate milestones
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

    function formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    document.querySelector('.progress-fill').style.width = clampedProgress + '%';
    document.querySelector('.previous-milestone').textContent = formatNumber(previousMilestone);
    document.querySelector('.next-milestone').textContent = formatNumber(nextMilestone);
    document.querySelector('.current-visits').textContent = formatNumber(statsCarry);
    document.querySelector('.remaining').textContent = `${formatNumber(remaining)} remaining`;

    updateProgressBar(statsCarry, nextMilestone);

    document.title = `${name} Live Statistics`;
  }

  function updateProgressBar(current, goal) {
    const percent = (current / goal) * 100;
    const remaining = goal - current;

    const progressFill = document.getElementById("progressFill");
    const goalLabel = document.getElementById("goalLabel");
    const remainingLabel = document.getElementById("remainingLabel");

    if (progressFill) progressFill.style.width = `${Math.min(percent, 100)}%`;
    if (goalLabel) goalLabel.textContent = `To Goal (${goal.toLocaleString()})`;
    if (remainingLabel) remainingLabel.textContent = `${remaining.toLocaleString()} remaining`;
  }

  var chart = null;
  var apiData = [];

  function getData() {
    fetch(apiUrl)
      .then(res => res.json())
      .then(json => {
        const visits = parseInt(json.stats.estCount);

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

    const response = await fetch(apiUrl);
    const json = await response.json();
    const statsCarry = parseInt(json.stats.estCount);

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
});
