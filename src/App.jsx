/* ChainSense AI — трёхъязычная (RU/EN/AZ) платформа из 15 supply-chain модулей.
   Алгоритмы: Holt–Winters, EOQ/ROP, MRP-план, взвешенный скоринг, NN+2-opt,
   ABC-слоттинг + серпантинный маршрут, health/RUL/logit-отказ, FFD bin packing,
   EF-факторы CO2e; Claude API: чат-ассистент, Vision-OCR счетов, Vision-инспекция. */
import React, { useState, useMemo, useRef, useEffect, useReducer, useContext, useCallback, createContext } from "react";
import {
  ComposedChart, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
} from "recharts";
import {
  TrendingUp, Package, ShoppingCart, Users, Route, Warehouse, Wrench, ScanSearch,
  ShieldAlert, Timer, Tags, FileText, MessageSquare, Boxes, Leaf, Send, Upload,
  RefreshCw, HelpCircle, Trash2, Menu, Play,
  Link2, Download, ArrowLeftRight, CheckCircle2, XCircle, Save,
} from "lucide-react";

import Papa from "papaparse";
import * as XLSX from "xlsx";

// В среде артефактов существует window.storage (async key-value). Вне её — подменяем
// на localStorage с той же сигнатурой, чтобы персистентность и снапшоты работали в браузере.
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (k) => {
      try { const v = localStorage.getItem(k); return v == null ? null : { value: v }; }
      catch { return null; }
    },
    set: async (k, v) => {
      try { localStorage.setItem(k, v); } catch {}
    },
  };
}

const ACCENT = "#0d7a68";
const AMBER = "#d98e2b";
const RED = "#c2452f";
const INK = "#101826";
const BG = "#eef1f4";

const MONTHS = {
  ru: ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  az: ["yan","fev","mar","apr","may","iyn","iyl","avq","sen","okt","noy","dek"],
};
const LANG_NAME = { ru: "Russian", en: "English", az: "Azerbaijani" };
const LOCALE = { ru: "ru-RU", en: "en-GB", az: "az-AZ" };

const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
let FMT_LOCALE = "ru-RU";
const fmt = (n, d = 0) =>
  Number(n).toLocaleString(FMT_LOCALE, { maximumFractionDigits: d, minimumFractionDigits: d });
const DK = { "#0d7a68": "#0a5d50", "#d98e2b": "#8a5a10", "#c2452f": "#992f22",
  "#3b6ea5": "#2d5580", "#6b5ca5": "#514682", "#8896a6": "#5c6b7a",
  "#b0578d": "#8a3f6d", "#4c9a6a": "#39774f", "#8a8f3c": "#6b7030" };
const dk = (c) => DK[c] || c;

