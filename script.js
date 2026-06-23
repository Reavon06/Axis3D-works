/* ============================================================
   AXIS 3D WORKS — script.js
   Premium Glassmorphism Portfolio
   ============================================================

   CONFIGURATION — edit these to point at your GitHub repo:
   ──────────────────────────────────────────────────────────
   GITHUB_USER  : your GitHub username
   GITHUB_REPO  : your repository name
   IMAGES_PATH  : path inside the repo where images/ folder lives (leave '' for root)
   GITHUB_TOKEN : optional personal access token (increases rate limit from 60 → 5000/hr)

   Folder structure expected in your repo:
     images/
       awards/
       products/
       laser/
       sculptures/
       interiors/
       prototypes/
   ============================================================ */

const CONFIG = {
  GITHUB_USER:  'Reavon06',
  GITHUB_REPO:  'Axis3D-works',
  IMAGES_PATH:  'images', // path inside repo, usually 'images'
  GITHUB_TOKEN: '',       // optional — leave empty for public repos up to 60 req/hr

  /* Supported image extensions */
  IMAGE_EXTS: ['jpg','jpeg','png','webp','gif','avif','bmp'],

  /* How many items to render per batch (infinite scroll) */
  BATCH_SIZE: 16,

  /* Category order for filters */
  CATEGORIES: ['awards','products','laser','sculptures','interiors','prototypes'],
};

/* ── Demo images (used when GitHub repo is not configured) ── */
const DEMO_IMAGES = [
  { src: 'https://picsum.photos/seed/laser1/600/800',  category: 'laser',      title: 'Laser Cut Precision Panel' },
  { src: 'https://picsum.photos/seed/sculp1/500/700',  category: 'sculptures', title: 'Abstract Steel Form' },
  { src: 'https://picsum.photos/seed/inter1/800/500',  category: 'interiors',  title: 'Architectural Interior Detail' },
  { src: 'https://picsum.photos/seed/prod1/600/600',   category: 'products',   title: 'Precision Engineered Component' },
  { src: 'https://picsum.photos/seed/award1/700/500',  category: 'awards',     title: 'Excellence Award Trophy' },
  { src: 'https://picsum.photos/seed/proto1/600/750',  category: 'prototypes', title: '3D Printed Prototype Model' },
  { src: 'https://picsum.photos/seed/laser2/700/500',  category: 'laser',      title: 'Intricate Laser Engraving' },
  { src: 'https://picsum.photos/seed/sculp2/500/800',  category: 'sculptures', title: 'Geometric Aluminum Sculpture' },
  { src: 'https://picsum.photos/seed/inter2/800/600',  category: 'interiors',  title: 'Custom Interior Millwork' },
  { src: 'https://picsum.photos/seed/prod2/600/450',   category: 'products',   title: 'Industrial Product Design' },
  { src: 'https://picsum.photos/seed/award2/700/600',  category: 'awards',     title: 'Manufacturing Excellence Prize' },
  { src: 'https://picsum.photos/seed/proto2/600/700',  category: 'prototypes', title: 'Rapid Prototype Assembly' },
  { src: 'https://picsum.photos/seed/laser3/800/600',  category: 'laser',      title: 'CNC Router Decorative Panel' },
  { src: 'https://picsum.photos/seed/sculp3/600/900',  category: 'sculptures', title: 'Welded Metal Wall Art' },
  { src: 'https://picsum.photos/seed/inter3/800/550',  category: 'interiors',  title: 'Bespoke Reception Feature Wall' },
  { src: 'https://picsum.photos/seed/prod3/550/700',   category: 'products',   title: 'Medical Device Component' },
  { src: 'https://picsum.photos/seed/award3/700/500',  category: 'awards',     title: 'Innovation Award Piece' },
  { src: 'https://picsum.photos/seed/proto3/600/800',  category: 'prototypes', title: 'Concept Prototype Series A' },
  { src: 'https://picsum.photos/seed/laser4/650/500',  category: 'laser',      title: 'Stainless Steel Laser Cut Facade' },
  { src: 'https://picsum.photos/seed/sculp4/500/650',  category: 'sculptures', title: 'Organic Form Cast Bronze' },
  { src: 'https://picsum.photos/seed/inter4/800/600',  category: 'interiors',  title: 'Hospitality Interior Feature' },
  { src: 'https://picsum.photos/seed/prod4/600/500',   category: 'products',   title: 'Aerospace Grade Component' },
  { src: 'https://picsum.photos/seed/award4/700/550',  category: 'awards',     title: 'Design Award Collection' },
  { src: 'https://picsum.photos/seed/proto4/600/750',  category: 'prototypes', title: 'Functional Prototype v2' },
];

