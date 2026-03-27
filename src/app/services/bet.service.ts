import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Bet } from '../models/bet.model';

@Injectable({
  providedIn: 'root',
})
export class BetService {
  private apiUrl = 'http://localhost:8081/api/bets';

  constructor(private http: HttpClient) {}

  salvarPalpite(bet: Bet): Observable<Bet> {
    return this.http.post<Bet>(this.apiUrl, bet).pipe(retry(1), catchError(this.handleError));
  }

  getBets(): Observable<Bet[]> {
    return this.http.get<Bet[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getBetByMatchId(matchId: number): Observable<Bet> {
    return this.http.get<Bet>(`${this.apiUrl}/match/${matchId}`).pipe(catchError(this.handleError));
  }

  deleteBet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let errorMessage = `Código: ${error.status}, Mensagem: ${error.message}`;
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
