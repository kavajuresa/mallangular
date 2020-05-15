import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MallaMateriaComponent } from './malla-materia.component';

describe('MallaMateriaComponent', () => {
  let component: MallaMateriaComponent;
  let fixture: ComponentFixture<MallaMateriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MallaMateriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MallaMateriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