/* ------------------------------ i18n ------------------------------ */
const T = {
en: {
  tagline: "Supply chain intelligence · 15 modules",
  m1:"Demand Forecasting", m2:"Inventory Management", m3:"Procurement Planning",
  m4:"Supplier Evaluation", m5:"Route Optimization", m6:"Warehouse Optimization",
  m7:"Predictive Maintenance", m8:"Quality Inspection", m9:"Risk Analysis",
  m10:"ETA Prediction", m11:"Classification", m12:"Documents & OCR",
  m13:"AI Assistant", m14:"Packing Optimization", m15:"Sustainability",
  d1:"Holt–Winters triple smoothing, confidence band, MAPE",
  d2:"EOQ, safety stock, reorder point, ABC analysis",
  d3:"MRP logic: when and how much to order, given MOQ and lead time",
  d4:"Weighted multi-criteria scoring with radar comparison",
  d5:"Nearest-neighbour + 2-opt heuristics, distance savings",
  d6:"ABC slotting and serpentine picker routing",
  d7:"Health index, remaining useful life, failure probability",
  d8:"Batch inspection stats + photo analysis via Claude Vision",
  d9:"Risk register and probability × impact matrix",
  d10:"Transit-time model: mode, weather, customs, congestion",
  d11:"Keyword scoring for documents and product categories",
  d12:"Invoice field extraction: text parser + Claude Vision OCR",
  d13:"Warehouse & procurement copilot on the Claude API",
  d14:"3D bin packing (first-fit decreasing)",
  d15:"CO2e per tonne-km with modal-shift scenarios",
  calc:"Calculate", optimize:"Optimize", reset:"Reset", add:"Add", del:"Delete",
  send:"Send", sample:"Sample", results:"Results", params:"Parameters",
  uUnits:"u.", uDays:"days", uKm:"km", uKg:"kg", uPcs:"pcs", uMonth:"mo",
  name:"Name", qty:"Qty", total:"Total", date:"Date", score:"Score",
  horizon:"Forecast horizon, months", alphaL:"α — level", betaL:"β — trend",
  gammaL:"γ — seasonality", history:"Historical sales", forecastL:"Forecast",
  mape:"MAPE", peak:"Seasonal peak", growth:"Trend, %/yr", ciL:"±1.28·RMSE band",
  annualD:"Annual demand, units", orderCost:"Order cost, $", holdCost:"Holding, $/unit/yr",
  leadTime:"Lead time, days", service:"Service level", sigmaD:"Daily demand σ",
  eoqL:"EOQ — optimal lot", ropL:"Reorder point (ROP)", ssL:"Safety stock",
  opyL:"Orders per year", abcL:"ABC analysis", skuL:"SKU", shareL:"Share, %",
  classL:"Class", simL:"Inventory simulation, 120 days", stockL:"Stock",
  avgD:"Avg demand, units/mo", curStock:"Current stock, units", moqL:"Min order (MOQ)",
  coverT:"Target coverage, days", planL:"Purchase plan, 90 days", poDate:"Order date",
  arriveL:"Arrival", coverageL:"Coverage", noPO:"No orders required in the horizon",
  weightsL:"Criteria weights", wPrice:"Price", wQual:"Quality", wDeliv:"Delivery time",
  wRel:"Reliability", wRisk:"Risk", rankL:"Rank", bestL:"Recommended", supplierL:"Supplier",
  nPoints:"Delivery points", regen:"New points", beforeL:"Before optimization",
  afterL:"After (NN + 2-opt)", distL:"Distance", savingL:"Savings", depotL:"Depot",
  layoutL:"Warehouse layout — ABC slotting", pickL:"Pick list", optPathL:"Optimized route",
  randPathL:"Random slotting", gainL:"Gain", dockL:"Dock",
  clsA:"A — fast movers", clsB:"B — medium", clsC:"C — slow",
  equipL:"Equipment", healthL:"Health index", rulL:"RUL, days", failL:"Failure prob., 30d",
  vibL:"Vibration, mm/s", tempL:"Temp, °C", hoursL:"Run hours", actionL:"Action",
  actNow:"Service now", actPlan:"Schedule service", actOk:"Normal",
  trendL:"Vibration trend, 12 weeks",
  runBatch:"Inspect demo batch", uploadL:"Upload photo", analyzeL:"Analyze with Claude Vision",
  analyzing:"Analyzing…", passL:"Pass rate", defL:"Defects", precL:"Precision", recL:"Recall",
  vPass:"PASS", vFail:"REJECT", sevL:"Severity", dScr:"Scratch", dCrk:"Crack",
  dCon:"Contamination", dAli:"Misalignment", missedL:"Missed (FN)", falseL:"False alarm (FP)",
  visionH:"Upload a product photo — Claude will describe visible defects",
  regL:"Risk register", riskN:"Risk", probL:"Probability", impactL:"Impact", levelL:"Level",
  lowL:"Low", medL:"Medium", highL:"High", matrixL:"Probability × impact matrix",
  mitL:"Mitigation", mLow:"Monitor", mMed:"Second source, buffer stock",
  mHigh:"Dual sourcing + safety stock + insurance", indexL:"Portfolio risk index",
  rk1:"Sole-source chip supplier", rk2:"Port congestion", rk3:"FX volatility",
  rk4:"Carrier strike", rk5:"ERP outage", rk6:"Route geopolitics",
  modeL:"Mode", road:"Road", rail:"Rail", sea:"Sea", air:"Air", distKm:"Distance, km",
  weatherL:"Weather factor", customsL:"Customs, h", congestL:"Congestion",
  etaL:"Estimated arrival", transitL:"Transit", windowL:"±σ window",
  breakL:"Time breakdown, hours", handlingL:"Handling / terminal",
  tabDoc:"Document type", tabProd:"Product category", inputL:"Text", classifyL:"Classify",
  confL:"Confidence", docI:"Invoice", docW:"Waybill", docP:"Packing list",
  docO:"Purchase order", docC:"Contract", catE:"Electronics", catF:"Food",
  catA:"Apparel", catH:"Chemicals", catB:"Construction",
  clsPh:"Paste text or load a sample",
  prodSample:"HDMI cable, Wi-Fi router, 24-inch LED monitor, keyboard",
  ocrPaste:"Paste invoice text", extractL:"Extract fields", imgL:"Upload image",
  viaClaude:"Claude Vision OCR", invNo:"Invoice #", invDate:"Date", invSupp:"Supplier",
  invTax:"Tax ID", invAmt:"Total", invVat:"VAT", invCur:"Currency", invLines:"Line items",
  sampleL:"Sample invoice", parsingL:"Processing…", noneFound:"—",
  chatPh:"Ask about stock, procurement, warehouse SOPs…", thinkingL:"Thinking…",
  clearL:"Clear", chatHello:"Hi! I am the warehouse & procurement copilot. How can I help?",
  itemsL:"Items", boxesL:"Box catalogue", packL:"Pack", fillL:"Fill",
  usedL:"Boxes used", saveL:"Savings vs baseline",
  baseL:"Baseline: per-line next-fit into M boxes, no consolidation across lines", dimsL:"L×W×H, cm",
  weightL:"Weight, kg", boxCol:"Box",
  shipsL:"Shipments", emisL:"CO2e emissions", byModeL:"By mode", shiftL:"Shift road → rail",
  scenL:"Scenario emissions", energyL:"Energy", tonsL:"t",
  efNote:"EF, g CO2e/t·km: road 62 · rail 22 · sea 8 · air 602",
  sampleInv:`TechnoSupply LLC        Tax ID 40-7712345
INVOICE No INV-2417   Date: 14.06.2026
Bill to: Caspian Trade LLC
1. HDMI 2.1 cable    24 pcs x 8.50 = 204.00
2. Router AX-3000     6 pcs x 72.00 = 432.00
Subtotal: 636.00
VAT 20%: 127.20
TOTAL DUE: 763.20 USD`,
  apiErr:"Claude API is unreachable in this environment",
  linkL:"Platform data", importL:"Import", exportL:"Export XLSX", importedL:"Imported rows", badCsv:"CSV not recognized",
  csvHintSales:"CSV: value column, monthly", csvHintItems:"CSV: name,l,w,h,qty,wt", csvHintShip:"CSV: mode,km,tn",
  btT:"Backtest · last 6 mo held out", btHw:"Model MAPE", btNv:"Naive-seasonal MAPE",
  beatsL:"beats baseline", loseL:"does not beat baseline", btShort:"history under 30 points — backtest off",
  servFact:"Achieved service (sim)", fcSrc:"Σ of 12-mo forecast",
  sensT:"Weight sensitivity — where the leader flips", flipDn:"↓ at ≤", flipUp:"↑ at ≥", stableL:"stable across 0–10",
  thrL:"Detector threshold",
  mcT:"Monte-Carlo · 2000 trials", expLoss:"Expected loss", p90Loss:"P90 loss",
  exceedT:"Exceedance curve P(loss ≥ x), k$", unitCost:"Cost per impact point, k$",
  rkSup:"Concentration on risky supplier",
  etaP50:"ETA P50", etaP90:"ETA P90",
  linesT:"Line items", priceL:"Price", sumL:"Amount",
  chkLines:"Σ lines + VAT = Total", chkVat:"rate × net = VAT", okB:"match", failB:"mismatch",
  layoutT:"3D layout (shelf packing)", notPlaced:"did not fit the layout:",
  co2PriceL:"Carbon price, €/t", co2SaveL:"Scenario value",
  scnA:"Scenario A", scnB:"Scenario B", saveS:"Save", loadS:"Load", emptyS:"empty",
  compareT:"Scenario compare", metricL:"Metric", curL:"Current", resetDemo:"Reset demo data",
  crashT:"Module crashed", retryL:"Restart",
  prmL:"param", askEx1:"Open inventory with demand 20000", askEx2:"Set ETA to rail and open the module",
  clsAI:"Ask Claude", aiSays:"Claude", agreeL:"agrees", disagreeL:"differs",
  helpL:"How to use", noMatch:"No keyword matches — load the sample or add more text",
  h1:"36 months of history are smoothed by additive Holt-Winters with period 12. α sets how fast the level reacts, β — the trend, γ — seasonality; the horizon slider sets forecast length. The dashed pair is a ±1.28·RMSE (~80%) band; MAPE is in-sample error — under 10% is good for monthly data. Push α high and γ low to watch the forecast chase noise.",
  h2:"Enter annual demand, order cost S, holding cost H, lead time and demand σ. EOQ=√(2DS/H) is the cost-optimal lot; safety stock SS=z·σ·√LT absorbs demand noise at the chosen service level; ROP=d·LT+SS is where the sawtooth chart places a new order. Orders per year = D/EOQ. In the ABC table, class A (~80% of value) deserves the tightest control.",
  h3:"A 90-day MRP projection: stock drains at average daily demand, and a purchase order is proposed whenever inventory position (on hand + on order) minus demand over the lead time falls to safety stock. Order size = max(MOQ, demand × coverage days). The table lists order date, arrival and the coverage each PO provides.",
  h4:"Move the criterion weights — risk is inverted (10−score), so low risk earns points. The score is a weighted average per supplier; the table re-ranks live and the radar compares the top-3 profiles. Push one weight to 10 and the rest to 0 to get a single-criterion ranking.",
  h5:"12 random stops around a central depot. Grey dashes — visiting in list order; teal — nearest-neighbour route improved by 2-opt (uncrossing segments). Regenerate for a new map; the KPIs show route length and the typical 20-40% saving of optimization over naive sequencing.",
  h6:"60 cells (6 aisles × 10 bays) are slotted by ABC: fast movers (A, teal) sit near the dock, C — farthest. The dashed line is the serpentine pick route for an 8-SKU list; numbers show visit order. KPIs compare this path against the same picks under random slotting — that gap is the payoff of slotting.",
  h7:"Health is scored from vibration, temperature and running hours; RUL (remaining useful life, days) decays as health^1.7; the 30-day failure probability is a logistic function of health. Click a row to see its vibration trend against the ISO 7.1 mm/s alarm line. Red — intervene now, amber — plan service, green — keep running.",
  h8:"Left: a simulated batch of 24 parts through a detector with 95% recall and 3% false alarms — the grid shows hits (red), misses (violet) and false alarms (amber), with precision/recall computed. Right: upload a real photo — Claude Vision inspects it and returns a verdict, confidence and a defect list in the interface language.",
  h9:"Edit probability and impact (1-5) for each risk; level = p×i (low <6, medium 6-12, high ≥13) with a suggested mitigation depth. The 5×5 matrix shows where risks cluster; the portfolio index is Σ(p·i) normalized to 100. Set any risk to 5×5 and watch the index and matrix react.",
  h10:"ETA = distance/speed by mode (road gets ×1.45 for driver rest), inflated by the weather and congestion multipliers, plus fixed handling per mode and customs hours. The ± window is a σ estimate dominated by customs variability. The bars show where the hours go — handy when arguing mode choice.",
  h11:"A keyword classifier: the text is scored against trilingual dictionaries for 5 document or 5 product classes; confidence = top score / sum of scores. Paste your own text or load the sample. Zero matches means the dictionary saw nothing familiar — a reminder that rule-based NLP lives and dies by vocabulary coverage.",
  h12:"Paste invoice text and press Extract — regex parsing pulls number, date, tax ID, supplier, total (the largest 'total-like' figure wins), VAT, currency and line count; the number parser reads both '76 320,00' and '12,720.00'. Or upload a photo/scan — Claude Vision performs OCR and returns the same fields as JSON.",
  h13:"A chat assistant scoped to warehouse and procurement practice (FIFO/FEFO, cycle counts, GRN, PO approvals). It answers in the interface language and knows which module of this suite computes what. The full dialogue history is sent on every turn, so follow-up questions work.",
  h14:"Edit the order lines (dimensions, qty, weight) and press Pack. Units are sorted by volume and packed first-fit-decreasing into the smallest suitable box, respecting dimensions, ≤85% volume fill and weight limits. The baseline packs each line separately into M boxes with no consolidation — the KPI shows boxes saved.",
  h15:"Each shipment contributes t·km × emission factor (g CO2e per t·km: road 62, rail 22, sea 8, air 602) and energy via kWh per t·km. Edit lanes or tonnage and the totals recompute; the slider models shifting a share of road t·km to rail — the scenario KPI shows the resulting CO2e cut.",
},
ru: {
  tagline: "Интеллект цепочек поставок · 15 модулей",
  m1:"Прогнозирование спроса", m2:"Управление запасами", m3:"Планирование закупок",
  m4:"Оценка поставщиков", m5:"Оптимизация маршрутов", m6:"Оптимизация склада",
  m7:"Предиктивное обслуживание", m8:"Контроль качества", m9:"Анализ рисков",
  m10:"Прогноз ETA", m11:"Классификация", m12:"Документы и OCR",
  m13:"AI-ассистент", m14:"Оптимизация упаковки", m15:"Устойчивое развитие",
  d1:"Тройное сглаживание Holt–Winters, доверительная полоса, MAPE",
  d2:"EOQ, страховой запас, точка заказа, ABC-анализ",
  d3:"MRP-логика: когда и сколько заказывать с учётом MOQ и срока поставки",
  d4:"Взвешенная многокритериальная модель с радар-сравнением",
  d5:"Эвристики «ближайший сосед» + 2-opt, экономия дистанции",
  d6:"ABC-слоттинг и серпантинный маршрут комплектовщика",
  d7:"Индекс состояния, остаточный ресурс, вероятность отказа",
  d8:"Статистика партии + анализ фото через Claude Vision",
  d9:"Реестр рисков и матрица вероятность × влияние",
  d10:"Модель времени в пути: транспорт, погода, таможня, пробки",
  d11:"Классификация документов и товаров по ключевым признакам",
  d12:"Извлечение полей счёта: парсер текста + Claude Vision OCR",
  d13:"Ассистент склада и закупок на Claude API",
  d14:"3D-упаковка в коробки (first-fit decreasing)",
  d15:"CO2e на тонно-км и сценарии modal shift",
  calc:"Рассчитать", optimize:"Оптимизировать", reset:"Сброс", add:"Добавить", del:"Удалить",
  send:"Отправить", sample:"Пример", results:"Результаты", params:"Параметры",
  uUnits:"ед.", uDays:"дн.", uKm:"км", uKg:"кг", uPcs:"шт", uMonth:"мес",
  name:"Название", qty:"Кол-во", total:"Итого", date:"Дата", score:"Балл",
  horizon:"Горизонт прогноза, мес", alphaL:"α — уровень", betaL:"β — тренд",
  gammaL:"γ — сезонность", history:"История продаж", forecastL:"Прогноз",
  mape:"MAPE", peak:"Пик сезона", growth:"Тренд, %/год", ciL:"Полоса ±1.28·RMSE",
  annualD:"Годовой спрос, ед.", orderCost:"Стоимость заказа, $", holdCost:"Хранение, $/ед./год",
  leadTime:"Срок поставки, дн.", service:"Уровень сервиса", sigmaD:"σ дневного спроса",
  eoqL:"EOQ — оптимальная партия", ropL:"Точка заказа (ROP)", ssL:"Страховой запас",
  opyL:"Заказов в год", abcL:"ABC-анализ", skuL:"SKU", shareL:"Доля, %",
  classL:"Класс", simL:"Симуляция запаса, 120 дней", stockL:"Запас",
  avgD:"Средний спрос, ед./мес", curStock:"Текущий запас, ед.", moqL:"Мин. партия (MOQ)",
  coverT:"Целевое покрытие, дн.", planL:"План закупок, 90 дней", poDate:"Дата заказа",
  arriveL:"Приход", coverageL:"Покрытие", noPO:"Заказы на горизонте не требуются",
  weightsL:"Веса критериев", wPrice:"Цена", wQual:"Качество", wDeliv:"Срок поставки",
  wRel:"Надёжность", wRisk:"Риск", rankL:"Ранг", bestL:"Рекомендован", supplierL:"Поставщик",
  nPoints:"Точек доставки", regen:"Новые точки", beforeL:"До оптимизации",
  afterL:"После (NN + 2-opt)", distL:"Дистанция", savingL:"Экономия", depotL:"Депо",
  layoutL:"План склада — ABC-слоттинг", pickL:"Лист комплектации", optPathL:"Оптимизированный маршрут",
  randPathL:"Случайное размещение", gainL:"Выигрыш", dockL:"Отгрузка",
  clsA:"A — быстрый оборот", clsB:"B — средний", clsC:"C — медленный",
  equipL:"Оборудование", healthL:"Индекс состояния", rulL:"Ресурс, дн.", failL:"P(отказ), 30 дн.",
  vibL:"Вибрация, мм/с", tempL:"Темп., °C", hoursL:"Наработка, ч", actionL:"Действие",
  actNow:"Срочное ТО", actPlan:"Плановое ТО", actOk:"Норма",
  trendL:"Тренд вибрации, 12 недель",
  runBatch:"Проверить демо-партию", uploadL:"Загрузить фото", analyzeL:"Анализ Claude Vision",
  analyzing:"Анализ…", passL:"Годных", defL:"Дефекты", precL:"Точность (precision)", recL:"Полнота (recall)",
  vPass:"ГОДЕН", vFail:"БРАК", sevL:"Критичность", dScr:"Царапина", dCrk:"Трещина",
  dCon:"Загрязнение", dAli:"Смещение", missedL:"Пропущено (FN)", falseL:"Ложная тревога (FP)",
  visionH:"Загрузите фото изделия — Claude опишет видимые дефекты",
  regL:"Реестр рисков", riskN:"Риск", probL:"Вероятность", impactL:"Влияние", levelL:"Уровень",
  lowL:"Низкий", medL:"Средний", highL:"Высокий", matrixL:"Матрица вероятность × влияние",
  mitL:"Меры", mLow:"Мониторинг", mMed:"Второй источник, буферный запас",
  mHigh:"Дублирующий поставщик + страховой запас + страхование", indexL:"Индекс риска портфеля",
  rk1:"Единственный поставщик чипов", rk2:"Заторы в порту", rk3:"Валютная волатильность",
  rk4:"Забастовка перевозчика", rk5:"Сбой ERP", rk6:"Геополитика на маршруте",
  modeL:"Транспорт", road:"Авто", rail:"ЖД", sea:"Море", air:"Авиа", distKm:"Расстояние, км",
  weatherL:"Погодный фактор", customsL:"Таможня, ч", congestL:"Загруженность дорог",
  etaL:"Ожидаемое прибытие", transitL:"В пути", windowL:"Окно ±σ",
  breakL:"Структура времени, часы", handlingL:"Обработка / терминал",
  tabDoc:"Тип документа", tabProd:"Категория товара", inputL:"Текст", classifyL:"Классифицировать",
  confL:"Уверенность", docI:"Счёт-фактура", docW:"Накладная", docP:"Упаковочный лист",
  docO:"Заказ (PO)", docC:"Договор", catE:"Электроника", catF:"Продукты",
  catA:"Одежда", catH:"Химия", catB:"Стройматериалы",
  clsPh:"Вставьте текст или загрузите пример",
  prodSample:"Кабель HDMI, роутер Wi-Fi, LED-монитор 24 дюйма, клавиатура",
  ocrPaste:"Вставьте текст счёта", extractL:"Извлечь поля", imgL:"Загрузить изображение",
  viaClaude:"Claude Vision OCR", invNo:"Номер счёта", invDate:"Дата", invSupp:"Поставщик",
  invTax:"ИНН / VÖEN", invAmt:"Сумма", invVat:"НДС", invCur:"Валюта", invLines:"Позиций",
  sampleL:"Пример счёта", parsingL:"Обработка…", noneFound:"—",
  chatPh:"Спросите о запасах, закупках, процедурах склада…", thinkingL:"Думаю…",
  clearL:"Очистить", chatHello:"Здравствуйте! Я ассистент по складу и закупкам. Чем помочь?",
  itemsL:"Товары", boxesL:"Каталог коробок", packL:"Упаковать", fillL:"Заполнение",
  usedL:"Использовано коробок", saveL:"Экономия к базе",
  baseL:"База: next-fit по каждой позиции отдельно, только коробки M, без консолидации", dimsL:"Д×Ш×В, см",
  weightL:"Вес, кг", boxCol:"Коробка",
  shipsL:"Перевозки", emisL:"Выбросы CO2e", byModeL:"По видам транспорта", shiftL:"Перенос авто → ЖД",
  scenL:"Выбросы по сценарию", energyL:"Энергия", tonsL:"т",
  efNote:"EF, г CO2e/т·км: авто 62 · ЖД 22 · море 8 · авиа 602",
  sampleInv:`ООО "ТехноПоставка"        ИНН 7701234567
СЧЁТ-ФАКТУРА № INV-2417  Дата: 14.06.2026
Покупатель: ООО "Каспий Трейд"
1. Кабель HDMI 2.1   24 шт x 850,00 = 20 400,00
2. Роутер AX-3000     6 шт x 7 200,00 = 43 200,00
Итого без НДС: 63 600,00
НДС 20%: 12 720,00
ИТОГО К ОПЛАТЕ: 76 320,00 RUB`,
  apiErr:"Claude API недоступен в этой среде",
  linkL:"Данные платформы", importL:"Импорт", exportL:"Экспорт XLSX", importedL:"Импортировано строк", badCsv:"CSV не распознан",
  csvHintSales:"CSV: колонка value, помесячно", csvHintItems:"CSV: name,l,w,h,qty,wt", csvHintShip:"CSV: mode,km,tn",
  btT:"Backtest · отложены последние 6 мес", btHw:"MAPE модели", btNv:"MAPE naive-seasonal",
  beatsL:"модель лучше базы", loseL:"базу не превосходит", btShort:"история короче 30 точек — backtest выключен",
  servFact:"Сервис факт (симуляция)", fcSrc:"Σ прогноза на 12 мес",
  sensT:"Чувствительность весов — где сменится лидер", flipDn:"↓ при ≤", flipUp:"↑ при ≥", stableL:"устойчив на 0–10",
  thrL:"Порог детектора",
  mcT:"Monte-Carlo · 2000 сценариев", expLoss:"Ожидаемые потери", p90Loss:"Потери P90",
  exceedT:"Кривая превышения P(потери ≥ x), k$", unitCost:"Стоимость балла влияния, k$",
  rkSup:"Концентрация на рискованном поставщике",
  etaP50:"ETA P50", etaP90:"ETA P90",
  linesT:"Позиции", priceL:"Цена", sumL:"Сумма",
  chkLines:"Σ позиций + НДС = Итог", chkVat:"ставка × база = НДС", okB:"сходится", failB:"расхождение",
  layoutT:"3D-раскладка (shelf packing)", notPlaced:"не поместилось в раскладку:",
  co2PriceL:"Цена углерода, €/т", co2SaveL:"Ценность сценария",
  scnA:"Сценарий A", scnB:"Сценарий B", saveS:"Сохранить", loadS:"Загрузить", emptyS:"пусто",
  compareT:"Сравнение сценариев", metricL:"Метрика", curL:"Текущее", resetDemo:"Сбросить демо-данные",
  crashT:"Модуль упал", retryL:"Перезапустить",
  prmL:"парам.", askEx1:"Открой запасы со спросом 20000", askEx2:"Поставь ЖД в ETA и открой модуль",
  clsAI:"Спросить Claude", aiSays:"Claude", agreeL:"совпадает", disagreeL:"расходится",
  helpL:"Как пользоваться", noMatch:"Совпадений по словарю нет — загрузите образец или добавьте текста",
  h1:"36 месяцев истории сглаживаются аддитивным Хольт–Винтерсом с периодом 12. α задаёт скорость реакции уровня, β — тренда, γ — сезонности; слайдер горизонта — длину прогноза. Пунктирная пара — полоса ±1.28·RMSE (~80%); MAPE — ошибка на истории, для месячных данных <10% — хорошо. Выкрутите α вверх, а γ вниз — прогноз начнёт гнаться за шумом.",
  h2:"Задайте годовой спрос, стоимость заказа S, хранение H, срок поставки и σ спроса. EOQ=√(2DS/H) — оптимальная по издержкам партия; страховой запас SS=z·σ·√LT гасит шум спроса на выбранном уровне сервиса; ROP=d·LT+SS — точка, где на графике-«пиле» размещается новый заказ. Заказов в год = D/EOQ. В ABC-таблице класс A (~80% стоимости) требует самого жёсткого контроля.",
  h3:"MRP-проекция на 90 дней: запас списывается средним дневным спросом, и заказ предлагается, когда позиция запаса (на складе + в пути) минус спрос за срок поставки опускается до страхового запаса. Размер = max(MOQ, спрос × дни покрытия). В таблице — дата заказа, прибытие и покрытие каждого PO.",
  h4:"Двигайте веса критериев — риск инвертирован (10−балл), низкий риск приносит очки. Балл — взвешенное среднее по поставщику; таблица пересортируется на лету, радар сравнивает профили топ-3. Выкрутите один вес на 10, остальные в 0 — получите рейтинг по одному критерию.",
  h5:"12 случайных точек вокруг центрального депо. Серый пунктир — объезд в порядке списка; бирюзовая линия — «ближайший сосед», улучшенный 2-opt (расшивка пересечений). «Пересоздать» даёт новую карту; KPI показывают длину и типовую экономию 20–40% относительно наивного порядка.",
  h6:"60 ячеек (6 проходов × 10 мест) размечены по ABC: быстрые A (бирюза) — у дока, C — дальше всех. Пунктир — серпантинный маршрут комплектации по списку из 8 SKU, цифры — порядок обхода. KPI сравнивают этот путь с теми же отборами при случайной раскладке — разница и есть эффект слоттинга.",
  h7:"Health считается из вибрации, температуры и наработки; RUL (остаточный ресурс, дни) убывает как health^1.7; вероятность отказа за 30 дней — логистическая функция health. Клик по строке — тренд вибрации против аварийной линии ISO 7.1 мм/с. Красное — вмешаться сейчас, янтарное — планировать сервис, зелёное — работать дальше.",
  h9:"Меняйте вероятность и влияние (1–5) каждого риска; уровень = p×i (низкий <6, средний 6–12, высокий ≥13) с рекомендуемой глубиной мер. Матрица 5×5 показывает, где кучкуются риски; индекс портфеля — Σ(p·i), нормированная к 100. Поставьте любому риску 5×5 — индекс и матрица отреагируют.",
  h8:"Слева — симуляция партии из 24 деталей через детектор с recall 95% и 3% ложных срабатываний: сетка показывает попадания (красный), пропуски (фиолетовый) и ложные тревоги (янтарный), считаются precision/recall. Справа — загрузите реальное фото: Claude Vision осмотрит его и вернёт вердикт, уверенность и список дефектов на языке интерфейса.",
  h10:"ETA = расстояние/скорость по виду транспорта (авто ×1.45 на отдых водителя), умноженное на множители погоды и пробок, плюс фиксированный хендлинг и часы таможни. Окно ± — оценка σ, в которой доминирует изменчивость таможни. Столбцы показывают, куда уходят часы — удобно при обосновании выбора транспорта.",
  h11:"Словарный классификатор: текст оценивается по трёхъязычным словарям для 5 классов документов или 5 товарных категорий; уверенность = лучший балл / сумма баллов. Вставьте свой текст или загрузите образец. Ноль совпадений значит, что словарь не узнал лексику — напоминание, что rule-based NLP живёт покрытием словаря.",
  h12:"Вставьте текст счёта и нажмите «Извлечь» — regex вытащит номер, дату, ИНН/VÖEN, поставщика, итог (побеждает наибольшая «итоговая» сумма), НДС, валюту и число позиций; парсер чисел читает и «76 320,00», и «12,720.00». Либо загрузите фото/скан — Claude Vision сделает OCR и вернёт те же поля в JSON.",
  h13:"Чат-ассистент в рамках складской и закупочной практики (FIFO/FEFO, циклический пересчёт, GRN, согласование PO). Отвечает на языке интерфейса и знает, какой модуль этого набора что считает. Вся история диалога отправляется при каждом ходе, поэтому уточняющие вопросы работают.",
  h14:"Отредактируйте строки заказа (габариты, количество, вес) и нажмите «Упаковать». Юниты сортируются по объёму и укладываются first-fit-decreasing в наименьшую подходящую коробку с учётом габаритов, заполнения ≤85% и лимита веса. База пакует каждую позицию отдельно в коробки M без консолидации — KPI показывает экономию коробок.",
  h15:"Каждая перевозка даёт т·км × фактор выбросов (г CO2e на т·км: авто 62, ЖД 22, море 8, авиа 602) и энергию через кВт·ч/т·км. Правьте плечи и тоннаж — итоги пересчитаются; слайдер моделирует перевод доли автомобильных т·км на ЖД, сценарный KPI показывает срез CO2e.",
},
az: {
  tagline: "Təchizat zənciri intellekti · 15 modul",
  m1:"Tələb proqnozlaşdırılması", m2:"Ehtiyatların idarə edilməsi", m3:"Satınalma planlaması",
  m4:"Təchizatçı qiymətləndirməsi", m5:"Marşrut optimallaşdırması", m6:"Anbar optimallaşdırması",
  m7:"Proqnozlaşdırıcı texniki xidmət", m8:"Keyfiyyət nəzarəti", m9:"Risk təhlili",
  m10:"ETA proqnozu", m11:"Təsnifat", m12:"Sənədlər və OCR",
  m13:"AI köməkçi", m14:"Qablaşdırma optimallaşdırması", m15:"Dayanıqlılıq",
  d1:"Holt–Winters üçqat hamarlaşdırma, etibar zolağı, MAPE",
  d2:"EOQ, sığorta ehtiyatı, sifariş nöqtəsi, ABC təhlili",
  d3:"MRP məntiqi: MOQ və çatdırılma müddətinə görə nə vaxt, nə qədər",
  d4:"Çəkili çoxmeyarlı model, radar müqayisəsi",
  d5:"Ən yaxın qonşu + 2-opt evristikaları, məsafə qənaəti",
  d6:"ABC yerləşdirmə və serpantin yığım marşrutu",
  d7:"Vəziyyət indeksi, qalıq resurs, nasazlıq ehtimalı",
  d8:"Partiya statistikası + Claude Vision ilə foto analizi",
  d9:"Risk reyestri və ehtimal × təsir matrisi",
  d10:"Yol vaxtı modeli: nəqliyyat, hava, gömrük, sıxlıq",
  d11:"Açar sözlərə görə sənəd və məhsul təsnifatı",
  d12:"Hesab sahələrinin çıxarılması: mətn parseri + Claude Vision OCR",
  d13:"Claude API əsasında anbar və satınalma köməkçisi",
  d14:"3D qablaşdırma (first-fit decreasing)",
  d15:"t·km üzrə CO2e və modal keçid ssenariləri",
  calc:"Hesabla", optimize:"Optimallaşdır", reset:"Sıfırla", add:"Əlavə et", del:"Sil",
  send:"Göndər", sample:"Nümunə", results:"Nəticələr", params:"Parametrlər",
  uUnits:"əd.", uDays:"gün", uKm:"km", uKg:"kq", uPcs:"əd", uMonth:"ay",
  name:"Ad", qty:"Miqdar", total:"Cəmi", date:"Tarix", score:"Bal",
  horizon:"Proqnoz üfüqü, ay", alphaL:"α — səviyyə", betaL:"β — trend",
  gammaL:"γ — mövsümilik", history:"Tarixi satışlar", forecastL:"Proqnoz",
  mape:"MAPE", peak:"Mövsümi pik", growth:"Trend, %/il", ciL:"±1.28·RMSE zolağı",
  annualD:"İllik tələb, əd.", orderCost:"Sifariş xərci, $", holdCost:"Saxlama, $/əd./il",
  leadTime:"Çatdırılma, gün", service:"Xidmət səviyyəsi", sigmaD:"Günlük tələbin σ-sı",
  eoqL:"EOQ — optimal partiya", ropL:"Sifariş nöqtəsi (ROP)", ssL:"Sığorta ehtiyatı",
  opyL:"İldə sifariş", abcL:"ABC təhlili", skuL:"SKU", shareL:"Pay, %",
  classL:"Sinif", simL:"Ehtiyat simulyasiyası, 120 gün", stockL:"Ehtiyat",
  avgD:"Orta tələb, əd./ay", curStock:"Cari ehtiyat, əd.", moqL:"Min. partiya (MOQ)",
  coverT:"Hədəf əhatə, gün", planL:"Satınalma planı, 90 gün", poDate:"Sifariş tarixi",
  arriveL:"Gəlmə", coverageL:"Əhatə", noPO:"Üfüqdə sifariş tələb olunmur",
  weightsL:"Meyar çəkiləri", wPrice:"Qiymət", wQual:"Keyfiyyət", wDeliv:"Çatdırılma müddəti",
  wRel:"Etibarlılıq", wRisk:"Risk", rankL:"Sıra", bestL:"Tövsiyə olunur", supplierL:"Təchizatçı",
  nPoints:"Çatdırılma nöqtələri", regen:"Yeni nöqtələr", beforeL:"Optimallaşdırmadan əvvəl",
  afterL:"Sonra (NN + 2-opt)", distL:"Məsafə", savingL:"Qənaət", depotL:"Depo",
  layoutL:"Anbar planı — ABC yerləşdirmə", pickL:"Yığım siyahısı", optPathL:"Optimal marşrut",
  randPathL:"Təsadüfi yerləşdirmə", gainL:"Qazanc", dockL:"Yükləmə",
  clsA:"A — sürətli dövriyyə", clsB:"B — orta", clsC:"C — yavaş",
  equipL:"Avadanlıq", healthL:"Vəziyyət indeksi", rulL:"Resurs, gün", failL:"Nasazlıq, 30 gün",
  vibL:"Vibrasiya, mm/s", tempL:"Temp., °C", hoursL:"İş saatı", actionL:"Tədbir",
  actNow:"Təcili xidmət", actPlan:"Planlı TX", actOk:"Normal",
  trendL:"Vibrasiya trendi, 12 həftə",
  runBatch:"Demo partiyanı yoxla", uploadL:"Şəkil yüklə", analyzeL:"Claude Vision analizi",
  analyzing:"Analiz edilir…", passL:"Yararlılıq", defL:"Qüsurlar", precL:"Precision", recL:"Recall",
  vPass:"YARARLI", vFail:"BRAK", sevL:"Ciddilik", dScr:"Cızıq", dCrk:"Çat",
  dCon:"Çirklənmə", dAli:"Yanlış mövqe", missedL:"Ötürülüb (FN)", falseL:"Yalan həyəcan (FP)",
  visionH:"Məhsul fotosunu yükləyin — Claude görünən qüsurları təsvir edəcək",
  regL:"Risk reyestri", riskN:"Risk", probL:"Ehtimal", impactL:"Təsir", levelL:"Səviyyə",
  lowL:"Aşağı", medL:"Orta", highL:"Yüksək", matrixL:"Ehtimal × təsir matrisi",
  mitL:"Tədbir", mLow:"Monitorinq", mMed:"Alternativ mənbə, bufer ehtiyat",
  mHigh:"Dublyor təchizatçı + sığorta ehtiyatı + sığorta", indexL:"Portfel risk indeksi",
  rk1:"Yeganə çip təchizatçısı", rk2:"Limanda sıxlıq", rk3:"Valyuta dəyişkənliyi",
  rk4:"Daşıyıcı tətili", rk5:"ERP nasazlığı", rk6:"Marşrutda geosiyasi risk",
  modeL:"Nəqliyyat", road:"Avto", rail:"Dəmir yolu", sea:"Dəniz", air:"Hava", distKm:"Məsafə, km",
  weatherL:"Hava faktoru", customsL:"Gömrük, saat", congestL:"Yol sıxlığı",
  etaL:"Gözlənilən çatma", transitL:"Yolda", windowL:"±σ pəncərə",
  breakL:"Vaxtın strukturu, saat", handlingL:"Emal / terminal",
  tabDoc:"Sənəd növü", tabProd:"Məhsul kateqoriyası", inputL:"Mətn", classifyL:"Təsnif et",
  confL:"Əminlik", docI:"Hesab-faktura", docW:"Qaimə", docP:"Qablaşdırma vərəqi",
  docO:"Sifariş (PO)", docC:"Müqavilə", catE:"Elektronika", catF:"Qida",
  catA:"Geyim", catH:"Kimya", catB:"Tikinti",
  clsPh:"Mətn daxil edin və ya nümunə yükləyin",
  prodSample:"HDMI kabel, Wi-Fi router, 24 düym LED monitor, klaviatura",
  ocrPaste:"Hesab mətnini yapışdırın", extractL:"Sahələri çıxar", imgL:"Şəkil yüklə",
  viaClaude:"Claude Vision OCR", invNo:"Hesab №", invDate:"Tarix", invSupp:"Təchizatçı",
  invTax:"VÖEN", invAmt:"Cəmi", invVat:"ƏDV", invCur:"Valyuta", invLines:"Mövqe sayı",
  sampleL:"Nümunə hesab", parsingL:"Emal…", noneFound:"—",
  chatPh:"Ehtiyat, satınalma, anbar prosedurları barədə soruşun…", thinkingL:"Düşünürəm…",
  clearL:"Təmizlə", chatHello:"Salam! Anbar və satınalma üzrə köməkçiyəm. Nə ilə kömək edim?",
  itemsL:"Mallar", boxesL:"Qutu kataloqu", packL:"Qablaşdır", fillL:"Doluluq",
  usedL:"İstifadə olunan qutu", saveL:"Bazaya nisbətən qənaət",
  baseL:"Baza: hər sətir ayrıca next-fit, yalnız M qutular, konsolidasiyasız", dimsL:"U×E×H, sm",
  weightL:"Çəki, kq", boxCol:"Qutu",
  shipsL:"Daşımalar", emisL:"CO2e emissiyası", byModeL:"Növ üzrə", shiftL:"Avto → dəmir yolu keçidi",
  scenL:"Ssenari üzrə emissiya", energyL:"Enerji", tonsL:"t",
  efNote:"EF, q CO2e/t·km: avto 62 · d/y 22 · dəniz 8 · hava 602",
  sampleInv:`"Texno Təchizat" MMC     VÖEN 1401234567
HESAB-FAKTURA № INV-2417   Tarix: 14.06.2026
Alıcı: "Xəzər Treyd" MMC
1. HDMI 2.1 kabel   24 əd x 14,50 = 348,00
2. Router AX-3000    6 əd x 120,00 = 720,00
Cəmi: 1 068,00
ƏDV 18%: 192,24
YEKUN: 1 260,24 AZN`,
  apiErr:"Claude API bu mühitdə əlçatan deyil",
  linkL:"Platforma datası", importL:"İdxal", exportL:"XLSX ixrac", importedL:"İdxal olunan sətir", badCsv:"CSV tanınmadı",
  csvHintSales:"CSV: value sütunu, aylıq", csvHintItems:"CSV: name,l,w,h,qty,wt", csvHintShip:"CSV: mode,km,tn",
  btT:"Backtest · son 6 ay kənarda", btHw:"Model MAPE", btNv:"Naive-seasonal MAPE",
  beatsL:"model bazadan yaxşıdır", loseL:"bazanı ötmür", btShort:"tarix 30 nöqtədən qısadır — backtest söndürülüb",
  servFact:"Faktiki servis (simulyasiya)", fcSrc:"12 aylıq proqnozun Σ-ı",
  sensT:"Çəki həssaslığı — lider harada dəyişir", flipDn:"↓ ≤", flipUp:"↑ ≥", stableL:"0–10 arasında sabit",
  thrL:"Detektor həddi",
  mcT:"Monte-Carlo · 2000 ssenari", expLoss:"Gözlənilən itki", p90Loss:"P90 itki",
  exceedT:"Aşma əyrisi P(itki ≥ x), k$", unitCost:"Təsir balının dəyəri, k$",
  rkSup:"Riskli təchizatçıya konsentrasiya",
  etaP50:"ETA P50", etaP90:"ETA P90",
  linesT:"Sətirlər", priceL:"Qiymət", sumL:"Məbləğ",
  chkLines:"Σ sətirlər + ƏDV = Yekun", chkVat:"dərəcə × baza = ƏDV", okB:"uyğundur", failB:"uyğunsuzluq",
  layoutT:"3D yerləşdirmə (shelf packing)", notPlaced:"yerləşmədi:",
  co2PriceL:"Karbon qiyməti, €/t", co2SaveL:"Ssenarinin dəyəri",
  scnA:"Ssenari A", scnB:"Ssenari B", saveS:"Saxla", loadS:"Yüklə", emptyS:"boş",
  compareT:"Ssenari müqayisəsi", metricL:"Metrik", curL:"Cari", resetDemo:"Demo datanı sıfırla",
  crashT:"Modul çökdü", retryL:"Yenidən başlat",
  prmL:"param.", askEx1:"Tələb 20000 ilə ehtiyatları aç", askEx2:"ETA-da dəmir yolunu seç və modulu aç",
  clsAI:"Claude-dan soruş", aiSays:"Claude", agreeL:"uyğundur", disagreeL:"fərqlənir",
  helpL:"Necə istifadə etməli", noMatch:"Lüğət uyğunluğu yoxdur — nümunəni yükləyin və ya mətni artırın",
  h1:"36 aylıq tarix additiv Holt–Winters (dövr 12) ilə hamarlanır. α səviyyənin, β trendin, γ mövsümiliyin reaksiya sürətini idarə edir; horizont slayderi proqnozun uzunluğunu verir. Qırıq cüt xətt ±1.28·RMSE (~80%) zolağıdır; MAPE tarixi xətadır — aylıq data üçün <10% yaxşıdır. α-nı yuxarı, γ-nı aşağı çəkin — proqnoz səs-küyün dalınca düşəcək.",
  h2:"İllik tələbi, sifariş xərci S, saxlama xərci H, çatdırılma müddətini və tələb σ-nı daxil edin. EOQ=√(2DS/H) xərc-optimal partiyadır; SS=z·σ·√LT seçilmiş servis səviyyəsində tələb səs-küyünü udur; ROP=d·LT+SS — «mişar» qrafikində yeni sifarişin verildiyi nöqtə. İldə sifariş = D/EOQ. ABC cədvəlində A sinfi (~dəyərin 80%-i) ən ciddi nəzarət tələb edir.",
  h3:"90 günlük MRP proyeksiyası: ehtiyat orta günlük tələblə azalır, ehtiyat mövqeyi (anbarda + yolda) minus çatdırılma müddətindəki tələb təhlükəsizlik ehtiyatına düşəndə sifariş təklif olunur. Həcm = max(MOQ, tələb × örtük günləri). Cədvəldə sifariş tarixi, çatma və hər PO-nun örtüyü göstərilir.",
  h4:"Meyar çəkilərini dəyişin — risk tərsinə çevrilib (10−bal), aşağı risk xal qazandırır. Bal təchizatçı üzrə çəkili ortadır; cədvəl canlı yenidən sıralanır, radar top-3 profillərini müqayisə edir. Bir çəkini 10-a, qalanları 0-a çəkin — tək meyarlı reytinq alarsınız.",
  h5:"Mərkəzi depo ətrafında 12 təsadüfi nöqtə. Boz qırıq xətt — siyahı sırası ilə gediş; firuzəyi — 2-opt ilə yaxşılaşdırılmış «ən yaxın qonşu» marşrutu. «Yenidən yarat» yeni xəritə verir; KPI-lar uzunluğu və sadəlövh sıraya qarşı tipik 20–40% qənaəti göstərir.",
  h6:"60 xana (6 keçid × 10 yer) ABC üzrə bölünüb: sürətli A (firuzəyi) — doka yaxın, C — ən uzaqda. Qırıq xətt — 8 SKU siyahısı üçün serpantin yığım marşrutu, rəqəmlər gediş sırasıdır. KPI-lar bu yolu eyni yığımın təsadüfi yerləşdirməsi ilə müqayisə edir — fərq slotinqin effektidir.",
  h7:"Health vibrasiya, temperatur və iş saatlarından hesablanır; RUL (qalan resurs, gün) health^1.7 ilə azalır; 30 günlük nasazlıq ehtimalı health-in logistik funksiyasıdır. Sətrə klikləyin — ISO 7.1 mm/s xəttinə qarşı vibrasiya trendi. Qırmızı — dərhal müdaxilə, kəhrəba — servis planla, yaşıl — işlə.",
  h8:"Solda — recall 95% və 3% yalan siqnallı detektordan keçən 24 detallıq partiya simulyasiyası: şəbəkə tapıntıları (qırmızı), buraxılanları (bənövşəyi) və yalan həyəcanları (kəhrəba) göstərir, precision/recall hesablanır. Sağda — real foto yükləyin: Claude Vision baxıb interfeys dilində verdikt, əminlik və defekt siyahısı qaytarır.",
  h9:"Hər risk üçün ehtimal və təsiri (1–5) dəyişin; səviyyə = p×i (aşağı <6, orta 6–12, yüksək ≥13) tövsiyə olunan tədbir dərinliyi ilə. 5×5 matris risklərin harada toplandığını göstərir; portfel indeksi Σ(p·i), 100-ə normallaşdırılıb. İstənilən riski 5×5 edin — indeks və matris reaksiya verəcək.",
  h10:"ETA = məsafə/sürət (avtoya sürücü istirahəti üçün ×1.45), hava və tıxac vuruqları ilə artırılır, üstəgəl növ üzrə sabit emal saatları və gömrük. ± pəncərə σ qiymətidir, burada gömrük dəyişkənliyi üstünlük təşkil edir. Sütunlar saatların hara getdiyini göstərir — nəqliyyat seçimini əsaslandırmağa kömək edir.",
  h11:"Açar sözlü təsnifatçı: mətn 5 sənəd və ya 5 məhsul sinfi üzrə üçdilli lüğətlərlə qiymətləndirilir; əminlik = ən yüksək bal / balların cəmi. Öz mətninizi yapışdırın və ya nümunəni yükləyin. Sıfır uyğunluq lüğətin leksikanı tanımadığını bildirir — rule-based NLP lüğət örtüyü ilə yaşayır.",
  h12:"Hesab mətnini yapışdırıb «Çıxar»a basın — regex nömrəni, tarixi, VÖEN-i, təchizatçını, yekunu (ən böyük «yekun» məbləği qalib gəlir), ƏDV-ni, valyutanı və sətir sayını çıxarır; ədəd parseri həm «76 320,00», həm «12,720.00» oxuyur. Və ya foto/skan yükləyin — Claude Vision OCR edib eyni sahələri JSON kimi qaytarır.",
  h13:"Anbar və satınalma praktikası çərçivəsində çat-assistent (FIFO/FEFO, dövri sayım, GRN, PO təsdiqi). İnterfeys dilində cavab verir və bu dəstin hansı modulunun nəyi hesabladığını bilir. Hər gedişdə tam dialoq tarixi göndərilir, ona görə dəqiqləşdirici suallar işləyir.",
  h14:"Sifariş sətirlərini (ölçülər, say, çəki) redaktə edib «Qablaşdır»a basın. Vahidlər həcmə görə sıralanır və ölçü, ≤85% doluluq və çəki limiti nəzərə alınmaqla ən kiçik uyğun qutuya first-fit-decreasing yığılır. Baza hər sətri konsolidasiyasız ayrıca M qutulara yığır — KPI qutu qənaətini göstərir.",
  h15:"Hər daşıma t·km × emissiya faktoru (q CO2e / t·km: avto 62, dəmir yolu 22, dəniz 8, hava 602) və kVt·saat/t·km ilə enerji verir. Çiyinləri və tonajı dəyişin — yekunlar yenilənir; slayder avto t·km payının dəmir yoluna keçidini modelləşdirir, ssenari KPI CO2e azalmasını göstərir.",
},
};

