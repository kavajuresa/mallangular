export class NodeMallaMateria {

  public key: string;
  public text: string;
  public HT: number;
  public HP: number;
  public group: string;
  public tipo: string;
  public area: string;
  public color: string;

  constructor(materia: string, nombreMateria: string, area: Array<any>, HP: number, HT: number, curso: number, periodo: number, tipo: string) {
    this.key = materia;
    this.text = nombreMateria;
    this.area = area[0];
    this.color = area[1];
    this.HP = HP;
    this.HT = HT;
    this.group = 'semestre' + (curso * periodo);
    this.tipo = tipo;
  }

}
