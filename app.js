/**
 * Limitless Life RP - Main JavaScript
 *
 */

// Configuration
const CONFIG = {
  SERVER_IP: '46.151.199.8',
  SERVER_PORT: '40120',
  // Optional proxy URL for CORS bypass - set this if you have a proxy setup
  PROXY_URL: '', // e.g., 'https://your-proxy-worker.your-subdomain.workers.dev/'
  STATUS_UPDATE_INTERVAL: 30000, // 30 seconds
  TOAST_DURATION: 3000, // 3 seconds
  SMOOTH_SCROLL_OFFSET: 80 // Header height offset
};

// State management
const state = {
  isMenuOpen: false,
  statusUpdateTimer: null,
  lastStatusCheck: 0
};

// DOM elements cache
const elements = {};

/**
 * Initialize the application
 */
function init() {
  console.log('Initializing Limitless Life RP website...');
  
  // Cache DOM elements
  cacheElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize components
  initNavigation();
  initServerStatus();
  initAccordions();
  initGallery();
  initLightbox();
  
  // Set up keyboard navigation
  setupKeyboardNavigation();
  
  console.log('Limitless Life RP website initialized successfully');
}

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
  elements.navToggle = document.getElementById('nav-toggle');
  elements.navMenu = document.getElementById('nav-menu');
  elements.navLinks = document.querySelectorAll('.nav__link');
  elements.joinFivemBtn = document.getElementById('join-fivem');
  elements.quickConnectBtn = document.getElementById('quick-connect');
  elements.copyIpBtn = document.getElementById('copy-ip');
  elements.serverIpText = document.getElementById('server-ip');
  elements.statusCard = document.getElementById('status-card');
  elements.statusIndicator = document.getElementById('status-indicator');
  elements.playerCount = document.getElementById('player-count');
  elements.serverName = document.getElementById('server-name');
  elements.accordionHeaders = document.querySelectorAll('.accordion__header');
  elements.galleryItems = document.querySelectorAll('.gallery__item');
  elements.lightbox = document.getElementById('lightbox');
  elements.lightboxImage = document.getElementById('lightbox-image');
  elements.lightboxClose = document.getElementById('lightbox-close');
  elements.lightboxOverlay = document.getElementById('lightbox-overlay');
  elements.copyToast = document.getElementById('copy-toast');

  // Get status elements more safely
  if (elements.statusIndicator) {
    elements.statusDot = elements.statusIndicator.querySelector('.status__dot');
    elements.statusText = elements.statusIndicator.querySelector('.status__text');
  }

  console.log('DOM elements cached:', {
    navToggle: !!elements.navToggle,
    joinFivemBtn: !!elements.joinFivemBtn,
    accordionHeaders: elements.accordionHeaders.length,
    navLinks: elements.navLinks.length
  });
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  console.log('Setting up event listeners...');

  // Navigation
  if (elements.navToggle) {
    elements.navToggle.addEventListener('click', toggleMobileMenu);
    console.log('Mobile menu toggle listener added');
  }

  elements.navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
  });

  // FiveM connection buttons
  if (elements.joinFivemBtn) {
    elements.joinFivemBtn.addEventListener('click', connectToFiveM);
    console.log('Join FiveM button listener added');
  }
  
  if (elements.quickConnectBtn) {
    elements.quickConnectBtn.addEventListener('click', connectToFiveM);
    console.log('Quick connect button listener added');
  }

  // Copy IP functionality
  if (elements.copyIpBtn) {
    elements.copyIpBtn.addEventListener('click', copyServerIp);
    console.log('Copy IP button listener added');
  }

  // Accordion functionality
  elements.accordionHeaders.forEach((header, index) => {
    header.addEventListener('click', toggleAccordion);
    console.log(`Accordion header ${index + 1} listener added`);
  });

  // Gallery lightbox
  elements.galleryItems.forEach(item => {
    item.addEventListener('click', openLightbox);
  });

  // Lightbox close
  if (elements.lightboxClose) {
    elements.lightboxClose.addEventListener('click', closeLightbox);
  }
  if (elements.lightboxOverlay) {
    elements.lightboxOverlay.addEventListener('click', closeLightbox);
  }

  // Keyboard events
  document.addEventListener('keydown', handleKeydown);

  // Window events
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);

  // Page visibility for status updates
  document.addEventListener('visibilitychange', handleVisibilityChange);

  console.log('Event listeners setup complete');
}

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  console.log('Initializing navigation...');

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (state.isMenuOpen && 
        elements.navToggle && 
        !elements.navToggle.contains(e.target) && 
        !elements.navMenu.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      
      console.log('Smooth scroll to:', targetId, 'Target found:', !!target);
      
      if (target) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || CONFIG.SMOOTH_SCROLL_OFFSET;
        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        closeMobileMenu();
        
        // Update active nav link
        elements.navLinks.forEach(link => link.classList.remove('active'));
        anchor.classList.add('active');
      }
    });
  });

  console.log('Navigation initialized');
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  if (!elements.navToggle || !elements.navMenu) return;
  
  state.isMenuOpen = !state.isMenuOpen;
  
  elements.navMenu.classList.toggle('active', state.isMenuOpen);
  elements.navToggle.setAttribute('aria-expanded', state.isMenuOpen.toString());
  
  console.log('Mobile menu toggled:', state.isMenuOpen);
  
  // Animate hamburger lines
  const lines = elements.navToggle.querySelectorAll('.nav__toggle-line');
  if (state.isMenuOpen) {
    lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
    lines[1].style.opacity = '0';
    lines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
  } else {
    lines[0].style.transform = '';
    lines[1].style.opacity = '';
    lines[2].style.transform = '';
  }

  // Prevent body scroll when menu is open
  document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  if (state.isMenuOpen) {
    toggleMobileMenu();
  }
}

