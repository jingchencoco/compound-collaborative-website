const preview = document.querySelector(".preview");
const previewCaption = document.querySelector(".preview-caption");
const previewTargets = document.querySelectorAll("[data-preview]");
const homeGallery = document.querySelector(".home-gallery");
const gallerySlides = document.querySelectorAll(".gallery-slide");
const galleryPrev = document.querySelector(".gallery-prev");
const galleryNext = document.querySelector(".gallery-next");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const menuScrim = document.querySelector(".menu-scrim");
const siteMenu = document.querySelector("#site-menu");
const menuLinks = document.querySelectorAll(".primary-nav a");
const projectFilterButtons = document.querySelectorAll(".project-filter button");
const projectCardGrid = document.querySelector(".project-card-grid");
const projectCards = [...document.querySelectorAll(".project-card")].sort((a, b) => {
  return Number(!a.querySelector("img")) - Number(!b.querySelector("img"));
});
const revealItems = document.querySelectorAll(".project-filter, .project-card");
const projectPageNav = document.querySelector(".works-page-nav");
const projectPagePrevious = document.querySelector(".works-page-prev");
const projectPageNext = document.querySelector(".works-page-next");
const projectPageStatus = document.querySelector(".project-page-status");
const aboutSection = document.querySelector("#about");
const contactSection = document.querySelector("#contact");

const captions = {
  objects: "Objects / furniture, vessels, fragments, tools",
  "non-human": "Designing for non human / plants, animals, soils, water",
  recording: "Recording the current / mapping, field notes, archive",
  human: "TMW Maxwell Showroom / Designing for human / 2023",
};

let galleryIndex = 0;
let galleryTimer = null;
let projectPage = 0;

projectCards.forEach((card) => projectCardGrid?.append(card));

function projectItemsPerPage() {
  if (window.matchMedia("(max-width: 700px)").matches) return 6;
  if (window.matchMedia("(max-width: 1280px)").matches) return 8;
  return 12;
}

function updateProjectPages(reset = false) {
  if (!projectPageNav || !projectPageStatus) return;
  const visibleCards = [...projectCards].filter((card) => !card.hidden);
  const pageCount = Math.max(1, Math.ceil(visibleCards.length / projectItemsPerPage()));
  if (reset) projectPage = 0;
  projectPage = Math.min(projectPage, pageCount - 1);
  const start = projectPage * projectItemsPerPage();
  projectCards.forEach((card) => {
    const position = visibleCards.indexOf(card);
    card.classList.toggle("is-page-hidden", position < start || position >= start + projectItemsPerPage());
  });
  projectPageStatus.textContent = `${String(projectPage + 1).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`;
  projectPagePrevious.disabled = projectPage === 0;
  projectPageNext.disabled = projectPage === pageCount - 1;
  projectPageNav.hidden = pageCount <= 1;
}

function showGallerySlide(nextIndex) {
  if (gallerySlides.length === 0) return;
  const normalizedIndex = (nextIndex + gallerySlides.length) % gallerySlides.length;
  gallerySlides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === normalizedIndex);
  });
  galleryIndex = normalizedIndex;
}

function startGalleryTimer() {
  window.clearInterval(galleryTimer);
  galleryTimer = window.setInterval(() => {
    showGallerySlide(galleryIndex + 1);
  }, 8000);
}

if (gallerySlides.length > 0) {
  gallerySlides[0].classList.add("is-active");
  startGalleryTimer();
}

galleryPrev?.addEventListener("click", () => {
  showGallerySlide(galleryIndex - 1);
  startGalleryTimer();
});

galleryNext?.addEventListener("click", () => {
  showGallerySlide(galleryIndex + 1);
  startGalleryTimer();
});

homeGallery?.addEventListener("click", (event) => {
  if (event.target.closest(".gallery-control")) return;

  const activeSlide = gallerySlides[galleryIndex];
  const detailTarget = activeSlide?.dataset.detail;
  if (detailTarget) {
    sessionStorage.removeItem("coco-return-card");
    sessionStorage.removeItem("coco-return-filter");
    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = detailTarget;
    }, 720);
  }
});

previewTargets.forEach((target) => {
  target.addEventListener("pointerenter", () => {
    const kind = target.dataset.preview;
    preview.dataset.kind = kind;
    previewCaption.textContent = captions[kind];
    preview.classList.add("is-visible");
  });

  target.addEventListener("pointerleave", () => {
    preview.classList.remove("is-visible");
  });
});

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  siteMenu.setAttribute("aria-hidden", String(!open));
  menuScrim.hidden = !open;
}

