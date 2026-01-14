import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationFilterComponent } from './notification-filter.component';

describe('NotificationFilterComponent', () => {
  let component: NotificationFilterComponent;
  let fixture: ComponentFixture<NotificationFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
