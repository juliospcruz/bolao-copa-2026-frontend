import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService, Team } from '../../services/team';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-list.html',
  styleUrl: './team-list.scss',
})
export class TeamListComponent implements OnInit, OnDestroy {
  allTeams: Team[] = [];
  groupedTeams: { [key: string]: Team[] } = {};
  groupLetters: string[] = [];
  loading: boolean = true;
  searchTerm: string = '';
  selectedGroup: string | null = null; // ✅ Nova variável para controlar o grupo focado
  private subscription: Subscription = new Subscription();

  constructor(private teamService: TeamService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarTimes();
  }

  carregarTimes(): void {
    this.loading = true;
    const sub = this.teamService.getTeams().subscribe({
      next: (data) => {
        this.allTeams = data;
        this.filtrarEAgrupar();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
    this.subscription.add(sub);
  }

  // ✅ Lógica aprimorada: diferencia busca por texto de clique no grupo
  filtrarEAgrupar(): void {
    const groups: { [key: string]: Team[] } = {};

    this.allTeams.forEach(team => {
      const letter = team.groupLetter || '?';
      if (!groups[letter]) groups[letter] = [];

      const matchesSearch = !this.searchTerm ||
                            team.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesGroup = !this.selectedGroup || letter === this.selectedGroup;

      if (matchesSearch && matchesGroup) {
        groups[letter].push(team);
      }
    });

    this.groupLetters = Object.keys(groups)
      .filter(letter => groups[letter].length > 0)
      .sort();

    this.groupedTeams = groups;
    this.cdr.detectChanges();
  }

  // ✅ Função para quando clica na linha da seleção
  selecionarTime(team: Team) {
    // Se clicar no mesmo grupo, limpa. Se for outro, foca nele.
    this.selectedGroup = this.selectedGroup === team.groupLetter ? null : team.groupLetter;

    // Avisa o Service para filtrar os jogos (Passamos o nome ou o grupo conforme sua lógica de backend)
    this.teamService.selectTeam(this.selectedGroup ? team.name : null);

    this.filtrarEAgrupar();
  }

  limparFiltros() {
    this.searchTerm = '';
    this.selectedGroup = null;
    this.teamService.selectTeam(null);
    this.filtrarEAgrupar();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