/* ------------------------------ core math ------------------------------ */
function holtWinters(y, alpha, beta, gamma, p, h) {
  const n = y.length;
  let level = y.slice(0, p).reduce((a, b) => a + b, 0) / p;
  let trend =
    (y.slice(p, 2 * p).reduce((a, b) => a + b, 0) -
      y.slice(0, p).reduce((a, b) => a + b, 0)) / (p * p);
  const seas = [];
  for (let i = 0; i < p; i++) seas.push(y[i] - level);
  const fitted = [];
  let sse = 0, cnt = 0, ape = 0;
  for (let i = 0; i < n; i++) {
    const s = seas[i % p];
    const f = level + trend + s;
    fitted.push(f);
    if (i >= p) { sse += (y[i] - f) ** 2; ape += Math.abs(y[i] - f) / y[i]; cnt++; }
    const lastL = level;
    level = alpha * (y[i] - s) + (1 - alpha) * (level + trend);
    trend = beta * (level - lastL) + (1 - beta) * trend;
    seas[i % p] = gamma * (y[i] - level) + (1 - gamma) * s;
  }
  const rmse = Math.sqrt(sse / Math.max(1, cnt));
  const mape = (ape / Math.max(1, cnt)) * 100;
  const fc = [];
  for (let k = 1; k <= h; k++) fc.push(level + k * trend + seas[(n + k - 1) % p]);
  return { fitted, forecast: fc, rmse, mape };
}

const genSales = () => {
  const r = mulberry32(42);
  const out = [];
  for (let i = 0; i < 36; i++) {
    const m = i % 12;
    const seas = 1 + 0.22 * Math.sin((m / 12) * 2 * Math.PI - 1.2) + (m === 11 ? 0.35 : 0);
    out.push(Math.round((380 + i * 6) * seas * (0.95 + 0.1 * r())));
  }
  return out;
};

function simInventory(D, S, H, LT, z, sd) {
  D = Math.max(1, D); S = Math.max(0.01, S); H = Math.max(0.01, H);
  LT = Math.max(0, LT); sd = Math.max(0, sd);
  const d = D / 365;
  const eoq = Math.sqrt((2 * D * S) / H);
  const ss = z * sd * Math.sqrt(LT);
  const rop = d * LT + ss;
  let stock = eoq + ss, pend = -1, demTot = 0, unmet = 0;
  const rows = [];
  const r = mulberry32(7);
  for (let t = 0; t < 120; t++) {
    if (pend === t) { stock += eoq; pend = -1; }
    const dem = Math.max(0, d + (r() - 0.5) * 2 * sd);
    demTot += dem;
    const served = Math.min(stock, dem);
    unmet += dem - served;
    stock -= served;
    if (stock <= rop && pend < 0) pend = t + LT;
    rows.push({ t, stock: Math.round(stock), rop: Math.round(rop) });
  }
  return { eoq, ss, rop, rows, opy: D / eoq, achieved: demTot ? 1 - unmet / demTot : 1 };
}

function planPOs(m, stock0, LT, moq, ss, coverT) {
  const d = Math.max(1e-6, m) / 30;
  let s = stock0, onOrder = 0;
  const arrivals = {}, pos = [];
  for (let t = 0; t < 90; t++) {
    if (arrivals[t]) { s += arrivals[t]; onOrder -= arrivals[t]; }
    if (s + onOrder - d * LT <= ss) {
      const q = Math.max(moq, Math.ceil(d * coverT));
      arrivals[t + LT] = (arrivals[t + LT] || 0) + q;
      onOrder += q;
      pos.push({ t, arrive: t + LT, qty: q, cover: q / d });
    }
    s = Math.max(0, s - d);
  }
  return pos;
}

const dist2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const tourLen = (pts, ord) => {
  let s = 0;
  for (let i = 0; i < ord.length; i++) s += dist2(pts[ord[i]], pts[ord[(i + 1) % ord.length]]);
  return s;
};
function nearestNeighbor(pts) {
  const n = pts.length, used = Array(n).fill(false), ord = [0];
  used[0] = true;
  for (let k = 1; k < n; k++) {
    const last = pts[ord[ord.length - 1]];
    let best = -1, bd = 1e9;
    for (let i = 0; i < n; i++)
      if (!used[i]) { const d = dist2(last, pts[i]); if (d < bd) { bd = d; best = i; } }
    used[best] = true; ord.push(best);
  }
  return ord;
}
function twoOpt(ord, pts) {
  const o = ord.slice();
  let improved = true, guard = 0;
  while (improved && guard++ < 60) {
    improved = false;
    for (let i = 1; i < o.length - 1; i++)
      for (let j = i + 1; j < o.length; j++) {
        const a = pts[o[i - 1]], b = pts[o[i]], c = pts[o[j]], d = pts[o[(j + 1) % o.length]];
        if (dist2(a, c) + dist2(b, d) < dist2(a, b) + dist2(c, d) - 1e-9) {
          let l = i, r = j;
          while (l < r) { const tmp = o[l]; o[l] = o[r]; o[r] = tmp; l++; r--; }
          improved = true;
        }
      }
  }
  return o;
}

const BOX_TYPES = [
  { id: "S", l: 30, w: 25, h: 20, maxW: 8 },
  { id: "M", l: 45, w: 35, h: 30, maxW: 15 },
  { id: "L", l: 60, w: 45, h: 40, maxW: 25 },
  { id: "XL", l: 80, w: 60, h: 50, maxW: 40 },
].map((b) => ({ ...b, vol: b.l * b.w * b.h }));

const fitsDims = (it, b) => {
  const a = [it.l, it.w, it.h].sort((x, y) => x - y);
  const c = [b.l, b.w, b.h].sort((x, y) => x - y);
  return a[0] <= c[0] && a[1] <= c[1] && a[2] <= c[2];
};
function packFFD(items) {
  const units = [];
  items.forEach((it) =>
    Array.from({ length: it.qty }, () =>
      units.push({ ...it, vol: it.l * it.w * it.h })));
  units.sort((a, b) => b.vol - a.vol);
  const open = [];
  for (const u of units) {
    let placed = open.find(
      (bx) => fitsDims(u, bx.type) && bx.vol + u.vol <= bx.type.vol * 0.85 && bx.wt + u.wt <= bx.type.maxW);
    if (!placed) {
      const tp = BOX_TYPES.find(
        (b) => fitsDims(u, b) && u.vol <= b.vol * 0.85 && u.wt <= b.maxW) || BOX_TYPES[3];
      placed = { type: tp, vol: 0, wt: 0, items: [], units: [] };
      open.push(placed);
    }
    placed.vol += u.vol; placed.wt += u.wt; placed.items.push(u.name); placed.units.push(u);
  }
  return open;
}
function packBaseline(items) {
  const cap = BOX_TYPES[1].vol * 0.85;
  let boxes = 0;
  items.forEach((it) => {
    const v = it.l * it.w * it.h;
    let vol = cap + 1; // каждая позиция стартует с новой коробки — без консолидации
    for (let k = 0; k < it.qty; k++) {
      if (vol + v > cap) { boxes++; vol = 0; }
      vol += v;
    }
  });
  return boxes;
}

const EF = { road: 62, rail: 22, sea: 8, air: 602 };            // g CO2e / t·km
const EKWH = { road: 0.22, rail: 0.06, sea: 0.03, air: 2.0 };   // kWh / t·km
const SPEED = { road: 58, rail: 36, sea: 32, air: 760 };        // km/h
const HANDLE = { road: 3, rail: 14, sea: 36, air: 16 };         // h

const KW = {
  doc: {
    docI: ["счет","счёт","invoice","инн","ндс","faktura","ədv","hesab","vöen","итого","total due","yekun","subtotal"],
    docW: ["накладная","ттн","waybill","qaimə","грузополучатель","consignee","перевозчик","daşıyıcı","cmr"],
    docP: ["packing","упаковочный","мест","qablaşdırma","gross","net","брутто","нетто","carton"],
    docO: ["заказ","purchase order","po#","po №","sifariş","deliver by","поставить до","çatdırılma tarixi"],
    docC: ["договор","contract","müqavilə","стороны","obligations","tərəflər","term","срок действия"],
  },
  prod: {
    catE: ["кабель","cable","kabel","роутер","router","монитор","monitor","ноутбук","laptop","телефон","phone","klaviatura","клавиатура","keyboard","led"],
    catF: ["молоко","milk","süd","мука","flour","un","сахар","sugar","şəkər","qida","масло","yağ","rice","рис"],
    catA: ["футболка","shirt","köynək","куртка","jacket","обувь","shoes","ayaqqabı","geyim","джинсы","paltar"],
    catH: ["кислота","acid","turşu","растворитель","solvent","реагент","kimyəvi","chemical","краска","boya","paint"],
    catB: ["цемент","cement","sement","арматура","rebar","кирпич","brick","kərpic","профиль","гипсокартон","beton"],
  },
};
function classify(text, dict) {
  const s = (text || "").toLowerCase();
  const scores = Object.entries(dict).map(([k, ws]) => ({
    k, v: ws.reduce((a, w) => a + (s.includes(w) ? 1 : 0), 0),
  }));
  const sum = scores.reduce((a, b) => a + b.v, 0) || 1;
  scores.sort((a, b) => b.v - a.v);
  return { scores, top: scores[0], conf: Math.round((scores[0].v / sum) * 100) };
}

