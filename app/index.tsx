// app/index.tsx — portfolio (projects route to detail pages + API quick icons)
// - Keeps Ionicons AND adds FontAwesome6 for the X(Twitter) icon
// - Uses DATA.heroAbout (hero) and DATA.aboutLong (About Me)
// - Projects open detail routes
// - Quick-nav icons to /cats and /anime
// - Social links use your real profiles

import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ✅ Local avatar (keep yours)
const AVATAR = require("../assets/images/7a4274bbf0ab3d883cef45597c93cf24.jpg");

const NAV_HEIGHT = 56;

const COLORS = {
  black: "#0b0b0b",
  card: "#111111",
  border: "#2A2A2A",
  red: "#FF3B30",
  white: "#FFFFFF",
  gray: "#C9C9C9",
};

const DATA = {
  name: "Earl", // used in "Hi, It’s Earl"
  fullName: "Earl D. Ang", // not shown in hero; optional for your own use

  // Short hero blurb (under “I’m a …”)
  heroAbout:
    "I’m a 4th-year BSIT student at the University of the Immaculate Conception. I’m focused on getting better at coding and finishing small projects while learning new tools.",

  // Longer About section blurb
  aboutLong:
    "My name is Earl D. Ang and I’m a 4th-year BSIT student at the University of the Immaculate Conception. Outside class, I play Valorant, CS2, and League of Legends, listen to a lot of music, and follow motorsport—F1, WEC, MotoGP, and more.",

  // Rotating word after “I’m a …”
  roles: ["Programmer", "Gamer", "Weeb"],

  email: "eang_20190020500@sg.uic.edu.ph",
  phone: "+63 999 842 4332",

  links: {
    github: "https://github.com/Yukiiii2",
    linkedin: "https://linkedin.com/in/yourhandle", // update if you have one
    twitter: "https://x.com/YukiiWEEB",
    instagram: "https://www.instagram.com/_xerlzzz",
  },

  // Skills (progress bars)
  skills: [
    { label: "Flutter", value: 0.8 },
    { label: "React Native", value: 0.75 },
    { label: "SQL/Postgres", value: 0.9 },
    { label: "API Integration", value: 0.9 },
  ],

  tags: ["Flutter", "React Native", "Dart", "Python", "SQL", "Supabase", "Vue", "HTML"],

  // Projects in your requested order (top→bottom)
  projects: [
    {
      title: "Voclaria",
      blurb:
        "AI-powered tool for Senior High School students that gives real-time feedback on pronunciation, fluency, pacing, and grammar, with peer/expert review to build confidence and improve English literacy.",
      tags: ["AI", "Mobile", "Education"],
      href: "/projects/voclaria",
    },
    {
      title: "Marian TBI Connect",
      blurb:
        "Alumni engagement system with Dashboard, Contacts, Events, and Requests—integrates profiling and project-management systems via APIs.",
      tags: ["Web", "Alumni", "APIs"],
      href: "/projects/marian-tbi-connect",
    },
    {
      title: "EduNest",
      blurb:
        "Desktop learning platform (brain-based learning) with interactive lessons, multimedia, and quizzes to track progress across subjects.",
      tags: ["Desktop", "Education", "Interactive"],
      href: "/projects/edunest",
    },
    {
      title: "CLUMS — Computer Laboratory User Management System",
      blurb:
        "Web app for school labs: attendance/login tracking, per-unit issue logging, and streamlined records for staff and students.",
      tags: ["Web", "Education", "Management"],
      href: "/projects/clums",
    },
  ],

  // Services (old list)
  services: [
    "Mobile app development (iOS/Android) with React Native & Flutter",
    "Web app development with modern stacks",
    "API integration and backend wiring",
    "Postgres/SQL database modeling and optimization",
  ],

  // Education (OLD STYLE — simple list, no timeline)
  education: [
    "BS in Information Technology — University of the Immaculate Conception, Davao City (ongoing)",
  ],

  labels: {
    home: "Home",
    services: "Services",
    skills: "Skills",
    education: "Education",
    contact: "Contact",
    aboutMe: "About Me",
    projects: "Projects",
    emailMe: "Email Me",
    connectLinkedIn: "Connect on LinkedIn",
    viewMore: "View More",
  },
};

