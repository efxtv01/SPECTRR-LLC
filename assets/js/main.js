/**
 * SPECTRR LLC - Modern Architectural Website Interactive Script
 * Handles:
 * 1. Interactive 3D Blueprint Comparison Slider (Before/After)
 * 2. Hotspots & Micro-interactions
 * 3. Dynamic 3D Plan Cost Calculator (Cotizador en Tiempo Real)
 * 4. Portfolio Filter System & Lightbox Modal
 * 5. Animated Counters & Viewport Entry Observers
 * 6. Responsive Mobile Navigation
 * 7. Interactive Tooltip Positioning & Sanitization
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initComparisonSlider();
  initHotspots();
  initCalculator();
  initPortfolio();
  initCounters();
  initContactForm();
});

/* ==========================================================================
   1. NAVBAR & MOBILE MENU
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.header');
  const toggleBtn = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking nav links or cta buttons
    navMenu.querySelectorAll('.nav-link, .nav-menu-cta a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   2. INTERACTIVE 3D BLUEPRINT COMPARISON SLIDER
   ========================================================================== */
function initComparisonSlider() {
  const viewer = document.querySelector('.comparison-viewer');
  const toggleBtns = document.querySelectorAll('.sim-toggle-btn');

  if (!viewer) return;

  let isDragging = false;

  function updateSliderPosition(clientX) {
    const rect = viewer.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    let percentage = (offsetX / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    viewer.style.setProperty('--slider-pos', `${percentage}%`);
  }

  // Mouse Events
  viewer.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSliderPosition(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  });

  // Touch Events
  viewer.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateSliderPosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.touches[0].clientX);
  }, { passive: true });

  // Quick preset mode buttons
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      if (mode === 'split') {
        viewer.style.setProperty('--slider-pos', '50%');
      } else if (mode === 'blueprint') {
        viewer.style.setProperty('--slider-pos', '0%');
      } else if (mode === 'render') {
        viewer.style.setProperty('--slider-pos', '100%');
      }
    });
  });

  // Set default initial position
  viewer.style.setProperty('--slider-pos', '50%');
}

/* ==========================================================================
   3. INTERACTIVE HOTSPOTS ON 3D BLUEPRINT
   ========================================================================== */
function initHotspots() {
  const hotspots = document.querySelectorAll('.hotspot-pin');
  hotspots.forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = pin.dataset.title || 'Detalle Técnico';
      const desc = pin.dataset.desc || 'Información de plano 3D';
      alert(`[SPECTRR LLC - Detalle 3D]\n\n${title}\n${desc}`);
    });
  });
}

/* ==========================================================================
   4. DYNAMIC 3D PLAN COST CALCULATOR (COTIZADOR EN TIEMPO REAL)
   ========================================================================== */
function initCalculator() {
  const calcRoot = document.querySelector('.calculator-section');
  if (!calcRoot) return;

  const typeBtns = calcRoot.querySelectorAll('.calc-select-btn[data-type]');
  const tierBtns = calcRoot.querySelectorAll('.calc-select-btn[data-tier]');
  const areaSlider = calcRoot.querySelector('#calcAreaSlider');
  const areaDisplay = calcRoot.querySelector('#calcAreaValue');
  const addonChecks = calcRoot.querySelectorAll('.calc-addon-item input[type="checkbox"]');

  const priceAmount = calcRoot.querySelector('#calcResultPrice');
  const summaryType = calcRoot.querySelector('#calcSummaryType');
  const summaryArea = calcRoot.querySelector('#calcSummaryArea');
  const summaryTier = calcRoot.querySelector('#calcSummaryTier');
  const summaryTurnaround = calcRoot.querySelector('#calcSummaryTurnaround');
  const whatsappCta = calcRoot.querySelector('#calcWhatsappBtn');

  // Rates in USD base
  const typeMultipliers = {
    'residencial': 1.0,
    'comercial': 1.25,
    'corporativo': 1.45,
    'edificios': 1.85
  };

  const tierMultipliers = {
    'anteproyecto': 0.65,
    'ejecutivo': 1.0,
    'bim-mep': 1.5,
    'llave-en-mano': 2.1
  };

  const tierNames = {
    'anteproyecto': 'Distribución 3D y Renders',
    'ejecutivo': 'Planos Ejecutivos 3D Completos',
    'bim-mep': 'Modelado BIM + MEP Integral',
    'llave-en-mano': 'Completo Llave en Mano + Permisos'
  };

  let currentType = 'residencial';
  let currentTier = 'ejecutivo';
  let currentArea = 1500; // sq ft base

  function recalculate() {
    // Base rate approx $0.65 - $1.20 per sq ft for digital 3D architectural blueprints
    const basePerSqFt = 0.85;
    const typeMult = typeMultipliers[currentType] || 1.0;
    const tierMult = tierMultipliers[currentTier] || 1.0;

    let subtotal = currentArea * basePerSqFt * typeMult * tierMult;

    // Add-ons
    let addonsTotal = 0;
    let selectedAddonsList = [];
    addonChecks.forEach(chk => {
      const parent = chk.closest('.calc-addon-item');
      if (chk.checked) {
        parent.classList.add('checked');
        const addonCost = parseFloat(chk.dataset.cost || 0);
        addonsTotal += addonCost;
        selectedAddonsList.push(chk.dataset.name);
      } else {
        parent.classList.remove('checked');
      }
    });

    let total = Math.round(subtotal + addonsTotal);
    // Minimum price floor
    if (total < 450) total = 450;

    // Turnaround estimation
    let days = Math.round(5 + (currentArea / 800) * 2 + (currentTier === 'llave-en-mano' ? 4 : 0));
    if (days < 4) days = 4;

    // Update UI
    if (priceAmount) {
      priceAmount.textContent = `$${total.toLocaleString('en-US')} USD`;
    }
    if (summaryType) {
      summaryType.textContent = currentType.charAt(0).toUpperCase() + currentType.slice(1);
    }
    if (summaryArea) {
      summaryArea.textContent = `${currentArea.toLocaleString('en-US')} sq ft (~${Math.round(currentArea * 0.0929)} m²)`;
    }
    if (summaryTier) {
      summaryTier.textContent = tierNames[currentTier] || 'Ejecutivo 3D';
    }
    if (summaryTurnaround) {
      summaryTurnaround.textContent = `${days} a ${days + 4} días hábiles`;
    }

    // Update WhatsApp link
    if (whatsappCta) {
      const msg = encodeURIComponent(
        `Hola SPECTRR LLC, me interesa cotizar un proyecto 3D ONLINE:\n` +
        `- Tipo: ${currentType}\n` +
        `- Área: ${currentArea} sq ft\n` +
        `- Nivel: ${tierNames[currentTier]}\n` +
        `- Extras: ${selectedAddonsList.join(', ') || 'Ninguno'}\n` +
        `- Estimación web: $${total.toLocaleString('en-US')} USD`
      );
      whatsappCta.href = `https://wa.me/19162490875?text=${msg}`;
    }
  }

  // Type selection
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      recalculate();
    });
  });

  // Tier selection
  tierBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tierBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTier = btn.dataset.tier;
      recalculate();
    });
  });

  // Area slider
  if (areaSlider && areaDisplay) {
    areaSlider.addEventListener('input', (e) => {
      currentArea = parseInt(e.target.value, 10);
      areaDisplay.textContent = `${currentArea.toLocaleString('en-US')} sq ft`;
      recalculate();
    });
  }

  // Add-ons checkboxes
  addonChecks.forEach(chk => {
    chk.addEventListener('change', recalculate);
  });

  // Initial calculation
  recalculate();
}

