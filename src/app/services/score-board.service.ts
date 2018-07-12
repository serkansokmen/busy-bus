import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

export interface Score {
  name: string,
  score: number,
};

@Injectable({
  providedIn: 'root',
})
export class ScoreBoardService {

  private _dbCollection: any;

  constructor(private db: AngularFirestore) {
    this._dbCollection = this.db.collection<Score>('scores-34as', ref => ref.orderBy('score', 'desc').limit(100));
  }

  public get scores(): Observable<Score[]> {
    return this._dbCollection.valueChanges();
  }

  public save(score: Score) {
    this._dbCollection.add(score);
  }

  public getTrophyImage(score: number): string {
    if (score >= 1000) {
      return 'trophy-leaves';
    } else if (score < 1000 && score >= 500) {
      return 'trophy-bridge';
    } else if (score < 500 && score >= 100) {
      return 'trophy-building';
    } else {
      return 'trophy-flame';
    }
  }
}