const parseNum = (s) => {
  if (!s) return null;
  let x = String(s).replace(/[\s\u00A0\u202F]/g, "");
  if (x.includes(",") && x.includes(".")) x = x.replace(/,/g, "");
  else if (/,\d{1,2}$/.test(x)) x = x.replace(",", ".");
  else x = x.replace(/,/g, "");
  const v = parseFloat(x.replace(/[^\d.-]/g, ""));
  return isNaN(v) ? null : v;
};
function parseInvoice(txt) {
  const out = {};
  const no = txt.match(/(?:invoice|inv\.?|сч[её]т(?:-фактура)?|фактура|hesab(?:-faktura)?|faktura|qaim[əe])[^\S\n]{0,20}(?:no\.?|№|#|n)?[^\S\n]*([A-Za-zА-ЯЁ0-9][\w\-\/]{2,})/i);
  out.number = no ? no[1] : null;
  const dt = txt.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{2}-\d{2})/);
  out.date = dt ? dt[1] : null;
  const tax = txt.match(/(?:ИНН|VÖEN|VOEN|Tax\s*ID|TIN)\D{0,4}([\d-]{6,15})/i);
  out.tax = tax ? tax[1] : null;
  const supLine = txt.split(/\n/).find((l) => /(ООО|LLC|MMC|АО|Ltd|QSC|ASC|GmbH|Inc)/i.test(l));
  out.supplier = supLine
    ? supLine.split(/\s{2,}|ИНН|VÖEN|Tax\s*ID/i)[0].trim()
    : null;
  const totRe = /(?:итого к оплате|итого|всего|total due|total|cəmi|yekun)\D{0,12}([\d\s\u00A0.,]{3,})/gi;
  let m, tot = null;
  while ((m = totRe.exec(txt))) { const v = parseNum(m[1]); if (v !== null && (tot === null || v > tot)) tot = v; }
  out.total = tot;
  let vat = null;
  out.vatRate = null;
  const vre = /(?:НДС|VAT|ƏDV)[^\S\n]{0,4}(\d{1,2})\s*%\D{0,10}([\d\s\u00A0.,]{3,})/gi;
  let vm;
  while ((vm = vre.exec(txt))) { out.vatRate = +vm[1]; vat = parseNum(vm[2]); }
  if (vat === null) {
    const v2 = txt.match(/(?:НДС|VAT|ƏDV)\D{0,10}([\d\s\u00A0.,]{3,})/i);
    vat = v2 ? parseNum(v2[1]) : null;
  }
  out.vat = vat;
  const cur = txt.match(/\b(AZN|USD|EUR|RUB|GBP|TRY)\b|[₼₽$€£]/);
  out.currency = cur ? cur[0] : null;
  const rowsI = [];
  const lre = /^\s*\d+[.)]\s+(.{2,60}?)\s+(\d+(?:[.,]\d+)?)\s*(?:шт|pcs|əd)\.?\s*[x×*]\s*([\d\s\u00A0.,]+?)\s*=\s*([\d\s\u00A0.,]+?)\s*$/gim;
  let lm;
  while ((lm = lre.exec(txt)))
    rowsI.push({ name: lm[1].trim(), qty: parseNum(lm[2]), price: parseNum(lm[3]), sum: parseNum(lm[4]) });
  out.items = rowsI;
  out.lines = rowsI.length || (txt.match(/^\s*\d+[.)]\s/gm) || []).length || null;
  return out;
}

/* ------------------------------ Claude API ------------------------------ */
async function claudeCall(payload) {
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const d = await r.json();
  return (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}
const stripJson = (s) => {
  const m = s && s.match(/\{[\s\S]*\}/);
  try { return m ? JSON.parse(m[0]) : null; } catch { return null; }
};
const fileToB64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("read"));
    r.readAsDataURL(file);
  });


/* --------------------------- analytics add-ons --------------------------- */
const Z = { "0.90": 1.282, "0.95": 1.645, "0.975": 1.96, "0.99": 2.326 };
const SUPP = [
  { n: "AlfaLog",          price: 8.4, quality: 7.9, delivery: 9.1, reliability: 8.8, risk: 2.1 },
  { n: "Caspian Metals",   price: 7.1, quality: 8.8, delivery: 7.4, reliability: 9.0, risk: 3.0 },
  { n: "EuroParts GmbH",   price: 5.9, quality: 9.4, delivery: 8.2, reliability: 9.3, risk: 1.6 },
  { n: "ShenTech Ltd",     price: 9.2, quality: 7.1, delivery: 6.3, reliability: 7.5, risk: 4.4 },
  { n: "Baku Supply MMC",  price: 8.0, quality: 8.2, delivery: 8.9, reliability: 8.4, risk: 2.6 },
];

function backtest(y, a, b, g, p, hold = 6) {
  const tr = y.slice(0, y.length - hold), te = y.slice(-hold);
  const { forecast } = holtWinters(tr, a, b, g, p, hold);
  const mape = (f, act) =>
    (act.reduce((s2, v, i) => s2 + Math.abs(v - f[i]) / Math.max(1, v), 0) / act.length) * 100;
  const naive = te.map((_, i) => y[y.length - hold + i - p]);
  return { hw: mape(forecast, te), nv: mape(naive, te) };
}

function flipPoints(supp, w) {
  const keys = ["price", "quality", "delivery", "reliability", "risk"];
  const sc = (x, ww) => {
    const sw = keys.reduce((a2, k) => a2 + ww[k], 0) || 1;
    return (ww.price * x.price + ww.quality * x.quality + ww.delivery * x.delivery +
            ww.reliability * x.reliability + ww.risk * (10 - x.risk)) / sw;
  };
  const lead = (ww) => supp.reduce((b2, x) => (sc(x, ww) > sc(b2, ww) ? x : b2), supp[0]).n;
  const cur = lead(w);
  return keys.map((k) => {
    let lo = null, hi = null;
    for (let v = w[k] - 0.5; v >= -0.001; v -= 0.5) {
      const L = lead({ ...w, [k]: Math.max(0, v) });
      if (L !== cur) { lo = { v: Math.max(0, +v.toFixed(1)), to: L }; break; }
    }
    for (let v = w[k] + 0.5; v <= 10.001; v += 0.5) {
      const L = lead({ ...w, [k]: Math.min(10, v) });
      if (L !== cur) { hi = { v: Math.min(10, +v.toFixed(1)), to: L }; break; }
    }
    return { k, lo, hi, cur };
  });
}

function mcRisks(risks, unit, trials = 2000) {
  const r = mulberry32(risks.reduce((s2, x) => s2 + x.p * 31 + x.i * 7, 17) + Math.round(unit));
  const losses = new Array(trials);
  for (let t = 0; t < trials; t++) {
    let L = 0;
    for (const rk of risks) if (r() < rk.p / 5) L += rk.i * unit * (0.5 + r());
    losses[t] = L;
  }
  losses.sort((a2, b2) => a2 - b2);
  const q = (pp) => losses[Math.min(trials - 1, Math.floor(pp * trials))];
  const mean = losses.reduce((a2, b2) => a2 + b2, 0) / trials;
  const top = Math.max(1, q(0.995));
  const curve = Array.from({ length: 25 }, (_, i) => {
    const x = (top * i) / 24;
    let c = 0; for (const l of losses) if (l >= x) c++;
    return { x: Math.round(x), p: +((100 * c) / trials).toFixed(1) };
  });
  return { mean, p90: q(0.9), curve };
}

function layoutBox(box) {
  const B = box.type;
  const units = box.units.slice()
    .sort((a2, b2) => b2.h - a2.h || b2.l * b2.w - a2.l * a2.w)
    .map((u) => { const [l, w] = u.l >= u.w ? [u.l, u.w] : [u.w, u.l]; return { ...u, l, w }; });
  const placed = [], skipped = [];
  let z = 0, layerH = 0, y = 0, rowW = 0, x = 0;
  for (const u of units) {
    if (x + u.l > B.l) { y += rowW; x = 0; rowW = 0; }
    if (y + u.w > B.w) { z += layerH; y = 0; x = 0; rowW = 0; layerH = 0; }
    if (z + u.h > B.h || u.l > B.l || u.w > B.w) { skipped.push(u); continue; }
    placed.push({ ...u, x, y, z });
    x += u.l; rowW = Math.max(rowW, u.w); layerH = Math.max(layerH, u.h);
  }
  return { placed, skipped };
}

const ITEM_PAL = [
  ["#7fd1c0", "#0d7a68", "#085346"], ["#9fc3e8", "#3b6ea5", "#274b73"],
  ["#c9bfe8", "#6b5ca5", "#4a3f78"], ["#f0c894", "#d98e2b", "#96601a"],
  ["#e8a99b", "#c2452f", "#8a2f1f"], ["#b9d6a8", "#4c9a6a", "#356d4a"],
  ["#d8b7cf", "#b0578d", "#7d3c63"], ["#cdd1a0", "#8a8f3c", "#5f632a"],
];
const hashN = (str) => { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 1023; return h; };

/* ------------------------------ data bus ------------------------------ */
const seedState = () => ({
  ui: { lang: "ru", mod: 1, help: true },
  sales: genSales(),
  fc: { a: 0.35, b: 0.08, g: 0.25, h: 12 },
  inv: { D: 12000, S: 120, H: 4.5, LT: 14, sl: "0.95", sd: 9 },
  proc: { stock: 650, moq: 400, cov: 30, m: 900, ss: 180, LT: 12 },
  weights: { price: 6, quality: 8, delivery: 7, reliability: 8, risk: 5 },
  route: { seed: 3, n: 12 },
  qc: { seed: 1, thr: 0.5 },
  risks: [["rk1", 3, 5], ["rk2", 4, 3], ["rk3", 4, 2], ["rk4", 2, 4], ["rk5", 2, 5], ["rk6", 3, 4]]
    .map(([k, p, i], id) => ({ id, k, p, i })),
  mcUnit: 40,
  eta: { mode: "road", d: 1450, wx: 0.1, cu: 8, cg: 0.15 },
  items: [
    { name: "Cable", l: 25, w: 18, h: 8, qty: 6, wt: 1.2 },
    { name: "Router", l: 30, w: 22, h: 10, qty: 4, wt: 0.9 },
    { name: "Monitor", l: 58, w: 40, h: 15, qty: 2, wt: 5.5 },
    { name: "Keyboard", l: 44, w: 18, h: 5, qty: 5, wt: 0.8 },
    { name: "PSU", l: 20, w: 15, h: 10, qty: 8, wt: 0.7 },
  ],
  ship: [
    { mode: "road", km: 850, tn: 12 }, { mode: "road", km: 400, tn: 6 },
    { mode: "rail", km: 1800, tn: 40 }, { mode: "sea", km: 6500, tn: 60 },
    { mode: "air", km: 3200, tn: 1.5 },
  ],
  shift: 30, co2Price: 85,
  links: { m2: true, m3: true, m9: true, m10: false },
});

function sanitize(v) {
  const s0 = seedState();
  const isA = Array.isArray, isO = (x) => x && typeof x === "object" && !isA(x);
  v = isO(v) ? v : {};
  return { ...s0,
    sales: isA(v.sales) && v.sales.length >= 18
      ? v.sales.map(Number).filter((n2) => isFinite(n2) && n2 > 0).slice(-120) : s0.sales,
    fc: { ...s0.fc, ...(isO(v.fc) ? v.fc : {}) },
    inv: { ...s0.inv, ...(isO(v.inv) ? v.inv : {}) },
    proc: { ...s0.proc, ...(isO(v.proc) ? v.proc : {}) },
    weights: { ...s0.weights, ...(isO(v.weights) ? v.weights : {}) },
    route: { ...s0.route, ...(isO(v.route) ? v.route : {}) },
    qc: { ...s0.qc, ...(isO(v.qc) ? v.qc : {}) },
    risks: isA(v.risks) ? v.risks.filter((r2) => r2 && typeof r2.p === "number" && typeof r2.i === "number") : s0.risks,
    mcUnit: typeof v.mcUnit === "number" ? v.mcUnit : s0.mcUnit,
    eta: { ...s0.eta, ...(isO(v.eta) ? v.eta : {}) },
    items: isA(v.items) && v.items.length ? v.items : s0.items,
    ship: isA(v.ship) && v.ship.length ? v.ship : s0.ship,
    shift: typeof v.shift === "number" ? v.shift : s0.shift,
    co2Price: typeof v.co2Price === "number" ? v.co2Price : s0.co2Price,
    links: { ...s0.links, ...(isO(v.links) ? v.links : {}) },
    ui: { ...s0.ui, ...(isO(v.ui) ? v.ui : {}) },
  };
}

function reducer(st, a) {
  switch (a.t) {
    case "set": {
      const ks = a.k.split(".");
      if (ks.length === 1) return { ...st, [a.k]: a.v };
      return { ...st, [ks[0]]: { ...st[ks[0]], [ks[1]]: a.v } };
    }
    case "arr": return { ...st, [a.k]: a.v };
    case "load": return sanitize(a.v);
    case "reset": return { ...seedState(), ui: st.ui };
    default: return st;
  }
}

function computeDerived(st) {
  const { forecast } = holtWinters(st.sales, st.fc.a, st.fc.b, st.fc.g, 12, 12);
  const fcD = Math.round(forecast.reduce((a2, b2) => a2 + Math.max(0, b2), 0));
  const rnd = mulberry32(st.route.seed * 97 + st.route.n);
  const pts = [{ x: 50, y: 55 }];
  for (let i = 0; i < st.route.n; i++) pts.push({ x: 8 + 84 * rnd(), y: 8 + 84 * rnd() });
  const opt = twoOpt(nearestNeighbor(pts), pts);
  const routeKm = Math.round(tourLen(pts, opt) * 1.15);
  const Dv = st.links.m2 ? fcD : st.inv.D;
  const sim = simInventory(Dv, st.inv.S, st.inv.H, st.inv.LT, Z[st.inv.sl], st.inv.sd);
  const supRisk = Math.max(...SUPP.map((x) => x.risk));
  return { fcD, ss: sim.ss, eoq: sim.eoq, pts, opt, routeKm, supRisk };
}

const Ctx = createContext(null);
function Bus({ children }) {
  const [st, dispatch] = useReducer(reducer, null, seedState);
  const dv = useMemo(() => computeDerived(st), [st]);
  const up = useCallback((k, v) => dispatch({ t: "set", k, v }), []);
  const arr = useCallback((k, v) => dispatch({ t: "arr", k, v }), []);
  const booted = useRef(false);
  useEffect(() => { (async () => {
    try {
      const r = await window.storage?.get?.("cs-state");
      if (r && r.value) dispatch({ t: "load", v: JSON.parse(r.value) });
    } catch {}
    booted.current = true;
  })(); }, []);
  useEffect(() => {
    if (!booted.current) return;
    const id = setTimeout(() => {
      try { window.storage?.set?.("cs-state", JSON.stringify(st)); } catch {}
    }, 600);
    return () => clearTimeout(id);
  }, [st]);
  return <Ctx.Provider value={{ st, dv, up, arr, dispatch }}>{children}</Ctx.Provider>;
}
const useBus = () => useContext(Ctx);

/* --------------------------- agent actions --------------------------- */
const AGENT_OK = new Set(["fc.a","fc.b","fc.g","fc.h","inv.D","inv.S","inv.H","inv.LT","inv.sd","inv.sl",
  "proc.stock","proc.moq","proc.cov","proc.m","proc.ss","proc.LT","eta.mode","eta.d","eta.wx","eta.cg","eta.cu",
  "route.n","route.seed","qc.thr","qc.seed","shift","mcUnit","co2Price","links.m2","links.m3","links.m9","links.m10"]);
function applyAgent(raw, up) {
  const m = raw.match(/ACTION\s*:?\s*(\{[\s\S]*\})\s*$/);
  if (!m) return { text: raw, act: null };
  let a = null;
  try { a = JSON.parse(m[1]); } catch { return { text: raw, act: null }; }
  const text = raw.slice(0, m.index).trim();
  if (!a || typeof a.module !== "number" || a.module < 1 || a.module > 15) return { text: raw, act: null };
  let applied = 0;
  if (a.set && typeof a.set === "object")
    for (const [k, v] of Object.entries(a.set))
      if (AGENT_OK.has(k) && ["number", "string", "boolean"].includes(typeof v)) { up(k, v); applied++; }
  up("ui.mod", Math.round(a.module));
  return { text, act: { module: Math.round(a.module), applied } };
}
const AGENT_SYS = 'You can also control the app UI. Module ids and writable params: 1 demand forecast (fc.a, fc.b, fc.g, fc.h); 2 inventory (inv.D, inv.S, inv.H, inv.LT, inv.sd, inv.sl one of "0.90"|"0.95"|"0.975"|"0.99", links.m2 boolean); 3 procurement (proc.stock, proc.moq, proc.cov, proc.m, proc.ss, proc.LT, links.m3); 4 suppliers; 5 routes (route.n 6..20, route.seed); 6 warehouse; 7 maintenance; 8 quality (qc.thr 0.05..0.95, qc.seed); 9 risks (mcUnit, links.m9); 10 ETA (eta.mode "road"|"rail"|"sea"|"air", eta.d km, eta.wx 0..0.5, eta.cg 0..0.4, eta.cu hours, links.m10); 11 classification; 12 OCR; 13 assistant; 14 packing; 15 sustainability (shift 0..80, co2Price). If and only if the user asks to open a module or change parameters, end your reply with a final line exactly: ACTION:{"module":N,"set":{"path":value,...}} using only listed paths; numbers as numbers. Otherwise never output an ACTION line.';

/* --------------------------- shared widgets --------------------------- */
const LinkSwitch = ({ on, set, src, t }) => (
  <button onClick={() => set(!on)}
    className="cs-btn inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
    style={on ? { background: ACCENT + "1a", color: dk(ACCENT), border: "1px solid " + ACCENT + "55" }
              : { background: "#eef1f4", color: "#5c6b7a", border: "1px solid #d5dbe3" }}>
    <Link2 size={12} /> {t("linkL")}{src ? " ← " + src : ""}
  </button>
);
const CsvBtn = ({ t, hint, onRows }) => {
  const ref = useRef(null);
  const [msg, setMsg] = useState(null);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input ref={ref} type="file" accept=".csv,text/csv" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return;
          Papa.parse(f, { header: true, skipEmptyLines: true,
            complete: (res) => {
              const n = onRows(res.data || []);
              setMsg(n > 0 ? t("importedL") + ": " + n : t("badCsv"));
            },
            error: () => setMsg(t("badCsv")) });
          e.target.value = "";
        }} />
      <Btn tone="ghost" icon={Upload} onClick={() => ref.current?.click()}>{t("importL")} CSV</Btn>
      <span className="text-xs" style={{ color: msg === t("badCsv") ? dk(RED) : "#98a2b0" }}>{msg || hint}</span>
    </div>
  );
};
const xport = (rows, name, sheet) => {
  try {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheet || "Data");
    XLSX.writeFile(wb, name + ".xlsx");
  } catch (e) { console.error(e); }
};
class CsBoundary extends React.Component {
  constructor(pr) { super(pr); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: String(e && e.message ? e.message : e) }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="cs-card bg-white rounded-2xl p-6 text-center" style={{ border: "1px solid #dde3ea" }}>
        <div className="cs-display font-bold mb-1" style={{ color: dk(RED) }}>{this.props.title}</div>
        <div className="text-xs mb-3" style={{ color: "#7c8797" }}>{this.state.err.slice(0, 160)}</div>
        <Btn tone="ghost" icon={RefreshCw} onClick={() => this.setState({ err: null })}>{this.props.retry}</Btn>
      </div>
    );
  }
}

