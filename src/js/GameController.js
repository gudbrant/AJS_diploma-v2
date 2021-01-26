import { generateTeam } from './generators';
import Board from './Board';
import GamePlay from './GamePlay';
import Bowman from './Characters/Bowman';
import Daemon from './Characters/Daemon';
import Magician from './Characters/Magician';
import Swordsman from './Characters/Swordsman';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.board = new Board;
    this.stateService = stateService;
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.playerChars = [];
    this.enemyChars = [];
    this.allChars = [];
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

  onCellClick(index) {
    const charInCell = event.target;
    const isCharInCell = charInCell && charInCell.classList.contains('Bowman') || 
    charInCell.classList.contains('Swordsman') || 
    charInCell.classList.contains('Magician')
    const isWrongChar = charInCell.classList.contains('Undead') || 
    charInCell.classList.contains('Zombie') ||
    charInCell.classList.contains('Daemon');
    console.log(isWrongChar)
    
    if (isWrongChar) {
      GamePlay.showError('This is an enemy character!');
    }

    if (this.gamePlay.boardEl.querySelector('.selected-yellow')) {
      const previousCell = this.gamePlay.boardEl.querySelector('.selected-yellow');
      const previousCellIndex = this.gamePlay.cells.indexOf(previousCell);
      this.gamePlay.deselectCell(previousCellIndex);
      if (isCharInCell) {
        this.gamePlay.selectCell(index);
      }
    } else if (isCharInCell) {
      this.gamePlay.selectCell(index);
    } 
    
    
  }

  onCellEnter(index) {
    const charInCell = event.target.querySelector('.character')
    if (charInCell) {
      const findChar = this.allChars.filter((char) => char.position === index)[0].character;
      const message = `🎖️ ${findChar.level} ⚔ ${findChar.attack} 🛡️ ${findChar.defence} ♥️ ${findChar.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }
}
