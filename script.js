const businessCard = document.querySelector("#business-card");
const canvas = document.querySelector("#network-canvas");
const cardWrap = document.querySelector(".card-wrap");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (businessCard) {
  businessCard.addEventListener("error", () => {
    businessCard.closest(".card-wrap")?.setAttribute("hidden", "");
  });
}

if (canvas) {
  const context = canvas.getContext("2d");
  const pointer = { x: -1000, y: -1000 };
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let nodes = [];
  let animationFrame = 0;
  let lastFrame = 0;

  const createNodes = () => {
    const count = Math.min(72, Math.max(28, Math.floor((width * height) / 25000)));
    nodes = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      radius: index % 9 === 0 ? 1.7 : 0.9,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = document.documentElement.scrollHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createNodes();
  };

  const drawDataRain = (time) => {
    context.font = "8px Courier New";
    context.textAlign = "center";
    for (let column = 0; column < width; column += 76) {
      const offset = ((time * 0.018 + column * 3.7) % (height + 220)) - 220;
      for (let row = 0; row < 5; row += 1) {
        const y = offset + row * 18;
        const digit = (column / 76 + row) % 3 === 0 ? "1" : "0";
        context.fillStyle = `rgba(72, 186, 255, ${0.035 + row * 0.008})`;
        context.fillText(digit, column + 22, y);
      }
    }
  };

  const drawNetwork = (time, move = true) => {
    context.clearRect(0, 0, width, height);
    drawDataRain(time);

    nodes.forEach((node, index) => {
      if (move) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -10 || node.x > width + 10) node.vx *= -1;
        if (node.y < -10 || node.y > height + 10) node.vy *= -1;
      }

      for (let nextIndex = index + 1; nextIndex < nodes.length; nextIndex += 1) {
        const next = nodes[nextIndex];
        const dx = node.x - next.x;
        const dy = node.y - next.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 145) {
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(next.x, next.y);
          context.strokeStyle = `rgba(57, 177, 255, ${(1 - distance / 145) * 0.14})`;
          context.lineWidth = 0.7;
          context.stroke();
        }
      }

      const pointerDistance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
      if (pointerDistance < 190) {
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(pointer.x, pointer.y);
        context.strokeStyle = `rgba(101, 220, 255, ${(1 - pointerDistance / 190) * 0.4})`;
        context.lineWidth = 0.8;
        context.stroke();
      }

      const shimmer = 0.55 + Math.sin(time * 0.0018 + node.phase) * 0.25;
      context.beginPath();
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(157, 228, 255, ${shimmer})`;
      context.shadowColor = "rgba(53, 169, 255, 0.75)";
      context.shadowBlur = node.radius * 6;
      context.fill();
      context.shadowBlur = 0;
    });
  };

  const animate = (time) => {
    if (time - lastFrame > 30) {
      drawNetwork(time);
      lastFrame = time;
    }
    animationFrame = window.requestAnimationFrame(animate);
  };

  const updateMotion = () => {
    window.cancelAnimationFrame(animationFrame);
    if (reducedMotion.matches) drawNetwork(0, false);
    else animationFrame = window.requestAnimationFrame(animate);
  };

  resizeCanvas();
  updateMotion();

  window.addEventListener("resize", () => {
    resizeCanvas();
    if (reducedMotion.matches) drawNetwork(0, false);
  });

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY + window.scrollY;

    if (cardWrap && !reducedMotion.matches) {
      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      cardWrap.style.setProperty("--card-x", `${x}px`);
      cardWrap.style.setProperty("--card-y", `${y}px`);
    }
  });

  window.addEventListener("pointerleave", () => {
    pointer.x = -1000;
    pointer.y = -1000;
  });

  reducedMotion.addEventListener("change", updateMotion);
}
