import { useMemo, useState } from "react";
import { documentDefinitions, documentResearchQueue } from "./data/documentRequirements";

type Lang = "ru" | "kk";
type Topic = "divorce" | "property" | "alimony" | "child" | "marriage";
type AnswerMap = Record<string, string>;

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
    status: doc.status === "published" ? "Опубликован" : "Правовая карта: черновик",
  })),
  ...documentResearchQueue.map((doc) => ({
    id: doc.id,
    title: doc.title,
    category: doc.id.startsWith("child-") ? "Дети" : "Суд",
    description: doc.status,
    status: "Исследование",
  })),
];

const scenarioQuestions: Record<Topic, { title: string; question: string; options: string[] }[]> = {
  marriage: [
    { title: "Ваш статус", question: "Какой вопрос вы хотите прояснить?", options: ["Условия заключения брака", "Какие документы подготовить", "Брачный договор", "Имущественные последствия брака"] },
    { title: "Согласие сторон", question: "Обе стороны согласны на выбранный вариант?", options: ["Да", "Нет", "Пока не определились"] },
    { title: "Дополнительные обстоятельства", question: "Есть ли имущество или другие обстоятельства, которые важно учесть?", options: ["Есть", "Нет", "Не уверен(а)"] },
  ],
  divorce: [
    { title: "Обстоятельства", question: "Есть ли общие несовершеннолетние дети?", options: ["Да", "Нет", "Нужно уточнить юридический статус"] },
    { title: "Позиция сторон", question: "Есть ли взаимное согласие на расторжение брака?", options: ["Да", "Нет", "Согласие отсутствует / неизвестно"] },
    { title: "Спорные вопросы", question: "Есть ли спор об имуществе, алиментах или детях?", options: ["Да", "Нет", "Пока не определились"] },
  ],
  property: [
    { title: "Объект спора", question: "Какое имущество является предметом вопроса?", options: ["Недвижимость", "Автомобиль", "Деньги / вклады", "Несколько видов имущества", "Другое"] },
    { title: "Основание приобретения", question: "Когда и на каком основании приобретено имущество?", options: ["Во время брака", "До брака", "Получено в дар / по наследству", "Имеются разные основания", "Не знаю"] },
    { title: "Позиция сторон", question: "Есть ли согласие относительно раздела?", options: ["Да", "Нет", "Частичное согласие"] },
  ],
  alimony: [
    { title: "Получатель содержания", question: "Кого касается вопрос о содержании?", options: ["Несовершеннолетнего ребёнка", "Совершеннолетнего ребёнка", "Супруга / бывшего супруга", "Другого члена семьи"] },
    { title: "Текущая ситуация", question: "Есть ли действующее соглашение или судебный акт?", options: ["Да", "Нет", "Не знаю"] },
    { title: "Цель", question: "Что требуется выяснить?", options: ["Заключить соглашение", "Определить порядок взыскания", "Изменить существующий порядок", "Разобраться с задолженностью"] },
  ],
  child: [
    { title: "Предмет вопроса", question: "Какой вопрос о ребёнке необходимо рассмотреть?", options: ["Место жительства", "Порядок общения", "Участие в воспитании", "Защита прав ребёнка"] },
    { title: "Позиция родителей", question: "Есть ли согласие между родителями?", options: ["Да", "Нет", "Частичное согласие"] },
    { title: "Текущий порядок", question: "Есть ли соглашение или решение суда по этому вопросу?", options: ["Да", "Нет", "Не знаю"] },
  ],
};

