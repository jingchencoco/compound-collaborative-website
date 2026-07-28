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
const objectsGrid = document.querySelector(".objects-grid");
const objectCards = [...document.querySelectorAll('.project-card[data-category="objects"]')];
const projectCards = [...document.querySelectorAll('.project-card:not([data-category="objects"])')].sort((a, b) => {
  return Number(!a.querySelector("img")) - Number(!b.querySelector("img"));
});
const revealItems = document.querySelectorAll(".project-filter, .project-card");
const projectPageNav = document.querySelector(".works-page-nav");
const projectPagePrevious = document.querySelector(".works-page-prev");
const projectPageNext = document.querySelector(".works-page-next");
const projectPageStatus = document.querySelector(".project-page-status");
const aboutSection = document.querySelector("#about");
const contactSection = document.querySelector("#contact");

const siteWordmarkMarkup = `
  <span class="site-wordmark" aria-label="Compound Collaborative">
    <img class="site-wordmark-image" src="./assets/compound-collaborative-logo.png" alt="CO² compound collaborative">
  </span>
`;

document
  .querySelectorAll(".menu-toggle > span:not(.menu-symbol):not(.visually-hidden), .brand")
  .forEach((element) => {
    element.innerHTML = siteWordmarkMarkup;
  });

const captions = {
  objects: "Objects / furniture, vessels, fragments, tools",
  "non-human": "Designing for non human / plants, animals, soils, water",
  recording: "Recording the current / mapping, field notes, archive",
  human: "TMW Maxwell Showroom / Retail and hospitality / 2023",
};

let galleryIndex = 0;
let galleryTimer = null;
let projectPage = 0;

projectCards.forEach((card) => projectCardGrid?.append(card));
objectCards.forEach((card) => objectsGrid?.append(card));
objectCards.forEach((card) => {
  if (card.getAttribute("href") === "#") {
    card.addEventListener("click", (event) => event.preventDefault());
  }
});

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

homeGallery?.addEventListener("pointermove", () => {
  homeGallery.classList.add("is-pointer-active");
});

homeGallery?.addEventListener("pointerleave", () => {
  homeGallery.classList.remove("is-pointer-active");
});

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