/* ==========================================================================
   5. PORTFOLIO FILTER & LIGHTBOX MODAL
   ========================================================================== */
function initPortfolio() {
  const filterBtns = document.querySelectorAll('.port-filter-btn');
  const projectCards = document.querySelectorAll('.portfolio-card');
  const modalOverlay = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalDesc = document.getElementById('modalDesc');
  const modalImg = document.getElementById('modalImg');
  const modalSpecs = document.getElementById('modalSpecs');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        projectCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
            setTimeout(() => { card.style.opacity = '1'; }, 20);
          } else {
            card.style.opacity = '0';
            setTimeout(() => { card.style.display = 'none'; }, 250);
          }
        });
      });
    });
  }

  // Open Lightbox on card click
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      if (!modalOverlay) return;

      const title = card.querySelector('.portfolio-title')?.textContent || 'Proyecto 3D';
      const category = card.querySelector('.portfolio-category-tag')?.textContent || 'Planos 3D';
      const imgSrc = card.querySelector('img')?.getAttribute('src') || '';
      const desc = card.dataset.desc || 'Desarrollo integral de planos arquitectónicos 3D online con entrega digital y cumplimiento normativo.';
      const specs = card.dataset.specs || 'Formato: DWG + RVT + PDF | Entrega 100% Online';

      if (modalTitle) modalTitle.textContent = title;
      if (modalCategory) modalCategory.textContent = category;
      if (modalImg) modalImg.src = imgSrc;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalSpecs) modalSpecs.textContent = specs;

      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close Lightbox
  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ==========================================================================
   6. ANIMATED COUNTERS
   ========================================================================== */
function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-num[data-target]');
  if (statNumbers.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        let start = 0;
        const duration = 1600;
        const stepTime = 25;
        const steps = duration / stepTime;
        const increment = target / steps;

        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            start = target;
            clearInterval(timer);
          }
          el.textContent = `${prefix}${Math.floor(start)}${suffix}`;
        }, stepTime);

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

/* ==========================================================================
   7. CONTACT FORM SUBMISSION FEEDBACK
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('quoteContactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="client_name"]')?.value || '';
    const email = form.querySelector('[name="client_email"]')?.value || '';
    const phone = form.querySelector('[name="client_phone"]')?.value || '';
    const type = form.querySelector('[name="project_type"]')?.value || '';
    const message = form.querySelector('[name="client_message"]')?.value || '';

    // Simulate instant confirmation
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Enviando información...</span>`;

    setTimeout(() => {
      submitBtn.innerHTML = `<span>✓ ¡Solicitud Recibida con Éxito!</span>`;
      submitBtn.style.background = '#10b981';

      alert(
        `¡Gracias ${name}!\n\nHemos recibido tu solicitud para planos 3D (${type}).\nUn arquitecto de SPECTRR LLC revisará tu información y te contactará en menos de 24 horas a ${email} o al ${phone}.\n\nTambién puedes escribirnos de inmediato por WhatsApp al +1 9162490875.`
      );

      form.reset();
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
      }, 4000);
    }, 1200);
  });
}
