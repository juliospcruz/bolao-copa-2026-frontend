import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService, Team } from '../../services/team.service'; // ✅ Agora o import funciona
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-list.html',
  styleUrl: './team-list.scss',
})
export class TeamListComponent implements OnInit, OnDestroy {
  teams: Team[] = []; // ✅ Usa a interface vinda do serviço
  private subscription: Subscription = new Subscription();

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.carregarTimes();
  }

  carregarTimes(): void {
    const sub = this.teamService.getTeams().subscribe({
      next: (data: Team[]) => {
        this.teams = data;
        console.log('Times carregados:', this.teams);
      },
      error: (err) => console.error('Erro no backend:', err),
    });
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
