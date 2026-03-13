import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamListComponent } from './components/team-list/team-list';
import { MatchListComponent } from './components/match-list/match-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TeamListComponent, MatchListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent { // ✅ Garanta que o nome aqui seja AppComponent
  title = 'bolao-copa-2026';
}