/* ------------------------------ UI atoms ------------------------------ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@400;500;600&display=swap');
.cs-root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:${INK};}
.cs-display{font-family:Sora,Inter,ui-sans-serif,sans-serif;letter-spacing:-0.02em;}
.cs-num{font-family:Sora,Inter,sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-0.01em;}
.cs-eyebrow{font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#7c8797;}
.cs-root ::-webkit-scrollbar{width:8px;height:8px}
.cs-root ::-webkit-scrollbar-thumb{background:#c7ced8;border-radius:8px}
.cs-in{width:100%;border:1px solid #d5dbe3;border-radius:10px;padding:7px 10px;font-size:13px;background:#fff;outline:none}
.cs-in:focus{border-color:${ACCENT};box-shadow:0 0 0 3px rgba(13,122,104,.15)}
@keyframes csUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes csPop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
@keyframes csFade{from{opacity:0}to{opacity:1}}
@keyframes csDraw{to{stroke-dashoffset:0}}
@keyframes csBlink{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}
@keyframes csPulse{0%{box-shadow:0 0 0 0 rgba(194,69,47,.4)}70%{box-shadow:0 0 0 7px rgba(194,69,47,0)}100%{box-shadow:0 0 0 0 rgba(194,69,47,0)}}
.cs-up{animation:csUp .45s cubic-bezier(.2,.7,.2,1) both}
.cs-pop{animation:csPop .35s cubic-bezier(.2,.75,.3,1.25) both}
.cs-fade{animation:csFade .5s ease both}
.cs-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:csDraw 1.3s ease .2s forwards}
.cs-dot{animation:csBlink 1.1s ease-in-out infinite}
.cs-pulse{animation:csPulse 1.8s ease-out infinite}
.cs-bar{transition:width .7s cubic-bezier(.2,.7,.2,1)}
.cs-btn{transition:transform .15s ease,box-shadow .15s ease,opacity .15s ease,background .2s ease,color .2s ease}
.cs-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px rgba(16,24,38,.14)}
.cs-btn:active:not(:disabled){transform:translateY(0) scale(.97)}
.cs-card{transition:box-shadow .25s ease}
.cs-card:hover{box-shadow:0 6px 18px rgba(16,24,38,.08)}
.cs-nav{transition:background .18s ease,color .18s ease,border-color .18s ease}
@media (prefers-reduced-motion: reduce){.cs-root *{transition:none!important;animation:none!important}}
`;

const Card = ({ title, extra, children, className = "" }) => (
  <div className={"cs-card bg-white rounded-2xl p-5 " + className}
       style={{ border: "1px solid #dde3ea", boxShadow: "0 1px 2px rgba(16,24,38,.04)" }}>
    {(title || extra) && (
      <div className="flex items-center justify-between mb-4 gap-3">
        {title && <div className="cs-eyebrow">{title}</div>}
        {extra}
      </div>
    )}
    {children}
  </div>
);
const Kpi = ({ l, v, s, tone }) => (
  <div className="bg-white rounded-2xl px-4 py-3"
       style={{ border: "1px solid #dde3ea", borderTop: `3px solid ${tone || ACCENT}` }}>
    <div className="text-xs mb-1" style={{ color: "#7c8797" }}>{l}</div>
    <div className="cs-num text-2xl font-bold" style={{ color: INK }}>{v}</div>
    {s && <div className="text-xs mt-0.5" style={{ color: "#98a2b0" }}>{s}</div>}
  </div>
);
const Num = ({ l, v, set, step = 1, min = 0, max = 1e9 }) => (
  <label className="block min-w-0">
    <span className="text-xs font-medium" style={{ color: "#5c6b7a" }}>{l}</span>
    <input type="number" className="cs-in mt-1" value={v} step={step} min={min} max={max}
           onChange={(e) => set(parseFloat(e.target.value) || 0)} />
  </label>
);
const Slider = ({ l, v, set, min, max, step = 1, show }) => (
  <label className="block">
    <div className="flex justify-between text-xs mb-1">
      <span className="font-medium" style={{ color: "#5c6b7a" }}>{l}</span>
      <span className="cs-num font-semibold" style={{ color: ACCENT }}>{show ?? v}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={v}
           onChange={(e) => set(parseFloat(e.target.value))}
           className="w-full" style={{ accentColor: ACCENT }} />
  </label>
);
const Sel = ({ l, v, set, opts }) => (
  <label className="block min-w-0">
    {l && <span className="text-xs font-medium" style={{ color: "#5c6b7a" }}>{l}</span>}
    <select className="cs-in mt-1" value={v} onChange={(e) => set(e.target.value)}>
      {opts.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
    </select>
  </label>
);
const Btn = ({ children, onClick, tone = "primary", disabled, icon: I }) => (
  <button onClick={onClick} disabled={disabled}
    className="cs-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-40"
    style={tone === "primary"
      ? { background: ACCENT, color: "#fff" }
      : { background: "#eef1f4", color: INK, border: "1px solid #d5dbe3" }}>
    {I && <I size={15} />}{children}
  </button>
);
const Th = ({ children, right }) => (
  <th className={"px-3 py-2 text-xs font-semibold " + (right ? "text-right" : "text-left")}
      style={{ color: "#7c8797", borderBottom: "1px solid #e5eaf0" }}>{children}</th>
);
const Td = ({ children, right, strong }) => (
  <td className={"px-3 py-2 text-sm " + (right ? "text-right cs-num" : "") + (strong ? " font-semibold" : "")}
      style={{ borderBottom: "1px solid #f0f3f7" }}>{children}</td>
);
const Pill = ({ children, color }) => (
  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ background: color + "22", color: dk(color) }}>{children}</span>
);

/* ============================ 1 · Demand ============================ */
function M1({ t, lang }) {
  const { st, up, arr } = useBus();
  const { a, b, g, h } = st.fc;
  const y = st.sales;
  const r = useMemo(() => {
    const n = y.length;
    const { forecast, rmse, mape } = holtWinters(y, a, b, g, 12, h);
    const lab36 = (i) => MONTHS[lang][i % 12] + " \u2019" + (24 + Math.floor(i / 12));
    const rows = y.map((v, i) => ({ x: n === 36 ? lab36(i) : String(i - n + 1), hist: v }));
    const last = y[n - 1];
    rows[n - 1] = { ...rows[n - 1], fc: last, lo: last, hi: last };
    forecast.forEach((v, k) => rows.push({
      x: n === 36 ? lab36(n + k) : "+" + (k + 1),
      fc: Math.round(v), lo: Math.round(v - 1.28 * rmse), hi: Math.round(v + 1.28 * rmse),
    }));
    let num = 0, den = 0; const xm = (n - 1) / 2;
    y.forEach((v, i) => { num += (i - xm) * v; den += (i - xm) ** 2; });
    const slope = num / den, avg = y.reduce((s2, v) => s2 + v, 0) / n;
    const byM = Array(12).fill(0);
    y.forEach((v, i) => (byM[i % 12] += v));
    const peak = MONTHS[lang][byM.indexOf(Math.max(...byM))];
    const bt = n >= 30 ? backtest(y, a, b, g, 12, 6) : null;
    return { rows, mape, peak, growth: ((slope * 12) / avg) * 100, bt, n };
  }, [y, a, b, g, h, lang]);
  const onCsv = (rows) => {
    const nums = rows.map((row) => {
      for (const val of Object.values(row)) { const v = parseNum(val); if (v !== null && v > 0) return v; }
      return null;
    }).filter((v) => v !== null);
    if (nums.length < 18) return 0;
    arr("sales", nums.slice(-120).map((v) => Math.round(v)));
    return Math.min(nums.length, 120);
  };
  const beats = r.bt && r.bt.hw < r.bt.nv;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi l={t("mape")} v={r.mape.toFixed(1) + "%"} />
        <Kpi l={t("growth")} v={(r.growth >= 0 ? "+" : "") + r.growth.toFixed(1) + "%"} />
        <Kpi l={t("peak")} v={r.peak} tone={AMBER} />
        <Kpi l={t("forecastL")} v={h + " " + t("uMonth")} tone="#3b6ea5" />
      </div>
      <div className="grid lg:grid-cols-4 gap-4">
        <Card title={t("params")}>
          <div className="space-y-4">
            <Slider l={t("horizon")} v={h} set={(v) => up("fc.h", v)} min={3} max={18} />
            <Slider l={t("alphaL")} v={a} set={(v) => up("fc.a", v)} min={0.05} max={0.9} step={0.05} show={a.toFixed(2)} />
            <Slider l={t("betaL")} v={b} set={(v) => up("fc.b", v)} min={0.01} max={0.5} step={0.01} show={b.toFixed(2)} />
            <Slider l={t("gammaL")} v={g} set={(v) => up("fc.g", v)} min={0.05} max={0.9} step={0.05} show={g.toFixed(2)} />
            <div className="pt-3" style={{ borderTop: "1px solid #eef1f4" }}>
              <CsvBtn t={t} hint={t("csvHintSales")} onRows={onCsv} />
              <div className="mt-2">
                <Btn tone="ghost" icon={RefreshCw} onClick={() => arr("sales", genSales())}>{t("sample")}</Btn>
              </div>
            </div>
          </div>
        </Card>
        <Card title={t("history") + " (" + r.n + ") + " + t("forecastL")} className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={r.rows} margin={{ left: -14, right: 6 }}>
              <CartesianGrid stroke="#eef1f4" vertical={false} />
              <XAxis dataKey="x" tick={{ fontSize: 10 }} interval={Math.max(2, Math.floor(r.rows.length / 9))} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line dataKey="hist" name={t("history")} stroke="#475569" dot={false} strokeWidth={1.8} />
              <Line dataKey="fc" name={t("forecastL")} stroke={ACCENT} dot={false} strokeWidth={2.4} />
              <Line dataKey="hi" name={t("ciL")} stroke={ACCENT} strokeDasharray="4 4" dot={false} strokeWidth={1} legendType="none" />
              <Line dataKey="lo" name={t("ciL")} stroke={ACCENT} strokeDasharray="4 4" dot={false} strokeWidth={1} legendType="none" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title={t("btT")}>
        {r.bt ? (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <div>
              <div className="text-xs" style={{ color: "#7c8797" }}>{t("btHw")}</div>
              <div className="cs-num text-xl font-bold" style={{ color: dk(ACCENT) }}>{r.bt.hw.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: "#7c8797" }}>{t("btNv")}</div>
              <div className="cs-num text-xl font-bold" style={{ color: "#5c6b7a" }}>{r.bt.nv.toFixed(1)}%</div>
            </div>
            <Pill color={beats ? ACCENT : RED}>{beats ? t("beatsL") : t("loseL")}</Pill>
          </div>
        ) : (
          <div className="text-sm" style={{ color: "#7c8797" }}>{t("btShort")}</div>
        )}
      </Card>
    </div>
  );
}

