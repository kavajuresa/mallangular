import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoMateriaFComponent } from './tipo-materia-f.component';

describe('MateriasComponent', () => {
  let component: TipoMateriaFComponent;
  let fixture: ComponentFixture<TipoMateriaFComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TipoMateriaFComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoMateriaFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
