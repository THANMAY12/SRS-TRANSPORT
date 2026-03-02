/* PAGE LOADER */
window.addEventListener("load", function () {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
});

/* MOBILE MENU */
function toggleMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("overlay");

  hamburger.classList.toggle("active");
  mobileMenu.classList.toggle("active");
  overlay.classList.toggle("active");
}

function closeMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("overlay");

  hamburger.classList.remove("active");
  mobileMenu.classList.remove("active");
  overlay.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", function () {

  /* Modal functions */
  window.openQuote = function () {
    document.getElementById("quoteModal").classList.add("active");
    document.getElementById("quoteOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.closeQuote = function () {
    document.getElementById("quoteModal").classList.remove("active");
    document.getElementById("quoteOverlay").classList.remove("active");
    document.body.style.overflow = "auto";
  };

  /* Form submit */
  const form = document.getElementById("quoteForm");

  if (form) {
    form.addEventListener("submit", async function (e) {

      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const service = document.getElementById("service").value;
      const pickup = document.getElementById("pickup").value.trim();
      const drop = document.getElementById("drop").value.trim();

      if (name.length < 3) {
        alert("Name must be at least 3 characters.");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return;
      }

      try {
        await fetch("http://localhost:5000/send-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, service, pickup, drop }),
        });

        alert("Quote Request Sent Successfully!");
        form.reset();
        closeQuote();

      } catch (error) {
        alert("Error sending request.");
      }

    });
  }

  /* Scroll animation */
  const sections = document.querySelectorAll("section");

  window.addEventListener("scroll", () => {
    sections.forEach(section => {
      if (section.getBoundingClientRect().top < window.innerHeight - 100) {
        section.classList.add("show");
      }
    });
  });

});