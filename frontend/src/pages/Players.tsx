import { useEffect, useState } from 'react';
import api from '../api';
import type { Player } from '../types';

export default function Players() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Oyuncuları Getir
    const fetchPlayers = async () => {
        try {
            const response = await api.get('/players/getPlayers');
            setPlayers(response.data);
        } catch (err) {
            console.error('Oyuncular çekilemedi', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    // Yeni Oyuncu Ekle
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            await api.post('/players/createPlayer', { name, surname });
            setMessage({ type: 'success', text: 'Oyuncu başarıyla eklendi!' });
            setName('');
            setSurname('');
            fetchPlayers(); // Listeyi yenile
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Oyuncu eklenirken bir hata oluştu.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Oyuncular</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Sol Taraf: Oyuncu Ekleme Formu */}
                <div>
                    <h3 style={{ marginTop: 0, color: '#334155' }}>Yeni Oyuncu Ekle</h3>
                    <form onSubmit={handleSubmit} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div className="form-group">
                            <label className="form-label">Ad</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Soyad</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={surname} 
                                onChange={(e) => setSurname(e.target.value)} 
                                required 
                            />
                        </div>

                        {message && (
                            <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
                                {message.text}
                            </div>
                        )}

                        <button type="submit" className="draw-button" disabled={submitting}>
                            {submitting ? 'Ekleniyor...' : 'Oyuncu Ekle'}
                        </button>
                    </form>
                </div>

                {/* Sağ Taraf: Oyuncu Listesi */}
                <div>
                    <h3 style={{ marginTop: 0, color: '#334155' }}>Kayıtlı Oyuncular</h3>
                    {loading ? <div>Yükleniyor...</div> : (
                        <div className="table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Ad Soyad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map(player => (
                                        <tr key={player.id}>
                                            <td>#{player.id}</td>
                                            <td style={{ fontWeight: '500' }}>{player.name} {player.surname}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}