import { generateTeam } from './generators';
import Board from './Board';
import GamePlay from './GamePlay';
import Bowman from './Characters/Bowman';
import Daemon from './Characters/Daemon';
import Magician from './Characters/Magician';
import Swordsman from './Characters/Swordsman';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';
import cursors from './cursors'

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.board = new Board(this.gamePlay.boardSize);
    this.stateService = stateService;
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.playerChars = [];
    this.enemyChars = [];
    this.allChars = [];
    this.currentChar = null;
  }

  startNewGame() {
    this.playerChars = generateTeam([Swordsman, Bowman], 1, 2);
    this.enemyChars = generateTeam([Daemon, Undead, Vampire], 1, 2);
    this.allChars = this.playerChars.concat(this.enemyChars);
    return this.allChars;
  }

  init() {
    this.gamePlay.drawUi('prairie');
    this.addListeners();
    this.gamePlay.redrawPositions(this.startNewGame());
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
  }

  static checkChar(charInCell, allowedClasses = []) {
    for (let item of allowedClasses) {
      if (charInCell.classList.contains(item)) {
        return true;
      }
    }
  }


  defineCurrentChar(index) {
    this.currentChar = this.playerChars.filter((char) => char.position === index)[0];
    this.currentChar.areaMove = this.board.calculateAreaMove(this.currentChar.character.distanceMove, this.currentChar.position);
    this.currentChar.areaAttack = this.board.calculateArea(this.currentChar.character.distanceAttack, this.currentChar.position);
    console.log(this.currentChar)
  }

  onCellClick(index) {
    const charInCell = event.target;
    const isCharInCell = charInCell && GameController.checkChar(charInCell, ['Bowman', 'Swordsman', 'Magician']);
    const isWrongChar = GameController.checkChar(charInCell, ['Undead', 'Zombie', 'Daemon']);

    if (isWrongChar) {
      GamePlay.showError('This is an enemy character!');
    }

    if (this.gamePlay.boardEl.querySelector('.selected-yellow')) {
      const previousCell = this.gamePlay.boardEl.querySelector('.selected-yellow');
      const previousCellIndex = this.gamePlay.cells.indexOf(previousCell);
      this.gamePlay.deselectCell(previousCellIndex);
      if (isCharInCell) {
        this.gamePlay.selectCell(index);
        this.defineCurrentChar(index);
      }
    } else if (isCharInCell) {
      this.gamePlay.selectCell(index);
      this.defineCurrentChar(index);
    }


  }

  onCellEnter(index) {
    const charInCell = event.target.querySelector('.character')
    if (charInCell) {
      const findChar = this.allChars.filter((char) => char.position === index)[0].character;
      const message = `🎖️ ${findChar.level} ⚔ ${findChar.attack} 🛡️ ${findChar.defence} ♥️ ${findChar.health}`;
      this.gamePlay.showCellTooltip(message, index);

      // указатель для выбора своего персонажа
      if (GameController.checkChar(charInCell, ['Bowman', 'Swordsman', 'Magician'])) {
        this.gamePlay.setCursor('pointer');
      //указатель для атаки
      } else if (this.currentChar !== null && this.currentChar.areaAttack.indexOf(index) !== -1) {
        this.gamePlay.setCursor('crosshair');
        this.gamePlay.selectCell(index, 'red');
      }
      //указатель для движения
    } else if (this.currentChar !== null && this.currentChar.areaMove.indexOf(index) !== -1) {
      this.gamePlay.setCursor('pointer');
      this.gamePlay.selectCell(index, 'green');
    } else {
      this.gamePlay.setCursor('notallowed');
    }
    

  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor('auto');
    this.gamePlay.deselectCell(index);
  }
}
