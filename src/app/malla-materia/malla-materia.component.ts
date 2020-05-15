import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {DataSyncService, DiagramComponent, PaletteComponent} from 'gojs-angular';
import * as go from 'gojs';
import {Materia} from '../models/Materia';
import {MatSnackBar, MatTableDataSource} from '@angular/material';
import {DataService} from '../shared/crud-service/data.service';
import {MallaMateria} from '../models/MallaMateria';
import {map, takeUntil} from 'rxjs/operators';
import {NodeMallaMateria} from '../services/nodeMallaMateria';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AreaMateria} from '../models/AreaMateria';
import {TipoMateria} from '../models/TipoMateria';
import {Carrera} from '../models/Carrera';
import {forkJoin, Observable, Observer, Subject} from 'rxjs';
import {NotificacionService} from '../shared/notificacion.service';
import {Malla} from '../models/Malla';
import {InspectorComponent} from '../inspector/inspector.component';
import {PdfService} from '../services/pdf.service';


@Component({
  selector: 'app-malla-materia',
  templateUrl: './malla-materia.component.html',
  styleUrls: ['./malla-materia.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MallaMateriaComponent implements AfterViewInit, OnDestroy {

  constructor(private cdr: ChangeDetectorRef, private DS: DataService,
              private route: ActivatedRoute, private NS: NotificacionService, private pdf: PdfService) {}
  private unsub: Subject<void> = new Subject<any>();
  areamaterias: AreaMateria[] = [];
  materias: Materia[] = [];
  malla: Malla[] = [];
  public mallaid = this.route.snapshot.params.id;
  private hidePalette = true;
  @ViewChild('myDiagram', { static: true })
  public myDiagramComponent: DiagramComponent;
  @ViewChild('myPalette', { static: true })
  public myPaletteComponent: PaletteComponent;


  public diagramNodeData: Array<go.ObjectData> = [];
  public diagramLinkData: Array<go.ObjectData> = [];
  public diagramDivClassName = 'myDiagramDiv';
  public diagramModelData = { prop: 'value' };

  public paletteNodeData: Array<go.ObjectData> = [];
  public paletteLinkData: Array<go.ObjectData> = [];
  public paletteModelData = { prop: 'val' };
  public paletteDivClassName = 'myPaletteDiv';

  // Overview Component testing
  public oDivClassName = 'myOverviewDiv';
  public observedDiagram = null;

  // currently selected node; for inspector
  public selectedNode: go.Node | null = null;

  // There are only three note colors by default, blue, red, and yellow but you could add more here:
  public noteColors = ['#ce6925', '#ffdf71', '#3aa6dd', '#7ab648', '#b391b5'];


  mensaje(err) {
    this.NS.warn(err.error[Object.keys(err.error)[0]]);
  }
  getAll() {
    const areaMateriaObs = this.DS.readObs(AreaMateria);
    const materiaObs = this.DS.readObs(Materia, 'search=' + this.route.snapshot.params.carrera);
    const mallaObs = this.DS.readObs(Malla, 'id=' + this.mallaid);
    const mallamateriaObs = this.DS.readObs(MallaMateria, 'malla=' + this.mallaid);

    forkJoin([mallaObs, areaMateriaObs, materiaObs, mallamateriaObs])
      .pipe(takeUntil(this.unsub))
      .subscribe(
        (res: any) => {
          this.areamaterias = res[1];
          this.malla = res[0];
          // carga semestres
          for (let i = 1; i <= (res[0][0].periodo * res[0][0].curso); i++) {
            this.diagramNodeData.push({key: 'semestre' + i, text: i, isGroup: true});
          }
          res[2].forEach(materiaArray => {
            let encontrado = false;
            res[3].forEach(mallamateriaArray => {
              if (materiaArray.id === mallamateriaArray.materia) {
                encontrado = true;
                // carga diagrama
                this.diagramNodeData.push(new NodeMallaMateria (
                  materiaArray.id, materiaArray.nombre,
                  [materiaArray.area_materia, this.areamaterias.find(areaArray => areaArray.id === materiaArray.area_materia).color],
                  mallamateriaArray.hora_practica, mallamateriaArray.hora_teorica,
                  mallamateriaArray.curso, mallamateriaArray.periodo, materiaArray.tipo_materia
                ));
              }
            });
            if (!encontrado) {
              // carga paleta
              this.paletteNodeData.push(new NodeMallaMateria (
                materiaArray.id, materiaArray.nombre,
                [materiaArray.area_materia, this.areamaterias.find(areaArray => areaArray.id === materiaArray.area_materia).color],
                0, 0, 1, 1, 'OB'
              ));
            }
          });
        },
        err => this.mensaje(err)
      );
  }

  // change node color
  getNoteColor(num) {
    return this.noteColors[Math.min(num, this.noteColors.length - 1)];
  }

  // initialize diagram / templates
  public initDiagram(): go.Diagram {
    // For the layout
    const MINLENGTH = 169; // this controls the minimum length of any swimlane
    const MINBREADTH = 100; // this controls the minimum breadth of any non-collapsed swimlane

    // some shared functions

    // this is called after nodes have been moved
    function relayoutDiagram() {
      dia.selection.each(n => {
        n.invalidateLayout();
      });
      dia.layoutDiagram();
    }

    // compute the minimum size of the whole diagram needed to hold all of the Lane Groups
    function computeMinPoolSize() {
      let len = MINLENGTH;
      dia.findTopLevelGroups().each(lane => {
        const holder = lane.placeholder;
        if (holder !== null) {
          const sz = holder.actualBounds;
          len = Math.max(len, sz.height);
        }
        // var box = lane.selectionObject;
        // // naturalBounds instead of actualBounds to disregard the shape's stroke width
        // len = Math.max(len, box.naturalBounds.height);
      });
      return new go.Size(NaN, len);
    }

    // compute the minimum size for a particular Lane Group
    function computeLaneSize(lane) {
      // assert(lane instanceof go.Group);
      const sz = computeMinLaneSize(lane);
      if (lane.isSubGraphExpanded) {
        const holder = lane.placeholder;
        if (holder !== null) {
          const hsz = holder.actualBounds;
          sz.width = Math.max(sz.width, hsz.width);
        }
      }
      // minimum breadth needs to be big enough to hold the header
      const hdr = lane.findObject('HEADER');
      if (hdr !== null) { sz.width = Math.max(sz.width, hdr.actualBounds.width); }
      return sz;
    }

    // determine the minimum size of a Lane Group, even if collapsed
    function computeMinLaneSize(lane) {
      if (!lane.isSubGraphExpanded) { return new go.Size(1, MINLENGTH); }
      return new go.Size(MINBREADTH, MINLENGTH);
    }

    // define a custom grid layout that makes sure the length of each lane is the same
    // and that each lane is broad enough to hold its subgraph
    function PoolLayout() {
      go.GridLayout.call(this);
      this.cellSize = new go.Size(1, 1);
      this.wrappingColumn = Infinity;
      this.wrappingWidth = Infinity;
      this.spacing = new go.Size(0, 0);
      this.alignment = go.GridLayout.Position;
    }
    go.Diagram.inherit(PoolLayout, go.GridLayout);

    PoolLayout.prototype.doLayout = function(coll) {
      const diagram = this.diagram;
      if (diagram === null) { return; }
      diagram.startTransaction('PoolLayout');
      // make sure all of the Group Shapes are big enough
      const minsize = computeMinPoolSize();
      diagram.findTopLevelGroups().each(lane => {
        if (!(lane instanceof go.Group)) { return; }
        const shape = lane.selectionObject;
        if (shape !== null) {
          // change the desiredSize to be big enough in both directions
          const sz = computeLaneSize(lane);
          shape.width = !isNaN(shape.width)
            ? Math.max(shape.width, sz.width)
            : sz.width;

          shape.height = minsize.height;
          const cell = lane.resizeCellSize;
          if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0) {
            shape.width = Math.ceil(shape.width / cell.width) * cell.width;
          }
          if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0) {
            shape.height = Math.ceil(shape.height / cell.height) * cell.height;
          }
        }
      });
      // now do all of the usual stuff, according to whatever properties have been set on this GridLayout
      go.GridLayout.prototype.doLayout.call(this, coll);
      diagram.commitTransaction('PoolLayout');
    };
    // end PoolLayout class

    const $ = go.GraphObject.make;

    const dia = $(go.Diagram, {
      // start everything in the middle of the viewport
      contentAlignment: go.Spot.TopCenter,
      // use a simple layout to stack the top-level Groups next to each other
      // @ts-ignore
      layout: $(PoolLayout),
      // disallow nodes to be dragged to the diagram's background
      mouseDrop(e) {
        e.diagram.currentTool.doCancel();
      },
      // a clipboard copied node is pasted into the original node's group (i.e. lane).
      'commandHandler.copiesGroupKey': true,
      // automatically re-layout the swim lanes after dragging the selection
      SelectionMoved: relayoutDiagram, // this DiagramEvent listener is
      SelectionCopied: relayoutDiagram, // defined above
      'linkingTool.isEnabled': false, // invoked explicitly by drawLink function, below
      // "linkingTool.direction": go.LinkingTool.ForwardsOnly, // only draw "from" towards "to"
      'undoManager.isEnabled': true,
      model: $(go.GraphLinksModel, {
        linkToPortIdProperty: 'toPort',
        linkFromPortIdProperty: 'fromPort',
        linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
      })
    });
    // Customize the dragging tool:
    // When dragging a Node set its opacity to 0.7 and move it to the foreground layer
    dia.toolManager.draggingTool.doActivate = function() {
      go.DraggingTool.prototype.doActivate.call(this);
      this.currentPart.opacity = 0.7;
      this.currentPart.layerName = 'Foreground';
    };
    dia.toolManager.draggingTool.doDeactivate = function() {
      this.currentPart.opacity = 1;
      this.currentPart.layerName = '';
      go.DraggingTool.prototype.doDeactivate.call(this);
    };

    // ------------------------------------------ NODE ------------------------------------------------

    // crea la figura más redondeada
    go.Shape.defineFigureGenerator('RoundedAllRectangle', ( shape, w, h) => {
      // this figure takes one parameter, the size of the corner
      let p1 = 50; // default corner size
      if (shape !== null) {
        const param1 = shape.parameter1;
        if (!isNaN(param1) && param1 >= 0) { p1 = param1; } // can't be negative or NaN
      }
      p1 = Math.min(p1, w / 2);
      p1 = Math.min(p1, h / 2); // limit by whole height or by half height?
      const geo = new go.Geometry();
      // a single figure consisting of straight lines and quarter-circle arcs
      geo.add(new go.PathFigure(0, p1)
          .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
          .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
          .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
          .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w - p1, h - p1, p1, p1))
          .add(new go.PathSegment(go.PathSegment.Line, p1, h))
          .add(new go.PathSegment(go.PathSegment.Arc, 90, 90, p1, h - p1, p1, p1).close()));
      // don't intersect with two top corners when used in an "Auto" Panel
      geo.spot1 = new go.Spot(0, 0, 0.3 * p1, 0.3 * p1);
      geo.spot2 = new go.Spot(1, 1, -0.3 * p1, -0.3 * p1);
      return geo;
    });
    dia.nodeTemplate = $(
      go.Node,
      'Horizontal',
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),

      $(
        go.Panel,
        'Auto',
        $(
          go.Shape,
          'RoundedAllRectangle',
          {
            fill: '#ce6925',
            stroke: '#CCCCCC',
            portId: '',
            cursor: 'pointer',
            fromLinkable: true,
            toLinkable: true,
            fromSpot: go.Spot.Right,
            toSpot: go.Spot.Left
          },
          new go.Binding('fill', 'color', this.getNoteColor),
          new go.Binding('stroke', 'color', this.getNoteColor)
        ),
        $(
          go.Panel,
          'Table',
          {
            width: 130,
            minSize: new go.Size(NaN, 50)
          },
          $(
            go.TextBlock,
            {
              name: 'TEXT',
              margin: 6,
              font: '11px Lato, sans-serif',
              editable: true,
              isMultiline: false, // don't allow newlines in text
              stroke: '#000',
              maxSize: new go.Size(130, NaN),
              alignment: go.Spot.Center
            },
            new go.Binding('text', 'text').makeTwoWay()
          )
        )
      )
    );
    dia.nodeTemplate.selectionAdornmentTemplate = $(
      go.Adornment,
      'Spot',
      $(
        go.Panel,
        'Auto',
        $(go.Shape, {
          stroke: 'dodgerblue',
          strokeWidth: 2,
          fill: null
        }),
        $(go.Placeholder)
      ),
      $(
        go.Panel,
        'Horizontal',
        {
          alignment: go.Spot.Top,
          alignmentFocus: go.Spot.Bottom
        },
        $(
          'Button',
          {
            click: editText
          }, // defined below, to support editing the text of the node
          $(go.TextBlock, 't', {
            font: 'bold 10pt sans-serif',
            desiredSize: new go.Size(15, 15),
            textAlign: 'center'
          })
        ),
        $(
          'Button',
          {
            click: changeColor
            // "_buttonFillOver": "transparent"
          }, // defined below, to support changing the color of the node
          new go.Binding('ButtonBorder.fill', 'color', this.getNoteColor),
          $(go.Shape, {
            fill: null,
            stroke: null,
            desiredSize: new go.Size(14, 14)
          })
        ),
        $(
          'Button',
          {
            // drawLink is defined below, to support interactively drawing new links
            click: drawLink, // click on Button and then click on target node
            actionMove: drawLink // drag from Button to the target node
          },
          $(go.Shape, {
            geometryString: 'M0 0 L8 0 8 12 14 12 M12 10 L14 12 12 14'
          })
        ),
        // $(
        //   'Button',
        //   {
        //     click(e, node) {
        //       if (node !== null) {
        //         dia.startTransaction('remove');
        //         dia.commandHandler.deleteSelection(node);
        //         dia.commitTransaction('remove');
        //       }
        //     }
        //   },
        //   $(go.TextBlock, 'X', {
        //     font: 'bold 10pt sans-serif',
        //     desiredSize: new go.Size(15, 15),
        //     textAlign: 'center'
        //   })
        // )
      ),
      $(
        go.Panel,
        'Horizontal',
        {
          alignment: go.Spot.Bottom,
          alignmentFocus: go.Spot.Top
        },
        $(
          go.Panel,
          'Horizontal',
          {
            column: 4
          },
          $(go.TextBlock, 'HP:', {
            font: '10pt Verdana, sans-serif',
            textAlign: 'right',
            margin: 2,
            wrap: go.TextBlock.None,
            width: 25
          }),
          $(
            go.TextBlock,
            {
              name: 'HP',
              margin: 2,
              textValidation: isValidCount
            },
            new go.Binding('text', 'HP').makeTwoWay(count => parseInt(count, 10))
          ),
          $(
            'Button',
            {
              click: incrementHP
            },
            $(go.Shape, 'PlusLine', {
              margin: 3,
              desiredSize: new go.Size(7, 7)
            })
          ),
          $(
            'Button',
            {
              click: decrementHP
            },
            $(go.Shape, 'MinusLine', {
              margin: 3,
              desiredSize: new go.Size(7, 7)
            })
          )
        ),
        $(
          go.Panel,
          'Horizontal',
          {
            column: 3
          },
          $(go.TextBlock, 'HT:', {
            font: '10pt Verdana, sans-serif',
            textAlign: 'right',
            margin: 2,
            wrap: go.TextBlock.None,
            width: 25
          }),
          $(
            go.TextBlock,
            {
              name: 'HT',
              margin: 2,
              textValidation: isValidCount
            },
            new go.Binding('text', 'HT').makeTwoWay(count => parseInt(count, 10))
          ),
          $(
            'Button',
            {
              click: incrementHT
            },
            $(go.Shape, 'PlusLine', {
              margin: 3,
              desiredSize: new go.Size(7, 7)
            })
          ),
          $(
            'Button',
            {
              click: decrementHT
            },
            $(go.Shape, 'MinusLine', {
              margin: 3,
              desiredSize: new go.Size(7, 7)
            })
          )
        )
      )
    );
    // When user hits + button, increment count on that option
    function incrementHP(e, obj) {
      const node = obj.part.data;
      if (node !== null) {
        dia.model.startTransaction('increment count');
        dia.model.setDataProperty(node, 'HP', node.HP + 1);
        obj.part.findObject('HP').text = node.HP;
        dia.model.commitTransaction('increment count');
      }
    }

    function incrementHT(e, obj) {
      const node = obj.part.data;
      if (node !== null) {
        dia.model.startTransaction('increment count');
        dia.model.setDataProperty(node, 'HT', node.HT + 1);
        obj.part.findObject('HT').text = node.HT;
        dia.model.commitTransaction('increment count');
      }
    }
    // When user hits - button, decrement count on that option
    function decrementHP(e, obj) {
      const node = obj.part.data;
      if (node !== null) {
        dia.model.startTransaction('decrement count');
        if (node.HP > 1) {
          dia.model.setDataProperty(node, 'HP', node.HP - 1);
        }
        obj.part.findObject('HP').text = node.HP;
        dia.model.commitTransaction('decrement count');
      }
    }

    function decrementHT(e, obj) {
      const node = obj.part.data;
      if (node !== null) {
        dia.model.startTransaction('decrement count');
        if (node.HT > 1) {
          dia.model.setDataProperty(node, 'HT', node.HT - 1);
        }
        obj.part.findObject('HT').text = node.HT;
        dia.model.commitTransaction('decrement count');
      }
    }
    // Validation function for editing text
    function isValidCount(textblock, oldstr, newstr) {
      if (newstr === '') { return false; }
      const num = +newstr; // quick way to convert a string to a number
      return !isNaN(num) && Number.isInteger(num) && num >= 0;
    }

    function editText(e, button) {
      const node = button.part.adornedPart;
      e.diagram.commandHandler.editTextBlock(node.findObject('TEXTBLOCK'));
    }

    function changeColor(e, obj) {
      dia.startTransaction('Update node color');
      let newColor: number;
      // tslint:disable-next-line:radix
      newColor = parseInt(obj.part.data.color) + 1;
      if (newColor > this.noteColors.length - 1) { newColor = 0; }
      dia.model.setDataProperty(obj.part.data, 'color', newColor);
      // obj["_buttonFillNormal"] = this.getNoteColor(newColor); // uncomment to update the button too
      dia.commitTransaction('Update node color');
    }

    function drawLink(e, button) {
      const node = button.part.adornedPart;
      const tool = e.diagram.toolManager.linkingTool;
      tool.startObject = node.port;
      e.diagram.currentTool = tool;
      tool.doActivate();
    }

    // --------------------------------------------------------- LINK --------------------------------------------------------------

    dia.linkTemplate = $(
      go.Link, // the whole link panel
      {
        relinkableFrom: true,
        relinkableTo: true,
        reshapable: true,
        resegmentable: true
      },
      {
        routing: go.Link.AvoidsNodes, // but this is changed to go.Link.Orthgonal when the Link is reshaped
        adjusting: go.Link.End,
        curve: go.Link.JumpOver,
        corner: 15,
        toShortLength: 4
      },
      new go.Binding('points').makeTwoWay(),
      // remember the Link.routing too
      new go.Binding(
        'routing',
        'routing',
        go.Binding.parseEnum(go.Link, go.Link.AvoidsNodes)
      ).makeTwoWay(go.Binding.toString),
      $(
        go.Shape, // the link path shape
        {
          isPanelMain: true,
          strokeWidth: 2
        }
      ),
      $(
        go.Shape, // the arrowhead
        {
          toArrow: 'Standard',
          stroke: null
        }
      )
    );

    // permitir enlazar solo a materias de semestres posteriores
    function correlatividadenlace(fromnode, fromport, tonode, toport) {
      return (
        // tslint:disable-next-line:radix
        parseInt(fromnode.data.group.substr(8)) <
        parseInt(tonode.data.group.substr(8))
      );
    }

    // only allow new links between ports
    dia.toolManager.linkingTool.linkValidation = correlatividadenlace;

    // only allow reconnecting an existing link to a port
    dia.toolManager.relinkingTool.linkValidation = correlatividadenlace;

    // ----------------------------------------------------- Add buttons -------------------------------------------------------------

    // unmovable node that acts as a button
    // dia.nodeTemplateMap.add('newbutton',
    //   $(go.Node, "Horizontal", {
    //       selectable: false,
    //       click: function (e, node) {
    //         dia.startTransaction('add node');
    //         var newdata = {
    //           group: "semestre1",
    //           loc: "0 50",
    //           text: "materia",
    //           color: 0,
    //           HP: 1,
    //           HT: 1,
    //           tipo: "OB"
    //         };
    //         dia.model.addNodeData(newdata);
    //         dia.commitTransaction('add node');
    //         var node = dia.findNodeForData(newdata);
    //         dia.select(node);
    //         dia.commandHandler.editTextBlock();
    //       },
    //       background: 'white'
    //     },
    //     $(go.Panel, "Auto",
    //       $(go.Shape, "Rectangle", {
    //         strokeWidth: 0,
    //         stroke: null,
    //         fill: '#6FB583'
    //       }),
    //       $(go.Shape, "PlusLine", {
    //         margin: 6,
    //         strokeWidth: 2,
    //         width: 12,
    //         height: 12,
    //         stroke: 'white',
    //         background: '#6FB583'
    //       })
    //     ),
    //     $(go.TextBlock, "Nueva materia", {
    //       font: '10px Lato, sans-serif',
    //       margin: 6,
    //     })
    //   )
    // );

    // ----------------------------------------------------- Group -------------------------------------------------------------

    // updateLinks on expand
    function updateCrossLaneLinks(group) {
      group.findExternalLinksConnected().each(l => {
        l.visible = l.fromNode.isVisible() && l.toNode.isVisible();
      });
    }
    // While dragging, highlight the dragged-over group
    function highlightGroup(grp, show) {
      if (show) {
        const part = dia.toolManager.draggingTool.currentPart;
        if (part.containingGroup !== grp) {
          grp.isHighlighted = true;
          return;
        }
      }
      grp.isHighlighted = false;
    }

    function groupStyle() {
      // common settings for both Lane and Pool Groups
      return [
        {
          layerName: 'Background', // all pools and lanes are always behind all nodes and links
          background: 'transparent', // can grab anywhere in bounds
          copyable: false, // can't copy lanes or pools
          avoidable: false, // don't impede AvoidsNodes routed Links
          selectable: false,
          click(e, grp) {
            // allow simple click on group to clear selection
            if (!e.shift && !e.control && !e.meta) { e.diagram.clearSelection(); }
          }
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
          go.Point.stringify
        )
      ];
    }

    function correlatividadgrupo(group, node) {
      if (group === null) { return true; } // when maybe dropping a node in the background
      if (node instanceof go.Group) { return false; } // don't add Groups to Groups
      const nodebeforeiterator = node.findNodesInto();
      const nodeafteriterator = node.findNodesOutOf();
      let nodebefore = 0;
      let nodeafter = 11;
      while (nodebeforeiterator.next()) {
        // tslint:disable-next-line:radix
        const i = parseInt(nodebeforeiterator.value.data.group.substr(8));
        if (i > nodebefore) {
          nodebefore = i;
        }
      }
      while (nodeafteriterator.next()) {
        // tslint:disable-next-line:radix
        const i = parseInt(nodeafteriterator.value.data.group.substr(8));
        if (i < nodeafter) {
          nodeafter = i;
        }
      }
      // tslint:disable-next-line:radix
      const groupid = parseInt(group.data.key.substr(8));
      return groupid > nodebefore && groupid < nodeafter;
    }

    dia.groupTemplate = $(
      go.Group,
      'Vertical',
      groupStyle(),
      {
        selectionObjectName: 'SHAPE', // even though its not selectable, this is used in the layout
        layout: $(
          go.GridLayout, // automatically lay out the lane's subgraph
          {
            wrappingColumn: 1,
            cellSize: new go.Size(1, 1),
            spacing: new go.Size(5, 20),
            alignment: go.GridLayout.Position,
            comparer(a, b) {
              // can re-order tasks within a lane
              const ay = a.location.y;
              const by = b.location.y;
              if (isNaN(ay) || isNaN(by)) { return 0; }
              if (ay < by) { return -1; }
              if (ay > by) { return 1; }
              return 0;
            }
          }
        ),
        computesBoundsAfterDrag: true, // needed to prevent recomputing Group.placeholder bounds too soon
        handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links

        memberValidation: correlatividadgrupo,
        // // support highlighting of Groups when allowing a drop to add a member
        // mouseDragEnter(e, grp, prev) {
        //   // this will call samePrefix; it is true if any node has the same key prefix
        //   // @ts-ignore
        //   if (grp.panel.part.canAddMembers(grp.diagram.selection)) {
        //     highlightGroup(grp, true);
        //     grp.diagram.currentCursor = '';
        //   } else {
        //     grp.diagram.currentCursor = 'not-allowed';
        //   }
        // },
        // mouseDragLeave(e, grp, next) {
        //   highlightGroup(grp, false);
        //   grp.diagram.currentCursor = '';
        // },
        mouseDrop(e, grp) {
          // @ts-ignore
          if (grp.canAddMembers(grp.diagram.selection)) {
            // this will only add nodes with the same key prefix
            // @ts-ignore
            grp.addMembers(grp.diagram.selection, true);
            updateCrossLaneLinks(grp);
          } else {
            // and otherwise cancel the drop
            grp.diagram.currentTool.doCancel();
          }
        },
        subGraphExpandedChanged(grp) {
          const shp = grp.selectionObject;
          if (grp.diagram.undoManager.isUndoingRedoing) { return; }
          if (grp.isSubGraphExpanded) {
            shp.width = grp._savedBreadth;
          } else {
            grp._savedBreadth = shp.width;
            shp.width = NaN;
          }
          updateCrossLaneLinks(grp);
        },
        doubleClick: (e, grp) => {
          dia.startTransaction('add node');
          // @ts-ignore
          const grpkey = grp.key;
          const newdata = {
            group: grpkey,
            text: 'materia',
            color: 0,
            HP: 1,
            HT: 1,
            tipo: 'OB'
          };
          dia.model.addNodeData(newdata);
          dia.commitTransaction('add node');
          const node = dia.findNodeForData(newdata);
          dia.select(node);
          dia.commandHandler.editTextBlock();
        },
      },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      new go.Binding('isSubGraphExpanded', 'expanded').makeTwoWay(),
      // the lane header consisting of a TextBlock and an expander button
      $(
        go.Panel,
        'Horizontal',
        {
          name: 'HEADER',
          angle: 0, // maybe rotate the header to read sideways going up
          alignment: go.Spot.Left
        },
        $('SubGraphExpanderButton', {
          margin: 5
        }), // this remains always visible
        $(
          go.Panel,
          'Horizontal', // this is hidden when the swimlane is collapsed
          new go.Binding('visible', 'isSubGraphExpanded').ofObject(),
          $(
            go.TextBlock, // the lane label
            {
              font: '15px Lato, sans-serif',
              editable: true,
              margin: new go.Margin(2, 0, 0, 0)
            },
            new go.Binding('text', 'text').makeTwoWay()
          )
        )
      ), // end Horizontal Panel
      $(
        go.Panel,
        'Auto', // the lane consisting of a background Shape and a Placeholder representing the subgraph
        $(
          go.Shape,
          'Rectangle', // this is the resized object
          {
            name: 'SHAPE',
            fill: '#F1F1F1',
            stroke: null,
            strokeWidth: 4
          },
          new go.Binding('fill', 'isHighlighted', h => h ? '#D6D6D6' : '#F1F1F1').ofObject(),
          new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(
            go.Size.stringify
          )
        ),
        $(go.Placeholder, {
          padding: 44,
          alignment: go.Spot.TopLeft
        }),
        $(
          go.TextBlock, // this TextBlock is only seen when the swimlane is collapsed
          {
            name: 'LABEL',
            font: '15px Lato, sans-serif',
            editable: true,
            angle: 90,
            alignment: go.Spot.TopLeft,
            margin: new go.Margin(4, 0, 0, 2)
          },
          new go.Binding('visible', 'isSubGraphExpanded', e => !e).ofObject(),
          new go.Binding('text', 'text').makeTwoWay()
        )
      ) // end Auto Panel
    ); // end Group
    return dia;
  }

  // When the diagram model changes, update app data to reflect those changes
  public diagramModelChange = function(changes: go.IncrementalData) {
    this.diagramNodeData = DataSyncService.syncNodeData(
      changes,
      this.diagramNodeData
    );
    this.diagramLinkData = DataSyncService.syncLinkData(
      changes,
      this.diagramLinkData
    );
    this.diagramModelData = DataSyncService.syncModelData(
      changes,
      this.diagramModelData
    );
  };
  public initPalette(): go.Palette {
    const $ = go.GraphObject.make;
    const palette = $(go.Palette);

    // define the Node template
    palette.nodeTemplate = $(
      go.Node,
      'Auto',
      $(
        go.Shape,
        'RoundedRectangle',
        {
          stroke: null
        },
        new go.Binding('fill', 'color')
      ),
      $(go.TextBlock, { margin: 8 }, new go.Binding('text', 'text'))
    );

    palette.model = $(go.GraphLinksModel, {
      linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
    });

    return palette;
  }

  public paletteModelChange = function(changes: go.IncrementalData) {
    this.paletteNodeData = DataSyncService.syncNodeData(
      changes,
      this.paletteNodeData
    );
    this.paletteLinkData = DataSyncService.syncLinkData(
      changes,
      this.paletteLinkData
    );
    this.paletteModelData = DataSyncService.syncModelData(
      changes,
      this.paletteModelData
    );
  };

  public initOverview(): go.Overview {
    const $ = go.GraphObject.make;
    const overview = $(go.Overview);
    return overview;
  }

  ngAfterViewInit() {
    // this.myPaletteComponent.palette.nodeTemplate = this.myDiagramComponent.diagram.nodeTemplate;
    this.getAll();
    if (this.observedDiagram) { return; }
    this.observedDiagram = this.myDiagramComponent.diagram;
    this.cdr.detectChanges(); // IMPORTANT: without this, Angular will throw ExpressionChangedAfterItHasBeenCheckedError (dev mode only)


    // listener for inspector
    this.myDiagramComponent.diagram.addDiagramListener(
      'ChangedSelection',
      e => {
        console.log('changedselection');
        if (e.diagram.selection.count === 0) {
          this.selectedNode = null;
        }
        const node = e.diagram.selection.first();
        if (node instanceof go.Node) {
          this.selectedNode = node;
        } else {
          this.selectedNode = null;
        }
      }
    );

    // listener for diagram to remove node from palette on drop
    this.myDiagramComponent.diagram.addDiagramListener('ExternalObjectsDropped', e => {
        const node = e.diagram.selection;
        node.each(el => {
          if (el instanceof go.Node) {
            // crea registro mallamateria
            const periodo: number = parseInt(el.data.group.substr(8), 10);
            const curso: number = (periodo % 2 === 0 ? periodo / 2 : periodo / 2 + 0.5);
            const mallaMateriaObs = this.DS.createObs(MallaMateria, {malla: this.mallaid, materia: el.data.key,
              horaPractica: el.data.HP, horaTeorica: el.data.HT, curso, periodo});
            mallaMateriaObs.pipe(takeUntil(this.unsub))
              .subscribe(
                (res: any) => {
                  // elimina materia de pallete
                  this.paletteNodeData = this.paletteNodeData.filter((value, key) => {
                    return value.key !== el.key;
                  });
                },
                err => this.mensaje(err)
              );
          }
        });
      }
    );

    // listener for diagram to add node to palette on deleting
    this.myDiagramComponent.diagram.addDiagramListener('SelectionDeleting', e => {
      const node = e.diagram.selection;
      node.each(el => {
        if (el instanceof go.Node) {
          // eliminar registro de mallamateria
          const periodo: number = parseInt(el.data.group.substr(9), 10);
          const curso: number = periodo % 2;
          const mallaMateriaObs = this.DS.deleteObs(MallaMateria, {
            malla: this.mallaid, materia: el.data.key,
            horaPractica: el.data.HP, horaTeorica: el.data.HT, curso, periodo
          });
          mallaMateriaObs.pipe(takeUntil(this.unsub))
            .subscribe(
            (res: any) => {
                  // se vuelve a agregar la materia a palette
                  this.paletteNodeData.push(el.data);
                },
              err => this.mensaje(err)
            );
        }
      });
    });
  } // end ngAfterViewInit
  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }
  public handleInspectorChange(newNodeData) {
    const key = newNodeData.key;
    // find the entry in nodeDataArray with this key, replace it with newNodeData
    let index = null;
    for (let i = 0; i < this.diagramNodeData.length; i++) {
      const entry = this.diagramNodeData[i];
      if (entry.key && entry.key === key) {
        index = i;
      }
    }

    if (index >= 0) {
      this.diagramNodeData[index] = {
        key: newNodeData.key,
        HP: newNodeData.HP,
        HT: newNodeData.HT
      };
    }
  }
  private showPalette() {
    this.hidePalette = !this.hidePalette;
  }
  public generatePdf(){
    this.pdf.init(this.diagramNodeData, this.diagramLinkData, this.areamaterias);
    this.pdf.generate();
  }
  myCallback(blob) {
    const url = window.URL.createObjectURL(blob);
    const filename = 'myBlobFile.png';

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // IE 11
    if (window.navigator.msSaveBlob !== undefined) {
      window.navigator.msSaveBlob(blob, filename);
      return;
    }

    document.body.appendChild(a);
    requestAnimationFrame(e => {
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  generateImg() {
    this.myDiagramComponent.diagram.makeImageData(
      { maxSize: new go.Size(Infinity, Infinity),
        scale:1, background: 'white', returnType: 'blob', callback: this.myCallback });
  }
  generateFile() {

  }
  openFile(){

  }
}
