import InternalLayout from '@/components/auth/InternalLayout';
import { SEO } from '@/components/SEO';
const InternalDocumentation = () => {
  return <>
    <SEO 
      title="Dokumentation | Wohin"
      description="Interne Produktdokumentation"
      noIndex={true}
    />
    <InternalLayout title="Dokumentation">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            WOHIN Produktdokumentation
          </h1>
          <p className="text-lg text-gray-600">
            Die wichtigsten Logiken und Mechanismen der Plattform
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🏠 Startseiten-Sortierung
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Highlights der Woche
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Zeigt Events der nächsten 7 Tage (exklusive heute)</li>
                  <li><strong>Wochentags (Mo-Do):</strong> Maximal 1 Event pro Tag</li>
                  <li><strong>Wochenende (Fr-So):</strong> Maximal 3 Events pro Tag</li>
                  <li>Sortierung: Erst nach Datum, dann nach Popularity Score (höchster zuerst)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Alle Events
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Zeigt alle anderen Events (nicht in "Highlights der Woche")</li>
                  <li>Schließt heutige Events aus</li>
                  <li>Gleiche Tageslimits wie Highlights der Woche</li>
                  <li>Sortierung: Erst nach Datum, dann nach Popularity Score</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              ⭐ Popularity Score System
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium">
                Der Popularity Score bestimmt die Reihenfolge von Events am gleichen Tag
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Automatische Punktevergabe
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium mr-3">
                        +20 Punkte
                      </span>
                      <span>Event hat ein Bild</span>
                    </li>
                     <li className="flex items-center">
                       <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-3">
                         +5 Punkte
                       </span>
                       <span>Event ist als "Featured" markiert (Tipp Badge)</span>
                     </li>
                    <li className="flex items-center">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium mr-3">
                        +30 Punkte
                      </span>
                      <span>OpenAI generiert</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🎯 Featured Events (Tipp Badge)
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                <strong>Wichtig:</strong> Featured Events sind für das kostenpflichtige Plus Paket vorgesehen
              </p>
            </div>

            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Events erhalten einen sichtbaren "Tipp" Badge</li>
              <li>Automatisch +5 Punkte zum Popularity Score</li>
              <li>Bessere Sichtbarkeit auf der Startseite</li>
              <li>Nur für Premium-Kunden verfügbar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              📅 Event-Status und Verwaltung
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Status-Typen
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Live:</strong> Event ist öffentlich sichtbar</li>
                  <li><strong>Draft:</strong> Event ist noch nicht veröffentlicht</li>
                  <li><strong>Declined:</strong> Event wurde abgelehnt</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Regionale Filterung
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Alle Events werden nach Region gefiltert</li>
                  <li>Standard-Region: Vorarlberg</li>
                  <li>Benutzer können zwischen Regionen wechseln</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🔍 Such- und Filterlogik
            </h2>
            
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Volltextsuche in Event-Namen und Beschreibungen</li>
              <li>Filter nach Kategorien und Subkategorien</li>
              <li>Datumsfilter für zukünftige Events</li>
              <li>Regionale Eingrenzung</li>
              <li>Sortierung nach Relevanz und Popularity Score</li>
            </ul>
          </section>

          <div className="bg-gray-50 rounded-lg p-4 mt-8">
            <p className="text-sm text-gray-600 text-center">
              Diese Dokumentation erklärt die wichtigsten Mechanismen der WOHIN-Plattform.
              <br />
              Bei Fragen zur technischen Umsetzung wenden Sie sich an das Entwicklungsteam.
            </p>
          </div>
        </div>
      </div>
    </InternalLayout>
  </>;
};
export default InternalDocumentation;