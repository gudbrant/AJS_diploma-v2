import Character from '../Character';

export default class Undead extends Character {
  constructor (level) {
    super(level, 'Undead');
    this.attack = 25;
    this.defence = 25;
    this.health = 100;
    this.distanceAttack = 1;
    this.distanceMove = 4;
  }
}