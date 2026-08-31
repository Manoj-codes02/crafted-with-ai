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
import {
  checkWinner,
  getEasyAIMove,
  getMediumAIMove,
  findBestMove,
  getLevelInfo,
  getLevelTitle,
  LevelInfo,
} from '@/utils/gameHelpers';

const STATS_KEY = 'TIC_TAC_TOE_STATS';

export default function App() {
  const { width } = useWindowDimensions();

  // Responsive board size: 88% of screen width, capped at 340px
  const BOARD_SIZE = Math.min(width * 0.88, 340);
  const CELL_SIZE = BOARD_SIZE / 3;

  const getCellBorderStyle = (row: number, col: number) => {
    return {
      borderRightWidth: col < 2 ? 1 : 0,
      borderRightColor: 'rgba(255, 255, 255, 0.12)',
      borderBottomWidth: row < 2 ? 1 : 0,
      borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    };
  };

  // Screen state: 'start' | 'setup' | 'settings' | 'game'
  const [screen, setScreen] = useState<'start' | 'setup' | 'settings' | 'game'>('start');
  
  // Game Configuration states
  const [gameMode, setGameMode] = useState<'vsAI' | 'local2Player'>('vsAI');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'impossible'>('medium');
  const [gameStyle, setGameStyle] = useState<'classic' | 'blitz'>('classic');

  // Core Game states
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [isDraw, setIsDraw] = useState(false);
  
  // Locks/Flags to prevent double updates or race conditions
  const [gameFinished, setGameFinished] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  
  // Timer state for Blitz mode
  const [timeLeft, setTimeLeft] = useState(5);

  // Persistent Player Progression & Statistics State
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    xWins: 0,
    oWins: 0,
    draws: 0,
    xp: 0,
    level: 1,
    currentStreak: 0,
    bestStreak: 0,
  });

  // Details of the most recently finished match for the result screen overlay
  const [matchResult, setMatchResult] = useState<{
    result: 'X' | 'O' | 'draw';
    xpEarned: number;
    oldXp: number;
    newXp: number;
    streakText: string;
    levelInfo: LevelInfo | null;
  } | null>(null);

  // One animated value per cell, controls the X/O "pop-in" effect
  const cellAnims = useRef(
    Array.from({ length: 9 }, () => new Animated.Value(0))
  ).current;

  // Controls the Result screen overlay/modal pop-in animation
  const resultAnim = useRef(new Animated.Value(0)).current;

  // Controls a soft pulsing glow on the winning line
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Interval reference for the Blitz timer
  const timerRef = useRef<any | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  // Animate the result overlay whenever the game ends
  useEffect(() => {
    if (gameFinished) {
      Animated.spring(resultAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      resultAnim.setValue(0);
    }
  }, [gameFinished]);

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

  // Turn timer effect for Blitz Mode
  useEffect(() => {
    const startTurnTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeLeft(5);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const stopTurnTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (screen === 'game' && gameStyle === 'blitz' && !gameFinished) {
      startTurnTimer();
    } else {
      stopTurnTimer();
    }

    return () => stopTurnTimer();
  }, [board, isXTurn, screen, gameStyle, gameFinished]);

  // AI Move triggering effect
  useEffect(() => {
    let aiTimeoutId: any;

    if (screen === 'game' && gameMode === 'vsAI' && !isXTurn && !gameFinished) {
      aiTimeoutId = setTimeout(() => {
        let bestCell = -1;
        if (aiDifficulty === 'easy') {
          bestCell = getEasyAIMove(board);
        } else if (aiDifficulty === 'medium') {
          bestCell = getMediumAIMove(board, 'O', 'X');
        } else if (aiDifficulty === 'impossible') {
          bestCell = findBestMove(board, 'O', 'X');
        }

        if (bestCell !== -1) {
          const newBoard = [...board];
          newBoard[bestCell] = 'O';
          setBoard(newBoard);

          // Animate the cell symbol pop-in
          Animated.spring(cellAnims[bestCell], {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }).start();

          // Check if AI won
          const winResult = checkWinner(newBoard);
          if (winResult) {
            setWinner(winResult.symbol);
            setWinningLine(winResult.line);
            setGameFinished(true);
            updateStatsAfterGame(winResult.symbol as 'X' | 'O');
            return;
          }

          // Check for a draw
          const boardIsFull = newBoard.every((cell) => cell !== null);
          if (boardIsFull) {
            setIsDraw(true);
            setGameFinished(true);
            updateStatsAfterGame('draw');
            return;
          }

          // Return turn to player
          setIsXTurn(true);
        }
      }, 700); // 700ms simulated delay for natural feel
    }

    return () => {
      if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
      }
    };
  }, [board, isXTurn, screen, gameMode, gameFinished, aiDifficulty]);

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem(STATS_KEY);
      if (savedStats !== null) {
        const parsed = JSON.parse(savedStats);
        setStats({
          gamesPlayed: parsed.gamesPlayed ?? 0,
          xWins: parsed.xWins ?? 0,
          oWins: parsed.oWins ?? 0,
          draws: parsed.draws ?? 0,
          xp: parsed.xp ?? 0,
          level: parsed.level ?? 1,
          currentStreak: parsed.currentStreak ?? 0,
          bestStreak: parsed.bestStreak ?? 0,
        });
      }
    } catch (error) {
      console.log('Failed to load stats:', error);
    }
  };

  const saveStats = async (newStats: typeof stats) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch (error) {
      console.log('Failed to save stats:', error);
    }
  };

  const updateStatsAfterGame = (resultSymbol: 'X' | 'O' | 'draw') => {
    setStats((prevStats) => {
      const updated = { ...prevStats };
      updated.gamesPlayed += 1;

      if (resultSymbol === 'X') {
        updated.xWins += 1;
      } else if (resultSymbol === 'O') {
        updated.oWins += 1;
      } else {
        updated.draws += 1;
      }

      let xpEarned = 0;
      let streakText = '';
      let levelInfo: LevelInfo | null = null;
      let oldXp = 0;
      let newXp = 0;

      if (gameMode === 'vsAI') {
        if (resultSymbol === 'X') {
          // Player won
          xpEarned = 100;
          updated.currentStreak += 1;
          if (updated.currentStreak > updated.bestStreak) {
            updated.bestStreak = updated.currentStreak;
          }
          streakText = `🔥 Streak: ${updated.currentStreak}`;
        } else if (resultSymbol === 'O') {
          // AI won (Player lost)
          xpEarned = 10;
          updated.currentStreak = 0;
          streakText = `🔥 Streak reset`;
        } else {
          // Draw
          xpEarned = 25;
          streakText = `🔥 Streak maintained (${updated.currentStreak})`;
        }

        oldXp = updated.xp;
        newXp = oldXp + xpEarned;
        updated.xp = newXp;

        levelInfo = getLevelInfo(newXp);
        updated.level = levelInfo.level;

        setTimeout(() => {
          setMatchResult({
            result: resultSymbol,
            xpEarned,
            oldXp,
            newXp,
            streakText,
            levelInfo,
          });
        }, 0);
      } else {
        // Local 2 Player (does not update streak or XP)
        setTimeout(() => {
          setMatchResult({
            result: resultSymbol,
            xpEarned: 0,
            oldXp: 0,
            newXp: 0,
            streakText: '',
            levelInfo: null,
          });
        }, 0);
      }

      saveStats(updated);
      return updated;
    });
  };

  const handleCellPress = (index: number) => {
    // Block if cell is taken, game is over, or it's currently AI's turn
    if (
      board[index] !== null ||
      gameFinished ||
      (gameMode === 'vsAI' && !isXTurn)
    ) {
      return;
    }

    const currentSymbol = isXTurn ? 'X' : 'O';
    const newBoard = [...board];
    newBoard[index] = currentSymbol;
    setBoard(newBoard);

    // Animate the cell symbol pop-in
    Animated.spring(cellAnims[index], {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Check winner
    const winResult = checkWinner(newBoard);
    if (winResult) {
      setWinner(winResult.symbol);
      setWinningLine(winResult.line);
      setGameFinished(true);
      updateStatsAfterGame(winResult.symbol as 'X' | 'O');
      return;
    }

    // Check draw
    const boardIsFull = newBoard.every((cell) => cell !== null);
    if (boardIsFull) {
      setIsDraw(true);
      setGameFinished(true);
      updateStatsAfterGame('draw');
      return;
    }

    // Alternating turns
    setIsXTurn(!isXTurn);
  };

  const handleTimeout = () => {
    if (gameFinished) return;

    // The active turn player loses
    const winningSymbol = isXTurn ? 'O' : 'X';
    setWinner(winningSymbol);
    setWinningLine([]);
    setGameFinished(true);
    setIsTimeout(true);
    updateStatsAfterGame(winningSymbol);
  };

  const resetGameState = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
    setGameFinished(false);
    setIsTimeout(false);
    setTimeLeft(5);
    setMatchResult(null);
    cellAnims.forEach((anim) => anim.setValue(0));
    resultAnim.setValue(0);
  };

  const handleRestart = () => resetGameState();

  const resetAllStats = async () => {
    const freshStats = {
      gamesPlayed: 0,
      xWins: 0,
      oWins: 0,
      draws: 0,
      xp: 0,
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
    };
    setStats(freshStats);
    await saveStats(freshStats);
  };

  // ---------- SCREEN 1: HOME/START SCREEN ----------
  if (screen === 'start') {
    return (
      <LinearGradient colors={['#020617', '#0F172A', '#1E1B4B']} style={styles.flex}>
        <SafeAreaView style={styles.centeredScreen}>
          <Text style={styles.bigTitle}>TIC TAC TOK</Text>
          <Text style={styles.subtitle}>Quick. Smart. Addictive.</Text>

          {/* Persistent Progression Summary Card */}
          <View style={styles.levelCard}>
            <Text style={styles.homeLevelText}>
              LEVEL {stats.level} — {getLevelTitle(stats.level)}
            </Text>
            <View style={styles.xpRow}>
              <Text style={styles.xpText}>{stats.xp} XP</Text>
              <Text style={styles.xpText}>🔥 {stats.currentStreak} Streak</Text>
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.menuContainer}>
            <Pressable
              onPress={() => {
                setGameMode('vsAI');
                setScreen('setup');
              }}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={['#F97316', '#EA580C']}
                  style={[styles.menuButton, pressed && styles.pressedShrink]}
                >
                  <Text style={styles.buttonText}>🤖 Vs AI</Text>
                </LinearGradient>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setGameMode('local2Player');
                setScreen('setup');
              }}
            >
              {({ pressed }) => (
                <View style={[styles.secondaryMenuButton, pressed && styles.pressedShrink]}>
                  <Text style={styles.secondaryButtonText}>👥 Local 2 Player</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setScreen('settings');
              }}
            >
              {({ pressed }) => (
                <View style={[styles.secondaryMenuButton, pressed && styles.pressedShrink]}>
                  <Text style={styles.secondaryButtonText}>⚙️ Settings</Text>
                </View>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ---------- SCREEN 2: SETUP SCREEN ----------
  if (screen === 'setup') {
    return (
      <LinearGradient colors={['#020617', '#0F172A', '#1E1B4B']} style={styles.flex}>
        <SafeAreaView style={styles.centeredScreen}>
          <Text style={styles.header}>MATCH SETUP</Text>
          <Text style={styles.subtitle}>
            {gameMode === 'vsAI' ? 'Configure your game against AI' : 'Configure a local 2 player game'}
          </Text>

          {/* Difficulty Section (Only for VS AI mode) */}
          {gameMode === 'vsAI' && (
            <View style={styles.setupSection}>
              <Text style={styles.setupSectionTitle}>AI DIFFICULTY</Text>
              <View style={styles.difficultyRow}>
                <Pressable
                  style={[
                    styles.difficultyButton,
                    aiDifficulty === 'easy' && styles.difficultyButtonActiveEasy,
                  ]}
                  onPress={() => setAiDifficulty('easy')}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      aiDifficulty === 'easy' && styles.difficultyButtonTextActive,
                    ]}
                  >
                    🟢 EASY
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.difficultyButton,
                    aiDifficulty === 'medium' && styles.difficultyButtonActiveMedium,
                  ]}
                  onPress={() => setAiDifficulty('medium')}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      aiDifficulty === 'medium' && styles.difficultyButtonTextActive,
                    ]}
                  >
                    🟡 MEDIUM
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.difficultyButton,
                    aiDifficulty === 'impossible' && styles.difficultyButtonActiveImpossible,
                  ]}
                  onPress={() => setAiDifficulty('impossible')}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      aiDifficulty === 'impossible' && styles.difficultyButtonTextActive,
                    ]}
                  >
                    🔴 IMPOSSIBLE
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Game Style Section (Classic / Blitz) */}
          <View style={styles.setupSection}>
            <Text style={styles.setupSectionTitle}>GAME STYLE</Text>
            <View style={styles.styleRow}>
              <Pressable
                style={[
                  styles.styleButton,
                  gameStyle === 'classic' && styles.styleButtonActive,
                ]}
                onPress={() => setGameStyle('classic')}
              >
                <Text style={[styles.styleButtonText, gameStyle === 'classic' && styles.styleButtonTextActive]}>
                  🏆 CLASSIC
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.styleButton,
                  gameStyle === 'blitz' && styles.styleButtonActive,
                ]}
                onPress={() => setGameStyle('blitz')}
              >
                <Text style={[styles.styleButtonText, gameStyle === 'blitz' && styles.styleButtonTextActive]}>
                  ⚡ BLITZ (5s Turn)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.setupActions}>
            <Pressable
              onPress={() => {
                resetGameState();
                setScreen('game');
              }}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={['#F97316', '#EA580C']}
                  style={[styles.primaryButton, pressed && styles.pressedShrink]}
                >
                  <Text style={styles.buttonText}>START MATCH</Text>
                </LinearGradient>
              )}
            </Pressable>

            <Pressable
              onPress={() => setScreen('start')}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressedShrink]}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ---------- SCREEN 3: SETTINGS SCREEN ----------
  if (screen === 'settings') {
    const levelInfo = getLevelInfo(stats.xp);

    return (
      <LinearGradient colors={['#020617', '#0F172A', '#1E1B4B']} style={styles.flex}>
        <SafeAreaView style={styles.centeredScreen}>
          <Text style={styles.header}>SETTINGS & STATS</Text>
          <Text style={styles.subtitle}>Track your overall player development</Text>

          {/* Level Progress Card */}
          <View style={styles.levelCard}>
            <Text style={styles.levelTitleText}>
              LEVEL {stats.level} — {getLevelTitle(stats.level)}
            </Text>
            
            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      (levelInfo.xpInCurrentLevel / levelInfo.totalXpInCurrentLevelRange) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
            
            <View style={styles.xpRow}>
              <Text style={styles.xpText}>{stats.xp} Total XP</Text>
              <Text style={styles.xpText}>
                {levelInfo.xpNeededForNextLevel} XP to Level {stats.level + 1}
              </Text>
            </View>
          </View>

          {/* Statistics Box */}
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>Game Statistics</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>Matches: {stats.gamesPlayed}</Text>
              <Text style={styles.statsText}>X Wins (Player): {stats.xWins}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>O Wins (AI/P2): {stats.oWins}</Text>
              <Text style={styles.statsText}>Draws: {stats.draws}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>🔥 Current Streak: {stats.currentStreak}</Text>
              <Text style={styles.statsText}>🏆 Best Streak: {stats.bestStreak}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.setupActions}>
            <Pressable
              onPress={async () => {
                await resetAllStats();
              }}
              style={({ pressed }) => [styles.resetButton, pressed && styles.pressedShrink]}
            >
              <Text style={styles.resetButtonText}>Reset All Progression</Text>
            </Pressable>

            <Pressable
              onPress={() => setScreen('start')}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressedShrink]}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ---------- SCREEN 4: GAME SCREEN (WITH RESULT OVERLAY) ----------
  return (
    <LinearGradient colors={['#020617', '#0F172A', '#1E1B4B']} style={styles.flex}>
      <SafeAreaView style={styles.centeredScreen}>
        
        {/* Game Mode / Difficulty Info */}
        <Text style={styles.header}>
          {gameMode === 'vsAI' ? `Vs AI — ${aiDifficulty.toUpperCase()}` : 'Local 2 Player'}
        </Text>
        <Text style={styles.gameSubtitle}>
          {gameStyle === 'blitz' ? '⚡ Blitz Mode (5s Turn)' : '🏆 Classic Mode'}
        </Text>

        {/* Turn indicator OR Timeout Message (Only if game is active) */}
        {!gameFinished && (
          <View style={styles.infoBar}>
            <Text style={styles.turnText}>
              Turn: <Text style={styles.turnSymbol}>{isXTurn ? 'X' : 'O'}</Text>
            </Text>
            
            {/* Blitz Countdown Timer */}
            {gameStyle === 'blitz' && (
              <Text style={[styles.timerBadge, timeLeft <= 2 && styles.timerBadgeWarning]}>
                ⏱️ 00:0{timeLeft}
              </Text>
            )}
          </View>
        )}

        {/* The 3x3 Grid Board */}
        <View
          style={[
            styles.board,
            { width: BOARD_SIZE, height: BOARD_SIZE, borderRadius: BOARD_SIZE * 0.06 },
          ]}
        >
          {[0, 1, 2].map((rowIndex) => (
            <View key={rowIndex} style={styles.boardRow}>
              {[0, 1, 2].map((colIndex) => {
                const cellIndex = rowIndex * 3 + colIndex;
                const value = board[cellIndex];
                const isWinningCell = winningLine.includes(cellIndex);

                return (
                  <Animated.View
                    key={colIndex}
                    style={[
                      styles.cellContainer,
                      getCellBorderStyle(rowIndex, colIndex),
                      isWinningCell && styles.cellHighlight,
                      {
                        transform: [{ scale: isWinningCell ? pulseAnim : 1 }],
                      },
                    ]}
                  >
                    <Pressable
                      style={styles.cell}
                      onPress={() => handleCellPress(cellIndex)}
                    >
                      <Animated.Text
                        style={[
                          styles.cellText,
                          { fontSize: CELL_SIZE * 0.42 },
                          value === 'X' ? styles.xText : styles.oText,
                          {
                            opacity: cellAnims[cellIndex],
                            transform: [{ scale: cellAnims[cellIndex] }],
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
          ))}
        </View>

        {/* Back and Restart Buttons (when game is active) */}
        {!gameFinished && (
          <View style={styles.activeGameActions}>
            <Pressable
              onPress={handleRestart}
              style={({ pressed }) => [
                styles.restartButton,
                pressed && styles.pressedShrink,
              ]}
            >
              <Text style={styles.restartButtonText}>Restart Match</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                resetGameState();
                setScreen('start');
              }}
              style={({ pressed }) => [
                styles.backButtonInline,
                pressed && styles.pressedShrink,
              ]}
            >
              <Text style={styles.backButtonInlineText}>Quit</Text>
            </Pressable>
          </View>
        )}

        {/* Beautiful Glassmorphic Result Card Overlay */}
        {gameFinished && matchResult && (
          <View style={StyleSheet.absoluteFill}>
            {/* Dark blur backdrop */}
            <View style={styles.backdrop} />
            
            <View style={styles.resultOverlayContainer}>
              <Animated.View
                style={[
                  styles.resultCard,
                  {
                    opacity: resultAnim,
                    transform: [{ scale: resultAnim }],
                  },
                ]}
              >
                {/* Result Title */}
                <Text
                  style={[
                    styles.resultCardTitle,
                    winner === 'X'
                      ? styles.resultCardTitleWin
                      : winner === 'O'
                      ? styles.resultCardTitleLoss
                      : styles.resultCardTitleDraw,
                  ]}
                >
                  {isTimeout
                    ? winner === 'X'
                      ? 'VICTORY (AI TIMEOUT)!'
                      : 'DEFEAT (TIMEOUT)'
                    : winner === 'X'
                    ? gameMode === 'vsAI'
                      ? 'VICTORY!'
                      : 'PLAYER X WINS!'
                    : winner === 'O'
                    ? gameMode === 'vsAI'
                      ? 'DEFEAT'
                      : 'PLAYER O WINS!'
                    : 'DRAW'}
                </Text>

                {/* Single Player Progression Results */}
                {gameMode === 'vsAI' && (
                  <View style={styles.resultProgression}>
                    <View style={styles.xpGainedRow}>
                      <Text style={styles.xpGainedText}>+{matchResult.xpEarned} XP</Text>
                    </View>

                    {matchResult.streakText ? (
                      <Text style={styles.resultStreakText}>{matchResult.streakText}</Text>
                    ) : null}

                    {matchResult.levelInfo && (
                      <View style={styles.resultLevelInfo}>
                        <Text style={styles.resultLevelLabel}>
                          LEVEL {matchResult.levelInfo.level} — {getLevelTitle(matchResult.levelInfo.level)}
                        </Text>
                        
                        {/* XP Progress Bar */}
                        <View style={styles.resultProgressBarBg}>
                          <View
                            style={[
                              styles.resultProgressBarFill,
                              {
                                width: `${Math.min(
                                  (matchResult.levelInfo.xpInCurrentLevel /
                                    matchResult.levelInfo.totalXpInCurrentLevelRange) *
                                    100,
                                  100
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.resultXpText}>
                          {matchResult.oldXp} → {matchResult.newXp} XP ({matchResult.levelInfo.xpNeededForNextLevel} XP to Level {matchResult.levelInfo.level + 1})
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Local 2 Player Results */}
                {gameMode === 'local2Player' && (
                  <View style={styles.localResultBox}>
                    <Text style={styles.localResultText}>
                      {winner ? `Player ${winner} dominated the match!` : 'Match ended in a solid Draw!'}
                    </Text>
                  </View>
                )}

                {/* Action buttons on Result Screen */}
                <View style={styles.resultActions}>
                  <Pressable onPress={handleRestart}>
                    {({ pressed }) => (
                      <LinearGradient
                        colors={['#F97316', '#EA580C']}
                        style={[styles.primaryButtonInline, pressed && styles.pressedShrink]}
                      >
                        <Text style={styles.buttonText}>PLAY AGAIN</Text>
                      </LinearGradient>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      resetGameState();
                      setScreen('start');
                    }}
                    style={({ pressed }) => [styles.homeButton, pressed && styles.pressedShrink]}
                  >
                    <Text style={styles.homeButtonText}>HOME</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </View>
          </View>
        )}
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
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#DCD8FF',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 14,
    color: '#B0B4BA',
    marginBottom: 20,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '88%',
    maxWidth: 340,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  turnText: {
    fontSize: 18,
    color: '#DCD8FF',
  },
  turnSymbol: {
    fontWeight: '800',
    color: '#FB923C',
  },
  timerBadge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  timerBadgeWarning: {
    color: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  board: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  boardRow: {
    flexDirection: 'row',
    width: '100%',
    height: '33.33%',
  },
  cellContainer: {
    flex: 1,
    height: '100%',
  },
  cell: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellHighlight: {
    backgroundColor: 'rgba(74, 222, 128, 0.22)',
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
  
  // Menu styles
  menuContainer: {
    width: '88%',
    maxWidth: 340,
    marginTop: 20,
    gap: 14,
  },
  menuButton: {
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryMenuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressedShrink: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },

  // Setup styles
  setupSection: {
    width: '88%',
    maxWidth: 340,
    marginBottom: 28,
  },
  setupSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DCD8FF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  difficultyButtonActiveEasy: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: '#4ADE80',
  },
  difficultyButtonActiveMedium: {
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    borderColor: '#FB923C',
  },
  difficultyButtonActiveImpossible: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  difficultyButtonText: {
    color: '#B0B4BA',
    fontSize: 12,
    fontWeight: '700',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  styleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  styleButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  styleButtonActive: {
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    borderColor: '#FB923C',
  },
  styleButtonText: {
    color: '#B0B4BA',
    fontSize: 14,
    fontWeight: '700',
  },
  styleButtonTextActive: {
    color: '#FFFFFF',
  },
  setupActions: {
    width: '88%',
    maxWidth: 340,
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#DCD8FF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Level & progression styles
  levelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    paddingVertical: 18,
    paddingHorizontal: 22,
    width: '88%',
    maxWidth: 340,
    marginBottom: 24,
  },
  homeLevelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  levelTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    width: '100%',
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpText: {
    fontSize: 13,
    color: '#DCD8FF',
  },

  // Statistics Box
  statsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    paddingVertical: 18,
    paddingHorizontal: 22,
    width: '88%',
    maxWidth: 340,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#DCD8FF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    marginVertical: 10,
  },
  resetButton: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },

  // Active game styles
  activeGameActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '88%',
    maxWidth: 340,
    marginTop: 26,
    gap: 16,
  },
  restartButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButtonInline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonInlineText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },

  // Result overlay styles
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
  },
  resultOverlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  resultCard: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: 'rgba(30, 27, 75, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 15,
  },
  resultCardTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  resultCardTitleWin: {
    color: '#4ADE80',
  },
  resultCardTitleLoss: {
    color: '#EF4444',
  },
  resultCardTitleDraw: {
    color: '#38BDF8',
  },
  resultProgression: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 22,
    gap: 12,
  },
  xpGainedRow: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  xpGainedText: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: '800',
  },
  resultStreakText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FB923C',
  },
  resultLevelInfo: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  resultLevelLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultProgressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    width: '100%',
    marginBottom: 8,
    overflow: 'hidden',
  },
  resultProgressBarFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 3,
  },
  resultXpText: {
    fontSize: 11,
    color: '#B0B4BA',
    textAlign: 'center',
  },
  localResultBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 22,
    width: '100%',
  },
  localResultText: {
    color: '#DCD8FF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  primaryButtonInline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  homeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});