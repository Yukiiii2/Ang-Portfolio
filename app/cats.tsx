// app/cats.tsx — Cat Facts (top spacing fixed + live "Recent Facts" updates)

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  black: "#0b0b0b",
  card: "#111111",
  border: "#2A2A2A",
  red: "#FF3B30",
  white: "#FFFFFF",
  gray: "#C9C9C9",
};

export default function CatsScreen() {
  const insets = useSafeAreaInsets();

  const [randomFact, setRandomFact] = useState<string>("");
  const [recentFacts, setRecentFacts] = useState<string[]>([
    // seed with a few so the UI doesn’t feel empty on first load
    "Unlike dogs, cats do not have a sweet tooth. Scientists believe this is due to a mutation in a key taste receptor.",
    "When a cat chases its prey, it keeps its head level. Dogs and humans bob their heads up and down.",
    "The technical term for a cat’s hairball is a “bezoar.”",
    "A group of cats is called a “clowder.”",
    "A cat can’t climb head first down a tree because every claw on a cat’s paw points the same way.",
  ]);
  const [loading, setLoading] = useState(false);

  async function getRandomFact() {
    try {
      setLoading(true);
      // CatFacts API (simple, no auth): https://catfact.ninja/fact
      const res = await fetch("https://catfact.ninja/fact");
      const json = await res.json();
      const fact: string = json?.fact ?? "";

      if (fact) {
        setRandomFact(fact);

        // Prepend to "Recent Facts", dedupe, cap to 12 items
        setRecentFacts((prev) => {
          const next = [fact, ...prev.filter((f) => f !== fact)];
          return next.slice(0, 12);
        });
      }
    } catch (e) {
      setRandomFact("Failed to fetch a cat fact. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load once
    getRandomFact();
  }, []);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      {/* Title / Back */}
      <View style={styles.header}>
        <Text style={styles.title}>Cat Facts</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        style={{ flex: 1 }}
      >
        {/* Random Fact card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Random Fact</Text>

          <View style={{ minHeight: 90, justifyContent: "center" }}>
            {loading ? (
              <ActivityIndicator color={COLORS.red} />
            ) : (
              <Text style={styles.factText}>{randomFact}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={getRandomFact}
            activeOpacity={0.9}
            style={styles.btn}
          >
            <Text style={styles.btnText}>New Random Fact</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Facts card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Facts</Text>
          <View style={{ gap: 14 }}>
            {recentFacts.map((f, i) => (
              <View key={`${i}-${f.slice(0, 12)}`} style={styles.row}>
                <Ionicons name="paw" size={18} color={COLORS.red} />
                <Text style={styles.rowText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.9}
          style={styles.btnOutline}
        >
          <Text style={styles.btnOutlineText}>Back to Portfolio</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 28,
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
  },
  cardTitle: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 20,
    marginBottom: 10,
  },
  factText: {
    color: COLORS.gray,
    fontSize: 16,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  rowText: {
    color: COLORS.gray,
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },

  // buttons
  btn: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: COLORS.red,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: COLORS.red,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  btnText: {
    color: COLORS.white,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  btnOutline: {
    marginTop: 18,
    marginHorizontal: 16,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnOutlineText: {
    color: COLORS.red,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
