import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";

export default function EduNestScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>EduNest</Text>
        <Text style={styles.p}>
          Desktop learning platform (brain-based learning) with interactive lessons, multimedia, and quizzes to track
          progress across subjects.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { color: "#fff", fontSize: 28, fontWeight: "900", marginBottom: 10 },
  p: { color: "#C9C9C9", fontSize: 14, lineHeight: 20 },
});
