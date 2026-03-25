// src/app/services/match.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Match {
  id: number;
  homeTeam: { name: string; flagUrl: string };
  awayTeam: { name: string; flagUrl: string };
  homeScore: number;
  awayScore: number;
  matchDate: string;
  stadium: string;
  phase: string;
}

@Injectable({ providedIn: 'root' })
export class MatchService {
  private apiUrl = 'http://localhost:8081/api/matches';

  constructor(private http: HttpClient) {}

  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(this.apiUrl);
  }
}
