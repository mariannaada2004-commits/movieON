// categories.js — Σελίδα Κατηγοριών
async function loadCategories() {
    try {
        showLoading(true);
        const categories = await fetchCategories();
        showLoading(false);

        const list = document.getElementById('categoriesList');

        if (!categories || categories.length === 0) {
            list.innerHTML = '<p class="text-muted text-center py-4">Δεν βρέθηκαν κατηγορίες.</p>';
            return;
        }

        list.innerHTML = categories.map(cat => {
            const icon = CATEGORY_ICONS[cat.name] || '🎬';
            return `
                <a class="category-row" href="category-movies.html?id=${cat.id}&name=${encodeURIComponent(cat.name)}">
                    <div class="category-name">
                        <div class="category-icon">${icon}</div>
                        ${cat.name}
                    </div>
                    <div class="category-count">
                        <span class="category-count-label">Ταινίες:</span>
                        ${cat.movie_count}
                    </div>
                </a>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        showError();
    }
}

document.addEventListener('DOMContentLoaded', loadCategories);
