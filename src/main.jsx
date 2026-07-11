import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import TinderCard from "react-tinder-card";
import { Calendar, Check, ChevronLeft, ChevronRight, CircleHelp, History, House, Image, Pencil, Plus, Trash2, X } from "lucide-react";
import { IconCards } from "@tabler/icons-react";
import "./styles.css";

const INITIAL_CARDS = [
  { id: "base-1", ja: "コンビニのアイスを食べ比べする", en: "Taste-test convenience store ice creams." },
  { id: "base-2", ja: "ラムネを買って乾杯する", en: "Buy ramune and make a toast." },
  { id: "base-3", ja: "夜にアイスを買いに行く", en: "Go buy ice cream at night." },
  { id: "base-4", ja: "花火を見に行く", en: "Go see fireworks." },
  { id: "base-5", ja: "夏っぽい曲を1曲ずつ流す", en: "Play one summer song each." },
  { id: "base-6", ja: "海か川の近くを散歩する", en: "Take a walk near the sea or a river." },
  { id: "base-7", ja: "かき氷を食べる", en: "Eat shaved ice." },
  { id: "base-8", ja: "夏の写真を撮り合う", en: "Take summer photos of each other." },
  { id: "base-9", ja: "浴衣で出かける", en: "Go out wearing yukata." },
  { id: "base-10", ja: "一番大きいポップコーンを買って映画を観る", en: "Buy the biggest popcorn and watch a movie." }
];

const JA_LINE_HINTS = {
  "base-1": ["コンビニの", "アイスを", "食べ比べする"],
  "base-2": ["ラムネを買って", "乾杯する"],
  "base-3": ["夜にアイスを", "買いに行く"],
  "base-4": ["花火を", "見に行く"],
  "base-5": ["夏っぽい曲を", "1曲ずつ流す"],
  "base-6": ["海か川の近くを", "散歩する"],
  "base-7": ["かき氷を", "食べる"],
  "base-8": ["夏の写真を", "撮り合う"],
  "base-9": ["浴衣で", "出かける"],
  "base-10": ["一番大きい", "ポップコーンを", "買って映画を観る"],
  "spring-10": ["公園で", "シャボン玉をする"],
  "autumn-5": ["秋の味覚を", "食べ比べる"],
  "autumn-6": ["温かい飲み物を", "買いに行く"],
  "autumn-7": ["落ち葉を踏んで", "散歩する"],
  "winter-2": ["イルミネーションを", "見に行く"],
  "winter-5": ["こたつで", "みかんを食べる"],
  "winter-8": ["手袋や", "マフラーを選ぶ"],
  "winter-9": ["クリスマスの", "映画を観る"]
};

const SPRING_CARDS = [
  { id: "spring-1", ja: "お花見をする", en: "Go see the cherry blossoms." },
  { id: "spring-2", ja: "桜の写真を撮り合う", en: "Take cherry blossom photos of each other." },
  { id: "spring-3", ja: "いちご狩りに行く", en: "Go strawberry picking." },
  { id: "spring-4", ja: "春服を買いに行く", en: "Go shopping for spring clothes." },
  { id: "spring-5", ja: "河川敷でお弁当を食べる", en: "Eat a bento by the riverside." },
  { id: "spring-6", ja: "菜の花畑を見に行く", en: "Go see a field of rape blossoms." },
  { id: "spring-7", ja: "桜餅を食べる", en: "Eat sakura mochi." },
  { id: "spring-8", ja: "朝の散歩をする", en: "Take a morning walk." },
  { id: "spring-9", ja: "春っぽい曲を1曲ずつ流す", en: "Play one spring song each." },
  { id: "spring-10", ja: "公園でシャボン玉をする", en: "Blow soap bubbles in the park." }
];

const AUTUMN_CARDS = [
  { id: "autumn-1", ja: "紅葉を見に行く", en: "Go see the autumn leaves." },
  { id: "autumn-2", ja: "焼き芋を食べる", en: "Eat a roasted sweet potato." },
  { id: "autumn-3", ja: "お月見をする", en: "Watch the harvest moon." },
  { id: "autumn-4", ja: "コスモス畑に行く", en: "Go to a cosmos flower field." },
  { id: "autumn-5", ja: "秋の味覚を食べ比べる", en: "Taste-test autumn foods." },
  { id: "autumn-6", ja: "温かい飲み物を買いに行く", en: "Go buy a warm drink." },
  { id: "autumn-7", ja: "落ち葉を踏んで散歩する", en: "Walk on the fallen leaves." },
  { id: "autumn-8", ja: "秋の夕焼けを眺める", en: "Watch the autumn sunset." },
  { id: "autumn-9", ja: "読書の秋を楽しむ", en: "Read a book together." },
  { id: "autumn-10", ja: "秋っぽい曲を1曲ずつ流す", en: "Play one autumn song each." }
];

const WINTER_CARDS = [
  { id: "winter-1", ja: "温泉に行ってみる", en: "Go to a hot spring." },
  { id: "winter-2", ja: "イルミネーションを見に行く", en: "Go see the winter illuminations." },
  { id: "winter-3", ja: "温かい鍋を食べる", en: "Eat a warm hot pot." },
  { id: "winter-4", ja: "初詣に行く", en: "Visit a shrine for the new year." },
  { id: "winter-5", ja: "こたつでみかんを食べる", en: "Eat mikan under the kotatsu." },
  { id: "winter-6", ja: "ホットチョコを飲む", en: "Drink hot chocolate." },
  { id: "winter-7", ja: "冬の星空を見る", en: "Look at the winter night sky." },
  { id: "winter-8", ja: "手袋やマフラーを選ぶ", en: "Pick out gloves and a scarf." },
  { id: "winter-9", ja: "クリスマスの映画を観る", en: "Watch a Christmas movie." },
  { id: "winter-10", ja: "冬っぽい曲を1曲ずつ流す", en: "Play one winter song each." }
];

const SEASON_ORDER = ["spring", "summer", "autumn", "winter"];

