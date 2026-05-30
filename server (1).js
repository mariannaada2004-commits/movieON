const express = require("express");
const pool = require("./db");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// =============================================
// MOVIES
// =============================================

// GET /api/movies/recent - 9 πρόσφατες ταινίες
app.get("/api/movies/recent", async function (req, res) {
    try {
        const result = await pool.query(`
            SELECT m.id, m.title, m.image_url, m.rating, m.release_year,
                   c.name AS category_name
            FROM project.movie m
            LEFT JOIN project.category c ON m.category_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 9
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load movies." });
    }
});

// GET /api/movies/:id - λεπτομέρειες ταινίας
app.get("/api/movies/:id", async function (req, res) {
    try {
        const result = await pool.query(`
            SELECT m.*, c.name AS category_name
            FROM project.movie m
            LEFT JOIN project.category c ON m.category_id = c.id
            WHERE m.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found." });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load movie." });
    }
});

// =============================================
// CATEGORIES
// =============================================

// GET /api/categories - όλες οι κατηγορίες
app.get("/api/categories", async function (req, res) {
    try {
        const result = await pool.query(`
            SELECT c.id, c.name, COUNT(m.id) AS movie_count
            FROM project.category c
            LEFT JOIN project.movie m ON c.id = m.category_id
            GROUP BY c.id, c.name
            ORDER BY c.name ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load categories." });
    }
});

// GET /api/categories/:id/movies - ταινίες κατηγορίας
app.get("/api/categories/:id/movies", async function (req, res) {
    try {
        const result = await pool.query(`
            SELECT m.id, m.title, m.image_url, m.rating, m.release_year,
                   c.name AS category_name
            FROM project.movie m
            LEFT JOIN project.category c ON m.category_id = c.id
            WHERE m.category_id = $1
            ORDER BY m.release_year DESC
        `, [req.params.id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load movies." });
    }
});

// =============================================
// FAVORITES
// =============================================

// GET /api/favorites/ids - IDs αγαπημένων
app.get("/api/favorites/ids", async function (req, res) {
    try {
        const result = await pool.query("SELECT movie_id FROM project.favorites");
        res.json(result.rows.map(r => r.movie_id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load favorites." });
    }
});

// GET /api/favorites - όλες οι αγαπημένες ταινίες
app.get("/api/favorites", async function (req, res) {
    try {
        const result = await pool.query(`
            SELECT m.id, m.title, m.image_url, m.rating, m.release_year,
                   c.name AS category_name
            FROM project.favorites f
            JOIN project.movie m ON f.movie_id = m.id
            LEFT JOIN project.category c ON m.category_id = c.id
            ORDER BY f.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load favorites." });
    }
});

// POST /api/favorites - προσθήκη στα αγαπημένα
app.post("/api/favorites", async function (req, res) {
    const { movie_id } = req.body;
    if (!movie_id) return res.status(400).json({ error: "movie_id required" });

    try {
        const existing = await pool.query(
            "SELECT id FROM project.favorites WHERE movie_id = $1", [movie_id]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "Already in favorites." });
        }
        await pool.query(
            "INSERT INTO project.favorites (movie_id) VALUES ($1)", [movie_id]
        );
        res.status(201).json({ message: "Added to favorites." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not add to favorites." });
    }
});

// DELETE /api/favorites/:movie_id - αφαίρεση από αγαπημένα
app.delete("/api/favorites/:movie_id", async function (req, res) {
    try {
        const result = await pool.query(
            "DELETE FROM project.favorites WHERE movie_id = $1", [req.params.movie_id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Not found in favorites." });
        }
        res.json({ message: "Removed from favorites." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not remove from favorites." });
    }
});

// =============================================
// START SERVER
// =============================================
app.listen(3000, function () {
    console.log("Server running on http://localhost:3000");
});
