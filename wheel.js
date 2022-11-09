var TWO_PI = Math.PI * 2;
var HALF_PI = Math.PI * 0.5;
var WHEEL_STATUS = 'None'; // None, New, Prizes
var PIE_DATA = [
  { label: [], value: 0, color: "#BD4932" },
  { label: ["100"], value: 1, color: "#FFFAD5" },
  { label: ["2", "0", "0"], value: 2, color: "#FFFAD5" },
  { label: ["3", "0", "0"], value: 3, color: "#BD4932" },
  { label: ["4", "0", "0"], value: 4, color: "#FFFAD5" },
  { label: ["5", "0", "0"], value: 5, color: "#BD4932" },
  { label: ["6", "0", "0"], value: 6, color: "#FFFAD5" },
  { label: ["7", "0", "0"], value: 7, color: "#BD4932" },
  { label: [], value: 0, color: "#FFFAD5" },
  { label: ["100"], value: 1, color: "#BD4932" },
  { label: ["2", "0", "0"], value: 2, color: "#FFFAD5" },
  { label: ["3", "0", "0"], value: 3, color: "#FFFAD5" },
  { label: ["4", "0", "0"], value: 4, color: "#BD4932" },
  { label: ["5", "0", "0"], value: 5, color: "#FFFAD5" },
  { label: ["6", "0", "0"], value: 6, color: "#BD4932" },
  { label: ["7", "0", "0"], value: 7, color: "#FFFAD5" },
  { label: [], value: 0, color: "#BD4932" },
  { label: ["100"], value: 1, color: "#FFFAD5" },
  { label: ["2", "0", "0"], value: 2, color: "#FFFAD5" },
  { label: ["3", "0", "0"], value: 3, color: "#BD4932" },
  { label: ["4", "0", "0"], value: 4, color: "#FFFAD5" },
  { label: ["5", "0", "0"], value: 5, color: "#BD4932" },
  { label: ["6", "0", "0"], value: 6, color: "#FFFAD5" },
  { label: ["7", "0", "0"], value: 7, color: "#BD4932" },
]
var innerWidth = window.innerWidth;
var innerHeight = window.innerHeight;
var w = innerHeight - 40, h = innerHeight - 40, r = (Math.min(w, h));
var previousRotation = 0;


// canvas settings
var viewWidth = r,
  viewHeight = r,
  viewCenterX = viewWidth * 0.5,
  viewCenterY = viewHeight * 0.5,
  drawingCanvas = document.getElementById("drawing_canvas"),
  ctx,
  timeStep = (1 / 60),
  time = 0;

var ppm = 24, // pixels per meter
  physicsWidth = viewWidth / ppm,
  physicsHeight = viewHeight / ppm,
  physicsCenterX = physicsWidth * 0.5,
  physicsCenterY = physicsHeight * 0.5;

var world;

var wheel,
  rim,
  arrow,
  mouseBody,
  mouseConstraint;

var arrowMaterial,
  pinMaterial,
  contactMaterial;

var wheelSpinning = false,
  wheelStopped = true;


window.onload = function () {
  initGame();
  initDrawingCanvas();
  initPhysics();

  requestAnimationFrame(loop);

  // setTimeout(function () {
  //   world.on('impact', function (event) {
  //     if (Math.abs(previousRotation - wheel.body.angle) > 0.1 * TWO_PI / PIE_DATA.length) {
  //       var audio = new Audio('audio/click.ogg');
  //       audio.play();
  //       previousRotation = wheel.body.angle;
  //     }
  //   });
  // }, 2000);
};

document.querySelector("#controls .switch").onclick = function () {
  var classList = document.body.classList;
  var bgImage = document.getElementById("bg");
  var toggleImage = document.getElementById("toggle");
  if (classList.contains("portrait")) {
    classList.remove("portrait");
    bgImage.src = "images/bg_horizontal.jpg";
    toggleImage.src = "images/rotate_vertical.svg";
  } else {
    classList.add("portrait");
    bgImage.src = "images/bg_vertical.jpg";
    toggleImage.src = "images/rotate_horizontal.svg";
  }
}

