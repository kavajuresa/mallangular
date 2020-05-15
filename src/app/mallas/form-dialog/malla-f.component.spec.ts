import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MallaFComponent } from './malla-f.component';

describe('MateriasComponent', () => {
  let component: MallaFComponent;
  let fixture: ComponentFixture<MallaFComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MallaFComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MallaFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
