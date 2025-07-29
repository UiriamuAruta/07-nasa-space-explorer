// NASA Space Explorer App Script (Enhanced)
const API_KEY = 'gyed4aBNvqi5IU64o3S80mmyKM8fjFtMatPYtFXF';
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Random space facts
const spaceFacts = [
  "Did you know? A day on Venus is longer than a year on Venus.",
  "Did you know? The sunset on Mars appears blue.",
  "Did you know? There are more stars in the universe than grains of sand on Earth.",
  "Did you know? A spoonful of a neutron star weighs about a billion tons.",
  "Did you know? One million Earths could fit inside the Sun."
];

// Display a random fact above the gallery
function showRandomFact() {
  const factContainer = document.getElementById('randomFact')
    || createFactContainer();
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factContainer.textContent = fact;
}

function createFactContainer() {
  const container = document.createElement('div');
  container.id = 'randomFact';
  container.classList.add('random-fact');
  gallery.parentNode.insertBefore(container, gallery);
  return container;
}

// Show loading placeholder
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>`;
}

// Render gallery items, handling images and videos
function renderGallery(items) {
  gallery.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('gallery-item');

    // Media: image or video
    if (item.media_type === 'image') {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.title;
      card.appendChild(img);
    } else if (item.media_type === 'video') {
      // embed YouTube video or show link
      const iframe = document.createElement('iframe');
      iframe.src = item.url.replace("watch?v=", "embed/");
      iframe.setAttribute('frameborder','0');
      iframe.setAttribute('allowfullscreen','');
      card.appendChild(iframe);
    }

    // Caption
    const caption = document.createElement('p');
    caption.innerHTML = `<strong>${item.title}</strong> (${item.date})`;
    card.appendChild(caption);

    // Modal only for images
    if (item.media_type === 'image') {
      card.addEventListener('click', () => openModal(item));
    }

    gallery.appendChild(card);
  });
}

// Modal for full-size image and explanation
function openModal(item) {
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" aria-label="Close">&times;</button>
      <img src="${item.hdurl || item.url}" alt="${item.title}" />
      <h2>${item.title}</h2>
      <p class="modal-date">${item.date}</p>
      <p class="modal-explanation">${item.explanation}</p>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-close')
    .addEventListener('click', () => document.body.removeChild(overlay));
  overlay.addEventListener('click', e => {
    if (e.target === overlay) document.body.removeChild(overlay);
  });
}

// Helper: set end date to 8 days after start date (max today)
function autoFillEndDate() {
  // Get the selected start date
  const startDate = new Date(startInput.value);
  // Create a new date 8 days after start date
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 8);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // If calculated end date is after today, use today
  const endDateStr = endDate > new Date(today)
    ? today
    : endDate.toISOString().split('T')[0];

  // Set the end date input value
  endInput.value = endDateStr;
}

// When the user changes the start date, auto-fill the end date and update gallery
startInput.addEventListener('change', () => {
  autoFillEndDate();
  // Optionally, fetch new images automatically:
  // getSpaceImages();
});

// Fetch and show images/videos
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;
  if (!startDate || !endDate) return;

  showLoading();

  try {
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}` +
      `&start_date=${startDate}&end_date=${endDate}`
    );
    const data = await res.json();
    renderGallery(data);
  } catch (err) {
    gallery.innerHTML = '<p class="error">Error loading data. Please try again.</p>';
    console.error('Fetch error:', err);
  }
}

// Initialize
showRandomFact();
button.addEventListener('click', getSpaceImages);