/* ============================ 2 · Inventory ============================ */
const ABC_SKUS = [
  ["SKU-1042", 34], ["SKU-2077", 22], ["SKU-1180", 14], ["SKU-3305", 9],
  ["SKU-4413", 7], ["SKU-5520", 6], ["SKU-6631", 5], ["SKU-7742", 3],
];
function M2({ t }) {
  const { st, dv, up } = useBus();
  const { D, S, H, LT, sl, sd } = st.inv;
  const linked = st.links.m2;
  const Dv = linked ? dv.fcD : D;
  const r = useMemo(() => simInventory(Dv, S, H, LT, Z[sl], sd), [Dv, S, H, LT, sl, sd]);
  let cum = 0;
  const abc = ABC_SKUS.map(([k, sh]) => {
    cum += sh;
    return { k, sh, c: cum <= 80 ? "A" : cum <= 95 ? "B" : "C" };
  });
  const cCol = { A: ACCENT, B: AMBER, C: "#8896a6" };
  const okServ = r.achieved >= parseFloat(sl);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi l={t("eoqL")} v={fmt(r.eoq) + " " + t("uUnits")} />
        <Kpi l={t("ropL")} v={fmt(r.rop) + " " + t("uUnits")} tone={AMBER} />
        <Kpi l={t("ssL")} v={fmt(r.ss) + " " + t("uUnits")} tone="#3b6ea5" />
        <Kpi l={t("opyL")} v={r.opy.toFixed(1)} tone="#6b5ca5" />
        <Kpi l={t("servFact")} v={(r.achieved * 100).toFixed(1) + "%"} tone={okServ ? ACCENT : RED}
             s={"z: " + (sl * 100) + "%"} />
      </div>
      <div className="grid lg:grid-cols-4 gap-4">
        <Card title={t("params")}
              extra={<LinkSwitch t={t} src="SC-01" on={linked} set={(v) => up("links.m2", v)} />}>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {linked ? (
              <div className="rounded-xl px-3 py-2" style={{ background: "#f2f7f5", border: "1px solid " + ACCENT + "33" }}>
                <div className="text-xs" style={{ color: "#7c8797" }}>{t("annualD")}</div>
                <div className="cs-num font-bold">{fmt(dv.fcD)}</div>
                <div className="text-xs" style={{ color: dk(ACCENT) }}>{t("fcSrc")}</div>
              </div>
            ) : (
              <Num l={t("annualD")} v={D} set={(v) => up("inv.D", v)} step={500} />
            )}
            <Num l={t("orderCost")} v={S} set={(v) => up("inv.S", v)} step={10} />
            <Num l={t("holdCost")} v={H} set={(v) => up("inv.H", v)} step={0.5} />
            <Num l={t("leadTime")} v={LT} set={(v) => up("inv.LT", v)} />
            <Sel l={t("service")} v={sl} set={(v) => up("inv.sl", v)}
                 opts={[["0.90","90%"],["0.95","95%"],["0.975","97.5%"],["0.99","99%"]]} />
            <Num l={t("sigmaD")} v={sd} set={(v) => up("inv.sd", v)} />
          </div>
        </Card>
        <Card title={t("simL")} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={r.rows} margin={{ left: -14, right: 6 }}>
              <CartesianGrid stroke="#eef1f4" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line dataKey="stock" name={t("stockL")} stroke={ACCENT} dot={false} strokeWidth={2} />
              <Line dataKey="rop" name="ROP" stroke={RED} strokeDasharray="5 4" dot={false} strokeWidth={1.4} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card title={t("abcL")}>
          <table className="w-full">
            <thead><tr><Th>{t("skuL")}</Th><Th right>{t("shareL")}</Th><Th right>{t("classL")}</Th></tr></thead>
            <tbody>{abc.map((x) => (
              <tr key={x.k}>
                <Td strong>{x.k}</Td><Td right>{x.sh}</Td>
                <Td right><Pill color={cCol[x.c]}>{x.c}</Pill></Td>
              </tr>))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

/* ============================ 3 · Procurement ============================ */
function M3({ t, lang }) {
  const { st, dv, up } = useBus();
  const linked = st.links.m3;
  const { stock, moq, cov } = st.proc;
  const m = linked ? dv.fcD / 12 : st.proc.m;
  const ssv = linked ? dv.ss : st.proc.ss;
  const LTv = linked ? st.inv.LT : st.proc.LT;
  const pos = useMemo(() => planPOs(m, stock, LTv, moq, ssv, cov), [m, stock, LTv, moq, ssv, cov]);
  const dStr = (off) => {
    const d = new Date(); d.setDate(d.getDate() + off);
    return d.toLocaleDateString(LOCALE[lang], { day: "2-digit", month: "short" });
  };
  const exp = () => xport(pos.map((pp, i) => ({
    po: "PO-" + (101 + i), order_date: dStr(pp.t), arrival: dStr(pp.arrive),
    qty: pp.qty, coverage_days: Math.round(pp.cover),
  })), "po-plan", "PO");
  const chip = (l, v) => (
    <div className="rounded-xl px-3 py-2" style={{ background: "#f2f7f5", border: "1px solid " + ACCENT + "33" }}>
      <div className="text-xs" style={{ color: "#7c8797" }}>{l}</div>
      <div className="cs-num font-bold">{v}</div>
    </div>);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Kpi l={t("planL")} v={pos.length + " PO"} />
        <Kpi l={t("qty")} v={fmt(pos.reduce((s2, pp) => s2 + pp.qty, 0)) + " " + t("uUnits")} tone="#3b6ea5" />
        <Kpi l={t("coverageL")} v={pos.length ? Math.round(pos[0].cover) + " " + t("uDays") : "\u2014"} tone={AMBER} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title={t("params")}
              extra={<LinkSwitch t={t} src="SC-01/02" on={linked} set={(v) => up("links.m3", v)} />}>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {linked ? chip(t("avgD"), fmt(Math.round(m)))
                    : <Num l={t("avgD")} v={st.proc.m} set={(v) => up("proc.m", v)} step={50} />}
            {linked ? chip(t("ssL"), fmt(ssv))
                    : <Num l={t("ssL")} v={st.proc.ss} set={(v) => up("proc.ss", v)} step={20} />}
            {linked ? chip(t("leadTime"), LTv)
                    : <Num l={t("leadTime")} v={st.proc.LT} set={(v) => up("proc.LT", v)} />}
            <Num l={t("curStock")} v={stock} set={(v) => up("proc.stock", v)} step={50} />
            <Num l={t("moqL")} v={moq} set={(v) => up("proc.moq", v)} step={50} />
            <Num l={t("coverT")} v={cov} set={(v) => up("proc.cov", v)} step={5} />
          </div>
        </Card>
        <Card title={t("planL")} className="lg:col-span-2"
              extra={<Btn tone="ghost" icon={Download} onClick={exp} disabled={!pos.length}>{t("exportL")}</Btn>}>
          {pos.length === 0 ? (
            <div className="text-sm py-8 text-center" style={{ color: "#7c8797" }}>{t("noPO")}</div>
          ) : (
            <table className="w-full">
              <thead><tr>
                <Th>#</Th><Th>{t("poDate")}</Th><Th>{t("arriveL")}</Th>
                <Th right>{t("qty")}</Th><Th right>{t("coverageL")}</Th>
              </tr></thead>
              <tbody>{pos.map((pp, i) => (
                <tr key={i}>
                  <Td strong>PO-{101 + i}</Td>
                  <Td>{dStr(pp.t)}</Td>
                  <Td><Pill color={ACCENT}>{dStr(pp.arrive)}</Pill></Td>
                  <Td right strong>{fmt(pp.qty)}</Td>
                  <Td right>{Math.round(pp.cover)} {t("uDays")}</Td>
                </tr>))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================ 4 · Suppliers ============================ */
function M4({ t }) {
  const { st, up } = useBus();
  const w = st.weights;
  const sw = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  const rows = SUPP.map((x) => ({
    ...x,
    score: (w.price * x.price + w.quality * x.quality + w.delivery * x.delivery +
            w.reliability * x.reliability + w.risk * (10 - x.risk)) / sw,
  })).sort((a, b) => b.score - a.score);
  const sens = useMemo(() => flipPoints(SUPP, w), [w]);
  const radar = ["price","quality","delivery","reliability"].map((k) => {
    const o = { crit: t("w" + k[0].toUpperCase() + { price:"rice",quality:"ual",delivery:"eliv",reliability:"el" }[k]) };
    rows.slice(0, 3).forEach((x) => (o[x.n] = x[k]));
    return o;
  });
  const rc = [ACCENT, "#3b6ea5", AMBER];
  const wk = [["price", t("wPrice")], ["quality", t("wQual")], ["delivery", t("wDeliv")],
              ["reliability", t("wRel")], ["risk", t("wRisk")]];
  const wl = Object.fromEntries(wk);
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title={t("weightsL")}>
          <div className="space-y-4">
            {wk.map(([k, l]) => (
              <Slider key={k} l={l} v={w[k]} min={0} max={10}
                      set={(v) => up("weights." + k, v)} />))}
          </div>
        </Card>
        <Card title={t("results")}>
          <table className="w-full">
            <thead><tr><Th>{t("rankL")}</Th><Th>{t("supplierL")}</Th><Th right>{t("score")}</Th></tr></thead>
            <tbody>{rows.map((x, i) => (
              <tr key={x.n}>
                <Td strong>{i + 1}</Td>
                <Td>{x.n} {i === 0 && <Pill color={ACCENT}>{t("bestL")}</Pill>}</Td>
                <Td right strong>{x.score.toFixed(2)}</Td>
              </tr>))}
            </tbody>
          </table>
        </Card>
        <Card title="Top-3">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radar} outerRadius="72%">
              <PolarGrid stroke="#e5eaf0" />
              <PolarAngleAxis dataKey="crit" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              {rows.slice(0, 3).map((x, i) => (
                <Radar key={x.n} name={x.n} dataKey={x.n}
                       stroke={rc[i]} fill={rc[i]} fillOpacity={0.12} strokeWidth={2} />))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title={t("sensT")}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              <Th>{t("weightsL")}</Th><Th>{t("flipDn")}</Th><Th>{t("flipUp")}</Th>
            </tr></thead>
            <tbody>{sens.map((x) => (
              <tr key={x.k}>
                <Td strong>{wl[x.k]} <span className="cs-num" style={{ color: "#98a2b0" }}>({w[x.k]})</span></Td>
                <Td>{x.lo
                  ? <span>{t("flipDn")} <b className="cs-num">{x.lo.v}</b> → {x.lo.to}</span>
                  : <span style={{ color: "#98a2b0" }}>{x.hi ? "\u2014" : t("stableL")}</span>}</Td>
                <Td>{x.hi
                  ? <span>{t("flipUp")} <b className="cs-num">{x.hi.v}</b> → {x.hi.to}</span>
                  : <span style={{ color: "#98a2b0" }}>{x.lo ? "\u2014" : ""}</span>}</Td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ============================ 5 · Routes ============================ */
function M5({ t }) {
  const { st, dv, up } = useBus();
  const { seed, n } = st.route;
  const pts = dv.pts, opt = dv.opt;
  const naive = [...Array(pts.length).keys()];
  const l0 = tourLen(pts, naive) * 1.15;
  const l1 = dv.routeKm;
  const poly = (ord) =>
    ord.concat(ord[0]).map((i) => pts[i].x + "," + pts[i].y).join(" ");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <Kpi l={t("beforeL")} v={fmt(l0) + " " + t("uKm")} tone="#8896a6" />
        <Kpi l={t("afterL")} v={fmt(l1) + " " + t("uKm")} />
        <Kpi l={t("savingL")} v={"\u2212" + (100 * (1 - l1 / l0)).toFixed(0) + "%"} tone={AMBER} />
        <div className="flex gap-2 justify-end pb-1">
          <Btn tone="ghost" icon={RefreshCw} onClick={() => up("route.seed", seed + 1)}>{t("regen")}</Btn>
        </div>
      </div>
      <div className="grid lg:grid-cols-4 gap-4">
        <Card title={t("params")}>
          <Slider l={t("nPoints")} v={n} set={(v) => up("route.n", v)} min={6} max={20} />
          <div className="mt-4 space-y-2 text-xs" style={{ color: "#5c6b7a" }}>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: INK }} /> {t("depotL")}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 border-t-2 border-dashed" style={{ borderColor: "#a7b2c0" }} /> {t("beforeL")}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 border-t-2" style={{ borderColor: ACCENT }} /> {t("afterL")}
            </div>
          </div>
          <div className="mt-4 text-xs" style={{ color: "#98a2b0" }}>{"→ SC-10 · SC-15"}</div>
        </Card>
        <Card className="lg:col-span-3">
          <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: 420, background: "#f7f9fa", borderRadius: 12 }}>
            <polyline key={"n" + seed + "-" + n} className="cs-fade" points={poly(naive)} fill="none" stroke="#a7b2c0" strokeWidth="0.5" strokeDasharray="2 1.6" />
            <polyline key={"o" + seed + "-" + n} pathLength="1" className="cs-draw" points={poly(opt)} fill="none" stroke={ACCENT} strokeWidth="0.9" />
            {pts.map((pp, i) => i === 0 ? (
              <rect key={i} x={pp.x - 2} y={pp.y - 2} width="4" height="4" fill={INK} />
            ) : (
              <circle key={seed + "-" + i} className="cs-fade" style={{ animationDelay: i * 55 + "ms" }} cx={pp.x} cy={pp.y} r="1.6" fill="#fff" stroke={ACCENT} strokeWidth="0.7" />
            ))}
          </svg>
        </Card>
      </div>
    </div>
  );
}

/* ============================ 6 · Warehouse ============================ */
function M6({ t }) {
  const AIS = 6, BAYS = 10;
  const r = useMemo(() => {
    const slots = [];
    for (let a = 0; a < AIS; a++) for (let b = 0; b < BAYS; b++) slots.push({ a, b });
    const dDock = (s) => s.a * 3 + s.b + 1;
    const byDist = slots.slice().sort((x, y) => dDock(x) - dDock(y));
    const rnd = mulberry32(11);
    const shuffled = slots.slice().sort(() => rnd() - 0.5);
    const cls = (i) => (i < 12 ? "A" : i < 30 ? "B" : "C");
    const optSlot = {}, rndSlot = {}, optCls = {};
    byDist.forEach((s, i) => { optSlot[i] = s; optCls[s.a + "-" + s.b] = cls(i); });
    shuffled.forEach((s, i) => { rndSlot[i] = s; });
    const picks = [1, 3, 6, 8, 10, 15, 22, 47];
    const route = (map) => {
      const st = picks.map((i) => map[i])
        .sort((x, y) => x.a - y.a || (x.a % 2 === 0 ? x.b - y.b : y.b - x.b));
      let len = 0, prev = { a: 0, b: -1 };
      for (const s of st) { len += Math.abs(s.a - prev.a) * 3 + Math.abs(s.b - prev.b); prev = s; }
      len += prev.a * 3 + prev.b + 1;
      return { st, len };
    };
    return { optCls, opt: route(optSlot), rand: route(rndSlot), picks };
  }, []);
  const cCol = { A: ACCENT, B: AMBER, C: "#c3ccd6" };
  const X = (a) => 26 + a * 62, Y = (b) => 16 + (BAYS - 1 - b) * 25;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Kpi l={t("optPathL")} v={r.opt.len + " " + t("uUnits")} />
        <Kpi l={t("randPathL")} v={r.rand.len + " " + t("uUnits")} tone="#8896a6" />
        <Kpi l={t("gainL")} v={"−" + (100 * (1 - r.opt.len / r.rand.len)).toFixed(0) + "%"} tone={AMBER} />
      </div>
      <div className="grid lg:grid-cols-4 gap-4">
        <Card title={t("pickL")}>
          <div className="flex flex-wrap gap-2 mb-4">
            {r.picks.map((p) => <Pill key={p} color="#3b6ea5">SKU-{1000 + p}</Pill>)}
          </div>
          <div className="space-y-2 text-xs" style={{ color: "#5c6b7a" }}>
            {[["A", t("clsA")], ["B", t("clsB")], ["C", t("clsC")]].map(([c, l]) => (
              <div key={c} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: cCol[c] }} />{l}
              </div>))}
          </div>
        </Card>
        <Card title={t("layoutL")} className="lg:col-span-3">
          <svg viewBox="0 0 400 280" className="w-full" style={{ background: "#f7f9fa", borderRadius: 12 }}>
            {Array.from({ length: AIS }, (_, a) =>
              Array.from({ length: BAYS }, (_, b) => (
                <rect key={a + "-" + b} x={X(a)} y={Y(b)} width="34" height="20" rx="3"
                      fill={cCol[r.optCls[a + "-" + b]]} opacity="0.85" />)))}
            <polyline className="cs-fade" style={{ animationDelay: "150ms" }} fill="none" stroke={INK} strokeWidth="2" strokeDasharray="5 4"
              points={[{ a: 0, b: -1 }, ...r.opt.st, { a: 0, b: -1 }]
                .map((s) => `${X(s.a) + 17},${s.b < 0 ? 268 : Y(s.b) + 10}`).join(" ")} />
            {r.opt.st.map((s, i) => (
              <g key={i} className="cs-fade" style={{ animationDelay: 250 + i * 90 + "ms" }}>
                <circle cx={X(s.a) + 17} cy={Y(s.b) + 10} r="6" fill={INK} />
                <text x={X(s.a) + 17} y={Y(s.b) + 13} textAnchor="middle"
                      fontSize="8" fill="#fff" fontWeight="700">{i + 1}</text>
              </g>))}
            <rect x={X(0)} y="258" width="34" height="16" rx="3" fill={INK} />
            <text x={X(0) + 17} y="269" textAnchor="middle" fontSize="8" fill="#fff">{t("dockL")}</text>
          </svg>
        </Card>
      </div>
    </div>
  );
}

/* ============================ 7 · Maintenance ============================ */
const MACHINES = [
  { n: "Forklift FL-03",   vib: 7.6, temp: 82, hrs: 16400 },
  { n: "Conveyor CV-1",    vib: 4.2, temp: 66, hrs: 21000 },
  { n: "AGV-7",            vib: 2.9, temp: 58, hrs: 6200 },
  { n: "Palletizer PL-2",  vib: 6.1, temp: 74, hrs: 12800 },
  { n: "Crane CR-1",       vib: 3.4, temp: 61, hrs: 9800 },
  { n: "Compressor AC-4",  vib: 8.4, temp: 88, hrs: 18900 },
];
function M7({ t }) {
  const [sel, setSel] = useState(0);
  const rows = MACHINES.map((m) => {
    const health = Math.max(0, Math.round(
      100 - (m.vib / 9) * 45 - (Math.max(0, m.temp - 65) / 35) * 25 - (m.hrs / 22000) * 30));
    const rul = Math.max(3, Math.round(420 * Math.pow(health / 100, 1.7)));
    const p30 = 1 / (1 + Math.exp((health - 45) / 7));
    return { ...m, health, rul, p30, act: health < 45 ? "actNow" : health < 70 ? "actPlan" : "actOk" };
  });
  const actCol = { actNow: RED, actPlan: AMBER, actOk: ACCENT };
  const trend = useMemo(() => {
    const m = rows[sel], rr = mulberry32(sel + 5);
    return Array.from({ length: 12 }, (_, w) => ({
      w: "W" + (w + 1),
      v: +(m.vib * (0.55 + 0.45 * (w / 11)) + (rr() - 0.5) * 0.6).toFixed(2),
    }));
  }, [sel]);
  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <Card title={t("equipL")} className="lg:col-span-3">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              <Th>{t("equipL")}</Th><Th right>{t("healthL")}</Th><Th right>{t("rulL")}</Th>
              <Th right>{t("failL")}</Th><Th right>{t("actionL")}</Th>
            </tr></thead>
            <tbody>{rows.map((m, i) => (
              <tr key={m.n} onClick={() => setSel(i)} className="cursor-pointer"
                  style={{ background: i === sel ? "#f2f7f5" : "transparent" }}>
                <Td strong>
                  <span className="inline-flex items-center gap-2">
                    {m.act === "actNow" &&
                      <span className="cs-pulse inline-block w-2 h-2 rounded-full" style={{ background: RED }} />}
                    {m.n}
                  </span>
                </Td>
                <Td right>
                  <span className="cs-num font-bold" style={{ color: actCol[m.act] }}>{m.health}</span>
                </Td>
                <Td right>{m.rul}</Td>
                <Td right>{(m.p30 * 100).toFixed(0)}%</Td>
                <Td right><Pill color={actCol[m.act]}>{t(m.act)}</Pill></Td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title={t("trendL") + " — " + rows[sel].n} className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trend} margin={{ left: -20, right: 6 }}>
            <CartesianGrid stroke="#eef1f4" vertical={false} />
            <XAxis dataKey="w" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} />
            <Tooltip />
            <ReferenceLine y={7.1} stroke={RED} strokeDasharray="5 4"
                           label={{ value: "ISO 7.1", fontSize: 10, fill: RED, position: "insideTopRight" }} />
            <Line dataKey="v" name={t("vibL")} stroke={ACCENT} strokeWidth={2.2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          {[["vibL", rows[sel].vib], ["tempL", rows[sel].temp], ["hoursL", fmt(rows[sel].hrs)]].map(([k, v]) => (
            <div key={k} className="rounded-xl py-2" style={{ background: "#f4f6f8" }}>
              <div className="text-xs" style={{ color: "#7c8797" }}>{t(k)}</div>
              <div className="cs-num font-bold">{v}</div>
            </div>))}
        </div>
      </Card>
    </div>
  );
}

/* ============================ 8 · Quality ============================ */
function M8({ t, lang }) {
  const { st, up } = useBus();
  const { seed, thr } = st.qc;
  const batch = useMemo(() => {
    const rnd = mulberry32(seed * 13);
    const types = ["dScr", "dCrk", "dCon", "dAli"];
    return Array.from({ length: 24 }, (_, i) => {
      const def = rnd() < 0.18;
      const base = def ? 0.72 : 0.28;
      const score = Math.min(0.99, Math.max(0.01, base + (rnd() - 0.5) * 0.5));
      return { i, def, score, type: def ? types[Math.floor(rnd() * 4)] : null };
    });
  }, [seed]);
  const stat = useMemo(() => {
    const det = (x) => x.score >= thr;
    const TP = batch.filter((x) => x.def && det(x)).length;
    const FP = batch.filter((x) => !x.def && det(x)).length;
    const FN = batch.filter((x) => x.def && !det(x)).length;
    const prec = TP + FP ? TP / (TP + FP) : 1;
    const rec = TP + FN ? TP / (TP + FN) : 1;
    return { TP, FP, FN, prec, rec };
  }, [batch, thr]);
  const [img, setImg] = useState(null);
  const [vres, setVres] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const fref = useRef(null);
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true); setErr(null); setVres(null);
    try {
      const b64 = await fileToB64(f);
      setImg(URL.createObjectURL(f));
      const raw = await claudeCall({
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: f.type, data: b64 } },
          { type: "text", text:
            'Inspect this product/part image for visible defects (scratch, crack, contamination, misalignment, other). Reply ONLY minified JSON {"verdict":"ok"|"defect","confidence":0..1,"note":"short note in ' + LANG_NAME[lang] + '"}' },
        ] }],
      });
      setVres(JSON.parse(stripJson(raw)));
    } catch (ex) { setErr(String(ex.message || ex)); }
    setBusy(false);
    e.target.value = "";
  };
  const cell = (x) => {
    const det = x.score >= thr;
    if (x.def && det) return { bg: RED + "22", bd: RED, ic: "\u2715" };
    if (x.def && !det) return { bg: AMBER + "2a", bd: AMBER, ic: "?" };
    if (!x.def && det) return { bg: "#6b5ca522", bd: "#6b5ca5", ic: "!" };
    return { bg: "#ffffff", bd: "#e2e7ee", ic: "" };
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi l={t("failL")} v={((batch.filter((x) => x.def).length / 24) * 100).toFixed(0) + "%"} tone={AMBER} />
        <Kpi l={t("precL")} v={(stat.prec * 100).toFixed(0) + "%"} />
        <Kpi l={t("recL")} v={(stat.rec * 100).toFixed(0) + "%"} tone="#3b6ea5" />
        <Kpi l={t("thrL")} v={(thr * 100).toFixed(0) + "%"} tone="#6b5ca5" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title={t("runBatch") + " \u00b7 24"}
              extra={<Btn tone="ghost" icon={RefreshCw} onClick={() => up("qc.seed", seed + 1)}>{t("regen")}</Btn>}>
          <div className="mb-4">
            <Slider l={t("thrL")} v={thr} set={(v) => up("qc.thr", v)} min={0.05} max={0.95} step={0.05}
                    show={(thr * 100).toFixed(0) + "%"} />
          </div>
          <div key={seed} className="grid grid-cols-6 md:grid-cols-8 gap-1.5">
            {batch.map((x) => {
              const c = cell(x);
              return (
                <div key={x.i} className="cs-pop rounded-lg flex items-center justify-center text-xs font-bold"
                     title={(x.type ? t(x.type) + " \u00b7 " : "") + "score " + x.score.toFixed(2)}
                     style={{ aspectRatio: "1", background: c.bg, border: "1.5px solid " + c.bd,
                              color: dk(c.bd), animationDelay: x.i * 18 + "ms" }}>
                  {c.ic}
                </div>);
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "#5c6b7a" }}>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1" style={{ background: RED }} />TP</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1" style={{ background: AMBER }} />FN</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1" style={{ background: "#6b5ca5" }} />FP</span>
          </div>
        </Card>
        <Card title={t("visionH")}>
          <div className="text-sm mb-3" style={{ color: "#5c6b7a" }}>{t("viaClaude")}</div>
          <input ref={fref} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <Btn icon={Upload} onClick={() => fref.current?.click()} disabled={busy}>
            {busy ? "\u2026" : t("uploadL")}
          </Btn>
          {img && <img src={img} alt="" className="mt-3 rounded-xl max-h-44 object-contain" style={{ border: "1px solid #e2e7ee" }} />}
          {err && <div className="mt-3 text-xs" style={{ color: dk(RED) }}>{t("apiErr")}: {err.slice(0, 120)}</div>}
          {vres && (
            <div className="cs-up mt-3 rounded-xl p-3" style={{ background: "#f7f9fa", border: "1px solid #e2e7ee" }}>
              <Pill color={vres.verdict === "ok" ? ACCENT : RED}>
                {vres.verdict === "ok" ? t("passL") : t("defL")}{" · "}{Math.round((vres.confidence || 0) * 100)}%
              </Pill>
              <div className="text-sm mt-2" style={{ color: INK }}>{vres.note}</div>
            </div>)}
        </Card>
      </div>
    </div>
  );
}

/* ============================ 9 · Risk ============================ */
function M9({ t }) {
  const { st, dv, up, arr } = useBus();
  const base = st.risks;
  const linked = st.links.m9;
  const auto = linked
    ? [{ id: "sup", k: "rkSup", p: Math.min(5, Math.ceil(dv.supRisk)), i: 4, auto: true }]
    : [];
  const risks = [...base, ...auto];
  const updR = (id, f, v) => arr("risks", base.map((r) => (r.id === id ? { ...r, [f]: +v } : r)));
  const idx = Math.round((risks.reduce((s2, r) => s2 + r.p * r.i, 0) / (risks.length * 25)) * 100);
  const hi = risks.filter((r) => r.p * r.i >= 15).length;
  const md = risks.filter((r) => r.p * r.i >= 8 && r.p * r.i < 15).length;
  const mc = useMemo(() => mcRisks(risks, st.mcUnit), [risks, st.mcUnit]);
  const cellCol = (pv) => (pv >= 15 ? RED : pv >= 8 ? AMBER : ACCENT);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi l={t("indexL")} v={idx} tone={idx >= 60 ? RED : idx >= 35 ? AMBER : ACCENT} />
        <Kpi l={t("highL")} v={hi} tone={RED} />
        <Kpi l={t("medL")} v={md} tone={AMBER} />
        <Kpi l={t("expLoss")} v={fmt(mc.mean) + " k$"} tone="#6b5ca5" />
        <Kpi l={t("p90Loss")} v={fmt(mc.p90) + " k$"} tone="#3b6ea5" />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <Card title={t("regL")} className="lg:col-span-3"
              extra={<LinkSwitch t={t} src="SC-04" on={linked} set={(v) => up("links.m9", v)} />}>
          <table className="w-full">
            <thead><tr>
              <Th>{t("riskN")}</Th><Th right>{t("probL")}</Th><Th right>{t("impactL")}</Th><Th right>P×I</Th>
            </tr></thead>
            <tbody>{risks.map((r) => (
              <tr key={r.id}>
                <Td strong>
                  {t(r.k)} {r.auto && <Pill color="#3b6ea5">SC-04</Pill>}
                </Td>
                <Td right>
                  {r.auto ? <Pill color={ACCENT}>{r.p}</Pill> : (
                    <select value={r.p} onChange={(e) => updR(r.id, "p", e.target.value)}
                            className="cs-num rounded-lg px-2 py-1 text-sm"
                            style={{ border: "1px solid #d5dbe3", background: "#fff" }}>
                      {[1,2,3,4,5].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>)}
                </Td>
                <Td right>
                  {r.auto ? <Pill color={ACCENT}>{r.i}</Pill> : (
                    <select value={r.i} onChange={(e) => updR(r.id, "i", e.target.value)}
                            className="cs-num rounded-lg px-2 py-1 text-sm"
                            style={{ border: "1px solid #d5dbe3", background: "#fff" }}>
                      {[1,2,3,4,5].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>)}
                </Td>
                <Td right><Pill color={cellCol(r.p * r.i)}>{r.p * r.i}</Pill></Td>
              </tr>))}
            </tbody>
          </table>
        </Card>
        <Card title={t("matrixL")} className="lg:col-span-2">
          <div className="grid grid-cols-6 gap-1 text-xs">
            <div />
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="text-center font-semibold py-1" style={{ color: "#7c8797" }}>{i}</div>))}
            {[5,4,3,2,1].map((pp) => (
              <React.Fragment key={pp}>
                <div className="flex items-center justify-center font-semibold" style={{ color: "#7c8797" }}>{pp}</div>
                {[1,2,3,4,5].map((ii) => {
                  const here = risks.filter((r) => r.p === pp && r.i === ii);
                  const col = cellCol(pp * ii);
                  return (
                    <div key={ii} className="rounded-md flex items-center justify-center font-bold"
                         style={{ aspectRatio: "1", background: col + (here.length ? "55" : "18"),
                                  color: dk(col), border: "1px solid " + col + "44" }}>
                      {here.length || ""}
                    </div>);
                })}
              </React.Fragment>))}
          </div>
          <div className="mt-2 text-xs text-center" style={{ color: "#98a2b0" }}>
            {t("impactL")}{" → · "}{t("probL")}{" ↑"}
          </div>
        </Card>
      </div>
      <Card title={t("mcT")}>
        <div className="grid lg:grid-cols-4 gap-4 items-start">
          <div>
            <Num l={t("unitCost")} v={st.mcUnit} set={(v) => up("mcUnit", v)} step={10} />
          </div>
          <div className="lg:col-span-3">
            <div className="text-xs mb-1" style={{ color: "#7c8797" }}>{t("exceedT")}</div>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={mc.curve} margin={{ left: -14, right: 6 }}>
                <CartesianGrid stroke="#eef1f4" vertical={false} />
                <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="%" />
                <Tooltip />
                <Line dataKey="p" name={"P(loss ≥ x)"} stroke="#6b5ca5" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================ 10 · ETA ============================ */
