const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const menuScrim = document.querySelector(".menu-scrim");
const siteMenu = document.querySelector("#site-menu");
const menuLinks = document.querySelectorAll(".primary-nav a");

const projectMeta = document.querySelector(".project-title > p");
if (projectMeta && !document.querySelector(".project-information")) {
  const rawLines = projectMeta.innerHTML
    .split(/<br\s*\/?>/i)
    .map((line) => line.replace(/<[^>]*>/g, "").trim())
    .filter(Boolean);

  const information = document.createElement("section");
  information.className = "project-information";
  information.setAttribute("aria-label", "Project information");

  const heading = document.createElement("h2");
  heading.textContent = "Project Information";
  information.appendChild(heading);

  const list = document.createElement("dl");
  rawLines.forEach((line) => {
    const divider = line.indexOf(":");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");

    if (divider > -1) {
      term.textContent = line.slice(0, divider).trim();
      detail.textContent = line.slice(divider + 1).trim();
    } else {
      term.textContent = "Project";
      detail.textContent = line;
    }

    list.append(term, detail);
  });

  if (!rawLines.some((line) => /^collaborators?\s*:/i.test(line))) {
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = "Collaborators";
    detail.textContent = "—";
    list.append(term, detail);
  }

  information.appendChild(list);
  projectMeta.replaceWith(information);
}

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
menuLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

let previousScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const scrollingDown = currentScrollY > previousScrollY && currentScrollY > 32;
  document.body.classList.toggle("header-hidden", scrollingDown);
  previousScrollY = currentScrollY;
}, { passive: true });
const siteWordmarkMarkup = `
  <span class="site-wordmark" aria-label="Co squared, compound collaborative">
    <span class="site-wordmark-mark">Co<sup>2</sup></span>
    <span class="site-wordmark-name">compound collaborative</span>
  </span>
`;

document.querySelectorAll(".header-home-link, .brand").forEach((element) => {
  element.innerHTML = siteWordmarkMarkup;
});
