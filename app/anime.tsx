// app/anime.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  black: "#0b0b0b",
  card: "#111111",
  border: "#2A2A2A",
  red: "#FF3B30",
  white: "#FFFFFF",
  gray: "#C9C9C9",
};

type Anime = {
  mal_id: number;
  title: string;
  url: string;
  images?: { jpg?: { image_url?: string } };
  score?: number;
};

type Saved = {
  id: number;
  title: string;
  image?: string;
  url?: string;
  score?: number | null;
};

const STORE_KEY = "anime_watchlist_v1";

export default function AnimeScreen() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Anime[]>([]);
  const [error, setError] = useState<string | null>(null);

  // watchlist
  const [faves, setFaves] = useState<Record<number, Saved>>({});
  const [showFaves, setShowFaves] = useState(false);

  // ---------- API ----------
  const loadTop = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const r = await fetch("https://api.jikan.moe/v4/top/anime?limit=12");
      const j = await r.json();
      setItems(j?.data ?? []);
    } catch {
      setError("Failed to load anime.");
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async () => {
    if (!query.trim()) return loadTop();
    try {
      setLoading(true);
      setError(null);
      const r = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`
      );
      const j = await r.json();
      setItems(j?.data ?? []);
    } catch {
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  }, [query, loadTop]);

  useEffect(() => {
    loadTop();
  }, [loadTop]);

  // ---------- Watchlist (local tracker) ----------
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (raw) setFaves(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const persist = async (next: Record<number, Saved>) => {
    setFaves(next);
    try {
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {}
  };

  const toggleFav = (a: Anime) => {
    const next = { ...faves };
    if (next[a.mal_id]) {
      delete next[a.mal_id];
    } else {
      next[a.mal_id] = {
        id: a.mal_id,
        title: a.title,
        image: a.images?.jpg?.image_url,
        url: a.url,
        score: a.score ?? null,
      };
    }
    persist(next);
  };

  const renderList: (Anime | Saved)[] = useMemo(() => {
    if (!showFaves) return items;
    // show saved entries, newest first
    return Object.values(faves).reverse();
  }, [showFaves, items, faves]);

  const isSaved = (id: number) => !!faves[id];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.black,
        paddingTop: insets.top, // keep header visible on Android
      }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Anime (Jikan)</Text>
          <TouchableOpacity
            onPress={() => setShowFaves((v) => !v)}
            style={styles.btnToggle}
            activeOpacity={0.9}
          >
            <Ionicons
              name={showFaves ? "heart" : "heart-outline"}
              size={16}
              color={showFaves ? COLORS.white : COLORS.red}
            />
            <Text
              style={[
                styles.btnToggleText,
                showFaves && { color: COLORS.white, opacity: 1 },
              ]}
            >
              {showFaves ? "My List" : "My List"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={COLORS.gray} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search anime…"
            placeholderTextColor="#888"
            onSubmitEditing={search}
            style={styles.input}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={search} style={styles.btn} activeOpacity={0.9}>
            <Text style={styles.btnText}>Go</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator color={COLORS.white} style={{ marginVertical: 12 }} />
        )}
        {error && <Text style={{ color: "#ff8f8f", marginBottom: 10 }}>{error}</Text>}

        <View style={styles.grid}>
          {renderList.map((a) => {
            // unify fields between Anime and Saved
            const id = "mal_id" in a ? a.mal_id : a.id;
            const title = a.title;
            const url = "url" in a ? a.url : (a as Saved).url;
            const img =
              "images" in a
                ? a.images?.jpg?.image_url
                : (a as Saved).image;
            const score =
              "score" in a ? (a as any).score : (a as Saved).score;

            return (
              <View key={id} style={styles.card}>
                <TouchableOpacity
                  onPress={() => url && Linking.openURL(url)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{
                      uri: img ?? "https://placehold.co/120x160/111/fff?text=Anime",
                    }}
                    style={styles.cover}
                  />
                </TouchableOpacity>

                {/* favorite button */}
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() =>
                    "mal_id" in a
                      ? toggleFav(a as Anime)
                      : persist(
                          ((copy) => {
                            delete copy[id];
                            return copy;
                          })({ ...faves })
                        )
                  }
                  hitSlop={10}
                >
                  <Ionicons
                    name={isSaved(id) ? "heart" : "heart-outline"}
                    size={18}
                    color={COLORS.red}
                  />
                </TouchableOpacity>

                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
                <View style={styles.scoreRow}>
                  <Ionicons name="star" size={14} color={COLORS.red} />
                  <Text style={styles.scoreText}>{score ?? "–"}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 16 }} />
        <Link href="/" asChild>
          <TouchableOpacity style={styles.btnOutline} activeOpacity={0.9}>
            <Text style={styles.btnOutlineText}>Back to Portfolio</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  header: { color: COLORS.white, fontSize: 28, fontWeight: "900" },

  btnToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.6,
    borderColor: COLORS.red,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnToggleText: { color: COLORS.red, fontWeight: "800", opacity: 0.95 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1.6,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: { flex: 1, color: COLORS.white, paddingVertical: 6 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  card: {
    width: "47%",
    backgroundColor: COLORS.card,
    borderWidth: 1.6,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    position: "relative",
  },
  heartBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: "#000",
  },
  cover: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#1b1b1b",
  },
  title: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 18,
    minHeight: 36,
  },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  scoreText: { color: COLORS.gray },

  btn: { backgroundColor: COLORS.red, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  btnText: { color: COLORS.white, fontWeight: "800" },
  btnOutline: {
    alignSelf: "flex-start",
    borderWidth: 1.6,
    borderColor: COLORS.red,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnOutlineText: { color: COLORS.red, fontWeight: "800" },
});
