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
    a: [189, 110, 208],
    b: [36, 121, 134],
    c: [43, 168, 196],
    d: [255, 155, 111],
    e: [255, 79, 50],
    f: [255, 45, 22],
    heading: [32, 48, 51],
  },
  {
    p: 0.34,
    a: [116, 141, 232],
    b: [22, 155, 170],
    c: [228, 163, 100],
    d: [255, 100, 116],
    e: [255, 103, 41],
    f: [255, 63, 118],
    heading: [34, 53, 58],
  },
  {
    p: 0.68,
    a: [43, 168, 196],
    b: [29, 154, 164],
    c: [255, 100, 116],
    d: [255, 79, 50],
    e: [255, 173, 22],
    f: [255, 45, 22],
    heading: [55, 38, 37],
  },
  {
    p: 1,
    a: [189, 110, 208],
    b: [36, 121, 134],
    c: [255, 160, 181],
    d: [255, 63, 118],
    e: [255, 173, 22],
    f: [255, 45, 22],
    heading: [61, 39, 39],
  },
];

const blobMotion = {
  mauve: [
    { p: 0, x: 0, y: 0, scale: 1.04, opacity: 0.76 },
    { p: 0.5, x: -9, y: 16, scale: 1.28, opacity: 0.58 },
    { p: 1, x: -20, y: 28, scale: 1.48, opacity: 0.42 },
  ],
  slate: [
    { p: 0, x: 0, y: 0, scale: 1.08, opacity: 0.88 },
    { p: 0.42, x: 14, y: -18, scale: 1.24, opacity: 0.92 },
    { p: 1, x: 24, y: -32, scale: 1.02, opacity: 0.58 },
  ],
  blue: [
    { p: 0, x: 0, y: 0, scale: 1.08, opacity: 0.78 },
    { p: 0.46, x: 16, y: 17, scale: 1.34, opacity: 0.9 },
    { p: 1, x: -12, y: -18, scale: 1.08, opacity: 0.5 },
  ],
  salmon: [
    { p: 0, x: -12, y: 18, scale: 0.88, opacity: 0.3 },
    { p: 0.48, x: 17, y: -12, scale: 1.36, opacity: 0.86 },
    { p: 1, x: 20, y: -28, scale: 1.56, opacity: 0.72 },
  ],
  coral: [
    { p: 0, x: -16, y: 28, scale: 0.9, opacity: 0.5 },
    { p: 0.65, x: 10, y: -22, scale: 1.42, opacity: 0.94 },
    { p: 1, x: 22, y: -40, scale: 1.62, opacity: 0.86 },
  ],
  orange: [
    { p: 0, x: 16, y: 28, scale: 0.86, opacity: 0.42 },
    { p: 0.62, x: -14, y: -18, scale: 1.28, opacity: 0.88 },
    { p: 1, x: -32, y: -44, scale: 1.58, opacity: 0.96 },
  ],
  pink: [
    { p: 0, x: 0, y: 24, scale: 0.9, opacity: 0.28 },
    { p: 0.5, x: -10, y: -9, scale: 1.18, opacity: 0.7 },
    { p: 1, x: -22, y: -34, scale: 1.42, opacity: 0.88 },
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
  root.style.setProperty("--scroll", progress.toFixed(4));
  root.style.setProperty("--flow", progress.toFixed(4));
  root.style.setProperty("--warmth", Math.min(progress * 1.24, 1).toFixed(4));
  setPalette(progress);
  setBlobState(prefersReducedMotion ? 0 : progress);
};

const animateAtmosphere = () => {
  if (prefersReducedMotion) {
    fluidProgress = targetProgress;
  } else {
    fluidProgress += (targetProgress - fluidProgress) * 0.12;

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
