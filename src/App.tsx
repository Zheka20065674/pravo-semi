import { useEffect, useMemo, useState } from "react";
import { documentDefinitions, documentResearchQueue } from "./data/documentRequirements";
import { documentTemplates } from "./data/documentTemplates";
import DocumentTemplatePanel from "./components/DocumentTemplatePanel";
import LegalAssistant from "./components/LegalAssistant";

type Lang = "ru" | "kk";
type Topic = "divorce" | "property" | "alimony" | "child" | "marriage";

const topics: { id: Topic; icon: string; title: string; description: string }[] = [
  { id: "marriage", icon: "💍", title: "Заключение брака", description: "Условия регистрации, документы, брачный договор и имущественные вопросы." },
  { id: "divorce", icon: "⚖️", title: "Расторжение брака", description: "Варианты расторжения брака, порядок действий и подготовка к процедуре." },
  { id: "property", icon: "🏠", title: "Раздел имущества", description: "Совместное имущество, личная собственность, соглашение и судебный спор." },
  { id: "alimony", icon: "🤝", title: "Алименты", description: "Содержание детей и других членов семьи, соглашения и взыскание." },
  { id: "child", icon: "🧒", title: "Права ребёнка", description: "Место жительства, общение с родителями и защита интересов ребёнка." },
];

const documents = [

...documentDefinitions.map((doc) => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    description: doc.purpose,
    status: documentTemplates.some((template) => template.id === doc.id) ? "Образец доступен" : doc.status === "published" ? "Опубликован" : "Правовая карта: черновик",
  })),
  ...documentResearchQueue.map((doc) => ({
    id: doc.id,
    title: doc.title,
    category: doc.id.startsWith("child-") ? "Дети" : "Суд",
    description: doc.status,
    status: "Исследование",
  })),
];

const topicsKk: { id: Topic; icon: string; title: string; description: string }[] = [
  { id: "marriage", icon: "💍", title: "Некеге тұру", description: "Некені тіркеу талаптары, қажетті құжаттар, неке шарты және мүліктік мәселелер." },
  { id: "divorce", icon: "⚖️", title: "Некені бұзу", description: "Некені бұзу жолдары, іс-қимыл тәртібі және рәсімге дайындық." },
  { id: "property", icon: "🏠", title: "Мүлікті бөлу", description: "Ортақ және жеке мүлік, келісім және сот дауы." },
  { id: "alimony", icon: "🤝", title: "Алимент", description: "Балалар мен отбасының басқа мүшелерін асырау, келісім жасау және алимент өндіріп алу." },
  { id: "child", icon: "🧒", title: "Баланың құқықтары", description: "Баланың тұрғылықты жері, ата-анасымен араласуы және оның мүдделерін қорғау." },
];

