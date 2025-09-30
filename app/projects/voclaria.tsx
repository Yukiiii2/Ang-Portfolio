import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";

export default function VoclariaScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>Voclaria</Text>
        <Text style={styles.p}>
          AI-powered tool for Senior High School students that gives real-time feedback on pronunciation, fluency,
          pacing, and grammar, with peer/expert review to improve English literacy.
        </Text>
        {/* You can add screenshots, features list, tech stack, links, etc. */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { color: "#fff", fontSize: 28, fontWeight: "900", marginBottom: 10 },
  p: { color: "#C9C9C9", fontSize: 14, lineHeight: 20 },
});
