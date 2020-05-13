import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaMateriaFComponent } from './area-materia-f.component';

describe('MateriasComponent', () => {
  let component: AreaMateriaFComponent;
  let fixture: ComponentFixture<AreaMateriaFComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaMateriaFComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaMateriaFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
