import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentEditDialogComponent } from './appointment-edit-dialog.component';

describe('AppointmentEditDialogComponent', () => {
  let component: AppointmentEditDialogComponent;
  let fixture: ComponentFixture<AppointmentEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
