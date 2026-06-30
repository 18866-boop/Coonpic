import './style.css';

// Fetch the albums map
const response = await fetch('/albums.json');
const albums = await response.json();

// Combine all image URLs for the background mosaic
let allImageUrls = [];
Object.keys(albums).forEach(albumName => {
  let folderPath = albumName;
  if (albumName === "9'th NISC") folderPath = "portfolio-images";
  // Point to the optimized thumbnails
  const urls = albums[albumName].map(f => `/thumbnails/${folderPath}/${encodeURIComponent(f)}`);
  allImageUrls = allImageUrls.concat(urls);
});

const galleryContainer = document.getElementById('gallery');

if (allImageUrls.length === 0) {
  console.warn('No images found in src/assets/portfolio-images/. Please add some images there!');
} else {
  // Calculate enough columns to fill the wider 140vw container
  const columnWidth = 100;
  const gap = 4;
  const containerWidth = window.innerWidth * 1.4;
  const numColumns = Math.ceil(containerWidth / (columnWidth + gap)) + 2;

  // Global shuffle of all available images across all albums
  const globalShuffled = [...allImageUrls].sort(() => Math.random() - 0.5);
  
  // Calculate how many images each column needs to reach at least 140vh.
  // Average height is ~120px. 15 images * 120px = 1800px, enough for most screens.
  const imagesPerColumn = 15; 
  
  // Create a master pool of images by repeating the globally shuffled array 
  // just enough times to feed all columns. This guarantees we don't repeat 
  // an image until we've completely run out of the 265 unique ones.
  let pool = [];
  while (pool.length < numColumns * imagesPerColumn) {
    pool = pool.concat(globalShuffled);
  }

  let poolIndex = 0;
  const fragment = document.createDocumentFragment();
  const imagesToLoad = [];

  for (let i = 0; i < numColumns; i++) {
    const column = document.createElement('div');
    column.className = 'gallery-column';
    
    // Alternate scroll directions for a dynamic feel
    if (i % 2 === 0) {
      column.classList.add('scroll-down');
      column.style.animationDuration = `${30 + (i % 5) * 3}s`;
    } else {
      column.classList.add('scroll-up');
      column.style.animationDuration = `${35 + (i % 4) * 3}s`;
    }

    const columnImages = pool.slice(poolIndex, poolIndex + imagesPerColumn);
    poolIndex += imagesPerColumn;
    
    // Duplicate the entire set once more so the scroll loop is seamless
    const finalImages = [...columnImages, ...columnImages];

    finalImages.forEach((src) => {
      const img = document.createElement('img');
      img.src = src; // Set source immediately to use the cached versions
      img.decoding = 'async';
      
      const heights = [100, 140, 180, 80];
      const randomHeight = heights[Math.floor(Math.random() * heights.length)];
      img.style.height = `${randomHeight}px`;
      column.appendChild(img);
    });

    fragment.appendChild(column);
  }

  // Append everything to the DOM at once (much faster)
  galleryContainer.appendChild(fragment);

  // Album Explorer Logic
  const infoBtn = document.getElementById('info-btn');
  const closeExplorerBtn = document.getElementById('close-explorer-btn');
  const explorer = document.getElementById('album-explorer');

  if (infoBtn && closeExplorerBtn && explorer) {
    infoBtn.addEventListener('click', () => {
      explorer.classList.add('show');
    });
    
    closeExplorerBtn.addEventListener('click', () => {
      explorer.classList.remove('show');
    });
  }

  // Populate Folders and Grid
  const folderList = document.getElementById('folder-list');
  const explorerGrid = document.getElementById('explorer-grid');
  const albumTitle = document.getElementById('album-title');
  const albumMeta = document.getElementById('album-meta');

  function loadAlbum(albumName) {
    // Update sidebar active state
    if (folderList) {
      Array.from(folderList.children).forEach(li => {
        li.classList.toggle('active', li.dataset.album === albumName);
      });
    }

    // Update header
    if (albumTitle) albumTitle.textContent = albumName;
    const numPhotos = albums[albumName].length;
    if (albumMeta) albumMeta.textContent = `${numPhotos} Photos`;

    // Update grid
    if (explorerGrid) {
      explorerGrid.innerHTML = ''; // clear current grid
      let folderPath = albumName;
      if (albumName === "9'th NISC") folderPath = "portfolio-images";

      albums[albumName].forEach(filename => {
        const img = document.createElement('img');
        // Point to the optimized thumbnails
        img.src = `/thumbnails/${folderPath}/${encodeURIComponent(filename)}`;
        img.loading = 'lazy';
        img.decoding = 'async';
        explorerGrid.appendChild(img);
      });
    }
  }

  // Build the folder list dynamically from the JSON
  if (folderList) {
    Object.keys(albums).forEach((albumName, index) => {
      const li = document.createElement('li');
      li.dataset.album = albumName;
      li.innerHTML = `<span class="folder-icon">📁</span> ${albumName}`;
      li.addEventListener('click', () => loadAlbum(albumName));
      folderList.appendChild(li);

      // Load the first album by default
      if (index === 0) {
        loadAlbum(albumName);
      }
    });
  }
}
