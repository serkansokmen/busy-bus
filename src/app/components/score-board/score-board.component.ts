import { Component, Input } from '@angular/core';
import { ScoreBoardService  } from '../../services/score-board.service';

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss']
})
export class ScoreBoardComponent {

  @Input() scores: any[];

  constructor(public scoreBoard: ScoreBoardService) { }

}
