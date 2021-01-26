import Character from '../Character';

export default class Bowman extends Character {
  constructor (level) {
    super(level, 'Bowman');
    this.attack = 25;
    this.defence = 25;
    this.health = 100;
    this.distanceAttack = 2;
    this.distanceMove = 2;
  }
}