const scenarioGuidance: Record<Topic, { heading: string; checks: string[]; caution: string }> = {
  marriage: {
    heading: "Что проверить перед регистрацией",
    checks: [
      "Возраст, добровольность намерения и отсутствие обстоятельств, препятствующих регистрации брака.",
      "Перечень документов и порядок обращения в регистрирующий орган.",
      "Нужен ли брачный договор и какие вопросы стороны хотят урегулировать заранее.",
      "Есть ли имущественные или иные обстоятельства, которые требуют отдельной правовой оценки.",
    ],
    caution: "Опросник не подтверждает наличие или отсутствие законных препятствий к регистрации. Это проверяется по документам и действующим нормам.",
  },
  divorce: {
    heading: "Что важно установить для выбора процедуры",
    checks: [
      "Есть ли общие несовершеннолетние дети и какие вопросы, связанные с ними, остаются спорными.",
      "Совпадают ли позиции супругов относительно расторжения брака.",
      "Существует ли спор о разделе имущества, содержании членов семьи или иных требованиях.",
      "Какие документы подтверждают регистрацию брака и существенные обстоятельства ситуации.",
    ],
    caution: "Наличие детей, спора или несогласия может влиять на порядок расторжения брака. Конкретный маршрут нужно определять после проверки обстоятельств и действующей редакции закона.",
  },
  property: {
    heading: "Какие сведения собрать по имуществу",
    checks: [
      "Когда, кем и на каком основании приобретён каждый объект имущества.",
      "Правоустанавливающие документы, договоры, платёжные документы и сведения о регистрации права.",
      "Есть ли основания считать имущество личным, общим или приобретённым на смешанные средства.",
      "Имеются ли кредиты, залоги, аресты, права третьих лиц или соглашения между супругами.",
    ],
    caution: "Сам факт приобретения имущества во время брака не позволяет без проверки всех обстоятельств окончательно определить правовой режим каждого объекта.",
  },
  alimony: {
    heading: "Какие обстоятельства имеют значение",
    checks: [
      "Кто является получателем содержания и на каком юридическом основании заявляется требование.",
      "Есть ли действующее соглашение, судебный акт или исполнительное производство.",
      "Какие платежи уже производились и подтверждены ли они документально.",
      "Какие сведения о доходах, расходах и потребностях получателя могут иметь значение.",
    ],
    caution: "Размер, способ и порядок взыскания зависят от категории получателя, правового основания и конкретных обстоятельств. Опросник не рассчитывает сумму алиментов.",
  },
  child: {
    heading: "Что подготовить для оценки интересов ребёнка",
    checks: [
      "Где ребёнок фактически проживает и кто ежедневно обеспечивает уход и воспитание.",
      "Какие варианты предлагают родители и насколько они практически осуществимы.",
      "Какие условия проживания, обучения, здоровья и привычного окружения ребёнка необходимо учитывать.",
      "Какие соглашения, решения суда и иные документы уже регулируют отношения родителей.",
    ],
    caution: "В вопросах о ребёнке первостепенное значение имеют его права и интересы. Нельзя заранее гарантировать, какое решение примет уполномоченный орган или суд.",
  },
};

const topicsKk: { id: Topic; icon: string; title: string; description: string }[] = [
  { id: "marriage", icon: "💍", title: "Некеге тұру", description: "Некені тіркеу талаптары, қажетті құжаттар, неке шарты және мүліктік мәселелер." },
  { id: "divorce", icon: "⚖️", title: "Некені бұзу", description: "Некені бұзу жолдары, іс-қимыл тәртібі және рәсімге дайындық." },
  { id: "property", icon: "🏠", title: "Мүлікті бөлу", description: "Ортақ және жеке мүлік, келісім және сот дауы." },
  { id: "alimony", icon: "🤝", title: "Алимент", description: "Балалар мен отбасының басқа мүшелерін асырау, келісім жасау және алимент өндіріп алу." },
  { id: "child", icon: "🧒", title: "Баланың құқықтары", description: "Баланың тұрғылықты жері, ата-анасымен араласуы және оның мүдделерін қорғау." },
];

