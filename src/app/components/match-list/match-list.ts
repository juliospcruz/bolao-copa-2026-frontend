import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatchService, Match } from '../../services/match.service';
import { TeamService } from '../../services/team';
import { BetService } from '../../services/bet.service';
import { BetModalComponent } from '../bet-modal/bet-modal';
import { Bet } from '../../models/bet.model';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, BetModalComponent],
  templateUrl: './match-list.html',
  styleUrl: './match-list.scss',
})
export class MatchListComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  allMatches: Match[] = [];
  filteredMatches: Match[] = [];
  userBets: Bet[] = [];
  loading: boolean = true;
  selectedTeamName: string | null = null;
  searchTerm: string = '';
  matchSelecionada: Match | null = null;

  private subscription: Subscription = new Subscription();

  constructor(
    private matchService: MatchService,
    private teamService: TeamService,
    private betService: BetService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    this.ouvirFiltroDeTimes();
  }

  get totalPalpites(): number {
    return this.userBets ? this.userBets.length : 0;
  }
  get totalJogos(): number {
    return this.allMatches.length;
  }
  get percentualProgresso(): number {
    if (this.totalJogos === 0) return 0;
    return (this.totalPalpites / this.totalJogos) * 100;
  }

  carregarDados(): void {
    this.loading = true;
    const sub = forkJoin({
      matches: this.matchService.getMatches().pipe(catchError(() => of([]))),
      bets: this.betService.getBets().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        const uniqueMatches = Array.from(new Map(res.matches.map((m) => [m.id, m])).values());
        this.allMatches = uniqueMatches.sort(
          (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
        );
        this.userBets = res.bets || [];
        this.aplicarFiltro();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
    this.subscription.add(sub);
  }

  limparTodosOsPalpites(): void {
    if (this.userBets.length === 0) return;
    if (confirm('Deseja apagar TODOS os seus palpites?')) {
      this.loading = true;
      const deletes = this.userBets.map((bet) => this.betService.deleteBet(bet.id!));
      forkJoin(deletes).subscribe({
        next: () => this.carregarDados(),
        error: () => this.carregarDados(),
      });
    }
  }

  getBetForMatch(matchId: number): Bet | undefined {
    if (!this.userBets) return undefined;
    return this.userBets.find((b) => b.matchId === matchId);
  }

  abrirPalpite(match: Match) {
    this.matchSelecionada = match;
  }

  registrarPalpite(palpite: Bet) {
    this.betService.salvarPalpite(palpite).subscribe({
      next: () => {
        this.matchSelecionada = null;
        this.carregarDados();
      },
      error: (err) => console.error('Erro ao salvar palpite:', err),
    });
  }

  private aplicarFiltro(): void {
    let result = [...this.allMatches];
    if (this.selectedTeamName) {
      const teamInGroup = this.allMatches.find(
        (m) =>
          m.homeTeam.name === this.selectedTeamName || m.awayTeam.name === this.selectedTeamName,
      );
      const groupLetter = teamInGroup?.homeTeam.groupLetter || teamInGroup?.awayTeam.groupLetter;
      if (groupLetter) {
        result = result.filter(
          (m) => m.homeTeam.groupLetter === groupLetter || m.awayTeam.groupLetter === groupLetter,
        );
      }
    }
    if (this.searchTerm) {
      result = result.filter(
        (m) =>
          m.homeTeam.name.toLowerCase().includes(this.searchTerm) ||
          m.awayTeam.name.toLowerCase().includes(this.searchTerm),
      );
    }
    this.filteredMatches = result;
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

  limparFiltro(): void {
    this.searchTerm = '';
    this.selectedTeamName = null;
    this.teamService.selectTeam(null);
    if (this.searchInput) this.searchInput.nativeElement.value = '';
    this.aplicarFiltro();
  }

  trackByMatchId(index: number, match: Match): number {
    return match.id;
  }
  formatTeamName(name: string): string {
    return name && name.trim() !== '' ? name : 'A definir';
  }
  isToday(dateString: string): boolean {
    return new Date(dateString).toLocaleDateString() === new Date().toLocaleDateString();
  }

  getPhaseName(phase: string): string {
    const phases: any = {
      GROUP_STAGE: 'Fase de Grupos',
      ROUND_OF_16: 'Oitavas',
      QUARTER_FINALS: 'Quartas',
      FINAL: 'Final',
    };
    return phases[phase] || phase;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
