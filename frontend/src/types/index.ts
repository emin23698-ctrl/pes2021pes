// src/types/index.ts

export interface Player {
    id: number;
    name: string;
    surname: string;
}

export interface Team {
    id: number;
    name: string;
    power: number;
    is_active: boolean;
    league: string;
}

export interface LeaderboardEntry {
    id: number;
    name: string;
    surname: string;
    general_average: string; // PostgreSQL'den decimal/numeric geldiği için string olabilir, çevireceğiz.
    matches_played: string;
}

export interface DrawResult {
    playerName: string;
    averageScore: string;
    assignedTeam: string;
    teamPower: number;
}