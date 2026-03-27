import { TestBed } from '@angular/core/testing';

import { Bet } from './bet.service';

describe('Bet', () => {
  let service: Bet;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
