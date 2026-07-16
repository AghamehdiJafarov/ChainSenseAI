import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Package, ShoppingCart, Users, Route, Warehouse, Wrench,
  ScanSearch, ShieldAlert, Timer, Tags, FileText, MessageSquare, Boxes,
  Leaf, ArrowRight, Play, Globe, Download,
} from "lucide-react";

// ВСТАВЬ СЮДА ID своего YouTube-ролика (часть после watch?v= или youtu.be/).
const YT_ID = "uCftzNo4RRs";

/* ---- Meridian tokens (dark landing) ---- */
const JADE = "#2EC29B";        // brand accent on dark
const JADE_BTN = "#12886C";    // button fill
const BRASS = "#D9B36C";       // counterpoint — risk semantics only
const INK = "#0A100E";         // page base
const PANEL = "#0D1512";       // raised dark surface
const LINE = "rgba(160,176,167,0.14)";
const TXT = "#DFE8E2";
const MUT = "#9DABA3";
const FAINT = "#5F6F67";

const CSS = `
.lp { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: ${TXT}; background: ${INK};
      overflow-x: hidden; font-size: 15px; }
.lp-display { font-family: 'Schibsted Grotesk', Inter, sans-serif; letter-spacing: -0.028em; }
.lp-num { font-family: 'Spline Sans Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
.lp-eyebrow { font-family: 'Spline Sans Mono', ui-monospace, monospace; letter-spacing: 0.16em;
              text-transform: uppercase; font-size: 10.5px; font-weight: 600; }

/* engineering-paper grid over the hero — the platform's drawing board */
.lp-hero-bg {
  background:
    radial-gradient(1100px 640px at 12% -10%, rgba(46,194,155,0.075), transparent 60%),
    radial-gradient(900px 560px at 96% 24%, rgba(217,179,108,0.045), transparent 55%),
    linear-gradient(180deg, #0A110F 0%, ${INK} 70%);
}
.lp-grid {
  background-image:
    linear-gradient(rgba(157,171,163,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(157,171,163,0.05) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(900px 520px at 40% 20%, black, transparent 78%);
  -webkit-mask-image: radial-gradient(900px 520px at 40% 20%, black, transparent 78%);
}

/* meridian rail: section marker */
.lp-rail { display:flex; align-items:center; gap:12px; }
.lp-rail::after { content:""; flex:0 0 56px; height:1px; background:linear-gradient(90deg, rgba(46,194,155,0.5), transparent); }
.lp-diamond { width:7px; height:7px; transform:rotate(45deg); background:${JADE}; flex-shrink:0; }

/* pulses running along the chain graph */
@keyframes lpFlow { to { stroke-dashoffset: -20; } }
.lp-edge { stroke: rgba(157,171,163,0.16); stroke-width: 1; }
.lp-flow { stroke: ${JADE}; stroke-width: 1.2; stroke-dasharray: 2 18; opacity:.9;
           animation: lpFlow 1.6s linear infinite; }
@keyframes lpNodePulse {
  0%,100% { transform: scale(1);   opacity: 0.92; }
  50%     { transform: scale(1.12); opacity: 1; }
}
.lp-node { transform-box: fill-box; transform-origin: center;
           animation: lpNodePulse 3.6s ease-in-out infinite; }

/* scroll reveal */
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.2,.7,.2,1),
          transform .7s cubic-bezier(.2,.7,.2,1); }
.reveal.in { opacity: 1; transform: none; }

@keyframes lpBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.lp-blink { animation: lpBlink 2.6s ease-in-out infinite; }

.lp-btn { transition: transform .16s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease; }
.lp-btn:hover { transform: translateY(-2px); }
.lp-btn-primary { background:${JADE_BTN}; color:#fff; border:1px solid rgba(46,194,155,0.45);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 24px rgba(18,136,108,0.32); }
.lp-btn-primary:hover { background:#13977A; box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 12px 32px rgba(18,136,108,0.42); }
.lp-btn-ghost { background:rgba(255,255,255,0.04); color:${TXT}; border:1px solid ${LINE}; }
.lp-btn-ghost:hover { border-color:rgba(160,176,167,0.32); background:rgba(255,255,255,0.06); }

.lp-card { transition: transform .3s cubic-bezier(.2,.7,.2,1), border-color .3s, background .3s, box-shadow .3s; }
.lp-card:hover { transform: translateY(-4px); border-color: rgba(46,194,155,0.4);
                 background: #101A16; box-shadow: 0 16px 40px -12px rgba(0,0,0,0.5); }
.lp-card:hover .lp-card-node { background:${JADE}; border-color:${JADE}; }
.lp-card:hover .lp-card-ic { color:${JADE}; }

/* corner ticks on framed media */
.lp-frame { position: relative; }
.lp-tick { position:absolute; width:14px; height:14px; border-color:rgba(46,194,155,0.55); border-style:solid; }
.lp-tick.tl { top:-1px; left:-1px; border-width:1.5px 0 0 1.5px; }
.lp-tick.tr { top:-1px; right:-1px; border-width:1.5px 1.5px 0 0; }
.lp-tick.bl { bottom:-1px; left:-1px; border-width:0 0 1.5px 1.5px; }
.lp-tick.br { bottom:-1px; right:-1px; border-width:0 1.5px 1.5px 0; }

.lp a:focus-visible, .lp button:focus-visible { outline:2px solid ${JADE}; outline-offset:3px; border-radius:6px; }

@media (prefers-reduced-motion: reduce) {
  .lp-flow, .lp-node, .lp-blink { animation: none !important; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .lp-btn, .lp-card { transition: none; }
}
`;

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

