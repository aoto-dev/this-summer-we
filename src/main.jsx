import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, ChevronLeft, ChevronRight, CircleHelp, History, House, Pencil, Plus, Trash2, X } from "lucide-react";
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

function App() {
  const initial = loadState();
  const [screen, setScreen] = useState(initial?.currentId ? "card" : "home");
  const [currentId, setCurrentId] = useState(initial?.currentId ?? null);
  const [currentCardIndex, setCurrentCardIndex] = useState(initial?.currentCardIndex ?? 0);
  const [isFlipped, setIsFlipped] = useState(initial?.isFlipped ?? false);
  const [cards, setCards] = useState(initial?.cards ?? INITIAL_CARDS);
  const [history, setHistory] = useState(initial?.history ?? []);
  const [isDrawing, setIsDrawing] = useState(false);
  const [homeFading, setHomeFading] = useState(false);
  const [modal, setModal] = useState(null);

  const currentCard = cards[currentCardIndex] ?? cards.find((card) => card.id === currentId) ?? null;
  const recentIds = useMemo(() => history.map((item) => item.id), [history]);

  useEffect(() => {
    const backgrounds = {
      home: "url('/背景画像２.png')",
      card: "url('/カード選択背景.png')",
      add: "url('/背景画像４.png')"
    };
    document.documentElement.style.setProperty("--app-bg", backgrounds[screen] ?? backgrounds.home);
  }, [screen]);

  useEffect(() => {
    const setAppHeight = () => {
      const viewportHeight = window.visualViewport?.height ?? 0;
      const height = Math.max(window.innerHeight, viewportHeight);
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    };

    setAppHeight();
    window.addEventListener("resize", setAppHeight);
    window.visualViewport?.addEventListener("resize", setAppHeight);

    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.visualViewport?.removeEventListener("resize", setAppHeight);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentId, currentCardIndex, isFlipped, cards, history }));
  }, [currentId, currentCardIndex, isFlipped, cards, history]);

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

  const drawCard = () => {
    if (isDrawing || cards.length === 0) return;
    const next = chooseCard(cards, currentId, recentIds);
    const nextIndex = Math.max(0, cards.findIndex((card) => card.id === next.id));
    setIsDrawing(true);
    if (screen === "home") {
      window.setTimeout(() => setHomeFading(true), 200);
    }
    window.setTimeout(() => {
      setCurrentId(next.id);
      setCurrentCardIndex(nextIndex);
      setIsFlipped(false);
      setScreen("card");
      setHomeFading(false);
      setIsDrawing(false);
    }, screen === "home" ? 480 : 360);
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
    const executedAt = new Date().toLocaleDateString("sv-SE");
    setHistory((items) => [
      { id: currentCard.id, ja: currentCard.ja, en: currentCard.en, executedAt },
      ...items
    ].slice(0, 50));
  };

  const reset = () => {
    setCurrentId(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setHistory([]);
    setScreen("home");
    setModal(null);
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
      setScreen("home");
    }
  };

  return (
    <main className="app">
      {screen === "home" && (
        <HomeScreen
          isDrawing={isDrawing}
          isFading={homeFading}
          drawCard={drawCard}
          goAdd={() => setScreen("add")}
          openHistory={() => setModal("history")}
          openHowTo={() => setModal("howto")}
          goHome={() => setScreen("home")}
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
          goHome={() => setScreen("home")}
          openHistory={() => setModal("history")}
          openHowTo={() => setModal("howto")}
        />
      )}

      {screen === "add" && (
        <AddScreen
          cards={cards}
          addCard={addCard}
          updateCard={updateCard}
          deleteCard={deleteCard}
          goHome={() => setScreen("home")}
        />
      )}

      {modal && (
        <Modal title={modalTitle(modal)} close={() => setModal(null)}>
          {modal === "history" && <HistoryList history={history} />}
          {modal === "howto" && <HowTo />}
        </Modal>
      )}
    </main>
  );
}

function modalTitle(modal) {
  return { history: "履歴", howto: "遊び方" }[modal];
}

function HomeScreen({ isDrawing, isFading, drawCard, goAdd, openHistory, goHome, openHowTo }) {
  return (
    <section className={`home-screen ${isFading ? "fade-out" : ""}`} aria-label="ホーム">
      <div className="home-actions">
        <button className="home-main-button draw-button pressable" aria-label="カードを引く" onClick={drawCard} disabled={isDrawing}>
          <IconCards className="button-icon" size={34} stroke={2.2} aria-hidden="true" />
          カードを引く
        </button>
        <button className="home-main-button add-button pressable" aria-label="カードを追加" onClick={goAdd}>
          <Plus size={30} strokeWidth={3} />
          カードを追加
        </button>
      </div>
      <nav className="home-bottom-nav" aria-label="ホーム下部ナビゲーション">
        <button className="pressable" onClick={openHistory}>
          <span><History size={34} /></span>
          履歴を見る
        </button>
        <button className="pressable" onClick={goHome}>
          <span><House size={34} /></span>
          ホーム
        </button>
        <button className="pressable" onClick={openHowTo}>
          <span><CircleHelp size={34} /></span>
          遊び方
        </button>
      </nav>
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
  const [touchStartX, setTouchStartX] = useState(null);
  const [slideDirection, setSlideDirection] = useState("");

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

  const moveCard = (direction) => {
    if (cards.length < 2) return;
    setSlideDirection(direction > 0 ? "slide-next" : "slide-prev");
    selectCardIndex(currentCardIndex + direction);
    window.setTimeout(() => setSlideDirection(""), 260);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null || cards.length < 2 || isFlipped) {
      setTouchStartX(null);
      return;
    }
    const diff = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 42) {
      moveCard(diff < 0 ? 1 : -1);
    }
    setTouchStartX(null);
  };

  return (
    <section className="screen-shell card-shell picker-shell">
      <TopBar goHome={goHome} />
      <button className="card-top-button card-back-button" onClick={goHome} aria-label="ホームに戻る">
        <ChevronLeft size={42} strokeWidth={3.2} />
      </button>
      <button className="card-top-button card-history-button" onClick={openHistory} aria-label="履歴を見る">
        <History size={34} strokeWidth={2.7} />
      </button>

      <button className="picker-arrow picker-arrow-left" onClick={() => moveCard(-1)} aria-label="前のカード">
        <ChevronLeft size={38} strokeWidth={3.2} />
      </button>
      <button className="picker-arrow picker-arrow-right" onClick={() => moveCard(1)} aria-label="次のカード">
        <ChevronRight size={38} strokeWidth={3.2} />
      </button>

      <div
        className={`flip-card ${isFlipped ? "is-flipped" : ""} ${slideDirection}`}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "選ばれたお題カード" : "タップでカードをめくる"}
        onClick={flipCurrentCard}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !isFlipped) {
            event.preventDefault();
            flipCard();
          }
        }}
        onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flip-card-inner">
          <section className="card-back-face">
            <span className="back-motif back-motif-birds">⌒⌒</span>
            <span className="back-motif back-motif-ring" />
            <span className="back-motif back-motif-firework" />
            <span className="back-motif back-motif-bottle" />
            <strong>タップでめくる</strong>
          </section>

          <section key={card.id} className={`big-card card-front-face ${densityClass} ${isDrawing ? "leaving" : ""}`}>
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
              <Plus size={18} strokeWidth={3} />
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
      <button onClick={goHome}>この夏、私たちは、</button>
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
