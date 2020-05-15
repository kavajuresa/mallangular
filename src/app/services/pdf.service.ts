import { Injectable } from '@angular/core';
import {Observable, Observer} from 'rxjs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private documentDefinition = {
    pageSize: 'A4',
    pageMargins: [ 40, 60, 10, 20 ],
    content: [
      {
        table: {
          body: [
            ['',
              { text:
                  [
                    {text: 'UNIVERSIDAD NACIONAL DE CAAGUAZU\n', style: 'header'},
                    'Con sede en Coronel Oviedo\nCreada por Ley N° 3198 del 4 de Mayo del 2007\n',
                    {text: 'FACULTAD DE CIENCIAS TECNOLÓGICAS\n', style: 'subheader'},
                    {text: 'CARRERA: INGENIERÍA EN INFORMÁTICA\n', style: 'subheader'},
                    {text: 'MALLA CURRICULAR\n', style: 'subheader'},
                    {text: 'AÑO:2010', style: 'subheader'}
                  ]
              },
              ''
            ],
          ]
        },
        layout: 'noBorders'
      },
      {
        style: 'tableExample',
        table: {
          widths: [16, 30, 150, 21, 21, 21, 21, 21, 21 , 30, 30, 30],
          body: []
        }
      },
      {
        style: 'tableAreas',
        table: {
          widths: [20, 50, 180, 28, 28, 28],
          body: [
            [{border: [false, false, false, false], text: ''}, {text: 'Código', bold: true},
              {text: 'Area de Conocimiento', bold: true},
              {text: 'Cant. Materias', bold: true},
              {text: 'Total Horas', bold: true},
              {text: '%', bold: true}]
          ]
        },
      }
    ],
    styles: {
      header: {
        fontSize: 15,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: true,
      },
      tableExample: {
        fontSize: 7,
        margin: [0, 0, 0, 0]
      },
      tableAreas: {
        margin: [0, 20, 0, 0],
        fontSize: 7,
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'black',
        fillColor: '#CCCCCC'
      },
      tablesubHeader: {
        bold: true,
        fontSize: 8,
        color: 'black',
        fillColor: '#CCCCCC'
      },
      tablesubHeader2: {
        bold: true,
        fontSize: 5,
        color: 'black',
        fillColor: '#CCCCCC'
      },
      totales: {
        bold: true,
        fontSize: 10,
        color: 'black',
      },
      subtotales: {
        bold: true,
        fontSize: 9,
        color: 'black',

      }
    },
    defaultStyle: {
      alignment: 'center'
    },
  };
  private semestres = [];
  private materias = [];
  private ordinal = ['PRIMER', 'SEGUNDO', 'TERCER', 'CUARTO', 'QUINTO', 'SEXTO', 'SÉPTIMO', 'OCTAVO', 'NOVENO', 'DÉCIMO'];
  private hmensual = 16; // cantidad mensual de clases de una materia
  private horapasantia = 400;
  init(diagramNodeData, diagramLinkData, areamaterias) {
    diagramNodeData.forEach(e1 => {
      e1.isGroup ? this.semestres.push(e1) : this.materias.push(e1);
    });
    let hts = 0;
    let hps = 0;
    let horatotal = 0;
    let periodo = 1;
    let curso = 1;
    let correlatividades;
    this.semestres.forEach(e1 => {
      periodo = parseInt(e1.text, 10);
      curso = periodo % 2 === 0 ? periodo / 2 : periodo / 2 + 0.5;
      // @ts-ignore
      this.documentDefinition.content[1].table.body.push(
        [{ text: this.ordinal[curso - 1] + ' CURSO, ' + this.ordinal[periodo - 1] + ' SEMESTRE', style: 'tableHeader', colSpan: 9},
          {}, {}, {}, {}, {}, {}, {}, {},
          {border: [false, false, false, false], text: ''},
          {border: [false, false, false, false], text: ''},
          {border: [false, false, false, false], text: ''}],
        [{text: 'Ord.', style: 'tablesubHeader'},
          {text: 'Código', style: 'tablesubHeader'},
          {text: 'Materias', style: 'tablesubHeader'},
          {text: 'Cond.', style: 'tablesubHeader'},
          {text: 'Area', style: 'tablesubHeader'},
          {text: 'C.H.', style: 'tablesubHeader'},
          {text: 'T', style: 'tablesubHeader'},
          {text: 'P', style: 'tablesubHeader'},
          {text: 'TS', style: 'tablesubHeader'},
          {text: 'Correlatividad', colSpan: 3, style: 'tablesubHeader'},
          {}, {}]);
      hts = hps = 0;
      let i = 0;
      this.materias.forEach(e2 => {
        if (e2.group === e1.key) {
          i = i + 1;
          correlatividades = '';
          diagramLinkData.forEach(link => {
            if (link.to === e2.key) {
              correlatividades = correlatividades + this.materias.find(mat => mat.key === link.from).text + ' \n';
            }
          });
          this.documentDefinition.content[1].table.body.push(
            [ i, e2.key, {text: e2.text, alignment: 'left'}, e2.tipo,
              areamaterias.find(areaArray => areaArray.color === e2.color).id,
              e2.HP + e2.HT, e2.HT, e2.HP, (e2.HP + e2.HT) * this.hmensual, {text: correlatividades, colSpan: 3, alignment: 'left'}, {}, {}]
          );
          hts = hts + e2.HT;
          hps = hps + e2.HP;
        }
      });
      horatotal = horatotal + ((hts + hps) * this.hmensual);
      this.documentDefinition.content[1].table.body.push(
        [{ text: '', colSpan: 5, border: [true, false, false, false]}, {}, {}, {}, {},
          { text: '', border: [true, false, false, false]},
          { text: '', border: [true, false, false, false]},
          { text: '', border: [true, false, false, false]},
          { text: '', border: [true, false, false, false]},
          { text: 'Detalles de cargas horarias ' + periodo + '° semestre', colSpan: 3, style: 'tablesubHeader2'}, {}, {}],
        [{text: 'TOTALES', rowSpan: 2, colSpan: 5, style: 'totales', border: [true, false, false, false]}, {}, {}, {}, {},
          {text: hts + hps, rowSpan: 2, style: 'totales', border: [true, false, false, false]},
          {text: hts, rowSpan: 2, style: 'totales', border: [true, false, false, false]},
          {text: hps, rowSpan: 2, style: 'totales', border: [true, false, false, false]},
          {text: (hts + hps) * this.hmensual, rowSpan: 2, style: 'totales', border: [true, false, false, false]},
          {text: 'Teoría C.H.', style: 'tablesubHeader2'},
          {text: 'Practica C.H.', style: 'tablesubHeader2'},
          {text: 'Total C.H.', style: 'tablesubHeader2'}],
        [{}, {}, {}, {}, {}, {}, {}, {}, {},
          {text: hts * this.hmensual, style: 'tablesubHeader'},
          {text: hps * this.hmensual, style: 'tablesubHeader'},
          {text: (hts + hps) * this.hmensual, style: 'tablesubHeader'}]
      );
    });
    this.documentDefinition.content[1].table.body.push(
      [{text: 'TOTAL CARGA HORARIA INGiENERIA (SIN PASANTIA)', style: 'subtotales', colSpan: 5},
        {}, {}, {}, {},
        {text: horatotal, colSpan: 4, style: 'subtotales'}, {}, {}, {},
        {border: [false, false, false, false], text: ''}, {border: [false, false, false, false], text: ''},
        {border: [false, false, false, false], text: ''}],
      [{text: 'PASANTIA LABORAL SUPERVISADA', style: 'subtotales', colSpan: 5},
        {}, {}, {}, {},
        {text: this.horapasantia, colSpan: 4, style: 'subtotales'}, {}, {}, {},
        {border: [false, false, false, false], text: ''}, {border: [false, false, false, false], text: ''},
        {border: [false, false, false, false], text: ''}],
      [{text: 'TOTAL CARGA HORARIA INGiENERIA', style: 'subtotales', colSpan: 5},
        {}, {}, {}, {},
        {text: horatotal + this.horapasantia, colSpan: 4, style: 'subtotales'}, {}, {}, {},
        {border: [false, false, false, false], text: ''}, {border: [false, false, false, false], text: ''},
        {border: [false, false, false, false], text: ''}]
    );
    let horaarea, cantidadarea, cantidadareatotal = 0;
    areamaterias.forEach( e1 => {
      horaarea = cantidadarea = 0;
      this.materias.forEach( e2 => {
        if(e2.area === e1.id){
          cantidadarea = cantidadarea + 1;
          horaarea = horaarea + (e2.HP + e2.HT) * this.hmensual;
        }
      });
      cantidadareatotal = cantidadareatotal + cantidadarea;
      this.documentDefinition.content[2].table.body.push(
        [{border: [false, false, false, false], text: ''}, e1.id, {text: e1.nombre, alignment: 'left'},
          cantidadarea, horaarea, horaarea * 100 / horatotal]
      );
    });
    this.documentDefinition.content[2].table.body.push(
      [{border: [false, false, false, false], text: ''},
        {border: [false, false, false, false], text: ''},
        {border: [false, false, false, false], text: ''}
        , cantidadareatotal, horatotal, 100]
    );
  }
  getBase64ImageFromURL(url: string) {
    return Observable.create((observer: Observer<string>) => {
      // create an image object
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      if (!img.complete) {
        // This will call another method that will create image from url
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = (err) => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }
  getBase64Image(img: HTMLImageElement) {
    // We create a HTML canvas object that will create a 2d image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    // This will draw image
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    const dataURL = canvas.toDataURL('image/png');
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
  }
  generate(){
    this.getBase64ImageFromURL('assets/img/fcyt.png')
      .subscribe(base64data => {  // @ts-ignore
        this.documentDefinition.content[0].table.body[0][0] = { image: 'data:image/jpg;base64,' + base64data, fit: [80, 80] };
        this.getBase64ImageFromURL('assets/img/unca.png')
          .subscribe(basedata => { // @ts-ignore
            this.documentDefinition.content[0].table.body[0][2] = { image: 'data:image/jpg;base64,' + basedata, fit: [80, 80] };
            pdfMake.createPdf(this.documentDefinition).open(); });
      });
  }
}