const scenarioQuestionsKk: Record<Topic, { title: string; question: string; options: string[] }[]> = {
  marriage: [
    { title: "Сіздің жағдайыңыз", question: "Қандай мәселені нақтылағыңыз келеді?", options: ["Некеге тұру талаптары", "Қандай құжаттарды дайындау керек", "Неке шарты", "Некенің мүліктік салдары"] },
    { title: "Тараптардың келісімі", question: "Екі тарап та таңдалған нұсқамен келіседі ме?", options: ["Иә", "Жоқ", "Әзірге шешім қабылданған жоқ"] },
    { title: "Қосымша мән-жайлар", question: "Ескеруді қажет ететін мүлік немесе өзге де мән-жайлар бар ма?", options: ["Бар", "Жоқ", "Нақты білмеймін"] },
  ],
  divorce: [
    { title: "Мән-жайлар", question: "Ортақ кәмелетке толмаған балалар бар ма?", options: ["Иә", "Жоқ", "Құқықтық мәртебесін нақтылау қажет"] },
    { title: "Тараптардың ұстанымы", question: "Некені бұзуға өзара келісім бар ма?", options: ["Иә", "Жоқ", "Келісім жоқ / белгісіз"] },
    { title: "Даулы мәселелер", question: "Мүлікті бөлу, алимент немесе балаларға қатысты дау бар ма?", options: ["Иә", "Жоқ", "Әзірге шешім қабылданған жоқ"] },
  ],
  property: [
    { title: "Даудың нысанасы", question: "Мәселе қандай мүлікке қатысты?", options: ["Жылжымайтын мүлік", "Автомобиль", "Ақша / салымдар", "Мүліктің бірнеше түрі", "Басқа"] },
    { title: "Мүлікті иелену негізі", question: "Мүлік қашан және қандай негізде сатып алынды?", options: ["Неке кезінде", "Некеге дейін", "Сыйға немесе мұраға алынған", "Әртүрлі негіздер бар", "Білмеймін"] },
    { title: "Тараптардың ұстанымы", question: "Мүлікті бөлуге қатысты келісім бар ма?", options: ["Иә", "Жоқ", "Ішінара келісім бар"] },
  ],
  alimony: [
    { title: "Алушы", question: "Асырау мәселесі кімге қатысты?", options: ["Кәмелетке толмаған балаға", "Кәмелетке толған балаға", "Жұбайына / бұрынғы жұбайына", "Отбасының басқа мүшесіне"] },
    { title: "Қазіргі жағдай", question: "Қолданыстағы келісім немесе сот актісі бар ма?", options: ["Иә", "Жоқ", "Білмеймін"] },
    { title: "Мақсат", question: "Нені анықтау қажет?", options: ["Келісім жасау", "Алимент өндіріп алу тәртібін анықтау", "Қолданыстағы тәртіпті өзгерту", "Берешек мәселесін анықтау"] },
  ],
  child: [
    { title: "Мәселенің мәні", question: "Балаға қатысты қандай мәселені қарау қажет?", options: ["Тұрғылықты жері", "Араласу тәртібі", "Тәрбиесіне қатысу", "Баланың құқықтарын қорғау"] },
    { title: "Ата-аналардың ұстанымы", question: "Ата-аналар арасында келісім бар ма?", options: ["Иә", "Жоқ", "Ішінара келісім бар"] },
    { title: "Қолданыстағы тәртіп", question: "Осы мәселе бойынша келісім немесе сот шешімі бар ма?", options: ["Иә", "Жоқ", "Білмеймін"] },
  ],
};

