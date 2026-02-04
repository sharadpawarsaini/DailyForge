import confetti from "canvas-confetti";

export function fireConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#00ff9d", "#00cc7d"],
  });
  fire(0.2, {
    spread: 60,
    colors: ["#00ff9d", "#00cc7d"],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ["#00ff9d", "#00cc7d", "#ffffff"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ["#00ff9d", "#ffffff"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ["#00ff9d", "#00cc7d"],
  });
}

export function fireSmallCelebration() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors: ["#00ff9d", "#00cc7d"],
    zIndex: 9999,
  });
}
