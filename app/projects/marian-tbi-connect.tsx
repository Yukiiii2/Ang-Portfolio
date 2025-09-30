import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";

export default function MarianTBIScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>Marian TBI Connect</Text>
        <Text style={styles.p}>
          Alumni engagement system featuring Dashboard, Contacts, Events, and Requests modules—integrates
          profiling and project-management systems via APIs.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { color: "#fff", fontSize: 28, fontWeight: "900", marginBottom: 10 },
  p: { color: "#C9C9C9", fontSize: 14, lineHeight: 20 },
});
