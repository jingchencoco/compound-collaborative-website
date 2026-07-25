const ant = document.createElement("div");
ant.className = "screen-ant";
ant.setAttribute("aria-hidden", "true");
ant.innerHTML = `
  <svg class="ant-svg" viewBox="0 0 120 76" role="img">
    <defs>
      <radialGradient id="antShell" cx="38%" cy="30%" r="72%">
        <stop offset="0" stop-color="#6f4a39"/>
        <stop offset="0.34" stop-color="#3a2119"/>
        <stop offset="0.72" stop-color="#17110e"/>
        <stop offset="1" stop-color="#050403"/>
      </radialGradient>
      <radialGradient id="antHead" cx="40%" cy="34%" r="70%">
        <stop offset="0" stop-color="#302821"/>
        <stop offset="0.45" stop-color="#17120f"/>
        <stop offset="1" stop-color="#050403"/>
      </radialGradient>
      <linearGradient id="antLeg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2a160f"/>
        <stop offset="0.55" stop-color="#6a3d2f"/>
        <stop offset="1" stop-color="#170d09"/>
      </linearGradient>
    </defs>
    <g class="ant-legs" fill="none" stroke="url(#antLeg)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path class="ant-leg ant-leg-a" d="M54 34 C38 24 27 17 13 10 M13 10 C9 8 6 7 2 5"/>
      <path class="ant-leg ant-leg-b" d="M54 42 C39 52 30 61 17 72 M17 72 C13 74 9 75 5 75"/>
      <path class="ant-leg ant-leg-c" d="M64 31 C56 15 50 8 42 1"/>
      <path class="ant-leg ant-leg-d" d="M64 45 C57 60 51 68 43 75"/>
      <path class="ant-leg ant-leg-e" d="M75 32 C86 18 96 12 113 8"/>
      <path class="ant-leg ant-leg-f" d="M75 44 C89 56 99 64 118 70"/>
    </g>
    <g class="ant-antennas" fill="none" stroke="#1a100b" stroke-width="2.1" stroke-linecap="round">
      <path class="ant-antenna ant-antenna-left" d="M88 31 C98 12 100 4 94 1"/>
      <path class="ant-antenna ant-antenna-right" d="M94 42 C105 41 113 48 120 58"/>
    </g>
    <ellipse class="ant-abdomen" cx="29" cy="39" rx="23" ry="19" fill="url(#antShell)"/>
    <ellipse cx="29" cy="39" rx="18" ry="1.5" fill="#b5aa95" opacity="0.24"/>
    <ellipse cx="29" cy="30" rx="15" ry="1.2" fill="#d2c4a8" opacity="0.18"/>
    <ellipse cx="29" cy="48" rx="15" ry="1.2" fill="#d2c4a8" opacity="0.16"/>
    <ellipse class="ant-thorax" cx="61" cy="38" rx="15" ry="18" fill="url(#antShell)"/>
    <ellipse class="ant-waist" cx="47" cy="38" rx="7" ry="6" fill="#211511"/>
    <ellipse class="ant-waist" cx="76" cy="38" rx="6" ry="5" fill="#211511"/>
    <path class="ant-head" d="M79 35 C78 24 84 17 96 18 C108 19 114 27 111 38 C108 50 96 52 86 48 C80 46 78 42 79 35Z" fill="url(#antHead)"/>
    <circle cx="101" cy="27" r="2" fill="#d8d0be" opacity="0.55"/>
    <circle cx="90" cy="29" r="1.5" fill="#d8d0be" opacity="0.38"/>
    <path d="M15 34 C24 25 39 26 47 35" fill="none" stroke="#b8a990" stroke-width="1.1" opacity="0.3"/>
  </svg>
`;
document.body.append(ant);

let antX = Math.random() * window.innerWidth;
let antY = Math.random() * window.innerHeight;
let angle = Math.random() * 360;
let wander = angle;
let pausedUntil = 0;
let nextTwitch = 0;

function bounds() {
  const width = window.innerWidth * 0.6;
  const height = window.innerHeight * 0.6;
  return {
    left: (window.innerWidth - width) / 2,
    right: (window.innerWidth + width) / 2,
    top: (window.innerHeight - height) / 2,
    bottom: (window.innerHeight + height) / 2
  };
}

function keepOnScreen() {
  const area = bounds();
  if (antX < area.left || antX > area.right) {
    wander = 180 - wander + (Math.random() * 60 - 30);
  }
  if (antY < area.top || antY > area.bottom) {
    wander = -wander + (Math.random() * 60 - 30);
  }
  antX = Math.min(area.right, Math.max(area.left, antX));
  antY = Math.min(area.bottom, Math.max(area.top, antY));
}

function touchesImage(x, y) {
  const points = [
    [x, y],
    [x - 12, y],
    [x + 12, y],
    [x, y - 12],
    [x, y + 12]
  ];

  return points.some(([pointX, pointY]) => {
    const target = document.elementFromPoint(pointX, pointY);
    return target?.closest("img, picture, video, canvas, .project-photo, .project-spread-figure, .home-gallery, .project-card");
  });
}

function moveAnt(time = 0) {
  if (time < pausedUntil) {
    requestAnimationFrame(moveAnt);
    return;
  }

  if (Math.random() < 0.026) wander += Math.random() * 76 - 38;
  if (Math.random() < 0.008) pausedUntil = time + 180 + Math.random() * 950;
  if (time > nextTwitch) {
    ant.classList.toggle("is-sensing", Math.random() > 0.35);
    nextTwitch = time + 420 + Math.random() * 1100;
  }

  angle += (wander - angle) * 0.028;
  const radians = angle * Math.PI / 180;
  const sidestep = Math.sin(time / 540) * 0.035;
  const speed = 0.075 + Math.random() * 0.085;
  const nextX = antX + Math.cos(radians) * speed + Math.cos(radians + Math.PI / 2) * sidestep;
  const nextY = antY + Math.sin(radians) * speed + Math.sin(radians + Math.PI / 2) * sidestep;

  if (touchesImage(nextX, nextY)) {
    wander += 95 + Math.random() * 110;
    pausedUntil = time + 120 + Math.random() * 260;
  } else {
    antX = nextX;
    antY = nextY;
  }

  keepOnScreen();
  ant.style.transform = `translate3d(${antX}px, ${antY}px, 0) rotate(${angle}deg) scale(0.13)`;
  requestAnimationFrame(moveAnt);
}

window.addEventListener("mousemove", (event) => {
  const dx = antX - event.clientX;
  const dy = antY - event.clientY;
  const distance = Math.hypot(dx, dy);

  if (distance < 54) {
    wander = Math.atan2(dy, dx) * 180 / Math.PI + (Math.random() * 38 - 19);
  }
});

window.addEventListener("resize", () => {
  keepOnScreen();
});

keepOnScreen();
moveAnt();
