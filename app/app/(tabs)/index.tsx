import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Welcome to Taash</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your personal task management app
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText style={styles.description}>
          Get started by exploring the app and creating your first task.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