const scenarioGuidanceKk: Record<Topic, { heading: string; checks: string[]; caution: string }> = {
  marriage: {
    heading: "Некені тіркеу алдында нені тексеру керек",
    checks: [
      "Некеге тұру жасы, ерікті келісім және некені тіркеуге кедергі келтіретін мән-жайлардың бар-жоғы.",
      "Қажетті құжаттар тізбесі және тіркеуші органға жүгіну тәртібі.",
      "Неке шартының қажеттілігі және тараптар алдын ала реттегісі келетін мәселелер.",
      "Жеке құқықтық бағалауды қажет ететін мүліктік немесе өзге де мән-жайлар.",
    ],
    caution: "Сауалнама некені тіркеуге заңды кедергілердің бар-жоғын анықтамайды. Бұл құжаттар мен қолданыстағы заңнама негізінде тексеріледі.",
  },
  divorce: {
    heading: "Рәсімді таңдау үшін нені анықтау маңызды",
    checks: [
      "Ортақ кәмелетке толмаған балалардың бар-жоғы және оларға қатысты даулы мәселелер.",
      "Ерлі-зайыптылардың некені бұзу жөніндегі ұстанымдарының сәйкес келуі.",
      "Мүлікті бөлу, отбасы мүшелерін асырау немесе өзге де талаптар бойынша дау бар-жоғы.",
      "Некенің тіркелгенін және істің маңызды мән-жайларын растайтын құжаттар.",
    ],
    caution: "Балалардың болуы, даудың немесе келіспеушіліктің болуы некені бұзу тәртібіне әсер етуі мүмкін. Нақты рәсім мән-жайлар мен заңның қолданыстағы редакциясы тексерілгеннен кейін айқындалады.",
  },
  property: {
    heading: "Мүлікке қатысты қандай мәліметтерді жинау керек",
    checks: [
      "Әрбір мүліктің қашан, кімнің және қандай негізде сатып алынғаны.",
      "Құқық белгілейтін құжаттар, шарттар, төлем құжаттары және құқықты тіркеу туралы мәліметтер.",
      "Мүлікті жеке, ортақ немесе аралас қаражат есебінен сатып алынған деп тануға негіздердің бар-жоғы.",
      "Кредиттердің, кепілдердің, тыйым салулардың, үшінші тұлғалардың құқықтарының немесе ерлі-зайыптылар келісімдерінің болуы.",
    ],
    caution: "Мүліктің неке кезінде сатып алынуының өзі барлық мән-жай тексерілмей, оның құқықтық режимін түпкілікті анықтауға жеткіліксіз.",
  },
  alimony: {
    heading: "Қандай мән-жайлар маңызды",
    checks: [
      "Асырауды алушының кім екені және талаптың қандай құқықтық негізге сүйенетіні.",
      "Қолданыстағы келісімнің, сот актісінің немесе атқарушылық іс жүргізудің бар-жоғы.",
      "Бұрын жасалған төлемдер және оларды құжатпен растау мүмкіндігі.",
      "Табыстар, шығыстар және алушының қажеттіліктері туралы маңызды мәліметтер.",
    ],
    caution: "Алименттің мөлшері, тәсілі мен өндіріп алу тәртібі алушының санатына, құқықтық негізге және нақты мән-жайларға байланысты. Сауалнама алимент сомасын есептемейді.",
  },
  child: {
    heading: "Баланың мүдделерін бағалау үшін нені дайындау керек",
    checks: [
      "Баланың нақты қайда тұратыны және күнделікті күтімі мен тәрбиесін кім қамтамасыз ететіні.",
      "Ата-аналар ұсынған нұсқалар және олардың іс жүзінде орындалу мүмкіндігі.",
      "Баланың тұрмыс, оқу, денсаулық жағдайы мен үйреншікті ортасына қатысты ескерілуге тиіс жағдайлар.",
      "Ата-аналардың қатынастарын реттейтін келісімдер, сот шешімдері және өзге құжаттар.",
    ],
    caution: "Балаға қатысты мәселелерде оның құқықтары мен мүдделері басым мәнге ие. Уәкілетті органның немесе соттың қандай шешім қабылдайтынына алдын ала кепілдік беруге болмайды.",
  },
};


  
const navLabels = ["Главная", "Направления", "Правовой помощник", "Документы", "База знаний"];
const categories = ["Все", "Брак", "Развод", "Имущество", "Алименты", "Дети", "Суд"];

