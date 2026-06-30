import './style.css';

// Preload images for the gallery silently in the background while the user is on the intro page
async function preloadGalleryImages() {
  try {
    const response = await fetch('/albums.json');
    const albums = await response.json();
    
    let allImageUrls = [];
    Object.keys(albums).forEach(albumName => {
      let folderPath = albumName;
      if (albumName === "9'th NISC") folderPath = "portfolio-images";
      const urls = albums[albumName].map(f => `/thumbnails/${folderPath}/${encodeURIComponent(f)}`);
      allImageUrls = allImageUrls.concat(urls);
    });

    // Shuffle to spread the load randomly just like the gallery does
    allImageUrls.sort(() => Math.random() - 0.5);

    // Stealthily download images into the browser cache
    // We throttle this slightly so it doesn't freeze the intro page animations
    let index = 0;
    const batchSize = 15;
    
    const preloadInterval = setInterval(() => {
      for (let b = 0; b < batchSize; b++) {
        if (index < allImageUrls.length) {
          const img = new Image();
          img.src = allImageUrls[index];
          index++;
        } else {
          clearInterval(preloadInterval);
          break;
        }
      }
    }, 50);

  } catch (err) {
    console.error('Failed to preload images', err);
  }
}

// Start preloading immediately when the intro page loads
preloadGalleryImages();

// --- Custom Cursor Logic ---
function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  
  if (!dot || !outline) return;

  // Only activate custom cursor on devices that use a mouse (fine pointer)
  if (window.matchMedia("(pointer: fine)").matches) {
    document.body.classList.add('custom-cursor-active');
    
    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;
      
      dot.style.left = `${posX}px`;
      dot.style.top = `${posY}px`;
      
      // Add slight delay to outline for smooth trailing effect
      outline.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 500, fill: "forwards" });
    });

    // Add active state when hovering over links/buttons
    const interactables = document.querySelectorAll('a, button, img');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot.classList.add('active');
        outline.classList.add('active');
      });
      el.addEventListener('mouseleave', () => {
        dot.classList.remove('active');
        outline.classList.remove('active');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initCursor);
