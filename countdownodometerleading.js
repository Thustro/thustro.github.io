(function () {
  // --- Odometer defaults ---
  var VALUE_HTML = '<span class="odometer-value"></span>';
  var RIBBON_HTML = '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' + VALUE_HTML + "</span></span>";
  var DIGIT_HTML = '<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">' + RIBBON_HTML + "</span></span>";
  var FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>';
  var DIGIT_FORMAT = "(ddd).dd";
  var MIN_INTEGER_LEN = 0;
  var FRAMERATE = 60;
  var DURATION = 1000;
  var COUNT_FRAMERATE = 50;
  var FRAMES_PER_VALUE = 2;
  var DIGIT_SPEEDBOOST = 0.5;
  var MS_PER_FRAME = 1000 / FRAMERATE;
  var COUNT_MS_PER_FRAME = 1000 / COUNT_FRAMERATE;

  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  function createFromHTML(html) {
    var el = document.createElement("div");
    el.innerHTML = html;
    return el.children[0];
  }

  function addClass(el, name) { el.className += " " + name; }
  function removeClass(el, name) { el.className = el.className.replace(new RegExp("(^| )" + name.split(" ").join("|") + "( |$)", "gi"), " "); }

  function round(val, precision) {
    if (!precision) return Math.round(val);
    val *= Math.pow(10, precision);
    val = Math.floor(val + 0.5);
    return val / Math.pow(10, precision);
  }

  function now() {
    return (window.performance && window.performance.now) ? window.performance.now() : +new Date();
  }

  // --- Odometer Class ---
  function Odometer(options) {
    this.options = options || {};
    this.el = this.options.el;
    if (!this.el) throw new Error("Odometer: element required");

    if (this.el.odometer) return this.el.odometer;
    this.el.odometer = this;

    this.options.duration = this.options.duration || DURATION;
    this.options.animation = this.options.animation || "count";
    this.options.minIntegerLen = this.options.minIntegerLen || 3; // default leading zeros

    this.value = this.cleanValue(this.options.value || 0);
    this.inside = document.createElement("div");
    this.inside.className = "odometer-inside";
    this.el.innerHTML = "";
    this.el.appendChild(this.inside);

    this.render(this.value);
  }

  Odometer.prototype.cleanValue = function(val) {
    return parseFloat(val) || 0;
  };

  Odometer.prototype.render = function(value) {
    value = value != null ? value : this.value;
    this.inside.innerHTML = "";

    var strVal = value.toFixed(0); // integer
    while (strVal.length < this.options.minIntegerLen) strVal = "0" + strVal; // leading zeros

    for (var i = 0; i < strVal.length; i++) {
      var digit = createFromHTML(DIGIT_HTML);
      digit.querySelector(".odometer-value").innerHTML = strVal[i];
      this.inside.appendChild(digit);
    }
  };

  Odometer.prototype.update = function(newValue) {
    newValue = this.cleanValue(newValue);
    if (newValue === this.value) return;

    var start = this.value;
    var end = newValue;
    var duration = this.options.duration;
    var el = this.inside;
    var odometer = this;
    var startTime = now();

    function tick() {
      var elapsed = now() - startTime;
      if (elapsed >= duration) {
        odometer.value = end;
        odometer.render(end);
        return;
      }

      var progress = elapsed / duration;
      var current = Math.round(start + (end - start) * progress);
      odometer.render(current);

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    this.value = newValue;
  };

  window.Odometer = Odometer;

})();
