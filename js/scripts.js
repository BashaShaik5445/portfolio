// ---------- Utility ----------
function extFromPath(p){ return (p||'').split('.').pop().toLowerCase(); }

// ---------- Certificate modal (images & PDFs) ----------
function openCertModal(filePath, title){
  const modal = document.getElementById('certModal');
  const content = document.getElementById('certContent');
  content.innerHTML = ''; // clear

  const ext = extFromPath(filePath);
  if(ext === 'pdf'){
    const iframe = document.createElement('iframe');
    iframe.src = filePath;
    iframe.setAttribute('title', title || 'Certificate');
    content.appendChild(iframe);
  } else {
    const img = document.createElement('img');
    img.src = filePath;
    img.alt = title || 'Certificate';
    content.appendChild(img);
  }

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden','false');
}

function closeCertModal(){
  const modal = document.getElementById('certModal');
  const content = document.getElementById('certContent');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden','true');
  content.innerHTML = '';
}

// ---------- Main DOM ready wiring ----------
document.addEventListener('DOMContentLoaded', function(){

  /* ---- Certificates: wire up cards to modal ---- */
  document.querySelectorAll('.grid.certifications .card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const file = card.dataset.file;
      const title = card.dataset.title || card.querySelector('h3')?.textContent;
      if(file) openCertModal(file, title);
    });
  });
  const certClose = document.getElementById('certClose');
  if(certClose) certClose.addEventListener('click', closeCertModal);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeCertModal(); });
  const certModalEl = document.getElementById('certModal');
  if(certModalEl) certModalEl.addEventListener('click', (e)=>{
    if(e.target.id === 'certModal') closeCertModal();
  });

  /* ---- Scroll animations (intersection observer) ---- */
  const elements=document.querySelectorAll('[data-animate]');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  },{threshold:0.2});
  elements.forEach(el=>observer.observe(el));

  // ---------- Logo carousel preload + precise animation speed/loop fix ----------
  (function initLogoCarouselPrecise(){
    const track = document.querySelector('.slide-track');
    const container = document.querySelector('.logo-slider');
    if (!track || !container) return;

    // remove any visual padding on track which breaks the 50% translate math
    track.style.paddingLeft = '0';

    const slides = Array.from(track.querySelectorAll('.slide'));
    if (slides.length === 0) { track.classList.add('ready'); return; }

    // assume two equal sets: first unique set + duplicate set
    const half = Math.floor(slides.length / 2);
    const firstSet = slides.slice(0, half);
    const dupSet = slides.slice(half);

    // ---- PRELOAD first set (same as before) ----
    let loaded = 0, errored = 0, total = firstSet.length;
    const start = () => {
      // compute pixel distance and auto-tune duration
      // total track width (includes duplicates) -> we want half for full loop
      requestAnimationFrame(() => {
        const trackWidth = track.scrollWidth; // full width (first + duplicate)
        const loopDistance = Math.floor(trackWidth / 2); // pixels we need to translate

        // default speed: pixels per second (tweak this to go faster/slower)
        const pixelsPerSecond = 150; // => snappy speed (increase to go faster)
        let duration = Math.max(6, Math.round(loopDistance / pixelsPerSecond)); // seconds (min 6s)

        // set CSS vars so the animation uses computed values
        document.documentElement.style.setProperty('--slider-distance-px', `${loopDistance}px`);
        document.documentElement.style.setProperty('--slider-duration', `${duration}s`);

        // load duplicates (if they used data-src)
        dupSet.forEach(s => {
          const img = s.querySelector('img');
          if (!img) return;
          const ds = img.dataset && img.dataset.src;
          if (ds && !img.src) img.src = ds;
        });

        // small pause then run
        setTimeout(()=> track.classList.add('ready'), 80);
      });
    };

    if (total === 0) { start(); return; }

    firstSet.forEach(s => {
      const img = s.querySelector('img');
      if (!img) { loaded++; if (loaded+errored === total) start(); return; }

      if (img.complete && img.naturalWidth) {
        loaded++; if (loaded+errored === total) start();
        return;
      }
      const pre = new Image();
      pre.onload = () => { loaded++; if (loaded+errored === total) start(); };
      pre.onerror = () => { errored++; if (loaded+errored === total) start(); };
      pre.src = img.getAttribute('src') || img.dataset?.src || '';
    });

    // safety fallback
    setTimeout(()=> {
      if (!track.classList.contains('ready')) start();
    }, 7000);
  })();


  /* ---- Typewriter effect ---- */
  (function initTypewriter(){
    const roles=["AI-Driven SOC & Threat Hunter","Red × Blue Team Hybrid","Security Automation Geek","PenTester","Risk-Aware Cyber Ops"];
    let i=0, j=0, isDeleting=false, current="";
    const txtElement=document.getElementById("roles");
    if(!txtElement) return;

    function type(){
      const full = roles[i];
      if(!isDeleting){
        current = full.substring(0, j++);
        txtElement.textContent = current;
      } else {
        current = full.substring(0, j--);
        txtElement.textContent = current;
      }

      if(!isDeleting && j > full.length){
        isDeleting = true;
        setTimeout(type, 1000);
        return;
      }
      if(isDeleting && j === 0){
        isDeleting = false;
        i = (i + 1) % roles.length;
      }
      setTimeout(type, isDeleting ? 50 : 150);
    }

    type();
  })();

});
