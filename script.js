const root = document.documentElement;
const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

const palettes = [
  {
    a: [162, 143, 172],
    b: [85, 126, 122],
    c: [180, 153, 166],
    d: [255, 143, 91],
  },
  {
    a: [96, 144, 144],
    b: [255, 120, 96],
    c: [254, 160, 64],
    d: [254, 102, 119],
  },
  {
    a: [72, 120, 120],
    b: [144, 144, 168],
    c: [255, 168, 144],
    d: [255, 144, 120],
  },
  {
    a: [162, 143, 172],
    b: [96, 120, 120],
    c: [255, 143, 91],
    d: [254, 160, 64],
  },
];

const lerp = (start, end, amount) => start + (end - start) * amount;

const mixColor = (from, to, amount) =>
  from.map((value, index) => Math.round(lerp(value, to[index], amount)));

const rgb = (parts) => `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;

const setPalette = (progress) => {
  const maxIndex = palettes.length - 1;
  const scaled = Math.min(progress * maxIndex, maxIndex);
  const index = Math.floor(scaled);
  const nextIndex = Math.min(index + 1, maxIndex);
  const amount = scaled - index;
  const current = palettes[index];
  const next = palettes[nextIndex];

  ["a", "b", "c", "d"].forEach((key) => {
    root.style.setProperty(
      `--tone-${key}`,
      rgb(mixColor(current[key], next[key], amount)),
    );
  });
};

const sections = navLinks
  .map((link) => {
    const id = link.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    return section ? { id, link, section } : null;
  })
  .filter(Boolean);

let frame = 0;

const syncPage = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1,
  );
  const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

  root.style.setProperty("--scroll", progress.toFixed(4));
  setPalette(progress);

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

const scheduleSync = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(syncPage);
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

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  revealItems.forEach((item) => observer.observe(item));
}

window.addEventListener("scroll", scheduleSync, { passive: true });
window.addEventListener("resize", scheduleSync, { passive: true });
syncPage();