const kkUi = {
  topLine:"Қазақстан Республикасының отбасы құқығы", topMeta:"Ақпарат • Сценарийлер • Құжаттар",
  trust1:"✓ Құқықтық карталарда дереккөздер көрсетілген", trust2:"✓ Бейтарап түсіндіру",
  quick:["Түсінікті ақпарат","Іс-қимыл сценарийлері","Құжаттар мен нұсқаулықтар","Құқықтық сауаттылық"],
  directions:"Отбасы құқығының негізгі салалары", directionIntro:"Өзіңізді қызықтыратын тақырыпты таңдаңыз — платформа құқықтық мәселелер мен келесі қадамдарды түсінуге көмектеседі.",
  assistantTitle:"Жағдай → маңызды мән-жайлар → тексерілуге тиіс мәселелер",
  assistantLead:"Бірнеше сұраққа жауап беріңіз. Сауалнама бастапқы мән-жайларды тіркеп, қандай құқықтық мәселелерді тексеру керектігін анықтауға көмектеседі. Әзірге ол құқық нормаларын автоматты түрде қолданбайды және істің нәтижесін болжамайды.",
  points:[["Жағдайды нақтылау","Құқықтық маңызы бар мән-жайларды айқындаймыз."],["Құқықтық негіз","Тексерілуге тиіс құқық нормаларын анықтаймыз."],["Нұсқаларды салыстыру","Салдарларды, тәуекелдерді және келесі қадамдарды қарастырамыз."]],
  legalNote:"Сценарий тек ақпараттық мақсатта ұсынылады: бұл — сауалнама, автоматтандырылған құқықтық талдау емес. Ол құжаттарды тексермейді, құқықтық ұстанымды айқындамайды және заң көмегін көрсету жөніндегі жеке консультацияны алмастырмайды.",
  interactive:"ИНТЕРАКТИВТІ СЦЕНАРИЙ", step:"ҚАДАМ", summary:"ҚОРЫТЫНДЫ", choose:"Құқықтық тақырыпты таңдаңыз", back:"Артқа", next:"Жалғастыру",
  preliminary:"АЛДЫН АЛА ҚОРЫТЫНДЫ", answers:"Сіз мына мән-жайларды көрсеттіңіз:", nextStage:"КЕЛЕСІ КЕЗЕҢ",
  warningTitle:"Нәтиженің қолданылу шектері.", warning:"Бұл — сұрақтар мен құжаттардың алдын ала картасы, құқықтық қорытынды емес. Мұнда қолданылатын баптар айқындалмайды, сомалар есептелмейді және сот шешімі болжанбайды. Ол үшін фактілерді, құжаттарды және Қазақстан Республикасы нормативтік құқықтық актілерінің қолданыстағы редакцияларын тексеру қажет.",
  edit:"Жауаптарды өзгерту", restart:"Қайта өту", scenarioFoot:"Жауаптарыңыз әзірге серверге жіберілмейді және бетті жапқаннан кейін сақталмайды.",
  library:"Құжаттар мен құқықтық карталар", libraryIntro:"Құқықтық маңызы бар әрекеттерге дайындалуға арналған құжаттар кітапханасы.",
  search:"Құжаттарды іздеу", searchPlaceholder:"Құжатты немесе тақырыпты іздеу...", open:"Талаптарды ашу", close:"Жабу",
  docDraft:"ҚҰҚЫҚТЫҚ КАРТА / ЖОБА", notTemplate:"Дайын құжат үлгісі болып табылмайды", sourceCheck:"Нормативтік құқықтық актілерге сілтемелер олардың қолданыстағы редакциясы бойынша тексерілуге тиіс",
  docHeadings:["Құқықтық дереккөздер","Құжаттың мазмұны","Нысаны және куәландыру тәртібі","Қосымшалар мен растаушы құжаттар","Процестік талаптар","Шектеулер мен тәуекелдер"],
  kinds:["Міндетті","Белгілі бір жағдайларда","Ұсынылады"],
  docWarning:"Бұл құқықтық карта — жобаның жұмыс материалы; ол толық заңдық сараптамадан өткен жоқ. Жүйе әзірге құжат жасамайды және оның нақты іс бойынша қойылатын барлық талаптарға сәйкестігін растамайды.",
  empty:"Сұрауыңыз бойынша құжаттар табылмады. Іздеу сөзін немесе санатты өзгертіп көріңіз.",
  knowledge:"Өз құқықтарыңызды түсініңіз", knowledgeIntro:"Отбасы құқығының негізгі мәселелері — түсінікті тілмен және заңнамаға сүйене отырып.",
  featureTitle:"Жай жауап емес, құқықтық салдарды түсіну", featureText:"Біз құқықтық негізді, тараптардың ықтимал ұстанымдарын және нәтижеге әсер ететін мән-жайларды көрсетуге тырысамыз.",
  aboutTitle:"Құқық түсінікті әрі қолжетімді болуы керек",
  about1:"«Право Семьи» — Қазақстан Республикасының отбасы құқығына арналған ақпараттық платформасының жобасы. Оның мақсаты — адамға құқықтық мәселелерді түсінуге, ықтимал әрекет нұсқаларын көруге және мемлекеттік органдармен немесе сотпен өзара іс-қимылға дайындалуға көмектесу.",
  about2:"Платформа құқықтық ақпараттың дәлдігі, бейтараптық және отбасылық құқықтық қатынастарға қатысушылардың, ең алдымен балалардың мүдделерін құрметтеу қағидаттары негізінде дамиды.",
  footer:"Қазақстан Республикасының отбасы құқығы — түсінікті, жүйелі және нақты.", disclaimer:"Ақпараттық платформа. Заң көмегін көрсету жөніндегі жеке консультацияны алмастырмайды.", top:"Жоғары ↑",
  languageGroup:"Сайт тілін таңдау", menuOpen:"Мәзірді ашу", menuClose:"Мәзірді жабу", navLabel:"Негізгі навигация",
  brandTag:"ҚҰҚЫҚТЫҚ ПЛАТФОРМА", principlesButton:"Жоба қағидаттары туралы", principles:["Заңдылық","Объективтілік","Түсініктілік","Құпиялылық"],
  adiletLink:"«Әділет» ақпараттық-құқықтық жүйесінде ашу", noticeClose:"Хабарламаны жабу", adminDemo:"Әкімші панелінің көрсетілімдік нұсқасы",
} as const;



