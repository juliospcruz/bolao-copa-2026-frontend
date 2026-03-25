import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchService, Match } from '../../services/match.service';
import { TeamService } from '../../services/team'; // Importe o seu service de times

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-list.html',
  styleUrl: './match-list.scss'
})
export class MatchListComponent implements OnInit {
  matches: Match[] = [];
  allMatches: Match[] = []; // Backup da lista completa para o filtro funcionar
  loading: boolean = true;

  constructor(
    private matchService: MatchService,
    private teamService: TeamService, // Injetando o service de times
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarJogos();
    this.ouvirFiltroDeTimes(); // Inicia a escuta do clique nas seleções
  }

  carregarJogos(): void {
    this.loading = true;

    this.matchService.getMatches().subscribe({
      next: (dados) => {
        console.log('Dados recebidos:', dados);
        this.allMatches = dados || []; // Salva no backup
        this.matches = [...this.allMatches]; // Exibe todos inicialmente

        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('Erro ao carregar partidas:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private ouvirFiltroDeTimes(): void {
    // Inscreve-se para saber quando um time for clicado no topo
    this.teamService.selectedTeam$.subscribe(teamName => {
      if (teamName) {
        // Filtra os jogos onde o time clicado participa
        this.matches = this.allMatches.filter(m =>
          m.homeTeam.name === teamName || m.awayTeam.name === teamName
        );
      } else {
        // Se o filtro for limpo, volta a mostrar todos os jogos
        this.matches = [...this.allMatches];
      }
      this.cdr.detectChanges(); // Atualiza a tela imediatamente
    });
  }

  getPhaseName(phase: string): string {
    const phases: { [key: string]: string } = {
      'GROUP_STAGE': 'Fase de Grupos',
      'ROUND_OF_32': 'Dezesseis-avos de Final', // Novo
      'ROUND_OF_16': 'Oitavas de Final',
      'QUARTER_FINALS': 'Quartas de Final',
      'SEMI_FINALS': 'Semifinal',
      'FINAL': 'Final'
    };
    return phases[phase] || phase;
  }
}
