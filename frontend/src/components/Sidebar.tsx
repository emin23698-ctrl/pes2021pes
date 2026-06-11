import { NavLink } from 'react-router-dom';
import { Trophy, Dices, CalendarPlus, History, Users, Shield } from 'lucide-react';
import './Sidebar.css'; // Stil dosyasını birazdan ekleyeceğiz

export default function Sidebar() {
    const menuItems = [
        { path: '/', name: 'Liderlik Tablosu', icon: <Trophy size={20} /> },
        { path: '/draw', name: 'Kura Çek', icon: <Dices size={20} /> },
        { path: '/add-result', name: 'Turnuva Gir', icon: <CalendarPlus size={20} /> },
        { path: '/history', name: 'Geçmiş Turnuvalar', icon: <History size={20} /> },
        { path: '/players', name: 'Oyuncular', icon: <Users size={20} /> },
        { path: '/teams', name: 'Takımlar', icon: <Shield size={20} /> },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>PES 2021 Lig</h2>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}