import { State, Action, StateContext, Selector } from '@ngxs/store';
import { LoadPieceImages } from './pieces.actions';
import { Observable } from 'rxjs';
import { PieceService } from '../services/piece.service';

export interface PiecesStateModel {
  images: any;
}

@State<PiecesStateModel>({
  name: 'pieces',
  defaults: {
    images: {},
  },
})
export class PiecesState {

  constructor(private pieces: PieceService) { }

  @Selector() static images(state: PiecesStateModel) {
    return state.images;
  }

  @Action(LoadPieceImages)
  setIsHandset(ctx: StateContext<PiecesStateModel>, action: LoadPieceImages) {
    const state = ctx.getState();
    ctx.patchState({
      images: this.pieces.images,
    });
  }

}
