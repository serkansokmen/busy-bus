import { Injectable } from '@angular/core';


export type PieceType = 'lineF' | 'lineM' | 'leftHook' | 'rightHook' | 'square' | 'rightZag' | 'leftZag' | 'arrow';

@Injectable({
  providedIn: 'root'
})
export class PieceService {

  private _images: any = {};

  constructor() {
    // Pieces
    // IILJOZST
    [
      ['lineF', 4],
      ['lineM', 4],
      ['rightHook', 4],
      ['leftHook', 4],
      ['square', 4],
      ['leftZag', 4],
      ['rightZag', 4],
      ['arrow', 4],
    ].map(item => {
      this.loadImagePiece(item[0], item[1]);
    });
  }

  public get images() {
    return this._images;
  }

  private loadImagePiece(identifier: any, partCount: any) {
    for (var part = 0; part < partCount; ++part) {
      let img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      const partCacheKey = `${identifier}-p${part+1}`;
      img.src = `assets/img/${partCacheKey}@2x.png`;
      this._images[partCacheKey] = img;
    }
  }
}
