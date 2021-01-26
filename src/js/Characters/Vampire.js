import Character from '../Character';

export default class Vampire  extends Character {
  constructor (level) {
    super(level, 'Vampire');
    this.attack = 40;
    this.defence = 10;
    this.health = 100;
    this.distanceAttack = 2;
    this.distanceMove = 2;
  }
}