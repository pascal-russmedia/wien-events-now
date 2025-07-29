
export const TEXT = {
  // ===== SITE CONFIGURATION =====
  SITE: {
    name: 'Volat',
    description: 'Entdecke lokale Events in Vorarlberg, Deutschland und Schweiz',
    url: 'https://volat.app',
    logo: '/lovable-uploads/894421fb-1dc7-41c2-93c5-5b12cc058b8a.png'
  },
  
  // ===== PAGE CONTENT =====
  PAGES: {
    index: {
      title: 'Die besten Events entdecken',
      description: 'Entdecke die besten Events in Vorarlberg, Deutschland und Schweiz. Von Konzerten bis Festivals - finde dein nächstes Erlebnis.',
      heroSection: {
        headline: 'Entdecke lokale Events',
        subheadline: 'Die besten Veranstaltungen in Vorarlberg, Deutschland und Schweiz',
        searchPlaceholder: 'Nach Events suchen...',
        callToAction: 'Event hinzufügen'
      },
      highlightsSection: {
        todayTitle: 'Highlights des Tages',
        weekTitle: 'Highlights der Woche'
      },
      categoriesSection: {
        title: 'Events nach Kategorien',
        categories: {
          'Party & Musik': 'Konzerte, Festivals, Clubbing',
          'Familie & Freizeit': 'Märkte, Feste, Familienaktivitäten',
          'Sport & Outdoor': 'Sportveranstaltungen, Outdoor-Aktivitäten',
          'Kultur & Bühne': 'Theater, Museen, Kunst'
        }
      },
      newsletterSection: {
        title: 'Kein Event mehr verpassen?',
        description: 'Jeden Donnerstag. Die lautesten, leckersten und legendärsten Events direkt in dein Postfach. Perfekt für deine Wochenendplanung.',
        placeholder: 'Deine E-Mail Adresse',
        button: 'Anmelden'
      }
    },
    search: {
      title: 'Event Suche',
      description: 'Durchsuche alle Events in Vorarlberg, Deutschland und Schweiz',
      placeholder: 'Nach Events suchen...',
      resultsCount: 'Ergebnisse',
      filters: {
        region: 'Region',
        category: 'Kategorie',
        date: 'Datum'
      }
    },
    add: {
      title: 'Event hinzufügen',
      description: 'Teile dein Event mit der Community',
      fillFormSubtitle: 'Wir setzen dein Event in Szene – kostenlos & in wenigen Klicks.'
    },
    login: {
      title: 'Login',
      description: 'Anmelden',
      signIn: 'Anmelden',
      signOut: 'Abmelden',
      signInToWohin: 'Backoffice',
      internalAccess: 'Interner Zugang',
      signInToAccount: 'Bei deinem Account anmelden',
      backToMainSite: 'Zurück zur Hauptseite'
    },
    internal: {
      title: 'Internal Dashboard',
      description: 'Interne Verwaltung von Events',
      add: {
        title: 'Event hinzufügen',
        subtitle: 'Events welche hier hinzugefügt werden sind automatisch genehmigt.'
      },
      manage: {
        missingFilters: 'Filter fehlen',
        selectDateCategory: 'Bitte wähle Datum und Kategorie aus',
        noEventsSelected: 'Keine Events ausgewählt',
        selectAtLeastOne: 'Wähle mindestens ein Event aus',
        searchingEvents: 'Events werden gesucht...',
        noEventsFound: 'Keine Events gefunden',
        eventManagement: 'Event Management',
        futureEvents: 'Zukünftige Events',
        pastEvents: 'Vergangene Events',
        loadingEvents: 'Events werden geladen...',
        pending: 'Ausstehend',
        approved: 'Genehmigt',
        rejected: 'Abgelehnt',
        all: 'Alle',
        editYourEvent: 'Event bearbeiten',
        makeChanges: 'Änderungen werden geprüft und das Event wird danach veröffentlicht.'
      },
      export: {
        dataExport: 'Daten Export',
        eventExport: 'Event Export',
        date: 'Datum',
        pickDate: 'Datum wählen',
        category: 'Kategorie',
        subcategory: 'Unterkategorie'
      },
    },
    event: {
      notFound: 'Event nicht gefunden',
      notFoundSubtitle: 'Das gesuchte Event existiert nicht oder wurde entfernt.',
      date: 'Datum',
      location: 'Ort',
      price: 'Eintritt',
      visitWebsite: 'Website besuchen',
      shareEvent: 'Event teilen',
      routePlanning: 'Route'
    },
    notFound: {
      title: 'Seite nicht gefunden',
      message: 'Die gesuchte Seite existiert nicht.',
      returnHome: 'Zurück zur Startseite'
    }
  },

  // ===== EVENTS & CONTENT =====
  EVENTS: {
    highlightsDay: 'Highlights des Tages',
    highlightsWeek: 'Highlights der Woche',
    allEvents: 'Alle Events',
    noEvents: 'Keine Events gefunden',
    noEventsInSystem: 'Keine Events im System gefunden',
    noEventsFoundSearch: 'Keine Events gefunden',
    adjustFilters: 'Versuche die Filter anzupassen, um mehr Events zu finden',
    loadMore: 'Mehr laden',
    free: 'Kostenlos',
    cost: 'Kostenpflichtig',
    top: 'Tipp',
    viewAll: 'Alle anzeigen'
  },

  // ===== FORMS & UI COMPONENTS =====
  FORMS: {
    name: 'Name',
    email: 'E-Mail',
    description: 'Beschreibung',
    category: 'Kategorie',
    subcategory: 'Unterkategorie',
    region: 'Region',
    subregion: 'Unterregion',
    city: 'Ort',
    host: 'Veranstalter',
    address: 'Adresse',
    date: 'Datum',
      startTime: 'Startzeit',
      endTime: 'Endzeit',
      startTimeOptional: 'Startzeit (Optional)',
      endTimeOptional: 'Endzeit (Optional)',
    price: 'Eintritt',
    link: 'Link',
    image: 'Bild',
    submit: 'Absenden',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    required: 'Pflichtfeld',
    Optional: 'Optional',
    sections: {
      eventDetails: 'Details',
      location: 'Ort',
      pricing: 'Preis',
      contactInformation: 'Kontakt'
    },
    fields: {
      title: 'Titel',
      category: 'Kategorie',
      eventWebsite: 'Website (Optional)',
      enterDetails: 'Beschreibung',
      description: 'Beschreibung',
      region: 'Region',
      city: 'Ort',
      eventHost: 'Veranstalter (Optional)',
      eventAddress: 'Adresse (Optional)'
    },
    labels: {
      email: 'E-Mail',
      allRegions: 'Alle Regionen',
      allCategories: 'Alle Kategorien',
      allSubcategories: 'Alle Unterkategorien',
      subcategoryOptional: 'Unterkategorie (Optional)',
      none: 'Keine',
      host: 'Veranstalter',
      optional: 'Optional'
    },
    placeholders: {
      name: 'Name eingeben',
      eventTitle: 'Titel eingeben',
      description: 'Beschreibung des Events',
      enterDetails: 'Beschreibung eingeben',
      host: 'Name des Veranstalters eingeben',
      eventHost: 'Name des Veranstalters',
      address: 'z.B. Gutenbergstraße 1',
      eventAddress: 'z.B. Gutenbergstraße 1',
      link: 'z.B. https://website.at',
      eventWebsite: 'z.B. https://website.at',
      email: 'E-Mail eingeben',
      yourEmail: 'E-Mail eingeben',
      selectCategory: 'Kategorie wählen',
      selectRegion: 'Region wählen',
      selectRegionExport: 'Region für Export wählen',
      selectCity: 'Ort wählen',
      popularityScore: 'Popularity Score eingeben',
      selectSubcategory: 'Unterkategorie wählen',
      selectCategoryFirst: 'Zuerst Kategorie wählen',
      selectDate: 'Datum wählen',
      allCategories: 'Alle Kategorien',
      allSubcategories: 'Alle Unterkategorien',
      password: 'Passwort eingeben',
      clearFilters: 'Filter zurücksetzen'
    },
    buttons: {
      search: 'Suchen',
      back: 'Zurück'
    }
  },

  // ===== SYSTEM STATES =====
  LOADING: {
    events: 'Events werden geladen...',
    moreEvents: 'Weitere Events werden geladen...',
    general: 'Wird geladen...',
    uploading: 'Wird hochgeladen...',
    default: 'Wird geladen...',
    event: 'Event wird geladen...'
  },
  ERRORS: {
    general: 'Ein Fehler ist aufgetreten',
    network: 'Netzwerkfehler',
    notFound: 'Nicht gefunden',
    imageUploadFailed: 'Bild hochladen fehlgeschlagen',
    tryAgainLater: 'Bitte versuche es später erneut',
    eventUpdateFailed: 'Event aktualisieren fehlgeschlagen',
    eventCreateFailed: 'Event erstellen fehlgeschlagen'
  },

  // ===== CONTENT SECTIONS =====
  CREATE_EVENT: {
    headline: 'Du veranstaltest ein Event?',
    subtitle: 'Präsentiere deine Veranstaltung Tausenden Vorarlbergern – kostenlos & in wenigen Klicks.'
  },
  HERO: {
    discoverBest: 'Entdecke die besten',
    events: 'Events',
    inYourRegion: 'in deiner Region'
  },
  LIMITS: {
    nameMax: 100,
    descriptionMax: 500,
    hostMax: 100,
    addressMax: 200,
    titleCharacters: 'Zeichen',
    descriptionCharacters: 'Zeichen',
    hostCharacters: 'Zeichen'
  },
  MESSAGES: {
    eventSubmitSuccess: 'Dein Event wurde erfolgreich eingereicht und wird überprüft.',
    eventUpdateSuccess: 'Dein Event wurde erfolgreich aktualisiert.',
    eventUpdateReviewNote: 'Deine Änderungen werden überprüft.',
    eventApprovedLive: 'Das Event ist jetzt live und sichtbar.',
    consentMessage: 'Ich bestätige, dass alle Angaben korrekt sind und stimme der Veröffentlichung zu.',
    noDatesAdded: 'Noch keine Termine hinzugefügt.',
    reachedEndOfEvents: 'Du hast alle Events erreicht.',
    maximumDatesReached: 'Maximale Anzahl an Terminen erreicht (30).',
    dragAndDrop: '',
    fileFormat: 'JPG, PNG (max. 4MB)',
    optimalRatio: 'Optimales Seitenverhältnis: 16:9',
    eventDoesNotExist: 'Das Event existiert nicht',
    failedToLoadEvent: 'Event konnte nicht geladen werden',
    eventNotFound: 'Event nicht gefunden'
  },
  ACTIONS: {
    submitting: 'Wird eingereicht...',
    updating: 'Wird aktualisiert...',
    creating: 'Wird erstellt...',
    submitEvent: 'Event einreichen',
    updateEvent: 'Event aktualisieren',
    createEvent: 'Event erstellen',
    setApproved: 'Genehmigt',
    setRejected: 'Abgelehnt',
    setPending: 'Ausstehend',
    edit: 'Bearbeiten'
  },
  BUTTONS: {
    addDate: 'Datum hinzufügen',
    loadMoreEvents: 'Weitere Events laden',
    clickToUpload: 'Klicken oder Bild hierher ziehen',
    backToEvents: 'Zurück',
    replaceImage: 'Bild ersetzen'
  },
  NAVIGATION: {
    addEvent: 'Hinzufügen'
  },
  STATES: {
    pending: 'Ausstehend',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt'
  },

  // ===== SPECIALIZED FEATURES =====
  NEWSLETTER: {
    headline: 'Kein Event mehr verpassen?',
    subtitle: 'Jeden Donnerstag. Die lautesten, leckersten und legendärsten Events direkt in dein Postfach. Perfekt für deine Wochenendplanung.',
    emailPlaceholder: 'Deine E-Mail Adresse',
    subscribeButton: 'Anmelden',
    successMessage: 'Erfolgreich angemeldet! Du erhältst bald unseren Newsletter.',
    generator: {
      title: 'Newsletter Generator',
      description: 'Erstelle das HTML Snippet für den wöchentlichen Newsletter.',
      configuration: 'Konfiguration',
      dateRange: 'Datumsbereich',
      region: 'Region',
      eventsPerDay: 'Events pro Tag',
      friday: 'Freitag',
      saturday: 'Samstag', 
      sunday: 'Sonntag',
      template: 'Vorlage',
      preview: 'Vorschau',
      loading: 'Newsletter wird generiert...',
      generateNewsletter: 'Newsletter generieren',
      copyToClipboard: 'HTML kopieren',
      downloadHtml: 'HTML herunterladen',
      copiedToClipboard: 'HTML in Zwischenablage kopiert',
      downloadSuccess: 'HTML-Datei heruntergeladen',
      noEvents: 'Keine Events für die ausgewählten Kriterien gefunden',
      mobile: 'Mobile Ansicht',
      desktop: 'Desktop Ansicht'
    },
    template: {
      subject: 'Die besten Events in {region}',
      header: 'Weekend Event Highlights',
      subheader: 'Die Top Events für das kommende Wochenende',
      footer: 'Deine Plattform für lokale Events',
      viewMore: 'Alle Events anzeigen',
      friday: 'Freitag Highlights',
      saturday: 'Samstag Highlights', 
      sunday: 'Sonntag Highlights',
      free: 'Kostenlos',
      moreInfo: 'Mehr Infos'
    }
  },
  VALIDATION_MESSAGES: {
    missingSelection: 'Auswahl fehlt',
    pleaseSelectProduct: 'Bitte wähle ein Produkt aus',
    missingFilters: 'Filter fehlen',
    selectDateCategory: 'Bitte wähle Datum und Kategorie aus',
    noEventsSelected: 'Keine Events ausgewählt',
    selectAtLeastOne: 'Wähle mindestens ein Event aus'
  },
  EXPORT: {
    title: 'Export für Zeitung',
    description: 'Tagged Text für InDesign exportieren.',
    product: 'Produkt',
    selectProduct: 'Produkt wählen',
    exportButton: 'Export',
    cancel: 'Abbrechen',
    success: 'Export erfolgreich',
    successDescription: 'Tagged Text Datei exportiert für {product} mit {count} Events',
    timeFormats: {
      start: 'Beginn',
      end: 'Ende',
      hour: 'Uhr',
      timeRange: 'Beginn {start} Uhr – Ende {end} Uhr',
      timeStart: 'Beginn {start} Uhr'
    },
    location: {
      district: 'Bezirk'
    },
    table: {
      event: 'Event',
      category: 'Kategorie',
      location: 'Region',
      date: 'Datum',
      price: 'Preis',
      popularityScore: 'Popularity Score',
      host: 'Veranstalter'
    }
  },
  NOTIFICATIONS: {
    exportSuccess: 'Export erfolgreich',
    copiedToClipboard: 'In Zwischenablage kopiert',
    downloadSuccess: 'Download erfolgreich',
    imageUploadSuccess: 'Bild erfolgreich hochgeladen'
  },
  ALL_EVENTS: {
    title: 'Alle Events in {region}',
    filters: {
      today: 'Heute',
      tomorrow: 'Morgen',
      weekend: 'Wochenende',
      selectDate: 'Datum wählen',
      selectCategory: 'Kategorie wählen',
      allCategories: 'Alle Kategorien',
      selectSubcategory: 'Unterkategorie wählen',
      allSubcategories: 'Alle Unterkategorien',
      loadingSubcategories: 'Unterkategorien werden geladen...',
      selectDateRange: 'Ein Datum oder Zeitraum wählen',
      reset: 'Zurücksetzen',
      confirm: 'Bestätigen'
    },
    noEvents: {
      title: 'Keine Events heute',
      description: 'Schaue später für neue Events vorbei'
    },
    viewAll: {
      title: 'Alle Events anzeigen',
      button: 'Alle anzeigen',
      discover: 'Alle Events entdecken'
    }
  },
  // SUCCESS MODALS
  SUCCESS_MODALS: {
    addEvent: {
      title: 'Event erfolgreich eingereicht!',
      description: 'Dein Event wird nun überprüft und anschließend veröffentlicht. Du wirst per E-Mail benachrichtigt.',
      close: 'Schließen'
    },
    editEvent: {
      title: 'Änderungen erfolgreich eingereicht',
      notVisibleNote: 'Wir werden die Änderungen überprüfen und veröffentlichen das Event danach. ',
      close: 'Schließen'
    }
  },
  // HARDCODED ENGLISH TEXT - TO BE TRANSLATED BY USER
  HARDCODED_ENGLISH: {
    viewAllEvents: 'Alle Events anzeigen',
    viewAll: 'Alle anzeigen',
    basicInformation: 'Details',
    additionalSettings: 'Zusätzliche Einstellungen',
    popularityScoreOptional: 'Popularity Score (Optional)',
    featuredEvent: 'Featured Event (Tipp)',
    imageOptional: 'Bild (Optional)',
    priceType: 'Eintritt',
    selectPriceType: 'Eintritt',
    free: 'Gratis',
    cost: 'Kostenpflichtig',
    location: 'Ort',
    title: 'Titel',
    region: 'Region',
    pricing: 'Eintritt',
    priceAmount: 'Preis (€)',
    priceAmountPlaceholder: 'Preis eingeben (z.B. 19,99)',
    addEvent: 'Hinzufügen',
    add: 'Hinzufügen',
    Optional: 'Optional',
    information: 'Informationen',
    titleRequired: 'Titel ist erforderlich',
    titleMaxLength: 'Titel darf maximal 50 Zeichen lang sein',
    descriptionRequired: 'Beschreibung ist erforderlich',
    descriptionMaxLength: 'Beschreibung darf maximal 2000 Zeichen lang sein',
    regionRequired: 'Region ist erforderlich',
    categoryRequired: 'Kategorie ist erforderlich',
    confirmAccuracyRequired: 'Sie müssen die Angaben bestätigen.',
    authenticationRequired: 'Authentifizierung erforderlich',
    eventUpdatedSuccessfully: 'Event erfolgreich aktualisiert!',
    eventCreatedSuccessfully: 'Event erfolgreich erstellt!',
    eventUpdateFailed: 'Aktualisierung des Events fehlgeschlagen',
    eventCreateFailed: 'Erstellung des Events fehlgeschlagen',
    youMustBeLoggedIn: 'Du musst eingeloggt sein, um interne Events zu erstellen.',
    theEventHasBeenUpdated: 'Das Event wurde aktualisiert und ist jetzt live',
    noPendingEvents: 'Keine ausstehenden Events',
    noEventsWaitingForApproval: 'Es gibt keine Events, die auf Genehmigung warten.',
    noApprovedEvents: 'Keine genehmigten Events',
    noApprovedEventsToDisplay: 'Es gibt keine genehmigten Events zum Anzeigen.',
    noRejectedEvents: 'Keine abgelehnten Events',
    noRejectedEventsToDisplay: 'Es gibt keine abgelehnten Events zum Anzeigen.',
    youMustConfirmAccuracy: 'Du musst die Richtigkeit der Angaben bestätigen',
    downloadAsCsv: 'Als CSV herunterladen',
    exportForProduct: 'Für Zeitung exportieren',
    eventName: 'Titel',
    categoryTable: 'Kategorie',
    locationTable: 'Region',
    eventDates: 'Termine',
    state: 'Status',
    addedBy: 'Von',
    emailTable: 'E-Mail',
    created: 'Erstellt',
    actions: 'Aktionen',
    manage: 'Verwalten',
    exportNav: 'Export',
    newsletter: 'Newsletter',
    eventDatesTitle: 'Termine',
    bulkActions: 'Bulk Aktion',
    popularityScoreDescription: '0-100. Events am gleichen Tag werden nach dem Score absteigend sortiert. +20 für ein Bild, +5 für das Plus Paket, +30 von OpenAI.',
    topEventDescription: 'Nur für bezahltes Plus Paket verwenden. Events erhalten einen Tipp Badge und +5 Punkte für den Popularity Score.',
    trustScoreDescription: '0-100. Intern: 100 Punkte und automatisch Freigabe. Extern: OpenAI Score.',
    trustScoreOptional: 'Trust Score (optional)'
  }
};
