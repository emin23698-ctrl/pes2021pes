const express = require('express');
const router = express.Router();
const { 
    createTournament, 
    getLeaderboard, 
    getTournamentResultsByDate, 
    drawTeams, getPlayedDates 
} = require('../controllers/tournamentController');

router.post('/create', createTournament); // Yeni turnuva kaydı
router.get('/leaderboard', getLeaderboard); // Genel liderlik tablosu
router.get('/date/:date', getTournamentResultsByDate); // Tarihe göre sonuçlar
router.post('/draw', drawTeams); // Kura Çekimi Algoritması
router.get('/dates', getPlayedDates);

module.exports = router;