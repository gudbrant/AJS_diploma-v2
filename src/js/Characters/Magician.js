import Character from '../Character';

export default class Magician extends Character {
  constructor (level) {
    super(level, 'Magician');
    this.attack = 10;
    this.defence = 40;
    this.health = 100;
    this.distanceAttack = 4;
    this.distanceMove = 1;
  }
}