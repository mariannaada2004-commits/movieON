// api.js — Κεντρικό module για API κλήσεις
const API_BASE = '/api';

// Ονόματα μηνών
const MONTHS = [
    '', 'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
    'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος',
    'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
];

// Εικονίδια κατηγοριών
const CATEGORY_ICONS = {
    'Δράση': '⚡', 'Κωμωδία': '😄', 'Δράμα': '🎭',
    'Τρόμος': '👻', 'Επιστημονική Φαντασία': '🚀',
    'Ρομαντική': '💕', 'Θρίλερ': '🔍', 'Περιπέτεια': '🗺'
};

// API Functions
async function fetchRecentMovies() {
    const res = await fetch(`${API_BASE}/movies/recent`);
    if (!res.ok) throw new Error('Σφάλμα φόρτωσης ταινιών');
    return res.json();
}

async function fetchMovieById(id) {
    const res = await fetch(`${API_BASE}/movies/${id}`);
    if (!res.ok) throw new Error('Ταινία δεν βρέθηκε');
    return res.json();
}

async function fetchCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Σφάλμα φόρτωσης κατηγοριών');
    return res.json();
}

async function fetchMoviesByCategory(categoryId) {
    const res = await fetch(`${API_BASE}/categories/${categoryId}/movies`);
    if (!res.ok) throw new Error('Σφάλμα φόρτωσης ταινιών');
    return res.json();
}

async function fetchFavorites() {
    const res = await fetch(`${API_BASE}/favorites`);
    if (!res.ok) throw new Error('Σφάλμα φόρτωσης αγαπημένων');
    return res.json();
}

async function fetchFavoriteIds() {
    const res = await fetch(`${API_BASE}/favorites/ids`);
    if (!res.ok) throw new Error('Σφάλμα');
    return res.json();
}

async function addToFavorites(movieId) {
    const res = await fetch(`${API_BASE}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie_id: movieId })
    });
    if (!res.ok && res.status !== 409) throw new Error('Σφάλμα προσθήκης');
    return res.json();
}

async function removeFromFavorites(movieId) {
    const res = await fetch(`${API_BASE}/favorites/${movieId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Σφάλμα αφαίρεσης');
    return res.json();
}

// Shared UI Helpers

/**
 * Δημιουργεί HTML για μια κάρτα ταινίας
 */
function createMovieCard(movie, favoriteIds = []) {
    const isFav = favoriteIds.includes(movie.id);
    const posterSrc = movie.image_url && movie.image_url.trim()
        ? movie.image_url
        : 'https://via.placeholder.com/300x450/12121a/7a7a9a?text=No+Image';

    return `
        <div class="col-12 col-sm-6 col-lg-4" id="card-${movie.id}">
            <div class="movie-card h-100">
                <div class="card-poster-wrap" onclick="goToMovie(${movie.id})">
                    <img class="card-poster"
                         src="${posterSrc}"
                         alt="${movie.title}"
                         onerror="this.src='https://via.placeholder.com/300x450/12121a/7a7a9a?text=No+Image'">
                    <div class="card-poster-overlay">
                        <div class="play-btn">▶</div>
                    </div>
                    ${movie.rating ? `<div class="card-rating">⭐ ${movie.rating}</div>` : ''}
                </div>
                <div class="card-body">
                    <div class="card-category">${movie.category_name || 'Άγνωστη'}</div>
                    <div class="card-title" onclick="goToMovie(${movie.id})">${movie.title}</div>
                    <div class="card-footer-row">
                        <span class="card-year">${movie.release_year || ''}</span>
                        <button class="heart-btn ${isFav ? 'active' : ''}"
                                id="heart-${movie.id}"
                                onclick="toggleFavorite(${movie.id})"
                                title="${isFav ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}">
                            <span class="heart-icon"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Εμφανίζει/αποκρύπτει spinner και grid
 */
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = show ? 'block' : 'none';
}

function showError() {
    const err = document.getElementById('errorMsg');
    if (err) err.style.display = 'block';
    showLoading(false);
}

/**
 * Πλοήγηση στη σελίδα λεπτομερειών ταινίας
 */
function goToMovie(id) {
    window.location.href = `movie-detail.html?id=${id}`;
}

/**
 * Toggle αγαπημένου — κοινή λογική για όλες τις σελίδες
 */
async function toggleFavorite(movieId) {
    const btn = document.getElementById(`heart-${movieId}`);
    if (!btn) return;

    const isFav = btn.classList.contains('active');

    try {
        if (isFav) {
            await removeFromFavorites(movieId);
            btn.classList.remove('active');
            btn.title = 'Προσθήκη στα αγαπημένα';
        } else {
            await addToFavorites(movieId);
            btn.classList.add('active');
            btn.title = 'Αφαίρεση από αγαπημένα';
        }
    } catch (err) {
        console.error('Σφάλμα toggle αγαπημένου:', err);
    }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (nav) {
        if (window.scrollY > 30) {
            nav.style.background = 'rgba(10, 10, 15, 0.98)';
        } else {
            nav.style.background = 'rgba(10, 10, 15, 0.92)';
        }
    }
});