function M10({ t, lang }) {
  const { st, dv, up } = useBus();
  const { mode, wx, cu, cg } = st.eta;
  const linked = st.links.m10;
  const d = linked ? dv.routeKm : st.eta.d;
  const r = useMemo(() => {
    const base = d / SPEED[mode];
    const handle = HANDLE[mode];
    const wxH = base * wx * (mode === "sea" ? 1.6 : 1);
    const cgH = cu * cg * 10;
    const road = mode === "road" ? base * 0.45 : 0;
    const total = base + handle + wxH + cgH + road;
    const sigma = Math.sqrt((base * 0.08) ** 2 + (wxH * 0.5 + 1) ** 2 + (cgH * 0.4 + 0.5) ** 2);
    const cv = sigma / total;
    const sln = Math.sqrt(Math.log(1 + cv * cv));
    const mu = Math.log(total) - (sln * sln) / 2;
    const p50 = Math.exp(mu);
    const p90 = Math.exp(mu + 1.2816 * sln);
    return {
      total, p50, p90,
      parts: [
        { k: t("distL"), v: base + road },
        { k: t("handlingL"), v: handle },
        { k: t("weatherL"), v: wxH },
        { k: t("congestL"), v: cgH },
      ],
    };
  }, [d, mode, wx, cu, cg, t]);
  const dt = (hr) => new Date(Date.now() + hr * 3600e3);
  const fD = (x) => x.toLocaleDateString(LOCALE[lang], { day: "2-digit", month: "short" });
  const fT = (x) => x.toLocaleTimeString(LOCALE[lang], { hour: "2-digit", minute: "2-digit" });
  const mx = Math.max(...r.parts.map((x) => x.v));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Kpi l={t("etaP50")} v={fD(dt(r.p50))} s={fT(dt(r.p50)) + " \u00b7 " + Math.round(r.p50) + " " + t("hoursL")} />
        <Kpi l={t("etaP90")} v={fD(dt(r.p90))} s={fT(dt(r.p90)) + " \u00b7 " + Math.round(r.p90) + " " + t("hoursL")} tone={AMBER} />
        <Kpi l={t("transitL")} v={Math.round(r.total) + " " + t("hoursL")} tone="#3b6ea5" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title={t("params")}
              extra={<LinkSwitch t={t} src="SC-05" on={linked} set={(v) => up("links.m10", v)} />}>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <Sel l={t("modeL")} v={mode} set={(v) => up("eta.mode", v)}
                 opts={[["road", t("road")], ["rail", t("rail")], ["sea", t("sea")], ["air", t("air")]]} />
            {linked ? (
              <div className="rounded-xl px-3 py-2" style={{ background: "#f2f7f5", border: "1px solid " + ACCENT + "33" }}>
                <div className="text-xs" style={{ color: "#7c8797" }}>{t("distKm")}</div>
                <div className="cs-num font-bold">{fmt(dv.routeKm)} {t("uKm")}</div>
              </div>
            ) : (
              <Num l={t("distKm")} v={st.eta.d} set={(v) => up("eta.d", v)} step={100} />
            )}
            <Slider l={t("weatherL")} v={wx} set={(v) => up("eta.wx", v)} min={0} max={0.5} step={0.05} show={(wx * 100).toFixed(0) + "%"} />
            <Slider l={t("congestL")} v={cg} set={(v) => up("eta.cg", v)} min={0} max={0.4} step={0.05} show={(cg * 100).toFixed(0) + "%"} />
            <Num l={t("customsL")} v={cu} set={(v) => up("eta.cu", v)} />
          </div>
        </Card>
        <Card title={t("breakL")} className="lg:col-span-2">
          <div className="space-y-3 pt-2">
            {r.parts.map((x, i) => (
              <div key={x.k}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "#5c6b7a" }}>{x.k}</span>
                  <span className="cs-num font-semibold">{x.v.toFixed(1)} {t("hoursL")}</span>
                </div>
                <div className="h-2.5 rounded-full" style={{ background: "#eef1f4" }}>
                  <div className="cs-bar h-2.5 rounded-full"
                       style={{ width: Math.max(2, (x.v / mx) * 100) + "%",
                                background: ["#3b6ea5", ACCENT, AMBER, "#6b5ca5"][i],
                                transitionDelay: i * 60 + "ms" }} />
                </div>
              </div>))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================ 11 · Classification ============================ */
function M11({ t, lang }) {
  const [tab, setTab] = useState("doc");
  const [txt, setTxt] = useState("");
  const [res, setRes] = useState(null);
  const [ai, setAi] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState(null);
  const run = () => { setRes(classify(txt, KW[tab])); setAi(null); setAiErr(null); };
  const askAI = async () => {
    if (!txt.trim() || aiBusy) return;
    setAiBusy(true); setAi(null); setAiErr(null);
    try {
      const names = Object.keys(KW[tab]).map((k) => k + "=" + t(k)).join("; ");
      const raw = await claudeCall({ messages: [{ role: "user", content:
        'Classify the text into exactly one class. Classes (key=label): ' + names +
        '. Reply ONLY minified JSON {"key":"<class key>","confidence":0..1}. TEXT: ' + txt.slice(0, 1200) }] });
      const j = JSON.parse(stripJson(raw));
      if (!KW[tab][j.key]) throw new Error("bad key");
      setAi(j);
    } catch (ex) { setAiErr(String(ex.message || ex)); }
    setAiBusy(false);
  };
  const agree = ai && res && res.top.v > 0 && ai.key === res.top.k;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title={t("inputL")}>
        <div className="flex gap-2 mb-3">
          {["doc", "prod"].map((k) => (
            <button key={k} onClick={() => { setTab(k); setRes(null); setAi(null); }}
              className="cs-btn rounded-lg px-3 py-1.5 text-sm font-semibold"
              style={tab === k
                ? { background: INK, color: "#fff" }
                : { background: "#eef1f4", color: "#5c6b7a" }}>
              {t(k === "doc" ? "tabDoc" : "tabProd")}
            </button>))}
        </div>
        <textarea value={txt} onChange={(e) => setTxt(e.target.value)}
          rows={7} placeholder={t("clsPh")}
          className="w-full rounded-xl p-3 text-sm"
          style={{ border: "1px solid #d5dbe3", background: "#fbfcfd", resize: "vertical" }} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn icon={Play} onClick={run} disabled={!txt.trim()}>{t("classifyL")}</Btn>
          <Btn tone="ghost" icon={MessageSquare} onClick={askAI} disabled={!txt.trim() || aiBusy}>
            {aiBusy ? "\u2026" : t("clsAI")}
          </Btn>
        </div>
      </Card>
      <Card title={t("results")}>
        {!res && !ai && !aiErr ? (
          <div className="text-sm py-10 text-center" style={{ color: "#98a2b0" }}>{t("noneFound")}</div>
        ) : (
          <div className="space-y-4">
            {res && (res.top.v === 0 ? (
              <div className="text-sm font-semibold" style={{ color: dk(AMBER) }}>{t("noMatch")}</div>
            ) : (
              <div className="space-y-2.5">
                {res.rows.map((x, i) => (
                  <div key={x.k}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: i === 0 ? INK : "#5c6b7a", fontWeight: i === 0 ? 700 : 400 }}>
                        {t(x.k)} {i === 0 && <Pill color={ACCENT}>top</Pill>}
                      </span>
                      <span className="cs-num font-semibold">{(x.p * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "#eef1f4" }}>
                      <div className="cs-bar h-2 rounded-full"
                           style={{ width: Math.max(2, x.p * 100) + "%", background: i === 0 ? ACCENT : "#b9c3cf",
                                    transitionDelay: i * 50 + "ms" }} />
                    </div>
                  </div>))}
              </div>
            ))}
            {(ai || aiErr) && (
              <div className="cs-up pt-3" style={{ borderTop: "1px solid #eef1f4" }}>
                {aiErr ? (
                  <div className="text-xs" style={{ color: dk(RED) }}>{t("apiErr")}: {aiErr.slice(0, 120)}</div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span style={{ color: "#5c6b7a" }}>{t("aiSays")}:</span>
                    <Pill color="#6b5ca5">{t(ai.key)}</Pill>
                    <span className="cs-num font-semibold">{Math.round((ai.confidence || 0) * 100)}%</span>
                    {res && res.top.v > 0 && (
                      <Pill color={agree ? ACCENT : AMBER}>{agree ? t("agreeL") : t("disagreeL")}</Pill>)}
                  </div>
                )}
              </div>)}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================ 12 · OCR ============================ */
function M12({ t, lang }) {
  const [txt, setTxt] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const fref = useRef(null);
  const mkChecks = (o) => {
    const items = o.items || [];
    const ls = items.reduce((s2, it) => s2 + (it.sum || 0), 0);
    const c = [];
    if (o.total != null && o.vat != null && items.length) {
      const dd = ls + o.vat - o.total;
      c.push({ k: "chkLines", ok: Math.abs(dd) <= Math.max(0.02, o.total * 0.002), d: dd });
    }
    if (o.vatRate && o.total != null && o.vat != null) {
      const net = o.total - o.vat;
      const dd = (net * o.vatRate) / 100 - o.vat;
      c.push({ k: "chkVat", ok: Math.abs(dd) <= Math.max(0.02, o.vat * 0.01), d: dd });
    }
    return c;
  };
  const F = (o) => [
    ["fNum", o.number], ["fDate", o.date], ["fSup", o.supplier], ["fTax", o.tax],
    ["fTotal", o.total != null ? fmt(o.total, 2) : null],
    ["fVat", o.vat != null ? fmt(o.vat, 2) + (o.vatRate ? " (" + o.vatRate + "%)" : "") : null],
    ["fCur", o.currency],
  ];
  const parseTxt = () => {
    const o = parseInvoice(txt);
    setRes({ f: F(o), items: o.items || [], checks: mkChecks(o) });
    setErr(null);
  };
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true); setErr(null); setRes(null);
    try {
      const b64 = await fileToB64(f);
      const raw = await claudeCall({
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: f.type, data: b64 } },
          { type: "text", text:
            'Extract invoice fields. Reply ONLY minified JSON {"number":str|null,"date":str|null,"supplier":str|null,"tax":str|null,"total":number|null,"vat":number|null,"currency":str|null}' },
        ] }],
      });
      const o = JSON.parse(stripJson(raw));
      setRes({ f: F(o), items: [], checks: [] });
    } catch (ex) { setErr(String(ex.message || ex)); }
    setBusy(false);
    e.target.value = "";
  };
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title={t("inputL")}>
        <textarea value={txt} onChange={(e) => setTxt(e.target.value)}
          rows={11} placeholder={t("ocrPaste")}
          className="w-full rounded-xl p-3 text-sm cs-num"
          style={{ border: "1px solid #d5dbe3", background: "#fbfcfd", resize: "vertical" }} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn icon={Play} onClick={parseTxt} disabled={!txt.trim()}>{t("extractL")}</Btn>
          <Btn tone="ghost" onClick={() => setTxt(T[lang].sampleInv)}>{t("sampleL")}</Btn>
          <input ref={fref} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <Btn tone="ghost" icon={Upload} onClick={() => fref.current?.click()} disabled={busy}>
            {busy ? "\u2026" : t("imgL")}
          </Btn>
        </div>
        {err && <div className="mt-3 text-xs" style={{ color: dk(RED) }}>{t("apiErr")}: {err.slice(0, 120)}</div>}
      </Card>
      <Card title={t("results")}>
        {!res ? (
          <div className="text-sm py-10 text-center" style={{ color: "#98a2b0" }}>{t("noneFound")}</div>
        ) : (
          <div className="space-y-4">
            <table className="w-full">
              <tbody>{res.f.map(([k, v]) => (
                <tr key={k}>
                  <Td><span style={{ color: "#7c8797" }}>{t(k)}</span></Td>
                  <Td right strong>
                    {v != null && v !== "" ? <span className="cs-num">{v}</span>
                      : <span style={{ color: "#c3ccd6" }}>{"\u2014"}</span>}
                  </Td>
                </tr>))}
              </tbody>
            </table>
            {res.items.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: "#7c8797" }}>{t("linesT")}</div>
                <table className="w-full">
                  <thead><tr>
                    <Th>{t("skuL")}</Th><Th right>{t("qty")}</Th>
                    <Th right>{t("priceL")}</Th><Th right>{t("sumL")}</Th>
                  </tr></thead>
                  <tbody>{res.items.map((it, i) => (
                    <tr key={i}>
                      <Td strong>{it.name}</Td>
                      <Td right>{it.qty}</Td>
                      <Td right>{it.price != null ? fmt(it.price, 2) : "\u2014"}</Td>
                      <Td right strong>{it.sum != null ? fmt(it.sum, 2) : "\u2014"}</Td>
                    </tr>))}
                  </tbody>
                </table>
              </div>)}
            {res.checks.length > 0 && (
              <div className="space-y-1.5 pt-2" style={{ borderTop: "1px solid #eef1f4" }}>
                {res.checks.map((c) => (
                  <div key={c.k} className="flex items-center gap-2 text-sm">
                    {c.ok ? <CheckCircle2 size={16} style={{ color: dk(ACCENT) }} />
                          : <XCircle size={16} style={{ color: dk(RED) }} />}
                    <span style={{ color: "#5c6b7a" }}>{t(c.k)}</span>
                    <Pill color={c.ok ? ACCENT : RED}>
                      {c.ok ? t("okB") : t("failB") + " " + fmt(c.d, 2)}
                    </Pill>
                  </div>))}
              </div>)}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================ 13 · Assistant ============================ */
