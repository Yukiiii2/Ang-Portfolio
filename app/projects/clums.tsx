import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";

export default function CLUMSScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>CLUMS — Computer Laboratory User Management System</Text>
        <Text style={styles.p}>
          Web app for school labs: attendance/login tracking, per-unit issue logging, and streamlined records for staff and students.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { color: "#fff", fontSize: 28, fontWeight: "900", marginBottom: 10 },
  p: { color: "#C9C9C9", fontSize: 14, lineHeight: 20 },
});
