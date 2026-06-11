const db = require('../config/dbConfig');

// Yeni takım ekleme
const createTeam = async (req, res) => {
    try {
        const { name, power, league } = req.body; // league EKLENDİ
        const newTeam = await db.query(
            'INSERT INTO teams (name, power, league) VALUES ($1, $2, $3) RETURNING *',
            [name, power, league]
        );
        res.status(201).json(newTeam.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, power, league } = req.body; // league EKLENDİ
        
        const updatedTeam = await db.query(
            'UPDATE teams SET name = $1, power = $2, league = $3 WHERE id = $4 RETURNING *',
            [name, power, league, id]
        );
        res.status(200).json(updatedTeam.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Takım güncellenirken hata oluştu.' });
    }
};

// Sadece aktif takımları getirme (Kura çekimi için)
const getActiveTeams = async (req, res) => {
    try {
        const activeTeams = await db.query(
            'SELECT * FROM teams WHERE is_active = TRUE ORDER BY power DESC'
        );
        res.status(200).json(activeTeams.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

module.exports = { createTeam, getActiveTeams };