/* ── State ── */
let allItems = [];         // full list (filtered or not)
let filteredItems = [];    // currently visible items
let renderedCount = 0;     // how many we've added to DOM
let activeCategory = 'all';
let lightboxIndex = 0;

/* ── DOM references ── */
const grid       = document.getElementById('masonry-grid');
const loader     = document.getElementById('gallery-loader');
const emptyState = document.getElementById('gallery-empty');
const sentinel   = document.getElementById('scroll-sentinel');
const lbEl       = document.getElementById('lightbox');
const lbImg      = document.getElementById('lightbox-img');
const lbSpinner  = document.getElementById('lightbox-spinner');
const lbCat      = document.getElementById('lightbox-category');
const lbTitle    = document.getElementById('lightbox-title');
const lbCounter  = document.getElementById('lightbox-counter');
const lbThumbs   = document.getElementById('lightbox-thumbs');
const lbPrev     = document.getElementById('lightbox-prev');
const lbNext     = document.getElementById('lightbox-next');
const banner     = null; // removed

/* ── Particles ── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      o:  Math.random() * 0.5 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

/* ── Nav scroll behaviour ── */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile menu ── */
const menuToggle   = document.getElementById('mobile-menu-toggle');
const mobileFilters = document.getElementById('mobile-filters');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.classList.toggle('open', !isOpen);
  mobileFilters.setAttribute('aria-hidden', String(isOpen));
  mobileFilters.classList.toggle('open', !isOpen);
});

/* ── GitHub API fetch ── */
async function fetchGitHubFolder(category) {
  const { GITHUB_USER, GITHUB_REPO, IMAGES_PATH, GITHUB_TOKEN, IMAGE_EXTS } = CONFIG;
  const path = IMAGES_PATH ? `${IMAGES_PATH}/${category}` : category;
  const url  = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`;

  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`GitHub API error ${res.status}`);
    }
    const files = await res.json();
    return files
      .filter(f => f.type === 'file' && IMAGE_EXTS.some(ext => f.name.toLowerCase().endsWith(`.${ext}`)))
      .map(f => ({
        src:      f.download_url,
        category,
        title:    f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        filename: f.name,
      }));
  } catch (err) {
    console.warn(`Could not load ${category}:`, err);
    return [];
  }
}

/* ── Load all images ── */
async function loadImages() {
  loader.style.display = 'flex';
  grid.innerHTML = '';
  renderedCount = 0;

  const isConfigured = CONFIG.GITHUB_USER && CONFIG.GITHUB_REPO;

  if (!isConfigured) {
    allItems = [];
  } else {
    const results = await Promise.all(CONFIG.CATEGORIES.map(fetchGitHubFolder));
    allItems = results.flat();
  }

  loader.style.display = 'none';
  applyFilter(activeCategory, false);
}

/* ── Filter ── */
function applyFilter(category, animate = true) {
  activeCategory = category;

  // Update button states
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const active = btn.dataset.category === category;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  filteredItems = category === 'all' ? allItems : allItems.filter(i => i.category === category);
  renderedCount = 0;
  grid.innerHTML = '';

  if (filteredItems.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  emptyState.style.display = 'none';
  renderBatch();
}

/* ── Render batch (infinite scroll) ── */
function renderBatch() {
  const batch = filteredItems.slice(renderedCount, renderedCount + CONFIG.BATCH_SIZE);
  if (batch.length === 0) return;

  const frag = document.createDocumentFragment();
  batch.forEach((item, i) => {
    const el = createGalleryItem(item, renderedCount + i);
    frag.appendChild(el);
  });
  grid.appendChild(frag);
  renderedCount += batch.length;
}

/* ── Create gallery item ── */
function createGalleryItem(item, index) {
  const el = document.createElement('div');
  el.className = 'gallery-item';
  el.setAttribute('role', 'listitem');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', `${item.title} — ${item.category}`);
  el.style.animationDelay = `${(index % CONFIG.BATCH_SIZE) * 40}ms`;

  el.innerHTML = `
    <img
      class="gallery-img"
      src="${item.src}"
      alt="${item.title}"
      loading="lazy"
      decoding="async"
    />
    <div class="gallery-overlay">
      <span class="gallery-cat-label">${item.category}</span>
      <span class="gallery-img-title">${item.title}</span>
    </div>
    <div class="gallery-expand" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
    </div>
  `;

  // Lazy load fallback
  const img = el.querySelector('.gallery-img');
  img.addEventListener('error', () => { img.src = `https://via.placeholder.com/400x300/0d1028/818cf8?text=${encodeURIComponent(item.category)}`; });

  el.addEventListener('click', () => openLightbox(index));
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(index); } });

  return el;
}

