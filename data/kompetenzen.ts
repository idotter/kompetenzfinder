export interface KompetenzEntry {
  id: string;
  framework: "Lehrplan 21" | "IDG" | "Future Skills";
  bereich: string;
  name: string;
  beschreibung: string;
  url: string;
}

const LP21 = "https://v-ef.lehrplan.ch";
const IDG_URL = "https://innerdevelopmentgoals.org/framework/";
const FS_URL = "https://nextskills.org/future-skills-overview/";

export const KOMPETENZEN: KompetenzEntry[] = [
  // ── Lehrplan 21 · Personale Kompetenzen ─────────────────────────────────────
  {
    id: "lp21-personal-selbstwahrnehmung",
    framework: "Lehrplan 21", bereich: "Personale Kompetenzen",
    name: "Selbstwahrnehmung",
    beschreibung: "Eigene Gefühle, Bedürfnisse, Stärken und Grenzen wahrnehmen und benennen",
    url: LP21,
  },
  {
    id: "lp21-personal-selbstregulierung",
    framework: "Lehrplan 21", bereich: "Personale Kompetenzen",
    name: "Selbstregulierung",
    beschreibung: "Eigene Gedanken, Impulse und Emotionen beobachten und regulieren; mit Rückschlägen umgehen",
    url: LP21,
  },
  {
    id: "lp21-personal-eigenstaendigkeit",
    framework: "Lehrplan 21", bereich: "Personale Kompetenzen",
    name: "Eigenständigkeit & Selbstverantwortung",
    beschreibung: "Entscheidungen treffen, Verantwortung für eigenes Handeln übernehmen, Aufgaben selbstständig angehen",
    url: LP21,
  },
  {
    id: "lp21-personal-selbstwirksamkeit",
    framework: "Lehrplan 21", bereich: "Personale Kompetenzen",
    name: "Selbstwirksamkeit & Ausdauer",
    beschreibung: "Vertrauen in eigene Fähigkeiten; Herausforderungen annehmen und trotz Hindernissen dranbleiben",
    url: LP21,
  },
  {
    id: "lp21-personal-selbstreflexion",
    framework: "Lehrplan 21", bereich: "Personale Kompetenzen",
    name: "Selbstreflexion & Lernreflexion",
    beschreibung: "Eigene Lernprozesse, Fehler und Überzeugungen kritisch reflektieren; Fremd- mit Selbsteinschätzung vergleichen",
    url: LP21,
  },
  {
    id: "lp21-personal-kritisches-denken",
    framework: "Lehrplan 21", bereich: "Personale Kompetenzen",
    name: "Kritisches Denken & Urteilsbildung",
    beschreibung: "Aussagen und Meinungen kritisch hinterfragen; begründete Standpunkte entwickeln und vertreten",
    url: LP21,
  },

  // ── Lehrplan 21 · Soziale Kompetenzen ───────────────────────────────────────
  {
    id: "lp21-sozial-kooperieren",
    framework: "Lehrplan 21", bereich: "Soziale Kompetenzen",
    name: "Kooperieren & Zusammenarbeiten",
    beschreibung: "Gemeinsam planen, Aufgaben verteilen, Gruppenarbeit konstruktiv gestalten und Ziele erreichen",
    url: LP21,
  },
  {
    id: "lp21-sozial-kommunizieren",
    framework: "Lehrplan 21", bereich: "Soziale Kompetenzen",
    name: "Dialog- & Kommunikationsfähigkeit",
    beschreibung: "Aktiv zuhören, sachlich und respektvoll kommunizieren, andere Perspektiven einbeziehen",
    url: LP21,
  },
  {
    id: "lp21-sozial-empathie",
    framework: "Lehrplan 21", bereich: "Soziale Kompetenzen",
    name: "Empathie & Perspektivenwechsel",
    beschreibung: "Gefühle und Gedanken anderer wahrnehmen und berücksichtigen; sich in andere hineinversetzen",
    url: LP21,
  },
  {
    id: "lp21-sozial-konflikt",
    framework: "Lehrplan 21", bereich: "Soziale Kompetenzen",
    name: "Konflikt- & Problemlösefähigkeit",
    beschreibung: "Konflikte konstruktiv angehen, Kompromisse aushandeln, bei Uneinigkeit externe Unterstützung suchen",
    url: LP21,
  },
  {
    id: "lp21-sozial-vielfalt",
    framework: "Lehrplan 21", bereich: "Soziale Kompetenzen",
    name: "Umgang mit Vielfalt",
    beschreibung: "Gemeinsamkeiten und Unterschiede zwischen Menschen respektvoll wahrnehmen und wertschätzen",
    url: LP21,
  },

  // ── Lehrplan 21 · Methodische Kompetenzen ───────────────────────────────────
  {
    id: "lp21-methodik-informationen",
    framework: "Lehrplan 21", bereich: "Methodische Kompetenzen",
    name: "Informationen nutzen",
    beschreibung: "Informationen suchen, ordnen, bewerten, verknüpfen und in geeigneten Formen darstellen",
    url: LP21,
  },
  {
    id: "lp21-methodik-problemloesen",
    framework: "Lehrplan 21", bereich: "Methodische Kompetenzen",
    name: "Aufgaben & Probleme lösen",
    beschreibung: "Aufgaben analysieren, bekannte Muster erkennen, kreative Lösungsansätze entwickeln und umsetzen",
    url: LP21,
  },
  {
    id: "lp21-methodik-lernorganisation",
    framework: "Lehrplan 21", bereich: "Methodische Kompetenzen",
    name: "Lernprozesse organisieren",
    beschreibung: "Ziele setzen, Arbeitsschritte planen, Lernprozesse dokumentieren und reflektieren",
    url: LP21,
  },
  {
    id: "lp21-methodik-sprachkompetenz",
    framework: "Lehrplan 21", bereich: "Methodische Kompetenzen",
    name: "Sprachkompetenz",
    beschreibung: "Sprachliche Ausdrücke und Fachbegriffe verstehen und gezielt einsetzen; Textsorten kennen",
    url: LP21,
  },
  {
    id: "lp21-methodik-praesentieren",
    framework: "Lehrplan 21", bereich: "Methodische Kompetenzen",
    name: "Präsentieren & Kommunizieren",
    beschreibung: "Ergebnisse und Gedanken in verschiedenen Formaten (Poster, Vortrag, Bericht) aufbereiten und vorstellen",
    url: LP21,
  },

  // ── IDG · Being ─────────────────────────────────────────────────────────────
  {
    id: "idg-being-inner-compass",
    framework: "IDG", bereich: "Being – Beziehung zu sich selbst",
    name: "Innerer Kompass",
    beschreibung: "Tiefes Verantwortungsgefühl und Engagement für Werte, die dem Wohl des Ganzen dienen",
    url: IDG_URL,
  },
  {
    id: "idg-being-integrity",
    framework: "IDG", bereich: "Being – Beziehung zu sich selbst",
    name: "Integrität & Authentizität",
    beschreibung: "Aufrichtig und ehrlich handeln; eigene Werte und Handlungen in Übereinstimmung bringen",
    url: IDG_URL,
  },
  {
    id: "idg-being-openness",
    framework: "IDG", bereich: "Being – Beziehung zu sich selbst",
    name: "Offenheit & Lernbereitschaft",
    beschreibung: "Neugierde bewahren, Verletzlichkeit zulassen, Veränderungen und Wachstum begrüssen",
    url: IDG_URL,
  },
  {
    id: "idg-being-self-awareness",
    framework: "IDG", bereich: "Being – Beziehung zu sich selbst",
    name: "Selbstwahrnehmung & Selbstregulierung",
    beschreibung: "Eigene Gedanken, Gefühle und Wünsche reflektieren; realistisches Selbstbild entwickeln",
    url: IDG_URL,
  },
  {
    id: "idg-being-presence",
    framework: "IDG", bereich: "Being – Beziehung zu sich selbst",
    name: "Präsenz & Achtsamkeit",
    beschreibung: "Im Hier und Jetzt sein; offen und ohne Urteil wahrnehmen",
    url: IDG_URL,
  },

  // ── IDG · Thinking ──────────────────────────────────────────────────────────
  {
    id: "idg-thinking-critical",
    framework: "IDG", bereich: "Thinking – Kognitive Fähigkeiten",
    name: "Kritisches Denken",
    beschreibung: "Gültigkeit von Meinungen, Belegen und Plänen analytisch und streng prüfen",
    url: IDG_URL,
  },
  {
    id: "idg-thinking-perspective",
    framework: "IDG", bereich: "Thinking – Kognitive Fähigkeiten",
    name: "Perspektivenkompetenz",
    beschreibung: "Einsichten aus verschiedenen Perspektiven aktiv suchen, verstehen und nutzen",
    url: IDG_URL,
  },
  {
    id: "idg-thinking-systems",
    framework: "IDG", bereich: "Thinking – Kognitive Fähigkeiten",
    name: "Systemisches Denken",
    beschreibung: "Zusammenhänge, Wechselwirkungen und Nebeneffekte in komplexen Systemen erkennen",
    url: IDG_URL,
  },
  {
    id: "idg-thinking-longterm",
    framework: "IDG", bereich: "Thinking – Kognitive Fähigkeiten",
    name: "Langfristorientierung & Visionsbildung",
    beschreibung: "Visionen formulieren und aufrechterhalten, die im gesellschaftlichen Kontext verankert sind",
    url: IDG_URL,
  },
  {
    id: "idg-thinking-creativity",
    framework: "IDG", bereich: "Thinking – Kognitive Fähigkeiten",
    name: "Kreativität",
    beschreibung: "Originelle Ideen entwickeln und konventionelle Muster konstruktiv durchbrechen",
    url: IDG_URL,
  },

  // ── IDG · Relating ──────────────────────────────────────────────────────────
  {
    id: "idg-relating-appreciation",
    framework: "IDG", bereich: "Relating – Fürsorge für andere",
    name: "Wertschätzung & Dankbarkeit",
    beschreibung: "Anderen und der Welt mit grundlegender Wertschätzung, Dankbarkeit und Freude begegnen",
    url: IDG_URL,
  },
  {
    id: "idg-relating-connectedness",
    framework: "IDG", bereich: "Relating – Fürsorge für andere",
    name: "Verbundenheit",
    beschreibung: "Starkes Zugehörigkeitsgefühl gegenüber Gemeinschaft, Menschheit und globalem Ökosystem erleben",
    url: IDG_URL,
  },
  {
    id: "idg-relating-humility",
    framework: "IDG", bereich: "Relating – Fürsorge für andere",
    name: "Bescheidenheit",
    beschreibung: "Eigene Fähigkeiten realistisch einschätzen, ohne sich über andere zu stellen",
    url: IDG_URL,
  },
  {
    id: "idg-relating-empathy",
    framework: "IDG", bereich: "Relating – Fürsorge für andere",
    name: "Empathie & Mitgefühl",
    beschreibung: "Anderen, sich selbst und der Natur gegenüber freundlich sein; emotionale Last dabei tragen",
    url: IDG_URL,
  },
  {
    id: "idg-relating-forgiveness",
    framework: "IDG", bereich: "Relating – Fürsorge für andere",
    name: "Vergebung & Loslassen",
    beschreibung: "Fehler und Verletzungen loslassen, Spannung lösen und nach vorne schauen",
    url: IDG_URL,
  },

  // ── IDG · Collaborating ─────────────────────────────────────────────────────
  {
    id: "idg-collab-trust",
    framework: "IDG", bereich: "Collaborating – Vertrauen & Zusammenarbeit",
    name: "Vertrauen & Beziehungsfähigkeit",
    beschreibung: "Beziehungen durch Zuhören, Anerkennung und konstruktives Feedback aufbauen und pflegen",
    url: IDG_URL,
  },
  {
    id: "idg-collab-inclusion",
    framework: "IDG", bereich: "Collaborating – Vertrauen & Zusammenarbeit",
    name: "Inklusives Denken & Interkulturelle Kompetenz",
    beschreibung: "Vielfalt umarmen und Menschen mit verschiedenen Ansichten und Hintergründen einbeziehen",
    url: IDG_URL,
  },
  {
    id: "idg-collab-cocreation",
    framework: "IDG", bereich: "Collaborating – Vertrauen & Zusammenarbeit",
    name: "Ko-Kreation",
    beschreibung: "Kollaborative Beziehungen aufbauen, die durch psychologische Sicherheit und echte Partnerschaft geprägt sind",
    url: IDG_URL,
  },
  {
    id: "idg-collab-communication",
    framework: "IDG", bereich: "Collaborating – Vertrauen & Zusammenarbeit",
    name: "Kommunikationsfähigkeit",
    beschreibung: "Echten Dialog fördern; Meinungen geschickt vertreten; Konflikte konstruktiv lösen",
    url: IDG_URL,
  },
  {
    id: "idg-collab-mobilizing",
    framework: "IDG", bereich: "Collaborating – Vertrauen & Zusammenarbeit",
    name: "Andere mobilisieren",
    beschreibung: "Andere inspirieren und für gemeinsame Ziele gewinnen",
    url: IDG_URL,
  },

  // ── IDG · Acting ────────────────────────────────────────────────────────────
  {
    id: "idg-acting-courage",
    framework: "IDG", bereich: "Acting – Wandel ermöglichen",
    name: "Mut",
    beschreibung: "Für Werte einstehen, entschlossen Entscheidungen treffen, bestehende Strukturen hinterfragen",
    url: IDG_URL,
  },
  {
    id: "idg-acting-optimism",
    framework: "IDG", bereich: "Acting – Wandel ermöglichen",
    name: "Hoffnung & Optimismus",
    beschreibung: "Hoffnungsgefühl und Zuversicht bewahren; an sinnvollen Wandel glauben",
    url: IDG_URL,
  },
  {
    id: "idg-acting-resources",
    framework: "IDG", bereich: "Acting – Wandel ermöglichen",
    name: "Bewusster Ressourceneinsatz",
    beschreibung: "Zeit, Energie, Geld und ökologische Ressourcen achtsam und verantwortungsvoll einsetzen",
    url: IDG_URL,
  },
  {
    id: "idg-acting-proactivity",
    framework: "IDG", bereich: "Acting – Wandel ermöglichen",
    name: "Proaktivität & Initiative",
    beschreibung: "Initiative ergreifen und Dinge aktiv in Gang setzen, anstatt passiv zu warten",
    url: IDG_URL,
  },
  {
    id: "idg-acting-perseverance",
    framework: "IDG", bereich: "Acting – Wandel ermöglichen",
    name: "Ausdauer & Beharrlichkeit",
    beschreibung: "Engagiert bleiben und entschlossen sein, auch wenn Bemühungen Zeit brauchen",
    url: IDG_URL,
  },

  // ── Future Skills · Selbstbezogene Kompetenzen ──────────────────────────────
  {
    id: "fs-selbst-lernkompetenz",
    framework: "Future Skills", bereich: "Selbstbezogene Kompetenzen",
    name: "Lernkompetenz",
    beschreibung: "Selbstgesteuert und eigeninitiativ lernen; Metakognition einsetzen",
    url: FS_URL,
  },
  {
    id: "fs-selbst-selbstwirksamkeit",
    framework: "Future Skills", bereich: "Selbstbezogene Kompetenzen",
    name: "Selbstwirksamkeit",
    beschreibung: "Überzeugt sein, Aufgaben aus eigener Kraft zu meistern; Verantwortung für eigene Entscheidungen übernehmen",
    url: FS_URL,
  },
  {
    id: "fs-selbst-selbstbestimmung",
    framework: "Future Skills", bereich: "Selbstbezogene Kompetenzen",
    name: "Selbstbestimmung",
    beschreibung: "Produktiv zwischen externer Struktur und Selbstorganisation navigieren; Handlungsspielräume nutzen",
    url: FS_URL,
  },
  {
    id: "fs-selbst-reflexionskompetenz",
    framework: "Future Skills", bereich: "Selbstbezogene Kompetenzen",
    name: "Reflexionskompetenz",
    beschreibung: "Sich selbst konstruktiv hinterfragen; eigene Verhaltens- und Wertesysteme erkennen",
    url: FS_URL,
  },
  {
    id: "fs-selbst-entscheidungskompetenz",
    framework: "Future Skills", bereich: "Selbstbezogene Kompetenzen",
    name: "Entscheidungskompetenz",
    beschreibung: "Alternativen abwägen und Entscheidungen treffen; Verantwortung für Konsequenzen akzeptieren",
    url: FS_URL,
  },

  // ── Future Skills · Soziale & Organisationale Kompetenzen ───────────────────
  {
    id: "fs-sozial-kommunikation",
    framework: "Future Skills", bereich: "Soziale & Organisationale Kompetenzen",
    name: "Kommunikationskompetenz",
    beschreibung: "Sprachliche Fähigkeiten mit dialogischer und strategischer Kommunikation verbinden",
    url: FS_URL,
  },
  {
    id: "fs-sozial-kooperation",
    framework: "Future Skills", bereich: "Soziale & Organisationale Kompetenzen",
    name: "Kooperationskompetenz",
    beschreibung: "In interkulturellen Teams zusammenarbeiten – analog und digital",
    url: FS_URL,
  },
  {
    id: "fs-sozial-initiative",
    framework: "Future Skills", bereich: "Soziale & Organisationale Kompetenzen",
    name: "Initiative & Leistungsbereitschaft",
    beschreibung: "Eigeninitiative zeigen, Ziele hartnäckig verfolgen und sich positiv motivieren",
    url: FS_URL,
  },

  // ── Future Skills · Inhaltsbezogene Kompetenzen ─────────────────────────────
  {
    id: "fs-inhalt-digital",
    framework: "Future Skills", bereich: "Inhaltsbezogene Kompetenzen",
    name: "Digitale Kompetenz",
    beschreibung: "Digitale Medien produktiv und kreativ nutzen; kritisch reflektieren",
    url: FS_URL,
  },
  {
    id: "fs-inhalt-design-thinking",
    framework: "Future Skills", bereich: "Inhaltsbezogene Kompetenzen",
    name: "Design-Thinking-Kompetenz",
    beschreibung: "Kreative Methoden anwenden; Stakeholder einbeziehen; offen und flexibel Probleme lösen",
    url: FS_URL,
  },
  {
    id: "fs-inhalt-innovation",
    framework: "Future Skills", bereich: "Inhaltsbezogene Kompetenzen",
    name: "Innovationskompetenz",
    beschreibung: "Innovation als integralen Bestandteil von Themen und Prozessen fördern",
    url: FS_URL,
  },
  {
    id: "fs-inhalt-systemkompetenz",
    framework: "Future Skills", bereich: "Inhaltsbezogene Kompetenzen",
    name: "Systemkompetenz",
    beschreibung: "Komplexe psychologische, soziale und technische Systeme und ihre Wechselwirkungen verstehen",
    url: FS_URL,
  },
  {
    id: "fs-inhalt-sensemaking",
    framework: "Future Skills", bereich: "Inhaltsbezogene Kompetenzen",
    name: "Sinngebung (Sensemaking)",
    beschreibung: "Bereitschaft und Fähigkeit, aus sich rasch verändernden Kontexten Bedeutung zu konstruieren",
    url: FS_URL,
  },

  // ── Future Skills · Metakompetenzen ─────────────────────────────────────────
  {
    id: "fs-meta-ambiguitaet",
    framework: "Future Skills", bereich: "Metakompetenzen",
    name: "Ambiguitätskompetenz",
    beschreibung: "Mehrdeutigkeit, Heterogenität und Unsicherheit erkennen und produktiv damit umgehen",
    url: FS_URL,
  },
  {
    id: "fs-meta-ethik",
    framework: "Future Skills", bereich: "Metakompetenzen",
    name: "Ethische Kompetenz",
    beschreibung: "Ethische Dimensionen erkennen, Prämissen bewerten und konsistente ethische Urteile bilden",
    url: FS_URL,
  },
  {
    id: "fs-meta-zukunft",
    framework: "Future Skills", bereich: "Metakompetenzen",
    name: "Zukunfts- & Gestaltungskompetenz",
    beschreibung: "Veränderungen mutig begegnen; neue Visionen kreativ entwickeln und sich selbst herausfordern",
    url: FS_URL,
  },
];

export const KOMPETENZEN_BY_ID: Record<string, KompetenzEntry> =
  Object.fromEntries(KOMPETENZEN.map((k) => [k.id, k]));

export function getKompetenzenForFrameworks(frameworks: string[]): KompetenzEntry[] {
  if (!frameworks.length) return KOMPETENZEN;
  return KOMPETENZEN.filter((k) => frameworks.includes(k.framework));
}