/**
 * Handle navigation link clicks
 */
function handleNavClick(e) {
  console.log('Nav link clicked:', e.target.textContent);
  closeMobileMenu();
}

/**
 * Connect to FiveM server
 */
function connectToFiveM(e) {
  e.preventDefault();
  console.log('Connecting to FiveM server...');
  
  const serverUrl = `fivem://connect/${CONFIG.SERVER_IP}:${CONFIG.SERVER_PORT}`;
  
  try {
    // Create a temporary anchor to trigger the FiveM protocol
    const link = document.createElement('a');
    link.href = serverUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success toast
    showToast('Launching FiveM... If it doesn\'t open, try copying the IP manually.', 'success');
    
    console.log('FiveM launch attempted with URL:', serverUrl);
    
    // Fallback: show copy option after delay
    setTimeout(() => {
      if (confirm('FiveM didn\'t launch automatically? Click OK to copy the server IP to your clipboard.')) {
        copyServerIp();
      }
    }, 3000);
  } catch (error) {
    console.error('Error launching FiveM:', error);
    showToast('Error launching FiveM. Please copy the IP manually.', 'error');
    copyServerIp();
  }
}

/**
 * Copy server IP to clipboard
 */
async function copyServerIp(e) {
  if (e) e.preventDefault();
  
  const serverIp = `${CONFIG.SERVER_IP}:${CONFIG.SERVER_PORT}`;
  console.log('Copying server IP:', serverIp);
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern async clipboard API
      await navigator.clipboard.writeText(serverIp);
      showToast('Server IP copied to clipboard!', 'success');
      console.log('Server IP copied successfully');
    } else {
      // Fallback for older browsers or non-secure context
      const textArea = document.createElement('textarea');
      textArea.value = serverIp;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      if (document.execCommand('copy')) {
        showToast('Server IP copied to clipboard!', 'success');
        console.log('Server IP copied using fallback method');
      } else {
        throw new Error('Copy command failed');
      }
      
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error('Failed to copy server IP:', error);
    showToast(`Failed to copy. Server IP: ${serverIp}`, 'error');
    
    // Show the IP in a prompt as final fallback
    prompt('Copy this server IP:', serverIp);
  }
}

