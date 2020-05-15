import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.css']
})
export class InspectorComponent {
  // tslint:disable-next-line:variable-name
  public _selectedNode: go.Node;
  public data = {
    key: null,
    HP: 0,
    HT: 0,
  };

  @Input()
  public model: go.Model;

  @Output()
  public onFormChange: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  get selectedNode() { return this._selectedNode; }
  set selectedNode(node: go.Node) {
    if (node) {
      this._selectedNode = node;
      this.data.key = this._selectedNode.data.key;

      this.data.HP = this._selectedNode.data.HP;
      this.data.HT = this._selectedNode.data.HT;

    } else {
      this._selectedNode = null;
      this.data.key = null;

      this.data.HP = 0;
      this.data.HT = 0;

    }
  }

  constructor() { }

  public onCommitForm() {
    this.onFormChange.emit(this.data);
  }

}
