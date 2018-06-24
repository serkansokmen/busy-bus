import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SetIsHandset } from './layout.actions';
import { Observable } from 'rxjs';

export interface LayoutStateModel {
  isHandset: boolean;
}

@State<LayoutStateModel>({
  name: 'layout',
  defaults: {
    isHandset: true,
  },
})
export class LayoutState {

  @Selector() static isHandset(state: LayoutStateModel) {
    return state.isHandset;
  }

  @Action(SetIsHandset)
  setIsHandset(ctx: StateContext<LayoutStateModel>, action: SetIsHandset) {
    const state = ctx.getState();
    ctx.patchState({
      isHandset: action.matches,
    });
  }

}
