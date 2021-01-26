import Character from '../Character';

export default class Swordsman extends Character {
  constructor (level) {
    super(level, 'Swordsman');
    this.attack = 40;
    this.defence = 10;
    this.health = 100;
    this.distanceAttack = 1;
    this.distanceMove = 4;
  }
}