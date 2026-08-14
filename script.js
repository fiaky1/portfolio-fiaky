document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. TOP SCROLL PROGRESS BAR & BACK TO TOP
     ========================================== */
  const progressBar = document.getElementById('scroll-progress-bar');
  const backToTopBtn = document.getElementById('back-to-top');

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (backToTopBtn) {
      if (scrollTop > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================
     1b. THEME TOGGLE (Light / Dark)
      ========================================== */
  const themeToggle = document.getElementById('theme-toggle');
  const themeRoot = document.documentElement;

  function applyTheme(theme) {
    themeRoot.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch (e) {}
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = themeRoot.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(current);
    });
  }

  /* ==========================================
     2. NAVBAR SCROLL EFFECT
      ========================================== */
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ==========================================
     3. MOBILE MENU TOGGLE
     ========================================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileMenuBtn && navMenu) {
    function closeMobileMenu() {
      navMenu.classList.remove('active');
      mobileMenuBtn.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');

      const spans = mobileMenuBtn.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }

    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !navMenu.classList.contains('active');
      navMenu.classList.toggle('active');
      mobileMenuBtn.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      const spans = mobileMenuBtn.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(4px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    document.addEventListener('click', (event) => {
      if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target) && navMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }

  /* ==========================================
     4. ADVANCED SCROLL REVEAL & INTERSECTION OBSERVER
     ========================================== */
  const sections = document.querySelectorAll('section');
  const revealSelectors = '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger';
  const revealElements = document.querySelectorAll(revealSelectors);

  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  let animatedCounters = false;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');

        // Trigger skill bars animation if skills section or category becomes active
        if (entry.target.id === 'skills' || entry.target.classList.contains('skills-grid')) {
          animateSkillBars();
        }

        // Trigger numeric counters animation if stats banner is active
        if (entry.target.classList.contains('stats-banner') && !animatedCounters) {
          animateCounters();
          animatedCounters = true;
        }
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
  sections.forEach(sec => revealObserver.observe(sec));

  // Active Navigation Link Update on Scroll
  window.addEventListener('scroll', () => {
    let currentSectionId = 'home';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 180;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  /* ==========================================
     5. ANIMATED NUMERIC COUNTERS
     ========================================== */
  function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1800; // 1.8s
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Ease out quad formula
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * target);
        
        counter.textContent = currentValue;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  /* ==========================================
     6. SKILLS ANIMATION LOGIC
     ========================================== */
  function animateSkillBars() {
    const barFills = document.querySelectorAll('.skill-bar-fill');
    barFills.forEach(bar => {
      const targetVal = bar.getAttribute('data-val') || bar.parentElement.previousElementSibling.querySelector('.skill-val').textContent;
      bar.style.width = targetVal;
    });
  }

  /* ==========================================
     7. PARALLAX SCROLL EFFECT
     ========================================== */
  const parallaxElements = document.querySelectorAll('[data-speed]');
  
  function handleParallax() {
    const scrollY = window.scrollY;
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed')) || 0.2;
      const translateY = scrollY * speed;
      el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    });
  }

  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', () => {
      requestAnimationFrame(handleParallax);
    }, { passive: true });
  }

  /* ==========================================
     8. TIMELINE TABS TOGGLE (Education & Experience)
     ========================================== */
  const tabEdu = document.getElementById('tab-edu');
  const tabExp = document.getElementById('tab-exp');
  const eduTimeline = document.getElementById('education-timeline');
  const expTimeline = document.getElementById('experience-timeline');

  function switchTimeline(activeTab, inactiveTab, activeWrapper, inactiveWrapper) {
    inactiveTab.classList.remove('active');
    activeTab.classList.add('active');
    
    inactiveWrapper.style.opacity = '0';
    setTimeout(() => {
      inactiveWrapper.classList.remove('active');
      activeWrapper.classList.add('active');
      activeWrapper.style.opacity = '0';
      
      // Force repaint to trigger animation
      activeWrapper.offsetHeight;
      
      activeWrapper.style.opacity = '1';
      
      // Trigger entrance reveal for timeline items in the newly activated tab
      const items = activeWrapper.querySelectorAll('.timeline-item');
      items.forEach(item => item.classList.add('active'));
    }, 300);
  }

  if (tabEdu && tabExp) {
    tabEdu.addEventListener('click', () => {
      if (!tabEdu.classList.contains('active')) {
        switchTimeline(tabEdu, tabExp, eduTimeline, expTimeline);
      }
    });

    tabExp.addEventListener('click', () => {
      if (!tabExp.classList.contains('active')) {
        switchTimeline(tabExp, tabEdu, expTimeline, eduTimeline);
      }
    });
  }

  /* ==========================================
     9. PORTFOLIO FILTERS LOGIC
     ========================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      portfolioItems.forEach(item => {
        item.style.transform = 'scale(0.85)';
        item.style.opacity = '0';
        
        setTimeout(() => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'block';
            item.offsetHeight; // Force repaint
            item.style.transform = 'scale(1)';
            item.style.opacity = '1';
          } else {
            item.style.display = 'none';
          }
        }, 300);
      });
    });
  });

  /* ==========================================
     10. INTERACTIVE 3D CARD TILT ON MOUSE/TOUCH
     ========================================== */
  const glassCards = document.querySelectorAll('.glass-card, .portfolio-item');

  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5; // max 5deg tilt
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  /* ==========================================
     11. CONTACT FORM SUBMISSION MOCKUP
     ========================================== */
  const contactForm = document.getElementById('portfolio-contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('btn-submit-form');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      submitBtn.textContent = 'Envoi en cours...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;
      formStatus.classList.remove('success', 'error');

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formStatus.textContent = 'Message envoyé avec succès ! Je reviens vers vous rapidement.';
          formStatus.classList.add('success');
          contactForm.reset();
        } else {
          formStatus.textContent = 'Une erreur est survenue. Veuillez réessayer.';
          formStatus.classList.add('error');
        }
      } catch (err) {
        formStatus.textContent = 'Erreur réseau. Vérifiez votre connexion puis réessayez.';
        formStatus.classList.add('error');
      }

      submitBtn.textContent = 'Envoyer le message';
      submitBtn.style.opacity = '1';
      submitBtn.disabled = false;

      setTimeout(() => {
        formStatus.classList.remove('success', 'error');
      }, 8000);
    });
  }
});
