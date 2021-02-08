export default class Character {
  constructor(level, type = 'generic', name = '') {
    if (new.target.name === 'Character') {
      throw new Error('Запрещено создавать объекты класса Character')
    }
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: throw error if user use "new Character()"
  }

  setValues(attack, defence, health) {
    this.attack = attack
    this.defence = defence;
    this.health = health;
    }

  levelUp() {
    this.level += 1;
    this.attack = Math.round(Math.max(this.attack, this.attack * (1.8 - (100 - this.health) / 100)));
    this.defence = Math.round(Math.max(this.defence, this.defence * (1.8 - (100 - this.health) / 100)));
    this.health = this.level*10 + 80;
    if (this.health > 100) {
      this.health = 100;
    } else throw new Error('Нельзя повысить уровень умершего');
  }
}
