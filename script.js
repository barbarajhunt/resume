const root = document.documentElement;
const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const blobElements = new Map(
  [...document.querySelectorAll("[data-blob]")].map((element) => [
    element.dataset.blob,
    element,
  ]),
);
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const colorStops = [
  {
    p: 0,
    a: [201, 87, 224],
    b: [19, 142, 153],
    c: [54, 190, 216],
    d: [254, 113, 88],
    e: [255, 119, 78],
    f: [255, 157, 54],
    heading: [32, 48, 51],
  },
  {
    p: 0.28,
    a: [110, 132, 244],
    b: [20, 168, 180],
    c: [255, 142, 104],
    d: [254, 113, 88],
    e: [255, 119, 78],
    f: [255, 157, 54],
    heading: [34, 53, 58],
  },
  {
    p: 0.55,
    a: [254, 113, 88],
    b: [32, 151, 162],
    c: [255, 119, 78],
    d: [255, 91, 48],
    e: [255, 157, 54],
    f: [255, 55, 34],
    heading: [55, 38, 37],
  },
  {
    p: 0.78,
    a: [255, 119, 78],
    b: [28, 136, 150],
    c: [255, 157, 54],
    d: [254, 113, 88],
    e: [255, 119, 78],
    f: [255, 55, 34],
    heading: [58, 40, 36],
  },
  {
    p: 1,
    a: [206, 88, 220],
    b: [22, 132, 146],
    c: [255, 160, 148],
    d: [254, 113, 88],
    e: [255, 157, 54],
    f: [255, 63, 44],
    heading: [61, 39, 39],
  },
];

const blobMotion = {
  mauve: [
    { p: 0, x: 0, y: 0, scale: 1.1, opacity: 0.72 },
    { p: 0.5, x: -16, y: 22, scale: 1.44, opacity: 0.54 },
    { p: 1, x: -30, y: 42, scale: 1.62, opacity: 0.34 },
  ],
  slate: [
    { p: 0, x: 0, y: 0, scale: 1.12, opacity: 0.9 },
    { p: 0.42, x: 24, y: -26, scale: 1.36, opacity: 0.96 },
    { p: 1, x: 38, y: -48, scale: 1.08, opacity: 0.56 },
  ],
  blue: [
    { p: 0, x: 0, y: 0, scale: 1.12, opacity: 0.82 },
    { p: 0.46, x: 26, y: 24, scale: 1.52, opacity: 0.94 },
    { p: 1, x: -22, y: -28, scale: 1.14, opacity: 0.48 },
  ],
  salmon: [
    { p: 0, x: -20, y: 24, scale: 1, opacity: 0.52 },
    { p: 0.48, x: 24, y: -20, scale: 1.6, opacity: 0.96 },
    { p: 1, x: 34, y: -48, scale: 1.8, opacity: 0.82 },
  ],
  coral: [
    { p: 0, x: -22, y: 30, scale: 1.1, opacity: 0.78 },
    { p: 0.65, x: 18, y: -34, scale: 1.78, opacity: 1 },
    { p: 1, x: 38, y: -58, scale: 1.95, opacity: 0.96 },
  ],
  orange: [
    { p: 0, x: 22, y: 32, scale: 1, opacity: 0.62 },
    { p: 0.62, x: -24, y: -28, scale: 1.62, opacity: 0.98 },
    { p: 1, x: -46, y: -62, scale: 1.9, opacity: 1 },
  ],
  pink: [
    { p: 0, x: 0, y: 28, scale: 0.96, opacity: 0.36 },
    { p: 0.5, x: -18, y: -14, scale: 1.32, opacity: 0.78 },
    { p: 1, x: -34, y: -48, scale: 1.58, opacity: 0.9 },
  ],
};

const lerp = (start, end, amount) => start + (end - start) * amount;

const betweenStops = (stops, progress) => {
  const first = stops[0];
  const last = stops[stops.length - 1];

  if (progress <= first.p) {
    return first;
  }

  if (progress >= last.p) {
    return last;
  }

  const nextIndex = stops.findIndex((stop) => stop.p >= progress);
  const from = stops[nextIndex - 1];
  const to = stops[nextIndex];
  const amount = (progress - from.p) / (to.p - from.p);

  return { from, to, amount };
};

const mixArray = (from, to, amount) =>
  from.map((value, index) => Math.round(lerp(value, to[index], amount)));

const mixNumber = (from, to, amount) => lerp(from, to, amount);

