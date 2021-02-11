/* eslint-disable max-len */
import cursors from './cursors';
import { checkDistance, calcDamage, makeDamage } from './utils';
import GamePlay from './GamePlay';

export default class UserActions {
  constructor(gamePlay, gameState, selectedCharacter) {
    this.gamePlay = gamePlay;
    this.gameState = gameState;
    this.selectedCharacter = selectedCharacter;
  }

  onEmptyCellEnter(index) {
    if (!this.selectedCharacter) {
      this.gamePlay.setCursor(cursors.auto);
      return;
    }
    if (checkDistance(index, this.selectedCharacter, 'move', this.gamePlay.boardSize)) {
      this.gamePlay.selectCell(index, 'green');
      this.gamePlay.setCursor(cursors.pointer);
    } else this.gamePlay.setCursor(cursors.notallowed);
  }

  onBotCellEnter(index) {
    if (!this.selectedCharacter) {
      this.gamePlay.setCursor(cursors.auto);
      return;
    }
    if (checkDistance(index, this.selectedCharacter, 'attack', this.gamePlay.boardSize)) {
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor(cursors.crosshair);
      return;
    }

    this.gamePlay.setCursor(cursors.notallowed);
  }

  onUserCellClick(posCharacter) {
    if (this.selectedCharacter) {
      if (posCharacter.position === this.selectedCharacter.position) return posCharacter;
      this.gamePlay.deselectCell(this.selectedCharacter.position);
    }
    this.gamePlay.selectCell(posCharacter.position);
    return posCharacter;
  }

  onEmptyCellClick(index) {
    if (!this.selectedCharacter) return false;
    if (!checkDistance(index, this.selectedCharacter, 'move', this.gamePlay.boardSize)) {
      GamePlay.showError('Недопустимый радиус передвижения');
      return false;
    }
    this.gamePlay.deselectCell(this.selectedCharacter.position);
    this.gamePlay.deselectCell(index);
    this.selectedCharacter.position = index;
    this.gameState.currentPlayer = 'bot';
    return true;
  }

  onBotCellClick(posCharacter) {
    if (!this.selectedCharacter) {
      GamePlay.showError('Этот персонаж пренадлежит противнику');
      return 0;
    }
    if (!checkDistance(posCharacter.position, this.selectedCharacter, 'attack', this.gamePlay.boardSize)) {
      GamePlay.showError('Недопустимый радиус атаки');
      return 0;
    }
    const { character: attacker } = this.selectedCharacter;
    const { character: target } = posCharacter;
    const damage = calcDamage(attacker, target);
    makeDamage(damage, posCharacter, this.gameState.botTeam);
    return damage;
  }
}
