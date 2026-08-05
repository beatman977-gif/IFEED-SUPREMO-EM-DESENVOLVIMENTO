const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-nav");

function closeMenu() {
  if (!menuButton || !mobileMenu) return;
  mobileMenu.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
}

menuButton?.addEventListener("click", () => {
  const open = !mobileMenu.classList.contains("open");
  mobileMenu.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
document.addEventListener("pointerdown", event => {
  if (mobileMenu?.classList.contains("open") && header && !header.contains(event.target)) closeMenu();
});

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealItems = document.querySelectorAll(".media-placeholder, .journey-detail, .identity-block");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach(item => observer.observe(item));
}
