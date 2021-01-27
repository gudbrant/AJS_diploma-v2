import PositionedCharacter from './PositionedCharacter'

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  let rand = Math.floor(Math.random() * allowedTypes.length);
  let level = Math.floor(Math.random() * maxLevel + 1)
  const [playerPositions, enemyPositions] = defineColumns(8);
  
  const newChar = new allowedTypes[rand](1);
  
  if (level > 1) {
    for (i = 0; i < level - 1; i++) {
      newChar.levelUp();
    }
  }

  let positions = [];
  if (newChar.type === 'Bowman' || newChar.type === 'Magician' || newChar.type === 'Swordsman' ) {
    positions = playerPositions;
  } else {
    positions = enemyPositions;
  }
  let randomPosition = positions[Math.floor(Math.random() * positions.length)]
  
  const newPosChar = new PositionedCharacter(newChar, randomPosition);

  return newPosChar;
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  for (let i = 0; i < characterCount; i++) {
    const char = characterGenerator(allowedTypes, maxLevel);
    team.push(char);
  }
  return team;
  // TODO: write logic here
}

function defineColumns(boardSize) {
  let columnPlayer = []; 
  let columnEnemy = [];
  for (let i = 0; i < boardSize * boardSize; i += boardSize) {
    columnPlayer.push(i);
  }
  for (let i = 1; i < boardSize * boardSize; i += boardSize) {
    columnPlayer.push(i);
  }
  for (let i = boardSize - 1; i < boardSize * boardSize; i += boardSize) {
    columnEnemy.push(i);
  }
  for (let i = boardSize - 2; i < boardSize * boardSize; i += boardSize) {
    columnEnemy.push(i);
  }
  return [columnPlayer, columnEnemy];
}