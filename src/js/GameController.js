import { generateTeam } from './generators';
import randomInt from './randomInt';
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
    this.currentEnemy = null;
    this.canMove = false;
    this.canAttack = false;
    this.isPlayerTurn = true;
  }

  startNewGame() {
    this.playerChars = generateTeam([Swordsman, Bowman], 1, 2);
    this.enemyChars = generateTeam([Daemon, Undead, Vampire], 1, 2);
    this.allChars = this.playerChars.concat(this.enemyChars);
    return this.allChars;
  }

  /**
   * add event listeners to gamePlay events
   * load saved state from stateService
   */
  init() {
    this.gamePlay.drawUi('prairie');
    this.addListeners();
    this.gamePlay.redrawPositions(this.startNewGame());
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
    // this.gamePlay.addNewGameListener(this.init());
  }

  /**
   * Проверка принадлежности персонажа.
   * @param {*} charInCell 
   * @param {Array} allowedClasses 
   */
  static checkChar(charInCell, allowedClasses = []) {
    for (let item of allowedClasses) {
      if (charInCell.classList.contains(item)) {
        return true;
      }
    }
  }

  /**
   * Определить текущего персонажа.
   * @param {Number} index 
   */
  defineCurrentChar(index) {
    this.currentChar = this.playerChars.filter((char) => char.position === index)[0];
    this.calculateActionArea(this.currentChar);
  }

  defineCurrentEnemy(index) {
    this.currentEnemy = this.enemyChars.filter((char) => char.position === index)[0];
    this.calculateActionArea(this.currentEnemy);
  }

  calculateActionArea(char) {
    char.areaMove = this.board.calculateAreaMove(char.character.distanceMove, char.position);
    char.areaAttack = this.board.calculateArea(char.character.distanceAttack, char.position);
  }

  /**
   * Выбрать персонажа и выделить поле желтым.
   * @param {Number} index 
   */
  selectChar(index) {
    this.gamePlay.selectCell(index);
    this.defineCurrentChar(index);
  }

  /**
   * Возможность двигаться или атаковать.
   * @param {Boolean} move 
   * @param {Boolean} attack 
   */
  setAction(move, attack) {
    this.canMove = move;
    this.canAttack = attack;
  }


  movePlayerChar(char, index) {
    this.gamePlay.deselectCell(char.position);
    char.position = index;
    this.gamePlay.redrawPositions(this.allChars);
    this.selectChar(index);
    this.isPlayerTurn = false;
    this.enemyTurn();
  }

  moveEnemyChar(char) {
    const rand = randomInt(0, this.currentEnemy.areaMove.length - 1);
    const index = this.currentEnemy.areaMove[rand];
    char.position = index;
    this.gamePlay.redrawPositions(this.allChars);
  }

  enemyTurn() {
    const enemyAction = () => {
      const rand = randomInt(0, this.enemyChars.length - 1);
      this.defineCurrentEnemy(this.enemyChars[rand].position);

      const detect = () => {
        let detected = null;
        this.currentEnemy.areaAttack.forEach(index => {
          const charInRange = this.playerChars.filter((char) => char.position === index);
          if (charInRange.length > 0) {
            detected = charInRange;
          } 
        });
        return detected;
      }

      let detectedPlayerChar = detect();

      if (detectedPlayerChar) {
        this.attack(this.currentEnemy, detectedPlayerChar[0]);
      } else {
        this.moveEnemyChar(this.currentEnemy);
      }

      this.isPlayerTurn = true;
    }
    setTimeout(enemyAction, 1000);
  }

  attack(attacking, defending) {
    defending.character.health -= attacking.character.attack;
    console.log(attacking);
    console.log(defending);
    if (defending.character.health <= 0) {
      this.removeChar(defending);
    }
  }

  removeChar(char) {
    
  }

  onCellClick(index) {
    const charInCell = event.target;
    // проверить, принадлежит ли персонаж игроку
    const isCharInCell = charInCell && GameController.checkChar(charInCell, ['Bowman', 'Swordsman', 'Magician']);
    const isEnemyChar = GameController.checkChar(charInCell, ['Undead', 'Zombie', 'Daemon']);

    if (isEnemyChar) {
      if (this.canAttack) {
        const defending = this.enemyChars.filter((char) => char.position === index)[0];
        this.attack(this.currentChar, defending)
        this.enemyTurn();
      } else {
        GamePlay.showError('This is an enemy character!');
      }
      
    }

    if (isCharInCell) {
      if (this.currentChar) {
        this.gamePlay.deselectCell(this.currentChar.position);
      }
      this.selectChar(index);
    }

    if (this.currentChar) {
      if (this.canMove) {
        this.movePlayerChar(this.currentChar, index);
      }
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
        this.setAction(false, false);
      //указатель для атаки
      } else if (this.currentChar !== null && this.currentChar.areaAttack.indexOf(index) !== -1) {
        this.gamePlay.setCursor('crosshair');
        this.gamePlay.selectCell(index, 'red');
        this.setAction(false, true);
      }
      //указатель для движения
    } else if (this.currentChar !== null && this.currentChar.areaMove.indexOf(index) !== -1) {
      this.gamePlay.setCursor('pointer');
      this.gamePlay.selectCell(index, 'green');
      this.setAction(true, false);
    } else {
      this.gamePlay.setCursor('not-allowed');
      this.setAction(false, false);
    }
    

  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor('auto');
    if (this.gamePlay.cells[index].classList.contains('selected-green') || this.gamePlay.cells[index].classList.contains('selected-red')) {
      this.gamePlay.deselectCell(index);
    }
  }
}
