import { TestBed } from '@angular/core/testing';

import { PetsInfoService } from './pets-info.service';

describe('PetsInfoService', () => {
  let service: PetsInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PetsInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
