import { useMemo, useState } from "react";

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
  { title: "Заявление о регистрации брака", category: "Брак", description: "Справочная структура заявления и перечень вопросов перед обращением.", status: "В разработке" },
  { title: "Брачный договор", category: "Брак", description: "Структура условий об имущественных правах и обязанностях супругов.", status: "В разработке" },
  { title: "Соглашение о разделе имущества", category: "Имущество", description: "Перечень условий, которые следует согласовать и проверить.", status: "В разработке" },
  { title: "Исковое заявление о расторжении брака", category: "Развод", description: "Состав сведений и приложений для подготовки проекта иска.", status: "В разработке" },
  { title: "Заявление о взыскании алиментов", category: "Алименты", description: "Общие сведения о требованиях и документах, которые могут понадобиться.", status: "В разработке" },
  { title: "Соглашение о порядке общения с ребёнком", category: "Дети", description: "Вопросы графика общения и учёта интересов ребёнка.", status: "В разработке" },
  { title: "Заявление об определении места жительства ребёнка", category: "Дети", description: "Структура обращения и обстоятельства, имеющие значение для спора.", status: "В разработке" },
  { title: "Возражения на исковое заявление", category: "Суд", description: "Структура позиции стороны и перечень доказательств.", status: "В разработке" },
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

  const isKk = language === "kk";
  const filteredDocuments = useMemo(() => documents.filter((doc) =>
    (category === "Все" || doc.category === category) &&
    (doc.title + " " + doc.description).toLowerCase().includes(search.toLowerCase())
  ), [category, search]);

  const questions = scenarioQuestions[selectedTopic];
  const topicName = topics.find((topic) => topic.id === selectedTopic)?.title ?? "Правовой вопрос";

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
        <div className="admin-stats"><div className="admin-stat"><span>Разделы сайта</span><strong>5</strong></div><div className="admin-stat"><span>Шаблоны документов</span><strong>8</strong></div><div className="admin-stat"><span>Правовые сценарии</span><strong>5</strong></div><div className="admin-stat"><span>Языки интерфейса</span><strong>2</strong></div></div>
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
        <button className="language-button" onClick={() => setLanguage(isKk ? "ru" : "kk")}>{isKk ? "РУС" : "ҚАЗ"}</button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="hero-kicker"><span></span>{isKk ? "ҚАЗАҚСТАН РЕСПУБЛИКАСЫНЫҢ ОТБАСЫ ҚҰҚЫҒЫ" : "СЕМЕЙНОЕ ПРАВО РЕСПУБЛИКИ КАЗАХСТАН"}</div>
            <h1>{isKk ? "Отбасы құқығы — түсінікті тілмен" : <>Право семьи — <em>понятным</em> языком</>}</h1>
            <p className="hero-lead">{isKk ? "Отбасылық құқықтық мәселелерді түсініңіз, ықтимал әрекеттерді салыстырыңыз және маңызды шешімдерге дайындалыңыз." : "Разбирайтесь в семейных правоотношениях, сравнивайте возможные действия и готовьтесь к юридически значимым решениям."}</p>
            <div className="hero-actions"><button className="btn btn-primary" onClick={() => goTo("assistant")}>{isKk ? "Жағдайды талдау" : "Разобрать ситуацию"} <span>↗</span></button><button className="btn btn-text" onClick={() => goTo("directions")}>{isKk ? "Бағыттарды қарау" : "Изучить направления"} <span>→</span></button></div>
            <div className="hero-trust"><span>✓ Проверка по законодательству РК</span><span>✓ Нейтральное объяснение</span><span>✓ Русский / Қазақша</span></div>
          </div>
          <div className="hero-visual"><div className="visual-orbit orbit-one"></div><div className="visual-orbit orbit-two"></div><div className="visual-card"><div className="visual-symbol">§</div><div className="visual-line long"></div><div className="visual-line"></div><div className="visual-line short"></div><div className="visual-bottom"><span>FAMILY LAW</span><span>№ 01</span></div></div><div className="floating-note"><span>✦</span><div><b>Правовая ясность</b><small>Начинается с понимания</small></div></div><div className="visual-caption">ЗАКОН • ПРАВА • СЕМЬЯ</div></div>
        </section>

        <section className="quick-strip"><div><strong>01</strong><span>Понятная информация</span></div><div><strong>02</strong><span>Сценарии действий</span></div><div><strong>03</strong><span>Документы и инструкции</span></div><div><strong>04</strong><span>Правовая грамотность</span></div></section>

        <section className="section" id="directions"><div className="section-heading"><div><p className="eyebrow">01 / НАПРАВЛЕНИЯ</p><h2>{isKk ? "Отбасы құқығының негізгі салалары" : "Основные направления семейного права"}</h2></div><p className="section-intro">Выберите интересующую тему — платформа поможет сориентироваться в правовых вопросах и дальнейших шагах.</p></div>
          <div className="topic-grid">{topics.map((topic, index) => <button className="topic-card" key={topic.id} onClick={() => chooseTopic(topic.id)}><span className="topic-number">0{index + 1}</span><span className="topic-icon">{topic.icon}</span><h3>{isKk ? ["Некеге тұру","Некені бұзу","Мүлікті бөлу","Алимент","Баланың құқықтары"][index] : topic.title}</h3><p>{isKk ? ["Тіркеу шарттары, құжаттар және неке шарты.","Некені бұзу тәртібі және дайындық.","Ортақ мүлік және оны бөлу мәселелері.","Отбасы мүшелерін асырау мәселелері.","Баланың мүдделерін қорғау және ата-аналар құқықтары."][index] : topic.description}</p><span className="card-arrow">↗</span></button>)}</div>
        </section>

        <section className="assistant-section" id="assistant"><div className="assistant-copy"><p className="eyebrow">02 / ПРАВОВОЙ ПОМОЩНИК</p><h2>Ситуация → нормы → варианты действий</h2><p>Ответьте на несколько вопросов. Это поможет определить, какие обстоятельства имеют значение и какие правовые вопросы следует проверить.</p><div className="assistant-points"><div><span>01</span><p><b>Уточнение ситуации</b><small>Выделяем юридически значимые обстоятельства.</small></p></div><div><span>02</span><p><b>Правовая основа</b><small>Определяем нормы, которые нужно проверить.</small></p></div><div><span>03</span><p><b>Сравнение вариантов</b><small>Рассматриваем последствия, риски и следующие шаги.</small></p></div></div><p className="legal-note">Сценарий носит информационный характер. Он не заменяет анализ документов и индивидуальную юридическую консультацию.</p></div>
          <div className="scenario-card"><div className="scenario-card-head"><div><span className="live-dot"></span> ИНТЕРАКТИВНЫЙ СЦЕНАРИЙ</div><span>ШАГ {scenarioStep + 1} / 3</span></div><div className="progress-track"><span style={{ width: ((scenarioStep + 1) / 3 * 100) + "%" }}></span></div>
            <label className="field-label" htmlFor="scenario-topic">Выберите правовую тему</label><select id="scenario-topic" value={selectedTopic} onChange={(e) => { setSelectedTopic(e.target.value as Topic); setScenarioStep(0); setAnswers({}); }}>{topics.map((topic) => <option value={topic.id} key={topic.id}>{topic.title}</option>)}</select>
            {scenarioStep < 3 ? <><p className="question-count">{questions[scenarioStep].title}</p><h3 className="scenario-question">{questions[scenarioStep].question}</h3><div className="answer-list">{questions[scenarioStep].options.map((option) => <button key={option} className={answers[String(scenarioStep)] === option ? "answer-option selected" : "answer-option"} onClick={() => answerQuestion(option)}><span>{option}</span><i>{answers[String(scenarioStep)] === option ? "✓" : "＋"}</i></button>)}</div><div className="scenario-controls"><button className="btn btn-outline" disabled={scenarioStep === 0} onClick={() => setScenarioStep((step) => Math.max(0, step - 1))}>Назад</button><button className="btn btn-primary" disabled={!answers[String(scenarioStep)]} onClick={() => setScenarioStep((step) => step + 1)}>Продолжить <span>→</span></button></div></> : <div className="scenario-summary"><div className="summary-icon">✓</div><p className="eyebrow">ПРЕДВАРИТЕЛЬНОЕ РЕЗЮМЕ</p><h3>{topicName}</h3><p>Вы указали следующие обстоятельства:</p><ul>{questions.map((question, index) => <li key={question.title}><b>{question.question}</b><span>{answers[String(index)]}</span></li>)}</ul><div className="summary-warning">Для правового вывода необходимо проверить актуальные нормы законодательства РК и документы по конкретной ситуации. Автоматическая правовая квалификация пока не подключена.</div><button className="btn btn-primary full-btn" onClick={resetScenario}>Пройти сценарий заново</button></div>}
            <div className="scenario-foot">Ваши ответы пока не отправляются на сервер и не сохраняются после закрытия страницы.</div>
          </div>
        </section>

        <section className="section documents-section" id="documents"><div className="section-heading"><div><p className="eyebrow">03 / БИБЛИОТЕКА</p><h2>Документы и правовые шаблоны</h2></div><p className="section-intro">Структурированная библиотека документов для подготовки к юридически значимым действиям.</p></div>
          <div className="document-tools"><div className="search-box"><span>⌕</span><input aria-label="Поиск документов" placeholder="Найти документ или тему..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="category-filters">{categories.map((item) => <button key={item} className={category === item ? "filter-chip selected" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
          <div className="document-grid">{filteredDocuments.map((doc) => <article className="document-card" key={doc.title}><div className="document-card-top"><span className="file-icon">▤</span><span className="status-pill">{doc.status}</span></div><small>{doc.category.toUpperCase()}</small><h3>{doc.title}</h3><p>{doc.description}</p><button onClick={() => setNotice("Шаблон «" + doc.title + "» будет добавлен после правовой проверки и подготовки актуальной формы.")}>Подробнее <span>→</span></button></article>)}</div>
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