/* ── Infinite scroll ── */
const io = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) renderBatch();
}, { rootMargin: '200px' });
io.observe(sentinel);

/* ── Filter button clicks ── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    applyFilter(btn.dataset.category);
    // Close mobile menu
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('open');
    mobileFilters.setAttribute('aria-hidden', 'true');
    mobileFilters.classList.remove('open');
  });
});


/* ══════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════ */
function openLightbox(index) {
  lightboxIndex = index;
  updateLightboxImage();
  renderThumbs();
  lbEl.classList.add('open');
  lbEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbImg.focus();
}

function closeLightbox() {
  lbEl.classList.remove('open');
  lbEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function updateLightboxImage() {
  const item = filteredItems[lightboxIndex];
  if (!item) return;

  lbImg.classList.add('loading');
  lbSpinner.classList.add('visible');

  const tempImg = new Image();
  tempImg.onload = () => {
    lbImg.src = item.src;
    lbImg.alt = item.title;
    lbImg.classList.remove('loading');
    lbSpinner.classList.remove('visible');
  };
  tempImg.onerror = () => {
    lbImg.src = item.src;
    lbImg.classList.remove('loading');
    lbSpinner.classList.remove('visible');
  };
  tempImg.src = item.src;

  lbCat.textContent   = item.category;
  lbTitle.textContent = item.title;
  lbCounter.textContent = `${lightboxIndex + 1} / ${filteredItems.length}`;

  lbPrev.disabled = lightboxIndex === 0;
  lbNext.disabled = lightboxIndex === filteredItems.length - 1;

  // Scroll active thumb into view
  const thumbs = lbThumbs.querySelectorAll('.thumb');
  thumbs.forEach((t, i) => t.classList.toggle('active', i === lightboxIndex));
  const activeThumb = thumbs[lightboxIndex];
  if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function renderThumbs() {
  lbThumbs.innerHTML = '';
  filteredItems.forEach((item, i) => {
    const t = document.createElement('div');
    t.className = 'thumb' + (i === lightboxIndex ? ' active' : '');
    t.setAttribute('role', 'listitem');
    t.setAttribute('tabindex', '0');
    t.setAttribute('aria-label', item.title);
    t.innerHTML = `<img src="${item.src}" alt="${item.title}" loading="lazy" />`;
    t.addEventListener('click', () => { lightboxIndex = i; updateLightboxImage(); });
    t.addEventListener('keydown', e => { if (e.key === 'Enter') { lightboxIndex = i; updateLightboxImage(); } });
    lbThumbs.appendChild(t);
  });
}

function lightboxPrev() {
  if (lightboxIndex > 0) { lightboxIndex--; updateLightboxImage(); }
}
function lightboxNext() {
  if (lightboxIndex < filteredItems.length - 1) { lightboxIndex++; updateLightboxImage(); }
}

lbPrev.addEventListener('click', lightboxPrev);
lbNext.addEventListener('click', lightboxNext);
document.getElementById('lightbox-backdrop').addEventListener('click', closeLightbox);
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

/* Keyboard navigation */
document.addEventListener('keydown', e => {
  if (!lbEl.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   lightboxPrev();
  if (e.key === 'ArrowRight')  lightboxNext();
});

/* Touch / swipe */
(function initSwipe() {
  let startX = null, startY = null;
  const stage = lbEl.querySelector('.lightbox-stage');

  stage.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) lightboxNext();
      else         lightboxPrev();
    }
    startX = null;
    startY = null;
  }, { passive: true });
})();

/* Image zoom on double-tap / double-click */
(function initZoom() {
  const wrap = document.getElementById('lightbox-img-wrap');
  let zoomed = false;
  let lastTap = 0;

  function toggleZoom() {
    zoomed = !zoomed;
    lbImg.style.transform = zoomed ? 'scale(1.8)' : 'scale(1)';
    lbImg.style.transition = 'transform 0.3s ease';
    lbImg.style.cursor     = zoomed ? 'zoom-out' : 'zoom-in';
    wrap.style.overflow    = zoomed ? 'auto' : 'visible';
  }

  wrap.addEventListener('dblclick', toggleZoom);
  wrap.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTap < 300) { toggleZoom(); e.preventDefault(); }
    lastTap = now;
  });
})();

/* ── Boot ── */
loadImages();