function initGame() {
  // var oReq = new XMLHttpRequest();
  // oReq.addEventListener("load", setGame);
  // oReq.open("GET", "https://surveyswithgames.com/api/gyw-survey-download.php?id=111&device_id=serialnum&email=admin%40gamifyourworld.com");
  // oReq.send();

  for (var level = 0; level < 8; level++) {
    const levelColor = getRandomColor();
    for (index = 0; index < PIE_DATA.length; index++) {
      if (PIE_DATA[index].value === level) {
        PIE_DATA[index].color = levelColor;
      }
    }
  };
  var leftImages = document.querySelectorAll("#container #left-prizes img");
  leftImages[0].style.backgroundColor = '#111';
  leftImages[1].style.backgroundColor = PIE_DATA[7].color;
  leftImages[2].style.backgroundColor = PIE_DATA[6].color;
  leftImages[3].style.backgroundColor = PIE_DATA[5].color;

  var rightImages = document.querySelectorAll("#container #right-prizes img");
  rightImages[0].style.backgroundColor = PIE_DATA[4].color;
  rightImages[1].style.backgroundColor = PIE_DATA[3].color;
  rightImages[2].style.backgroundColor = PIE_DATA[2].color;
  rightImages[3].style.backgroundColor = PIE_DATA[1].color;

  var _index = Math.floor(Math.random() * PIE_DATA.length)
  PIE_DATA.splice(_index, 0, { label: "GRAND", value: 10, color: "#111111" });
};

function initDrawingCanvas() {
  drawingCanvas.width = viewWidth;
  drawingCanvas.height = viewHeight;
  ctx = drawingCanvas.getContext('2d');

  drawingCanvas.addEventListener('mousemove', updateMouseBodyPosition);
  drawingCanvas.addEventListener('mousedown', checkStartDrag);
  drawingCanvas.addEventListener('mouseup', checkEndDrag);
  drawingCanvas.addEventListener('mouseout', checkEndDrag);
}

function updateMouseBodyPosition(e) {
  var p = getPhysicsCoord(e);
  mouseBody.position[0] = p.x;
  mouseBody.position[1] = p.y;
}

function checkStartDrag(e) {
  if (world.hitTest(mouseBody.position, [wheel.body])[0]) {
    if (Math.abs(wheel.body.angularVelocity) > 20) {
      wheel.body.angularVelocity = -10 - 10 * Math.random();
    }
    mouseConstraint = new p2.RevoluteConstraint(mouseBody, wheel.body, {
      worldPivot: mouseBody.position,
      collideConnected: false
    });

    world.addConstraint(mouseConstraint);
  }

  if (wheelSpinning === true) {
    wheelSpinning = false;
    wheelStopped = true;
  }
}

function checkEndDrag(e) {
  if (mouseConstraint) {
    // Move when clicked
    if (Math.abs(wheel.body.angularVelocity) < 1 || Math.abs(wheel.body.angularVelocity) > 20) {
      wheel.body.angularVelocity = -10 - 10 * Math.random();
    }
    world.removeConstraint(mouseConstraint);
    mouseConstraint = null;
    WHEEL_STATUS = 'New';
  }
}

function getPhysicsCoord(e) {
  var rect = drawingCanvas.getBoundingClientRect(),
    x = (e.clientX - rect.left) / ppm,
    y = physicsHeight - (e.clientY - rect.top) / ppm;

  return { x: x, y: y };
}

function initPhysics() {
  world = new p2.World();
  world.solver.iterations = 100;
  world.solver.tolerance = 0;

  arrowMaterial = new p2.Material();
  pinMaterial = new p2.Material();
  contactMaterial = new p2.ContactMaterial(arrowMaterial, pinMaterial, {
    friction: 0.0,
    restitution: 0.1
  });
  world.addContactMaterial(contactMaterial);

  var wheelRadius = physicsCenterX * 0.9,
    wheelX = physicsCenterX,
    wheelY = physicsCenterY,
    arrowX = wheelX,
    arrowY = wheelY + wheelRadius + 0.4;

  wheel = new Wheel(wheelX, wheelY, wheelRadius, PIE_DATA.length, 0.04, 0.98 * wheelRadius);
  wheel.body.angle = 0;
  wheel.body.angularVelocity = 0;
  rim = new Rim(wheelX, wheelY, wheelRadius, PIE_DATA.length, wheelRadius / 50, 1.04 * wheelRadius);
  rim.body.angle = (Math.PI / 32.5);
  arrow = new Arrow(arrowX, arrowY, wheelRadius / 16, wheelRadius / 8);
  mouseBody = new p2.Body();

  world.addBody(mouseBody);
}

function update() {
  // p2 does not support continuous collision detection :(
  // but stepping twice seems to help
  // considering there are only a few bodies, this is ok for now.
  world.step(timeStep * 0.5);
  world.step(timeStep * 0.5);

  if (wheelSpinning === false && wheelStopped === true && Math.abs(wheel.body.angularVelocity) < 0.1 &&
    arrow.hasStopped() && WHEEL_STATUS === 'New') {
    wheel.body.angularVelocity = 0;
    var win = wheel.gotLucky();
    win = win % PIE_DATA.length;
    WHEEL_STATUS = 'Prizes';
    showPrizes(win);
  }
}

