import React, { useEffect, useMemo, useRef, useState } from "react";
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
  "base-10": ["一番大きいポップコーンを", "買って映画を観る"]
};

const STORAGE_KEY = "summer-card-app-v2";
const OLD_STORAGE_KEY = "summer-card-app-v1";
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

function loadState() {
  try {
    localStorage.removeItem(OLD_STORAGE_KEY);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return null;
    const savedCards = Array.isArray(saved.cards)
      ? saved.cards
      : [...INITIAL_CARDS, ...(Array.isArray(saved.customCards) ? saved.customCards : [])];
    return {
      currentId: typeof saved.currentId === "string" ? saved.currentId : null,
      currentCardIndex: Number.isInteger(saved.currentCardIndex) ? saved.currentCardIndex : 0,
      isFlipped: Boolean(saved.isFlipped),
      cards: savedCards,
      history: Array.isArray(saved.history) ? saved.history.filter((item) => item.executedAt) : []
    };
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
  const [currentId, setCurrentId] = useState(initial?.currentId ?? null);
  const [currentCardIndex, setCurrentCardIndex] = useState(initial?.currentCardIndex ?? 0);
  const [isFlipped, setIsFlipped] = useState(initial?.isFlipped ?? false);
  const [cards, setCards] = useState(initial?.cards ?? INITIAL_CARDS);
  const [history, setHistory] = useState(initial?.history ?? []);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isScreenTransitioning, setIsScreenTransitioning] = useState(false);
  const [modal, setModal] = useState(null);
  const screenTransitionTimer = useRef(null);

  const currentCard = cards[currentCardIndex] ?? cards.find((card) => card.id === currentId) ?? null;
  const recentIds = useMemo(() => history.map((item) => item.id), [history]);

  useEffect(() => {
    PRELOAD_IMAGES.forEach((src) => {
      const image = new window.Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    const backgrounds = {
      home: "url('/背景画像２.png')",
      card: "url('/カード選択背景.png')",
      add: "url('/背景画像４.png')",
      history: "url('/履歴背景.png')",
      historyDetail: "url('/履歴詳細.png')"
    };
    document.documentElement.style.setProperty("--app-bg", backgrounds[screen] ?? backgrounds.home);
  }, [screen]);

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentId, currentCardIndex, isFlipped, cards, history }));
    } catch (error) {
      console.warn("保存容量の上限に達したため、一部の変更を保存できませんでした。", error);
    }
  }, [currentId, currentCardIndex, isFlipped, cards, history]);

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
  }, [cards, currentCardIndex]);

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

function HomeScreen({ isDrawing, isFading, drawCard, goAdd, openHistory, goHome, openHowTo }) {
  return (
    <section className={`home-screen ${isFading ? "fade-out" : ""}`} aria-label="ホーム">
      <button className="card-top-button card-back-button" onClick={openHowTo} aria-label="遊び方">
        <CircleHelp size={30} strokeWidth={2.1} />
      </button>
      <button className="card-top-button card-history-button" onClick={openHistory} aria-label="履歴を見る">
        <History size={30} strokeWidth={2.1} />
      </button>
      <div className="home-actions">
        <button className="home-main-button draw-button pressable" aria-label="カードを引く" onClick={drawCard} disabled={isDrawing}>
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
  const tapStartRef = useRef(null);
  const pendingSwipeRef = useRef(0);
  const swipeTimerRef = useRef(null);

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
              <div className="card-ja-area">
                <h1 className="jaText">
                  {jaLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h1>
              </div>
              <div className="card-en-area">
                <p className="enText">{card.en}</p>
              </div>
            </section>
          </div>
        </div>
      </TinderCard>

      <div className="card-action-stack">
        <button className="primary-button" onClick={redrawCard} disabled={isDrawing}>
          <IconCards className="button-icon" size={26} stroke={2.2} aria-hidden="true" />
          カードを引き直す
        </button>
        <button className="execute-button" onClick={executeCard} disabled={!isFlipped}>
          <Check size={28} strokeWidth={2.6} />
          実行する！
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
    setStatus("英語訳を作成中...");
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
            カードを追加
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
              {editingId ? "更新する" : "追加する"}
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
                <li key={card.id}>
                  <strong>{card.ja}</strong>
                  <span>{card.en}</span>
                  <div>
                    <button onClick={() => setEditingId(card.id)} aria-label="編集">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => deleteCard(card.id)} aria-label="削除">
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

      <button className="detail-delete-button" onClick={deleteRecord} aria-label="この記録を削除する" />
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
      <h3>■遊び方</h3>
      <p>1.「カードを引く」を押してお題をゲット<br />2. 出てきたお題にチャレンジしよう<br />3. 終わったら次のカードへ！</p>

      <h3>■カードを追加</h3>
      <p>・「カードを追加」から好きなお題を登録できる<br />・入力したお題は自動で英語に翻訳される<br />・追加したカードもランダムで出てくるようになる</p>

      <h3>■その他の機能</h3>
      <p>・「履歴を見る」：これまで実行したカードを確認できる<br />・「ホーム」：メイン画面に戻れる</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
