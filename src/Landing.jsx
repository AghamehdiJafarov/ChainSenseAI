import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Globe, Download, FileText } from "lucide-react";
import { ModIcon, FAMC } from "./icons.jsx";

// ВСТАВЬ СЮДА ID своего YouTube-ролика (часть после watch?v= или youtu.be/).
const YT_ID = "uCftzNo4RRs";

/* ---- light tokens ---- */
const JADE = "#0E7C63";
const JADE_D = "#0B6450";
const INK = "#101915";
const MUT = "#5A6660";
const FAINT = "#8B948E";
const LINE = "#E7EAE2";
const BAND = "#F5F7F3";

const CSS = `
.lp { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: ${INK}; background: #fff;
      overflow-x: hidden; font-size: 15px; }
.lp-display { font-family: 'Golos Text', Inter, sans-serif; letter-spacing: -0.025em; }
.lp-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
.lp-eyebrow { font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: .15em;
              text-transform: uppercase; font-size: 10.5px; font-weight: 600; }
.lp-rail { display: flex; align-items: center; gap: 11px; }
.lp-diamond { width: 7px; height: 7px; transform: rotate(45deg); background: ${JADE}; flex-shrink: 0; }

/* crafted buttons — layered fill, zero movement */
.lp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: 11px; padding: 12px 22px; font-size: 14px; font-weight: 600; text-decoration: none;
  transition: background .14s ease, box-shadow .14s ease, border-color .14s ease, color .14s ease; }
.lp-btn-p { color: #fff; background: linear-gradient(180deg,#149478,#0C6B54); border: 1px solid #0A5D49;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.22), inset 0 -1px 0 rgba(6,52,41,.28),
              0 1px 2px rgba(12,80,63,.3), 0 6px 16px -5px rgba(14,124,99,.45); }
.lp-btn-p:hover { background: linear-gradient(180deg,#18A386,#0E7A60);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(6,52,41,.28),
              0 1px 2px rgba(12,80,63,.3), 0 9px 22px -6px rgba(14,124,99,.55); }
.lp-btn-p:active { background: linear-gradient(180deg,#0B6450,#0A5A47);
  box-shadow: inset 0 2px 5px rgba(5,40,32,.35); }
.lp-btn-g { color: ${INK}; background: #fff; border: 1px solid #D9DED6;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 1px 2px rgba(16,25,21,.06); }
.lp-btn-g:hover { border-color: #C4CBC1; background: #FAFBF8;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 4px 12px rgba(16,25,21,.09); }
.lp-btn-g:active { background: #F1F3EE; box-shadow: inset 0 1.5px 4px rgba(16,25,21,.12); }
.lp a:focus-visible, .lp button:focus-visible { outline: 2px solid ${JADE}; outline-offset: 3px; border-radius: 8px; }

/* engineering-paper grid */
.lp-grid { background-image:
    linear-gradient(rgba(16,25,21,.038) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16,25,21,.038) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(820px 460px at 72% 22%, #000, transparent 76%);
  -webkit-mask-image: radial-gradient(820px 460px at 72% 22%, #000, transparent 76%); }

/* module tiles */
.lp-tile { background: #fff; border: 1px solid ${LINE}; border-radius: 14px; padding: 16px 15px 14px;
  box-shadow: 0 1px 2px rgba(16,25,21,.03);
  transition: box-shadow .22s ease, border-color .22s ease; }
.lp-tile:hover { border-color: #CBD2C8; box-shadow: 0 16px 38px -14px rgba(16,25,21,.16); }
.lp-tile .chipwrap { transition: transform .22s cubic-bezier(.2,.7,.2,1); display: inline-flex; }
.lp-tile:hover .chipwrap { transform: scale(1.07); }

/* hero floating chips */
@keyframes lpFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.lp-chipf { animation: lpFloat 4.6s ease-in-out infinite; }

/* circuit flows */
@keyframes lpFlow { to { stroke-dashoffset: -22; } }
.lp-flow { stroke: ${JADE}; stroke-width: 1.5; stroke-dasharray: 3 19; stroke-linecap: round;
           animation: lpFlow 1.7s linear infinite; }
@keyframes lpBlink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
.lp-blink { animation: lpBlink 2.6s ease-in-out infinite; }

/* corner ticks */
.lp-frame { position: relative; }
.lp-tick { position: absolute; width: 14px; height: 14px; border: 0 solid rgba(14,124,99,.6); }
.lp-tick.tl { top: -1px; left: -1px; border-top-width: 2px; border-left-width: 2px; }
.lp-tick.tr { top: -1px; right: -1px; border-top-width: 2px; border-right-width: 2px; }
.lp-tick.bl { bottom: -1px; left: -1px; border-bottom-width: 2px; border-left-width: 2px; }
.lp-tick.br { bottom: -1px; right: -1px; border-bottom-width: 2px; border-right-width: 2px; }

.reveal { opacity: 0; transform: translateY(18px);
  transition: opacity .65s cubic-bezier(.2,.7,.2,1), transform .65s cubic-bezier(.2,.7,.2,1); }
.reveal.in { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .lp-flow, .lp-blink, .lp-chipf { animation: none !important; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .lp-btn, .lp-tile, .lp-tile .chipwrap { transition: none; }
}
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.13 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* count-up for the proof strip */
function CountUp({ to, dur = 900 }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, dur]);
  return <span ref={ref}>{String(v).padStart(String(to).length, "0")}</span>;
}

const MODULES = [
  { id: 1,  en: "Demand forecast",  ru: "Прогноз спроса",  az: "Tələb proqnozu" },
  { id: 2,  en: "Inventory",        ru: "Запасы",          az: "Ehtiyat" },
  { id: 3,  en: "Procurement",      ru: "Закупки",         az: "Satınalma" },
  { id: 4,  en: "Supplier scoring", ru: "Поставщики",      az: "Təchizatçı qiyməti" },
  { id: 5,  en: "Routing",          ru: "Маршруты",        az: "Marşrut" },
  { id: 6,  en: "Warehouse",        ru: "Склад",           az: "Anbar" },
  { id: 7,  en: "Maintenance",      ru: "Обслуживание",    az: "Texniki xidmət" },
  { id: 8,  en: "Quality",          ru: "Качество",        az: "Keyfiyyət" },
  { id: 9,  en: "Risk",             ru: "Риски",           az: "Risk" },
  { id: 10, en: "ETA",              ru: "Прогноз ETA",     az: "ETA proqnozu" },
  { id: 11, en: "Classification",   ru: "Классификация",   az: "Təsnifat" },
  { id: 12, en: "Invoice OCR",      ru: "OCR счетов",      az: "Sənədlər və OCR" },
  { id: 13, en: "AI assistant",     ru: "AI-ассистент",    az: "AI köməkçi" },
  { id: 14, en: "Packing",          ru: "Упаковка",        az: "Qablaşdırma" },
  { id: 15, en: "Sustainability",   ru: "Устойчивость",    az: "Dayanıqlıq" },
];

export default function Landing() {
  useReveal();
  const [lang, setLang] = useState("ru");
  const T = {
    ru: {
      nav_demo: "Открыть платформу",
      nav_deck: "Скачать презентацию",
      nav_links: ["Продукт", "Модули", "Связность", "Презентация"],
      hero_eyebrow: "Supply Chain Intelligence · 15 модулей",
      hero_h: "Аналитика цепочки поставок, связанная в единый контур",
      hero_em: "единый контур",
      hero_p: "Спрос питает запасы, запасы — закупки, риск поставщика входит в реестр рисков, маршрут — в расчёт ETA и CO₂. Пятнадцать модулей работают как один конвейер — на трёх языках, с AI на модели Claude.",
      hero_cta: "Открыть платформу",
      hero_watch: "Смотреть промо",
      chip1l: "MAPE прогноза", chip1v: "5.4%", chip1s: "лучше базы",
      chip2l: "Потери P90 · Monte-Carlo", chip2v: "968 k$",
      prob_eyebrow: "Проблема",
      prob_h: "Планирование живёт в Excel и разрозненных калькуляторах",
      prob_p: "Прогноз в одной таблице, запасы в другой, риски — в голове у менеджера. Данные не перетекают, решения принимаются вслепую, а дорогие SaaS-платформы вроде o9 или Kinaxis стоят сотни тысяч в год, не знают азербайджанского и не учитывают местную специфику — VÖEN, манат, коридоры Среднего Коридора.",
      sol_eyebrow: "Решение",
      sol_h: "Единая шина данных вместо пятнадцати островов",
      sol_p: "В основе — общий слой состояния: один портфель SKU, один пул поставщиков, один набор перевозок. Включаешь связку — и модуль берёт данные соседнего вместо ручного ввода. Это превращает набор калькуляторов в связную историю продукта.",
      mod_eyebrow: "Модули",
      mod_h: "Пятнадцать инструментов, один конвейер",
      mod_p: "Каждый модуль решает свою задачу и отдаёт результат дальше по цепи. Цвет — функциональная семья.",
      leg: { jade: "Планирование", violet: "Поставщики и документы", sky: "Логистика", amber: "Операции", coral: "Риск", plum: "AI", leaf: "Устойчивость" },
      vid_eyebrow: "Промо",
      vid_h: "Как это работает",
      vid_p: "Двухминутный обзор платформы.",
      link_eyebrow: "Связность",
      link_h: "Данные текут по цепочке",
      link_p: "SC-01 → SC-02 → SC-03. Оценка поставщика SC-04 входит строкой в реестр рисков SC-09. Дистанция маршрута SC-05 питает ETA SC-10 и углеродный след SC-15. Backtest, Monte-Carlo, логнормальные квантили, арифметическая валидация счетов — под капотом настоящие алгоритмы, а не заглушки.",
      live: "Живой контур",
      cta_h: "Посмотреть платформу в работе",
      cta_p: "Пятнадцать модулей доступны сразу, без регистрации.",
      cta_btn: "Открыть платформу",
      deck_eyebrow: "Презентация",
      deck_h: "Полный обзор в одном файле",
      deck_p: "Пятнадцать модулей, алгоритмы и интерфейс на трёх языках — в PDF-презентации.",
      deck_btn: "Скачать презентацию (PDF)",
      proof: [["15", "модулей в одном контуре", true], ["03", "языка · RU EN AZ", true], ["SC-01→15", "данные текут по конвейеру", false], ["Claude", "три AI-функции внутри", false]],
      foot: "Supply chain intelligence · RU / EN / AZ",
    },
    en: {
      nav_demo: "Open platform",
      nav_deck: "Download deck",
      nav_links: ["Product", "Modules", "Connectivity", "Deck"],
      hero_eyebrow: "Supply Chain Intelligence · 15 modules",
      hero_h: "Supply chain analytics, wired into a single loop",
      hero_em: "a single loop",
      hero_p: "Demand feeds inventory, inventory feeds procurement, supplier risk enters the risk register, route distance drives ETA and CO₂. Fifteen modules run as one pipeline — in three languages, with AI on Claude.",
      hero_cta: "Open platform",
      hero_watch: "Watch promo",
      chip1l: "Forecast MAPE", chip1v: "5.4%", chip1s: "beats baseline",
      chip2l: "P90 loss · Monte-Carlo", chip2v: "968 k$",
      prob_eyebrow: "Problem",
      prob_h: "Planning lives in Excel and disconnected calculators",
      prob_p: "Forecast in one sheet, inventory in another, risk in the manager's head. Data doesn't flow, decisions are made blind, and enterprise SaaS like o9 or Kinaxis costs hundreds of thousands a year, speaks no Azerbaijani, and ignores local specifics — VÖEN, manat, Middle Corridor routes.",
      sol_eyebrow: "Solution",
      sol_h: "One data bus instead of fifteen islands",
      sol_p: "At the core: a shared state layer — one SKU portfolio, one supplier pool, one shipment set. Toggle a link and a module pulls its neighbour's data instead of manual input. This turns a set of calculators into a coherent product story.",
      mod_eyebrow: "Modules",
      mod_h: "Fifteen tools, one pipeline",
      mod_p: "Each module solves its task and passes the result down the chain. Colour marks the functional family.",
      leg: { jade: "Planning", violet: "Suppliers & documents", sky: "Logistics", amber: "Operations", coral: "Risk", plum: "AI", leaf: "Sustainability" },
      vid_eyebrow: "Promo",
      vid_h: "How it works",
      vid_p: "A two-minute platform overview.",
      link_eyebrow: "Connectivity",
      link_h: "Data flows down the chain",
      link_p: "SC-01 → SC-02 → SC-03. Supplier score SC-04 enters the risk register SC-09 as a row. Route distance SC-05 feeds ETA SC-10 and carbon footprint SC-15. Backtest, Monte-Carlo, log-normal quantiles, arithmetic invoice validation — real algorithms under the hood, not stubs.",
      live: "Live circuit",
      cta_h: "See the platform in action",
      cta_p: "Fifteen modules available instantly, no sign-up.",
      cta_btn: "Open platform",
      deck_eyebrow: "Deck",
      deck_h: "The full overview in one file",
      deck_p: "Fifteen modules, the algorithms, and the trilingual interface — in a PDF deck.",
      deck_btn: "Download deck (PDF)",
      proof: [["15", "modules, one loop", true], ["03", "languages · RU EN AZ", true], ["SC-01→15", "data flows down the pipeline", false], ["Claude", "three AI features inside", false]],
      foot: "Supply chain intelligence · RU / EN / AZ",
    },
    az: {
      nav_demo: "Platformanı aç",
      nav_deck: "Təqdimatı yüklə",
      nav_links: ["Məhsul", "Modullar", "Bağlılıq", "Təqdimat"],
      hero_eyebrow: "Supply Chain Intelligence · 15 modul",
      hero_h: "Təchizat zəncirinin analitikası, vahid kontura bağlanmış",
      hero_em: "vahid kontura",
      hero_p: "Tələb ehtiyatı qidalandırır, ehtiyat satınalmanı, təchizatçı riski risk reyestrinə daxil olur, marşrut isə ETA və CO₂ hesabına. On beş modul bir konveyer kimi işləyir — üç dildə, Claude modelində AI ilə.",
      hero_cta: "Platformanı aç",
      hero_watch: "Promonu izlə",
      chip1l: "Proqnoz MAPE", chip1v: "5.4%", chip1s: "bazadan yaxşı",
      chip2l: "P90 itki · Monte-Carlo", chip2v: "968 k$",
      prob_eyebrow: "Problem",
      prob_h: "Planlaşdırma Excel və dağınıq kalkulyatorlarda yaşayır",
      prob_p: "Proqnoz bir cədvəldə, ehtiyat başqasında, risklər menecerin yaddaşında. Məlumat axmır, qərarlar kor-koranə verilir, o9 və ya Kinaxis kimi bahalı SaaS platformaları ildə yüz minlərlə dollar tələb edir, azərbaycan dilini bilmir və yerli spesifikanı — VÖEN, manat, Orta Dəhliz marşrutlarını — nəzərə almır.",
      sol_eyebrow: "Həll",
      sol_h: "On beş ada əvəzinə vahid data şini",
      sol_p: "Əsasında — ümumi vəziyyət təbəqəsi: bir SKU portfeli, bir təchizatçı hovuzu, bir daşıma dəsti. Bağlantını aktivləşdirirsən — və modul əl ilə daxiletmə əvəzinə qonşusunun datasını götürür. Bu, kalkulyatorlar dəstini vahid məhsul hekayəsinə çevirir.",
      mod_eyebrow: "Modullar",
      mod_h: "On beş alət, bir konveyer",
      mod_p: "Hər modul öz vəzifəsini həll edir və nəticəni zəncir üzrə ötürür. Rəng — funksional ailədir.",
      leg: { jade: "Planlaşdırma", violet: "Təchizatçılar və sənədlər", sky: "Logistika", amber: "Əməliyyatlar", coral: "Risk", plum: "AI", leaf: "Dayanıqlıq" },
      vid_eyebrow: "Promo",
      vid_h: "Necə işləyir",
      vid_p: "İki dəqiqəlik platforma icmalı.",
      link_eyebrow: "Bağlılıq",
      link_h: "Məlumat zəncir üzrə axır",
      link_p: "SC-01 → SC-02 → SC-03. Təchizatçı qiyməti SC-04 risk reyestrinə SC-09 sətir kimi daxil olur. Marşrut məsafəsi SC-05 ETA SC-10 və karbon izini SC-15 qidalandırır. Backtest, Monte-Carlo, loqnormal kvantillər, hesabların arifmetik yoxlanışı — arxa planda əsl alqoritmlər, boş deyil.",
      live: "Canlı kontur",
      cta_h: "Platformanı işdə görün",
      cta_p: "On beş modul dərhal əlçatandır, qeydiyyatsız.",
      cta_btn: "Platformanı aç",
      deck_eyebrow: "Təqdimat",
      deck_h: "Tam icmal bir faylda",
      deck_p: "On beş modul, alqoritmlər və üç dilli interfeys — PDF təqdimatında.",
      deck_btn: "Təqdimatı yüklə (PDF)",
      proof: [["15", "modul vahid konturda", true], ["03", "dil · RU EN AZ", true], ["SC-01→15", "data konveyer üzrə axır", false], ["Claude", "üç AI funksiyası daxildə", false]],
      foot: "Supply chain intelligence · RU / EN / AZ",
    },
  };
  const t = T[lang];

  const Hl = ({ text, em }) => {
    const i = text.indexOf(em);
    if (i < 0) return text;
    return (<>{text.slice(0, i)}<em style={{ fontStyle: "normal", color: JADE }}>{em}</em>{text.slice(i + em.length)}</>);
  };

  const SectionHead = ({ eyebrow, h, p, center }) => (
    <div className={"reveal mb-11 " + (center ? "text-center" : "")}>
      <div className={"lp-rail mb-4 " + (center ? "justify-center" : "")}>
        <span className="lp-diamond" />
        <span className="lp-eyebrow" style={{ color: JADE }}>{eyebrow}</span>
      </div>
      <h2 className="lp-display font-bold mb-3"
          style={{ fontSize: "clamp(1.65rem,3.2vw,2.35rem)", color: INK, lineHeight: 1.12 }}>{h}</h2>
      {p && <p style={{ color: MUT, maxWidth: 620, margin: center ? "0 auto" : 0, lineHeight: 1.65, fontSize: 14.5 }}>{p}</p>}
    </div>
  );

  /* light circuit with family-coloured stations */
  const CircuitLight = () => {
    const N = [
      [58, 160, 1, "SC-01"], [172, 76, 2, "SC-02"], [172, 244, 3, "SC-03"],
      [284, 160, 4, "SC-04"], [396, 76, 5, "SC-05"], [396, 244, 9, "SC-09"], [502, 160, 15, "SC-15"],
    ];
    const E = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[4,6],[5,6]];
    const name = (id) => MODULES.find((m) => m.id === id)[lang];
    return (
      <svg viewBox="0 0 560 316" width="100%" role="img">
        {E.map(([a, b], i) => (
          <g key={i}>
            <line x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} stroke="#DCE1D8" strokeWidth="1.3" />
            <line x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} className="lp-flow"
                  style={{ animationDelay: i * 0.16 + "s" }} />
          </g>))}
        {N.map(([x, y, id, code], i) => {
          const c = FAMC[{1:"jade",2:"jade",3:"jade",4:"violet",5:"sky",9:"coral",15:"leaf"}[id]];
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <rect x="-18" y="-18" width="36" height="36" rx="8" transform="rotate(45)"
                    fill="#fff" stroke={c[2]} strokeWidth="1.6" />
              <rect x="-18" y="-18" width="36" height="36" rx="8" transform="rotate(45)"
                    fill={c[1]} fillOpacity=".09" />
              <text y="4.5" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={c[2]}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}>{String(id).padStart(2, "0")}</text>
              <text y="-31" textAnchor="middle" fontSize="8" fill="#AEB6AD"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}>{code}</text>
              <text y="41" textAnchor="middle" fontSize="10.5" fill={MUT}
                    style={{ fontFamily: "Inter, sans-serif" }}>{name(id)}</text>
            </g>);
        })}
      </svg>
    );
  };

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* ---------- nav ---------- */}
      <header className="fixed top-0 inset-x-0 z-50"
              style={{ background: "rgba(255,255,255,0.86)", backdropFilter: "blur(12px)",
                       borderBottom: "1px solid " + LINE }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-[31px] h-[31px] rounded-[9px] flex items-center justify-center"
                 style={{ background: "linear-gradient(180deg,#149478,#0B6450)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 3px 9px rgba(14,124,99,.3)" }}>
              <span style={{ width: 9, height: 9, transform: "rotate(45deg)", background: "#fff", display: "block" }} />
            </div>
            <div className="lp-display font-bold text-[17px]" style={{ color: INK }}>ChainSense</div>
          </div>
          <nav className="hidden lg:flex items-center gap-5">
            {["#product", "#modules", "#link", "#deck"].map((href, i) => (
              <a key={href} href={href} className="text-[13.5px] font-semibold"
                 style={{ color: "#4A554F", textDecoration: "none" }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = JADE_D)}
                 onMouseLeave={(e) => (e.currentTarget.style.color = "#4A554F")}>
                {t.nav_links[i]}
              </a>))}
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <div className="flex items-center rounded-[9px] p-[3px] gap-[2px]"
                 style={{ background: "#F0F2ED", border: "1px solid #E2E6DD" }}>
              {["az", "ru", "en"].map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className="lp-num rounded-[6px] px-2 py-1 text-[10px] font-semibold uppercase"
                  style={{ transition: "background .14s, color .14s",
                    ...(lang === l ? { background: "#fff", color: INK, boxShadow: "0 1px 2px rgba(16,25,21,.12)" }
                                   : { background: "transparent", color: FAINT, border: 0, cursor: "pointer" }) }}>
                  {l}
                </button>))}
            </div>
            <a href="/ChainSenseAI.pdf" download title={t.nav_deck}
              className="lp-btn lp-btn-g hidden md:inline-flex" style={{ padding: "9px 14px", fontSize: 13 }}>
              <Download size={14} /> <span className="hidden xl:inline">{t.nav_deck}</span>
            </a>
            <Link to="/app" className="lp-btn lp-btn-p" style={{ padding: "9px 16px", fontSize: 13 }}>
              {t.nav_demo} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section id="product" className="relative pt-32 pb-14 px-6"
               style={{ background: "radial-gradient(880px 460px at 86% -4%, rgba(14,124,99,.07), transparent 60%), #fff" }}>
        <div className="lp-grid absolute inset-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative grid lg:grid-cols-[1fr_1.02fr] gap-12 items-center">
          <div>
            <div className="lp-rail mb-5 reveal">
              <span className="lp-diamond lp-blink" />
              <span className="lp-eyebrow" style={{ color: JADE }}>{t.hero_eyebrow}</span>
            </div>
            <h1 className="lp-display font-extrabold mb-5 reveal"
                style={{ fontSize: "clamp(2.1rem,4.3vw,3.35rem)", color: INK, lineHeight: 1.06, transitionDelay: ".08s" }}>
              <Hl text={t.hero_h} em={t.hero_em} />
            </h1>
            <p className="reveal text-[15.5px] mb-8" style={{ color: MUT, maxWidth: 520, lineHeight: 1.7, transitionDelay: ".16s" }}>
              {t.hero_p}
            </p>
            <div className="reveal flex flex-wrap gap-3 mb-7" style={{ transitionDelay: ".24s" }}>
              <Link to="/app" className="lp-btn lp-btn-p">{t.hero_cta} <ArrowRight size={16} /></Link>
              <a href="#promo" className="lp-btn lp-btn-g"><Play size={14} /> {t.hero_watch}</a>
            </div>
            <div className="reveal lp-num text-[11px]" style={{ color: FAINT, letterSpacing: ".04em", transitionDelay: ".3s" }}>
              <b style={{ color: JADE_D }}>15</b> {lang === "ru" ? "модулей" : lang === "az" ? "modul" : "modules"} · <b style={{ color: JADE_D }}>RU EN AZ</b> · Backtest · Monte-Carlo · <b style={{ color: JADE_D }}>Claude AI</b>
            </div>
          </div>

          {/* product-led stage: real screenshots of the working platform */}
          <div className="reveal relative h-[470px] hidden sm:block" style={{ transitionDelay: ".14s" }}>
            <div className="absolute rounded-[14px] overflow-hidden"
                 style={{ top: 4, right: -36, width: 640, border: "1px solid #E3E7E0",
                          boxShadow: "0 48px 110px -34px rgba(15,27,22,.32), 0 10px 30px -12px rgba(15,27,22,.12)" }}>
              <img src="/shots/dash.png" alt="ChainSense — прогноз спроса" style={{ width: "100%", display: "block" }} />
            </div>
            <div className="absolute rounded-[13px] overflow-hidden"
                 style={{ bottom: 12, left: -10, width: 330, border: "1px solid #E3E7E0",
                          boxShadow: "0 32px 74px -24px rgba(15,27,22,.3)" }}>
              <img src="/shots/risk.png" alt="ChainSense — анализ рисков" style={{ width: "100%", display: "block" }} />
            </div>
            <div className="lp-chipf absolute rounded-xl px-4 py-3"
                 style={{ top: -12, right: 132, background: "#fff", border: "1px solid #E3E7E0",
                          boxShadow: "0 16px 40px -16px rgba(15,27,22,.26)" }}>
              <div className="lp-eyebrow" style={{ color: FAINT, fontSize: 8.5, letterSpacing: ".12em" }}>{t.chip1l}</div>
              <div className="lp-num text-[19px] font-semibold" style={{ color: INK }}>
                {t.chip1v} <span className="text-[10.5px]" style={{ color: JADE_D }}>▲ {t.chip1s}</span>
              </div>
            </div>
            <div className="lp-chipf absolute rounded-xl px-4 py-3"
                 style={{ bottom: 116, right: -22, animationDelay: "1.4s", background: "#fff",
                          border: "1px solid #E3E7E0", boxShadow: "0 16px 40px -16px rgba(15,27,22,.26)" }}>
              <div className="lp-eyebrow" style={{ color: FAINT, fontSize: 8.5, letterSpacing: ".12em" }}>{t.chip2l}</div>
              <div className="lp-num text-[19px] font-semibold" style={{ color: "#A93C21" }}>{t.chip2v}</div>
            </div>
          </div>
        </div>

        {/* proof strip */}
        <div className="max-w-6xl mx-auto relative mt-12 reveal">
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ borderTop: "1px solid " + LINE }}>
            {t.proof.map(([v, l, cnt], i) => (
              <div key={i} className={"py-4 pr-5 " + (i % 4 ? "md:pl-6 md:border-l" : "") + (i % 2 ? " pl-6 border-l md:border-l" : "")}
                   style={{ borderColor: "#EDF0E9" }}>
                <div className="lp-num text-[19px] font-semibold" style={{ color: INK }}>
                  {cnt ? <CountUp to={parseInt(v, 10)} /> : v}
                </div>
                <div className="text-[12px] mt-1" style={{ color: FAINT }}>{l}</div>
              </div>))}
          </div>
        </div>
      </section>

      {/* ---------- problem / solution ---------- */}
      <section className="px-6 py-20" style={{ background: BAND, borderTop: "1px solid #EEF1EA", borderBottom: "1px solid #EEF1EA" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5">
          <div className="reveal rounded-2xl p-8 md:p-9" style={{ background: "#fff", border: "1px solid " + LINE, boxShadow: "0 1px 2px rgba(16,25,21,.03)" }}>
            <div className="lp-rail mb-4">
              <span className="lp-diamond" style={{ background: "#CC4E2E" }} />
              <span className="lp-eyebrow" style={{ color: "#A93C21" }}>{t.prob_eyebrow}</span>
            </div>
            <h2 className="lp-display font-bold text-[21px] mb-3.5" style={{ color: INK, lineHeight: 1.25 }}>{t.prob_h}</h2>
            <p className="text-[14px]" style={{ color: MUT, lineHeight: 1.7 }}>{t.prob_p}</p>
          </div>
          <div className="reveal rounded-2xl p-8 md:p-9"
               style={{ background: "linear-gradient(160deg,#EDF6F1,#fff 65%)", border: "1px solid #CFE6DB",
                        boxShadow: "0 1px 2px rgba(16,25,21,.03)", transitionDelay: ".1s" }}>
            <div className="lp-rail mb-4">
              <span className="lp-diamond" />
              <span className="lp-eyebrow" style={{ color: JADE_D }}>{t.sol_eyebrow}</span>
            </div>
            <h2 className="lp-display font-bold text-[21px] mb-3.5" style={{ color: INK, lineHeight: 1.25 }}>{t.sol_h}</h2>
            <p className="text-[14px]" style={{ color: MUT, lineHeight: 1.7 }}>{t.sol_p}</p>
          </div>
        </div>
      </section>

      {/* ---------- modules grid ---------- */}
      <section id="modules" className="px-6 py-24" style={{ background: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead eyebrow={t.mod_eyebrow} h={t.mod_h} p={t.mod_p} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MODULES.map((m, i) => (
              <div key={m.id} className="reveal lp-tile" style={{ transitionDelay: (i * 0.03) + "s" }}>
                <div className="flex items-start justify-between mb-3.5">
                  <span className="chipwrap"><ModIcon id={m.id} size={42} radius={12} /></span>
                  <span className="lp-num text-[9.5px] pt-1" style={{ color: "#AEB6AD", letterSpacing: ".08em" }}>
                    SC-{String(m.id).padStart(2, "0")}
                  </span>
                </div>
                <div className="lp-display font-semibold text-[14px]" style={{ color: "#17211C", letterSpacing: "-0.01em" }}>
                  {m[lang]}
                </div>
              </div>))}
          </div>
          <div className="reveal flex flex-wrap gap-x-5 gap-y-2 mt-7 justify-center">
            {Object.entries(t.leg).map(([k, l]) => (
              <span key={k} className="inline-flex items-center gap-2 text-[12px]" style={{ color: MUT }}>
                <i style={{ width: 8, height: 8, borderRadius: 2, transform: "rotate(45deg)", background: FAMC[k][1], display: "inline-block" }} />
                {l}
              </span>))}
          </div>
        </div>
      </section>

      {/* ---------- connectivity: light circuit ---------- */}
      <section id="link" className="px-6 py-24" style={{ background: BAND, borderTop: "1px solid #EEF1EA", borderBottom: "1px solid #EEF1EA" }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div className="reveal">
            <div className="lp-rail mb-4">
              <span className="lp-diamond" />
              <span className="lp-eyebrow" style={{ color: JADE }}>{t.link_eyebrow}</span>
            </div>
            <h2 className="lp-display font-bold mb-4"
                style={{ fontSize: "clamp(1.65rem,3.2vw,2.35rem)", color: INK, lineHeight: 1.12 }}>{t.link_h}</h2>
            <p className="text-[14px]" style={{ color: MUT, lineHeight: 1.72 }}>{t.link_p}</p>
          </div>
          <div className="reveal lp-frame" style={{ transitionDelay: ".1s" }}>
            <div className="rounded-2xl px-6 pt-5 pb-3"
                 style={{ background: "#fff", border: "1px solid " + LINE,
                          boxShadow: "0 30px 80px -30px rgba(15,27,22,.2)" }}>
              <div className="lp-eyebrow flex items-center gap-2 mb-1" style={{ color: "#9AA39C", fontSize: 9 }}>
                <span className="lp-diamond lp-blink" style={{ width: 5, height: 5 }} />
                {t.live} · SC-01 → SC-15
              </div>
              <CircuitLight />
            </div>
            <span className="lp-tick tl" /><span className="lp-tick tr" />
            <span className="lp-tick bl" /><span className="lp-tick br" />
          </div>
        </div>
      </section>

      {/* ---------- promo video ---------- */}
      <section id="promo" className="px-6 py-24" style={{ background: "#fff" }}>
        <div className="max-w-4xl mx-auto">
          <SectionHead center eyebrow={t.vid_eyebrow} h={t.vid_h} p={t.vid_p} />
          <div className="reveal lp-frame" style={{ transitionDelay: ".08s" }}>
            <div className="rounded-2xl overflow-hidden"
                 style={{ border: "1px solid " + LINE, boxShadow: "0 44px 110px -28px rgba(15,27,22,.3)" }}>
              <div style={{ position: "relative", paddingTop: "56.25%", background: "#0D1512" }}>
                {YT_ID === "REPLACE_WITH_YOUTUBE_ID" ? (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 24 }}>
                    <Play size={38} color="#2EC29B" />
                    <div className="lp-display font-semibold" style={{ color: "#DFE8E2" }}>
                      {{ ru: "Место для промо-ролика", en: "Promo video placeholder", az: "Promo video yeri" }[lang]}
                    </div>
                    <div className="text-sm" style={{ color: "#5F6F67", maxWidth: 360 }}>
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

      {/* ---------- deck ---------- */}
      <section id="deck" className="px-6 py-18" style={{ background: BAND, borderTop: "1px solid #EEF1EA", padding: "72px 24px" }}>
        <div className="max-w-3xl mx-auto reveal">
          <div className="rounded-2xl p-8 flex flex-col md:flex-row md:items-center gap-6"
               style={{ background: "#fff", border: "1px solid " + LINE, boxShadow: "0 1px 2px rgba(16,25,21,.03)" }}>
            <div className="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0"
                 style={{ background: "#E1F1EA" }}>
              <FileText size={24} color={JADE_D} />
            </div>
            <div className="flex-1">
              <div className="lp-eyebrow mb-1.5" style={{ color: JADE_D }}>{t.deck_eyebrow}</div>
              <h2 className="lp-display font-bold text-[19px] mb-1" style={{ color: INK }}>{t.deck_h}</h2>
              <p className="text-[13.5px]" style={{ color: MUT }}>{t.deck_p}</p>
            </div>
            <a href="/ChainSenseAI.pdf" download className="lp-btn lp-btn-p flex-shrink-0" style={{ fontSize: 14 }}>
              <Download size={15} /> {t.deck_btn}
            </a>
          </div>
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section className="px-6 py-28 relative"
               style={{ background: "radial-gradient(720px 400px at 50% 118%, rgba(14,124,99,.1), transparent 70%), #fff" }}>
        <div className="max-w-3xl mx-auto text-center reveal">
          <div className="lp-rail justify-center mb-6"><span className="lp-diamond lp-blink" /></div>
          <h2 className="lp-display font-extrabold mb-4"
              style={{ fontSize: "clamp(1.85rem,4vw,2.9rem)", color: INK, lineHeight: 1.08 }}>{t.cta_h}</h2>
          <p className="mb-8 text-[15.5px]" style={{ color: MUT }}>{t.cta_p}</p>
          <Link to="/app" className="lp-btn lp-btn-p" style={{ padding: "15px 30px", fontSize: 15 }}>
            {t.cta_btn} <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="px-6 py-9" style={{ background: "#FBFCFA", borderTop: "1px solid " + LINE }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <div className="w-6 h-6 rounded-[7px] flex items-center justify-center"
               style={{ background: "linear-gradient(180deg,#149478,#0B6450)" }}>
            <span style={{ width: 7, height: 7, transform: "rotate(45deg)", background: "#fff", display: "block" }} />
          </div>
          <span className="lp-display font-bold text-[15px]" style={{ color: INK }}>ChainSense</span>
          <span className="lp-num text-[11px] ml-2" style={{ color: FAINT }}>{t.foot}</span>
          <Link to="/app" className="ml-auto text-[13px] inline-flex items-center gap-1.5 font-semibold"
                style={{ color: JADE_D, textDecoration: "none" }}>
            <Globe size={13} /> {t.nav_demo}
          </Link>
        </div>
      </footer>
    </div>
  );
}