function draw() {
  ctx.fillStyle = '#fff';
  ctx.clearRect(0, 0, viewWidth, viewHeight);

  rim.draw();
  wheel.draw();
  arrow.draw();
}

function loop() {
  update();
  draw();

  requestAnimationFrame(loop);
}

/////////////////////////////
// wheel
/////////////////////////////
function Wheel(x, y, radius, segments, pinRadius, pinDistance) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.segments = segments;
  this.pinRadius = pinRadius;
  this.pinDistance = pinDistance;

  this.pX = this.x * ppm;
  this.pY = (physicsHeight - this.y) * ppm;
  this.pRadius = this.radius * ppm;
  this.pPinRadius = this.pinRadius * ppm;
  this.pPinPositions = [];

  this.deltaPI = TWO_PI / this.segments;

  this.createBody();
  this.createPins();
}
Wheel.prototype = {
  createBody: function () {
    this.body = new p2.Body({ mass: 1, position: [this.x, this.y] });
    this.body.angularDamping = 0.0;
    this.body.addShape(new p2.Circle(this.radius));
    this.body.shapes[0].sensor = true; //TODO use collision bits instead

    var axis = new p2.Body({ position: [this.x, this.y] });
    var constraint = new p2.LockConstraint(this.body, axis);
    constraint.collideConnected = false;

    world.addBody(this.body);
    world.addBody(axis);
    world.addConstraint(constraint);
  },
  createPins: function () {
    var l = this.segments,
      pin = new p2.Circle(this.pinRadius);

    pin.material = pinMaterial;

    for (var i = 0; i < l; i++) {
      var x = Math.cos(i / l * TWO_PI) * this.pinDistance,
        y = Math.sin(i / l * TWO_PI) * this.pinDistance;

      this.body.addShape(pin, [x, y]);
      this.pPinPositions[i] = [x * ppm, -y * ppm];
    }
  },
  gotLucky: function () {
    var currentRotation = wheel.body.angle - HALF_PI;
    var currentSegment = Math.floor(currentRotation / this.deltaPI);
    currentSegment = currentSegment % PIE_DATA.length;
    if (currentSegment > -1) {
      return currentSegment
    }
    return PIE_DATA.length + currentSegment;
  },
  draw: function () {
    // TODO this should be cached in a canvas, and drawn as an image
    // also, more doodads
    ctx.save();
    ctx.translate(this.pX, this.pY);
    ctx.rotate(-this.body.angle);

    for (var i = 0; i < this.segments; i++) {
      var rimInGradient = ctx.createRadialGradient(0, 0, 0.98 * this.pRadius, 0, 0, 0.99 * this.pRadius, 0, 0, this.pRadius);
      rimInGradient.addColorStop(0, PIE_DATA[i].color);
      rimInGradient.addColorStop(0, "#666666");
      rimInGradient.addColorStop(1, "#DADADA");
      ctx.beginPath();
      ctx.fillStyle = rimInGradient;
      ctx.arc(0, 0, this.pRadius, i * this.deltaPI, (i + 1) * this.deltaPI);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    }

    var logoGradient = ctx.createRadialGradient(0, 0, 0.95 * 0.2 * this.pRadius, 0, 0, 0.2 * this.pRadius);
    logoGradient.addColorStop(0, "#DADADA");
    logoGradient.addColorStop(1, "#666666");

    ctx.beginPath();
    ctx.fillStyle = logoGradient;
    ctx.arc(0, 0, 0.2 * this.pRadius, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = "transparent";

    this.pPinPositions.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], this.pPinRadius, 0, TWO_PI);
      ctx.fill();
    }, this);

    var img = new Image();
    img.src = "images/logo_with_text.png";
    var dx, dy, lw, lh;
    dx = -0.15 * this.radius * ppm;
    dy = -0.15 * this.radius * ppm;
    lw = 0.3 * this.radius * ppm;
    lh = 0.3 * this.radius * ppm;
    ctx.drawImage(img, dx, dy, lw, lh);
    ctx.restore();

    var tX, tY, deltaAngle, fontSize, deltaRadius, radiusWeight;
    var basis = 60 * r / 593;
    for (var i = 0; i < this.segments; i++) {
      var labels = PIE_DATA[i].label
      for (var index = 0; index < labels.length; index++) {
        ctx.save();
        ctx.translate(this.pX, this.pY);
        ctx.rotate(-this.body.angle);
        if (labels.length > 3) {
          deltaAngle = 0.2;
        } else {
          deltaAngle = 0.7;
        }
        if (labels[index].length > 1) {
          fontSize = 0.54 * basis;
          deltaAngle = 0;
          deltaRadius = 0.85;
        } else {
          deltaRadius = 0.76;
          if (labels.length > 3) {
            fontSize = basis - 10 * index;
          } else {
            fontSize = basis - 10 * index;
          }
        }
        if (index < 3) {
          radiusWeight = deltaRadius - 0.15 * index * (basis + 10 - 4 * index) / basis;
        } else {
          radiusWeight = deltaRadius - 0.15 * index * (basis + 10 - 4 * index) / basis + 0.01 * (index - 2);
        }
        tX = radiusWeight * this.pRadius * Math.cos(i * this.deltaPI + deltaAngle * this.deltaPI / 4);
        tY = radiusWeight * this.pRadius * Math.sin(i * this.deltaPI + deltaAngle * this.deltaPI / 4);
        ctx.translate(tX, tY);
        ctx.rotate(HALF_PI - this.deltaPI / 2 + 0.2 + i * this.deltaPI);
        ctx.font = fontSize + "px Helvetica";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(labels[index], 0, 0);
        ctx.restore();
      }
    }
  }
};
/////////////////////////////
// wheel rim
/////////////////////////////
function Rim(x, y, radius, segments, pinRadius, pinDistance) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.segments = segments;
  this.pinRadius = pinRadius;
  this.pinDistance = pinDistance;

  this.pX = this.x * ppm;
  this.pY = (physicsHeight - this.y) * ppm;
  this.pRadius = this.radius * ppm;
  this.pPinRadius = this.pinRadius * ppm;
  this.pPinPositions = [];

  this.deltaPI = TWO_PI / this.segments;

  this.createBody();
  this.createPins();
}
Rim.prototype = {
  createBody: function () {
    this.body = new p2.Body({ mass: 1, position: [this.x, this.y] });
    this.body.angularDamping = 0.0;
    this.body.addShape(new p2.Circle(this.radius));
    this.body.shapes[0].sensor = true; //TODO use collision bits instead

    var axis = new p2.Body({ position: [this.x, this.y] });

    world.addBody(this.body);
  },
  createPins: function () {
    var l = this.segments,
      pin = new p2.Circle(this.pinRadius);

    pin.material = pinMaterial;

    for (var i = 0; i < l; i++) {
      var x = Math.cos(i / l * TWO_PI) * this.pinDistance,
        y = Math.sin(i / l * TWO_PI) * this.pinDistance;

      this.body.addShape(pin, [x, y]);
      this.pPinPositions[i] = [x * ppm, -y * ppm];
    }
  },
  draw: function () {
    // TODO this should be cached in a canvas, and drawn as an image
    // also, more doodads
    ctx.save();
    ctx.translate(this.pX, this.pY);

    var rimOutGradient = ctx.createRadialGradient(0, 0, 0.99 * 1.1 * this.pRadius, 0, 0, 1.1 * this.pRadius);
    rimOutGradient.addColorStop(0, "#DADADA");
    rimOutGradient.addColorStop(1, "#666666");

    ctx.beginPath();
    ctx.fillStyle = rimOutGradient;
    ctx.arc(0, 0, 1.1 * this.pRadius, 0, TWO_PI);
    ctx.fill();

    // ctx.rotate(-this.body.angle);

    ctx.fillStyle = '#871113';

    this.pPinPositions.forEach(function (p) {
      var pointGradient = ctx.createRadialGradient(p[0], p[1], 0.5 * this.pPinRadius, p[0], p[1], this.pPinRadius);
      pointGradient.addColorStop(0, "#c71113");
      pointGradient.addColorStop(1, "#871113");
      ctx.beginPath();
      ctx.fillStyle = pointGradient;
      ctx.arc(p[0], p[1], this.pPinRadius, 0, TWO_PI);
      ctx.fill();
    }, this);

    ctx.restore();
  }
};
/////////////////////////////
// arrow on top of the wheel
/////////////////////////////
function Arrow(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.verts = [];

  this.pX = this.x * ppm;
  this.pY = (physicsHeight - this.y) * ppm;
  this.pVerts = [];

  this.createBody();
}
Arrow.prototype = {
  createBody: function () {
    this.body = new p2.Body({ mass: 1, position: [this.x, this.y] });
    this.body.addShape(this.createArrowShape());

    var axis = new p2.Body({ position: [this.x, this.y] });
    var constraint = new p2.RevoluteConstraint(this.body, axis, {
      worldPivot: [this.x, this.y]
    });
    constraint.collideConnected = false;

    var left = new p2.Body({ position: [this.x - 2, this.y] });
    var right = new p2.Body({ position: [this.x + 2, this.y] });
    var leftConstraint = new p2.DistanceConstraint(this.body, left, {
      localAnchorA: [-this.w * 2, this.h * 0.25],
      collideConnected: false
    });
    var rightConstraint = new p2.DistanceConstraint(this.body, right, {
      localAnchorA: [this.w * 2, this.h * 0.25],
      collideConnected: false
    });
    var s = 32,
      r = 4;

    leftConstraint.setStiffness(s);
    leftConstraint.setRelaxation(r);
    rightConstraint.setStiffness(s);
    rightConstraint.setRelaxation(r);

    world.addBody(this.body);
    world.addBody(axis);
    world.addConstraint(constraint);
    world.addConstraint(leftConstraint);
    world.addConstraint(rightConstraint);
  },

  createArrowShape: function () {
    this.verts[0] = [0, this.h * 0.25];
    this.verts[1] = [-this.w * 0.5, 0];
    this.verts[2] = [0, -this.h * 0.75];
    this.verts[3] = [this.w * 0.5, 0];

    this.pVerts[0] = [this.verts[0][0] * ppm, -this.verts[0][1] * ppm];
    this.pVerts[1] = [this.verts[1][0] * ppm, -this.verts[1][1] * ppm];
    this.pVerts[2] = [this.verts[2][0] * ppm, -this.verts[2][1] * ppm];
    this.pVerts[3] = [this.verts[3][0] * ppm, -this.verts[3][1] * ppm];

    var shape = new p2.Convex(this.verts);
    shape.material = arrowMaterial;

    return shape;
  },
  hasStopped: function () {
    var angle = Math.abs(this.body.angle % TWO_PI);

    return (angle < 1e-3 || (TWO_PI - angle) < 1e-3);
  },
  update: function () {

  },
  draw: function () {
    ctx.save();
    ctx.translate(this.pX, this.pY);
    ctx.rotate(-this.body.angle);

    ctx.fillStyle = '#65A33E';

    ctx.beginPath();
    ctx.moveTo(this.pVerts[0][0], this.pVerts[0][1]);
    ctx.lineTo(this.pVerts[1][0], this.pVerts[1][1]);
    ctx.lineTo(this.pVerts[2][0], this.pVerts[2][1]);
    ctx.lineTo(this.pVerts[3][0], this.pVerts[3][1]);
    ctx.closePath();
    ctx.fill();

    var img = new Image();
    img.src = "images/tick.png";
    ctx.drawImage(img, -this.w * ppm / 2, -this.h * ppm / 4, this.w * ppm, this.h * ppm);

    ctx.restore();
  }
};