function translateCardText(id: string, field: "title" | "category" | "description", fallback: string): string {
  const translations: Record<string, Partial<Record<"title" | "category" | "description", string>>> = {
    "divorce-claim": { title: "Некені бұзу туралы талап қою", category: "Некені бұзу", description: "Некені бұзу туралы талаппен сотқа жүгіну; онымен байланысты өзге талаптар бөлек бағаланады." },
    "marriage-contract": { title: "Неке шарты", category: "Неке", description: "Некеге тұратын адамдардың немесе ерлі-зайыптылардың мүліктік құқықтары мен міндеттерін айқындау." },
    "property-division-agreement": { title: "Ерлі-зайыптылардың ортақ мүлкін бөлу туралы келісім", category: "Мүлік", description: "Ерлі-зайыптылардың ортақ мүлкін өзара келісім бойынша ерікті түрде бөлу." },
    "alimony-agreement": { title: "Алимент төлеу туралы келісім", category: "Алимент", description: "Алимент төлеуге міндетті тұлға мен алушы арасындағы алимент мөлшерін, төлеу шарттары мен тәртібін белгілеу." },
    "child-residence-claim": { title: "Баланың тұрғылықты жерін айқындау туралы талап қою", category: "Балалар", description: "Баланың құқықтары, қорғаншылық немесе қамқоршылық жөніндегі функцияларды жүзеге асыратын органның қатысуы және дәлелдемелер туралы нормаларды бөлек зерттеу қажет." },
    "child-contact-agreement": { title: "Баламен араласу тәртібі туралы келісім", category: "Балалар", description: "Келісім нысанын, баланың мүдделерін және қорғаншылық немесе қамқоршылық жөніндегі функцияларды жүзеге асыратын органның не медиатордың ықтимал қатысуын бөлек зерттеу қажет." },
    "court-response": { title: "Талап қоюға жазбаша пікір (ҚР АПК-нің 166-бабы)", category: "Сот", description: "Жауапкердің әрбір талап бойынша қарсылықтары мен оларды растайтын дәлелдемелері көрсетілген жазбаша ұстанымы." },
    "appeal": { title: "Сот шешіміне апелляциялық шағым", category: "Сот", description: "Бірінші сатыдағы соттың заңды күшіне енбеген шешіміне азаматтық іс бойынша шағым жасау." },
  };
  return translations[id]?.[field] ?? fallback;
}


const navLabels = ["Главная", "Правовой помощник", "Документы", "О проекте"];
const kkLegalText: Record<string, string> = {};
const categoryTranslation: Record<string, string> = {
  "Брак": "Неке", "Развод": "Некені бұзу", "Имущество": "Мүлік",
  "Дети": "Балалар", "Суд": "Сот", "Алименты": "Алимент",
};
const categoryPairs = [
  { ru: "Все", kk: "Барлығы" },
  ...Array.from(new Set(documents.map((doc) => doc.category))).map((ru) => ({
    ru,
    kk: categoryTranslation[ru] ?? ru,
  })),
];

const kkAdmin = {
  title:"Әкімші панелі", tag:"Әкімші панелінің көрсетілімдік нұсқасы", back:"← Сайтқа оралу",
  eyebrow:"ПЛАТФОРМАНЫ БАСҚАРУ",
  lead:"Болашақ панельдің көрнекі нұсқасы. Әзірге бұл тек көрсетілімдік үлгі: рөлдерді, дерекқорды және серверлік тексерулерді қосу қажет.",
  stats:["Сайт бөлімдері","Каталог материалдары","Құқықтық сценарийлер","Интерфейс тілдері"],
  modules:"Платформа модульдері", connect:"Қосу қажет функциялар", demo:"Үлгі",
  items:["Басты бет","Құқықтық бағыттар","Көмекші сценарийлері","Құжаттар кітапханасы","Білім базасы","Жиі қойылатын сұрақтар","Тіл баптаулары","Пайдаланушылар мен рөлдер"],
  tasks:["Дерекқор және резервтік көшірме жасау","Авторизация және әкімші рөлдері","Әкімшінің әрекеттер журналы","Құқықтық материалдарды тексеру және жариялау","Құжаттарды қауіпсіз өңдеу"],
};

