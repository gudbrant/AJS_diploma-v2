/* eslint-disable max-len */
// eslint-disable-next-line object-curly-newline
import { calcDamage, checkDistance, convertIndexToCoordinates, makeDamage } from './utils';

export default class BotAction {
  constructor(gamePlay, gameState) {
    this.gamePlay = gamePlay;
    this.userTeam = gameState.userTeam;
    this.userMembers = gameState.userTeam.members;
    this.botMembers = gameState.botTeam.members;
    this.target = undefined;
    this.attacker = undefined;
    this.action = null;
  }

  getPairWithAttackAction(targets, attackers) {
    for (const target of targets) {
      for (const attacker of attackers) {
        if (checkDistance(target.position, attacker, 'attack', this.gamePlay.boardSize)) {
          return { target, attacker };
        }
      }
    }
    return null;
  }

  getDistanceBetweenCharacters(target, attacker) {
    const { x: x1, y: y1 } = convertIndexToCoordinates(target.position, this.gamePlay.boardSize);
    const { x: x2, y: y2 } = convertIndexToCoordinates(attacker.position, this.gamePlay.boardSize);
    const x = Math.abs(x1 - x2);
    const y = Math.abs(y1 - y2);
    return Math.max(x, y);
  }

  getPairWithMoveAction(targets, attackers) {
    const distanceBetweenCharacters = [];
    let minDistance;
    for (const target of targets) {
      for (const attacker of attackers) {
        const distance = this.getDistanceBetweenCharacters(target, attacker);
        distanceBetweenCharacters.push({ target, attacker, distance });
        if (minDistance === undefined) minDistance = distance;
        else if (minDistance > distance) minDistance = distance;
      }
    }
    return distanceBetweenCharacters.find((el) => el.distance === minDistance);
  }

  getCharactersWithMinDefence() {
    const defenceValues = [];
    for (const { character } of this.userMembers) defenceValues.push(character.defence);
    const minDefence = Math.min(...defenceValues);
    return this.userMembers.filter(({ character }) => character.defence === minDefence);
  }

  getCharactersWithMaxAttack() {
    const attackValues = [];
    for (const { character } of this.botMembers) attackValues.push(character.attack);
    const maxAttack = Math.max(...attackValues);
    return this.botMembers.filter(({ character }) => character.attack === maxAttack);
  }

  getPairAndAction() {
    const targets = this.getCharactersWithMinDefence();
    const attackers = this.getCharactersWithMaxAttack();
    const pairWithAttackAction = this.getPairWithAttackAction(targets, attackers);
    if (pairWithAttackAction) {
      return { pair: pairWithAttackAction, action: 'attack' };
    }
    const pairWithMoveAction = this.getPairWithMoveAction(targets, attackers);
    return { pair: pairWithMoveAction, action: 'move' };
  }

  setPairAndAction() {
    const pairAndAction = this.getPairAndAction();
    this.target = pairAndAction.pair.target;
    this.attacker = pairAndAction.pair.attacker;
    this.action = pairAndAction.action;
  }

