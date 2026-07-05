import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Package, ShoppingCart, Users, Route, Warehouse, Wrench,
  ScanSearch, ShieldAlert, Timer, Tags, FileText, MessageSquare, Boxes,
  Leaf, ArrowRight, Play, Globe,
} from "lucide-react";

// ВСТАВЬ СЮДА ID своего YouTube-ролика (часть после watch?v= или youtu.be/).
// Пример: из https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  YT_ID = "dQw4w9WgXcQ"
const YT_ID = "uCftzNo4RRs";

const INK = "#101826";
const ACCENT = "#0d7a68";
const AMBER = "#d98e2b";

// ---- палитра, шрифты и анимации лендинга (наследуют идентичность приложения) ----
const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap");

.lp { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #dfe6ee; background: #0a1420;
      overflow-x: hidden; }
.lp-display { font-family: Sora, Inter, sans-serif; }
.lp-num { font-family: Sora, Inter, sans-serif; font-feature-settings: "tnum"; }
.lp-eyebrow { font-family: Sora, sans-serif; letter-spacing: 0.22em; text-transform: uppercase;
              font-size: 11px; font-weight: 700; }

/* атмосферный движущийся градиент hero */
@keyframes lpGrad {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.lp-hero-bg {
  background: radial-gradient(1200px 700px at 15% 10%, rgba(13,122,104,0.16), transparent 60%),
              radial-gradient(1000px 600px at 85% 30%, rgba(217,142,43,0.10), transparent 55%),
              linear-gradient(135deg, #081019, #0a1420 40%, #0d1826);
  background-size: 180% 180%;
  animation: lpGrad 22s ease-in-out infinite;
}

/* импульсы, бегущие по рёбрам графа цепочки */
@keyframes lpFlow { to { stroke-dashoffset: -18; } }
.lp-edge { stroke: rgba(120,150,170,0.25); stroke-width: 1; }
.lp-flow { stroke: ${ACCENT}; stroke-width: 1.6; stroke-dasharray: 3 15;
           animation: lpFlow 1.1s linear infinite; }
@keyframes lpNodePulse {
  0%,100% { transform: scale(1);   opacity: 0.9; }
  50%     { transform: scale(1.18); opacity: 1; }
}
.lp-node { transform-box: fill-box; transform-origin: center;
           animation: lpNodePulse 3.2s ease-in-out infinite; }

/* появление по скроллу */
.reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.2,.7,.2,1),
          transform .7s cubic-bezier(.2,.7,.2,1); }
.reveal.in { opacity: 1; transform: none; }

/* плавающие карточки модулей в hero */
@keyframes lpFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
.lp-chip { animation: lpFloat 5s ease-in-out infinite; }

/* мягкое мерцание акцентной точки */
@keyframes lpBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
.lp-blink { animation: lpBlink 2.4s ease-in-out infinite; }

