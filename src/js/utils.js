export function calcTileType(index, boardSize) {
  // TODO: write logic here
  let left = [];
  for (let i = 8; i < boardSize * (boardSize - 1); i += boardSize) {
    left.push(i);
  }
  let right = [];
  for (let i = 7; i < boardSize * (boardSize - 1); i += boardSize) {
    right.push(i);
  }
  if (index === 0) {
    return 'top-left';
  } else if (index < boardSize - 1) {
    return 'top';
  } else if (index === boardSize - 1) {
    return 'top-right';
  } else if (left.indexOf(index) !== -1) {
    return 'left';
  } else if (right.indexOf(index) !== -1) {
    return 'right';
  } else if (index === boardSize * (boardSize - 1)) {
    return 'bottom-left';
  } else if (index === boardSize * boardSize - 1) {
    return 'bottom-right';
  } else if (index > boardSize * (boardSize - 1)) {
    return 'bottom';
  } else {
    return 'center';
  }
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
