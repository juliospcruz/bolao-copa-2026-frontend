import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Match } from '../../services/match.service';
import { Bet } from '../../models/bet.model'; // Importe a interface aqui

@Component({
  selector: 'app-bet-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bet-modal.html',
  styleUrl: './bet-modal.scss',
})
export class BetModalComponent {
  @Input() match!: Match;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Bet>();

  homeScore: number = 0;
  awayScore: number = 0;

  // Alterado de confirmar para salvar para bater com o HTML
  salvar() {
    if (this.homeScore < 0 || this.awayScore < 0) {
      alert('Os placares não podem ser negativos!');
      return;
    }

    const novoPalpite: Bet = {
      matchId: this.match.id,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
    };

    this.saved.emit(novoPalpite);
  }
}
