import { useEffect, useState } from 'react';
import api from '../api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Takvimin varsayılan stili

interface HistoryResult {
    name: string;
    surname: string;
    score: number;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function History() {
    const [playedDates, setPlayedDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [results, setResults] = useState<HistoryResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Sayfa açıldığında backend'den maç oynanan tüm tarihleri getir
    useEffect(() => {
        const fetchPlayedDates = async () => {
            try {
                const response = await api.get('/tournaments/dates');
                setPlayedDates(response.data); // Örn: ["2026-06-03", "2026-06-07"]
            } catch (err) {
                console.error("Oynanan tarihler çekilemedi", err);
            }
        };
        fetchPlayedDates();
    }, []);

    // 2. Takvimde bir güne tıklandığında o günün sonuçlarını getir
    const handleDateChange = async (value: Value) => {
        const date = value as Date;
        setSelectedDate(date);
        
        // Saat dilimi hatası almamak için tarihi manuel olarak YYYY-MM-DD formatına çeviriyoruz
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        setLoading(true);
        setError(null);
        setResults([]); // Önceki sonuçları temizle

        try {
            const response = await api.get(`/tournaments/date/${formattedDate}`);
            setResults(response.data);
        } catch (err) {
            setError('Sonuçlar getirilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Takvimdeki günlerin sınıflarını (CSS Class) belirleyen mantık
    const tileClassName = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const checkDate = `${year}-${month}-${day}`;
            
            // Eğer o gün veritabanındaki tarihler arasında varsa, yeşil sınıfını ver
            if (playedDates.includes(checkDate)) {
                return 'played-date';
            }
        }
        return null;
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Geçmiş Turnuvalar</h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                
                {/* Sol Taraf: Takvim */}
                <div>
                    <h3 style={{ marginTop: 0, color: '#334155' }}>Tarih Seç</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '3px', marginRight: '5px' }}></span>
                        Yeşil renkli günler maç yapılan günleri gösterir.
                    </p>
                    
                    <Calendar 
                        onChange={handleDateChange} 
                        value={selectedDate}
                        tileClassName={tileClassName}
                    />
                </div>

                {/* Sağ Taraf: Sonuç Tablosu */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h3 style={{ marginTop: 0, color: '#334155' }}>
                        {selectedDate ? selectedDate.toLocaleDateString('tr-TR') + ' Sonuçları' : 'Sonuçları görmek için tarih seçin'}
                    </h3>

                    {loading && <div>Aranıyor...</div>}
                    {error && <div style={{ color: 'red' }}>{error}</div>}

                    {!loading && selectedDate && results.length === 0 && !error && (
                        <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                            Bu tarihte oynanmış bir maç kaydı bulunamadı. Lütfen yeşil ile işaretli günlerden birini seçin.
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Sıra</th>
                                        <th>Oyuncu</th>
                                        <th>Aldığı Puan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{result.name} {result.surname}</td>
                                            <td className="score-cell">{result.score} Puan</td>
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