const SEASONS = {
  spring: {
    label: "春",
    emoji: "🌸",
    cards: SPRING_CARDS,
    // 画像が未配置でもグラデーションで自然に見えるよう2層背景にする
    fallback: "linear-gradient(180deg, #ffe3ec 0%, #fff0f5 48%, #ffdbe7 100%)",
    bg: {
      home: "url('/haru-home.png')",
      card: "url('/haru-card.png')",
      add: "url('/haru-add.png')",
      history: "url('/haru-history.png')",
      historyDetail: "url('/haru-history-detail.png')"
    }
  },
  summer: {
    label: "夏",
    emoji: "☀️",
    cards: INITIAL_CARDS,
    bg: {
      home: "url('/背景画像２.png')",
      card: "url('/カード選択背景.png')",
      add: "url('/背景画像４.png')",
      history: "url('/履歴背景.png')",
      historyDetail: "url('/履歴詳細.png')"
    }
  },
  autumn: {
    label: "秋",
    emoji: "🍁",
    cards: AUTUMN_CARDS,
    fallback: "linear-gradient(180deg, #ffe7c7 0%, #fff3e0 48%, #ffdfba 100%)",
    bg: {
      home: "url('/aki-home.png')",
      card: "url('/aki-card.png')",
      add: "url('/aki-add.png')",
      history: "url('/aki-history.png')",
      historyDetail: "url('/aki-history-detail.png')"
    }
  },
  winter: {
    label: "冬",
    emoji: "❄️",
    cards: WINTER_CARDS,
    fallback: "linear-gradient(180deg, #dfe8fb 0%, #eef3fd 48%, #d8e2f8 100%)",
    bg: {
      home: "url('/fuyu-home.png')",
      card: "url('/fuyu-card.png')",
      add: "url('/fuyu-add.png')",
      history: "url('/fuyu-history.png')",
      historyDetail: "url('/fuyu-history-detail.png')"
    }
  }
};

function defaultCardsBySeason() {
  return {
    spring: SEASONS.spring.cards,
    summer: SEASONS.summer.cards,
    autumn: SEASONS.autumn.cards,
    winter: SEASONS.winter.cards
  };
}

const STORAGE_KEY = "summer-card-app-v3";
const OLD_STORAGE_KEY = "summer-card-app-v1";
const V2_STORAGE_KEY = "summer-card-app-v2";
const PRELOAD_IMAGES = [
  "/背景画像２.png",
  "/カード選択背景.png",
  "/背景画像４.png",
  "/履歴背景.png",
  "/履歴詳細.png",
  "/カード裏面.png",
  "/履歴なし.png",
  "/朝顔.png",
  "/貝殻.png"
];

function normalizeCardsBySeason(source) {
  const base = defaultCardsBySeason();
  if (source && typeof source === "object") {
    for (const key of SEASON_ORDER) {
      if (Array.isArray(source[key])) base[key] = source[key];
    }
  }
  return base;
}

function loadState() {
  try {
    localStorage.removeItem(OLD_STORAGE_KEY);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      return {
        season: SEASON_ORDER.includes(saved.season) ? saved.season : "summer",
        currentId: typeof saved.currentId === "string" ? saved.currentId : null,
        currentCardIndex: Number.isInteger(saved.currentCardIndex) ? saved.currentCardIndex : 0,
        isFlipped: Boolean(saved.isFlipped),
        cardsBySeason: normalizeCardsBySeason(saved.cardsBySeason),
        history: Array.isArray(saved.history) ? saved.history.filter((item) => item.executedAt) : []
      };
    }

    // 旧バージョン（夏のみ）からの移行
    const legacy = JSON.parse(localStorage.getItem(V2_STORAGE_KEY));
    if (legacy) {
      const legacyCards = Array.isArray(legacy.cards)
        ? legacy.cards
        : [...INITIAL_CARDS, ...(Array.isArray(legacy.customCards) ? legacy.customCards : [])];
      return {
        season: "summer",
        currentId: typeof legacy.currentId === "string" ? legacy.currentId : null,
        currentCardIndex: Number.isInteger(legacy.currentCardIndex) ? legacy.currentCardIndex : 0,
        isFlipped: Boolean(legacy.isFlipped),
        cardsBySeason: { ...defaultCardsBySeason(), summer: legacyCards },
        history: Array.isArray(legacy.history) ? legacy.history.filter((item) => item.executedAt) : []
      };
    }

    return null;
  } catch {
    return null;
  }
}

function chooseCard(cards, lastId, recentIds) {
  const blocked = new Set([lastId, ...recentIds.slice(0, 2)]);
  const choices = cards.filter((card) => !blocked.has(card.id));
  const pool = choices.length ? choices : cards.filter((card) => card.id !== lastId);
  return pool[Math.floor(Math.random() * pool.length)] ?? cards[0];
}

function getJapaneseLines(card) {
  if (JA_LINE_HINTS[card.id]) return JA_LINE_HINTS[card.id];

  const text = card.ja;
  if (text.length <= 10) return [text];

  const parts = text
    .replace(/(を|で|に|へ|と|から|ながら|買って|食べて|飲んで|見に|撮り|行く|する|食べる|飲む|見る|観る|泳ぐ)/g, "$1|")
    .split("|")
    .filter(Boolean);

  const lines = [];
  let current = "";
  parts.forEach((part) => {
    if ((current + part).length > 11 && current) {
      lines.push(current);
      current = part;
    } else {
      current += part;
    }
  });
  if (current) lines.push(current);

  if (lines.length > 1 && lines.at(-1).length <= 2) {
    lines[lines.length - 2] += lines.pop();
  }

  return lines.slice(0, 3);
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("画像を読み込めませんでした。"));
    image.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
}

