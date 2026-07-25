const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const menuScrim = document.querySelector(".menu-scrim");
const siteMenu = document.querySelector("#site-menu");
const menuLinks = document.querySelectorAll(".primary-nav a");

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
