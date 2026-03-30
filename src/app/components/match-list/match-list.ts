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
  searchTerm: string = '';
  matchSelecionada: Match | null = null;
  filterStatus: 'all' | 'pending' | 'completed' = 'all';
  showToast: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(
    private matchService: MatchService,
    private betService: BetService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;
    forkJoin({
      matches: this.matchService.getMatches().pipe(catchError(() => of([]))),
      bets: this.betService.getBets().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.allMatches = res.matches.sort(
          (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
        );
        this.userBets = res.bets || [];
        this.aplicarFiltro();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.loading = false),
    });
  }

  // Previne erro TS7053 e busca o grupo corretamente
  getGroupValue(team: any): string {
    return team?.groupLetter || team?.group || '';
  }

  setFilterStatus(status: 'all' | 'pending' | 'completed') {
    this.filterStatus = status;
    this.aplicarFiltro();
  }

  onSearch(e: Event) {
    this.searchTerm = (e.target as HTMLInputElement).value;
    this.aplicarFiltro();
  }

  limparFiltro() {
    this.searchTerm = '';
    this.filterStatus = 'all';
    if (this.searchInput) this.searchInput.nativeElement.value = '';
    this.aplicarFiltro();
  }

  private aplicarFiltro(): void {
    let result = [...this.allMatches];
    const termo = this.searchTerm.toLowerCase().trim();

    if (termo) {
      result = result.filter(
        (m) =>
          m.homeTeam.name.toLowerCase().includes(termo) ||
          m.awayTeam.name.toLowerCase().includes(termo) ||
          m.stadium.toLowerCase().includes(termo),
      );
    }

    if (this.filterStatus === 'pending') {
      result = result.filter((m) => !this.getBetForMatch(m.id));
    } else if (this.filterStatus === 'completed') {
      result = result.filter((m) => !!this.getBetForMatch(m.id));
    }

    this.filteredMatches = result;
    this.cdr.detectChanges();
  }

  registrarPalpite(palpite: Bet) {
    this.betService.salvarPalpite(palpite).subscribe(() => {
      this.matchSelecionada = null;
      this.carregarDados();
      this.exibirToast();
    });
  }

  get totalPalpites(): number {
    return this.userBets.length;
  }
  get totalJogos(): number {
    return this.allMatches.length;
  }
  get percentualProgresso(): number {
    return this.totalJogos > 0 ? (this.totalPalpites / this.totalJogos) * 100 : 0;
  }
  getBetForMatch(id: number) {
    return this.userBets.find((b) => b.matchId === id);
  }
  exibirToast() {
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
  abrirPalpite(m: Match) {
    this.matchSelecionada = m;
  }
  trackByMatchId(i: number, m: Match) {
    return m.id;
  }
  formatTeamName(n: string) {
    return n || 'A definir';
  }
  isToday(d: string) {
    return new Date(d).toLocaleDateString() === new Date().toLocaleDateString();
  }
  getPhaseName(p: string) {
    const map: any = {
      GROUP_STAGE: 'Fase de Grupos',
      ROUND_OF_16: 'Oitavas',
      QUARTER_FINALS: 'Quartas',
      FINAL: 'Final',
    };
    return map[p] || p;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
