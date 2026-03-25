import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Team {
  id: number;
  name: string;
  flagUrl: string;
  groupLetter: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:8081/api/teams';

  // O "canal de rádio" que avisa qual time foi clicado
  private selectedTeamSource = new BehaviorSubject<string | null>(null);
  selectedTeam$ = this.selectedTeamSource.asObservable();

  constructor(private http: HttpClient) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  // Função para mudar o time selecionado
  selectTeam(teamName: string | null) {
    this.selectedTeamSource.next(teamName);
  }
}
