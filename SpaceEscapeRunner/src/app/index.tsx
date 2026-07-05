/* eslint-disable react-hooks/set-state-in-effect, react-hooks/refs, react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions,
} from "react-native";

const SHIP_WIDTH = 50;
const SHIP_HEIGHT = 60;

const ASTEROID_SIZE = 40;
const ASTEROID_SPEED = 6;

function ShipShape() {
  return (
    <View style={ship.wrapper}>
      <View style={ship.nose} />

      <View style={ship.body}>
        <View style={ship.window} />
      </View>

      <View style={ship.leftWing} />
      <View style={ship.rightWing} />

      <View style={ship.engine} />
      <View style={ship.flame} />
    </View>
  );
}

function AsteroidShape() {
  return (
    <View style={asteroidStyles.wrapper}>
      <View style={asteroidStyles.body}>
        <View style={[asteroidStyles.crater, { top: 5, left: 8, width: 8, height: 8 }]} />
        <View style={[asteroidStyles.crater, { top: 18, left: 5, width: 6, height: 6 }]} />
        <View style={[asteroidStyles.crater, { top: 12, left: 22, width: 10, height: 10 }]} />
        <View style={[asteroidStyles.crater, { top: 25, left: 18, width: 7, height: 7 }]} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [gameState, setGameState] = useState("idle");
  const [score, setScore] = useState(0);
  const [, setTick] = useState(0);

  const [shipX, setShipX] = useState(0);

  useEffect(() => {
    setShipX(SCREEN_WIDTH / 2 - SHIP_WIDTH / 2);
  }, [SCREEN_WIDTH]);

  const asteroidX = useRef(0);
  const asteroidY = useRef(-ASTEROID_SIZE);

  const gameLoop = useRef<any>(null);

  const moveLeft = () => {
    setShipX((prev) => Math.max(0, prev - 25));
  };

  const moveRight = () => {
    setShipX((prev) =>
      Math.min(SCREEN_WIDTH - SHIP_WIDTH, prev + 25)
    );
  };

  const spawnAsteroid = () => {
    asteroidX.current =
      Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE);
    asteroidY.current = -ASTEROID_SIZE;
  };

  const checkCollision = () => {
    const shipY = SCREEN_HEIGHT - 120 - SHIP_HEIGHT;

    return (
      asteroidX.current < shipX + SHIP_WIDTH &&
      asteroidX.current + ASTEROID_SIZE > shipX &&
      asteroidY.current < shipY + SHIP_HEIGHT &&
      asteroidY.current + ASTEROID_SIZE > shipY
    );
  };

  const runGame = () => {
    asteroidY.current += ASTEROID_SPEED;

    if (asteroidY.current > SCREEN_HEIGHT) {
      asteroidY.current = -ASTEROID_SIZE;
      asteroidX.current =
        Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE);
      setScore((prev) => prev + 1);
    }

    if (checkCollision()) {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
      setGameState("gameover");
    } else {
      setTick((t) => t + 1);
    }
  };

  const startGame = () => {
    setScore(0);
    setGameState("playing");
    spawnAsteroid();

    if (gameLoop.current) {
      clearInterval(gameLoop.current);
    }

    gameLoop.current = setInterval(runGame, 16);
  };

  useEffect(() => {
    return () => {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
    };
  }, []);

  // Keyboard controls for Web
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        moveLeft();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        moveRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, shipX, SCREEN_WIDTH]);

  // Stars Background
  const [stars, setStars] = useState<{ x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    const STARS_COUNT = 30;
    const newStars = Array.from({ length: STARS_COUNT }).map(() => ({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: Math.random() * 3 + 1,
    }));
    setStars(newStars);
  }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Stars Background */}
      {stars.map((star, idx) => (
        <View
          key={idx}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
            },
          ]}
        />
      ))}

      {gameState === "idle" && (
        <View style={styles.centerContainer}>
          <Text style={styles.title}>SPACE ESCAPE</Text>
          <Text style={styles.subtitle}>Navigate through the asteroid field</Text>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              {Platform.OS === "web"
                ? "Use Left/Right Arrow keys, A/D, or click the controls below to dodge asteroids."
                : "Tap the onscreen controls at the bottom to dodge incoming asteroids."}
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>START GAME</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === "playing" && (
        <View style={styles.gameContainer}>
          {/* Score Display */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>

          {/* Ship */}
          <View
            style={[
              styles.shipContainer,
              {
                left: shipX,
                top: SCREEN_HEIGHT - 120 - SHIP_HEIGHT,
              },
            ]}
          >
            <ShipShape />
          </View>

          {/* Asteroid */}
          <View
            style={[
              styles.asteroidContainer,
              {
                left: asteroidX.current,
                top: asteroidY.current,
              },
            ]}
          >
            <AsteroidShape />
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={moveLeft}>
              <Text style={styles.controlButtonText}>◀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={moveRight}>
              <Text style={styles.controlButtonText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {gameState === "gameover" && (
        <View style={styles.centerContainer}>
          <Text style={[styles.title, { color: "#EF4444" }]}>GAME OVER</Text>
          <Text style={styles.finalScoreText}>Final Score: {score}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: "#3B82F6" }]} onPress={startGame}>
            <Text style={styles.buttonText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const ship = StyleSheet.create({
  wrapper: {
    width: SHIP_WIDTH,
    height: SHIP_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  nose: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FF5E5E",
    position: "absolute",
    top: 5,
  },
  body: {
    width: 22,
    height: 35,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 18,
    borderWidth: 1,
    borderColor: "#94A3B8",
  },
  window: {
    width: 10,
    height: 10,
    backgroundColor: "#38BDF8",
    borderRadius: 5,
    position: "absolute",
    top: 8,
  },
  leftWing: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderBottomColor: "#475569",
    position: "absolute",
    left: 2,
    bottom: 12,
  },
  rightWing: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 0,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderBottomColor: "#475569",
    borderRightColor: "transparent",
    position: "absolute",
    right: 2,
    bottom: 12,
  },
  engine: {
    width: 10,
    height: 5,
    backgroundColor: "#64748B",
    position: "absolute",
    bottom: 5,
  },
  flame: {
    width: 8,
    height: 12,
    backgroundColor: "#F97316",
    borderRadius: 4,
    position: "absolute",
    bottom: -6,
  },
});

const asteroidStyles = StyleSheet.create({
  wrapper: {
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
  },
  body: {
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
    backgroundColor: "#4B5563",
    borderRadius: ASTEROID_SIZE / 2,
    borderWidth: 2,
    borderColor: "#374151",
    position: "relative",
  },
  crater: {
    backgroundColor: "#1F2937",
    borderRadius: 9999,
    position: "absolute",
    opacity: 0.6,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#38BDF8",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 32,
  },
  instructionsContainer: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 40,
    maxWidth: 400,
  },
  instructionsText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  gameContainer: {
    flex: 1,
    position: "relative",
  },
  scoreContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
    zIndex: 10,
  },
  scoreLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  scoreValue: {
    color: "#38BDF8",
    fontSize: 24,
    fontWeight: "bold",
  },
  shipContainer: {
    position: "absolute",
  },
  asteroidContainer: {
    position: "absolute",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  controlButtonText: {
    color: "#38BDF8",
    fontSize: 24,
    fontWeight: "bold",
  },
  finalScoreText: {
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 40,
  },
});