export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export interface WinnerResult {
  symbol: string;
  line: number[];
}

export const checkWinner = (board: (string | null)[]): WinnerResult | null => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return { symbol: board[a] as string, line: combo };
    }
  }
  return null;
};

// Easy AI: random moves
export const getEasyAIMove = (board: (string | null)[]): number => {
  const available: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      available.push(i);
    }
  }
  if (available.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};

// Medium AI: Win, Block, Prefer Center, Prefer Corners, Random
export const getMediumAIMove = (
  board: (string | null)[],
  aiSymbol: string,
  playerSymbol: string
): number => {
  const getWinningMove = (symbol: string): number => {
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = symbol;
        if (checkWinner(testBoard)) {
          return i;
        }
      }
    }
    return -1;
  };

  // 1. Win if it can
  const winMove = getWinningMove(aiSymbol);
  if (winMove !== -1) return winMove;

  // 2. Block player's immediate winning move
  const blockMove = getWinningMove(playerSymbol);
  if (blockMove !== -1) return blockMove;

  // 3. Prefer center
  if (board[4] === null) return 4;

  // 4. Prefer corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((c) => board[c] === null);
  if (availableCorners.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableCorners.length);
    return availableCorners[randomIndex];
  }

  // 5. Otherwise choose reasonable available position
  return getEasyAIMove(board);
};

// Impossible AI: Minimax algorithm
export const findBestMove = (
  board: (string | null)[],
  aiSymbol: string,
  playerSymbol: string
): number => {
  const evaluate = (b: (string | null)[]): number => {
    const winnerInfo = checkWinner(b);
    if (winnerInfo) {
      return winnerInfo.symbol === aiSymbol ? 10 : -10;
    }
    return 0;
  };

  const minimax = (b: (string | null)[], depth: number, isMax: boolean): number => {
    const score = evaluate(b);
    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (b.every((cell) => cell !== null)) return 0;

    if (isMax) {
      let best = -1000;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = aiSymbol;
          best = Math.max(best, minimax(b, depth + 1, false));
          b[i] = null;
        }
      }
      return best;
    } else {
      let best = 1000;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = playerSymbol;
          best = Math.min(best, minimax(b, depth + 1, true));
          b[i] = null;
        }
      }
      return best;
    }
  };

  let bestVal = -1000;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = aiSymbol;
      const moveVal = minimax(board, 0, false);
      board[i] = null;
      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }
  return bestMove;
};

// XP & Level calculations
export interface LevelInfo {
  level: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  totalXpInCurrentLevelRange: number;
  currentLevelXpStart: number;
  nextLevelXpStart: number;
}

export const getLevelInfo = (totalXp: number): LevelInfo => {
  // Let's create an array of cumulative XP required for each level from 1 to 100
  // Index 0 is Level 1 (starts at 0 XP)
  // Index 1 is Level 2 (starts at 100 XP)
  // Index 2 is Level 3 (starts at 300 XP)
  // and so on: XP(L) = XP(L-1) + (L-1) * 100
  const thresholds: number[] = [0];
  for (let l = 2; l <= 100; l++) {
    thresholds.push(thresholds[thresholds.length - 1] + (l - 1) * 100);
  }

  // Find current level
  let level = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXp >= thresholds[i]) {
      level = i + 1;
      break;
    }
  }

  const currentLevelXpStart = thresholds[level - 1];
  const nextLevelXpStart = thresholds[level] || (currentLevelXpStart + level * 100);
  const xpInCurrentLevel = totalXp - currentLevelXpStart;
  const xpNeededForNextLevel = nextLevelXpStart - totalXp;
  const totalXpInCurrentLevelRange = nextLevelXpStart - currentLevelXpStart;

  return {
    level,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    totalXpInCurrentLevelRange,
    currentLevelXpStart,
    nextLevelXpStart,
  };
};

export const getLevelTitle = (level: number): string => {
  if (level >= 50) return 'Grandmaster';
  if (level >= 30) return 'Master';
  if (level >= 20) return 'Tactician';
  if (level >= 10) return 'Strategist';
  if (level >= 5) return 'Rookie';
  return 'Beginner';
};