const rgb = (parts) => `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

const setPalette = (progress) => {
  const stop = betweenStops(colorStops, progress);
  const keys = ["a", "b", "c", "d", "e", "f", "heading"];

  if (!("from" in stop)) {
    keys.forEach((key) => {
      const value = rgb(stop[key]);
      root.style.setProperty(
        key === "heading" ? "--heading-tone" : `--tone-${key}`,
        value,
      );
    });
    return;
  }

  keys.forEach((key) => {
    const value = rgb(mixArray(stop.from[key], stop.to[key], stop.amount));
    root.style.setProperty(
      key === "heading" ? "--heading-tone" : `--tone-${key}`,
      value,
    );
  });
};

const setBlobState = (progress) => {
  Object.entries(blobMotion).forEach(([name, stops]) => {
    const element = blobElements.get(name);

    if (!element) {
      return;
    }

    const stop = betweenStops(stops, progress);
    const state =
      "from" in stop
        ? {
            x: mixNumber(stop.from.x, stop.to.x, stop.amount),
            y: mixNumber(stop.from.y, stop.to.y, stop.amount),
            scale: mixNumber(stop.from.scale, stop.to.scale, stop.amount),
            opacity: mixNumber(stop.from.opacity, stop.to.opacity, stop.amount),
          }
        : stop;

    element.style.opacity = state.opacity.toFixed(3);
    element.style.transform = `translate3d(${state.x.toFixed(2)}vw, ${state.y.toFixed(2)}vh, 0) scale(${state.scale.toFixed(3)})`;
  });
};

const sections = navLinks
  .map((link) => {
    const id = link.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    return section ? { id, link, section } : null;
  })
  .filter(Boolean);

let targetProgress = 0;
let fluidProgress = 0;
let frame = 0;
let isAnimating = false;

const updateTargetProgress = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1,
  );

  targetProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

  if (header) {
    header.classList.toggle("is-scrolled", scrollTop > 12);
  }

  const activationLine = scrollTop + window.innerHeight * 0.36;
  let activeId = "";

  sections.forEach(({ id, section }) => {
    if (activationLine >= section.offsetTop) {
      activeId = id;
    }
  });

  sections.forEach(({ id, link }) => {
    const isActive = id === activeId;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const applyAtmosphere = (progress) => {
  const warmth = clamp01(0.22 + progress * 1.18);
  const motionProgress = prefersReducedMotion ? 0 : progress;

  root.style.setProperty("--scroll", progress.toFixed(4));
  root.style.setProperty("--flow", progress.toFixed(4));
  root.style.setProperty("--warmth", warmth.toFixed(4));
  root.style.setProperty(
    "--warm-glow-opacity",
    (0.34 + warmth * 0.34).toFixed(3),
  );
  root.style.setProperty("--veil-opacity", (0.42 - warmth * 0.16).toFixed(3));
  root.style.setProperty(
    "--base-x",
    `${lerp(-2, 7, motionProgress).toFixed(2)}vw`,
  );
  root.style.setProperty(
    "--base-y",
    `${lerp(0, -10, motionProgress).toFixed(2)}vh`,
  );
  root.style.setProperty(
    "--base-scale",
    lerp(1.14, 1.31, warmth).toFixed(3),
  );
  root.style.setProperty(
    "--base-rotate",
    `${lerp(-1.5, 2.5, motionProgress).toFixed(2)}deg`,
  );
  root.style.setProperty(
    "--current-x",
    `${lerp(-5, 7, motionProgress).toFixed(2)}vw`,
  );
  root.style.setProperty(
    "--current-y",
    `${lerp(3, -8, motionProgress).toFixed(2)}vh`,
  );
  root.style.setProperty(
    "--current-scale",
    lerp(1.04, 1.22, warmth).toFixed(3),
  );
  setPalette(progress);
  setBlobState(prefersReducedMotion ? 0 : progress);
};

const animateAtmosphere = () => {
  if (prefersReducedMotion) {
    fluidProgress = targetProgress;
  } else {
    fluidProgress += (targetProgress - fluidProgress) * 0.18;

    if (Math.abs(targetProgress - fluidProgress) < 0.0004) {
      fluidProgress = targetProgress;
      isAnimating = false;
    }
  }

  applyAtmosphere(fluidProgress);

  if (isAnimating) {
    frame = requestAnimationFrame(animateAtmosphere);
  }
};

const scheduleSync = () => {
  updateTargetProgress();

  if (prefersReducedMotion) {
    applyAtmosphere(targetProgress);
    return;
  }

  if (!isAnimating) {
    isAnimating = true;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(animateAtmosphere);
  }
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -48px 0px",
  },
);

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  revealItems.forEach((item) => observer.observe(item));
}

window.addEventListener("scroll", scheduleSync, { passive: true });
window.addEventListener("resize", scheduleSync, { passive: true });
scheduleSync();
