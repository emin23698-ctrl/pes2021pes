// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import api from '../api';
import type { LeaderboardEntry } from '../types';

export default function Dashboard() {
    // State tanımlamaları
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Component yüklendiğinde veriyi çek
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/tournaments/leaderboard');
                setLeaderboard(response.data);
            } catch (err) {
                setError('Liderlik tablosu yüklenirken bir hata oluştu.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    // Yüklenme ve Hata Durumları
    if (loading) return <div>Puan durumu hesaplanıyor...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Genel Ortalama (Liderlik Tablosu)</h1>
            
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Sıra</th>
                            <th>Oyuncu</th>
                            <th>Ortalama Puan</th>
                            <th>Oynanan Maç</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry, index) => (
                            <tr key={entry.id}>
                                <td>{index + 1}</td>
                                <td>{entry.name} {entry.surname}</td>
                                <td className="score-cell">{entry.general_average}</td>
                                <td>{entry.matches_played}</td>
                            </tr>
                        ))}
                        {leaderboard.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                                    Henüz maç oynanmamış.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}