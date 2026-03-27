import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetModal } from './bet-modal';

describe('BetModal', () => {
  let component: BetModal;
  let fixture: ComponentFixture<BetModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetModal],
    }).compileComponents();

    fixture = TestBed.createComponent(BetModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
