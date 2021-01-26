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
    for (let i = 0; i < this.boardIndexes.length; i += this.boardSize) {
      newArr.push(this.boardIndexes.slice(i, i + this.boardSize));
    }
    return newArr;
  }

  coordinates(position) {
    let y = 0;
    if (position != 0) {
      y = this.boardArray.findIndex(item => item.find(index => index === position));
    }
    const x = this.boardArray[y].findIndex(index => index === position);
    return [x, y];
  }

  calculateArea(distance, position) {
    const area = [];
    const [x, y] = this.coordinates(position);
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

  calculateAreaMove(distance, position) {
    let area = [];
    const [x, y] = this.coordinates(position);

    // добавить вертикальный ряд
    for (let i = y - distance; i <= y + distance; i++) {
      if ((i >= 0 && i < this.boardSize)) {
        area.push(this.boardArray[i][x]);
      }
    }

    //добавить горизонтальный ряд
    for (let i = x - distance; i <= x + distance; i ++) {
      if ((i >= 0 && i < this.boardSize)) {
        area.push(this.boardArray[y][i]);
      }
    }

    //добавить диагонали
    for (let i = 0; i <= distance * 2; i++) {
      let point = y - distance + i;
      if ((point >= 0 && point < this.boardSize)) {
        area.push(this.boardArray[point][x - distance + i]);
        area.push(this.boardArray[point][x + distance - i]);
      }
    }
    area = area.filter((item) => item !== undefined);

    //удалить повторы
    area = [...new Set(area)];
    return area;
  }

}