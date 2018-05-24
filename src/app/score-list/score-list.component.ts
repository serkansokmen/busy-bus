import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-score-list',
  templateUrl: './score-list.component.html',
  styleUrls: ['./score-list.component.scss']
})
export class ScoreListComponent implements OnInit {

  @Input() scores: any[];

  constructor() { }

  ngOnInit() {
  }

}