export default function App() {
  const [language, setLanguage] = useState<Lang>("ru");
  const [activeNav, setActiveNav] = useState("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const isKk = language === "kk";
  useEffect(() => {
    document.documentElement.lang = language;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", language === "kk"
      ? "«Право Семьи» — Қазақстан Республикасының отбасы құқығы туралы ақпараттық платформа: құқықтық сценарийлер, құжаттар және түсінікті нұсқаулықтар."
      : "Право Семьи — информационная платформа о семейном праве Республики Казахстан: правовые сценарии, документы и понятные инструкции.");
    const locale = document.querySelector('meta[property="og:locale"]');
    locale?.setAttribute("content", language === "kk" ? "kk_KZ" : "ru_KZ");
    const ogTitle = document.querySelector('meta[property="og:title"]');
    ogTitle?.setAttribute("content", language === "kk"
      ? "Право Семьи — Қазақстан Республикасының отбасы құқығы"
      : "Право Семьи — семейное право Республики Казахстан");
    const ogDescription = document.querySelector('meta[property="og:description"]');
    ogDescription?.setAttribute("content", language === "kk"
      ? "Отбасы құқығын түсініңіз, құқықтық сценарийлермен танысыңыз және құжаттарға қойылатын талаптарды зерделеңіз."
      : "Разбирайтесь в семейном праве, изучайте правовые сценарии и требования к документам.");
  }, [language]);
  const filteredDocuments = useMemo(() => documents.map((doc) => isKk ? {
    ...doc,
    title: translateCardText(doc.id, "title", doc.title),
    category: translateCardText(doc.id, "category", doc.category),
    description: translateCardText(doc.id, "description", doc.description),
    status: doc.status === "Образец доступен" ? "Үлгі қолжетімді" : doc.status === "Правовая карта: черновик" ? "Құқықтық карта: жоба" : doc.status === "Исследование" ? "Зерттеу" : doc.status === "Опубликован" ? "Жарияланған" : doc.status,
  } : doc).filter((doc) => {
    const original = documents.find((item) => item.id === doc.id);
    const bilingualSearchText = [
      doc.title, doc.description,
      original?.title ?? "", original?.description ?? "",
      translateCardText(doc.id, "title", original?.title ?? doc.title),
      translateCardText(doc.id, "description", original?.description ?? doc.description),
    ].join(" ").toLowerCase();
    return (category === "Все" || (isKk ? categoryPairs.find((item) => item.ru === category)?.kk : category) === doc.category) &&
      bilingualSearchText.includes(search.toLowerCase());
  }), [category, search, isKk]);

  const visibleTopics = isKk ? topicsKk : topics;
  const selectedDocumentRaw = documentDefinitions.find((doc) => doc.id === selectedDocumentId) ?? null;
  const selectedTemplate = documentTemplates.find((template) => template.id === selectedDocumentId) ?? null;
  const translateLegal = (value: string) => isKk ? (kkLegalText[value] ?? value) : value;
  const selectedDocument = selectedDocumentRaw && isKk ? {
    ...selectedDocumentRaw,
    title: translateLegal(selectedDocumentRaw.title),
    category: translateLegal(selectedDocumentRaw.category),
    purpose: translateLegal(selectedDocumentRaw.purpose),
    legalSources: selectedDocumentRaw.legalSources.map((source) => ({ ...source, act: source.act.includes("Гражданский процессуальный") ? "Қазақстан Республикасының Азаматтық процестік кодексі" : "Қазақстан Республикасының «Неке (ерлі-зайыптылық) және отбасы туралы» кодексі", title: translateLegal(source.title), url: source.url.replace("/rus/", "/kaz/") })),
    contentRequirements: selectedDocumentRaw.contentRequirements.map((item) => ({ ...item, label: translateLegal(item.label), explanation: translateLegal(item.explanation) })),
    formRequirements: selectedDocumentRaw.formRequirements.map((item) => ({ ...item, label: translateLegal(item.label), explanation: translateLegal(item.explanation) })),
    attachmentRequirements: selectedDocumentRaw.attachmentRequirements.map((item) => ({ ...item, label: translateLegal(item.label), explanation: translateLegal(item.explanation) })),
    processNotes: selectedDocumentRaw.processNotes.map((item) => ({ ...item, label: translateLegal(item.label), explanation: translateLegal(item.explanation) })),
    limitations: selectedDocumentRaw.limitations.map(translateLegal),
  } : selectedDocumentRaw;

  function goTo(id: string) {
    setActiveNav(id);
    setMobileMenu(false);
    setShowAdmin(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseTopic(_id: Topic) {
    goTo("assistant");
  }

  function changeLanguage(nextLanguage: Lang) {
    if (nextLanguage === language) return;
    setNotice("");
    setLanguage(nextLanguage);
  }

  const faqs = isKk ? [
    { q: "Сот шешімін алдын ала нақты болжауға бола ма?", a: "Жоқ. Сот шешімі істің мән-жайларына, дәлелдемелерге, қолданылатын құқық нормаларына және соттың бағалауына байланысты. Платформа ықтимал нұсқалар мен тәуекелдерді түсіндіре алады, бірақ істің нәтижесіне кепілдік бермейді." },
    { q: "Құқықтық сценарийді пайдалану үшін тіркелу қажет пе?", a: "Платформаның алғашқы нұсқасында сценарийлермен танысу үшін міндетті тіркелу талап етілмейді. Тарихты сақтау және жеке функциялар қорғалған авторизация енгізілгеннен кейін ғана қолжетімді болады." },
    { q: "Құқықтық ақпарат қайдан алынады?", a: "Негізгі дереккөздер — Қазақстан Республикасының қолданыстағы нормативтік құқықтық актілері және ресми ақпараттық ресурстар, ең алдымен «Әділет» ақпараттық-құқықтық жүйесі. Әр материал бойынша актінің редакциясы мен өзектілік күні көрсетілуге тиіс." },
    { q: "Тексеру үшін өз құжатымды жүктей аламын ба?", a: "Бұл мүмкіндік жобада көзделген, бірақ әзірге іске қосылған жоқ. Оны іске қоспас бұрын файлдарды қауіпсіз өңдеу және құпиялылық талаптарын енгізу қажет." },
  ] : [
    { q: "Можно ли заранее достоверно предсказать решение суда?", a: "Нет. Судебный результат зависит от обстоятельств дела, доказательств, применимых норм и оценки суда. Платформа сможет объяснять возможные варианты и риски, но не обещать исход." },
    { q: "Нужно ли регистрироваться для ознакомления с правовым сценарием?", a: "В первой версии для ознакомления со сценариями регистрация не требуется. Сохранение истории и персональные функции станут доступны после внедрения защищённой авторизации." },
    { q: "На каких источниках основана правовая информация?", a: "Основным ориентиром будут действующие нормативные правовые акты Республики Казахстан и официальные источники, прежде всего ИПС «Әділет». Для каждого материала важны редакция и дата актуальности." },
    { q: "Можно ли загрузить свой документ на проверку?", a: "Это предусмотрено концепцией проекта, но функция пока не подключена. До её запуска необходимо реализовать защищённую обработку файлов и правила конфиденциальности." },
  ];

  if (showAdmin) {
    return <div className="admin-shell">
      <header className="admin-top"><a className="brand" href="#" onClick={(e) => { e.preventDefault(); setShowAdmin(false); }}>⚖️ {isKk ? "Отбасы құқығы" : "Право Семьи"}</a><span className="admin-tag">{isKk ? kkAdmin.tag : "Предварительный макет админ-панели"}</span><button className="btn btn-outline" onClick={() => setShowAdmin(false)}>{isKk ? kkAdmin.back : "← На сайт"}</button></header>
      <main className="admin-main"><p className="eyebrow">{isKk ? kkAdmin.eyebrow : "УПРАВЛЕНИЕ ПЛАТФОРМОЙ"}</p><h1>{isKk ? kkAdmin.title : "Панель администратора"}</h1><p className="muted">{isKk ? kkAdmin.lead : "Визуальная основа будущей панели. Управление пока демонстрационное: подключение ролей, базы данных и серверных проверок ещё предстоит."}</p>
        <div className="admin-stats"><div className="admin-stat"><span>{isKk ? kkAdmin.stats[0] : "Разделы сайта"}</span><strong>5</strong></div><div className="admin-stat"><span>{isKk ? kkAdmin.stats[1] : "Материалы каталога"}</span><strong>8</strong></div><div className="admin-stat"><span>{isKk ? kkAdmin.stats[2] : "Правовые сценарии"}</span><strong>5</strong></div><div className="admin-stat"><span>{isKk ? kkAdmin.stats[3] : "Языки интерфейса"}</span><strong>2</strong></div></div>
        <div className="admin-grid"><section className="panel"><h2>{isKk ? kkAdmin.modules : "Модули платформы"}</h2>{(isKk ? kkAdmin.items : ["Главная страница","Правовые направления","Сценарии помощника","Библиотека документов","База знаний","Частые вопросы","Настройки языка","Пользователи и роли"]).map((item) => <div className="admin-row" key={item}><span>{item}</span><span className="status-pill">{isKk ? kkAdmin.demo : "Макет"}</span></div>)}</section><section className="panel"><h2>{isKk ? kkAdmin.connect : "Что необходимо подключить"}</h2><ul className="check-list">{(isKk ? kkAdmin.tasks : ["База данных и резервное копирование","Авторизация и роли администратора","Журнал административных действий","Проверка и публикация правовых материалов","Защищённая работа с документами"]).map((item) => <li key={item}>{item}</li>)}</ul></section></div>
      </main>
    </div>;
  }

  return (
    <div className="app-shell">
      <div className="topline"><span>{isKk ? kkUi.topLine : "Семейное право Республики Казахстан"}</span><span>{isKk ? kkUi.topMeta : "Информация • Сценарии • Документы"}</span></div>
      <header className="site-header">
        <a className="brand" href="#home" onClick={() => setActiveNav("home")}><span className="brand-mark">⚖</span><span>Право <b>Семьи</b><small>{isKk ? kkUi.brandTag : "ПРАВОВАЯ ПЛАТФОРМА РК"}</small></span></a>
        <button className="mobile-menu-btn" type="button" aria-label={isKk ? (mobileMenu ? kkUi.menuClose : kkUi.menuOpen) : (mobileMenu ? "Закрыть меню" : "Открыть меню")} aria-expanded={mobileMenu} aria-controls="primary-navigation" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
        <nav id="primary-navigation" className={mobileMenu ? "nav-open" : ""} aria-label={isKk ? kkUi.navLabel : "Основная навигация"}>
          {navLabels.map((label, index) => <button key={label} className={activeNav === ["home","assistant","documents","about"][index] ? "nav-link active" : "nav-link"} onClick={() => goTo(["home","assistant","documents","about"][index])}>{isKk ? ["Басты бет","Құқықтық көмекші","Құжаттар","Жоба туралы"][index] : label}</button>)}
        </nav>
        <div className="language-switch" role="group" aria-label={isKk ? kkUi.languageGroup : "Выбор языка сайта"}>
          <button type="button" className={language === "ru" ? "language-button active" : "language-button"} aria-pressed={language === "ru"} lang="ru" onClick={() => changeLanguage("ru")}>Русский</button>
          <button type="button" className={language === "kk" ? "language-button active" : "language-button"} aria-pressed={language === "kk"} lang="kk" onClick={() => changeLanguage("kk")}>Қазақша</button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="hero-kicker"><span></span>{isKk ? "ҚАЗАҚСТАН РЕСПУБЛИКАСЫНЫҢ ОТБАСЫ ҚҰҚЫҒЫ" : "СЕМЕЙНОЕ ПРАВО РЕСПУБЛИКИ КАЗАХСТАН"}</div>
            <h1>{isKk ? "Отбасы құқығы — түсінікті тілмен" : <>Право семьи — <em>понятным</em> языком</>}</h1>
            <p className="hero-lead">{isKk ? "Отбасылық құқықтық мәселелерді түсініңіз, ықтимал әрекеттерді салыстырыңыз және маңызды шешімдерге дайындалыңыз." : "Разбирайтесь в семейных правоотношениях, сравнивайте возможные действия и готовьтесь к юридически значимым решениям."}</p>
            <div className="hero-actions"><button className="btn btn-primary" onClick={() => goTo("assistant")}>{isKk ? "Жағдайды талдау" : "Разобрать ситуацию"} <span>↗</span></button><button className="btn btn-text" onClick={() => goTo("directions")}>{isKk ? "Бағыттарды қарау" : "Изучить направления"} <span>→</span></button></div>
            <div className="hero-trust"><span>{isKk ? kkUi.trust1 : "✓ Источники указаны в правовых картах"}</span><span>{isKk ? kkUi.trust2 : "✓ Нейтральное объяснение"}</span><span>{isKk ? "✓ Орысша / Қазақша" : "✓ Русский / Қазақша"}</span></div>
          </div>
          <div className="hero-visual"><div className="visual-orbit orbit-one"></div><div className="visual-orbit orbit-two"></div><div className="visual-card"><div className="visual-symbol">§</div><div className="visual-line long"></div><div className="visual-line"></div><div className="visual-line short"></div><div className="visual-bottom"><span>{isKk ? "ОТБАСЫ ҚҰҚЫҒЫ" : "FAMILY LAW"}</span><span>№ 01</span></div></div><div className="floating-note"><span>✦</span><div><b>{isKk ? "Құқықтық айқындық" : "Правовая ясность"}</b><small>{isKk ? "Түсінуден басталады" : "Начинается с понимания"}</small></div></div><div className="visual-caption">{isKk ? "ЗАҢ • ҚҰҚЫҚ • ОТБАСЫ" : "ЗАКОН • ПРАВА • СЕМЬЯ"}</div></div>
        </section>

        <section className="quick-strip"><div><strong>01</strong><span>{isKk ? kkUi.quick[0] : "Понятная информация"}</span></div><div><strong>02</strong><span>{isKk ? kkUi.quick[1] : "Сценарии действий"}</span></div><div><strong>03</strong><span>{isKk ? kkUi.quick[2] : "Документы и инструкции"}</span></div><div><strong>04</strong><span>{isKk ? kkUi.quick[3] : "Правовая грамотность"}</span></div></section>

        <section className="section" id="directions"><div className="section-heading"><div><p className="eyebrow">{isKk ? "01 / БАҒЫТТАР" : "01 / НАПРАВЛЕНИЯ"}</p><h2>{isKk ? kkUi.directions : "Основные направления семейного права"}</h2></div><p className="section-intro">{isKk ? kkUi.directionIntro : "Выберите интересующую тему — платформа поможет сориентироваться в правовых вопросах и дальнейших шагах."}</p></div>
          <div className="topic-grid">{visibleTopics.map((topic, index) => <button className="topic-card" key={topic.id} onClick={() => chooseTopic(topic.id)}><span className="topic-number">0{index + 1}</span><span className="topic-icon">{topic.icon}</span><h3>{topic.title}</h3><p>{topic.description}</p><span className="card-arrow">↗</span></button>)}</div>
        </section>

        <section className="assistant-section legal-assistant-section" id="assistant">
          <LegalAssistant language={language} onOpenDocuments={() => goTo("documents")} />
        </section>

        <section className="section documents-section" id="documents"><div className="section-heading"><div><p className="eyebrow">{isKk ? "03 / КІТАПХАНА" : "03 / БИБЛИОТЕКА"}</p><h2>{isKk ? kkUi.library : "Документы и правовые карты"}</h2></div><p className="section-intro">{isKk ? kkUi.libraryIntro : "Структурированная библиотека документов для подготовки к юридически значимым действиям."}</p></div>
          <div className="document-tools"><div className="search-box"><span>⌕</span><input aria-label={isKk ? kkUi.search : "Поиск документов"} placeholder={isKk ? kkUi.searchPlaceholder : "Найти документ или тему..."} value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="category-filters">{categoryPairs.map((item) => <button key={item.ru} className={category === item.ru ? "filter-chip selected" : "filter-chip"} onClick={() => setCategory(item.ru)}>{isKk ? item.kk : item.ru}</button>)}</div></div>
          <div className="document-grid">{filteredDocuments.map((doc) => <article className="document-card" key={doc.title}><div className="document-card-top"><span className="file-icon">▤</span><span className="status-pill">{doc.status}</span></div><small>{doc.category.toUpperCase()}</small><h3>{doc.title}</h3><p>{doc.description}</p><button onClick={() => { if (documentDefinitions.some((item) => item.id === doc.id)) { setSelectedDocumentId(doc.id); setNotice(""); } else { setNotice(isKk ? "Бұл құжатқа қойылатын талаптардың жеке құқықтық картасы әлі әзірленіп жатыр." : "Для документа «" + doc.title + "» ещё формируется отдельная правовая карта требований."); } }}>{isKk ? (documentTemplates.some((item) => item.id === doc.id) ? "Үлгіні ашу" : kkUi.open) : (documentTemplates.some((item) => item.id === doc.id) ? "Открыть образец" : "Открыть требования")} <span>→</span></button></article>)}</div>
          {selectedDocument && selectedTemplate && <DocumentTemplatePanel template={selectedTemplate} isKk={isKk} onClose={() => setSelectedDocumentId(null)} />}
          {selectedDocument && !selectedTemplate && <div className="inline-notice" role="status">{isKk ? "Бұл құжаттың үлгісі әзірге дайын емес." : "Образец этого документа ещё не подготовлен."}</div>}
          {filteredDocuments.length === 0 && <div className="empty-state">{isKk ? kkUi.empty : "По вашему запросу документы не найдены. Попробуйте изменить поиск или категорию."}</div>}
          {notice && <div className="inline-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label={isKk ? kkUi.noticeClose : "Закрыть"}>×</button></div>}
        </section>

        <section className="knowledge-section" id="knowledge"><div className="section"><div className="section-heading"><div><p className="eyebrow">{isKk ? "04 / БІЛІМ БАЗАСЫ" : "04 / БАЗА ЗНАНИЙ"}</p><h2>{isKk ? kkUi.knowledge : "Разобраться в своих правах"}</h2></div><p className="section-intro">{isKk ? kkUi.knowledgeIntro : "Ключевые вопросы семейного права — простым языком и с опорой на законодательство."}</p></div><div className="knowledge-layout"><div className="knowledge-feature"><span className="feature-mark">§</span><p className="eyebrow">{isKk ? "ПЛАТФОРМАНЫҢ ЖҰМЫС ҚАҒИДАТЫ" : "ПРИНЦИП РАБОТЫ ПЛАТФОРМЫ"}</p><h3>{isKk ? kkUi.featureTitle : "Не просто ответ, а понимание правовых последствий"}</h3><p>{isKk ? kkUi.featureText : "Мы стремимся показывать правовую основу, возможные позиции сторон и обстоятельства, от которых зависит результат."}</p><button className="btn btn-outline" onClick={() => goTo("about")}>{isKk ? kkUi.principlesButton : "О принципах проекта"} →</button></div><div className="faq-list">{faqs.map((faq, index) => <div className={faqOpen === index ? "faq-item open" : "faq-item"} key={faq.q}><button type="button" aria-expanded={faqOpen === index} onClick={() => setFaqOpen(faqOpen === index ? null : index)}><span>{faq.q}</span><b aria-hidden="true">{faqOpen === index ? "−" : "+"}</b></button>{faqOpen === index && <p>{faq.a}</p>}</div>)}</div></div></div></section>

        <section className="about-section" id="about"><div className="about-inner"><div><p className="eyebrow">{isKk ? "05 / ЖОБА ТУРАЛЫ" : "05 / О ПРОЕКТЕ"}</p><h2>{isKk ? kkUi.aboutTitle : "Право должно быть понятным и доступным"}</h2></div><div><p>{isKk ? kkUi.about1 : "«Право Семьи» — проект семейно-правовой информационной платформы Республики Казахстан. Его задача — помочь человеку разобраться в правовых вопросах, увидеть возможные варианты действий и подготовиться к взаимодействию с государственными органами или судом."}</p><p>{isKk ? kkUi.about2 : "Платформа будет развиваться на основе точности правовой информации, нейтральности и уважения к интересам всех участников семейных правоотношений, прежде всего детей."}</p><div className="about-principles">{(isKk ? kkUi.principles : ["Законность","Объективность","Понятность","Конфиденциальность"]).map((item) => <span key={item}>{item}</span>)}</div></div></div></section>
      </main>
      <footer className="site-footer"><div className="footer-main"><a className="brand footer-brand" href="#home"><span className="brand-mark">⚖</span><span>Право <b>Семьи</b><small>{isKk ? kkUi.brandTag : "ПРАВОВАЯ ПЛАТФОРМА РК"}</small></span></a><p>{isKk ? kkUi.footer : "Семейное право Республики Казахстан — понятно, последовательно, по существу."}</p><button className="footer-admin" onClick={() => setShowAdmin(true)}>{isKk ? kkUi.adminDemo : "Демо админ-панели"} ↗</button></div><div className="footer-bottom"><span>© 2026 Право Семьи</span><span>{isKk ? kkUi.disclaimer : "Информационная платформа. Не заменяет индивидуальную юридическую консультацию."}</span><button onClick={() => goTo("home")}>{isKk ? kkUi.top : "Наверх ↑"}</button></div></footer>
    </div>
  );
}
