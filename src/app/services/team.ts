import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  // URL da sua API Spring Boot
  private apiUrl = 'http://localhost:8081/api/teams';

  constructor(private http: HttpClient) {}

  // Busca a lista de seleções que vimos no navegador
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
