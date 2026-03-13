import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchService, Match } from '../../services/match.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-list.html',
  styleUrl: './match-list.scss'
})
export class MatchListComponent implements OnInit {
  // Inicializamos com um array vazio para o *ngFor no HTML não dar erro de undefined
  matches: Match[] = [];

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    this.carregarJogos();
  }

  carregarJogos(): void {
    console.log('Iniciando busca de jogos no backend...');

    this.matchService.getMatches().subscribe({
      next: (dados) => {
        // Atribuímos os dados vindos do backend à nossa variável local
        this.matches = dados;
        console.log('Jogos processados e atribuídos à tela:', this.matches);
      },
      error: (err) => {
        console.error('Erro de conexão! Verifique se o Spring Boot na 8081 está ativo:', err);
      }
    });
  }
}
