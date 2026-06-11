// src/pages/DrawTeams.tsx
import { useEffect, useState } from 'react';
import api from '../api';
import type { Player, DrawResult } from '../types';

export default function DrawTeams() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
    const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [drawing, setDrawing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // BAŞLANGIÇ DEĞERİ DÜZELTİLDİ
    const [selectedLeague, setSelectedLeague] = useState<string>('Şampiyonlar Ligi');

    // Sayfa açıldığında tüm oyuncuları db'den çek
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await api.get('/players/getPlayers');
                setPlayers(response.data);
            } catch (err) {
                setError('Oyuncular yüklenirken hata oluştu.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    // Checkbox işaretlendiğinde veya kaldırıldığında çalışır
    const handleCheckboxChange = (id: number) => {
        setSelectedPlayerIds((prev) =>
            prev.includes(id)
                ? prev.filter(playerId => playerId !== id) // Varsa çıkar
                : [...prev, id] // Yoksa ekle
        );
    };

    // Kura Çek butonuna basıldığında çalışır
    const handleDraw = async () => {
        if (selectedPlayerIds.length < 2) {
            alert('Kura çekmek için en az 2 kişi seçmelisiniz!');
            return;
        }

        setDrawing(true);
        setError(null);

        try {
            const response = await api.post('/tournaments/draw', {
                playerIds: selectedPlayerIds,
                league: selectedLeague
            });
            setDrawResults(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Kura çekilirken bir hata oluştu. Yeterli takım olmayabilir.');
            console.error(err);
        } finally {
            setDrawing(false);
        }
    };

    if (loading) return <div>Oyuncular yükleniyor...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Otomatik Kura Çekimi</h1>

            <div className="draw-container">
                {/* Sol Taraf: Oyuncu Seçimi ve Lig Seçimi */}
                <div>
                    <h3 style={{ marginTop: 0, color: '#334155' }}>Bugün Kimler Oynuyor?</h3>
                    <div className="player-grid">
                        {players.map(player => (
                            <label key={player.id} className="player-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={selectedPlayerIds.includes(player.id)}
                                    onChange={() => handleCheckboxChange(player.id)}
                                />
                                {player.name}
                            </label>
                        ))}
                    </div>
                    
                    {/* LİG SEÇİM KUTUSU SADECE BURADA KALDI */}
                    <div style={{ marginTop: '20px', marginBottom: '15px' }}>
                        <h3 style={{ marginTop: 0, color: '#334155', fontSize: '1rem' }}>Hangi Ligden Kura Çekilecek?</h3>
                        <select
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', cursor: 'pointer' }}
                            value={selectedLeague}
                            onChange={(e) => setSelectedLeague(e.target.value)}
                        >
                            <option value="Şampiyonlar Ligi">Şampiyonlar Ligi</option>
                            <option value="Süper Lig">Süper Lig</option>
                            <option value="Premier Lig">Premier Lig</option>
                            <option value="La Liga">La Liga</option>
                            <option value="Milli Takımlar">Milli Takımlar</option>
                            <option value="Diğer">Diğer</option>
                        </select>
                    </div>

                    <button
                        className="draw-button"
                        onClick={handleDraw}
                        disabled={drawing || selectedPlayerIds.length === 0}
                    >
                        {drawing ? 'Kura Çekiliyor...' : 'Kura Çek'}
                    </button>

                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                </div>

                {/* Sağ Taraf: Kura Sonuçları */}
                <div>
                    <h3 style={{ marginTop: 0, color: '#334155' }}>Eşleşme Sonuçları</h3>
                    {drawResults.length === 0 ? (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            Kura sonuçları burada görünecek...
                        </div>
                    ) : (
                        <div>
                            {drawResults.map((result, index) => (
                                <div key={index} className="result-card">
                                    <div>
                                        <div className="result-player">{result.playerName}</div>
                                        <div className="result-details">Ortalama: {result.averageScore} Puan</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="result-team">{result.assignedTeam}</div>
                                        <div className="result-details">Güç: {result.teamPower}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}