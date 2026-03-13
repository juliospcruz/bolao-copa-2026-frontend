import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface Match sincronizada com o JSON do console e as colunas do PostgreSQL.
 */
export interface Match {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    flagUrl: string;
    groupLetter: string;
  };
  awayTeam: {
    id: number;
    name: string;
    flagUrl: string;
    groupLetter: string;
  };
  matchDate: string; // Coluna match_date do pgAdmin
  stadium: string | null; // Coluna stadium (pode ser null no banco)
  homeScore: number | null; // Coluna home_score
  awayScore: number | null; // Coluna away_score
  phase: string; // Coluna phase
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  // Porta 8081 configurada para o Spring Boot
  private apiUrl = 'http://localhost:8081/api/matches';

  constructor(private http: HttpClient) { }

  /**
   * Busca a lista de jogos cadastrados no banco de dados.
   */
  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(this.apiUrl);
  }
}