/**
 * Initialize server status monitoring
 */
function initServerStatus() {
  console.log('Initializing server status monitoring...');
  
  // Initial status check
  updateServerStatus();
  
  // Set up periodic updates
  state.statusUpdateTimer = setInterval(updateServerStatus, CONFIG.STATUS_UPDATE_INTERVAL);
  
  console.log('Server status monitoring initialized');
}

/**
 * Update server status from FiveM API
 */
async function updateServerStatus() {
  // Prevent too frequent updates
  const now = Date.now();
  if (now - state.lastStatusCheck < 5000) return;
  state.lastStatusCheck = now;

  console.log('Updating server status...');

  try {
    // Update UI to show checking state
    updateStatusUI('checking', 'Checking...', '--');

    // Try to fetch server info
    const serverInfo = await fetchServerInfo();
    const playerInfo = await fetchPlayerInfo();

    if (serverInfo || playerInfo) {
      const playerCount = playerInfo?.length || serverInfo?.players || 0;
      const serverName = serverInfo?.hostname || 'Limitless Life RP';
      
      updateStatusUI('online', 'Online', playerCount, serverName);
      console.log('Server status updated:', { playerCount, serverName });
    } else {
      throw new Error('No server data available');
    }
  } catch (error) {
    console.warn('Server status check failed:', error.message);
    updateStatusUI('offline', 'Status Unavailable', '--', 'Limitless Life RP');
    
    // Show CORS information in console for developers
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      console.info(`
🔒 CORS Notice: Direct server status fetching is blocked by browser security.
This is normal for static websites. To enable live status:

1. Set up a proxy (Cloudflare Worker, Netlify Function, etc.)
2. Update CONFIG.PROXY_URL in app.js
3. Or use server-side rendering

Current fallback: Manual status display
      `);
    }
  }
}

/**
 * Fetch server information from FiveM API
 */
