import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasscodePopupComponent } from './passcode-popup.component';

describe('PasscodePopupComponent', () => {
  let component: PasscodePopupComponent;
  let fixture: ComponentFixture<PasscodePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasscodePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasscodePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