.lp-btn { transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
.lp-btn:hover { transform: translateY(-2px); }

.lp-card { transition: transform .3s cubic-bezier(.2,.7,.2,1), border-color .3s, background .3s; }
.lp-card:hover { transform: translateY(-6px); border-color: rgba(13,122,104,0.55);
                 background: rgba(16,26,40,0.9); }

@media (prefers-reduced-motion: reduce) {
  .lp-hero-bg, .lp-flow, .lp-node, .lp-chip, .lp-blink { animation: none !important; }
  .reveal { opacity: 1; transform: none; transition: none; }
}
`;

// хук scroll-reveal: помечает элементы классом .in при входе в вьюпорт
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.14 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// анимированный SVG-граф цепочки: узлы-модули, соединённые потоками
function SupplyGraph() {
  // координаты узлов (viewBox 0 0 520 300), порядок = конвейер платформы
  const nodes = [
    { x: 60,  y: 150, ic: TrendingUp,   c: ACCENT },
    { x: 150, y: 80,  ic: Package,      c: "#3b6ea5" },
    { x: 150, y: 220, ic: ShoppingCart, c: "#6b5ca5" },
    { x: 260, y: 150, ic: Users,        c: AMBER },
    { x: 370, y: 80,  ic: Route,        c: ACCENT },
    { x: 370, y: 220, ic: ShieldAlert,  c: "#c2452f" },
    { x: 460, y: 150, ic: Leaf,         c: "#4c9a6a" },
  ];
  const edges = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[4,6],[5,6]];
  return (
    <svg viewBox="0 0 520 300" className="w-full h-full" style={{ maxHeight: 340 }}>
      {edges.map(([a, b], i) => (
        <g key={i}>
          <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} className="lp-edge" />
          <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} className="lp-flow"
                style={{ animationDelay: (i * 0.13) + "s" }} />
        </g>
      ))}
      {nodes.map((n, i) => {
        const Ic = n.ic;
        return (
          <g key={i} className="lp-node" style={{ animationDelay: (i * 0.45) + "s" }}>
            <circle cx={n.x} cy={n.y} r="20" fill="#0d1826" stroke={n.c} strokeWidth="1.6" />
            <circle cx={n.x} cy={n.y} r="20" fill={n.c} fillOpacity="0.12" />
            <foreignObject x={n.x - 10} y={n.y - 10} width="20" height="20">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Ic size={13} color={n.c} />
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

const MODULES = [
  { code: "SC-01", ic: TrendingUp,   en: "Demand forecast",     ru: "Прогноз спроса" },
  { code: "SC-02", ic: Package,      en: "Inventory",           ru: "Запасы" },
  { code: "SC-03", ic: ShoppingCart, en: "Procurement",         ru: "Закупки" },
  { code: "SC-04", ic: Users,        en: "Supplier scoring",    ru: "Поставщики" },
  { code: "SC-05", ic: Route,        en: "Routing",             ru: "Маршруты" },
  { code: "SC-06", ic: Warehouse,    en: "Warehouse",           ru: "Склад" },
  { code: "SC-07", ic: Wrench,       en: "Maintenance",         ru: "Обслуживание" },
  { code: "SC-08", ic: ScanSearch,   en: "Quality",             ru: "Качество" },
  { code: "SC-09", ic: ShieldAlert,  en: "Risk",                ru: "Риски" },
  { code: "SC-10", ic: Timer,        en: "ETA",                 ru: "Прогноз ETA" },
  { code: "SC-11", ic: Tags,         en: "Classification",      ru: "Классификация" },
  { code: "SC-12", ic: FileText,     en: "Invoice OCR",         ru: "OCR счетов" },
  { code: "SC-13", ic: MessageSquare,en: "AI assistant",        ru: "AI-ассистент" },
  { code: "SC-14", ic: Boxes,        en: "Packing",             ru: "Упаковка" },
  { code: "SC-15", ic: Leaf,         en: "Sustainability",      ru: "Устойчивость" },
];

export default function Landing() {
  useReveal();
  const [lang, setLang] = useState("ru");
  const T = {
    ru: {
      nav_demo: "Открыть платформу",
      hero_eyebrow: "Supply Chain Intelligence · 15 модулей",
      hero_h: "Аналитика цепочки поставок,\nкоторая связана в единый контур",
      hero_p: "Пятнадцать модулей — от прогноза спроса до углеродного учёта — работают не поодиночке, а как конвейер: спрос питает запасы, запасы — закупки, риск поставщика входит в реестр рисков, маршрут — в расчёт ETA и CO₂. Три языка. Три AI-функции на модели Claude.",
      hero_cta: "Открыть платформу",
      hero_watch: "Смотреть промо",
      prob_eyebrow: "Проблема",
      prob_h: "Планирование живёт в Excel и разрозненных калькуляторах",
      prob_p: "Прогноз в одной таблице, запасы в другой, риски — в голове у менеджера. Данные не перетекают, решения принимаются вслепую, а дорогие SaaS-платформы вроде o9 или Kinaxis стоят сотни тысяч в год, не знают азербайджанского и не учитывают местную специфику — VÖEN, манат, коридоры Среднего Коридора.",
      sol_eyebrow: "Решение",
      sol_h: "Единая шина данных вместо пятнадцати островов",
      sol_p: "В основе — общий слой состояния: один портфель SKU, один пул поставщиков, один набор перевозок. Включаешь связку — и модуль берёт данные соседнего вместо ручного ввода. Это превращает набор калькуляторов в связную историю продукта.",
      mod_eyebrow: "Модули",
      mod_h: "Пятнадцать инструментов, один конвейер",
      mod_p: "Каждый модуль решает свою задачу и отдаёт результат дальше по цепи.",
      vid_eyebrow: "Промо",
      vid_h: "Как это работает",
      vid_p: "Двухминутный обзор платформы.",
      link_eyebrow: "Связность",
      link_h: "Данные текут по цепочке",
      link_p: "SC-01 → SC-02 → SC-03. Оценка поставщика SC-04 входит строкой в реестр рисков SC-09. Дистанция маршрута SC-05 питает ETA SC-10 и углеродный след SC-15. Backtest, Monte-Carlo, логнормальные квантили, арифметическая валидация счетов — под капотом настоящие алгоритмы, а не заглушки.",
      cta_h: "Посмотреть платформу в работе",
      cta_p: "Пятнадцать модулей доступны сразу, без регистрации.",
      cta_btn: "Открыть платформу",
      foot: "Supply chain intelligence · RU / EN / AZ",
    },
    en: {
      nav_demo: "Open platform",
      hero_eyebrow: "Supply Chain Intelligence · 15 modules",
      hero_h: "Supply chain analytics,\nwired into a single loop",
      hero_p: "Fifteen modules — from demand forecasting to carbon accounting — don't work in isolation. They form a pipeline: demand feeds inventory, inventory feeds procurement, supplier risk enters the risk register, route distance drives ETA and CO₂. Three languages. Three AI features on Claude.",
      hero_cta: "Open platform",
      hero_watch: "Watch promo",
      prob_eyebrow: "Problem",
      prob_h: "Planning lives in Excel and disconnected calculators",
      prob_p: "Forecast in one sheet, inventory in another, risk in the manager's head. Data doesn't flow, decisions are made blind, and enterprise SaaS like o9 or Kinaxis costs hundreds of thousands a year, speaks no Azerbaijani, and ignores local specifics — VÖEN, manat, Middle Corridor routes.",
      sol_eyebrow: "Solution",
      sol_h: "One data bus instead of fifteen islands",
      sol_p: "At the core: a shared state layer — one SKU portfolio, one supplier pool, one shipment set. Toggle a link and a module pulls its neighbour's data instead of manual input. This turns a set of calculators into a coherent product story.",
      mod_eyebrow: "Modules",
      mod_h: "Fifteen tools, one pipeline",
      mod_p: "Each module solves its task and passes the result down the chain.",
      vid_eyebrow: "Promo",
      vid_h: "How it works",
      vid_p: "A two-minute platform overview.",
      link_eyebrow: "Connectivity",
      link_h: "Data flows down the chain",
      link_p: "SC-01 → SC-02 → SC-03. Supplier score SC-04 enters the risk register SC-09 as a row. Route distance SC-05 feeds ETA SC-10 and carbon footprint SC-15. Backtest, Monte-Carlo, log-normal quantiles, arithmetic invoice validation — real algorithms under the hood, not stubs.",
      cta_h: "See the platform in action",
      cta_p: "Fifteen modules available instantly, no sign-up.",
      cta_btn: "Open platform",
      foot: "Supply chain intelligence · RU / EN / AZ",
    },
  };
  const t = T[lang];
  const heroLines = t.hero_h.split("\n");

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* ---------- nav ---------- */}
      <header className="fixed top-0 inset-x-0 z-50" style={{ background: "rgba(10,20,32,0.72)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(120,150,170,0.12)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
            <Boxes size={17} color="#fff" />
          </div>
          <div className="lp-display font-bold text-white">ChainSense</div>
          <div className="lp-eyebrow ml-1 hidden sm:block" style={{ color: "#5f7285" }}>SUPPLY AI</div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 mr-1">
              {["ru", "en"].map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className="lp-btn rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase"
                  style={lang === l ? { background: "#fff", color: INK } : { background: "rgba(255,255,255,0.06)", color: "#9fb0c0" }}>
                  {l}
                </button>))}
            </div>
            <Link to="/app"
              className="lp-btn inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: ACCENT, color: "#fff", boxShadow: "0 6px 20px rgba(13,122,104,0.35)" }}>
              {t.nav_demo} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="lp-hero-bg relative pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="lp-eyebrow mb-5 inline-flex items-center gap-2" style={{ color: ACCENT }}>
              <span className="lp-blink inline-block w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
              {t.hero_eyebrow}
            </div>
            <h1 className="lp-display font-extrabold leading-[1.08] mb-6"
                style={{ fontSize: "clamp(2rem, 4.6vw, 3.4rem)", color: "#f4f8fb" }}>
              {heroLines.map((ln, i) => (
                <span key={i} className="block reveal" style={{ transitionDelay: (i * 0.12) + "s" }}>{ln}</span>
              ))}
            </h1>
            <p className="reveal text-base leading-relaxed mb-8" style={{ color: "#aebccb", maxWidth: 560, transitionDelay: ".24s" }}>
              {t.hero_p}
            </p>
            <div className="reveal flex flex-wrap gap-3" style={{ transitionDelay: ".34s" }}>
              <Link to="/app"
                className="lp-btn inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                style={{ background: ACCENT, color: "#fff", boxShadow: "0 10px 30px rgba(13,122,104,0.4)" }}>
                {t.hero_cta} <ArrowRight size={16} />
              </Link>
              <a href="#promo"
                className="lp-btn inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.06)", color: "#dfe6ee", border: "1px solid rgba(120,150,170,0.25)" }}>
                <Play size={15} /> {t.hero_watch}
              </a>
            </div>
          </div>

          {/* signature: живой граф цепочки */}
          <div className="reveal relative" style={{ transitionDelay: ".2s" }}>
            <div className="rounded-3xl p-6" style={{ background: "rgba(13,24,38,0.6)", border: "1px solid rgba(120,150,170,0.18)", backdropFilter: "blur(6px)" }}>
              <SupplyGraph />
            </div>
            {/* плавающие подписи-модули поверх */}
            <div className="lp-chip absolute -top-3 -left-3 rounded-xl px-3 py-1.5 text-xs font-semibold lp-num"
                 style={{ background: INK, color: ACCENT, border: "1px solid " + ACCENT + "55", animationDelay: "0s" }}>
              SC-01 · forecast
            </div>
            <div className="lp-chip absolute -bottom-3 right-6 rounded-xl px-3 py-1.5 text-xs font-semibold lp-num"
                 style={{ background: INK, color: AMBER, border: "1px solid " + AMBER + "55", animationDelay: "1.6s" }}>
              SC-09 · risk
            </div>
          </div>
        </div>
      </section>

      {/* ---------- problem / solution ---------- */}
      <section className="px-6 py-20" style={{ background: "#081019" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="reveal rounded-3xl p-8" style={{ background: "rgba(194,69,47,0.06)", border: "1px solid rgba(194,69,47,0.22)" }}>
            <div className="lp-eyebrow mb-3" style={{ color: "#e08a78" }}>{t.prob_eyebrow}</div>
            <h2 className="lp-display font-bold text-2xl mb-4" style={{ color: "#f4f8fb" }}>{t.prob_h}</h2>
            <p className="leading-relaxed" style={{ color: "#a9b8c7" }}>{t.prob_p}</p>
          </div>
          <div className="reveal rounded-3xl p-8" style={{ background: "rgba(13,122,104,0.07)", border: "1px solid rgba(13,122,104,0.3)", transitionDelay: ".12s" }}>
            <div className="lp-eyebrow mb-3" style={{ color: "#5cc4b0" }}>{t.sol_eyebrow}</div>
            <h2 className="lp-display font-bold text-2xl mb-4" style={{ color: "#f4f8fb" }}>{t.sol_h}</h2>
            <p className="leading-relaxed" style={{ color: "#a9b8c7" }}>{t.sol_p}</p>
          </div>
        </div>
      </section>

      {/* ---------- modules grid ---------- */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-12 text-center">
            <div className="lp-eyebrow mb-3" style={{ color: ACCENT }}>{t.mod_eyebrow}</div>
            <h2 className="lp-display font-bold mb-3" style={{ fontSize: "clamp(1.6rem,3.4vw,2.4rem)", color: "#f4f8fb" }}>{t.mod_h}</h2>
            <p style={{ color: "#8ea0b1", maxWidth: 520, margin: "0 auto" }}>{t.mod_p}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MODULES.map((m, i) => {
              const Ic = m.ic;
              return (
                <div key={m.code} className="reveal lp-card rounded-2xl p-4"
                     style={{ background: "rgba(16,26,40,0.55)", border: "1px solid rgba(120,150,170,0.16)",
                              transitionDelay: (i * 0.035) + "s" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                         style={{ background: "rgba(13,122,104,0.14)" }}>
                      <Ic size={16} color={ACCENT} />
                    </div>
                    <span className="lp-num text-xs font-bold" style={{ color: "#5f7285" }}>{m.code}</span>
                  </div>
                  <div className="lp-display font-semibold text-sm" style={{ color: "#e6edf4" }}>{m[lang]}</div>
                </div>);
            })}
          </div>
        </div>
      </section>

      {/* ---------- promo video ---------- */}
      <section id="promo" className="px-6 py-24" style={{ background: "#081019" }}>
        <div className="max-w-4xl mx-auto">
          <div className="reveal mb-10 text-center">
            <div className="lp-eyebrow mb-3" style={{ color: AMBER }}>{t.vid_eyebrow}</div>
            <h2 className="lp-display font-bold mb-3" style={{ fontSize: "clamp(1.6rem,3.4vw,2.4rem)", color: "#f4f8fb" }}>{t.vid_h}</h2>
            <p style={{ color: "#8ea0b1" }}>{t.vid_p}</p>
          </div>
          <div className="reveal rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(120,150,170,0.2)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", transitionDelay: ".1s" }}>
            <div style={{ position: "relative", paddingTop: "56.25%", background: "#0a1420" }}>
              {YT_ID === "REPLACE_WITH_YOUTUBE_ID" ? (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 24 }}>
                  <Play size={40} color={AMBER} />
                  <div className="lp-display font-semibold" style={{ color: "#dfe6ee" }}>
                    {lang === "ru" ? "Место для промо-ролика" : "Promo video placeholder"}
                  </div>
                  <div className="text-sm" style={{ color: "#7c8ea0", maxWidth: 360 }}>
                    {lang === "ru"
                      ? "Вставь ID ролика в переменную YT_ID в начале файла Landing.jsx"
                      : "Set your video ID in the YT_ID variable at the top of Landing.jsx"}
                  </div>
                </div>
              ) : (
                <iframe
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  src={"https://www.youtube-nocookie.com/embed/" + YT_ID}
                  title="ChainSense promo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- connectivity ---------- */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <div className="lp-eyebrow mb-3" style={{ color: ACCENT }}>{t.link_eyebrow}</div>
            <h2 className="lp-display font-bold mb-5" style={{ fontSize: "clamp(1.6rem,3.4vw,2.4rem)", color: "#f4f8fb" }}>{t.link_h}</h2>
            <p className="leading-relaxed" style={{ color: "#a9b8c7" }}>{t.link_p}</p>
          </div>
          <div className="reveal" style={{ transitionDelay: ".12s" }}>
            <div className="rounded-3xl p-8 space-y-4" style={{ background: "rgba(13,24,38,0.55)", border: "1px solid rgba(120,150,170,0.18)" }}>
              {[
                { a: "SC-01", b: "SC-02", l: lang === "ru" ? "спрос → запасы" : "demand → inventory" },
                { a: "SC-02", b: "SC-03", l: lang === "ru" ? "запасы → закупки" : "inventory → procurement" },
                { a: "SC-04", b: "SC-09", l: lang === "ru" ? "поставщик → риск" : "supplier → risk" },
                { a: "SC-05", b: "SC-10", l: lang === "ru" ? "маршрут → ETA" : "route → ETA" },
                { a: "SC-05", b: "SC-15", l: lang === "ru" ? "маршрут → CO₂" : "route → CO₂" },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="lp-num text-xs font-bold rounded-lg px-2.5 py-1" style={{ background: "rgba(13,122,104,0.16)", color: "#5cc4b0" }}>{row.a}</span>
                  <ArrowRight size={14} color="#5f7285" />
                  <span className="lp-num text-xs font-bold rounded-lg px-2.5 py-1" style={{ background: "rgba(217,142,43,0.14)", color: "#e0a860" }}>{row.b}</span>
                  <span className="text-sm ml-1" style={{ color: "#8ea0b1" }}>{row.l}</span>
                </div>))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section className="px-6 py-28 lp-hero-bg">
        <div className="max-w-3xl mx-auto text-center reveal">
          <h2 className="lp-display font-extrabold mb-4" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", color: "#f4f8fb" }}>{t.cta_h}</h2>
          <p className="mb-8 text-lg" style={{ color: "#aebccb" }}>{t.cta_p}</p>
          <Link to="/app"
            className="lp-btn inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold"
            style={{ background: ACCENT, color: "#fff", boxShadow: "0 14px 40px rgba(13,122,104,0.45)" }}>
            {t.cta_btn} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="px-6 py-10" style={{ background: "#070e16", borderTop: "1px solid rgba(120,150,170,0.12)" }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
            <Boxes size={14} color="#fff" />
          </div>
          <span className="lp-display font-bold text-white">ChainSense</span>
          <span className="text-sm ml-2" style={{ color: "#5f7285" }}>{t.foot}</span>
          <Link to="/app" className="ml-auto text-sm lp-btn inline-flex items-center gap-1.5" style={{ color: ACCENT }}>
            <Globe size={14} /> {t.nav_demo}
          </Link>
        </div>
      </footer>
    </div>
  );
}