export default function App() {
  const [language, setLanguage] = useState<Lang>("ru");
  const [activeNav, setActiveNav] = useState("home");
  const [selectedTopic, setSelectedTopic] = useState<Topic>("divorce");
  const [scenarioStep, setScenarioStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const isKk = language === "kk";
  const filteredDocuments = useMemo(() => documents.filter((doc) =>
    (category === "Все" || doc.category === category) &&
    (doc.title + " " + doc.description).toLowerCase().includes(search.toLowerCase())
  ), [category, search]);

  const visibleTopics = isKk ? topicsKk : topics;
  const questions = (isKk ? scenarioQuestionsKk : scenarioQuestions)[selectedTopic];
  const topicName = visibleTopics.find((topic) => topic.id === selectedTopic)?.title ?? (isKk ? "Құқықтық мәселе" : "Правовой вопрос");
  const selectedDocument = documentDefinitions.find((doc) => doc.id === selectedDocumentId) ?? null;

  function goTo(id: string) {
    setActiveNav(id);
    setMobileMenu(false);
    setShowAdmin(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseTopic(id: Topic) {
    setSelectedTopic(id);
    setScenarioStep(0);
    setAnswers({});
    goTo("assistant");
  }

  function answerQuestion(value: string) {
    setAnswers((current) => ({ ...current, [String(scenarioStep)]: value }));
  }

  function resetScenario() {
    setScenarioStep(0);
    setAnswers({});
  }

  const faqs = [
    { q: "Можно ли получить гарантированный прогноз решения суда?", a: "Нет. Судебный результат зависит от обстоятельств дела, доказательств, применимых норм и оценки суда. Платформа сможет объяснять возможные варианты и риски, но не обещать исход." },
    { q: "Нужно ли регистрироваться, чтобы изучить правовой сценарий?", a: "В первой версии базовое знакомство со сценариями задумано без обязательной регистрации. Сохранение истории и персональные функции появятся только после внедрения защищённой авторизации." },
    { q: "Откуда берётся правовая информация?", a: "Основным ориентиром будут действующие нормативные правовые акты Республики Казахстан и официальные источники, прежде всего ИПС «Әділет». Для каждого материала важны редакция и дата актуальности." },
    { q: "Можно ли загрузить свой документ на проверку?", a: "Это предусмотрено концепцией проекта, но функция пока не подключена. До её запуска необходимо реализовать защищённую обработку файлов и правила конфиденциальности." },
  ];

  if (showAdmin) {
    return <div className="admin-shell">
      <header className="admin-top"><a className="brand" href="#" onClick={(e) => { e.preventDefault(); setShowAdmin(false); }}>⚖️ Право Семьи</a><span className="admin-tag">Предварительный макет админ-панели</span><button className="btn btn-outline" onClick={() => setShowAdmin(false)}>← На сайт</button></header>
      <main className="admin-main"><p className="eyebrow">УПРАВЛЕНИЕ ПЛАТФОРМОЙ</p><h1>Панель администратора</h1><p className="muted">Визуальная основа будущей панели. Управление пока демонстрационное: подключение ролей, базы данных и серверных проверок ещё предстоит.</p>
        <div className="admin-stats"><div className="admin-stat"><span>Разделы сайта</span><strong>5</strong></div><div className="admin-stat"><span>Материалы каталога</span><strong>8</strong></div><div className="admin-stat"><span>Правовые сценарии</span><strong>5</strong></div><div className="admin-stat"><span>Языки интерфейса</span><strong>2</strong></div></div>
        <div className="admin-grid"><section className="panel"><h2>Модули платформы</h2>{["Главная страница","Правовые направления","Сценарии помощника","Библиотека документов","База знаний","Частые вопросы","Настройки языка","Пользователи и роли"].map((item) => <div className="admin-row" key={item}><span>{item}</span><span className="status-pill">Макет</span></div>)}</section><section className="panel"><h2>Что необходимо подключить</h2><ul className="check-list"><li>База данных и резервное копирование</li><li>Авторизация и роли администратора</li><li>Журнал административных действий</li><li>Проверка и публикация правовых материалов</li><li>Защищённая работа с документами</li></ul></section></div>
      </main>
    </div>;
  }

  return (
    <div className="app-shell">
      <div className="topline"><span>Семейное право Республики Казахстан</span><span>Информация • Сценарии • Документы</span></div>
      <header className="site-header">
        <a className="brand" href="#home" onClick={() => setActiveNav("home")}><span className="brand-mark">⚖</span><span>Право <b>Семьи</b><small>ПРАВОВАЯ ПЛАТФОРМА РК</small></span></a>
        <button className="mobile-menu-btn" aria-label="Открыть меню" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
        <nav className={mobileMenu ? "nav-open" : ""} aria-label="Основная навигация">
          {navLabels.map((label, index) => <button key={label} className={activeNav === ["home","directions","assistant","documents","knowledge"][index] ? "nav-link active" : "nav-link"} onClick={() => goTo(["home","directions","assistant","documents","knowledge"][index])}>{isKk ? ["Басты бет","Бағыттар","Құқықтық көмекші","Құжаттар","Білім базасы"][index] : label}</button>)}
        </nav>
        <div className="language-switch" role="group" aria-label="Выбор языка сайта">
          <button type="button" className={language === "ru" ? "language-button active" : "language-button"} aria-pressed={language === "ru"} lang="ru" onClick={() => setLanguage("ru")}>Русский</button>
          <button type="button" className={language === "kk" ? "language-button active" : "language-button"} aria-pressed={language === "kk"} lang="kk" onClick={() => setLanguage("kk")}>Қазақша</button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="hero-kicker"><span></span>{isKk ? "ҚАЗАҚСТАН РЕСПУБЛИКАСЫНЫҢ ОТБАСЫ ҚҰҚЫҒЫ" : "СЕМЕЙНОЕ ПРАВО РЕСПУБЛИКИ КАЗАХСТАН"}</div>
            <h1>{isKk ? "Отбасы құқығы — түсінікті тілмен" : <>Право семьи — <em>понятным</em> языком</>}</h1>
            <p className="hero-lead">{isKk ? "Отбасылық құқықтық мәселелерді түсініңіз, ықтимал әрекеттерді салыстырыңыз және маңызды шешімдерге дайындалыңыз." : "Разбирайтесь в семейных правоотношениях, сравнивайте возможные действия и готовьтесь к юридически значимым решениям."}</p>
            <div className="hero-actions"><button className="btn btn-primary" onClick={() => goTo("assistant")}>{isKk ? "Жағдайды талдау" : "Разобрать ситуацию"} <span>↗</span></button><button className="btn btn-text" onClick={() => goTo("directions")}>{isKk ? "Бағыттарды қарау" : "Изучить направления"} <span>→</span></button></div>
            <div className="hero-trust"><span>✓ Источники указаны в правовых картах</span><span>✓ Нейтральное объяснение</span><span>✓ Русский / Қазақша</span></div>
          </div>
          <div className="hero-visual"><div className="visual-orbit orbit-one"></div><div className="visual-orbit orbit-two"></div><div className="visual-card"><div className="visual-symbol">§</div><div className="visual-line long"></div><div className="visual-line"></div><div className="visual-line short"></div><div className="visual-bottom"><span>FAMILY LAW</span><span>№ 01</span></div></div><div className="floating-note"><span>✦</span><div><b>Правовая ясность</b><small>Начинается с понимания</small></div></div><div className="visual-caption">ЗАКОН • ПРАВА • СЕМЬЯ</div></div>
        </section>

        <section className="quick-strip"><div><strong>01</strong><span>Понятная информация</span></div><div><strong>02</strong><span>Сценарии действий</span></div><div><strong>03</strong><span>Документы и инструкции</span></div><div><strong>04</strong><span>Правовая грамотность</span></div></section>

        <section className="section" id="directions"><div className="section-heading"><div><p className="eyebrow">01 / НАПРАВЛЕНИЯ</p><h2>{isKk ? "Отбасы құқығының негізгі салалары" : "Основные направления семейного права"}</h2></div><p className="section-intro">Выберите интересующую тему — платформа поможет сориентироваться в правовых вопросах и дальнейших шагах.</p></div>
          <div className="topic-grid">{visibleTopics.map((topic, index) => <button className="topic-card" key={topic.id} onClick={() => chooseTopic(topic.id)}><span className="topic-number">0{index + 1}</span><span className="topic-icon">{topic.icon}</span><h3>{topic.title}</h3><p>{topic.description}</p><span className="card-arrow">↗</span></button>)}</div>
        </section>

        <section className="assistant-section" id="assistant"><div className="assistant-copy"><p className="eyebrow">02 / ИНФОРМАЦИОННЫЙ СЦЕНАРИЙ</p><h2>Ситуация → значимые обстоятельства → вопросы для проверки</h2><p>Ответьте на несколько вопросов. Опросник помогает зафиксировать исходные обстоятельства и определить, какие правовые вопросы следует проверить; он пока не применяет нормы автоматически и не оценивает перспективы дела.</p><div className="assistant-points"><div><span>01</span><p><b>Уточнение ситуации</b><small>Выделяем юридически значимые обстоятельства.</small></p></div><div><span>02</span><p><b>Правовая основа</b><small>Определяем нормы, которые нужно проверить.</small></p></div><div><span>03</span><p><b>Сравнение вариантов</b><small>Рассматриваем последствия, риски и следующие шаги.</small></p></div></div><p className="legal-note">Сценарий носит исключительно информационный характер: это опросник, а не автоматический правовой анализ. Он не проверяет документы, не определяет правовую позицию и не заменяет индивидуальную юридическую консультацию.</p></div>
          <div className="scenario-card"><div className="scenario-card-head"><div><span className="live-dot"></span> ИНТЕРАКТИВНЫЙ СЦЕНАРИЙ</div><span>{scenarioStep < 3 ? `ШАГ ${scenarioStep + 1} / 3` : "РЕЗЮМЕ"}</span></div><div className="progress-track"><span style={{ width: ((scenarioStep + 1) / 3 * 100) + "%" }}></span></div>
            <label className="field-label" htmlFor="scenario-topic">Выберите правовую тему</label><select id="scenario-topic" value={selectedTopic} onChange={(e) => { setSelectedTopic(e.target.value as Topic); setScenarioStep(0); setAnswers({}); }}>{visibleTopics.map((topic) => <option value={topic.id} key={topic.id}>{topic.title}</option>)}</select>
            {scenarioStep < 3 ? <><p className="question-count">{questions[scenarioStep].title}</p><h3 className="scenario-question">{questions[scenarioStep].question}</h3><div className="answer-list">{questions[scenarioStep].options.map((option) => <button key={option} className={answers[String(scenarioStep)] === option ? "answer-option selected" : "answer-option"} onClick={() => answerQuestion(option)}><span>{option}</span><i>{answers[String(scenarioStep)] === option ? "✓" : "＋"}</i></button>)}</div><div className="scenario-controls"><button className="btn btn-outline" disabled={scenarioStep === 0} onClick={() => setScenarioStep((step) => Math.max(0, step - 1))}>Назад</button><button className="btn btn-primary" disabled={!answers[String(scenarioStep)]} onClick={() => setScenarioStep((step) => step + 1)}>Продолжить <span>→</span></button></div></> : <div className="scenario-summary"><div className="summary-icon">✓</div><p className="eyebrow">ПРЕДВАРИТЕЛЬНОЕ РЕЗЮМЕ</p><h3>{topicName}</h3><p>Вы указали следующие обстоятельства:</p><ul>{questions.map((question, index) => <li key={question.title}><b>{question.question}</b><span>{answers[String(index)]}</span></li>)}</ul><section className="scenario-guidance" aria-labelledby="scenario-guidance-title"><p className="eyebrow">СЛЕДУЮЩИЙ ЭТАП</p><h4 id="scenario-guidance-title">{(isKk ? scenarioGuidanceKk : scenarioGuidance)[selectedTopic].heading}</h4><ul>{(isKk ? scenarioGuidanceKk : scenarioGuidance)[selectedTopic].checks.map((item) => <li key={item}>{item}</li>)}</ul><p className="guidance-caution">{(isKk ? scenarioGuidanceKk : scenarioGuidance)[selectedTopic].caution}</p></section><div className="summary-warning"><b>Границы результата.</b> Это предварительная карта вопросов и документов, а не правовое заключение. Здесь не определяются применимые статьи, не рассчитываются суммы и не прогнозируется решение суда. Для этого нужно проверить факты, документы и актуальные редакции нормативных актов РК.</div><div className="scenario-summary-actions"><button className="btn btn-outline" onClick={() => setScenarioStep(2)}>Изменить ответы</button><button className="btn btn-primary" onClick={resetScenario}>Пройти заново</button></div></div>}
            <div className="scenario-foot">Ваши ответы пока не отправляются на сервер и не сохраняются после закрытия страницы.</div>
          </div>
        </section>

        <section className="section documents-section" id="documents"><div className="section-heading"><div><p className="eyebrow">03 / БИБЛИОТЕКА</p><h2>Документы и правовые карты</h2></div><p className="section-intro">Структурированная библиотека документов для подготовки к юридически значимым действиям.</p></div>
          <div className="document-tools"><div className="search-box"><span>⌕</span><input aria-label="Поиск документов" placeholder="Найти документ или тему..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="category-filters">{categories.map((item) => <button key={item} className={category === item ? "filter-chip selected" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
          <div className="document-grid">{filteredDocuments.map((doc) => <article className="document-card" key={doc.title}><div className="document-card-top"><span className="file-icon">▤</span><span className="status-pill">{doc.status}</span></div><small>{doc.category.toUpperCase()}</small><h3>{doc.title}</h3><p>{doc.description}</p><button onClick={() => { if (documentDefinitions.some((item) => item.id === doc.id)) { setSelectedDocumentId(doc.id); setNotice(""); } else { setNotice("Для документа «" + doc.title + "» ещё формируется отдельная правовая карта требований."); } }}>Открыть требования <span>→</span></button></article>)}</div>
          {selectedDocument && <section className="doc-detail" aria-live="polite">
            <div className="doc-detail-head"><div><p className="eyebrow">ПРАВОВАЯ КАРТА / ЧЕРНОВИК</p><h3>{selectedDocument.title}</h3><p>{selectedDocument.purpose}</p></div><button className="btn btn-outline" onClick={() => setSelectedDocumentId(null)}>Закрыть</button></div>
            <div className="doc-detail-meta"><span className="status-pill">Не является готовым шаблоном</span><span>Нормативные источники приведены для самостоятельной проверки</span></div>
            <div className="doc-detail-grid">
              <div><h4>Правовые источники</h4><ul>{selectedDocument.legalSources.map((source) => <li key={source.article + source.title}><b>{source.act}, ст. {source.article}</b><span>{source.title}</span><a href={source.url} target="_blank" rel="noreferrer">Открыть в ИПС «Әділет» ↗</a></li>)}</ul></div>
              <div><h4>Содержание документа</h4><ul>{selectedDocument.contentRequirements.map((item) => <li key={item.id}><b>{item.label}</b><span>{item.explanation}</span><small>{item.kind === "mandatory" ? "Обязательно" : item.kind === "conditional" ? "При определённых условиях" : "Рекомендация"}</small></li>)}</ul></div>
              <div><h4>Форма и удостоверение</h4><ul>{selectedDocument.formRequirements.map((item) => <li key={item.id}><b>{item.label}</b><span>{item.explanation}</span></li>)}</ul></div>
              <div><h4>Приложения и подтверждения</h4><ul>{selectedDocument.attachmentRequirements.map((item) => <li key={item.id}><b>{item.label}</b><span>{item.explanation}</span></li>)}</ul></div>
              <div><h4>Процессуальные условия</h4><ul>{selectedDocument.processNotes.map((item) => <li key={item.id}><b>{item.label}</b><span>{item.explanation}</span></li>)}</ul></div>
              <div><h4>Ограничения и риски</h4><ul>{selectedDocument.limitations.map((item) => <li key={item}><span>{item}</span></li>)}</ul></div>
            </div>
            <p className="doc-detail-warning">Эта карта — внутренняя проектная основа и ещё не прошла полную юридическую экспертизу. Система пока не формирует документ и не подтверждает его соответствие всем требованиям конкретного дела.</p>
          </section>}
          {filteredDocuments.length === 0 && <div className="empty-state">По вашему запросу документы не найдены. Попробуйте изменить поиск или категорию.</div>}
          {notice && <div className="inline-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Закрыть">×</button></div>}
        </section>

        <section className="knowledge-section" id="knowledge"><div className="section"><div className="section-heading"><div><p className="eyebrow">04 / БАЗА ЗНАНИЙ</p><h2>Разобраться в своих правах</h2></div><p className="section-intro">Ключевые вопросы семейного права — простым языком и с опорой на законодательство.</p></div><div className="knowledge-layout"><div className="knowledge-feature"><span className="feature-mark">§</span><p className="eyebrow">ПРИНЦИП РАБОТЫ ПЛАТФОРМЫ</p><h3>Не просто ответ, а понимание правовых последствий</h3><p>Мы стремимся показывать правовую основу, возможные позиции сторон и обстоятельства, от которых зависит результат.</p><button className="btn btn-outline" onClick={() => goTo("about")}>О принципах проекта →</button></div><div className="faq-list">{faqs.map((faq, index) => <div className={faqOpen === index ? "faq-item open" : "faq-item"} key={faq.q}><button onClick={() => setFaqOpen(faqOpen === index ? null : index)}><span>{faq.q}</span><b>{faqOpen === index ? "−" : "+"}</b></button>{faqOpen === index && <p>{faq.a}</p>}</div>)}</div></div></div></section>

        <section className="about-section" id="about"><div className="about-inner"><div><p className="eyebrow">05 / О ПРОЕКТЕ</p><h2>Право должно быть понятным и доступным</h2></div><div><p>«Право Семьи» — проект семейно-правовой информационной платформы Республики Казахстан. Его задача — помочь человеку разобраться в правовых вопросах, увидеть возможные варианты действий и подготовиться к взаимодействию с государственными органами или судом.</p><p>Платформа будет развиваться на основе точности правовой информации, нейтральности и уважения к интересам всех участников семейных правоотношений, прежде всего детей.</p><div className="about-principles"><span>Законность</span><span>Объективность</span><span>Понятность</span><span>Конфиденциальность</span></div></div></div></section>
      </main>
      <footer className="site-footer"><div className="footer-main"><a className="brand footer-brand" href="#home"><span className="brand-mark">⚖</span><span>Право <b>Семьи</b><small>ПРАВОВАЯ ПЛАТФОРМА РК</small></span></a><p>Семейное право Республики Казахстан — понятно, последовательно, по существу.</p><button className="footer-admin" onClick={() => setShowAdmin(true)}>Демо админ-панели ↗</button></div><div className="footer-bottom"><span>© 2026 Право Семьи</span><span>Информационная платформа. Не является юридической консультацией.</span><button onClick={() => goTo("home")}>Наверх ↑</button></div></footer>
    </div>
  );
}