const questionPath = document.querySelector(".question-path");
if (questionPath) {
  const pathReset = questionPath.querySelector(".question-path-reset");
  const questionStage = questionPath.querySelector(".question-tree-stage");

  const questions = {
    root: {
      depth: 0,
      number: "01",
      text: "What kind of relationship can design make possible?",
      choices: [
        ["A more attentive relationship between people and place", "lived"],
        ["A less dominant relationship between humans and other lives", "nonhuman"],
        ["A changed perception of what we call natural", "object"],
        ["A way of knowing before a finished form exists", "inquiry"],
      ],
    },
    lived: {
      depth: 1,
      number: "02A",
      text: "If human experience remains central, what should landscape change?",
      choices: [
        ["How an individual body crosses, pauses and notices", "domestic"],
        ["How different people encounter and share a place", "collective"],
      ],
    },
    domestic: {
      depth: 2,
      number: "03A",
      text: "What can a garden reveal that architecture alone cannot?",
      choices: [
        ["That stillness can intensify attention", "water"],
        ["That arrival can be a gradual change of pace", "p-khao"],
        ["That a boundary can become an inhabited transition", "p-wyz"],
      ],
    },
    water: {
      depth: 3,
      number: "04A",
      text: "Does attention deepen by reducing the world—or by multiplying it?",
      choices: [
        ["Reduce it to water, stone, reflection and silence", "p-nassim"],
        ["Multiply it through image, reflection and imagined life", "p-sentosa"],
      ],
    },
    collective: {
      depth: 2,
      number: "03B",
      text: "How much should design prescribe the way people are together?",
      choices: [
        ["Leave room for play, wandering and self-directed discovery", "p-suxi"],
        ["Create comfort that quietly supports gathering", "p-tmw"],
        ["Rework the negotiation between private building and public city", "urban"],
      ],
    },
    urban: {
      depth: 3,
      number: "04B",
      text: "What can planting change at the edge of architecture?",
      choices: [
        ["Turn an entrance from a line into an experience of arrival", "p-165"],
        ["Repair continuity between new occupation and an inherited street", "p-cross"],
        ["Make a façade thick enough to become inhabited landscape", "p-varel"],
      ],
    },
    nonhuman: {
      depth: 1,
      number: "02B",
      text: "If humans are no longer the only clients, what must design give up?",
      choices: [
        ["The right to place architecture before the lives already there", "p-trees"],
        ["The assumption that urban territory belongs to one species", "p-animal"],
        ["The claim that human occupation must also possess the ground", "p-onair"],
      ],
    },
    object: {
      depth: 1,
      number: "02C",
      text: "Can an artificial object make the living world less familiar?",
      choices: [
        ["By giving another creature a symbolic role within the garden", "p-tiger"],
        ["By returning an animal gaze to the human city", "p-macaque"],
        ["By making imitation feel more uncanny than representation", "p-ice"],
      ],
    },
    inquiry: {
      depth: 1,
      number: "02D",
      text: "If design is not yet a form, what kind of knowledge can it produce?",
      choices: [
        ["A strategy that makes climate, density and terrain thinkable together", "p-moscow"],
        ["An understanding of the conditions that permit growth", "p-farmbyte"],
        ["Material knowledge discovered through labour and transformation", "p-technosol"],
      ],
    },
  };

  const projects = {
    "p-165": ["165 JLB", "./165-jlb.html", "./assets/165-jlb-01.png", "Planted entrance at 165 JLB"],
    "p-animal": ["Animal Condominium: Living Together", "./animal-condominium.html", "./assets/animal-condominium-03.png", "Animal Condominium planted towers"],
    "p-trees": ["Architecture for Trees", "./architecture-for-trees.html", "./assets/architecture-for-trees-09.jpeg", "Architecture for Trees in an ancient forest"],
    "p-cross": ["Cross Street 18&20", "./cross-street-18-20.html", "./assets/cs18-thumbnail-facade.png", "Green intervention at Cross Street 18 and 20"],
    "p-farmbyte": ["Farmbyte Archisen", "./farmbyte-archisen.html", "./assets/farmbyte-04.png", "Farmbyte Archisen indoor cultivation installation"],
    "p-khao": ["House in Khao Yai", "./house-in-khao-yai.html", "./assets/khao-yai-thumbnail-stream.png", "Shaded planted arrival at House in Khao Yai"],
    "p-nassim": ["House in Nassim", "./house-in-nassim.html", "./assets/nassim-thumbnail.png", "Stone and water garden at House in Nassim"],
    "p-sentosa": ["House in Sentosa", "./house-in-sentosa.html", "./assets/house-in-sentosa-01.jpeg", "Immersive courtyard at House in Sentosa"],
    "p-ice": ["Ice Plant", "./ice-plant.html", "./assets/ice-plant-03.png", "Illuminated translucent Ice Plant object"],
    "p-macaque": ["Macaque", "./macaque.html", "./assets/macaque-01.png", "Macaque figures against the city skyline"],
    "p-moscow": ["Moscow Landscape Brainstorming 01", "./moscow-landscape-brainstorming.html", "./assets/moscow-brainstorming/moscow-cover.png", "Moscow landscape strategy study"],
    "p-onair": ["On Air", "./on-air.html", "./assets/on-air-05.jpeg", "Buildings raised above the forest floor at On Air"],
    "p-technosol": ["Painting Technosol", "./painting-technosol.html", "./assets/painting-technosol-cover.jpeg", "Textured Painting Technosol surface"],
    "p-tiger": ["Stone Tiger", "./stone-tiger.html", "./assets/stone-tiger-01.png", "Stone Tiger guardians within planting"],
    "p-suxi": ["Suxiangang Youth Park", "./suxiangang-youth-park.html", "./assets/suxiangang-youth-02.jpeg", "Paths and planted rooms at Suxiangang Youth Park"],
    "p-tmw": ["TMW Maxwell Showroom", "./tmw-maxwell-showroom.html", "./assets/tmw-built-garden-01.png", "Dense planted gathering space at TMW Maxwell Showroom"],
    "p-varel": ["Varel Selegie", "./varel-selegie.html", "./assets/varel-selegie-02.jpeg", "Planted terraces at Varel Selegie"],
    "p-wyz": ["WYZ House", "./wyz-house.html", "./assets/wyz-house-01.jpeg", "Layered tropical thresholds at WYZ House"],
  };

  const revealItem = (item) => {
    questionStage.appendChild(item);
    questionStage.dataset.steps = String(questionStage.children.length);
    questionStage.classList.toggle(
      "is-complete",
      item.classList.contains("question-project")
    );
    window.requestAnimationFrame(() => {
      item.classList.add("is-visible");
    });
  };

  const renderProject = (projectId) => {
    const project = projects[projectId];
    if (!project) return;
    const link = document.createElement("a");
    link.className = "question-project";
    link.href = project[1];
    link.dataset.project = projectId;

    const image = document.createElement("img");
    image.src = project[2];
    image.alt = project[3];
    const label = document.createElement("span");
    label.textContent = "This path leads to";
    const title = document.createElement("strong");
    title.textContent = project[0];
    const action = document.createElement("span");
    action.textContent = "View project →";
    link.append(image, label, title, action);
    revealItem(link);
  };

  const renderQuestion = (questionId) => {
    const question = questions[questionId];
    if (!question) return;
    const article = document.createElement("article");
    article.className = "question-node";
    article.dataset.depth = question.depth;

    const number = document.createElement("span");
    number.className = "question-number";
    number.textContent = question.number;
    const title = document.createElement("h3");
    title.textContent = question.text;
    const choices = document.createElement("div");
    choices.className = "question-choices";

    question.choices.forEach(([label, target]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.next = target;
      button.textContent = label;
      choices.appendChild(button);
    });

    article.append(number, title, choices);
    revealItem(article);
  };

  questionPath.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-next]");
    if (!choice) return;
    const currentNode = choice.closest(".question-node");
    if (!currentNode) return;

    let nextSibling = currentNode.nextElementSibling;
    while (nextSibling) {
      const itemToRemove = nextSibling;
      nextSibling = nextSibling.nextElementSibling;
      itemToRemove.remove();
    }

    currentNode.querySelectorAll("[data-next]").forEach((button) => {
      button.classList.toggle("is-chosen", button === choice);
      button.classList.toggle("is-muted", button !== choice);
    });

    if (choice.dataset.next.startsWith("p-")) renderProject(choice.dataset.next);
    else renderQuestion(choice.dataset.next);
    pathReset.hidden = false;
  });

  pathReset.addEventListener("click", () => {
    questionStage.replaceChildren();
    questionStage.classList.remove("is-complete");
    renderQuestion("root");
    pathReset.hidden = true;
    questionPath.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderQuestion("root");
}

let previousScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const scrollingDown = currentScrollY > previousScrollY && currentScrollY > 32;
  document.body.classList.toggle("header-hidden", scrollingDown);
  previousScrollY = currentScrollY;
}, { passive: true });
