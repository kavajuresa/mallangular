import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog, MatTable, MatTableDataSource} from '@angular/material';
import {DataService} from '../../../shared/crud-service/data.service';
import {TipoMateriaFComponent} from '../form-dialog/tipo-materia-f.component';
import {TipoMateria} from '../../../models/TipoMateria';


/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: 'app-tipo-materia',
  styleUrls: ['./tipo-materia.component.css'],
  templateUrl: './tipo-materia.component.html',
})
export class TipoMateriaComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'nombre', 'accion'];
  data: MatTableDataSource<any>;
  resultsLength = 0;
  isLoadingResults = true;
  searchKey: string;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  constructor(private DS: DataService, private dialog: MatDialog) {}

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.getAll();
  }
  getAll() {
    this.DS.readObs(TipoMateria).subscribe(res => {
      this.data = new MatTableDataSource(res);
      this.resultsLength = this.data.data.length;
      this.data.sort = this.sort;
      this.data.paginator = this.paginator;
      this.isLoadingResults = false;
    });
  }
  onSearchClear() {
    this.searchKey = '';
    this.applyFilter('');
  }

  applyFilter = (value: string) => {
    this.data.filter = this.searchKey.trim().toLocaleLowerCase();
    this.resultsLength = this.data.filteredData.length;
  }
  openDialog(action, obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(TipoMateriaFComponent, {
      disableClose: true,
      autoFocus: true,
      width: '60%',
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Agregar') {
        this.addRowData(result.data);
      } else if (result.event === 'Actualizar') {
        this.updateRowData(result.data);
      } else if (result.event === 'Borrar') {
        this.deleteRowData(result.data);
      }
    });
  }
  addRowData(rowObj) {
    this.data.data.push({
      id: rowObj.id,
      nombre: rowObj.nombre,
    });
    this.table.renderRows();
  }
  updateRowData(rowObj) {
    this.data.data = this.data.data.filter((value, key) => {
      if (value.id === rowObj.id) {
        value.nombre = rowObj.nombre;
      }
      return true;
    });
  }
  deleteRowData(rowObj) {
    this.data.data = this.data.data.filter((value, key) => {
      return value.id !== rowObj.id;
    });
    this.resultsLength = this.data.filteredData.length;
  }
}

