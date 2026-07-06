import React from 'react';
import { StyleSheet, Text, View, Pressable, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <Text style={styles.subtitle}>Play against a friend on the same device</Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => console.log('Start Game pressed')}
        >
          <Text style={styles.buttonText}>Start Game</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#C7C4F0',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonPressed: {
    backgroundColor: '#EA580C',
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});