type SectionKey = "home" | "services" | "skills" | "education" | "contact";

/** Items shown in the hamburger menu. */
type NavItem =
  | { label: string; type: "section"; key: SectionKey }
  | { label: string; type: "route"; href: "/cats" | "/anime" };

const MENU_ITEMS: NavItem[] = [
  { type: "section", key: "home", label: DATA.labels.home },
  { type: "section", key: "services", label: DATA.labels.services },
  { type: "section", key: "skills", label: DATA.labels.skills },
  { type: "section", key: "education", label: DATA.labels.education },
  { type: "section", key: "contact", label: DATA.labels.contact },
  // extra routes
  { type: "route", href: "/cats", label: "Cat Facts" },
  { type: "route", href: "/anime", label: "Anime (Jikan)" },
];

/* ----------------------------- helpers ------------------------------ */

function PressableScale({
  onPress,
  accessibilityLabel,
  style,
  children,
}: {
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: any;
  children?: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.timing(scale, { toValue: 0.96, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.timing(scale, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

/** NAVBAR — brand left + quick-nav icons + hamburger right */
function NavBar({
  items,
  onSelect,
  activeSectionIdx,
}: {
  items: NavItem[];
  onSelect: (item: NavItem) => void;
  activeSectionIdx: number;
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const menuTop = insets.top + NAV_HEIGHT;
  const firstName = DATA.name.split(" ")[0] ?? DATA.name;

  const handlePress = (item: NavItem) => {
    setOpen(false);
    onSelect(item);
  };

  return (
    <>
      <View style={[styles.navbar, { height: NAV_HEIGHT + insets.top, paddingTop: insets.top }]}>
        <View style={styles.navbarInner}>
          <Text style={styles.brand}>{firstName}</Text>

          {/* Quick icons (right side, before menu) */}
          <View style={styles.quickIconRow}>
            <PressableScale accessibilityLabel="Open Cat Facts" onPress={() => router.push("/cats")} style={styles.quickIconBtn}>
              <Ionicons name="paw" size={16} color={COLORS.white} />
            </PressableScale>

            <PressableScale accessibilityLabel="Open Anime (Jikan)" onPress={() => router.push("/anime")} style={styles.quickIconBtn}>
              <Ionicons name="film" size={16} color={COLORS.white} />
            </PressableScale>

            <PressableScale accessibilityLabel="Open menu" onPress={() => setOpen(v => !v)} style={styles.menuBtn}>
              <Ionicons name="menu" size={20} color={COLORS.white} />
            </PressableScale>
          </View>
        </View>
      </View>

      {open && (
        <>
          <TouchableOpacity activeOpacity={1} onPress={() => setOpen(false)} style={[styles.menuOverlay, { top: menuTop }]} />
          <View style={[styles.menu, { top: menuTop }]}>
            {items.map((item, i) => {
              const isActiveSection =
                item.type === "section" &&
                ["home", "services", "skills", "education", "contact"].indexOf(item.key) === activeSectionIdx;
              return (
                <TouchableOpacity key={`${item.type}-${item.label}`} onPress={() => handlePress(item)} style={styles.menuItem}>
                  <Text style={[styles.menuText, isActiveSection && { color: COLORS.red }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </>
  );
}

function Section({ title, children, onLayout }: { title: string; children?: React.ReactNode; onLayout?: (y: number) => void }) {
  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Tag({ label }: { label: string }) {
  return <View style={styles.tag}><Text style={styles.tagText}>{label}</Text></View>;
}

/* ---------- ProgressBar ---------- */
function ProgressBar({ value }: { value: number }) {
  const [trackW, setTrackW] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (trackW > 0) {
      Animated.timing(anim, {
        toValue: trackW * Math.max(0, Math.min(1, value)),
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [trackW, value]);
  return (
    <View style={styles.progressTrack} onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.progressFill, { width: anim }]} />
    </View>
  );
}

/* ---------- Project Card ---------- */
function ProjectCard({
  title,
  blurb,
  tags,
  href,
}: {
  title: string;
  blurb: string;
  tags: string[];
  href: string;
}) {
  return (
    <View style={styles.projectCard}>
      <Text style={styles.projectTitle}>{title}</Text>
      <Text style={styles.projectBlurb}>{blurb}</Text>
      <View style={styles.projectTags}>{tags.map((t) => <Tag key={t} label={t} />)}</View>
      <PressableScale
        onPress={() => router.push(href as any)}
        accessibilityLabel={`${DATA.labels.viewMore} ${title}`}
        style={[styles.btnOutline, styles.btnSm]}
      >
        <Text style={styles.btnOutlineTextSm}>{DATA.labels.viewMore}</Text>
      </PressableScale>
    </View>
  );
}

/* ---------------------- Typewriter (role only) ---------------------- */
function TypewriterRole({
  words, typeSpeed = 80, deleteSpeed = 40, holdMs = 900, loop = true, style, cursorColor = COLORS.gray,
}: { words: string[]; typeSpeed?: number; deleteSpeed?: number; holdMs?: number; loop?: boolean; style?: any; cursorColor?: string }) {
  const [w, setW] = useState(0);
  const [i, setI] = useState(0);
  const [del, setDel] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => { const id = setInterval(() => setBlink(b => !b), 500); return () => clearInterval(id); }, []);
  useEffect(() => {
    const word = words[w] ?? ""; const delay = del ? deleteSpeed : typeSpeed;
    const id = setTimeout(() => {
      if (!del) { if (i < word.length) setI(i + 1); else setTimeout(() => setDel(true), holdMs); }
      else { if (i > 0) setI(i - 1); else { setDel(false); const next = (w + 1) % words.length; if (!loop && next === 0) return; setW(next); } }
    }, delay);
    return () => clearTimeout(id);
  }, [i, del, w, words, typeSpeed, deleteSpeed, holdMs, loop]);

  const shown = (words[w] ?? "").slice(0, i);
  return (
    <Text style={[{ color: COLORS.gray, fontWeight: "800" }, Platform.OS === "android" ? { paddingTop: 1 } : null, style]}>
      {shown}<Text style={{ color: cursorColor, opacity: blink ? 1 : 0 }}>|</Text>
    </Text>
  );
}

/* ----------------------------- Screen ------------------------------- */

export default function PortfolioScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<SectionKey | "about" | "projects", number>>({
    home: 0, services: 0, skills: 0, education: 0, contact: 0, about: 0, projects: 0,
  });
  const [activeIdx, setActiveIdx] = useState(0);

  // Gentle, bounded avatar pulse (won’t overlap brand)
  const glow = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1.03, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1.0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const sections: { key: SectionKey; y: number }[] = [
      { key: "home", y: offsets.current.home },
      { key: "services", y: offsets.current.services },
      { key: "skills", y: offsets.current.skills },
      { key: "education", y: offsets.current.education },
      { key: "contact", y: offsets.current.contact },
    ];
    sections.sort((a, b) => a.y - b.y);
    const idx = sections.reduce((acc, cur, i) => (y + 120 >= cur.y ? i : acc), 0);
    setActiveIdx(idx);
  };

  const insets = useSafeAreaInsets();
  const HEADER_COVER = NAV_HEIGHT + insets.top + 6;
  const scrollToKey = (key: SectionKey | "about" | "projects") =>
    scrollRef.current?.scrollTo({ y: Math.max(0, offsets.current[key] - HEADER_COVER), animated: true });

  const heroName = useMemo(() => (
    <>
      <Text style={styles.heroText}>Hi, It’s </Text>
      <Text style={[styles.heroText, { color: COLORS.red }]}>{DATA.name}</Text>
    </>
  ), []);

  /** Handle menu item selection */
  const handleMenuSelect = (item: NavItem) => {
    if (item.type === "section") {
      scrollToKey(item.key);
    } else {
      router.push(item.href);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <NavBar items={MENU_ITEMS} onSelect={handleMenuSelect} activeSectionIdx={activeIdx} />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: NAV_HEIGHT + 16, paddingBottom: 80 }}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        {/* Home / Hero */}
        <View onLayout={(e) => (offsets.current.home = e.nativeEvent.layout.y)} style={styles.hero}>
          <View style={styles.heroLeft}>
            <Animated.View style={[styles.glowPulse, { transform: [{ scale: glow }] }]}>
              <LinearGradient
                colors={["rgba(255,59,48,0.45)", "rgba(255,59,48,0.12)", "rgba(255,59,48,0.04)"]}
                start={{ x: 0.2, y: 0.2 }}
                end={{ x: 0.8, y: 0.8 }}
                style={styles.moonGlow}
              >
                <View style={styles.avatarWrap}>
                  <Image source={AVATAR} style={styles.avatar} />
                </View>
              </LinearGradient>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: glow }] }]} />
            </Animated.View>
          </View>

          <View style={styles.heroRight}>
            <Text style={styles.heroRow}>{heroName}</Text>

            <Text style={styles.subtitle}>
              I’m a{" "}
              <TypewriterRole
                words={DATA.roles}
                typeSpeed={80}
                deleteSpeed={40}
                holdMs={900}
                style={styles.subtitle}
                cursorColor={COLORS.gray}
              />
            </Text>

            {/* HERO short blurb */}
            <Text style={styles.about}>{DATA.heroAbout}</Text>

            {/* Social icons (GitHub, LinkedIn, X(Twitter), Instagram) */}
            <View style={styles.socialRow}>
              <TouchableOpacity onPress={() => Linking.openURL(DATA.links.linkedin)} style={styles.socialBtn} activeOpacity={0.9}>
                <Ionicons name="logo-linkedin" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(DATA.links.github)} style={styles.socialBtn} activeOpacity={0.9}>
                <Ionicons name="logo-github" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(DATA.links.twitter)} style={styles.socialBtn} activeOpacity={0.9}>
                <FontAwesome6 name="x-twitter" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(DATA.links.instagram)} style={styles.socialBtn} activeOpacity={0.9}>
                <Ionicons name="logo-instagram" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About Me */}
        <Section title={DATA.labels.aboutMe} onLayout={(y) => (offsets.current.about = y)}>
          <Text style={styles.sectionBody}>{DATA.aboutLong}</Text>
          <View style={styles.tagsWrap}>{DATA.tags.map((t) => <Tag key={t} label={t} />)}</View>
        </Section>

        {/* Projects */}
        <Section title={DATA.labels.projects} onLayout={(y) => (offsets.current.projects = y)}>
          <View style={styles.projectsGrid}>
            {DATA.projects.map((p) => (
              <ProjectCard key={p.title} title={p.title} blurb={p.blurb} tags={p.tags} href={p.href} />
            ))}
          </View>
        </Section>

        {/* API Demos */}
        <Section title="API Demos">
          <View style={{ gap: 10 }}>
            <Link href="/cats" asChild>
              <TouchableOpacity style={[styles.btn, { alignSelf: "flex-start" }]} activeOpacity={0.9}>
                <Text style={styles.btnText}>Cat Facts</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/anime" asChild>
              <TouchableOpacity style={[styles.btnOutline, { alignSelf: "flex-start" }]} activeOpacity={0.9}>
                <Text style={styles.btnOutlineText}>Anime (Jikan)</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Section>

        {/* Services — old list */}
        <Section title={DATA.labels.services} onLayout={(y) => (offsets.current.services = y)}>
          <View style={styles.listCard}>
            {DATA.services.map((s, i) => (
              <View key={i} style={styles.listItem}>
                <Ionicons name="flash" size={16} color={COLORS.red} />
                <Text style={styles.listText}>{s}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Skills — progress bars */}
        <Section title={DATA.labels.skills} onLayout={(y) => (offsets.current.skills = y)}>
          <View style={styles.skillsList}>
            {DATA.skills.map((s) => (
              <View key={s.label} style={styles.skillRow}>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillLabel}>{s.label}</Text>
                  <Text style={styles.skillPct}>{Math.round(s.value * 100)}%</Text>
                </View>
                <ProgressBar value={s.value} />
              </View>
            ))}
          </View>
        </Section>

        {/* Education — old style */}
        <Section title={DATA.labels.education} onLayout={(y) => (offsets.current.education = y)}>
          <View style={styles.listCard}>
            {DATA.education.map((e, i) => (
              <View key={i} style={styles.listItem}>
                <Ionicons name="school" size={16} color={COLORS.red} />
                <Text style={styles.listText}>{e}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Contact — Email/LinkedIn under phone, equal width */}
        <Section title={DATA.labels.contact} onLayout={(y) => (offsets.current.contact = y)}>
          <View style={styles.contactRow}><Ionicons name="mail" size={18} color={COLORS.gray} /><Text style={styles.contactText}>{DATA.email}</Text></View>
          <View style={styles.contactRow}><Ionicons name="call" size={18} color={COLORS.gray} /><Text style={styles.contactText}>{DATA.phone}</Text></View>

          <View style={styles.ctaRow}>
            <PressableScale onPress={() => Linking.openURL(`mailto:${DATA.email}`)} style={[styles.btn, styles.ctaBtn]}>
              <Text style={styles.btnText}>{DATA.labels.emailMe}</Text>
            </PressableScale>
            <PressableScale onPress={() => Linking.openURL(DATA.links.linkedin)} style={[styles.btnOutline, styles.ctaBtn]}>
              <Text style={styles.btnOutlineText}>{DATA.labels.connectLinkedIn}</Text>
            </PressableScale>
          </View>
        </Section>

        {/* Footer */}
        <View style={styles.footerWrap}>
          <View style={styles.footerIcons}>
            <TouchableOpacity onPress={() => Linking.openURL(DATA.links.linkedin)} style={styles.footerIconBtn} activeOpacity={0.9}>
              <Ionicons name="logo-linkedin" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(DATA.links.github)} style={styles.footerIconBtn} activeOpacity={0.9}>
              <Ionicons name="logo-github" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(DATA.links.twitter)} style={styles.footerIconBtn} activeOpacity={0.9}>
              <FontAwesome6 name="x-twitter" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(DATA.links.instagram)} style={styles.footerIconBtn} activeOpacity={0.9}>
              <Ionicons name="logo-instagram" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.footerCopy}>© {new Date().getFullYear()} All Rights Reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------ styles ------------------------------ */

const AVATAR_SIZE = 150;
const GLOW_SIZE = 188; // bounded so it never reaches the brand line

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.black },
  scroll: { flex: 1 },

  navbar: {
    position: "absolute", top: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    zIndex: 1000, elevation: 20, justifyContent: "center",
  },
  navbarInner: {
    height: NAV_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  brand: { color: COLORS.red, fontWeight: "900", fontSize: 18, letterSpacing: 0.3 },

  // Right side cluster: quick icons + hamburger
  quickIconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  quickIconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: "rgba(255,59,48,0.08)",
  },

  menuBtn: {
    marginLeft: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: "rgba(255,59,48,0.08)",
  },

  menuOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 1001, elevation: 21 },
  menu: {
    position: "absolute", right: 10, width: 200, backgroundColor: "#0d0d0d", borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingVertical: 6, zIndex: 1002, elevation: 22, shadowColor: COLORS.red, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 12 },
  menuText: { color: COLORS.white, fontSize: 14, fontWeight: "700" },

  hero: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 16, flexWrap: "wrap" },
  heroLeft: { width: GLOW_SIZE + 12, alignItems: "center", marginTop: 6 },
  glowPulse: { alignItems: "center", justifyContent: "center", width: GLOW_SIZE, height: GLOW_SIZE },
  moonGlow: {
    width: GLOW_SIZE, height: GLOW_SIZE, borderRadius: GLOW_SIZE / 2, alignItems: "center", justifyContent: "center",
    shadowColor: COLORS.red, shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 0 },
  },
  pulseRing: { position: "absolute", width: GLOW_SIZE + 10, height: GLOW_SIZE + 10, borderRadius: (GLOW_SIZE + 10) / 2, borderWidth: 1, borderColor: "rgba(255,59,48,0.35)" },
  avatarWrap: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  avatar: { width: "100%", height: "100%" },

  heroRight: { flex: 1, minWidth: 240, gap: 10 },
  heroRow: { flexDirection: "row", flexWrap: "wrap" } as any,
  heroText: { color: COLORS.white, fontSize: 36, fontWeight: "900", letterSpacing: 0.4 },

  subtitle: { marginTop: 2, color: COLORS.white, fontSize: 16, fontWeight: "800" },
  about: { marginTop: 8, color: COLORS.gray, fontSize: 13, lineHeight: 20 },

  socialRow: { marginTop: 12, flexDirection: "row", gap: 10 },
  socialBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.red,
    alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,59,48,0.08)",
  },

  // Buttons (used in Contact section)
  ctaRow: { flexDirection: "row", gap: 12, marginTop: 12, flexWrap: "wrap" },
  ctaBtn: { flex: 1, alignItems: "center", justifyContent: "center" },

  btn: { backgroundColor: COLORS.red, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, shadowColor: COLORS.red, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  btnText: { color: COLORS.white, fontWeight: "800", letterSpacing: 0.5 },
  btnOutline: { borderWidth: 1, borderColor: COLORS.red, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "transparent" },
  btnOutlineText: { color: COLORS.red, fontWeight: "700", letterSpacing: 0.3 },
  // small pill for "View More"
  btnSm: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, alignSelf: "flex-start" },
  btnOutlineTextSm: { color: COLORS.red, fontWeight: "800", fontSize: 12, letterSpacing: 0.2 },

  section: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginHorizontal: 16, marginVertical: 10,
    borderRadius: 14, padding: 16, shadowColor: COLORS.red, shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
  },
  sectionTitle: { color: COLORS.white, fontSize: 28, fontWeight: "900", marginBottom: 12 },
  sectionBody: { color: COLORS.gray, fontSize: 14, lineHeight: 20 },

  tagsWrap: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: COLORS.red, backgroundColor: "rgba(255,59,48,0.05)" },
  tagText: { color: COLORS.white, fontSize: 12, fontWeight: "700" },

  /* Projects */
  projectsGrid: { gap: 12 },
  projectCard: { backgroundColor: "#0d0d0d", borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, gap: 8 },
  projectTitle: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
  projectBlurb: { color: COLORS.gray, fontSize: 13, lineHeight: 18 },
  projectTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },

  /* Shared list styles (Services & Education old) */
  listCard: { gap: 10 },
  listItem: { flexDirection: "row", gap: 10, alignItems: "center" },
  listText: { color: COLORS.gray, fontSize: 14, flex: 1 },

  /* Skills — progress bars */
  skillsList: { gap: 12 },
  skillRow: { gap: 8 },
  skillHeader: { flexDirection: "row", justifyContent: "space-between" },
  skillLabel: { color: COLORS.white, fontWeight: "700" },
  skillPct: { color: COLORS.gray, fontWeight: "600" },
  progressTrack: { height: 10, borderRadius: 999, backgroundColor: "#1b1b1b", borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: COLORS.red, borderRadius: 999 },

  /* Contact */
  contactRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 8 },
  contactText: { color: COLORS.gray, fontSize: 14 },

  /* Footer */
  footerWrap: { marginTop: 16, backgroundColor: "#E84141", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  footerIcons: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 8 },
  footerIconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#fff3", backgroundColor: "transparent" },
  footerCopy: { textAlign: "center", color: COLORS.white, fontWeight: "700" },
});