async function fetchServerInfo() {
  const baseUrl = CONFIG.PROXY_URL || `http://${CONFIG.SERVER_IP}:${CONFIG.SERVER_PORT}`;
  const url = CONFIG.PROXY_URL ? `${baseUrl}/info.json` : `${baseUrl}/info.json`;
  
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Fetch player information from FiveM API
 */
async function fetchPlayerInfo() {
  const baseUrl = CONFIG.PROXY_URL || `http://${CONFIG.SERVER_IP}:${CONFIG.SERVER_PORT}`;
  const url = CONFIG.PROXY_URL ? `${baseUrl}/players.json` : `${baseUrl}/players.json`;
  
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const players = await response.json();
  
  // Note: Some player identifiers may be restricted by FiveM API changes
  // We only use safe data like player count and names (if available)
  return Array.isArray(players) ? players : [];
}

/**
 * Update status UI elements
 */
function updateStatusUI(status, statusText, playerCount, serverName) {
  if (!elements.statusDot || !elements.statusText || !elements.playerCount) {
    console.log('Status UI elements not found');
    return;
  }

  // Update status indicator
  elements.statusDot.className = 'status__dot';
  if (status === 'offline' || status === 'checking') {
    elements.statusDot.classList.add('offline');
  }
  
  elements.statusText.textContent = statusText;

  // Update player count
  if (elements.playerCount) {
    elements.playerCount.textContent = playerCount;
  }

  // Update server name
  if (elements.serverName && serverName) {
    elements.serverName.textContent = serverName;
  }

  // Add visual feedback for status changes
  if (elements.statusCard) {
    elements.statusCard.classList.add('status-updated');
    setTimeout(() => {
      elements.statusCard.classList.remove('status-updated');
    }, 1000);
  }

  console.log('Status UI updated:', { status, statusText, playerCount, serverName });
}

/**
 * Initialize accordion functionality
 */
function initAccordions() {
  console.log('Initializing accordions...');
  
  elements.accordionHeaders.forEach((header, index) => {
    // Ensure proper ARIA attributes
    header.setAttribute('aria-expanded', 'false');
    const content = header.nextElementSibling;
    if (content) {
      content.setAttribute('aria-hidden', 'true');
      content.classList.remove('open'); // Ensure closed by default
    }
    console.log(`Accordion ${index + 1} initialized`);
  });
  
  console.log(`${elements.accordionHeaders.length} accordions initialized`);
}

/**
 * Toggle accordion item
 */
function toggleAccordion(e) {
  e.preventDefault();
  const header = e.currentTarget;
  const content = header.nextElementSibling;
  const isExpanded = header.getAttribute('aria-expanded') === 'true';

  console.log('Toggling accordion:', header.textContent.trim(), 'Currently expanded:', isExpanded);

  // Close all other accordions in the same container
  const container = header.closest('.accordion');
  const otherHeaders = container.querySelectorAll('.accordion__header');
  otherHeaders.forEach(otherHeader => {
    if (otherHeader !== header) {
      otherHeader.setAttribute('aria-expanded', 'false');
      const otherContent = otherHeader.nextElementSibling;
      if (otherContent) {
        otherContent.classList.remove('open');
        otherContent.setAttribute('aria-hidden', 'true');
      }
    }
  });

  // Toggle current accordion
  header.setAttribute('aria-expanded', (!isExpanded).toString());
  if (content) {
    content.classList.toggle('open', !isExpanded);
    content.setAttribute('aria-hidden', isExpanded.toString());
    console.log('Accordion content toggled:', !isExpanded);
  }
}

/**
 * Initialize gallery functionality
 */
function initGallery() {
  console.log('Initializing gallery...');
  
  // Add keyboard support for gallery items
  elements.galleryItems.forEach((item, index) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(e);
      }
    });
    console.log(`Gallery item ${index + 1} initialized`);
  });
  
  console.log(`${elements.galleryItems.length} gallery items initialized`);
}

/**
 * Initialize lightbox functionality
 */
function initLightbox() {
  if (!elements.lightbox) {
    console.log('Lightbox element not found');
    return;
  }

  console.log('Initializing lightbox...');

  // Set up ARIA attributes
  elements.lightbox.setAttribute('aria-modal', 'true');
  elements.lightbox.setAttribute('role', 'dialog');
  elements.lightbox.setAttribute('aria-label', 'Image lightbox');
  
  console.log('Lightbox initialized');
}

/**
 * Open lightbox with image
 */
