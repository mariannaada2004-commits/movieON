// category-movies.js — Ταινίες Κατηγορίας 
let favoriteIds = [];

async function loadCategoryMovies() {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('id');
    const categoryName = params.get('name') || 'Κατηγορία';

    if (!categoryId) {
        window.location.href = 'categories.html';
        return;
    }

    // Ενημέρωση τίτλου σελίδας
    document.title = `CineWorld - ${decodeURIComponent(categoryName)}`;
    const titleEl = document.getElementById('categoryTitle');
    if (titleEl) titleEl.textContent = decodeURIComponent(categoryName);

    try {
        showLoading(true);
        const [movies, favIds] = await Promise.all([
            fetchMoviesByCategory(categoryId),
            fetchFavoriteIds()
        ]);
        favoriteIds = favIds;
        showLoading(false);

        const grid = document.getElementById('moviesGrid');
        const countEl = document.getElementById('movieCount');

        if (!movies || movies.length === 0) {
            if (countEl) countEl.textContent = '0 ταινίες';
            const emptyMsg = document.getElementById('emptyMsg');
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }

        if (countEl) countEl.textContent = `${movies.length} ταιν${movies.length === 1 ? 'ία' : 'ίες'}`;
        grid.innerHTML = movies.map(m => createMovieCard(m, favoriteIds)).join('');

    } catch (err) {
        console.error(err);
        showError();
    }
}

document.addEventListener('DOMContentLoaded', loadCategoryMovies);
