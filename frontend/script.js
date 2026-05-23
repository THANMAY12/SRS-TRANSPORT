/* PAGE LOADER */
window.addEventListener("load", function () {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 400);
  }
});

/* MOBILE MENU */
function toggleMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("overlay");

  if (hamburger && mobileMenu && overlay) {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    overlay.classList.toggle("active");
  }
}

function closeMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("overlay");

  if (hamburger && mobileMenu && overlay) {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
  }
}

document.addEventListener("DOMContentLoaded", function () {

  /* Modal functions */
  window.openQuote = function () {
    const modal = document.getElementById("quoteModal");
    const overlay = document.getElementById("quoteOverlay");
    if (modal && overlay) {
      modal.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeQuote = function () {
    const modal = document.getElementById("quoteModal");
    const overlay = document.getElementById("quoteOverlay");
    if (modal && overlay) {
      modal.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  };

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

      const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://srs-transport.onrender.com";

      try {
        const response = await fetch(`${API_URL}/send-quote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, service, pickup, drop }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to submit quote request.");
        }

        alert("Quote Request Sent Successfully!");
        form.reset();
        closeQuote();

      } catch (error) {
        console.error("Submission Error:", error);
        alert(error.message || "Error sending request. Please try again later.");
      }
    });
  }

  const sections = document.querySelectorAll("section");
  
  if ("IntersectionObserver" in window) {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target); 
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  } else {
    sections.forEach(section => {
      section.classList.add("show");
    });
  }

});