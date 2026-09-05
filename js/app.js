/**
 * BENJAMIN SMITH — PORTFOLIO APPLICATION
 * Interactive Controller & GSAP Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Elements
  const viewHome = document.getElementById('view-home');
  const innerAppLayout = document.getElementById('innerAppLayout');
  const mainContent = document.getElementById('mainContent');
  const contentViews = document.querySelectorAll('.content-view');
  const navLinks = document.querySelectorAll('.nav-link');
  const dockItems = document.querySelectorAll('.dock-item');
  const curvedNavItems = document.querySelectorAll('.c-nav-item');
  const navBarWrapper = document.getElementById('navBarWrapper');
  const navCurvedBg = document.getElementById('navCurvedBg');
  const navCurvedPath = document.getElementById('navCurvedPath');
  const indicatorBubble = document.getElementById('indicatorBubble');
  const bubbleIconWrap = document.getElementById('bubbleIconWrap');
  const navTriggers = document.querySelectorAll('.nav-trigger');
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const leftSidebar = document.getElementById('leftSidebar');
  
  // State
  let currentView = 'home';
  let isTransitioning = false;

  // --------------------------------------------------------------------------
  // FLUID CURVED NOTCHED BOTTOM NAVIGATION BAR (Dynamic SVG Cutout & Spring)
  // --------------------------------------------------------------------------
  const notchState = { x: 0 };
  let isNotchInitialized = false;

  function generateNotchPath(w, h, x) {
    const r = 24; // Navbar corner radius
    const rw = 32; // Cutout scoop half-width
    const d = 26; // Cutout scoop depth
    const c1 = 14; // Concave shoulder bezier control
    const c2 = 14;

    // Keep scoop within navbar horizontal bounds
    const clampedX = Math.max(rw + 2, Math.min(w - rw - 2, x));

    return `M 0 ${r} Q 0 0 ${r} 0 ` +
           `L ${clampedX - rw} 0 ` +
           `C ${clampedX - rw + c1} 0, ${clampedX - c2} ${d}, ${clampedX} ${d} ` +
           `C ${clampedX + c2} ${d}, ${clampedX + rw - c1} 0, ${clampedX + rw} 0 ` +
           `L ${w - r} 0 Q ${w} 0 ${w} ${r} ` +
           `L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} ` +
           `L ${r} ${h} Q 0 ${h} 0 ${h - r} Z`;
  }

  function updateCurvedNav(targetView, animate = true) {
    if (!navBarWrapper || !navCurvedPath || !indicatorBubble || !curvedNavItems.length) return;

    let targetItem = null;
    curvedNavItems.forEach(item => {
      const isMatch = (item.dataset.target === targetView);
      item.classList.toggle('active', isMatch);
      if (isMatch) targetItem = item;
    });

    if (!targetItem) return;

    const w = navBarWrapper.offsetWidth || 360;
    const h = navBarWrapper.offsetHeight || 68;
    if (navCurvedBg) {
      navCurvedBg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }

    // Clone active icon into floating circular bubble
    const iconSvg = targetItem.querySelector('.c-nav-icon svg');
    if (iconSvg && bubbleIconWrap) {
      bubbleIconWrap.innerHTML = iconSvg.outerHTML;
    }

    // Precise center calculation
    const targetCenterX = targetItem.offsetLeft + (targetItem.offsetWidth / 2);
    const bubbleHalfWidth = (indicatorBubble.offsetWidth / 2) || 24;
    const bubbleTargetX = targetCenterX - bubbleHalfWidth;

    if (!isNotchInitialized || !animate) {
      isNotchInitialized = true;
      notchState.x = targetCenterX;
      navCurvedPath.setAttribute('d', generateNotchPath(w, h, targetCenterX));
      gsap.set(indicatorBubble, { x: bubbleTargetX });
    } else {
      // 1. Fluid notch glide via SVG path re-evaluation on each frame
      gsap.to(notchState, {
        x: targetCenterX,
        duration: 0.55,
        ease: 'elastic.out(1, 0.8)',
        onUpdate: () => {
          navCurvedPath.setAttribute('d', generateNotchPath(w, h, notchState.x));
        }
      });

      // 2. Elastic spring slide for floating bubble
      gsap.to(indicatorBubble, {
        x: bubbleTargetX,
        duration: 0.55,
        ease: 'elastic.out(1, 0.8)'
      });

      // 3. Icon pop & bounce
      gsap.fromTo(bubbleIconWrap, 
        { scale: 0.2, rotation: -25, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.45, ease: 'back.out(2.2)' }
      );

      // 4. Bubble scale snap
      gsap.fromTo(indicatorBubble,
        { scale: 0.86 },
        { scale: 1, duration: 0.45, ease: 'back.out(2)' }
      );
    }
  }

  // Initialize curved nav position and home entrance
  setTimeout(() => {
    updateCurvedNav('home', false);
    initScrollTriggerForView('home');
  }, 80);

  window.addEventListener('resize', () => {
    isNotchInitialized = false;
    updateCurvedNav(currentView, false);
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  // --------------------------------------------------------------------------
  // GSAP SCROLLTRIGGER & INTERACTION CONTROLLER
  // --------------------------------------------------------------------------
  function getScrollContainer() {
    return window.innerWidth <= 900 ? window : '#mainContent';
  }

  function initScrollTriggerForView(viewName) {
    if (typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Clean up previous view scroll triggers
    ScrollTrigger.getAll().forEach(st => st.kill());

    const scroller = getScrollContainer();

    if (viewName === 'home') {
      gsap.fromTo('.home-intro-content > *',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
      );
    } else if (viewName === 'about') {
      animateCounters();

      const serviceItems = document.querySelectorAll('#view-about .service-item');
      if (serviceItems.length) {
        gsap.killTweensOf(serviceItems);
        gsap.fromTo(serviceItems,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.08,
            ease: 'power2.out',
            onComplete: () => {
              serviceItems.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = '';
              });
            }
          }
        );
      }
    } else if (viewName === 'skills' || viewName === 'resume') {
      const metricCards = document.querySelectorAll('#view-skills .skill-metric-card');
      const skillCards = document.querySelectorAll('#view-skills .skill-card');
      const meterFills = document.querySelectorAll('#view-skills .skill-meter-fill');

      if (metricCards.length) {
        gsap.killTweensOf(metricCards);
        gsap.fromTo(metricCards,
          { opacity: 0, y: 16, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
        );
      }

      if (skillCards.length) {
        gsap.killTweensOf(skillCards);
        gsap.fromTo(skillCards,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.04,
            ease: 'power3.out',
            onComplete: () => {
              skillCards.forEach(c => {
                c.style.opacity = '1';
                c.style.transform = '';
              });
            }
          }
        );
      }

      // Animate proficiency progress bars
      if (meterFills.length) {
        meterFills.forEach(fill => {
          const targetW = fill.style.width || '85%';
          gsap.fromTo(fill,
            { width: '0%' },
            { width: targetW, duration: 0.85, ease: 'power2.out', delay: 0.15 }
          );
        });
      }
    } else if (viewName === 'portfolio') {
      const cards = document.querySelectorAll('#view-portfolio .portfolio-card');
      if (cards.length) {
        gsap.killTweensOf(cards);
        gsap.fromTo(cards,
          { opacity: 0, scale: 0.94, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.08,
            ease: 'power3.out',
            onComplete: () => {
              cards.forEach(c => {
                c.style.opacity = '1';
                c.style.transform = '';
              });
              if (typeof updateCardParallax === 'function') {
                updateCardParallax();
              }
            }
          }
        );
      }
    } else if (viewName === 'testimonials') {
      const tCards = document.querySelectorAll('#view-testimonials .testimonial-card');
      if (tCards.length) {
        gsap.killTweensOf(tCards);
        gsap.fromTo(tCards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.08,
            ease: 'power2.out',
            onComplete: () => {
              tCards.forEach(c => {
                c.style.opacity = '1';
                c.style.transform = '';
              });
            }
          }
        );
      }
    } else if (viewName === 'contact') {
      const infoSplit = document.querySelector('#view-contact .contact-info-split');
      const formSection = document.querySelector('#view-contact .contact-form-section');
      const contactEls = [infoSplit, formSection].filter(Boolean);
      if (contactEls.length) {
        gsap.killTweensOf(contactEls);
        gsap.fromTo(contactEls,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out',
            onComplete: () => {
              contactEls.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = '';
              });
            }
          }
        );
      }
    }

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 60);
  }

  // --------------------------------------------------------------------------
  // 1. LIQUID / PAINT FULL-SCREEN PAGE TRANSITION ENGINE
  // --------------------------------------------------------------------------
  const liquidTransition = document.getElementById('liquidTransition');
  const liquidPathAccent = document.getElementById('liquidPathAccent');
  const liquidPathDark = document.getElementById('liquidPathDark');

  function applyDOMViewSwitch(targetView) {
    // Reset Scroll Position on Mobile & Desktop
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (mainContent) mainContent.scrollTop = 0;

    // Update Dock Active States
    dockItems.forEach(item => {
      item.classList.toggle('active', item.dataset.target === targetView);
    });

    // Update Sidebar Active States
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.target === targetView);
    });

    // Update Curved Bottom Nav
    updateCurvedNav(targetView, true);

    // Update Mobile Drawer Active States
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
    mobileMenuItems.forEach(item => {
      item.classList.toggle('active', item.dataset.target === targetView);
    });

    // Handle Layout Switch
    if (targetView === 'home') {
      innerAppLayout.classList.remove('active-layout');
      innerAppLayout.style.display = 'none';
      innerAppLayout.style.opacity = '1';
      viewHome.classList.add('active-panel');
      viewHome.style.display = '';
      viewHome.style.opacity = '1';
      viewHome.style.transform = 'none';
      currentView = 'home';
    } else {
      viewHome.classList.remove('active-panel');
      viewHome.style.display = 'none';
      viewHome.style.opacity = '';
      viewHome.style.transform = 'none';
      innerAppLayout.classList.add('active-layout');
      innerAppLayout.style.display = '';
      innerAppLayout.style.opacity = '1';
      innerAppLayout.style.transform = 'none';
      switchContentView(targetView);
      currentView = targetView;
    }

    // Close Mobile Drawer if Open
    if (typeof closeMobileMenu === 'function') {
      closeMobileMenu();
    }
  }

  // --------------------------------------------------------------------------
  // MULTI-STYLE BESPOKE LIQUID / PAINT TRANSITIONS (Unique for Every View)
  // --------------------------------------------------------------------------

  // 1. WAVE UP (Used for About Me) — Tidal Upward Surge
  function pathWaveUpCover(y1, cp1, cp2, y2) {
    return `M 0 100 V ${y1.toFixed(1)} C 35 ${cp1.toFixed(1)}, 65 ${cp2.toFixed(1)}, 100 ${y2.toFixed(1)} V 100 Z`;
  }
  function pathWaveUpUncover(y1, cp1, cp2, y2) {
    return `M 0 0 V ${y1.toFixed(1)} C 35 ${cp1.toFixed(1)}, 65 ${cp2.toFixed(1)}, 100 ${y2.toFixed(1)} V 0 Z`;
  }

  // 2. WATERFALL DOWN (Used for Resume) — Downward Liquid Cascade
  function pathWaveDownCover(y1, cp1, cp2, y2) {
    return `M 0 0 V ${y1.toFixed(1)} C 35 ${cp1.toFixed(1)}, 65 ${cp2.toFixed(1)}, 100 ${y2.toFixed(1)} V 0 Z`;
  }
  function pathWaveDownUncover(y1, cp1, cp2, y2) {
    return `M 0 100 V ${y1.toFixed(1)} C 35 ${cp1.toFixed(1)}, 65 ${cp2.toFixed(1)}, 100 ${y2.toFixed(1)} V 100 Z`;
  }

  // 3. DIAGONAL WAVE (Used for Portfolio) — Slanted Dynamic Liquid Sweep
  function pathWaveDiagCover(yL, cp1, cp2, yR) {
    return `M 0 100 L 0 ${yL.toFixed(1)} C 35 ${cp1.toFixed(1)}, 65 ${cp2.toFixed(1)}, 100 ${yR.toFixed(1)} L 100 100 Z`;
  }
  function pathWaveDiagUncover(yL, cp1, cp2, yR) {
    return `M 0 0 L 0 ${yL.toFixed(1)} C 35 ${cp1.toFixed(1)}, 65 ${cp2.toFixed(1)}, 100 ${yR.toFixed(1)} L 100 0 Z`;
  }

  // 4. HORIZONTAL STREAM (Used for Testimonials) — Left to Right Liquid Flow
  function pathWaveHorizCover(x1, cp1, cp2, x2) {
    return `M 0 0 H ${x1.toFixed(1)} C ${cp1.toFixed(1)} 35, ${cp2.toFixed(1)} 65, ${x2.toFixed(1)} 100 H 0 Z`;
  }
  function pathWaveHorizUncover(x1, cp1, cp2, x2) {
    return `M 100 0 H ${x1.toFixed(1)} C ${cp1.toFixed(1)} 35, ${cp2.toFixed(1)} 65, ${x2.toFixed(1)} 100 H 100 Z`;
  }

  // 5. DUAL CURTAIN PINCH (Used for Contact) — Dual Liquid Curtain Converge & Part
  function pathCurtain(wL, cpL, cpR, wR) {
    return `M 0 0 H ${wL.toFixed(1)} Q ${cpL.toFixed(1)} 50, ${wL.toFixed(1)} 100 H 0 Z ` +
           `M 100 0 H ${(100 - wR).toFixed(1)} Q ${(100 - cpR).toFixed(1)} 50, ${(100 - wR).toFixed(1)} 100 H 100 Z`;
  }

  // 6. INVERSE DIAGONAL WAVE (Used for Home) — Top-Right to Bottom-Left Organic Sweep
  function pathWaveInvDiagCover(yL, cp1, cp2, yR) {
    return `M 0 100 L 0 ${yL.toFixed(1)} C 35 ${cp1.toFixed(1)}, 65 ${cp2.toFixed(1)}, 100 ${yR.toFixed(1)} L 100 100 Z`;
  }
  function pathWaveInvDiagUncover(yL, cp1, cp2, yR) {
    return `M 0 0 L 0 ${yL.toFixed(1)} C 35 ${cp1.toFixed(1)}, 65 ${cp2.toFixed(1)}, 100 ${yR.toFixed(1)} L 100 0 Z`;
  }

  function normalizeViewName(v) {
    if (!v) return 'home';
    const lower = v.toLowerCase().trim();
    if (lower === 'work') return 'portfolio';
    if (lower === 'reviews' || lower === 'review') return 'testimonials';
    if (lower === 'resume') return 'skills';
    if (lower === 'contect') return 'contact';
    return lower;
  }

  function navigateTo(rawTarget) {
    const targetView = normalizeViewName(rawTarget);
    if (targetView === currentView || isTransitioning) return;
    isTransitioning = true;

    // Accessibility: Reduced Motion
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !liquidTransition ||
      !liquidPathAccent ||
      !liquidPathDark
    ) {
      applyDOMViewSwitch(targetView);
      initScrollTriggerForView(targetView);
      isTransitioning = false;
      return;
    }

    liquidTransition.classList.add('active');

    // Kinetic Zoom Out on Outgoing Canvas
    const outgoingEl = (currentView === 'home') 
      ? viewHome 
      : (window.innerWidth <= 900 ? innerAppLayout : mainContent);

    if (outgoingEl) {
      gsap.to(outgoingEl, {
        scale: 0.94,
        opacity: 0.65,
        duration: 0.35,
        ease: 'power2.in'
      });
    }

    const onMidpointSwitch = () => {
      applyDOMViewSwitch(targetView);

      // Kinetic Zoom In on Incoming Canvas
      const incomingEl = (targetView === 'home') 
        ? viewHome 
        : (window.innerWidth <= 900 ? innerAppLayout : mainContent);

      if (incomingEl) {
        gsap.killTweensOf(incomingEl);
        gsap.fromTo(incomingEl,
          { scale: 1.05, opacity: 0.4 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.45, 
            ease: 'power3.out', 
            clearProps: 'transform,opacity' 
          }
        );
      }
    };

    const tl = gsap.timeline({
      onComplete: () => {
        liquidTransition.classList.remove('active');
        isTransitioning = false;
        if (targetView === 'home') {
          viewHome.style.display = '';
          innerAppLayout.style.display = 'none';
        } else {
          viewHome.style.display = 'none';
          innerAppLayout.style.display = '';
        }
        gsap.set(['#view-home', '#innerAppLayout', '#mainContent'], { clearProps: 'transform,opacity' });
        initScrollTriggerForView(targetView);
      }
    });

    // ------------------------------------------------------------------------
    // ROUTE 1: ABOUT ME -> WAVE UP SURGE
    // ------------------------------------------------------------------------
    if (targetView === 'about') {
      liquidPathAccent.setAttribute('d', pathWaveUpCover(100, 100, 100, 100));
      liquidPathDark.setAttribute('d', pathWaveUpCover(100, 100, 100, 100));

      const coverAccent = { y1: 100, cp1: 100, cp2: 100, y2: 100 };
      const coverDark = { y1: 100, cp1: 100, cp2: 100, y2: 100 };
      const uncoverDark = { y1: 100, cp1: 100, cp2: 100, y2: 100 };
      const uncoverAccent = { y1: 100, cp1: 100, cp2: 100, y2: 100 };

      tl.to(coverAccent, {
        y1: 0, cp1: -28, cp2: -22, y2: 0, duration: 0.38, ease: 'power3.in',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveUpCover(coverAccent.y1, coverAccent.cp1, coverAccent.cp2, coverAccent.y2))
      }, 0);

      tl.to(coverDark, {
        y1: 0, cp1: -32, cp2: -24, y2: 0, duration: 0.42, ease: 'power3.in',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveUpCover(coverDark.y1, coverDark.cp1, coverDark.cp2, coverDark.y2))
      }, 0.05);

      tl.to(coverDark, {
        cp1: 0, cp2: 0, duration: 0.05, ease: 'power1.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveUpCover(coverDark.y1, coverDark.cp1, coverDark.cp2, coverDark.y2))
      });

      tl.add(() => {
        onMidpointSwitch();
        liquidPathDark.setAttribute('d', pathWaveUpUncover(100, 100, 100, 100));
        liquidPathAccent.setAttribute('d', pathWaveUpUncover(100, 100, 100, 100));
      });

      tl.to(uncoverDark, {
        y1: 0, cp1: -28, cp2: -20, y2: 0, duration: 0.40, ease: 'power3.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveUpUncover(uncoverDark.y1, uncoverDark.cp1, uncoverDark.cp2, uncoverDark.y2))
      });

      tl.to(uncoverAccent, {
        y1: 0, cp1: -32, cp2: -24, y2: 0, duration: 0.42, ease: 'power3.out',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveUpUncover(uncoverAccent.y1, uncoverAccent.cp1, uncoverAccent.cp2, uncoverAccent.y2))
      }, '<0.06');

    // ------------------------------------------------------------------------
    // ROUTE 2: SKILLS / RESUME -> WATERFALL DOWN CASCADE
    // ------------------------------------------------------------------------
    } else if (targetView === 'skills' || targetView === 'resume') {
      liquidPathAccent.setAttribute('d', pathWaveDownCover(0, 0, 0, 0));
      liquidPathDark.setAttribute('d', pathWaveDownCover(0, 0, 0, 0));

      const coverAccent = { y1: 0, cp1: 0, cp2: 0, y2: 0 };
      const coverDark = { y1: 0, cp1: 0, cp2: 0, y2: 0 };
      const uncoverDark = { y1: 0, cp1: 0, cp2: 0, y2: 0 };
      const uncoverAccent = { y1: 0, cp1: 0, cp2: 0, y2: 0 };

      tl.to(coverAccent, {
        y1: 100, cp1: 128, cp2: 122, y2: 100, duration: 0.38, ease: 'power3.in',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveDownCover(coverAccent.y1, coverAccent.cp1, coverAccent.cp2, coverAccent.y2))
      }, 0);

      tl.to(coverDark, {
        y1: 100, cp1: 132, cp2: 124, y2: 100, duration: 0.42, ease: 'power3.in',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveDownCover(coverDark.y1, coverDark.cp1, coverDark.cp2, coverDark.y2))
      }, 0.05);

      tl.to(coverDark, {
        cp1: 100, cp2: 100, duration: 0.05, ease: 'power1.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveDownCover(coverDark.y1, coverDark.cp1, coverDark.cp2, coverDark.y2))
      });

      tl.add(() => {
        onMidpointSwitch();
        liquidPathDark.setAttribute('d', pathWaveDownUncover(0, 0, 0, 0));
        liquidPathAccent.setAttribute('d', pathWaveDownUncover(0, 0, 0, 0));
      });

      tl.to(uncoverDark, {
        y1: 100, cp1: 128, cp2: 120, y2: 100, duration: 0.40, ease: 'power3.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveDownUncover(uncoverDark.y1, uncoverDark.cp1, uncoverDark.cp2, uncoverDark.y2))
      });

      tl.to(uncoverAccent, {
        y1: 100, cp1: 132, cp2: 124, y2: 100, duration: 0.42, ease: 'power3.out',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveDownUncover(uncoverAccent.y1, uncoverAccent.cp1, uncoverAccent.cp2, uncoverAccent.y2))
      }, '<0.06');

    // ------------------------------------------------------------------------
    // ROUTE 3: PORTFOLIO -> DIAGONAL SLANTED LIQUID WAVE
    // ------------------------------------------------------------------------
    } else if (targetView === 'portfolio') {
      liquidPathAccent.setAttribute('d', pathWaveDiagCover(100, 100, 100, 100));
      liquidPathDark.setAttribute('d', pathWaveDiagCover(100, 100, 100, 100));

      const coverAccent = { yL: 100, cp1: 100, cp2: 100, yR: 100 };
      const coverDark = { yL: 100, cp1: 100, cp2: 100, yR: 100 };
      const uncoverDark = { yL: 100, cp1: 100, cp2: 100, yR: 100 };
      const uncoverAccent = { yL: 100, cp1: 100, cp2: 100, yR: 100 };

      tl.to(coverAccent, {
        yL: -25, cp1: -18, cp2: 6, yR: 0, duration: 0.38, ease: 'power3.in',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveDiagCover(coverAccent.yL, coverAccent.cp1, coverAccent.cp2, coverAccent.yR))
      }, 0);

      tl.to(coverDark, {
        yL: -30, cp1: -22, cp2: 2, yR: 0, duration: 0.42, ease: 'power3.in',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveDiagCover(coverDark.yL, coverDark.cp1, coverDark.cp2, coverDark.yR))
      }, 0.05);

      tl.to(coverDark, {
        yL: 0, cp1: 0, cp2: 0, yR: 0, duration: 0.05, ease: 'power1.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveDiagCover(coverDark.yL, coverDark.cp1, coverDark.cp2, coverDark.yR))
      });

      tl.add(() => {
        onMidpointSwitch();
        liquidPathDark.setAttribute('d', pathWaveDiagUncover(100, 100, 100, 100));
        liquidPathAccent.setAttribute('d', pathWaveDiagUncover(100, 100, 100, 100));
      });

      tl.to(uncoverDark, {
        yL: 0, cp1: -6, cp2: -18, yR: -25, duration: 0.40, ease: 'power3.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveDiagUncover(uncoverDark.yL, uncoverDark.cp1, uncoverDark.cp2, uncoverDark.yR))
      });

      tl.to(uncoverAccent, {
        yL: 0, cp1: -10, cp2: -24, yR: -30, duration: 0.42, ease: 'power3.out',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveDiagUncover(uncoverAccent.yL, uncoverAccent.cp1, uncoverAccent.cp2, uncoverAccent.yR))
      }, '<0.06');

    // ------------------------------------------------------------------------
    // ROUTE 4: TESTIMONIALS -> HORIZONTAL FLOW (LEFT TO RIGHT)
    // ------------------------------------------------------------------------
    } else if (targetView === 'testimonials') {
      liquidPathAccent.setAttribute('d', pathWaveHorizCover(0, 0, 0, 0));
      liquidPathDark.setAttribute('d', pathWaveHorizCover(0, 0, 0, 0));

      const coverAccent = { x1: 0, cp1: 0, cp2: 0, x2: 0 };
      const coverDark = { x1: 0, cp1: 0, cp2: 0, x2: 0 };
      const uncoverDark = { x1: 0, cp1: 0, cp2: 0, x2: 0 };
      const uncoverAccent = { x1: 0, cp1: 0, cp2: 0, x2: 0 };

      tl.to(coverAccent, {
        x1: 100, cp1: 128, cp2: 122, x2: 100, duration: 0.38, ease: 'power3.in',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveHorizCover(coverAccent.x1, coverAccent.cp1, coverAccent.cp2, coverAccent.x2))
      }, 0);

      tl.to(coverDark, {
        x1: 100, cp1: 132, cp2: 124, x2: 100, duration: 0.42, ease: 'power3.in',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveHorizCover(coverDark.x1, coverDark.cp1, coverDark.cp2, coverDark.x2))
      }, 0.05);

      tl.to(coverDark, {
        cp1: 100, cp2: 100, duration: 0.05, ease: 'power1.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveHorizCover(coverDark.x1, coverDark.cp1, coverDark.cp2, coverDark.x2))
      });

      tl.add(() => {
        onMidpointSwitch();
        liquidPathDark.setAttribute('d', pathWaveHorizUncover(0, 0, 0, 0));
        liquidPathAccent.setAttribute('d', pathWaveHorizUncover(0, 0, 0, 0));
      });

      tl.to(uncoverDark, {
        x1: 100, cp1: 128, cp2: 120, x2: 100, duration: 0.40, ease: 'power3.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveHorizUncover(uncoverDark.x1, uncoverDark.cp1, uncoverDark.cp2, uncoverDark.y2 || uncoverDark.x2))
      });

      tl.to(uncoverAccent, {
        x1: 100, cp1: 132, cp2: 124, x2: 100, duration: 0.42, ease: 'power3.out',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveHorizUncover(uncoverAccent.x1, uncoverAccent.cp1, uncoverAccent.cp2, uncoverAccent.x2))
      }, '<0.06');

    // ------------------------------------------------------------------------
    // ROUTE 5: CONTACT -> DUAL LIQUID CURTAIN (MEET & PART)
    // ------------------------------------------------------------------------
    } else if (targetView === 'contact') {
      liquidPathAccent.setAttribute('d', pathCurtain(0, 0, 0, 0));
      liquidPathDark.setAttribute('d', pathCurtain(0, 0, 0, 0));

      const coverAccent = { wL: 0, cpL: 0, cpR: 0, wR: 0 };
      const coverDark = { wL: 0, cpL: 0, cpR: 0, wR: 0 };
      const uncoverDark = { wL: 52, cpL: 64, cpR: 64, wR: 52 };
      const uncoverAccent = { wL: 55, cpL: 68, cpR: 68, wR: 55 };

      tl.to(coverAccent, {
        wL: 55, cpL: 68, cpR: 68, wR: 55, duration: 0.38, ease: 'power3.in',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathCurtain(coverAccent.wL, coverAccent.cpL, coverAccent.cpR, coverAccent.wR))
      }, 0);

      tl.to(coverDark, {
        wL: 52, cpL: 64, cpR: 64, wR: 52, duration: 0.42, ease: 'power3.in',
        onUpdate: () => liquidPathDark.setAttribute('d', pathCurtain(coverDark.wL, coverDark.cpL, coverDark.cpR, coverDark.wR))
      }, 0.05);

      tl.to(coverDark, {
        cpL: 50, cpR: 50, duration: 0.05, ease: 'power1.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathCurtain(coverDark.wL, coverDark.cpL, coverDark.cpR, coverDark.wR))
      });

      tl.add(() => {
        onMidpointSwitch();
        liquidPathDark.setAttribute('d', pathCurtain(52, 64, 64, 52));
        liquidPathAccent.setAttribute('d', pathCurtain(55, 68, 68, 55));
      });

      tl.to(uncoverDark, {
        wL: 0, cpL: 0, cpR: 0, wR: 0, duration: 0.40, ease: 'power3.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathCurtain(uncoverDark.wL, uncoverDark.cpL, uncoverDark.cpR, uncoverDark.wR))
      });

      tl.to(uncoverAccent, {
        wL: 0, cpL: 0, cpR: 0, wR: 0, duration: 0.42, ease: 'power3.out',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathCurtain(uncoverAccent.wL, uncoverAccent.cpL, uncoverAccent.cpR, uncoverAccent.wR))
      }, '<0.06');

    // ------------------------------------------------------------------------
    // ROUTE 6: HOME -> INVERSE DIAGONAL SWEEP (TOP-RIGHT TO BOTTOM-LEFT)
    // ------------------------------------------------------------------------
    } else {
      liquidPathAccent.setAttribute('d', pathWaveInvDiagCover(100, 100, 100, 100));
      liquidPathDark.setAttribute('d', pathWaveInvDiagCover(100, 100, 100, 100));

      const coverAccent = { yL: 100, cp1: 100, cp2: 100, yR: 100 };
      const coverDark = { yL: 100, cp1: 100, cp2: 100, yR: 100 };
      const uncoverDark = { yL: 100, cp1: 100, cp2: 100, yR: 100 };
      const uncoverAccent = { yL: 100, cp1: 100, cp2: 100, yR: 100 };

      tl.to(coverAccent, {
        yL: 0, cp1: 6, cp2: -18, yR: -25, duration: 0.38, ease: 'power3.in',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveInvDiagCover(coverAccent.yL, coverAccent.cp1, coverAccent.cp2, coverAccent.yR))
      }, 0);

      tl.to(coverDark, {
        yL: 0, cp1: 2, cp2: -22, yR: -30, duration: 0.42, ease: 'power3.in',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveInvDiagCover(coverDark.yL, coverDark.cp1, coverDark.cp2, coverDark.yR))
      }, 0.05);

      tl.to(coverDark, {
        yL: 0, cp1: 0, cp2: 0, yR: 0, duration: 0.05, ease: 'power1.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveInvDiagCover(coverDark.yL, coverDark.cp1, coverDark.cp2, coverDark.yR))
      });

      tl.add(() => {
        onMidpointSwitch();
        liquidPathDark.setAttribute('d', pathWaveInvDiagUncover(100, 100, 100, 100));
        liquidPathAccent.setAttribute('d', pathWaveInvDiagUncover(100, 100, 100, 100));
      });

      tl.to(uncoverDark, {
        yL: -25, cp1: -18, cp2: 6, yR: 0, duration: 0.40, ease: 'power3.out',
        onUpdate: () => liquidPathDark.setAttribute('d', pathWaveInvDiagUncover(uncoverDark.yL, uncoverDark.cp1, uncoverDark.cp2, uncoverDark.yR))
      });

      tl.to(uncoverAccent, {
        yL: -30, cp1: -24, cp2: 2, yR: 0, duration: 0.42, ease: 'power3.out',
        onUpdate: () => liquidPathAccent.setAttribute('d', pathWaveInvDiagUncover(uncoverAccent.yL, uncoverAccent.cp1, uncoverAccent.cp2, uncoverAccent.yR))
      }, '<0.06');
    }
  }

  function switchContentView(targetView) {
    contentViews.forEach(view => {
      if (view.dataset.view === targetView) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
  }

  // Event Listeners for Nav Links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.target);
    });
  });

  dockItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.target);
    });
  });

  curvedNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const btn = item.querySelector('.c-nav-btn');
      if (btn) {
        gsap.fromTo(btn, 
          { scale: 0.88 }, 
          { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }
        );
      }
      navigateTo(item.dataset.target);
    });
  });

  navTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(btn.dataset.target);
    });
  });

  // --------------------------------------------------------------------------
  // 2. ANIMATED NUMBER COUNTERS (About Me View)
  // --------------------------------------------------------------------------
  let countersAnimated = false;
  function animateCounters() {
    const statNums = document.querySelectorAll('.stat-num');
    statNums.forEach(el => {
      const targetVal = parseInt(el.dataset.val, 10);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };
      el.textContent = '0' + suffix;

      gsap.to(obj, {
        val: targetVal,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = Math.floor(obj.val) + suffix;
        }
      });
    });
    countersAnimated = true;
  }

  // --------------------------------------------------------------------------
  // 3. PORTFOLIO CATEGORY FILTERING
  // --------------------------------------------------------------------------
  const filterTabs = document.querySelectorAll('.filter-tab');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      let visibleIndex = 0;
      portfolioCards.forEach(card => {
        const cat = card.dataset.category;
        const matches = (filter === 'all' || cat === filter);

        if (matches) {
          card.style.display = 'block';
          gsap.fromTo(card, 
            { opacity: 0, scale: 0.94, y: 22 }, 
            { 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              duration: 0.38, 
              delay: visibleIndex * 0.04,
              ease: 'back.out(1.4)',
              onComplete: () => {
                card.style.opacity = '1';
                card.style.transform = '';
              }
            }
          );
          visibleIndex++;
        } else {
          card.style.display = 'none';
        }
      });

      if (typeof updateCardParallax === 'function') {
        setTimeout(updateCardParallax, 50);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3b. SKILLS CATEGORY FILTERING
  // --------------------------------------------------------------------------
  const skillsFilterBtns = document.querySelectorAll('.skills-filter-btn');
  const skillCardsList = document.querySelectorAll('.skill-card');

  skillsFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      skillsFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visibleIndex = 0;

      skillCardsList.forEach(card => {
        const cat = card.dataset.category;
        const matches = (filter === 'all' || cat === filter);

        if (matches) {
          card.style.display = 'flex';
          gsap.killTweensOf(card);
          gsap.fromTo(card,
            { opacity: 0, scale: 0.95, y: 16 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.32,
              delay: visibleIndex * 0.03,
              ease: 'back.out(1.4)',
              onComplete: () => {
                card.style.opacity = '1';
                card.style.transform = '';
              }
            }
          );
          visibleIndex++;
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 4. PORTFOLIO LIGHTBOX PREVIEW
  // --------------------------------------------------------------------------
  const lightbox = document.getElementById('portfolioLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxOverlay = document.getElementById('lightboxOverlay');

  portfolioCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgPath = card.dataset.img;
      const title = card.dataset.title;

      if (imgPath && lightbox) {
        lightboxImg.src = imgPath;
        lightboxTitle.textContent = title;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
      }
    });
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // --------------------------------------------------------------------------
  // 5. CONTACT FORM INTERACTION
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const btnToggleForm = document.getElementById('btnToggleForm');
  const formFeedback = document.getElementById('formFeedback');

  if (btnToggleForm && contactForm) {
    btnToggleForm.addEventListener('click', () => {
      contactForm.classList.toggle('open');
      if (contactForm.classList.contains('open')) {
        btnToggleForm.textContent = 'HIDE FORM';
        gsap.fromTo(contactForm, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.25 });
      } else {
        btnToggleForm.textContent = 'WRITE A MESSAGE';
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnSubmitMsg');
      btn.disabled = true;
      btn.textContent = 'SENDING...';

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'SEND MESSAGE';
        formFeedback.textContent = '✓ Message sent successfully!';
        contactForm.reset();

        setTimeout(() => {
          formFeedback.textContent = '';
        }, 4000);
      }, 700);
    });
  }

  // --------------------------------------------------------------------------
  // 6. MOBILE DRAWER & HAMBURGER TOGGLE
  // --------------------------------------------------------------------------
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileBackdrop = document.getElementById('mobileBackdrop');
  const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');

  function openMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('open');
    if (mobileNavToggle) mobileNavToggle.classList.add('open');
  }

  function closeMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('open');
    if (mobileNavToggle) mobileNavToggle.classList.remove('open');
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileMenu);
  }

  mobileMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      navigateTo(item.dataset.target);
      
      mobileMenuItems.forEach(m => m.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // --------------------------------------------------------------------------
  // 7. SUBTLE HERO PARALLAX (MOUSEMOVE)
  // --------------------------------------------------------------------------
  const heroImg = document.getElementById('heroImg');
  const homeRight = document.querySelector('.home-right');

  if (homeRight && heroImg && window.matchMedia('(hover: hover)').matches) {
    homeRight.addEventListener('mousemove', (e) => {
      const rect = homeRight.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(heroImg, {
        x: x * 10,
        y: y * 8,
        duration: 0.5,
        ease: 'power1.out'
      });
    });

    homeRight.addEventListener('mouseleave', () => {
      gsap.to(heroImg, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. CONTINUOUS CARD SCROLL PARALLAX ENGINE
  // --------------------------------------------------------------------------
  let isTicking = false;
  function onScrollParallax() {
    if (!isTicking) {
      requestAnimationFrame(() => {
        updateCardParallax();
        isTicking = false;
      });
      isTicking = true;
    }
  }

  function updateCardParallax() {
    const activePortfolio = document.getElementById('view-portfolio');
    if (!activePortfolio || !activePortfolio.classList.contains('active')) return;

    const cards = activePortfolio.querySelectorAll('.portfolio-card');
    const viewportHeight = window.innerHeight;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < viewportHeight + 60 && rect.bottom > -60) {
        const cardCenter = rect.top + rect.height / 2;
        const screenCenter = viewportHeight / 2;
        const offset = ((cardCenter - screenCenter) / screenCenter) * 18;
        const img = card.querySelector('.parallax-img');
        if (img) {
          img.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        }
      }
    });
  }

  window.addEventListener('scroll', onScrollParallax, { passive: true });
  if (mainContent) {
    mainContent.addEventListener('scroll', onScrollParallax, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 9. 3D INTERACTIVE CARD TILT PHYSICS (Desktop Hover Only)
  // --------------------------------------------------------------------------
  function setup3DCardTilt() {
    // Only run on desktop devices with hover & fine pointers to ensure 100% smooth mobile scrolling
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    portfolioCards.forEach(card => {
      let bounds = null;

      function onEnter() {
        bounds = card.getBoundingClientRect();
      }

      function onMove(e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        if (clientX === undefined || clientY === undefined) return;

        const x = clientX - bounds.left;
        const y = clientY - bounds.top;
        const xPct = (x / bounds.width - 0.5) * 2;
        const yPct = (y / bounds.height - 0.5) * 2;

        const rotateX = -yPct * 5;
        const rotateY = xPct * 5;

        card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
      }

      function onLeave() {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        bounds = null;
      }

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  setup3DCardTilt();

  // --------------------------------------------------------------------------
  // 10. LIVING AMBIENT AURA & HERO BREATHING PARALLAX
  // --------------------------------------------------------------------------
  const ambientGlow = document.getElementById('ambientGlowMesh');
  if (ambientGlow) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return; // Don't trigger during mobile touch gestures
      const moveX = (e.clientX / window.innerWidth - 0.5) * 35;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 35;
      gsap.to(ambientGlow, {
        x: moveX,
        y: moveY,
        duration: 1.4,
        ease: 'power1.out'
      });
    }, { passive: true });
  }

  if (heroImg) {
    gsap.to(heroImg, {
      y: -8,
      scale: 1.02,
      duration: 3.6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
});
