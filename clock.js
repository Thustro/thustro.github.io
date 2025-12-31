// ------------------------
// GET TIMEZONE FROM URL
// ------------------------
function getTimezone() {
    const params = new URLSearchParams(window.location.search);
    const tz = params.get("tz");

    // Validate timezone
    if (tz && moment.tz.zone(tz)) {
        return tz;
    }

    return moment.tz.guess(); // fallback
}

const timezone = getTimezone();
document.getElementById("timezoneText").textContent = timezone;


// ------------------------
// DIGITAL CLOCK + DATE
// ------------------------
function updateClock() {
    const now = moment().tz(timezone);

    const hh = now.format("HH");
    const mm = now.format("mm");
    const ss = now.format("ss");

    // Update odometers
    document.getElementById("hh").innerHTML = hh;
    document.getElementById("mm").innerHTML = mm;
    document.getElementById("ss").innerHTML = ss;

    // Date text
    const dateStr = now.format("dddd, MMMM D, YYYY");
    document.getElementById("dateText").textContent = dateStr;

    drawAnalogClock(now);
}

setInterval(updateClock, 1000);
updateClock();


// ------------------------
// ANALOG CLOCK (timezone aware)
// ------------------------
function drawAnalogClock(now) {
    const canvas = document.getElementById("analogClock");
    const ctx = canvas.getContext("2d");

    const radius = canvas.width / 2;

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(radius, radius);

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, radius - 3, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hour marks
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.rotate(Math.PI / 6);
        ctx.moveTo(0, -radius + 10);
        ctx.lineTo(0, -radius + 25);
        ctx.stroke();
    }

    ctx.resetTransform();
    ctx.translate(radius, radius);

    const hour = now.hours() % 12;
    const minute = now.minutes();
    const second = now.seconds();

    // Hour hand
    ctx.rotate((Math.PI / 6) * hour + (Math.PI / 360) * minute);
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white";
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -radius + 45);
    ctx.stroke();
    ctx.resetTransform();
    ctx.translate(radius, radius);

    // Minute hand
    ctx.rotate((Math.PI / 30) * minute);
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    ctx.moveTo(0, 15);
    ctx.lineTo(0, -radius + 25);
    ctx.stroke();
    ctx.resetTransform();
    ctx.translate(radius, radius);

    // Second hand (WHITE now)
    ctx.rotate((Math.PI / 30) * second);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";  // <-- changed from red to white
    ctx.moveTo(0, 20);
    ctx.lineTo(0, -radius + 20);
    ctx.stroke();
}
