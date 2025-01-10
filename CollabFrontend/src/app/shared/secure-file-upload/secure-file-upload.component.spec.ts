import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecureFileUploadComponent } from './secure-file-upload.component';

describe('SecureFileUploadComponent', () => {
  let component: SecureFileUploadComponent;
  let fixture: ComponentFixture<SecureFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecureFileUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecureFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