async function compressImageFile(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("画像ファイルを選択してください。");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromUrl(objectUrl);
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;

    if (!sourceWidth || !sourceHeight) {
      throw new Error("画像サイズを取得できませんでした。");
    }

    const render = async (maxSide, quality) => {
      const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("画像を変換できませんでした。");

      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await canvasToBlob(canvas, quality);
      if (blob) return readBlobAsDataUrl(blob);

      return canvas.toDataURL("image/jpeg", quality);
    };

    const compressed = await render(1400, 0.74);
    if (typeof compressed === "string" && compressed.length > 1_200_000) {
      return render(1000, 0.62);
    }

    return compressed;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function App() {
  const initial = loadState();
  const [screen, setScreen] = useState("home");
  const [season, setSeason] = useState(initial?.season ?? "summer");
  const [currentId, setCurrentId] = useState(initial?.currentId ?? null);
  const [currentCardIndex, setCurrentCardIndex] = useState(initial?.currentCardIndex ?? 0);
  const [isFlipped, setIsFlipped] = useState(initial?.isFlipped ?? false);
  const [cardsBySeason, setCardsBySeason] = useState(initial?.cardsBySeason ?? defaultCardsBySeason());
  const [history, setHistory] = useState(initial?.history ?? []);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isScreenTransitioning, setIsScreenTransitioning] = useState(false);
  const [modal, setModal] = useState(null);
  const screenTransitionTimer = useRef(null);

  const cards = cardsBySeason[season] ?? [];
  const setCards = (updater) =>
    setCardsBySeason((prev) => {
      const current = prev[season] ?? [];
      const next = typeof updater === "function" ? updater(current) : updater;
      return { ...prev, [season]: next };
    });

  const currentCard = cards[currentCardIndex] ?? cards.find((card) => card.id === currentId) ?? null;
  const recentIds = useMemo(() => history.map((item) => item.id), [history]);

  useEffect(() => {
    PRELOAD_IMAGES.forEach((src) => {
      const image = new window.Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    const seasonConfig = SEASONS[season] ?? SEASONS.summer;
    const image = seasonConfig.bg[screen] ?? seasonConfig.bg.home;
    // 画像がまだ用意されていない季節でもグラデーションで表示が破綻しないようにする
    const layers = seasonConfig.fallback ? `${image}, ${seasonConfig.fallback}` : image;
    document.documentElement.style.setProperty("--app-bg", layers);
    document.documentElement.dataset.season = season;
  }, [screen, season]);

  useEffect(() => {
    const timeoutIds = new Set();

    const isStandalone = () =>
      window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

    const setAppHeight = () => {
      const heightCandidates = [
        window.innerHeight,
        window.visualViewport?.height,
        document.documentElement.clientHeight
      ];

      if (isStandalone()) {
        heightCandidates.push(window.screen?.height, window.screen?.availHeight);
      }

      const height = Math.ceil(Math.max(...heightCandidates.filter((value) => Number.isFinite(value) && value > 0)));
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    };

    const scheduleAppHeightUpdate = () => {
      setAppHeight();
      window.requestAnimationFrame(setAppHeight);
      [120, 360, 800, 1500].forEach((delay) => {
        const id = window.setTimeout(() => {
          timeoutIds.delete(id);
          setAppHeight();
        }, delay);
        timeoutIds.add(id);
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleAppHeightUpdate();
      }
    };

    scheduleAppHeightUpdate();
    window.addEventListener("resize", scheduleAppHeightUpdate);
    window.addEventListener("orientationchange", scheduleAppHeightUpdate);
    window.addEventListener("pageshow", scheduleAppHeightUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.visualViewport?.addEventListener("resize", scheduleAppHeightUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleAppHeightUpdate);

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("resize", scheduleAppHeightUpdate);
      window.removeEventListener("orientationchange", scheduleAppHeightUpdate);
      window.removeEventListener("pageshow", scheduleAppHeightUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.visualViewport?.removeEventListener("resize", scheduleAppHeightUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleAppHeightUpdate);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ season, currentId, currentCardIndex, isFlipped, cardsBySeason, history })
      );
    } catch (error) {
      console.warn("保存容量の上限に達したため、一部の変更を保存できませんでした。", error);
    }
  }, [season, currentId, currentCardIndex, isFlipped, cardsBySeason, history]);

  useEffect(() => {
    return () => {
      if (screenTransitionTimer.current) {
        window.clearTimeout(screenTransitionTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (cards.length === 0) {
      setCurrentId(null);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      return;
    }
    if (currentCardIndex >= cards.length) {
      const nextIndex = cards.length - 1;
      setCurrentCardIndex(nextIndex);
      setCurrentId(cards[nextIndex].id);
    }
  }, [cardsBySeason, season, currentCardIndex]);

  const transitionToScreen = (nextScreen, beforeSwitch) => {
    if (screenTransitionTimer.current) {
      window.clearTimeout(screenTransitionTimer.current);
    }

    if (nextScreen === screen) {
      beforeSwitch?.();
      return;
    }

    setIsScreenTransitioning(true);
    screenTransitionTimer.current = window.setTimeout(() => {
      beforeSwitch?.();
      setScreen(nextScreen);
      screenTransitionTimer.current = null;
      window.requestAnimationFrame(() => setIsScreenTransitioning(false));
    }, 170);
  };

  const drawCard = () => {
    if (isDrawing || cards.length === 0) return;
    const next = chooseCard(cards, currentId, recentIds);
    const nextIndex = Math.max(0, cards.findIndex((card) => card.id === next.id));
    setIsDrawing(true);
    transitionToScreen("card", () => {
      setCurrentId(next.id);
      setCurrentCardIndex(nextIndex);
      setIsFlipped(false);
      setIsDrawing(false);
    });
  };

  const selectCardIndex = (nextIndex) => {
    if (cards.length === 0) return;
    const normalizedIndex = (nextIndex + cards.length) % cards.length;
    const next = cards[normalizedIndex];
    setCurrentCardIndex(normalizedIndex);
    setCurrentId(next.id);
    setIsFlipped(false);
  };

  const redrawCard = () => {
    if (cards.length === 0) return;
    const next = chooseCard(cards, currentId, recentIds);
    const nextIndex = Math.max(0, cards.findIndex((card) => card.id === next.id));
    selectCardIndex(nextIndex);
  };

  const executeCard = () => {
    if (!currentCard || !isFlipped) return;
    const now = new Date();
    const executedAt = now.toLocaleDateString("sv-SE");
    const executedAtLabel = `${executedAt.replaceAll("-", "/")} ${now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
    setHistory((items) => [
      { historyId: crypto.randomUUID(), id: currentCard.id, ja: currentCard.ja, en: currentCard.en, executedAt, executedAtLabel },
      ...items
    ].slice(0, 50));
  };

  const deleteHistoryItem = (targetIndex) => {
    setHistory((items) => items.filter((_, index) => index !== targetIndex));
  };

  const updateHistoryItem = (targetIndex, patch) => {
    setHistory((items) => items.map((item, index) => (index === targetIndex ? { ...item, ...patch } : item)));
  };

  const reset = () => {
    transitionToScreen("home", () => {
      setCurrentId(null);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setHistory([]);
      setModal(null);
    });
  };

  const changeSeason = (nextSeason) => {
    if (nextSeason === season || !SEASON_ORDER.includes(nextSeason)) return;
    setSeason(nextSeason);
    setCurrentId(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const addCard = (card) => {
    setCards((items) => [{ ...card, id: crypto.randomUUID() }, ...items]);
  };

  const updateCard = (cardId, nextCard) => {
    setCards((items) => items.map((item) => (item.id === cardId ? { ...item, ...nextCard } : item)));
    setHistory((items) => items.map((item) => (item.id === cardId ? { ...item, ...nextCard } : item)));
    if (currentId === cardId) {
      setCurrentId(cardId);
    }
  };

  const deleteCard = (cardId) => {
    setCards((items) => items.filter((item) => item.id !== cardId));
    setHistory((items) => items.filter((item) => item.id !== cardId));
    if (currentId === cardId) {
      setCurrentId(null);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      transitionToScreen("home");
    }
  };

  const openHistoryDetail = (index) => {
    transitionToScreen("historyDetail", () => setSelectedHistoryIndex(index));
  };

  const deleteSelectedHistory = () => {
    if (selectedHistoryIndex === null) return;
    transitionToScreen("history", () => {
      deleteHistoryItem(selectedHistoryIndex);
      setSelectedHistoryIndex(null);
    });
  };

  return (
    <main className="app">
      <div className={`screen-stage ${isScreenTransitioning ? "is-exiting" : ""}`}>
        {screen === "home" && (
          <HomeScreen
            isDrawing={isDrawing}
            isFading={false}
            hasCards={cards.length > 0}
            season={season}
            changeSeason={changeSeason}
            drawCard={drawCard}
            goAdd={() => transitionToScreen("add")}
            openHistory={() => transitionToScreen("history")}
            openHowTo={() => setModal("howto")}
            goHome={() => transitionToScreen("home")}
          />
        )}

        {screen === "card" && (
          <CardScreen
            card={currentCard}
            cards={cards}
            isDrawing={isDrawing}
            currentCardIndex={currentCardIndex}
            isFlipped={isFlipped}
            flipCard={() => setIsFlipped(true)}
            selectCardIndex={selectCardIndex}
            redrawCard={redrawCard}
            executeCard={executeCard}
            goHome={() => transitionToScreen("home")}
            openHistory={() => transitionToScreen("history")}
            openHowTo={() => setModal("howto")}
          />
        )}

        {screen === "add" && (
          <AddScreen
            cards={cards}
            addCard={addCard}
            updateCard={updateCard}
            deleteCard={deleteCard}
            goHome={() => transitionToScreen("home")}
          />
        )}

        {screen === "history" && (
          <HistoryScreen
            history={history}
            goHome={() => transitionToScreen("home")}
            deleteHistoryItem={deleteHistoryItem}
            openHistoryDetail={openHistoryDetail}
          />
        )}

        {screen === "historyDetail" && (
          <HistoryDetailScreen
            item={selectedHistoryIndex === null ? null : history[selectedHistoryIndex]}
            goBack={() => transitionToScreen("history")}
            deleteRecord={deleteSelectedHistory}
            updateRecord={(patch) => {
              if (selectedHistoryIndex !== null) updateHistoryItem(selectedHistoryIndex, patch);
            }}
          />
        )}
      </div>

      {modal && (
        <Modal title={modalTitle(modal)} close={() => setModal(null)}>
          {modal === "howto" && <HowTo />}
        </Modal>
      )}
    </main>
  );
}

function modalTitle(modal) {
  return { howto: "遊び方" }[modal];
}

function HomeScreen({ isDrawing, isFading, hasCards, season, changeSeason, drawCard, goAdd, openHistory, goHome, openHowTo }) {
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);

  const selectSeason = (key) => {
    changeSeason(key);
    setIsSeasonOpen(false);
  };

  return (
    <section className={`home-screen ${isFading ? "fade-out" : ""}`} aria-label="ホーム">
      <button
        className={`card-top-button card-back-button season-toggle season-toggle--${season}`}
        onClick={() => setIsSeasonOpen((value) => !value)}
        aria-label={`季節を変える（いまは${SEASONS[season].label}）`}
        aria-expanded={isSeasonOpen}
      >
        <SeasonIcon season={season} className="season-toggle-icon" />
      </button>
      <button className="card-top-button card-history-button" onClick={openHistory} aria-label="履歴を見る">
        <History size={30} strokeWidth={2.1} />
      </button>
      {isSeasonOpen && (
        <>
          <div className="season-backdrop" onClick={() => setIsSeasonOpen(false)} aria-hidden="true" />
          <div className="season-switch" role="tablist" aria-label="季節を選ぶ">
            {SEASON_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={season === key}
                className={`season-tab ${season === key ? "is-active" : ""}`}
                onClick={() => selectSeason(key)}
              >
                <SeasonIcon season={key} className="season-icon" />
                <span className="season-name">{SEASONS[key].label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {season !== "summer" && (
        <div className="home-title">
          <p>ドラマみたいな場面を日常に。</p>
          <h1>この{SEASONS[season].label}、<br />私たちは、</h1>
        </div>
      )}
      <div className="home-actions">
        <button className="home-main-button draw-button pressable" aria-label="カードを引く" onClick={drawCard} disabled={isDrawing || !hasCards}>
          <IconCards className="button-icon" size={34} stroke={2.2} aria-hidden="true" />
          <span>カードを引く</span>
          <ChevronRight className="home-button-chevron" size={25} strokeWidth={2.7} aria-hidden="true" />
        </button>
        <button className="home-main-button add-button pressable" aria-label="カードを追加" onClick={goAdd}>
          <Plus className="add-plus-icon" size={30} strokeWidth={3} />
          <span>カードを追加</span>
          <ChevronRight className="home-button-chevron" size={25} strokeWidth={2.7} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function SeasonIcon({ season, className }) {
  const svgProps = {
    className: `${className} season-icon-art season-icon-art--${season}`,
    viewBox: "0 0 32 32",
    "aria-hidden": true
  };

  if (season === "spring") {
    return (
      <svg {...svgProps}>
        <g fill="#f3a6b7">
          <ellipse cx="16" cy="8.2" rx="5.1" ry="7" />
          <ellipse cx="23.4" cy="13.5" rx="5.1" ry="7" transform="rotate(72 23.4 13.5)" />
          <ellipse cx="20.6" cy="22.1" rx="5.1" ry="7" transform="rotate(144 20.6 22.1)" />
          <ellipse cx="11.4" cy="22.1" rx="5.1" ry="7" transform="rotate(216 11.4 22.1)" />
          <ellipse cx="8.6" cy="13.5" rx="5.1" ry="7" transform="rotate(288 8.6 13.5)" />
        </g>
        <circle cx="16" cy="16" r="3.1" fill="#fff" />
        <circle cx="16" cy="10.7" r="1.25" fill="#fff" />
        <circle cx="21" cy="14.4" r="1.25" fill="#fff" />
        <circle cx="19.1" cy="20.3" r="1.25" fill="#fff" />
        <circle cx="12.9" cy="20.3" r="1.25" fill="#fff" />
        <circle cx="11" cy="14.4" r="1.25" fill="#fff" />
      </svg>
    );
  }

  if (season === "autumn") {
    return (
      <svg {...svgProps}>
        <path
          fill="#ee6235"
          d="M15.3 2.2l2.2 5.1 3-2-1 5.8 4.2-1.1-2 4 5.7 1.5-4 3.3 2.2 2.1-7.7 2.2.8 6.9h-2.4l.4-6.9-7.7-2.2 2.2-2.1-4-3.3 5.7-1.5-2-4 4.2 1.1-1-5.8 3 2z"
        />
      </svg>
    );
  }

  if (season === "winter") {
    return (
      <svg {...svgProps} fill="none" stroke="#8fc4e8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1">
        <path d="M16 2.5v27M4.3 9.2l23.4 13.6M4.3 22.8L27.7 9.2" />
        <path d="M12.7 5.6L16 8.9l3.3-3.3M12.7 26.4L16 23.1l3.3 3.3M5.8 13.5l4.5-1.2-1.2-4.5M26.2 18.5l-4.5 1.2 1.2 4.5M9.1 24.2l1.2-4.5-4.5-1.2M22.9 7.8l-1.2 4.5 4.5 1.2" />
      </svg>
    );
  }

  return (
    <svg {...svgProps}>
      <g fill="#ff7a2f">
        <circle cx="16" cy="4.8" r="4.3" />
        <circle cx="23.9" cy="8.1" r="4.3" />
        <circle cx="27.2" cy="16" r="4.3" />
        <circle cx="23.9" cy="23.9" r="4.3" />
        <circle cx="16" cy="27.2" r="4.3" />
        <circle cx="8.1" cy="23.9" r="4.3" />
        <circle cx="4.8" cy="16" r="4.3" />
        <circle cx="8.1" cy="8.1" r="4.3" />
      </g>
      <circle cx="16" cy="16" r="10.1" fill="#ffc338" />
    </svg>
  );
}

function CardScreen({
  card,
  cards,
  isDrawing,
  currentCardIndex,
  isFlipped,
  flipCard,
  selectCardIndex,
  redrawCard,
  executeCard,
  goHome,
  openHistory,
  openHowTo
}) {
  const [slideDirection, setSlideDirection] = useState("");
  const [isPromotingStack, setIsPromotingStack] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const tapStartRef = useRef(null);
  const pendingSwipeRef = useRef(0);
  const swipeTimerRef = useRef(null);
  const jaAreaRef = useRef(null);
  const jaTextRef = useRef(null);
  const enAreaRef = useRef(null);
  const enTextRef = useRef(null);

  useEffect(() => {
    setHasExecuted(false);
  }, [card?.id, isFlipped]);

  const jaText = card?.ja ?? "";
  const enText = card?.en ?? "";

  // お題が長くても見切れないよう、カード内の実寸に合わせて文字サイズを自動調整する
  useLayoutEffect(() => {
    const pairs = [
      [jaAreaRef.current, jaTextRef.current, 12],
      [enAreaRef.current, enTextRef.current, 11]
    ].filter(([area, text]) => area && text);
    if (!pairs.length) return;

    const fitPair = (area, text, minSize) => {
      const ratioOf = () => {
        const availW = text.clientWidth;
        const availH = area.clientHeight;
        const contentW = text.scrollWidth;
        const contentH = text.scrollHeight;
        if (!availW || !availH || !contentW || !contentH) return 1;
        return Math.min(availW / contentW, availH / contentH, 1);
      };

      text.style.fontSize = "";
      let ratio = ratioOf();
      if (ratio >= 1) return;
      // 端数まで確実に収めるため、比例縮小を2回かける
      for (let i = 0; i < 2 && ratio < 1; i += 1) {
        const base = parseFloat(getComputedStyle(text).fontSize) || minSize;
        text.style.fontSize = `${Math.max(base * ratio * 0.97, minSize)}px`;
        ratio = ratioOf();
      }
    };

    const fitAll = () => pairs.forEach(([area, text, minSize]) => fitPair(area, text, minSize));

    fitAll();
    const observer = new ResizeObserver(fitAll);
    pairs.forEach(([area]) => observer.observe(area));
    return () => observer.disconnect();
  }, [jaText, enText]);

  if (!card) {
    return (
      <section className="screen-shell">
        <TopBar goHome={goHome} />
        <div className="empty-card">カードを引いてください。</div>
      </section>
    );
  }

  const jaLength = card.ja.length;
  const enLength = card.en.length;
  const jaLines = getJapaneseLines(card);
  const densityClass = [
    jaLength > 16 ? "ja-dense" : "",
    jaLength > 26 ? "ja-extra-dense" : "",
    enLength > 28 ? "en-dense" : "",
    enLength > 46 ? "en-extra-dense" : ""
  ].filter(Boolean).join(" ");

  const flipCurrentCard = () => {
    if (!isFlipped) flipCard();
  };

  const startCardTap = (x, y) => {
    tapStartRef.current = { x, y, time: Date.now() };
  };

  const finishCardTap = (x, y) => {
    const start = tapStartRef.current;
    tapStartRef.current = null;
    if (!start || isFlipped) return;

    const movedX = Math.abs(x - start.x);
    const movedY = Math.abs(y - start.y);
    const elapsed = Date.now() - start.time;
    if (movedX < 14 && movedY < 14 && elapsed < 600) {
      flipCard();
    }
  };

  const moveCard = (direction) => {
    if (cards.length < 2) return;
    pendingSwipeRef.current = 0;
    setIsPromotingStack(true);
    setSlideDirection(direction > 0 ? "slide-next" : "slide-prev");
    selectCardIndex(currentCardIndex + direction);
    window.setTimeout(() => {
      setSlideDirection("");
      setIsPromotingStack(false);
    }, 220);
  };

  const swipeCard = (direction) => {
    if (direction === "left") {
      pendingSwipeRef.current = 1;
    }
    if (direction === "right") {
      pendingSwipeRef.current = -1;
    }

    const swipeDirection = pendingSwipeRef.current;
    if (!swipeDirection) return;

    if (swipeTimerRef.current) {
      window.clearTimeout(swipeTimerRef.current);
    }

    swipeTimerRef.current = window.setTimeout(() => {
      pendingSwipeRef.current = 0;
      setIsPromotingStack(true);
      selectCardIndex(currentCardIndex + swipeDirection);
      window.setTimeout(() => setIsPromotingStack(false), 180);
    }, 70);
  };

  return (
    <section className="screen-shell card-shell picker-shell">
      <TopBar goHome={goHome} />
      <button className="card-top-button card-back-button" onClick={goHome} aria-label="ホームに戻る">
        <ChevronLeft size={42} strokeWidth={3.2} />
      </button>
      <button className="card-top-button card-history-button" onClick={openHistory} aria-label="履歴を見る">
        <History size={34} strokeWidth={2.1} />
      </button>

      {!isFlipped && !isPromotingStack && <div className="stack-card-shadow" aria-hidden="true" />}

      <TinderCard
        key={card.id}
        className={`tinder-card-wrapper ${slideDirection} ${isPromotingStack ? "promote-from-stack" : ""}`}
        onSwipe={swipeCard}
        preventSwipe={["up", "down"]}
        swipeRequirementType="position"
        swipeThreshold={130}
        flickOnSwipe
      >
        <div
          className={`flip-card pressable ${isFlipped ? "is-flipped" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={isFlipped ? "選ばれたお題カード" : "タップでカードをめくる"}
          onPointerDown={(event) => startCardTap(event.clientX, event.clientY)}
          onPointerUp={(event) => finishCardTap(event.clientX, event.clientY)}
          onTouchStartCapture={(event) => {
            const touch = event.touches[0];
            if (touch) startCardTap(touch.clientX, touch.clientY);
          }}
          onTouchEndCapture={(event) => {
            const touch = event.changedTouches[0];
            if (touch) finishCardTap(touch.clientX, touch.clientY);
          }}
          onClick={flipCurrentCard}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && !isFlipped) {
              event.preventDefault();
              flipCard();
            }
          }}
        >
          <div className="flip-card-inner">
            <section className="card-back-face pressable" aria-hidden="true" />

            <section key={card.id} className={`big-card card-front-face pressable ${densityClass} ${isDrawing ? "leaving" : ""}`}>
              <svg className="card-accent" viewBox="0 0 60 45" aria-hidden="true">
                <line x1="8" y1="30" x2="22" y2="34" />
                <line x1="22" y1="14" x2="28" y2="26" />
                <line x1="42" y1="6" x2="43" y2="20" />
              </svg>
              <div className="card-ja-area" ref={jaAreaRef}>
                <h1 className="jaText" ref={jaTextRef}>
                  {jaLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h1>
              </div>
              <div className="card-en-area" ref={enAreaRef}>
                <p className="enText" ref={enTextRef}>{card.en}</p>
              </div>
            </section>
          </div>
        </div>
      </TinderCard>

      <div className="card-action-stack">
        <button className="primary-button" onClick={redrawCard} disabled={isDrawing}>
          <IconCards className="button-icon" size={34} stroke={2.2} aria-hidden="true" />
          カードを引き直す
        </button>
        <button
          className={`execute-button ${hasExecuted ? "is-done" : ""}`}
          onClick={() => {
            if (!isFlipped || hasExecuted) return;
            executeCard();
            setHasExecuted(true);
          }}
          disabled={!isFlipped || hasExecuted}
        >
          <Check size={34} strokeWidth={2.6} />
          {hasExecuted ? "記録した！" : "実行する！"}
        </button>
      </div>
    </section>
  );
}

function AddScreen({ cards, addCard, updateCard, deleteCard, goHome }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const editingCard = cards.find((card) => card.id === editingId);

  useEffect(() => {
    setText(editingCard?.ja ?? "");
  }, [editingCard]);

  const submit = async (event) => {
    event.preventDefault();
    const ja = text.trim();
    if (!ja || isSaving) return;

    setIsSaving(true);
    setStatus("");
    try {
      const en = await translate(ja);
      if (editingId) {
        updateCard(editingId, { ja, en });
        setStatus("カードを更新しました。");
      } else {
        addCard({ ja, en });
        setStatus("カードを追加しました。");
      }
      setText("");
      setEditingId(null);
    } catch (error) {
      setStatus(error.message || "翻訳に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="screen-shell add-shell add-card-page">
      <TopBar goHome={goHome} />
      <section className="add-form-section">
        <div className="panel add-form-card">
          <h1>
            <span className="add-title-icon" aria-hidden="true">
              <IconCards size={34} stroke={1.9} />
              <Plus size={16} strokeWidth={3} />
            </span>
            {editingId ? "カードを編集" : "カードを追加"}
          </h1>
          <form className="add-form" onSubmit={submit}>
            <label htmlFor="ja-card">日本語のお題</label>
            <div className="textarea-wrap">
              <textarea
                id="ja-card"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="例：夜風にあたりながらラムネを飲む"
                rows={4}
                maxLength={60}
              />
              <span className="char-count">{text.length}/60</span>
            </div>
            <button className="save-button" type="submit" disabled={!text.trim() || isSaving}>
              {isSaving ? "英語訳を作成中..." : editingId ? "更新する" : "追加する"}
            </button>
            {editingId && (
              <button className="ghost-button" type="button" onClick={() => setEditingId(null)}>
                編集をやめる
              </button>
            )}
            {status && <p className="status">{status}</p>}
          </form>
        </div>
      </section>

      <section className="added-card-section">
        <div className="added-card-heading">
          <h2><IconCards size={28} stroke={1.9} />カード一覧</h2>
        </div>
        <div className="added-card-scroll">
          {cards.length === 0 ? (
            <div className="panel add-empty">
              <p className="empty">カードがありません。</p>
              <IconCards size={56} stroke={1.5} />
            </div>
          ) : (
            <ul className="added-card-grid custom-list">
              {cards.map((card) => (
                <li key={card.id} className={editingId === card.id ? "is-editing" : ""}>
                  <strong>{card.ja}</strong>
                  <span>{card.en}</span>
                  <div>
                    <button onClick={() => setEditingId(card.id)} aria-label="編集">
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`「${card.ja}」を削除しますか？\nこのカードの履歴も一緒に削除されます。`)) {
                          deleteCard(card.id);
                          if (editingId === card.id) setEditingId(null);
                        }
                      }}
                      aria-label="削除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </section>
  );
}

async function translate(ja) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: ja })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "翻訳APIでエラーが発生しました。");
  }
  return data.en;
}

function TopBar({ goHome }) {
  return (
    <header className="top-bar">
      <button onClick={goHome} aria-label="戻る">
        <ChevronLeft className="top-back-icon" size={30} strokeWidth={3.2} aria-hidden="true" />
        <span>この夏、私たちは、</span>
      </button>
    </header>
  );
}

function BottomNav({ openHistory, goHome, openHowTo }) {
  return (
    <nav className="bottom-nav" aria-label="下部ナビゲーション">
      <button onClick={openHistory}>
        <span><History size={30} /></span>
        履歴を見る
      </button>
      <button onClick={goHome}>
        <span><House size={30} /></span>
        ホーム
      </button>
      <button onClick={openHowTo}>
        <span><CircleHelp size={30} /></span>
        遊び方
      </button>
    </nav>
  );
}

function HistoryScreen({ history, goHome, deleteHistoryItem, openHistoryDetail }) {
  const [isLeavingHistory, setIsLeavingHistory] = useState(false);

  const openDetail = (index) => {
    setIsLeavingHistory(true);
    window.setTimeout(() => openHistoryDetail(index), 40);
  };

  const leaveHistory = () => {
    setIsLeavingHistory(true);
    window.setTimeout(goHome, 40);
  };

  return (
    <section className={`history-screen ${isLeavingHistory ? "is-leaving-history" : ""}`} aria-label="履歴">
      <button className="card-top-button history-back-button" onClick={leaveHistory} aria-label="ホームに戻る">
        <ChevronLeft size={42} strokeWidth={3.2} />
      </button>

      <div className={`history-panel ${history.length ? "" : "is-empty"}`}>
        {history.length ? (
          <ul className="history-card-list">
            {history.map((item, index) => (
              <HistoryRow
                key={item.historyId ?? `${item.id}-${item.executedAtLabel ?? item.executedAt ?? index}`}
                item={item}
                onDelete={() => deleteHistoryItem(index)}
                onOpen={() => openDetail(index)}
              />
            ))}
          </ul>
        ) : (
          <div className="history-empty">
            <img src="/履歴なし.png" alt="まだ履歴はありません。カードを引くたびに、ここに履歴が表示されます。" />
          </div>
        )}
      </div>
    </section>
  );
}

function HistoryRow({ item, onDelete, onOpen }) {
  const [offset, setOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const rowRef = useRef(null);
  const swipeRef = useRef(null);
  const didDragRef = useRef(false);
  const revealWidth = 92;

  const startSwipe = (event) => {
    if (isDeleting) return;
    swipeRef.current = {
      x: event.clientX,
      y: event.clientY,
      startOffset: offset,
      locked: null
    };
    didDragRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveSwipe = (event) => {
    const swipe = swipeRef.current;
    if (!swipe) return;

    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (!swipe.locked && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      swipe.locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (swipe.locked !== "x") return;
    didDragRef.current = true;

    const rowWidth = rowRef.current?.offsetWidth ?? 320;
    const nextOffset = Math.min(0, Math.max(-rowWidth, swipe.startOffset + dx));
    setOffset(nextOffset);
  };

  const endSwipe = () => {
    if (!swipeRef.current) return;
    swipeRef.current = null;
    const rowWidth = rowRef.current?.offsetWidth ?? 320;

    setOffset((value) => {
      const distance = Math.abs(value);
      if (distance >= rowWidth * 0.5) {
        setIsDeleting(true);
        window.setTimeout(onDelete, 190);
        return -(rowWidth + 32);
      }
      return distance > revealWidth * 0.45 ? -revealWidth : 0;
    });
  };

  const rowWidth = rowRef.current?.offsetWidth ?? 320;
  const deleteProgress = Math.min(1, Math.abs(offset) / (rowWidth * 0.5));
  const isDeleteReady = deleteProgress >= 1;

  const openRow = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (Math.abs(offset) > 2) {
      setOffset(0);
      return;
    }
    setIsOpening(true);
    window.setTimeout(onOpen, 40);
  };

  return (
    <li
      ref={rowRef}
      className={`history-row ${offset < 0 ? "is-revealed" : ""} ${isDeleteReady ? "is-delete-ready" : ""} ${isDeleting ? "is-deleting" : ""} ${isOpening ? "is-opening" : ""}`}
      style={{ "--delete-progress": deleteProgress }}
    >
      <button className="history-delete-action" onClick={onDelete} aria-label={`${item.ja}を履歴から削除`}>
        <Trash2 size={24} strokeWidth={2.4} />
        削除
      </button>
      <div
        className="history-row-card"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={startSwipe}
        onPointerMove={moveSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
        onClick={openRow}
      >
        <div className="history-thumb" aria-hidden="true">
          <strong>{item.ja}</strong>
          <span>{item.en}</span>
        </div>
        <div className="history-copy">
          <strong>{item.ja}</strong>
          <time>{item.executedAtLabel ?? item.executedAt?.replaceAll("-", "/")}</time>
        </div>
        <ChevronRight className="history-row-icon" size={26} strokeWidth={2.4} aria-hidden="true" />
      </div>
    </li>
  );
}

function HistoryDetailScreen({ item, goBack, deleteRecord, updateRecord }) {
  const fileInputRef = useRef(null);

  if (!item) {
    return (
      <section className="history-detail-screen" aria-label="履歴詳細">
        <button className="card-top-button history-detail-back-button" onClick={goBack} aria-label="履歴に戻る">
          <ChevronLeft size={42} strokeWidth={3.2} />
        </button>
      </section>
    );
  }

  const changePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressedPhoto = await compressImageFile(file);
      if (typeof compressedPhoto === "string") {
        updateRecord({ photo: compressedPhoto });
      }
    } catch (error) {
      console.error(error);
      window.alert("写真の読み込みに失敗しました。別の写真を選ぶか、スクリーンショットにしてから試してください。");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="history-detail-screen" aria-label="履歴詳細">
      <button className="card-top-button history-detail-back-button" onClick={goBack} aria-label="履歴に戻る">
        <ChevronLeft size={42} strokeWidth={3.2} />
      </button>

      <section className="detail-card-summary" aria-label="引いたカード情報">
        <div className="detail-card-thumb" aria-hidden="true">
          <strong>{item.ja}</strong>
          <span>{item.en}</span>
        </div>
        <div className="detail-card-copy">
          <h1>{item.ja}</h1>
          <div className="detail-date-block">
            <span><Calendar size={15} strokeWidth={2.8} />記録した日時</span>
            <time>{item.executedAtLabel ?? item.executedAt?.replaceAll("-", "/")}</time>
          </div>
        </div>
      </section>

      <section className="detail-photo-panel" aria-label="写真">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={changePhoto} />
        <button className={`detail-photo-button ${item.photo ? "has-photo" : ""}`} onClick={() => fileInputRef.current?.click()}>
          {item.photo ? (
            <img src={item.photo} alt={`${item.ja}の写真`} />
          ) : (
            <span className="detail-photo-empty">
              <span className="detail-photo-empty-icon">
                <Image size={28} strokeWidth={2.4} />
              </span>
              <strong>写真を追加</strong>
              <small>思い出の写真を追加して記録を彩りましょう</small>
              <span className="detail-photo-pick">
                <Plus size={20} strokeWidth={2.0} />
                写真を選ぶ
              </span>
            </span>
          )}
        </button>
      </section>

      <section className="detail-note-panel" aria-label="記録メモ">
        <input
          className="detail-place-input"
          value={item.place ?? ""}
          onChange={(event) => updateRecord({ place: event.target.value })}
          placeholder="タップして入力してください"
        />
        <input
          className="detail-memo-input"
          value={item.memo ?? ""}
          onChange={(event) => updateRecord({ memo: event.target.value })}
          placeholder="タップして入力してください"
        />
      </section>

      <button
        className="detail-delete-button"
        onClick={() => {
          if (window.confirm("この記録を削除しますか？\n写真やメモも一緒に削除されます。")) {
            deleteRecord();
          }
        }}
        aria-label="この記録を削除する"
      />
    </section>
  );
}

function Modal({ title, close, children }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={close} aria-label="閉じる"><X size={24} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function HistoryList({ history }) {
  if (!history.length) return <p className="empty">まだ実行したカードはありません。</p>;
  return (
    <ul className="history-list">
      {history.map((item, index) => (
        <li key={`${item.id}-${item.executedAt ?? index}`}>
          {item.executedAt && <time>{item.executedAt.replaceAll("-", "/")}</time>}
          <strong>{item.ja}</strong>
          <span>{item.en}</span>
        </li>
      ))}
    </ul>
  );
}

function HowTo() {
  return (
    <div className="howto">
      <h3>■基本の流れ</h3>
      <p>1.「カードを引く」を押すとカードが登場<br />2. カードをタップしてめくり、お題をゲット<br />3. お題にチャレンジしよう<br />4. できたら「実行する！」で履歴に記録</p>

      <h3>■季節の切り替え</h3>
      <p>・ホーム上部で春・夏・秋・冬を選べる<br />・季節ごとに画面の雰囲気とお題カードが変わる<br />・カードの追加は選んでいる季節に登録される</p>

      <h3>■カードの選び方</h3>
      <p>・カードを左右にスワイプすると別のお題を選べる<br />・「カードを引き直す」でランダムに引き直せる</p>

      <h3>■カードを追加</h3>
      <p>・「カードを追加」から好きなお題を登録できる<br />・入力したお題は自動で英語に翻訳される<br />・追加したカードもランダムで出てくるようになる</p>

      <h3>■履歴</h3>
      <p>・右上の時計マークから実行したカードを見られる<br />・履歴をタップすると写真やメモを残せる<br />・履歴を左にスワイプすると削除できる</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