menuToggle.addEventListener("click", () => {
  setMenu(!document.body.classList.contains("menu-open"));
});
menuClose.addEventListener("click", () => setMenu(false));
menuScrim.addEventListener("click", () => setMenu(false));
function revealSecondarySection(target) {
  aboutSection?.removeAttribute("hidden");
  contactSection?.removeAttribute("hidden");
  window.requestAnimationFrame(() => {
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

menuLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (targetId === "#about" || targetId === "#contact") {
      event.preventDefault();
      revealSecondarySection(targetId === "#about" ? aboutSection : contactSection);
    }
    setMenu(false);
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
  }
});

function applyProjectFilter(filter) {
  const validFilter = [...projectFilterButtons].some((button) => button.dataset.filter === filter)
    ? filter
    : "all";
  projectFilterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === validFilter);
  });
  projectCards.forEach((card) => {
    card.hidden = validFilter !== "all" && card.dataset.category !== validFilter;
  });
  updateProjectPages(true);
}

projectFilterButtons.forEach((button) => {
  button.addEventListener("click", () => applyProjectFilter(button.dataset.filter));
});

projectPagePrevious?.addEventListener("click", () => {
  projectPage = Math.max(0, projectPage - 1);
  updateProjectPages();
});

projectPageNext?.addEventListener("click", () => {
  projectPage += 1;
  updateProjectPages();
});

window.addEventListener("resize", () => updateProjectPages());

projectCards.forEach((card) => {
  if (card.getAttribute("href") === "#") {
    card.addEventListener("click", (event) => event.preventDefault());
    return;
  }

  card.addEventListener("click", (event) => {
    event.preventDefault();
    const cardIndex = Array.from(projectCards).indexOf(card);
    const cardFilter = card.dataset.category;
    const filterExists = [...projectFilterButtons].some((button) => button.dataset.filter === cardFilter);
    const filter = filterExists ? cardFilter : "all";
    sessionStorage.setItem("coco-return-card", String(cardIndex));
    sessionStorage.setItem("coco-return-filter", filter);
    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = card.href;
    }, 620);
  });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 120}ms`);
    revealObserver.observe(item);
  });
}

updateProjectPages(true);

if (window.location.hash === "#about" || window.location.hash === "#contact") {
  revealSecondarySection(window.location.hash === "#about" ? aboutSection : contactSection);
}

const returnCardIndex = sessionStorage.getItem("coco-return-card");
const returnFilter = sessionStorage.getItem("coco-return-filter");

if (window.location.hash === "#projects" && returnCardIndex !== null) {
  const returnCard = projectCards[Number(returnCardIndex)];
  if (returnCard) {
    applyProjectFilter(returnFilter || "all");
    window.requestAnimationFrame(() => {
      returnCard.scrollIntoView({ block: "center" });
      sessionStorage.removeItem("coco-return-card");
      sessionStorage.removeItem("coco-return-filter");
    });
  }
}

function updateHeaderContrast() {
  if (!homeGallery || !menuToggle) return;
  const heroRect = homeGallery.getBoundingClientRect();
  const toggleRect = menuToggle.getBoundingClientRect();
  const sampleY = toggleRect.top + toggleRect.height / 2;
  const sampleX = toggleRect.left + Math.min(toggleRect.width * 0.55, 280);
  const overHero =
    sampleY >= heroRect.top &&
    sampleY <= heroRect.bottom &&
    sampleX >= heroRect.left &&
    sampleX <= heroRect.right;

  document.body.classList.toggle("header-on-image", overHero);
}

window.addEventListener("scroll", updateHeaderContrast, { passive: true });
window.addEventListener("resize", updateHeaderContrast);
updateHeaderContrast();

function updateMobileHeroCaption() {
  if (!homeGallery) return;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  const heroBottom = homeGallery.offsetHeight;
  const revealCaption = isMobile && window.scrollY > 18 && window.scrollY < heroBottom * 0.82;
  document.body.classList.toggle("mobile-hero-caption-visible", revealCaption);
}

window.addEventListener("scroll", updateMobileHeroCaption, { passive: true });
window.addEventListener("resize", updateMobileHeroCaption);
updateMobileHeroCaption();

let previousScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const scrollingDown = currentScrollY > previousScrollY && currentScrollY > 32;
  document.body.classList.toggle("header-hidden", scrollingDown);
  previousScrollY = currentScrollY;
}, { passive: true });
