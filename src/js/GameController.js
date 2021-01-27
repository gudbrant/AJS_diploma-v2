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
import cursors from './cursors';
import icons from './icons';
import themes from './themes';

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
    this.currentLevel = 1;
  }


  /**
   * add event listeners to gamePlay events
   * load saved state from stateService
   */
  init() {
    this.gamePlay.drawUi(themes.prairie);
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

  async enemyTurn() {
    this.setBlocker(true);
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
      this.setBlocker(false);
    }
    setTimeout(enemyAction, 1000);
  }

  async attack(attacker, target) {
    let damage = Math.floor(Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1));
    await this.gamePlay.showDamage(target.position, damage);
    target.character.health -= damage;
    if (target.character.health <= 0) {
      this.killChar(target);
    }
    this.gamePlay.redrawPositions(this.allChars);
  }

  killChar(char) {
    this.playerChars = this.playerChars.filter((o) => o != char);
    this.enemyChars = this.enemyChars.filter((o) => o != char);
    this.allChars = this.allChars.filter((o) => o != char);
    this.checkFinishLevel();
  }


  checkFinishLevel() {
    if (this.playerChars.length === 0) {
      this.gameOver();
    } else if (this.enemyChars.length === 0) {
      if (this.level < 4) {
        this.level += 1;
        this.startNewLevel(this.level);
      } else {
        this.win();
      }
    } 
  }

  async onCellClick(index) {
    const charInCell = event.target;
    // проверить, принадлежит ли персонаж игроку
    const isCharInCell = charInCell && GameController.checkChar(charInCell, ['Bowman', 'Swordsman', 'Magician']);
    const isEnemyChar = GameController.checkChar(charInCell, ['Undead', 'Vampire', 'Daemon']);

    // если клик по вражескому персонажу
    if (isEnemyChar) {
      // если входит в радиус атаки
      if (this.canAttack) {
        const target = this.enemyChars.filter((char) => char.position === index)[0];
        await this.attack(this.currentChar, target);
        await this.enemyTurn();
      } else {
        GamePlay.showError('This is an enemy character!');
      }
      // если клик по персонажу игрока
    } else if (isCharInCell) {
      if (this.currentChar) {
        this.gamePlay.deselectCell(this.currentChar.position);
      }
      this.selectChar(index);
      // если персонаж выбран и клик в зоне движения
    } else if (this.currentChar && this.canMove) {
      this.movePlayerChar(this.currentChar, index);
    }
  }

  onCellEnter(index) {
    const charInCell = event.target.querySelector('.character')
    if (charInCell) {
      const findChar = this.allChars.filter((char) => char.position === index)[0].character;
      const message = `${icons.level} ${findChar.level} ${icons.attack} ${findChar.attack} ${icons.defence} ${findChar.defence} ${icons.health} ${findChar.health}`;
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

  gameOver() {
    alert('Game over!');
  }

  win() {
    alert('Win');
  }

  startNewGame() {
    this.playerChars = generateTeam([Swordsman, Bowman], 1, 2);
    this.enemyChars = generateTeam([Daemon, Undead, Vampire], 1, 2);
    this.allChars = this.playerChars.concat(this.enemyChars);
    return this.allChars;
  }

  startSecondLevel() {
    this.gamePlay.drawUi(themes.desert);
    let newChars = generateTeam([Swordsman, Bowman, Magician], 1, 1);
    this.playerChars = this.playerChars.concat(newChars);
    this.enemyChars = generateTeam([Daemon, Undead, Vampire], 2, this.playerChars.length);
    this.allChars = this.playerChars.concat(this.enemyChars);
  }

  startThirdLevel() {
    this.gamePlay.drawUi(themes.arctic);
    let newChars = generateTeam([Swordsman, Bowman, Magician], 2, 2);
    this.playerChars = this.playerChars.concat(newChars);
    this.enemyChars = generateTeam([Daemon, Undead, Vampire], 2, this.playerChars.length);
    this.allChars = this.playerChars.concat(this.enemyChars);
  }

  startFourthLevel() {
    this.gamePlay.drawUi(themes.mountain);
    let newChars = generateTeam([Swordsman, Bowman, Magician], 3, 2);
    this.playerChars = this.playerChars.concat(newChars);
    this.enemyChars = generateTeam([Daemon, Undead, Vampire], 4, this.playerChars.length);
    this.allChars = this.playerChars.concat(this.enemyChars);
  }

  restoreHealth() {
    this.playerChars.forEach(char => char.character.health = 100);
  }

  setBlocker(block) {
    if (block) {
      this.gamePlay.blocker.classList.remove('hidden');
    } else {
      this.gamePlay.blocker.classList.add('hidden');
    }
  }

  startNewLevel(level) {
    switch (level) {
      case 2:
        startSecondLevel();
        break;
      case 3:
        startThirdLevel();
        break;
      case 4:
        startFourthLevel();
        break;
      default:
        break;
    }
    this.restoreHealth();
    this.gamePlay.redrawPositions(this.allChars);
  }
}
