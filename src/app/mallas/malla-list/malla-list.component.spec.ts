import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MallaListComponent } from './malla-list.component';

describe('MallaListComponent', () => {
  let component: MallaListComponent;
  let fixture: ComponentFixture<MallaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MallaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MallaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