  attackTarget() {
    const damage = calcDamage(this.attacker.character, this.target.character);

    makeDamage(damage, this.target, this.userTeam);
    return new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.selectCell(this.attacker.position);
        resolve();
      }, 300);
    }).then(() => new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.selectCell(this.target.position, 'red');
        resolve();
      }, 300);
    })).then(() => new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.showDamage(this.target.position, damage);
        this.gamePlay.deselectCell(this.target.position);
        this.gamePlay.deselectCell(this.attacker.position);
        resolve();
      }, 300);
    }));
  }

  convertCoordinatesToIndex(coordinates) {
    const { x, y } = coordinates;
    return y * this.gamePlay.boardSize + x;
  }

  // Получить минимальное расстояние
  // eslint-disable-next-line class-methods-use-this
  getMinDistances(cellsRangeAndDistances) {
    let minDistance;
    for (const { distance } of cellsRangeAndDistances) {
      if (minDistance === undefined) minDistance = distance;
      if (minDistance > distance) minDistance = distance;
    }
    return minDistance;
  }

  getNearestCells(cellsInAttackRadius, position) {
    const { x: x1, y: y1 } = convertIndexToCoordinates(position, this.gamePlay.boardSize);
    const cellsRangeAndDistances = [];
    for (const cell of cellsInAttackRadius) {
      const x = Math.abs(x1 - cell.x);
      const y = Math.abs(y1 - cell.y);
      const distance = Math.max(x, y);
      cellsRangeAndDistances.push({ cell, distance });
    }
    const minDistance = this.getMinDistances(cellsRangeAndDistances);
    return cellsRangeAndDistances.filter((el) => el.distance === minDistance);
  }

  getCellToMove(nearestCells) {
    if (nearestCells.length === 1) return nearestCells[0];
    const randomCellIndex = Math.floor(Math.random() * nearestCells.length);
    return nearestCells[randomCellIndex];
  }

  getCellsInTargetRange(range, index) {
    const { x: targetX, y: targetY } = convertIndexToCoordinates(index, this.gamePlay.boardSize);
    const x1 = (targetX - range) > 0 ? targetX - range : 0;
    const y1 = (targetY - range) > 0 ? targetY - range : 0;
    const x2 = (targetX + range) < this.gamePlay.boardSize ? targetX + range : this.gamePlay.boardSize - 1;
    const y2 = (targetY + range) < this.gamePlay.boardSize ? targetY + range : this.gamePlay.boardSize - 1;

    const cells = [];
    for (let y = y1; y <= y2; y += 1) {
      for (let x = x1; x <= x2; x += 1) {
        const cellIndex = this.convertCoordinatesToIndex({ x, y });
        const character = [...this.userMembers, ...this.botMembers].find(({ position }) => position === cellIndex);
        if (!character) cells.push({ x, y });
      }
    }
    return cells;
  }

  getCellToAttackFrom() {
    const cellsInAttackRange = this.getCellsInTargetRange(this.attacker.character.attackRange, this.target.position);
    const nearestCells = this.getNearestCells(cellsInAttackRange, this.attacker.position);
    return this.getCellToMove(nearestCells);
  }

  getCellIndexToMove() {
    const cellToAttackFrom = this.getCellToAttackFrom();
    let cellIndexToMove = this.convertCoordinatesToIndex(cellToAttackFrom.cell);
    while (!checkDistance(cellIndexToMove, this.attacker, this.action, this.gamePlay.boardSize)) {
      const cellsInTargetRange = this.getCellsInTargetRange(this.attacker.character.movementRange, cellIndexToMove);
      const cellsToMove = [];
      for (const cell of cellsInTargetRange) {
        const cellIndex = this.convertCoordinatesToIndex(cell);
        if (checkDistance(cellIndex, this.attacker, this.action, this.gamePlay.boardSize)) cellsToMove.push(cell);
      }

      if (cellsToMove.length === 1) {
        cellIndexToMove = this.convertCoordinatesToIndex(cellsToMove[0]);
      } else if (cellsToMove.length > 1) {
        const nearestCellsToMoveCell = this.getNearestCells(cellsToMove, cellIndexToMove);
        const cellToMove = this.getCellToMove(nearestCellsToMoveCell);
        cellIndexToMove = this.convertCoordinatesToIndex(cellToMove.cell);
      } else if (cellsToMove.length === 0) {
        // Нет ячеек в радиусе перемещения
        const nearestCells = this.getNearestCells(cellsInTargetRange, this.attacker.position);
        const cellToMove = this.getCellToMove(nearestCells);
        cellIndexToMove = this.convertCoordinatesToIndex(cellToMove.cell);
      }
    }
    return cellIndexToMove;
  }

  moveToCell(cellIndex) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.selectCell(this.attacker.position);
        resolve();
      }, 300);
    }).then(() => new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.selectCell(cellIndex, 'green');
        resolve();
      }, 300);
    })).then(() => new Promise((resolve) => {
      setTimeout(() => {
        this.gamePlay.deselectCell(this.attacker.position);
        this.gamePlay.deselectCell(cellIndex);
        this.attacker.position = cellIndex;
        resolve();
      }, 300);
    }));
  }
}
