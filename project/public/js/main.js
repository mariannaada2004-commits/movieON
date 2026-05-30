// main.js — Αρχική σελίδα (9 πρόσφατες ταινίες)
let favoriteIds = [];

async function loadHomeMovies() {
    try {
        showLoading(true);
        // Φόρτωση ταινιών και αγαπημένων παράλληλα
        const [movies, favIds] = await Promise.all([
            fetchRecentMovies(),
            fetchFavoriteIds()
        ]);
        favoriteIds = favIds;

        showLoading(false);
        const grid = document.getElementById('moviesGrid');

        if (!movies || movies.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-muted py-5">Δεν βρέθηκαν ταινίες.</div>';
            return;
        }

        grid.innerHTML = movies.map(m => createMovieCard(m, favoriteIds)).join('');

    } catch (err) {
        console.error(err);
        showError();
    }
}

// Εκκίνηση
document.addEventListener('DOMContentLoaded', loadHomeMovies);
