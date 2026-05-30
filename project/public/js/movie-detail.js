// movie-detail.js — Λεπτομέρειες Ταινίας 
let currentMovieId = null;
let isFavorite = false;

async function loadMovieDetail() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');

    if (!movieId) {
        window.location.href = 'index.html';
        return;
    }
    currentMovieId = parseInt(movieId);

    try {
        showLoading(true);
        const [movie, favIds] = await Promise.all([
            fetchMovieById(movieId),
            fetchFavoriteIds()
        ]);

        isFavorite = favIds.includes(currentMovieId);
        showLoading(false);
        renderMovieDetail(movie);

    } catch (err) {
        console.error(err);
        showLoading(false);
        showError();
    }
}

function renderMovieDetail(movie) {
    document.title = `CineWorld - ${movie.title}`;

    const posterSrc = movie.image_url && movie.image_url.trim()
        ? movie.image_url
        : 'https://via.placeholder.com/400x600/12121a/7a7a9a?text=No+Image';

    document.getElementById('detailPoster').src = posterSrc;
    document.getElementById('detailPoster').alt = movie.title;
    document.getElementById('detailTitle').textContent = movie.title;
    document.getElementById('detailDescription').textContent = movie.description || 'Δεν υπάρχει περιγραφή.';
    document.getElementById('detailCategory').textContent = movie.category_name || 'Άγνωστη κατηγορία';
    document.getElementById('detailDuration').textContent = movie.duration_minutes ? `${movie.duration_minutes} λεπτά` : '—';
    document.getElementById('detailRating').textContent = movie.rating ? `⭐ ${movie.rating}` : '—';
    document.getElementById('detailRatingInfo').textContent = movie.rating ? `${movie.rating} / 10` : '—';
    document.getElementById('detailYear').textContent = movie.release_year || '—';
    document.getElementById('detailMonth').textContent = MONTHS[movie.release_month] || '—';

    // Κουμπί αγαπημένου
    updateFavBtn();

    document.getElementById('movieDetail').style.display = 'block';
}

function updateFavBtn() {
    const btn = document.getElementById('favBtn');
    const icon = document.getElementById('favBtnIcon');
    const text = document.getElementById('favBtnText');
    if (!btn) return;

    if (isFavorite) {
        icon.textContent = '♥';
        text.textContent = 'Αφαίρεση από Αγαπημένα';
        btn.classList.add('active');
    } else {
        icon.textContent = '♡';
        text.textContent = 'Προσθήκη στα Αγαπημένα';
        btn.classList.remove('active');
    }
}

async function toggleFavoriteDetail() {
    if (!currentMovieId) return;

    try {
        if (isFavorite) {
            await removeFromFavorites(currentMovieId);
            isFavorite = false;
        } else {
            await addToFavorites(currentMovieId);
            isFavorite = true;
        }
        updateFavBtn();
    } catch (err) {
        console.error('Σφάλμα toggle αγαπημένου:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadMovieDetail);
