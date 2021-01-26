export default class Board {
  constructor(boardSize) {
    this.boardSize = boardSize;
    this.boardIndexes = this.makeIndexes();
    this.boardArray = this.makeArray();
  }

  // одномерный массив индексов
  makeIndexes() {
    const indexes = [];
    for (let i = 0; i < this.boardSize ** 2; i++) {
      indexes.push(i);
    }
    return indexes;
  }

  // двумерный массив индексов
  makeArray() {
    let newArr = [];
    for (let i = 0; i < this.boardIndexes.length; i += this.boardSize){
      newArr.push(this.boardIndexes.slice(i, i + this.boardSize));
    }
    return newArr;
  }

  calculateArea(distance, position) {
    const area = []
    let y = 0;
    if (position != 0) {
      y = this.boardArray.findIndex(item => item.find(index => index === position));
    }
    const x = this.boardArray[y].findIndex(index => index === position)

    for (let i = y - distance; i <= y + distance; i++) {
      if (i >= 0 && i < this.boardSize) {
        for (let j = x - distance; j <= x + distance; j++) {
          if (j >= 0 && j < this.boardSize) {
            area.push(this.boardArray[i][j])
          } 
        }
      }
    }
    area.splice(area.indexOf(position), 1);
    return area;
  }

}