function getRandomColor() {
  var letters = '56789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

function setGame() {
  var response = JSON.parse(this.responseText);
  var prizes = response.games[0].prizes;
  var leftPrizes = document.querySelectorAll("#left-prizes img");
  for (var i = 0; i < 4; i++) {
    leftPrizes[i].src = prizes[0].image;
  }
  var rightPrizes = document.querySelectorAll("#right-prizes img");
  for (var i = 0; i < 4; i++) {
    rightPrizes[i].src = prizes[1].image;
  }
}

function showPrizes(win) {
  document.getElementById("center-prize").src = "images/defaultprize" + PIE_DATA[win].value + ".png";
  document.querySelector("#center-prize").style.backgroundColor = PIE_DATA[win].color;

  document.querySelector('#container').style.display = "none";
  document.querySelector('#prize').style.display = "flex";

  var rgb = hexToRgb(PIE_DATA[win].color);
  var color = new Color(rgb[0], rgb[1], rgb[2]);
  var solver = new Solver(color);
  var result = solver.solve();
  var leftPrizes = document.querySelectorAll("#prize #left-prizes img");
  for (var i = 0; i < 3; i++) {
    leftPrizes[i].style.filter = result.filter;
  }
  var rightPrizes = document.querySelectorAll("#prize #right-prizes img");
  for (var i = 0; i < 3; i++) {
    rightPrizes[i].style.filter = result.filter;
  }

  var audio = new Audio('audio/win.ogg');
  audio.play();

  setTimeout(function () {
    document.querySelector('#container').style.display = "flex";
    document.querySelector('#prize').style.display = "none";
  }, 5000);
}