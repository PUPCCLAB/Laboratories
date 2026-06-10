/**
 * PUP Cabiao Campus Laboratories
 * Website Core Interactivity Script
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     Theme Toggling (Light / Dark Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  // Retrieve theme preference from LocalStorage or default to Light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Accessibility announcement for screen readers
    const srMsg = `Theme changed to ${newTheme} mode`;
    announceToScreenReader(srMsg);
  });


  /* ==========================================================================
     Sticky Header & Active Link Tracking
     ========================================================================== */
  const header = document.getElementById('main-header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // Scroll state for header backdrop blur/shadow
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll active tracking for navigation items
    let currentActiveId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120; // offset for sticky nav
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentActiveId = section.getAttribute('id');
      }
    });

    if (currentActiveId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentActiveId}`) {
          link.classList.add('active');
        }
      });
    }
  });


  /* ==========================================================================
     Mobile Navigation Toggle
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  mobileToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    mobileToggle.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile navigation when a menu link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      mobileToggle.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });


  /* ==========================================================================
     Hero Image Carousel
     ========================================================================== */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  let currentSlideIndex = 0;
  let carouselIntervalId = null;
  const AUTOPLAY_INTERVAL = 6000; // 6 seconds

  function showSlide(index) {
    // Wrap index around if out of range
    if (index >= slides.length) currentSlideIndex = 0;
    else if (index < 0) currentSlideIndex = slides.length - 1;
    else currentSlideIndex = index;

    // Remove active classes
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Apply active classes to target elements
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
  }

  function startAutoplay() {
    stopAutoplay(); // clear existing if any
    carouselIntervalId = setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (carouselIntervalId) {
      clearInterval(carouselIntervalId);
      carouselIntervalId = null;
    }
  }

  // Next / Previous Click Listeners
  nextBtn.addEventListener('click', () => {
    showSlide(currentSlideIndex + 1);
    startAutoplay(); // reset autoplay timer on click
  });

  prevBtn.addEventListener('click', () => {
    showSlide(currentSlideIndex - 1);
    startAutoplay(); // reset autoplay timer on click
  });

  // Indicator Dots Click Listeners
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      showSlide(idx);
      startAutoplay(); // reset autoplay timer
    });
  });

  // Start initial autoplay sequence
  startAutoplay();


  /* ==========================================================================
     About Us Section Tab Panel
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.about-tab-btn');
  const tabContents = document.querySelectorAll('.about-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update button classes
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update content panels
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.getAttribute('id') === `content-${targetTab}`) {
          content.classList.add('active');
        }
      });
    });
  });


  /* ==========================================================================
     Interactive Equipment Inventory (Filter & Search)
     ========================================================================== */
  const searchInput = document.getElementById('inventory-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const invCards = document.querySelectorAll('.inventory-card');
  const noResultsMsg = document.getElementById('no-results-message');

  let activeCategory = 'all';
  let activeSearchTerm = '';

  function applyInventoryFilters() {
    let visibleCount = 0;

    invCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const keywords = card.getAttribute('data-keywords').toLowerCase();
      const title = card.querySelector('.inv-title').textContent.toLowerCase();
      const desc = card.querySelector('.inv-desc').textContent.toLowerCase();

      // Check category match
      const isCategoryMatch = (activeCategory === 'all' || cardCategory === activeCategory);

      // Check search match
      const isSearchMatch = (!activeSearchTerm || 
        title.includes(activeSearchTerm) || 
        desc.includes(activeSearchTerm) || 
        keywords.includes(activeSearchTerm)
      );

      if (isCategoryMatch && isSearchMatch) {
        card.style.display = 'flex';
        // Add a micro-fade-in animation for visual consistency when filters change
        card.style.opacity = '1';
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });

    // Toggle No Results card
    if (visibleCount === 0) {
      noResultsMsg.style.display = 'block';
    } else {
      noResultsMsg.style.display = 'none';
    }
  }

  // Handle Search Input (debounce / keyup)
  searchInput.addEventListener('input', (e) => {
    activeSearchTerm = e.target.value.toLowerCase().trim();
    applyInventoryFilters();
  });

  // Handle Category Filter Buttons Click
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Toggle button active visual states
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeCategory = btn.getAttribute('data-category');
      applyInventoryFilters();
    });
  });


  /* ==========================================================================
     Contact Form Validation & Simulated Delivery
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const toast = document.getElementById('submit-toast');

  // Regex utility for email structure check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real-time error cleanup on keystroke/focus out
  const formInputs = contactForm.querySelectorAll('.form-control');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      const errorMsg = document.getElementById(`${input.id.replace('contact-', '')}-error`);
      if (errorMsg) errorMsg.style.display = 'none';
    });
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal = document.getElementById('contact-name').value.trim();
    const emailVal = document.getElementById('contact-email').value.trim();
    const subjectVal = document.getElementById('contact-subject').value.trim();
    const messageVal = document.getElementById('contact-message').value.trim();

    let isFormValid = true;

    // Validate Name
    if (nameVal.length < 3) {
      document.getElementById('name-error').style.display = 'block';
      isFormValid = false;
    }

    // Validate Email
    if (!emailRegex.test(emailVal)) {
      document.getElementById('email-error').style.display = 'block';
      isFormValid = false;
    }

    // Validate Subject
    if (subjectVal.length < 4) {
      document.getElementById('subject-error').style.display = 'block';
      isFormValid = false;
    }

    // Validate Message
    if (messageVal.length < 10) {
      document.getElementById('message-error').style.display = 'block';
      isFormValid = false;
    }

    if (isFormValid) {
      triggerSimulatedSubmit();
    }
  });

  function triggerSimulatedSubmit() {
    // Disable submit to prevent double entry and display processing state
    submitBtn.disabled = true;
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Processing Message...</span><div class="status-dot" style="margin-left: 10px; background-color: #fff;"></div>`;

    setTimeout(() => {
      // Re-enable and reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;

      // Show Custom Success Toast Notification
      showToastNotification();

      // Reset form controls
      contactForm.reset();
    }, 1500); // 1.5 seconds simulated server delay
  }

  function showToastNotification() {
    toast.classList.add('show');

    // Automatically remove toast after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }


  /* ==========================================================================
     Scroll Reveal & Back to Top Controllers
     ========================================================================== */
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Intersection Observer for Reveal-on-Scroll animations
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once triggered to allow simple layout persistence
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15 // trigger when 15% of target is visible
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });


  /* ==========================================================================
     Helper Utilities
     ========================================================================== */
  // Accessibility function for dynamically reading statuses
  function announceToScreenReader(message) {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.classList.add('sr-only');
    announcer.style.position = 'absolute';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.padding = '0';
    announcer.style.margin = '-1px';
    announcer.style.overflow = 'hidden';
    announcer.style.clip = 'rect(0, 0, 0, 0)';
    announcer.style.whiteSpace = 'nowrap';
    announcer.style.border = '0';
    
    document.body.appendChild(announcer);
    
    // Trigger update
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);

    // Clean up from DOM
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }
});