function openLightbox(e) {
  const item = e.currentTarget;
  const imageName = item.dataset.image;
  
  console.log('Opening lightbox for:', imageName);
  
  if (!imageName || !elements.lightbox) return;

  // For demo purposes, we'll show a placeholder message
  // In production, you would load the actual image
  const placeholderText = item.querySelector('span')?.textContent || 'Screenshot';
  
  // Create a placeholder image or load actual image
  const imageUrl = `/assets/img/screenshots/${imageName}.jpg`; // Adjust path as needed
  
  elements.lightboxImage.src = imageUrl;
  elements.lightboxImage.alt = placeholderText;
  elements.lightbox.classList.add('active');
  elements.lightbox.setAttribute('aria-hidden', 'false');
  
  // Focus management
  if (elements.lightboxClose) {
    elements.lightboxClose.focus();
  }
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Handle image load error (for demo)
  elements.lightboxImage.onerror = () => {
    elements.lightboxImage.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'lightbox__placeholder';
    placeholder.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.8);">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="opacity: 0.5; margin-bottom: 1rem;">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <h3 style="color: #00ffff; margin: 0 0 0.5rem 0;">${placeholderText}</h3>
        <p style="margin: 0; font-size: 0.9rem;">Screenshot preview will be available soon</p>
      </div>
    `;
    elements.lightboxImage.parentNode.appendChild(placeholder);
  };

  console.log('Lightbox opened');
}

/**
 * Close lightbox
 */
function closeLightbox() {
  if (!elements.lightbox) return;

  console.log('Closing lightbox');

  elements.lightbox.classList.remove('active');
  elements.lightbox.setAttribute('aria-hidden', 'true');
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  // Clean up placeholder if it exists
  const placeholder = elements.lightbox.querySelector('.lightbox__placeholder');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Reset image display
  if (elements.lightboxImage) {
    elements.lightboxImage.style.display = '';
    elements.lightboxImage.onerror = null;
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  if (!elements.copyToast) {
    console.log('Toast element not found');
    return;
  }

  console.log('Showing toast:', message, type);

  const icon = elements.copyToast.querySelector('.toast__icon');
  const text = elements.copyToast.querySelector('.toast__text');
  
  // Update content
  if (text) text.textContent = message;
  
  // Update icon based on type
  if (icon) {
    if (type === 'error') {
      icon.innerHTML = `
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
      `;
      icon.style.color = '#ff4444';
    } else {
      icon.innerHTML = `<polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2"/>`;
      icon.style.color = '#00ff00';
    }
  }

  // Show toast
  elements.copyToast.classList.add('show');
  elements.copyToast.setAttribute('aria-hidden', 'false');

  // Hide after duration
  setTimeout(() => {
    elements.copyToast.classList.remove('show');
    elements.copyToast.setAttribute('aria-hidden', 'true');
  }, CONFIG.TOAST_DURATION);
}

/**
 * Handle keyboard navigation
 */
function setupKeyboardNavigation() {
  console.log('Setting up keyboard navigation...');
  
  // Add keyboard support for custom interactive elements
  document.querySelectorAll('[role="button"]:not(button)').forEach(element => {
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        element.click();
      }
    });
  });
  
  console.log('Keyboard navigation setup complete');
}

/**
 * Handle global keyboard events
 */
function handleKeydown(e) {
  // Close lightbox with Escape
  if (e.key === 'Escape') {
    if (elements.lightbox?.classList.contains('active')) {
      closeLightbox();
    } else if (state.isMenuOpen) {
      closeMobileMenu();
    }
  }
}

/**
 * Handle window resize
 */
function handleResize() {
  // Close mobile menu on desktop
  if (window.innerWidth > 768 && state.isMenuOpen) {
    closeMobileMenu();
  }
}

/**
 * Handle window scroll
 */
function handleScroll() {
  // Add header background on scroll
  const header = document.querySelector('.header');
  if (header) {
    const scrolled = window.scrollY > 50;
    header.style.background = scrolled 
      ? 'rgba(10, 10, 10, 0.3)' 
      : 'rgba(10, 10, 10, 0.15)';
  }

  // Update active navigation link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop <= CONFIG.SMOOTH_SCROLL_OFFSET + 100) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/**
 * Handle page visibility changes
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden, pause status updates
    if (state.statusUpdateTimer) {
      clearInterval(state.statusUpdateTimer);
    }
  } else {
    // Page is visible, resume status updates
    if (!state.statusUpdateTimer) {
      state.statusUpdateTimer = setInterval(updateServerStatus, CONFIG.STATUS_UPDATE_INTERVAL);
    }
    // Update immediately when page becomes visible
    updateServerStatus();
  }
}

/**
 * Cleanup function
 */
function cleanup() {
  if (state.statusUpdateTimer) {
    clearInterval(state.statusUpdateTimer);
  }
  
  // Remove event listeners
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Error handling
 */
window.addEventListener('error', (e) => {
  console.error('Application error:', e.error);
  // In production, you might want to report errors to a service
});

/**
 * Unhandled promise rejection handling
 */
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  e.preventDefault(); // Prevent default browser error handling
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Export for potential testing or debugging
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    init,
    updateServerStatus,
    connectToFiveM,
    copyServerIp
  };
}