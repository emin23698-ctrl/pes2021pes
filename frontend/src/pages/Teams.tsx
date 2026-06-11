import { useEffect, useState } from 'react';
import api from '../api';
import type { Team } from '../types';

export default function Teams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [name, setName] = useState('');
    const [power, setPower] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [league, setLeague] = useState('Şampiyonlar Ligi'); 
    
    // Sağ taraftaki liste için filtreleme state'i
    const [selectedViewLeague, setSelectedViewLeague] = useState<string>('Şampiyonlar Ligi');

    // Takımları Getir
    const fetchTeams = async () => {
        try {
            const response = await api.get('/teams/getTeams');
            setTeams(response.data);
        } catch (err) {
            console.error('Takımlar çekilemedi', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    // Yeni Takım Ekle
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        if (Number(power) < 1 || Number(power) > 100) {
            setMessage({ type: 'error', text: 'Takım gücü 1 ile 100 arasında olmalıdır.' });
            setSubmitting(false);
            return;
        }

        try {
            await api.post('/teams/createTeam', { name, power: Number(power), league });
            setMessage({ type: 'success', text: 'Takım başarıyla eklendi!' });
            setName('');
            setPower('');
            fetchTeams(); // Listeyi yenile
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Takım eklenirken bir hata oluştu. (Bu isimde bir takım zaten olabilir)' });
        } finally {
            setSubmitting(false);
        }
    };

    // Dinamik olarak var olan ligleri tespit et
    const uniqueLeagues = Array.from(new Set(teams.map(t => t.league || 'Şampiyonlar Ligi')));
    const filterOptions = ['Tümü', ...uniqueLeagues];

    // Ekranda gösterilecek takımları filtrele
    const displayedTeams = selectedViewLeague === 'Tümü' 
        ? teams 
        : teams.filter(t => (t.league || 'Şampiyonlar Ligi') === selectedViewLeague);

    // Filtrelenmiş takımları liglerine göre grupla
    const groupedTeams = displayedTeams.reduce((acc, team) => {
        const leagueName = team.league || 'Şampiyonlar Ligi';
        if (!acc[leagueName]) {
            acc[leagueName] = [];
        }
        acc[leagueName].push(team);
        return acc;
    }, {} as Record<string, Team[]>);

    return (
        <div className="page-container">
            <h1 className="page-title">Takımlar</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Sol Taraf: Takım Ekleme Formu */}
                <div>
                    <h3 style={{ marginTop: 0, color: '#334155' }}>Yeni Takım Ekle</h3>
                    <form onSubmit={handleSubmit} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div className="form-group">
                            <label className="form-label">Takım Adı</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Örn: Bayern Münih"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Takım Gücü (1-100)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={power}
                                onChange={(e) => setPower(e.target.value === '' ? '' : Number(e.target.value))}
                                min="1"
                                max="100"
                                placeholder="Örn: 92"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Lig / Kategori</label>
                            <select
                                className="form-input"
                                value={league}
                                onChange={(e) => setLeague(e.target.value)}
                                required
                            >
                                <option value="Şampiyonlar Ligi">Şampiyonlar Ligi</option>
                                <option value="Süper Lig">Süper Lig</option>
                                <option value="Premier Lig">Premier Lig</option>
                                <option value="La Liga">La Liga</option>
                                <option value="Milli Takımlar">Milli Takımlar</option>
                                <option value="Diğer">Diğer</option>
                            </select>
                        </div>

                        {message && (
                            <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
                                {message.text}
                            </div>
                        )}

                        <button type="submit" className="draw-button" disabled={submitting}>
                            {submitting ? 'Ekleniyor...' : 'Takım Ekle'}
                        </button>
                    </form>
                </div>

                {/* Sağ Taraf: Gruplandırılmış Takım Listesi */}
                <div>
                    <h3 style={{ marginTop: 0, color: '#334155', marginBottom: '15px' }}>Aktif Takımlar Havuzu</h3>
                    
                    {/* FİLTRELEME BUTONLARI (SEKMELER) */}
                    {!loading && teams.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            {filterOptions.map(option => (
                                <button
                                    key={option}
                                    onClick={() => setSelectedViewLeague(option)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: selectedViewLeague === option ? '#4f46e5' : 'white',
                                        color: selectedViewLeague === option ? 'white' : '#334155',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: selectedViewLeague === option ? 'bold' : 'normal',
                                        transition: 'all 0.2s',
                                        boxShadow: selectedViewLeague === option ? '0 2px 4px rgba(79, 70, 229, 0.3)' : 'none'
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? <div>Yükleniyor...</div> : (
                        <div className="table-container">
                            {Object.entries(groupedTeams).map(([leagueName, leagueTeams]) => (
                                <div key={leagueName} style={{ marginBottom: '30px' }}>
                                    <h4 style={{ 
                                        color: '#4f46e5', 
                                        borderBottom: '2px solid #e2e8f0', 
                                        paddingBottom: '8px', 
                                        marginBottom: '10px',
                                        marginTop: '0'
                                    }}>
                                        {leagueName}
                                    </h4>
                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Takım</th>
                                                <th>Güç (Overall)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leagueTeams.map(team => (
                                                <tr key={team.id}>
                                                    <td style={{ fontWeight: '500' }}>{team.name}</td>
                                                    <td className="score-cell">{team.power}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                            {Object.keys(groupedTeams).length === 0 && (
                                <div style={{ color: '#64748b', fontStyle: 'italic' }}>Bu ligde henüz takım bulunmuyor.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}