/* Живой контур цепочки: станции-ромбы, соединённые потоками.
   Один цвет — jade; латунь только у узла риска. */
function SupplyGraph() {
  const nodes = [
    { x: 58,  y: 158, ic: TrendingUp,   code: "SC-01" },
    { x: 158, y: 84,  ic: Package,      code: "SC-02" },
    { x: 158, y: 232, ic: ShoppingCart, code: "SC-03" },
    { x: 262, y: 158, ic: Users,        code: "SC-04" },
    { x: 366, y: 84,  ic: Route,        code: "SC-05" },
    { x: 366, y: 232, ic: ShieldAlert,  code: "SC-09", brass: true },
    { x: 464, y: 158, ic: Leaf,         code: "SC-15" },
  ];
  const edges = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[4,6],[5,6]];
  const D = 21; // half-diagonal of the diamond
  return (
    <svg viewBox="0 0 520 300" className="w-full h-full" style={{ maxHeight: 330 }}>
      {edges.map(([a, b], i) => (
        <g key={i}>
          <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} className="lp-edge" />
          <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} className="lp-flow"
                style={{ animationDelay: (i * 0.18) + "s" }} />
        </g>
      ))}
      {nodes.map((n, i) => {
        const Ic = n.ic;
        const c = n.brass ? BRASS : JADE;
        return (
          <g key={i} className="lp-node" style={{ animationDelay: (i * 0.5) + "s" }}>
            <rect x={n.x - D * 0.72} y={n.y - D * 0.72} width={D * 1.44} height={D * 1.44} rx="4"
                  transform={`rotate(45 ${n.x} ${n.y})`}
                  fill={PANEL} stroke={c} strokeWidth="1.3" />
            <rect x={n.x - D * 0.72} y={n.y - D * 0.72} width={D * 1.44} height={D * 1.44} rx="4"
                  transform={`rotate(45 ${n.x} ${n.y})`}
                  fill={c} fillOpacity="0.08" />
            <foreignObject x={n.x - 9} y={n.y - 9} width="18" height="18">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Ic size={12.5} color={c} />
              </div>
            </foreignObject>
            <text x={n.x} y={n.y + 36} textAnchor="middle" fill={FAINT} fontSize="8"
                  style={{ fontFamily: "'Spline Sans Mono', monospace", letterSpacing: "0.08em" }}>
              {n.code}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const MODULES = [
  { code: "SC-01", ic: TrendingUp,   en: "Demand forecast",     ru: "Прогноз спроса",   az: "Tələb proqnozu" },
  { code: "SC-02", ic: Package,      en: "Inventory",           ru: "Запасы",           az: "Ehtiyat" },
  { code: "SC-03", ic: ShoppingCart, en: "Procurement",         ru: "Закупки",          az: "Satınalma" },
  { code: "SC-04", ic: Users,        en: "Supplier scoring",    ru: "Поставщики",       az: "Təchizatçı qiyməti" },
  { code: "SC-05", ic: Route,        en: "Routing",             ru: "Маршруты",         az: "Marşrut" },
  { code: "SC-06", ic: Warehouse,    en: "Warehouse",           ru: "Склад",            az: "Anbar" },
  { code: "SC-07", ic: Wrench,       en: "Maintenance",         ru: "Обслуживание",     az: "Texniki xidmət" },
  { code: "SC-08", ic: ScanSearch,   en: "Quality",             ru: "Качество",         az: "Keyfiyyət" },
  { code: "SC-09", ic: ShieldAlert,  en: "Risk",                ru: "Риски",            az: "Risk" },
  { code: "SC-10", ic: Timer,        en: "ETA",                 ru: "Прогноз ETA",      az: "ETA proqnozu" },
  { code: "SC-11", ic: Tags,         en: "Classification",      ru: "Классификация",    az: "Təsnifat" },
  { code: "SC-12", ic: FileText,     en: "Invoice OCR",         ru: "OCR счетов",       az: "Sənədlər və OCR" },
  { code: "SC-13", ic: MessageSquare,en: "AI assistant",        ru: "AI-ассистент",     az: "AI köməkçi" },
  { code: "SC-14", ic: Boxes,        en: "Packing",             ru: "Упаковка",         az: "Qablaşdırma" },
  { code: "SC-15", ic: Leaf,         en: "Sustainability",      ru: "Устойчивость",     az: "Dayanıqlıq" },
];

/* факты платформы — вынесены из hero-текста в тихую доказательную полосу */
const PROOF = {
  ru: [["15", "модулей в одном контуре"], ["03", "языка · RU EN AZ"], ["SC-01→15", "данные текут по конвейеру"], ["Claude", "три AI-функции внутри"]],
  en: [["15", "modules, one loop"], ["03", "languages · RU EN AZ"], ["SC-01→15", "data flows down the pipeline"], ["Claude", "three AI features inside"]],
  az: [["15", "modul vahid konturda"], ["03", "dil · RU EN AZ"], ["SC-01→15", "data konveyer üzrə axır"], ["Claude", "üç AI funksiyası daxildə"]],
};

export default function Landing() {
  useReveal();
  const [lang, setLang] = useState("ru");
  const T = {
    ru: {
      nav_demo: "Открыть платформу",
      nav_deck: "Скачать презентацию",
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
      deck_eyebrow: "Презентация",
      deck_h: "Полный обзор в одном файле",
      deck_p: "Пятнадцать модулей, алгоритмы и интерфейс на трёх языках — в PDF-презентации.",
      deck_btn: "Скачать презентацию (PDF)",
      foot: "Supply chain intelligence · RU / EN / AZ",
      live: "Живой контур",
    },
    en: {
      nav_demo: "Open platform",
      nav_deck: "Download deck",
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
      deck_eyebrow: "Deck",
      deck_h: "The full overview in one file",
      deck_p: "Fifteen modules, the algorithms, and the trilingual interface — in a PDF deck.",
      deck_btn: "Download deck (PDF)",
      foot: "Supply chain intelligence · RU / EN / AZ",
      live: "Live circuit",
    },
    az: {
      nav_demo: "Platformanı aç",
      nav_deck: "Təqdimatı yüklə",
      hero_eyebrow: "Supply Chain Intelligence · 15 modul",
      hero_h: "Təchizat zəncirinin analitikası,\nvahid kontura bağlanmış",
      hero_p: "On beş modul — tələb proqnozundan karbon uçotuna qədər — ayrı-ayrı deyil, konveyer kimi işləyir: tələb ehtiyatı qidalandırır, ehtiyat satınalmanı, təchizatçı riski risk reyestrinə daxil olur, marşrut isə ETA və CO₂ hesabına. Üç dil. Claude modelində üç AI funksiyası.",
      hero_cta: "Platformanı aç",
      hero_watch: "Promonu izlə",
      prob_eyebrow: "Problem",
      prob_h: "Planlaşdırma Excel və dağınıq kalkulyatorlarda yaşayır",
      prob_p: "Proqnoz bir cədvəldə, ehtiyat başqasında, risklər menecerin yaddaşında. Məlumat axmır, qərarlar kor-koranə verilir, o9 və ya Kinaxis kimi bahalı SaaS platformaları ildə yüz minlərlə dollar tələb edir, azərbaycan dilini bilmir və yerli spesifikanı — VÖEN, manat, Orta Dəhliz marşrutlarını — nəzərə almır.",
      sol_eyebrow: "Həll",
      sol_h: "On beş ada əvəzinə vahid data şini",
      sol_p: "Əsasında — ümumi vəziyyət təbəqəsi: bir SKU portfeli, bir təchizatçı hovuzu, bir daşıma dəsti. Bağlantını aktivləşdirirsən — və modul əl ilə daxiletmə əvəzinə qonşusunun datasını götürür. Bu, kalkulyatorlar dəstini vahid məhsul hekayəsinə çevirir.",
      mod_eyebrow: "Modullar",
      mod_h: "On beş alət, bir konveyer",
      mod_p: "Hər modul öz vəzifəsini həll edir və nəticəni zəncir üzrə ötürür.",
      vid_eyebrow: "Promo",
      vid_h: "Necə işləyir",
      vid_p: "İki dəqiqəlik platforma icmalı.",
      link_eyebrow: "Bağlılıq",
      link_h: "Məlumat zəncir üzrə axır",
      link_p: "SC-01 → SC-02 → SC-03. Təchizatçı qiyməti SC-04 risk reyestrinə SC-09 sətir kimi daxil olur. Marşrut məsafəsi SC-05 ETA SC-10 və karbon izini SC-15 qidalandırır. Backtest, Monte-Carlo, loqnormal kvantillər, hesabların arifmetik yoxlanışı — arxa planda əsl alqoritmlər, boş deyil.",
      cta_h: "Platformanı işdə görün",
      cta_p: "On beş modul dərhal əlçatandır, qeydiyyatsız.",
      cta_btn: "Platformanı aç",
      deck_eyebrow: "Təqdimat",
      deck_h: "Tam icmal bir faylda",
      deck_p: "On beş modul, alqoritmlər və üç dilli interfeys — PDF təqdimatında.",
      deck_btn: "Təqdimatı yüklə (PDF)",
      foot: "Supply chain intelligence · RU / EN / AZ",
      live: "Canlı kontur",
    },
  };
  const t = T[lang];
  const heroLines = t.hero_h.split("\n");
  const FLOWS = [
    { a: "SC-01", b: "SC-02", l: { ru: "спрос → запасы", en: "demand → inventory", az: "tələb → ehtiyat" } },
    { a: "SC-02", b: "SC-03", l: { ru: "запасы → закупки", en: "inventory → procurement", az: "ehtiyat → satınalma" } },
    { a: "SC-04", b: "SC-09", l: { ru: "поставщик → риск", en: "supplier → risk", az: "təchizatçı → risk" } },
    { a: "SC-05", b: "SC-10", l: { ru: "маршрут → ETA", en: "route → ETA", az: "marşrut → ETA" } },
    { a: "SC-05", b: "SC-15", l: { ru: "маршрут → CO₂", en: "route → CO₂", az: "marşrut → CO₂" } },
  ];

  const SectionHead = ({ eyebrow, h, p, center }) => (
    <div className={"reveal mb-12 " + (center ? "text-center" : "")}>
      <div className={"lp-rail mb-4 " + (center ? "justify-center" : "")}>
        <span className="lp-diamond" />
        <span className="lp-eyebrow" style={{ color: JADE }}>{eyebrow}</span>
      </div>
      <h2 className="lp-display font-bold mb-3"
          style={{ fontSize: "clamp(1.7rem,3.4vw,2.5rem)", color: "#F3F8F4", lineHeight: 1.12 }}>{h}</h2>
      {p && <p style={{ color: MUT, maxWidth: 560, margin: center ? "0 auto" : 0, lineHeight: 1.65 }}>{p}</p>}
    </div>
  );

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* ---------- nav ---------- */}
      <header className="fixed top-0 inset-x-0 z-50"
              style={{ background: "rgba(10,16,14,0.78)", backdropFilter: "blur(12px)",
                       borderBottom: "1px solid " + LINE }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center"
               style={{ background: "linear-gradient(135deg,#12896D,#0B6450)",
                        boxShadow: "0 0 0 1px rgba(46,194,155,0.3), 0 4px 14px rgba(18,136,108,0.35)" }}>
            <span style={{ width: 9, height: 9, transform: "rotate(45deg)", background: "#fff", display: "block" }} />
          </div>
          <div className="lp-display font-bold text-[16.5px]" style={{ color: "#F3F8F4" }}>ChainSense</div>
          <div className="lp-eyebrow ml-1 hidden sm:block" style={{ color: FAINT, fontSize: 9.5 }}>SUPPLY INTELLIGENCE</div>
          <div className="ml-auto flex items-center gap-2.5">
            <div className="flex items-center rounded-lg p-[3px] gap-[2px] mr-1"
                 style={{ background: "rgba(255,255,255,0.05)", border: "1px solid " + LINE }}>
              {["az", "ru", "en"].map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className="lp-btn lp-num rounded-[6px] px-2 py-1 text-[10px] font-semibold uppercase"
                  style={lang === l ? { background: "#F3F8F4", color: "#0F1613" }
                                    : { background: "transparent", color: MUT }}>
                  {l}
                </button>))}
            </div>
            <a href="/ChainSenseAI.pdf" download
              className="lp-btn lp-btn-ghost hidden sm:inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[13px] font-semibold"
              title={t.nav_deck}>
              <Download size={14} /> <span className="hidden md:inline">{t.nav_deck}</span>
            </a>
            <Link to="/app"
              className="lp-btn lp-btn-primary inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[13px] font-semibold">
              {t.nav_demo} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="lp-hero-bg relative pt-36 pb-20 px-6">
        <div className="lp-grid absolute inset-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative grid lg:grid-cols-[1.08fr_0.92fr] gap-14 items-center">
          <div>
            <div className="lp-rail mb-6">
              <span className="lp-diamond lp-blink" />
              <span className="lp-eyebrow" style={{ color: JADE }}>{t.hero_eyebrow}</span>
            </div>
            <h1 className="lp-display font-extrabold mb-6"
                style={{ fontSize: "clamp(2.2rem, 4.9vw, 3.7rem)", color: "#F5FAF6", lineHeight: 1.06 }}>
              {heroLines.map((ln, i) => (
                <span key={i} className="block reveal" style={{ transitionDelay: (i * 0.12) + "s" }}>{ln}</span>
              ))}
            </h1>
            <p className="reveal text-[15.5px] mb-9" style={{ color: MUT, maxWidth: 540, lineHeight: 1.7, transitionDelay: ".24s" }}>
              {t.hero_p}
            </p>
            <div className="reveal flex flex-wrap gap-3" style={{ transitionDelay: ".34s" }}>
              <Link to="/app"
                className="lp-btn lp-btn-primary inline-flex items-center gap-2 rounded-[11px] px-6 py-3 text-sm font-semibold">
                {t.hero_cta} <ArrowRight size={16} />
              </Link>
              <a href="#promo"
                className="lp-btn lp-btn-ghost inline-flex items-center gap-2 rounded-[11px] px-6 py-3 text-sm font-semibold">
                <Play size={14} /> {t.hero_watch}
              </a>
            </div>
          </div>

          {/* signature: live circuit of the chain */}
          <div className="reveal lp-frame" style={{ transitionDelay: ".2s" }}>
            <div className="rounded-2xl p-6 pt-5"
                 style={{ background: "rgba(13,21,18,0.72)", border: "1px solid " + LINE,
                          backdropFilter: "blur(6px)", boxShadow: "0 32px 80px -24px rgba(0,0,0,0.6)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="lp-diamond lp-blink" style={{ width: 5, height: 5 }} />
                <span className="lp-eyebrow" style={{ color: FAINT, fontSize: 9 }}>
                  {t.live} · SC-01 → SC-15
                </span>
              </div>
              <SupplyGraph />
            </div>
            <span className="lp-tick tl" /><span className="lp-tick tr" />
            <span className="lp-tick bl" /><span className="lp-tick br" />
          </div>
        </div>

        {/* proof strip */}
        <div className="max-w-6xl mx-auto relative mt-16 reveal">
          <div className="grid grid-cols-2 md:grid-cols-4 rounded-xl overflow-hidden"
               style={{ border: "1px solid " + LINE, background: "rgba(13,21,18,0.5)" }}>
            {PROOF[lang].map(([v, l], i) => (
              <div key={i}
                   className={"px-5 py-4 " + (i % 2 === 1 ? "border-l " : "") + (i >= 2 ? "border-t md:border-t-0 " : "") + (i > 0 ? "md:border-l" : "")}
                   style={{ borderColor: LINE.replace("0.14", "0.12") }}>
                <div className="lp-num text-[19px] font-semibold" style={{ color: "#EAF2EC" }}>{v}</div>
                <div className="text-[12px] mt-1" style={{ color: FAINT }}>{l}</div>
              </div>))}
          </div>
        </div>
      </section>

      {/* ---------- problem / solution ---------- */}
      <section className="px-6 py-24" style={{ background: "#080D0B" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5">
          <div className="reveal rounded-2xl p-9"
               style={{ background: PANEL, border: "1px solid " + LINE }}>
            <div className="lp-rail mb-4">
              <span className="lp-diamond" style={{ background: BRASS }} />
              <span className="lp-eyebrow" style={{ color: BRASS }}>{t.prob_eyebrow}</span>
            </div>
            <h2 className="lp-display font-bold text-[22px] mb-4" style={{ color: "#F3F8F4", lineHeight: 1.25 }}>{t.prob_h}</h2>
            <p className="text-[14.5px]" style={{ color: MUT, lineHeight: 1.7 }}>{t.prob_p}</p>
          </div>
          <div className="reveal rounded-2xl p-9"
               style={{ background: "linear-gradient(160deg, rgba(18,136,108,0.1), rgba(13,21,18,0.4))",
                        border: "1px solid rgba(46,194,155,0.24)", transitionDelay: ".12s" }}>
            <div className="lp-rail mb-4">
              <span className="lp-diamond" />
              <span className="lp-eyebrow" style={{ color: JADE }}>{t.sol_eyebrow}</span>
            </div>
            <h2 className="lp-display font-bold text-[22px] mb-4" style={{ color: "#F3F8F4", lineHeight: 1.25 }}>{t.sol_h}</h2>
            <p className="text-[14.5px]" style={{ color: MUT, lineHeight: 1.7 }}>{t.sol_p}</p>
          </div>
        </div>
      </section>

      {/* ---------- modules grid ---------- */}
      <section className="px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <SectionHead eyebrow={t.mod_eyebrow} h={t.mod_h} p={t.mod_p} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MODULES.map((m, i) => {
              const Ic = m.ic;
              return (
                <div key={m.code} className="reveal lp-card rounded-xl p-4"
                     style={{ background: "rgba(13,21,18,0.6)", border: "1px solid " + LINE,
                              transitionDelay: (i * 0.03) + "s" }}>
                  <div className="flex items-center justify-between mb-5">
                    <span className="lp-num text-[10px] font-semibold" style={{ color: FAINT, letterSpacing: "0.08em" }}>{m.code}</span>
                    <span className="lp-card-node" style={{ width: 6, height: 6, transform: "rotate(45deg)",
                          border: "1px solid #45524B", transition: "background .3s, border-color .3s" }} />
                  </div>
                  <Ic size={16} className="lp-card-ic" style={{ color: "#7C8B83", transition: "color .3s" }} />
                  <div className="lp-display font-semibold text-[13.5px] mt-2.5" style={{ color: "#E9F0EA", letterSpacing: "-0.01em" }}>
                    {m[lang]}
                  </div>
                </div>);
            })}
          </div>
        </div>
      </section>

      {/* ---------- promo video ---------- */}
      <section id="promo" className="px-6 py-28" style={{ background: "#080D0B" }}>
        <div className="max-w-4xl mx-auto">
          <SectionHead center eyebrow={t.vid_eyebrow} h={t.vid_h} p={t.vid_p} />
          <div className="reveal lp-frame" style={{ transitionDelay: ".1s" }}>
            <div className="rounded-2xl overflow-hidden"
                 style={{ border: "1px solid " + LINE, boxShadow: "0 40px 100px -20px rgba(0,0,0,0.65)" }}>
              <div style={{ position: "relative", paddingTop: "56.25%", background: PANEL }}>
                {YT_ID === "REPLACE_WITH_YOUTUBE_ID" ? (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 24 }}>
                    <Play size={38} color={JADE} />
                    <div className="lp-display font-semibold" style={{ color: TXT }}>
                      {{ ru: "Место для промо-ролика", en: "Promo video placeholder", az: "Promo video yeri" }[lang]}
                    </div>
                    <div className="text-sm" style={{ color: FAINT, maxWidth: 360 }}>
                      {{ ru: "Вставь ID ролика в переменную YT_ID в начале файла Landing.jsx",
                         en: "Set your video ID in the YT_ID variable at the top of Landing.jsx",
                         az: "Video ID-ni Landing.jsx faylının əvvəlindəki YT_ID dəyişəninə daxil et" }[lang]}
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
            <span className="lp-tick tl" /><span className="lp-tick tr" />
            <span className="lp-tick bl" /><span className="lp-tick br" />
          </div>
        </div>
      </section>

      {/* ---------- connectivity: meridian diagram ---------- */}
      <section className="px-6 py-28">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div className="reveal">
            <div className="lp-rail mb-4">
              <span className="lp-diamond" />
              <span className="lp-eyebrow" style={{ color: JADE }}>{t.link_eyebrow}</span>
            </div>
            <h2 className="lp-display font-bold mb-5"
                style={{ fontSize: "clamp(1.7rem,3.4vw,2.5rem)", color: "#F3F8F4", lineHeight: 1.12 }}>{t.link_h}</h2>
            <p className="text-[14.5px]" style={{ color: MUT, lineHeight: 1.7 }}>{t.link_p}</p>
          </div>
          <div className="reveal" style={{ transitionDelay: ".12s" }}>
            <div className="relative rounded-2xl px-7 py-6"
                 style={{ background: PANEL, border: "1px solid " + LINE }}>
              {/* vertical rail */}
              <div className="absolute top-7 bottom-7 pointer-events-none"
                   style={{ left: 31, width: 1, background: "linear-gradient(rgba(46,194,155,0.45), rgba(46,194,155,0.06))" }} />
              <div className="space-y-4">
                {FLOWS.map((row, i) => (
                  <div key={i} className="relative flex items-center gap-3">
                    <span className="lp-diamond relative z-10" style={{ width: 8, height: 8, marginLeft: 1 }} />
                    <span className="lp-num text-[11px] font-semibold rounded-md px-2 py-1"
                          style={{ background: "rgba(46,194,155,0.1)", color: JADE, border: "1px solid rgba(46,194,155,0.28)" }}>{row.a}</span>
                    <span className="flex-shrink-0" style={{ width: 26, height: 1,
                          background: "repeating-linear-gradient(90deg, rgba(157,171,163,0.5) 0 4px, transparent 4px 8px)" }} />
                    <span className="lp-num text-[11px] font-semibold rounded-md px-2 py-1"
                          style={{ background: "rgba(255,255,255,0.04)", color: "#CBD8CF", border: "1px solid " + LINE }}>{row.b}</span>
                    <span className="text-[12.5px] ml-1 truncate" style={{ color: FAINT }}>{row.l[lang]}</span>
                  </div>))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- deck download ---------- */}
      <section className="px-6 py-20" style={{ background: "#080D0B" }}>
        <div className="max-w-3xl mx-auto reveal">
          <div className="rounded-2xl p-8 md:p-9 flex flex-col md:flex-row md:items-center gap-6"
               style={{ background: PANEL, border: "1px solid " + LINE }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: "rgba(46,194,155,0.08)", border: "1px solid rgba(46,194,155,0.3)" }}>
              <FileText size={24} color={JADE} />
            </div>
            <div className="flex-1">
              <div className="lp-eyebrow mb-2" style={{ color: JADE }}>{t.deck_eyebrow}</div>
              <h2 className="lp-display font-bold text-[19px] mb-1.5" style={{ color: "#F3F8F4" }}>{t.deck_h}</h2>
              <p className="text-[13.5px]" style={{ color: MUT }}>{t.deck_p}</p>
            </div>
            <a href="/ChainSenseAI.pdf" download
              className="lp-btn lp-btn-primary inline-flex items-center justify-center gap-2 rounded-[11px] px-6 py-3 text-sm font-semibold flex-shrink-0">
              <Download size={15} /> {t.deck_btn}
            </a>
          </div>
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section className="px-6 py-32 relative"
               style={{ background: "radial-gradient(700px 380px at 50% 110%, rgba(18,136,108,0.16), transparent 70%), " + INK }}>
        <div className="max-w-3xl mx-auto text-center reveal">
          <div className="lp-rail justify-center mb-6" style={{ gap: 12 }}>
            <span className="lp-diamond lp-blink" />
          </div>
          <h2 className="lp-display font-extrabold mb-4"
              style={{ fontSize: "clamp(1.9rem,4.2vw,3.1rem)", color: "#F5FAF6", lineHeight: 1.08 }}>{t.cta_h}</h2>
          <p className="mb-9 text-[16px]" style={{ color: MUT }}>{t.cta_p}</p>
          <Link to="/app"
            className="lp-btn lp-btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-[15px] font-semibold">
            {t.cta_btn} <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="px-6 py-10" style={{ background: "#070C0A", borderTop: "1px solid " + LINE }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
               style={{ background: "linear-gradient(135deg,#12896D,#0B6450)" }}>
            <span style={{ width: 7, height: 7, transform: "rotate(45deg)", background: "#fff", display: "block" }} />
          </div>
          <span className="lp-display font-bold text-[15px]" style={{ color: "#F3F8F4" }}>ChainSense</span>
          <span className="lp-num text-[11px] ml-2" style={{ color: FAINT }}>{t.foot}</span>
          <Link to="/app" className="ml-auto text-[13px] lp-btn inline-flex items-center gap-1.5 font-medium" style={{ color: JADE }}>
            <Globe size={13} /> {t.nav_demo}
          </Link>
        </div>
      </footer>
    </div>
  );
}
