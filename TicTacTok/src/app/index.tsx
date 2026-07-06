import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  SafeAreaView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const STATS_KEY = 'TIC_TAC_TOE_STATS';

const checkWinner = (board) => {
  for (let combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return { symbol: board[a], line: combo };
    }
  }
  return null;
};

export default function App() {
  const { width } = useWindowDimensions();

  // Responsive board size: 88% of screen width, capped at 340px
  const BOARD_SIZE = Math.min(width * 0.88, 340);
  const CELL_SIZE = BOARD_SIZE / 3;

  const [screen, setScreen] = useState('start'); // 'start' or 'game'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [isDraw, setIsDraw] = useState(false);

  const [stats, setStats] = useState({
    gamesPlayed: 0,
    xWins: 0,
    oWins: 0,
    draws: 0,
  });

  // One animated value per cell, controls the X/O "pop-in" effect
  const cellAnims = useRef(
    Array.from({ length: 9 }, () => new Animated.Value(0))
  ).current;

  // Controls the Winner/Draw message pop-in
  const resultAnim = useRef(new Animated.Value(0)).current;

  // Controls a soft pulsing glow on the winning line
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadStats();
  }, []);

  // Animate the result message whenever the game ends
  useEffect(() => {
    if (winner || isDraw) {
      Animated.spring(resultAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      resultAnim.setValue(0);
    }
  }, [winner, isDraw]);

  // Start a continuous pulse animation on the winning line
  useEffect(() => {
    if (winningLine.length > 0) {
      pulseAnim.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [winningLine]);

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem(STATS_KEY);
      if (savedStats !== null) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.log('Failed to load stats:', error);
    }
  };

  const saveStats = async (newStats) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch (error) {
      console.log('Failed to save stats:', error);
    }
  };

  const updateStatsAfterGame = (result) => {
    const newStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      xWins: stats.xWins + (result === 'X' ? 1 : 0),
      oWins: stats.oWins + (result === 'O' ? 1 : 0),
      draws: stats.draws + (result === 'draw' ? 1 : 0),
    };
    setStats(newStats);
    saveStats(newStats);
  };

  const handleCellPress = (index) => {
    if (board[index] !== null || winner || isDraw) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = isXTurn ? 'X' : 'O';
    setBoard(newBoard);

    // Animate this cell's symbol popping in
    Animated.spring(cellAnims[index], {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.symbol);
      setWinningLine(result.line);
      updateStatsAfterGame(result.symbol);
      return;
    }

    const boardIsFull = newBoard.every((cell) => cell !== null);
    if (boardIsFull) {
      setIsDraw(true);
      updateStatsAfterGame('draw');
      return;
    }

    setIsXTurn(!isXTurn);
  };

  const resetGameState = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
    cellAnims.forEach((anim) => anim.setValue(0));
  };

  const handleRestart = () => resetGameState();

  const handleStartGame = () => {
    resetGameState();
    setScreen('game');
  };

  const gameOver = winner !== null || isDraw;

  // ---------- START SCREEN ----------
  if (screen === 'start') {
    return (
      <LinearGradient colors={['#020617', '#0F172A', '#1E1B4B']} style={styles.flex}>
        <SafeAreaView style={styles.centeredScreen}>
          <Text style={styles.bigTitle}>Tic Tac Toe</Text>
          <Text style={styles.subtitle}>Play against a friend on the same device</Text>

          <Pressable onPress={handleStartGame}>
            {({ pressed }) => (
              <LinearGradient
                colors={['#F97316', '#EA580C']}
                style={[styles.primaryButton, pressed && styles.pressedShrink]}
              >
                <Text style={styles.buttonText}>Start Game</Text>
              </LinearGradient>
            )}
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ---------- GAME SCREEN ----------
  return (
    <LinearGradient colors={['#020617', '#0F172A', '#1E1B4B']} style={styles.flex}>
      <SafeAreaView style={styles.centeredScreen}>
        <Text style={styles.header}>Tic Tac Toe</Text>

        {!gameOver && (
          <Text style={styles.turnText}>
            Current Turn: <Text style={styles.turnSymbol}>{isXTurn ? 'X' : 'O'}</Text>
          </Text>
        )}

        {gameOver && (
          <Animated.Text
            style={[
              styles.resultText,
              {
                opacity: resultAnim,
                transform: [{ scale: resultAnim }],
              },
            ]}
          >
            {winner ? `Winner: ${winner}` : "It's a Draw!"}
          </Animated.Text>
        )}

        <View
          style={[
            styles.board,
            { width: BOARD_SIZE, height: BOARD_SIZE, borderRadius: BOARD_SIZE * 0.06 },
          ]}
        >
          {board.map((value, index) => {
            const isWinningCell = winningLine.includes(index);

            return (
              <Animated.View
                key={index}
                style={{
                  transform: [{ scale: isWinningCell ? pulseAnim : 1 }],
                }}
              >
                <Pressable
                  style={[
                    styles.cell,
                    {
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                    },
                    isWinningCell && styles.cellHighlight,
                  ]}
                  onPress={() => handleCellPress(index)}
                >
                  <Animated.Text
                    style={[
                      styles.cellText,
                      { fontSize: CELL_SIZE * 0.42 },
                      value === 'X' ? styles.xText : styles.oText,
                      {
                        opacity: cellAnims[index],
                        transform: [{ scale: cellAnims[index] }],
                      },
                    ]}
                  >
                    {value}
                  </Animated.Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <Pressable onPress={handleRestart}>
          {({ pressed }) => (
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              style={[styles.primaryButton, pressed && styles.pressedShrink]}
            >
              <Text style={styles.buttonText}>
                {gameOver ? 'Play Again' : 'Restart Game'}
              </Text>
            </LinearGradient>
          )}
        </Pressable>

        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>Statistics</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>Games: {stats.gamesPlayed}</Text>
            <Text style={styles.statsText}>X Wins: {stats.xWins}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>O Wins: {stats.oWins}</Text>
            <Text style={styles.statsText}>Draws: {stats.draws}</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centeredScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bigTitle: {
    fontSize: 46,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#DCD8FF',
    textAlign: 'center',
    marginBottom: 44,
    lineHeight: 22,
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  turnText: {
    fontSize: 18,
    color: '#DCD8FF',
    marginBottom: 22,
  },
  turnSymbol: {
    fontWeight: '800',
    color: '#FB923C',
  },
  resultText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4ADE80',
    marginBottom: 22,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  cell: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellHighlight: {
    backgroundColor: 'rgba(74, 222, 128, 0.25)',
  },
  cellText: {
    fontWeight: '800',
  },
  xText: {
    color: '#FB923C',
  },
  oText: {
    color: '#38BDF8',
  },
  primaryButton: {
    marginTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 46,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pressedShrink: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  statsBox: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 22,
    width: '88%',
    maxWidth: 340,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statsText: {
    fontSize: 14,
    color: '#DCD8FF',
  },
});