import { Injectable } from '@angular/core'; // ✅ O correto é @angular/core
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface exportada aqui para evitar definições circulares
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

  constructor(private http: HttpClient) { }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }
}
