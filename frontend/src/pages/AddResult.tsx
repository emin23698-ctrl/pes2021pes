import { useEffect, useState } from 'react';
import api from '../api';
import type { Player } from '../types';

export default function AddResult() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [matchDate, setMatchDate] = useState<string>('');
    // Hangi oyuncunun kaç puan aldığını tutacağımız state: { player_id: score }
    const [results, setResults] = useState<{ [key: number]: number | '' }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await api.get('/players/getPlayers');
                setPlayers(response.data);
            } catch (err) {
                console.error('Oyuncular yüklenemedi', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    // Checkbox işaretlendiğinde puan girme alanını açar/kapatır
    const handleCheckboxChange = (playerId: number) => {
        setResults(prev => {
            const newResults = { ...prev };
            if (newResults[playerId] !== undefined) {
                delete newResults[playerId]; // Checkbox kaldırıldıysa sil
            } else {
                newResults[playerId] = ''; // İşaretlendiyse boş puanla ekle
            }
            return newResults;
        });
    };

    const handleScoreChange = (playerId: number, score: string) => {
        setResults(prev => ({
            ...prev,
            [playerId]: score === '' ? '' : Number(score)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!matchDate) {
            setMessage({ type: 'error', text: 'Lütfen bir maç tarihi seçin.' });
            return;
        }

        const activePlayerIds = Object.keys(results).map(Number);
        if (activePlayerIds.length === 0) {
            setMessage({ type: 'error', text: 'Lütfen en az bir oyuncu seçin.' });
            return;
        }

        const hasEmptyScores = activePlayerIds.some(id => results[id] === '');
        if (hasEmptyScores) {
            setMessage({ type: 'error', text: 'Lütfen seçtiğiniz tüm oyuncuların puanlarını girin.' });
            return;
        }

        setSubmitting(true);

        const formattedResults = activePlayerIds.map(id => ({
            player_id: id,
            score: Number(results[id])
        }));

        try {
            // Backend endpointimiz /tournaments/create
            await api.post('/tournaments/create', {
                match_date: matchDate,
                results: formattedResults
            });
            setMessage({ type: 'success', text: 'Turnuva sonucu başarıyla kaydedildi!' });
            setMatchDate('');
            setResults({}); // Formu sıfırla
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Kayıt sırasında bir hata oluştu. (Bu tarih daha önce girilmiş olabilir)' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Turnuva Sonucu Ekle</h1>

            <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
                <div className="form-group">
                    <label className="form-label">Turnuva Tarihi</label>
                    <input 
                        type="date" 
                        className="form-input" 
                        value={matchDate} 
                        onChange={(e) => setMatchDate(e.target.value)} 
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Oynayanlar ve Puanları</label>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {players.map(player => (
                            <div key={player.id} style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    <input 
                                        type="checkbox" 
                                        style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }}
                                        checked={results[player.id] !== undefined}
                                        onChange={() => handleCheckboxChange(player.id)}
                                    />
                                    {player.name} {player.surname}
                                </label>
                                
                                {results[player.id] !== undefined && (
                                    <div className="score-input-container">
                                        <span>Aldığı Puan:</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            className="score-input"
                                            value={results[player.id]}
                                            onChange={(e) => handleScoreChange(player.id, e.target.value)}
                                            placeholder="Örn: 15"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {message && (
                    <div style={{ 
                        padding: '12px', 
                        marginBottom: '15px', 
                        borderRadius: '6px', 
                        backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#991b1b'
                    }}>
                        {message.text}
                    </div>
                )}

                <button type="submit" className="draw-button" disabled={submitting}>
                    {submitting ? 'Kaydediliyor...' : 'Turnuvayı Kaydet'}
                </button>
            </form>
        </div>
    );
}