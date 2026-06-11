const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Gelen JSON verilerini parse etmek için

// Routes (Şimdilik test için boş bırakıyoruz, rotaları yazdıkça buraya ekleyeceğiz)
// const playerRoutes = require('./routes/playerRoutes');
// app.use('/api/players', playerRoutes);

// Routes'ları içeri aktar
const playerRoutes = require('./routes/playerRoutes');
const teamRoutes = require('./routes/teamRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes'); 

// Routes'ları kullan
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tournaments', tournamentRoutes); 

app.get('/', (req, res) => {
  res.send('PES Lig API Sorunsuz Çalışıyor!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});