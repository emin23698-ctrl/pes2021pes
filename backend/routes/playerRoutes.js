const express = require('express');
const router = express.Router();
const { createPlayer, getAllPlayers } = require('../controllers/playerController');

// "/api/players" adresine gelecek istekler
router.post('/createPlayer', createPlayer);
router.get('/getPlayers', getAllPlayers);

module.exports = router;