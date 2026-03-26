import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, shareReplay } from 'rxjs/operators';

// Interface para o Time (Reutilizável)
export interface MatchTeam {
  id?: number;
  name: string;
  flagUrl: string;
  groupLetter?: string;
}

// Interface Principal da Partida
export interface Match {
  id: number;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string; // ISO String vinda do Java
  stadium: string;
  phase: string;
}

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  // Ajustado para a porta padrão que você está usando no Spring Boot
  private readonly apiUrl = 'http://localhost:8081/api/matches';

  constructor(private http: HttpClient) {}

  /**
   * Retorna todos os jogos.
   * shareReplay(1) evita que o Angular faça várias requisições iguais
   * se dois componentes chamarem o serviço ao mesmo tempo.
   */
  getMatches(): Observable<Match[]> {
    return this.http
      .get<Match[]>(this.apiUrl)
      .pipe(retry(2), shareReplay(1), catchError(this.handleError));
  }

  /**
   * Busca um jogo específico pelo ID
   */
  getMatchById(id: number): Observable<Match> {
    return this.http.get<Match>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * Filtra jogos por fase (ex: 'GROUP_STAGE', 'FINAL')
   */
  getMatchesByPhase(phase: string): Observable<Match[]> {
    return this.http
      .get<Match[]>(`${this.apiUrl}/phase/${phase}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Método para atualizar placar (Útil para o seu projeto de Bolão)
   */
  updateScore(matchId: number, homeScore: number, awayScore: number): Observable<Match> {
    const body = { homeScore, awayScore };
    return this.http
      .put<Match>(`${this.apiUrl}/${matchId}/score`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * Tratamento de erros centralizado
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';

    if (error.error instanceof ErrorEvent) {
      // Erro no lado do cliente (Angular)
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro no lado do servidor (Spring Boot/Postgres)
      if (error.status === 0) {
        errorMessage =
          'Não foi possível conectar ao servidor. Verifique se o Backend está rodando na porta 8081.';
      } else {
        errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
