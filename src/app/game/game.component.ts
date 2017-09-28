import { Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { Http } from '@angular/http';
import { Engine, Render, World, Bodies, Composites, IRendererOptions,
  Mouse, MouseConstraint, Vertices, Common, Body } from 'matter-js';
import { parseString } from 'xml2js';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

type BlockType =
    'arrow'
  | 'leftHook'
  | 'leftZag'
  | 'line'
  | 'rightHook'
  | 'rightZag'
  | 'square';

@Component({
  selector: 'dp-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @Input('width') canvasWidth: number = 100;
  @Input('height') canvasHeight: number = 100;
  @ViewChild('game') element: ElementRef;

  private world: World;
  private blockVertices = {
    'arrow': '',
    'leftHook': '',
    'leftZag': '',
    'line': '',
    'rightHook': '',
    'rightZag': '',
    'square' : '',
  };

  constructor(private http: Http) { }

  ngOnInit() {
    const engine = Engine.create({
      timescale: 1.0
    });
    const options: IRendererOptions = {
      width: this.canvasWidth,
      height: this.canvasHeight,
      hasBounds: false,
      wireframes: false,
      background: '#1A54FE',
      showAngleIndicator: true,
      showCollisions: true,
    }
    const render = Render.create({
      element: this.element.nativeElement,
      engine, options
    });

    Engine.run(engine);
    Render.run(render);

    this.world = engine.world;

    // Load blocks from svg files
    for (let key in this.blockVertices) {
      this.http.get(`assets/blocks/${key}.svg`)
        .subscribe(result => parseString(result.text(), { trim: true }, (err, result) => {
          const type: BlockType = result.svg.g[0].g[0]['$'].id;
          const path = result.svg.g[0].g[0].polygon[0]['$'].points;
          this.blockVertices[key] = Vertices.fromPath(path);
        }));
    }

    // Create walls
    World.add(this.world, [
      // walls
      Bodies.rectangle(this.canvasWidth/2, 0, this.canvasWidth, 2, { isStatic: true }),
      Bodies.rectangle(this.canvasWidth, this.canvasHeight/2, 2, this.canvasHeight, { isStatic: true }),
      Bodies.rectangle(this.canvasWidth/2, this.canvasHeight, this.canvasWidth, 2, { isStatic: true }),
      Bodies.rectangle(0, this.canvasHeight/2, 2, this.canvasHeight, { isStatic: true })
    ]);
  }

  public spawnRandomBlock() {
    World.add(this.world, [this.getRandomBlock()]);
  }

  private getRandomBlock() {
    var randomKey;
    var count = 0;
    for (var prop in this.blockVertices) {
      if (Math.random() < 1/++count) {
        randomKey = prop;
      }
    }
    console.log(this.blockVertices[randomKey]);
    const body = Bodies.fromVertices(this.canvasWidth/2, this.canvasHeight/2, this.blockVertices[randomKey], {
      frictionAir: 0.01,
      // render: {
      //   sprite: {
      //     texture: `assets/blocks/${type}.png`
      //   }
      // }
    }, true);
    body.position.x = this.canvasWidth / 2;
    body.position.y = this.canvasHeight / 2;
    Body.scale(body, 0.5, 0.5, []);
    return body;
  }

}
