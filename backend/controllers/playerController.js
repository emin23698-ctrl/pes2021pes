const db = require('../config/dbConfig');

// Yeni oyuncu ekleme
const createPlayer = async (req, res) => {
    try {
        const { name, surname } = req.body;
        const newPlayer = await db.query(
            'INSERT INTO players (name, surname) VALUES ($1, $2) RETURNING *',
            [name, surname]
        );
        res.status(201).json(newPlayer.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

// Tüm oyuncuları getirme
const getAllPlayers = async (req, res) => {
    try {
        const allPlayers = await db.query('SELECT * FROM players ORDER BY id ASC');
        res.status(200).json(allPlayers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

module.exports = { createPlayer, getAllPlayers };