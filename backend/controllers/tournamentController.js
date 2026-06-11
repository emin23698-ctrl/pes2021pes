const db = require('../config/dbConfig');

// 1. Yeni Turnuva ve Puanları Ekleme
const createTournament = async (req, res) => {
    try {
        // req.body'den gelecek format: { "match_date": "2026-06-07", "results": [{ "player_id": 1, "score": 14 }, { "player_id": 2, "score": 10 }] }
        const { match_date, results } = req.body;

        // Önce turnuvayı (tarihi) oluştur ve ID'sini al
        const turnuvaRes = await db.query(
            'INSERT INTO tournaments (match_date) VALUES ($1) RETURNING id',
            [match_date]
        );
        const tournamentId = turnuvaRes.rows[0].id;

        // Gelen sonuçları döngüyle tournament_results tablosuna ekle
        for (let result of results) {
            await db.query(
                'INSERT INTO tournament_results (tournament_id, player_id, score) VALUES ($1, $2, $3)',
                [tournamentId, result.player_id, result.score]
            );
        }

        res.status(201).json({ message: 'Turnuva ve puanlar başarıyla eklendi!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Turnuva eklenirken bir hata oluştu veya bu tarih zaten var.' });
    }
};

// 2. Genel Liderlik Tablosu (Tüm Zamanların Ortalaması)
const getLeaderboard = async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.name, p.surname,
                   ROUND(AVG(tr.score), 2) as general_average,
                   COUNT(tr.id) as matches_played
            FROM players p
            JOIN tournament_results tr ON p.id = tr.player_id
            GROUP BY p.id, p.name, p.surname
            ORDER BY general_average DESC;
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Liderlik tablosu çekilemedi.' });
    }
};

// 3. Geçmiş Bir Turnuvanın Sonuçları (Örn: Geçen hafta kim 1. olmuştu?)
const getTournamentResultsByDate = async (req, res) => {
    try {
        const { date } = req.params; // URL'den tarihi alacağız (YYYY-MM-DD)
        const query = `
            SELECT p.name, p.surname, tr.score
            FROM tournament_results tr
            JOIN players p ON tr.player_id = p.id
            JOIN tournaments t ON tr.tournament_id = t.id
            WHERE t.match_date = $1
            ORDER BY tr.score DESC;
        `;
        const result = await db.query(query, [date]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Turnuva sonuçları getirilemedi.' });
    }
};

// 4. KURA ÇEKİMİ (Zıt Kutuplu Matchmaking Algoritması)
const drawTeams = async (req, res) => {
    try {
        const { playerIds, league } = req.body; // O gün oynayacak kişilerin ID'leri: [1, 2, 3, 4]

        if (!playerIds || playerIds.length === 0) {
            return res.status(400).json({ error: 'Lütfen oyuncu seçin.' });
        }

        if (!league) {
            return res.status(400).json({ error: 'Lütfen bir lig seçin.' });
        }

        // 1. Adım: Seçilen oyuncuların ortalamalarını al ve sırala (En iyi oyuncu en üstte)
        // COALESCE(AVG(score), 0) -> Eğer oyuncu ilk defa oynuyorsa ortalaması 0 sayılır.
        const playersQuery = `
            SELECT p.id, p.name, COALESCE(AVG(tr.score), 0) as avg_score
            FROM players p
            LEFT JOIN tournament_results tr ON p.id = tr.player_id
            WHERE p.id = ANY($1::int[])
            GROUP BY p.id, p.name
            ORDER BY avg_score DESC;
        `;
        const playersRes = await db.query(playersQuery, [playerIds]);
        const sortedPlayers = playersRes.rows;

        // 2. SADECE SEÇİLEN LİGDEKİ takımları çek (Şart EKLENDİ)
        const teamsQuery = `SELECT id, name, power FROM teams WHERE is_active = TRUE AND league = $1 ORDER BY power ASC`;
        const teamsRes = await db.query(teamsQuery, [league]);
        const sortedTeams = teamsRes.rows;

        if (sortedTeams.length < sortedPlayers.length) {
            return res.status(400).json({ error: `Bu kura için ${league} havuzunda yeterli aktif takım yok! Lütfen yeni takım ekleyin.` });
        }

        // 3. Eşleştirme
        const matches = sortedPlayers.map((player, index) => {
            return {
                playerName: player.name,
                averageScore: parseFloat(player.avg_score).toFixed(2),
                assignedTeam: sortedTeams[index].name,
                teamPower: sortedTeams[index].power
            };
        });

        res.status(200).json(matches);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Kura çekilirken hata oluştu.' });
    }
};

// Oynanan tüm maç tarihlerini getirme
const getPlayedDates = async (req, res) => {
    try {
        const query = 'SELECT match_date FROM tournaments ORDER BY match_date DESC';
        const result = await db.query(query);
        
        // Sadece tarih stringlerinden oluşan bir dizi döndürüyoruz: ["2026-06-03", "2026-06-07"]
        const dates = result.rows.map(row => row.match_date);
        res.status(200).json(dates);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Tarihler getirilemedi.' });
    }
};

module.exports = { createTournament, getLeaderboard, getTournamentResultsByDate, drawTeams, getPlayedDates };