function M13({ t, lang }) {
  const { up } = useBus();
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);
  useEffect(() => { boxRef.current?.scrollTo({ top: 1e6, behavior: "smooth" }); }, [msgs, busy]);
  const send = async () => {
    const q = inp.trim();
    if (!q || busy) return;
    const hist = [...msgs, { role: "user", content: q }];
    setMsgs(hist); setInp(""); setBusy(true);
    try {
      const raw = await claudeCall({
        system:
          "You are the built-in AI assistant of ChainSense, a supply-chain analytics platform. Answer briefly and concretely about supply chain operations: inventory policy (FIFO/FEFO, cycle counts), receiving (GRN), purchase orders, forecasting, routing, warehouse slotting, risk. Answer in " +
          LANG_NAME[lang] + ". " + AGENT_SYS,
        messages: hist.map((m) => ({ role: m.role, content: m.content })),
      });
      const { text, act } = applyAgent(raw, up);
      setMsgs((ms) => [...ms, { role: "assistant", content: text || "\u2026", act }]);
    } catch (ex) {
      setMsgs((ms) => [...ms, { role: "assistant", content: t("apiErr") + ": " + String(ex.message || ex).slice(0, 140), act: null }]);
    }
    setBusy(false);
  };
  return (
    <Card title={t("m13")} className="max-w-3xl">
      <div ref={boxRef} className="space-y-3 overflow-y-auto pr-1" style={{ height: 380 }}>
        {msgs.length === 0 && !busy && (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div className="text-sm" style={{ color: "#98a2b0" }}>{t("chatHello")}</div>
            <div className="flex flex-wrap justify-center gap-2">
              {[t("askEx1"), t("askEx2")].map((q) => (
                <button key={q} onClick={() => setInp(q)}
                  className="cs-btn rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ background: "#eef1f4", color: "#5c6b7a", border: "1px solid #d5dbe3" }}>
                  {q}
                </button>))}
            </div>
          </div>)}
        {msgs.map((m, i) => (
          <Bubble key={i} who={m.role === "user" ? "u" : "a"}>
            {m.content}
            {m.act && (
              <div className="mt-1.5">
                <Pill color={ACCENT}>
                  {"\u2192 SC-" + String(m.act.module).padStart(2, "0") +
                    (m.act.applied ? " \u00b7 " + m.act.applied + " " + t("prmL") : "")}
                </Pill>
              </div>)}
          </Bubble>))}
        {busy && (
          <Bubble who="a">
            <span className="inline-flex gap-1 items-center" aria-label="typing">
              {[0, 1, 2].map((i) => (
                <span key={i} className="cs-dot inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: "#8896a6", animationDelay: i * 0.18 + "s" }} />))}
            </span>
          </Bubble>)}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={inp} onChange={(e) => setInp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("chatPh")}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm"
          style={{ border: "1px solid #d5dbe3", background: "#fbfcfd" }} />
        <Btn icon={Send} onClick={send} disabled={busy || !inp.trim()}>{t("send")}</Btn>
      </div>
    </Card>
  );
}
const Bubble = ({ who, children }) => (
  <div className={"cs-pop flex " + (who === "u" ? "justify-end" : "justify-start")}>
    <div className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
         style={who === "u"
           ? { background: INK, color: "#f2f5f8", borderBottomRightRadius: 6 }
           : { background: "#eef1f4", color: INK, borderBottomLeftRadius: 6 }}>
      {children}
    </div>
  </div>
);

/* ============================ 14 · Packing ============================ */
function IsoBox({ box, t }) {
  const lay = useMemo(() => layoutBox(box), [box]);
  const B = box.type;
  const K = 150 / (B.l + B.w);
  const P = (x, y, z) => [
    (x - y) * 0.866 * K + B.w * 0.866 * K + 10,
    (x + y) * 0.5 * K - z * K + B.h * K + 10,
  ];
  const W = (B.l + B.w) * 0.866 * K + 20;
  const Hh = (B.l + B.w) * 0.5 * K + B.h * K + 20;
  const face = (pts2, fill) => (
    <polygon points={pts2.map((q) => q.join(",")).join(" ")} fill={fill}
             stroke="#ffffff66" strokeWidth="0.6" />);
  const corners = [
    P(0, 0, 0), P(B.l, 0, 0), P(B.l, B.w, 0), P(0, B.w, 0),
    P(0, 0, B.h), P(B.l, 0, B.h), P(B.l, B.w, B.h), P(0, B.w, B.h),
  ];
  const EDG = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  const ordered = lay.placed.slice().sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z));
  return (
    <div>
      <svg viewBox={"0 0 " + W.toFixed(1) + " " + Hh.toFixed(1)} className="w-full"
           style={{ maxHeight: 300, background: "#f7f9fa", borderRadius: 12 }}>
        {EDG.map(([a, b], i) => (
          <line key={i} x1={corners[a][0]} y1={corners[a][1]} x2={corners[b][0]} y2={corners[b][1]}
                stroke="#b9c3cf" strokeWidth="0.8" strokeDasharray="3 2" />))}
        {ordered.map((u, i) => {
          const pal = ITEM_PAL[hashN(u.name) % ITEM_PAL.length];
          const { x, y, z, l, w, h } = u;
          const A = P(x, y, z + h), Bp = P(x + l, y, z + h), C = P(x + l, y + w, z + h), D = P(x, y + w, z + h);
          const E = P(x + l, y, z), Ff = P(x + l, y + w, z), G = P(x, y + w, z);
          return (
            <g key={i} className="cs-fade" style={{ animationDelay: i * 30 + "ms" }}>
              {face([A, Bp, C, D], pal[0])}
              {face([Bp, E, Ff, C], pal[1])}
              {face([D, C, Ff, G], pal[2])}
            </g>);
        })}
      </svg>
      {lay.skipped.length > 0 && (
        <div className="text-xs mt-2" style={{ color: dk(AMBER) }}>
          {t("notPlaced")} {lay.skipped.length} {"\u00b7"} {lay.skipped.map((u) => u.name).join(", ")}
        </div>)}
    </div>
  );
}
function M14({ t }) {
  const { st, arr } = useBus();
  const items = st.items;
  const [res, setRes] = useState(null);
  const [sel, setSel] = useState(0);
  const upd = (i, f, v) =>
    arr("items", items.map((x, j) => (j === i ? { ...x, [f]: f === "name" ? v : +v || 0 } : x)));
  const run = () => { setRes({ boxes: packFFD(items), base: packBaseline(items) }); setSel(0); };
  const fillPct = (b) => Math.round((b.vol / (b.type.vol * 0.85)) * 100);
  const onCsv = (rows) => {
    const mapped = rows.map((r) => ({
      name: String(r.name || "").trim(), l: +r.l || 0, w: +r.w || 0, h: +r.h || 0,
      qty: Math.round(+r.qty) || 0, wt: +r.wt || 0.5,
    })).filter((x) => x.name && x.l > 0 && x.w > 0 && x.h > 0 && x.qty > 0);
    if (!mapped.length) return 0;
    arr("items", mapped.slice(0, 24)); setRes(null);
    return Math.min(mapped.length, 24);
  };
  const exp = () => res && xport(res.boxes.map((b, i) => ({
    box: i + 1, type: b.type.id, fill_pct: fillPct(b),
    weight_kg: +b.wt.toFixed(1), items: b.items.join(", "),
  })), "packing-list", "Packing");
  const save = res ? 100 * (1 - res.boxes.length / res.base.boxes) : 0;
  return (
    <div className="space-y-4">
      {res && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi l={t("usedL")} v={res.boxes.length} />
          <Kpi l={t("baseL").split(":")[0]} v={res.base.boxes} tone="#8896a6" />
          <Kpi l={t("savingL")} v={(save > 0 ? "\u2212" : "") + Math.abs(save).toFixed(0) + "%"} tone={AMBER} />
          <Kpi l={t("fillL")} v={Math.round(res.boxes.reduce((s2, b) => s2 + fillPct(b), 0) / res.boxes.length) + "%"} tone="#3b6ea5" />
        </div>)}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title={t("itemsL")}
              extra={<Btn icon={Boxes} onClick={run}>{t("packL")}</Btn>}>
          <table className="w-full">
            <thead><tr>
              <Th>{t("skuL")}</Th><Th right>L</Th><Th right>W</Th><Th right>H</Th>
              <Th right>{t("qty")}</Th><Th right>kg</Th>
            </tr></thead>
            <tbody>{items.map((x, i) => (
              <tr key={i}>
                <Td><input value={x.name} onChange={(e) => upd(i, "name", e.target.value)}
                      className="w-24 rounded-lg px-2 py-1 text-sm"
                      style={{ border: "1px solid #e2e7ee", background: "#fbfcfd" }} /></Td>
                {["l", "w", "h", "qty", "wt"].map((f) => (
                  <Td right key={f}>
                    <input type="number" value={x[f]} onChange={(e) => upd(i, f, e.target.value)}
                      className="cs-num w-14 rounded-lg px-1.5 py-1 text-sm text-right"
                      style={{ border: "1px solid #e2e7ee", background: "#fbfcfd" }} />
                  </Td>))}
              </tr>))}
            </tbody>
          </table>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid #eef1f4" }}>
            <CsvBtn t={t} hint={t("csvHintItems")} onRows={onCsv} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs" style={{ color: "#7c8797" }}>
            {BOX_TYPES.map((b) => (
              <span key={b.id} className="rounded-lg px-2 py-1" style={{ background: "#f2f4f7" }}>
                {b.id}: {b.l + "×" + b.w + "×" + b.h}
              </span>))}
          </div>
        </Card>
        <Card title={t("layoutT")}
              extra={res && <Btn tone="ghost" icon={Download} onClick={exp}>{t("exportL")}</Btn>}>
          {!res ? (
            <div className="text-sm py-10 text-center" style={{ color: "#98a2b0" }}>{t("noneFound")}</div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {res.boxes.map((b, i) => (
                  <button key={i} onClick={() => setSel(i)}
                    className="cs-btn rounded-lg px-2.5 py-1 text-xs font-semibold"
                    style={i === sel
                      ? { background: INK, color: "#fff" }
                      : { background: "#eef1f4", color: "#5c6b7a" }}>
                    {(i + 1) + " · " + b.type.id + " " + fillPct(b) + "%"}
                  </button>))}
              </div>
              <IsoBox key={sel + "-" + res.boxes.length} box={res.boxes[sel]} t={t} />
              <div className="flex flex-wrap gap-1.5">
                {[...new Set(res.boxes[sel].items)].map((nm) => (
                  <Pill key={nm} color={ITEM_PAL[hashN(nm) % ITEM_PAL.length][1]}>
                    {nm + " × " + res.boxes[sel].items.filter((q) => q === nm).length}
                  </Pill>))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================ 15 · Sustainability ============================ */
const MODE_ALIAS = { road:"road", auto:"road", "\u0430\u0432\u0442\u043e":"road", truck:"road",
  rail:"rail", "\u0436\u0434":"rail", "d\u0259mir":"rail", train:"rail",
  sea:"sea", "\u043c\u043e\u0440\u0435":"sea", "d\u0259niz":"sea", ship:"sea",
  air:"air", "\u0430\u0432\u0438\u0430":"air", hava:"air", plane:"air" };
function M15({ t }) {
  const { st, up, arr } = useBus();
  const rows = st.ship, shift = st.shift, price = st.co2Price;
  const upd = (i, f, v) =>
    arr("ship", rows.map((x, j) => (j === i ? { ...x, [f]: f === "mode" ? v : +v || 0 } : x)));
  const del = (i) => arr("ship", rows.filter((_, j) => j !== i));
  const add = () => arr("ship", [...rows, { mode: "road", km: 500, tn: 10 }]);
  const co2 = rows.reduce((a, r) => a + (r.km * r.tn * EF[r.mode]) / 1e6, 0);
  const kwh = rows.reduce((a, r) => a + r.km * r.tn * EKWH[r.mode], 0);
  const scen = rows.reduce((a, r) => {
    if (r.mode !== "road") return a + (r.km * r.tn * EF[r.mode]) / 1e6;
    const mv = (r.tn * shift) / 100;
    return a + (r.km * (r.tn - mv) * EF.road) / 1e6 + (r.km * mv * EF.rail) / 1e6;
  }, 0);
  const savedT = co2 - scen;
  const onCsv = (rws) => {
    const mapped = rws.map((r) => ({
      mode: MODE_ALIAS[String(r.mode || "").trim().toLowerCase()] || null,
      km: +r.km || 0, tn: +r.tn || 0,
    })).filter((x) => x.mode && x.km > 0 && x.tn > 0);
    if (!mapped.length) return 0;
    arr("ship", mapped.slice(0, 40));
    return Math.min(mapped.length, 40);
  };
  const exp = () => xport([
    ...rows.map((r, i) => ({ n: i + 1, mode: r.mode, km: r.km, tn: r.tn,
      co2e_kg: Math.round(r.km * r.tn * EF[r.mode] / 1000),
      kwh: Math.round(r.km * r.tn * EKWH[r.mode]) })),
    { n: "TOTAL", mode: "", km: "", tn: "",
      co2e_kg: Math.round(co2 * 1000), kwh: Math.round(kwh) },
    { n: "SCENARIO " + shift + "% \u2192 rail", mode: "", km: "", tn: "",
      co2e_kg: Math.round(scen * 1000), kwh: "" },
  ], "co2-report", "CO2");
  const mCol = { road: AMBER, rail: ACCENT, sea: "#3b6ea5", air: RED };
  const byMode = ["road", "rail", "sea", "air"].map((m) => ({
    m: t(m),
    v: +rows.filter((r) => r.mode === m)
        .reduce((a, r) => a + (r.km * r.tn * EF[r.mode]) / 1e6, 0).toFixed(2),
    c: mCol[m],
  }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi l={"CO2e, " + t("tonsL")} v={co2.toFixed(2)} />
        <Kpi l={t("energyL")} v={fmt(kwh) + " " + "kWh"} tone="#3b6ea5" />
        <Kpi l={t("scenL")} v={scen.toFixed(2) + " " + t("tonsL")} tone={ACCENT}
             s={"\u2212" + (co2 > 0 ? ((savedT / co2) * 100).toFixed(0) : 0) + "%"} />
        <Kpi l={t("co2SaveL")} v={fmt(savedT * price, 0) + " \u20ac"} tone={AMBER}
             s={"@ " + price + " \u20ac/t"} />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <Card title={t("shipsL")} className="lg:col-span-3"
              extra={<Btn tone="ghost" icon={Download} onClick={exp}>{t("exportL")}</Btn>}>
          <table className="w-full">
            <thead><tr>
              <Th>{t("modeL")}</Th><Th right>{t("uKm")}</Th><Th right>{t("tonsL")}</Th>
              <Th right>CO2e, kg</Th><Th right></Th>
            </tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={i}>
                <Td>
                  <select value={r.mode} onChange={(e) => upd(i, "mode", e.target.value)}
                          className="rounded-lg px-2 py-1 text-sm"
                          style={{ border: "1px solid #d5dbe3", background: "#fff" }}>
                    {["road","rail","sea","air"].map((m) => <option key={m} value={m}>{t(m)}</option>)}
                  </select>
                </Td>
                <Td right>
                  <input type="number" value={r.km} onChange={(e) => upd(i, "km", e.target.value)}
                    className="cs-num w-20 rounded-lg px-1.5 py-1 text-sm text-right"
                    style={{ border: "1px solid #e2e7ee", background: "#fbfcfd" }} />
                </Td>
                <Td right>
                  <input type="number" value={r.tn} onChange={(e) => upd(i, "tn", e.target.value)}
                    className="cs-num w-16 rounded-lg px-1.5 py-1 text-sm text-right"
                    style={{ border: "1px solid #e2e7ee", background: "#fbfcfd" }} />
                </Td>
                <Td right strong>{fmt(r.km * r.tn * EF[r.mode] / 1000)}</Td>
                <Td right>
                  <button onClick={() => del(i)} className="cs-btn p-1 rounded-md"
                          style={{ color: "#98a2b0" }} title={t("del")}>
                    <Trash2 size={13} />
                  </button>
                </Td>
              </tr>))}
            </tbody>
          </table>
          <div className="mt-3 flex flex-wrap items-center gap-3 pt-3" style={{ borderTop: "1px solid #eef1f4" }}>
            <Btn tone="ghost" onClick={add}>+ {t("add")}</Btn>
            <CsvBtn t={t} hint={t("csvHintShip")} onRows={onCsv} />
          </div>
        </Card>
        <Card title={t("scenL")} className="lg:col-span-2">
          <Slider l={t("shiftL")} v={shift} set={(v) => up("shift", v)} min={0} max={80} step={5} show={shift + "%"} />
          <div className="mt-3">
            <Num l={t("co2PriceL")} v={price} set={(v) => up("co2Price", v)} step={5} />
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={byMode} margin={{ left: -18, right: 6, top: 12 }}>
              <CartesianGrid stroke="#eef1f4" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="v" name={"CO2e, " + t("tonsL")} radius={[6, 6, 0, 0]}>
                {byMode.map((x, i) => <Cell key={i} fill={x.c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ============================ shell ============================ */
const MODS = [
  { id: 1,  C: M1,  ic: TrendingUp },     { id: 2,  C: M2,  ic: Package },
  { id: 3,  C: M3,  ic: ShoppingCart },   { id: 4,  C: M4,  ic: Users },
  { id: 5,  C: M5,  ic: Route },          { id: 6,  C: M6,  ic: Warehouse },
  { id: 7,  C: M7,  ic: Wrench },         { id: 8,  C: M8,  ic: ScanSearch },
  { id: 9,  C: M9,  ic: ShieldAlert },    { id: 10, C: M10, ic: Timer },
  { id: 11, C: M11, ic: Tags },           { id: 12, C: M12, ic: FileText },
  { id: 13, C: M13, ic: MessageSquare },  { id: 14, C: M14, ic: Boxes },
  { id: 15, C: M15, ic: Leaf },
];
const MCOLOR = { 1: ACCENT, 2: "#3b6ea5", 3: "#6b5ca5", 4: "#b0578d", 5: ACCENT,
  6: "#8a8f3c", 7: RED, 8: "#6b5ca5", 9: RED, 10: "#3b6ea5",
  11: "#b0578d", 12: AMBER, 13: ACCENT, 14: "#4c9a6a", 15: "#4c9a6a" };
const SNAP_METRICS = (s2) => {
  const d2 = computeDerived(s2);
  const co2v = s2.ship.reduce((a, r) => a + (r.km * r.tn * EF[r.mode]) / 1e6, 0);
  const ri = s2.risks.length
    ? Math.round((s2.risks.reduce((a, r) => a + r.p * r.i, 0) / (s2.risks.length * 25)) * 100) : 0;
  return { fcD: d2.fcD, eoq: Math.round(d2.eoq), route: d2.routeKm,
           risk: ri, co2: +co2v.toFixed(2), boxes: packFFD(s2.items).length };
};
function Shell() {
  const { st, up, dispatch } = useBus();
  const lang = st.ui.lang, mod = st.ui.mod, showHelp = st.ui.help;
  FMT_LOCALE = LOCALE[lang];
  const t = (k) => (T[lang] && T[lang][k]) ?? T.en[k] ?? k;
  const [open, setOpen] = useState(false);
  const [cmp, setCmp] = useState(false);
  const [snaps, setSnaps] = useState({ a: null, b: null });
  useEffect(() => { (async () => {
    for (const slot of ["a", "b"]) {
      try {
        const r = await window.storage?.get?.("cs-snap-" + slot);
        if (r && r.value) {
          const v = JSON.parse(r.value);
          setSnaps((s2) => ({ ...s2, [slot]: v }));
        }
      } catch {}
    }
  })(); }, []);
  const save = (slot) => {
    const v = { ts: Date.now(), st };
    setSnaps((s2) => ({ ...s2, [slot]: v }));
    try { window.storage?.set?.("cs-snap-" + slot, JSON.stringify(v)); } catch {}
  };
  const load = (slot) => snaps[slot] && dispatch({ t: "load", v: snaps[slot].st });
  const cur = MODS.find((m) => m.id === mod);
  const Comp = cur.C;
  const metrics = useMemo(() => {
    if (!cmp) return null;
    return {
      a: snaps.a ? SNAP_METRICS(sanitize(snaps.a.st)) : null,
      b: snaps.b ? SNAP_METRICS(sanitize(snaps.b.st)) : null,
      c: SNAP_METRICS(st),
    };
  }, [cmp, snaps, st]);
  const MROWS = [
    ["fcD", t("m1")], ["eoq", "EOQ"], ["route", t("m5") + ", " + t("uKm")],
    ["risk", t("indexL")], ["co2", "CO2e, " + t("tonsL")], ["boxes", t("usedL")],
  ];
  const slotHead = (slot, label) => (
    <div className="flex items-center gap-2">
      <span className="font-semibold">{label}</span>
      <Btn tone="ghost" icon={Save} onClick={() => save(slot)}>{t("saveS")}</Btn>
      <Btn tone="ghost" onClick={() => load(slot)} disabled={!snaps[slot]}>{t("loadS")}</Btn>
      <span className="text-xs" style={{ color: "#98a2b0" }}>
        {snaps[slot] ? new Date(snaps[slot].ts).toLocaleString(LOCALE[lang]) : t("emptyS")}
      </span>
    </div>
  );
  return (
    <div className="cs-root min-h-screen flex" style={{ background: BG, color: INK }}>
      <style>{CSS}</style>
      {/* -------- sidebar -------- */}
      <aside className={"fixed lg:static z-40 inset-y-0 left-0 w-64 flex-col transition-transform lg:translate-x-0 " +
        (open ? "translate-x-0 flex" : "-translate-x-full lg:flex hidden lg:flex")}
        style={{ background: INK }}>
        <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
               style={{ background: ACCENT }}>
            <Boxes size={17} color="#fff" />
          </div>
          <div>
            <div className="cs-display font-bold text-white leading-none">ChainSense</div>
            <div className="text-[10px] tracking-widest mt-1" style={{ color: "#8fa0b3" }}>SUPPLY AI</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {MODS.map((m) => {
            const on = m.id === mod;
            const Ic = m.ic;
            return (
              <button key={m.id} onClick={() => { up("ui.mod", m.id); setOpen(false); }}
                className="cs-nav w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left"
                style={on ? { background: "#1c2a3d", color: "#fff" } : { color: "#a9b7c6" }}>
                <Ic size={15} style={{ color: on ? ACCENT : "#7488a0", flexShrink: 0 }} />
                <span className="text-[13px] font-medium leading-tight">{t("m" + m.id)}</span>
              </button>);
          })}
        </nav>
      </aside>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      {/* -------- main -------- */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 px-4 lg:px-8 py-3.5 flex items-center gap-3"
                style={{ background: "rgba(238,241,244,0.92)", backdropFilter: "blur(8px)",
                         borderBottom: "1px solid #dde3ea" }}>
          <button className="lg:hidden p-2 -ml-2 rounded-lg" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-widest" style={{ color: dk(ACCENT) }}>
              SC-{String(mod).padStart(2, "0")}
            </div>
            <h1 className="cs-display text-lg lg:text-xl font-bold leading-tight truncate">{t("m" + mod)}</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => setCmp(!cmp)} title={t("compareT")}
              className="cs-btn p-2 rounded-lg"
              style={cmp ? { background: INK, color: "#fff" } : { background: "#e3e8ee", color: "#5c6b7a" }}>
              <ArrowLeftRight size={15} />
            </button>
            <button onClick={() => up("ui.help", !showHelp)} title={t("helpL")}
              className="cs-btn p-2 rounded-lg"
              style={showHelp ? { background: INK, color: "#fff" } : { background: "#e3e8ee", color: "#5c6b7a" }}>
              <HelpCircle size={15} />
            </button>
            {["en", "ru", "az"].map((l) => (
              <button key={l} onClick={() => up("ui.lang", l)}
                className="cs-btn rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase"
                style={lang === l ? { background: INK, color: "#fff" } : { background: "#e3e8ee", color: "#5c6b7a" }}>
                {l}
              </button>))}
          </div>
        </header>
        <div className="px-4 lg:px-8 py-5 space-y-4 max-w-[1240px] w-full mx-auto">
          {cmp && metrics && (
            <div className="cs-up cs-card bg-white rounded-2xl p-4" style={{ border: "1px solid #dde3ea" }}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="cs-display font-bold">{t("compareT")}</div>
                <Btn tone="ghost" icon={RefreshCw} onClick={() => dispatch({ t: "reset" })}>{t("resetDemo")}</Btn>
              </div>
              <div className="grid md:grid-cols-2 gap-2 mb-3">
                {slotHead("a", t("scnA"))}
                {slotHead("b", t("scnB"))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr>
                    <Th>{t("metricL")}</Th><Th right>A</Th><Th right>B</Th><Th right>{t("curL")}</Th>
                  </tr></thead>
                  <tbody>{MROWS.map(([k, l]) => (
                    <tr key={k}>
                      <Td strong>{l}</Td>
                      <Td right>{metrics.a ? fmt(metrics.a[k], k === "co2" ? 2 : 0) : "\u2014"}</Td>
                      <Td right>{metrics.b ? fmt(metrics.b[k], k === "co2" ? 2 : 0) : "\u2014"}</Td>
                      <Td right strong>{fmt(metrics.c[k], k === "co2" ? 2 : 0)}</Td>
                    </tr>))}
                  </tbody>
                </table>
              </div>
            </div>)}
          {showHelp && (
            <div key={"h" + mod + lang} className="cs-up cs-card rounded-2xl p-4 flex gap-3 bg-white"
                 style={{ border: "1px solid #dde3ea", borderLeft: "4px solid " + (MCOLOR[mod] || ACCENT) }}>
              <HelpCircle size={17} style={{ color: MCOLOR[mod] || ACCENT, flexShrink: 0, marginTop: 2 }} />
              <div>
                <div className="text-xs font-bold tracking-wide mb-1" style={{ color: "#7c8797" }}>{t("helpL")}</div>
                <div className="text-sm leading-relaxed" style={{ color: "#3d4a5c" }}>{t("h" + mod)}</div>
              </div>
            </div>)}
          <div key={mod} className="cs-up">
            <CsBoundary key={"b" + mod} title={t("crashT")} retry={t("retryL")}>
              <Comp t={t} lang={lang} />
            </CsBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
export default function App() {
  return (
    <Bus>
      <Shell />
    </Bus>
  );
}
