export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: throw error if user use "new Character()"
  }

  levelUp() {
    this.level += 1;
    this.attack = Math.round(Math.max(this.attack, this.attack * (1.8 - (100 - this.health) / 100)));
    this.defence = Math.round(Math.max(this.defence, this.defence * (1.8 - (100 - this.health) / 100)));
    this.health = this.level*10 + 80;
    if (this.health > 100) {
      this.health = 100;
    }
  }
}
