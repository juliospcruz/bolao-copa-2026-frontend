import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchService, Match } from '../../services/match.service';
import { TeamService } from '../../services/team';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-list.html',
  styleUrl: './match-list.scss',
})
export class MatchListComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  allMatches: Match[] = [];
  filteredMatches: Match[] = [];
  loading: boolean = true;
  selectedTeamName: string | null = null;
  searchTerm: string = '';

  private subscription: Subscription = new Subscription();

  constructor(
    private matchService: MatchService,
    private teamService: TeamService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarJogos();
    this.ouvirFiltroDeTimes();
  }

  carregarJogos(): void {
    this.loading = true;
    const sub = this.matchService.getMatches().subscribe({
      next: (dados) => {
        // Remove duplicatas e ordena por data
        const uniqueMatches = Array.from(new Map(dados.map((m) => [m.id, m])).values());

        this.allMatches = uniqueMatches.sort(
          (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
        );

        this.aplicarFiltro();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar partidas:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
    this.subscription.add(sub);
  }

  private ouvirFiltroDeTimes(): void {
    const sub = this.teamService.selectedTeam$.subscribe((teamName) => {
      this.selectedTeamName = teamName;
      this.aplicarFiltro();
      this.cdr.detectChanges();
    });
    this.subscription.add(sub);
  }

  onSearch(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.searchTerm = element.value.toLowerCase();
    this.aplicarFiltro();
  }

  /**
   * NOVA LÓGICA: Se um time for selecionado, mostramos todos os jogos do GRUPO dele.
   * Se for busca por texto, filtramos pelo nome do time.
   */
  private aplicarFiltro(): void {
    let result = [...this.allMatches];

    // 1. Prioridade: Se clicou em uma seleção (ex: México no Grupo A)
    if (this.selectedTeamName) {
      // Primeiro, achamos a letra do grupo dessa seleção
      const teamInGroup = this.allMatches.find(
        (m) =>
          m.homeTeam.name === this.selectedTeamName || m.awayTeam.name === this.selectedTeamName,
      );

      const groupLetter = teamInGroup?.homeTeam.groupLetter || teamInGroup?.awayTeam.groupLetter;

      if (groupLetter) {
        // Filtramos todos os jogos que pertencem a esse grupo
        result = result.filter(
          (m) => m.homeTeam.groupLetter === groupLetter || m.awayTeam.groupLetter === groupLetter,
        );
      } else {
        // Fallback: se não achar o grupo, filtra só pelo time
        result = result.filter(
          (m) =>
            m.homeTeam.name === this.selectedTeamName || m.awayTeam.name === this.selectedTeamName,
        );
      }
    }

    // 2. Filtro adicional: Busca por texto (se houver)
    if (this.searchTerm) {
      result = result.filter(
        (m) =>
          m.homeTeam.name.toLowerCase().includes(this.searchTerm) ||
          m.awayTeam.name.toLowerCase().includes(this.searchTerm),
      );
    }

    this.filteredMatches = result;
  }

  trackByMatchId(index: number, match: Match): number {
    return match.id;
  }

  limparFiltro(): void {
    this.searchTerm = '';
    this.selectedTeamName = null;
    this.teamService.selectTeam(null);

    // Limpa o campo de input visualmente usando o ViewChild
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }

    this.aplicarFiltro();
  }

  formatTeamName(name: string): string {
    return name && name.trim() !== '' ? name : 'A definir';
  }

  isToday(dateString: string): boolean {
    const matchDate = new Date(dateString).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    return matchDate === today;
  }

  getPhaseName(phase: string): string {
    const phases: { [key: string]: string } = {
      GROUP_STAGE: 'Fase de Grupos',
      ROUND_OF_32: 'Dezesseis-avos',
      ROUND_OF_16: 'Oitavas de Final',
      QUARTER_FINALS: 'Quartas de Final',
      SEMI_FINALS: 'Semifinal',
      FINAL: 'Grande Final',
    };
    return phases[phase] || phase;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
