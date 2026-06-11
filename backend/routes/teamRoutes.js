const express = require('express');
const router = express.Router();
const { createTeam, getActiveTeams } = require('../controllers/teamController');

// "/api/teams" adresine gelecek istekler
router.post('/createTeam', createTeam);
router.get('/getTeams', getActiveTeams);

module.exports = router;