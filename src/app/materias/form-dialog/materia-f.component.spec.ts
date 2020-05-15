import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaFComponent } from './materia-f.component';

describe('MateriasComponent', () => {
  let component: MateriaFComponent;
  let fixture: ComponentFixture<MateriaFComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MateriaFComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MateriaFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
