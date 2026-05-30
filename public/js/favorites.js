// favorites.js — Αγαπημένες Ταινίες 
async function loadFavorites() {
    try {
        showLoading(true);
        const movies = await fetchFavorites();
        showLoading(false);

        const grid = document.getElementById('moviesGrid');
        const countEl = document.getElementById('favCount');
        const emptyMsg = document.getElementById('emptyMsg');

        if (!movies || movies.length === 0) {
            if (countEl) countEl.textContent = '0 αγαπημένες ταινίες';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }

        if (countEl) countEl.textContent = `${movies.length} αγαπημέν${movies.length === 1 ? 'η ταινία' : 'ες ταινίες'}`;

        // Στη σελίδα αγαπημένων, όλες είναι αγαπημένες
        const allIds = movies.map(m => m.id);
        grid.innerHTML = movies.map(m => createMovieCard(m, allIds)).join('');

    } catch (err) {
        console.error(err);
        showError();
    }
}

/**
 * Override της toggleFavorite για τη σελίδα αγαπημένων:
 * Μετά την αφαίρεση, αφαιρεί την κάρτα από το DOM
 */
async function toggleFavorite(movieId) {
    const btn = document.getElementById(`heart-${movieId}`);
    if (!btn) return;

    const isFav = btn.classList.contains('active');

    if (isFav) {
        try {
            await removeFromFavorites(movieId);
            // Αφαιρούμε την κάρτα από τη σελίδα
            const card = document.getElementById(`card-${movieId}`);
            if (card) {
                card.style.transition = 'all 0.35s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.remove();
                    updateFavCount();
                }, 350);
            }
        } catch (err) {
            console.error('Σφάλμα αφαίρεσης αγαπημένου:', err);
        }
    }
}

function updateFavCount() {
    const remaining = document.querySelectorAll('[id^="card-"]').length;
    const countEl = document.getElementById('favCount');
    const emptyMsg = document.getElementById('emptyMsg');

    if (remaining === 0) {
        if (countEl) countEl.textContent = '0 αγαπημένες ταινίες';
        if (emptyMsg) emptyMsg.style.display = 'block';
    } else {
        if (countEl) countEl.textContent = `${remaining} αγαπημέν${remaining === 1 ? 'η ταινία' : 'ες ταινίες'}`;
    }
}

document.addEventListener('DOMContentLoaded', loadFavorites);
