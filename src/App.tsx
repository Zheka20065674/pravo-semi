import { useState } from "react";

type Language = "ru" | "kk";

const copy = {
  ru: {
    nav: ["Направления", "Правовой помощник", "Документы", "О проекте"],
    eyebrow: "Семейное право Республики Казахстан",
    title: "Право семьи — понятным языком",
    lead: "Разбирайтесь в семейных правоотношениях, изучайте возможные действия и готовьтесь к юридически значимым решениям.",
    action: "Начать разбор ситуации",
    directions: "Основные направления",
    items: [
      ["💍", "Заключение брака", "Условия регистрации, документы и брачный договор."],
      ["🏡", "Семейные отношения", "Права и обязанности супругов, имущество и дети."],
      ["⚖️", "Расторжение брака", "Порядок развода, раздел имущества и алименты."]
    ],
    helper: "Правовой помощник",
    helperText: "Выберите тему, чтобы перейти к соответствующему правовому сценарию.",
    choose: "Выберите вопрос",
    options: ["Раздел имущества", "Место проживания ребёнка", "Подготовка к браку"],
    note: "Это стартовая версия интерфейса. Юридические выводы и шаблоны будут добавляться только после проверки по действующему законодательству РК.",
    documents: "Библиотека документов",
    docsText: "Здесь будут проверенные образцы, инструкции и конструктор документов.",
    about: "О проекте",
    aboutText: "Цель проекта — сделать семейное право Казахстана более понятным и доступным. Платформа должна объяснять права и обязанности нейтрально, без обещания гарантированного судебного результата.",
    footer: "Демонстрационная версия. Не является юридической консультацией."
  },
  kk: {
    nav: ["Бағыттар", "Құқықтық көмекші", "Құжаттар", "Жоба туралы"],
    eyebrow: "Қазақстан Республикасының отбасы құқығы",
    title: "Отбасы құқығы — түсінікті тілмен",
    lead: "Отбасылық құқықтық қатынастарды түсініп, ықтимал әрекеттерді зерттеп, маңызды шешімдерге дайындалыңыз.",
    action: "Жағдайды талдауды бастау",
    directions: "Негізгі бағыттар",
    items: [
      ["💍", "Некеге тұру", "Тіркеу талаптары, құжаттар және неке шарты."],
      ["🏡", "Отбасылық қатынастар", "Ерлі-зайыптылардың құқықтары, мүлік және балалар."],
      ["⚖️", "Некені бұзу", "Ажырасу тәртібі, мүлікті бөлу және алимент."]
    ],
    helper: "Құқықтық көмекші",
    helperText: "Тиісті құқықтық сценарийге өту үшін тақырыпты таңдаңыз.",
    choose: "Мәселені таңдаңыз",
    options: ["Мүлікті бөлу", "Баланың тұрғылықты жері", "Некеге дайындық"],
    note: "Бұл интерфейстің бастапқы нұсқасы. Құқықтық қорытындылар мен үлгілер ҚР қолданыстағы заңнамасы тексерілгеннен кейін қосылады.",
    documents: "Құжаттар кітапханасы",
    docsText: "Мұнда тексерілген үлгілер, нұсқаулықтар және құжат конструкторы болады.",
    about: "Жоба туралы",
    aboutText: "Жобаның мақсаты — Қазақстанның отбасы құқығын түсінікті әрі қолжетімді ету. Платформа құқықтар мен міндеттерді бейтарап түсіндіріп, сот шешіміне кепілдік бермеуі керек.",
    footer: "Демонстрациялық нұсқа. Заң консультациясы болып табылмайды."
  }
} as const;

export default function App() {
  const [language, setLanguage] = useState<Language>("ru");
  const [topic, setTopic] = useState("0");
  const t = copy[language];

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#">⚖️💍 <span>Право Семьи</span></a>
        <nav aria-label="Основная навигация">
          <a href="#directions">{t.nav[0]}</a><a href="#assistant">{t.nav[1]}</a>
          <a href="#documents">{t.nav[2]}</a><a href="#about">{t.nav[3]}</a>
        </nav>
        <button className="language-button" onClick={() => setLanguage(language === "ru" ? "kk" : "ru")}>
          {language === "ru" ? "ҚАЗ" : "РУС"}
        </button>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="lead">{t.lead}</p>
            <a className="primary-button" href="#assistant">{t.action}</a>
          </div>
          <aside className="hero-aside"><span className="aside-symbol">⚖️</span>
            <h2>Правовая ясность начинается с понимания</h2>
            <p>Информация, сценарии и документы в одном пространстве.</p>
          </aside>
        </section>
        <section className="section" id="directions">
          <p className="eyebrow">01 / FAMILY LAW</p><h2>{t.directions}</h2>
          <div className="card-grid">{t.items.map(([icon, title, description]) => (
            <article className="topic-card" key={title}><span className="topic-icon">{icon}</span>
              <h3>{title}</h3><p>{description}</p>
            </article>
          ))}</div>
        </section>
        <section className="section assistant-section" id="assistant">
          <div><p className="eyebrow">02 / SCENARIOS</p><h2>{t.helper}</h2><p>{t.helperText}</p>
            <p className="disclaimer">{t.note}</p></div>
          <div className="scenario-panel"><label htmlFor="topic">{t.choose}</label>
            <select id="topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
              {t.options.map((option, index) => <option value={String(index)} key={option}>{option}</option>)}
            </select>
            <div className="scenario-result"><strong>{t.options[Number(topic)]}</strong>
              <p>{language === "ru" ? "Следующий этап — уточняющие вопросы, анализ применимых норм и сравнение вариантов действий." : "Келесі кезең — нақтылау сұрақтары, қолданылатын нормаларды талдау және әрекет нұсқаларын салыстыру."}</p>
            </div>
          </div>
        </section>
        <section className="section" id="documents"><p className="eyebrow">03 / DOCUMENTS</p>
          <h2>{t.documents}</h2><div className="document-placeholder"><span>📄</span><p>{t.docsText}</p></div>
        </section>
        <section className="section about-section" id="about"><p className="eyebrow">04 / ABOUT</p>
          <h2>{t.about}</h2><p>{t.aboutText}</p></section>
      </main>
      <footer>{t.footer} · © 2026 Право Семьи</footer>
    </div>
  );
}