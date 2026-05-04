import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; 
import { getParcelles } from '../services/api'; 

// Correction d'un bug de Leaflet avec React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Niveau de risque associé à une couleur sur la carte
const COULEURS = {
  faible:   '#5a9e6e', 
  moyen:    '#f0b429',
  eleve:    '#d97706',
  critique: '#dc2626'
};

// icone sur la map avec le niveau de couleur 
const iconePersonnalisee = (couleur) => L.divIcon({
  html: `<div style="width:20px;height:20px;border-radius:50%;background:${couleur};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  className: '',  
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Affiche toutes les parcelles sur une map OpenStreetMap

export default function CartePage() {
  // Liste de toutes les parcelles
  const [parcelles, setParcelles]       = useState([]);
  const [chargement, setChargement]     = useState(true);
  const [filtreRisque, setFiltreRisque] = useState('tous');

  // Récupération des parcelles
  useEffect(() => {
    getParcelles()
      .then(r => setParcelles(r.data.parcelles))
      .finally(() => setChargement(false));
  }, []);

  // Filtre en fonction du niveau de risque
  const parcellesFiltrees = filtreRisque === 'tous'
    ? parcelles
    : parcelles.filter(p => p.niveauRisque === filtreRisque);

  // Carte sur la France
  const centreDefaut = [46.8, 2.3];

  return (
    <div>
      {/* En-tête les boutons de filtre */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Carte interactive</h1>
          <p>Visualisez vos parcelles et les zones à risques</p>
        </div>

        {/* Boutons de filtre */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['tous', 'faible', 'moyen', 'eleve', 'critique'].map(f => (
            <button
              key={f}
              onClick={() => setFiltreRisque(f)}
              style={{
                padding: '6px 14px', borderRadius: '99px', border: '1.5px solid',
                borderColor: filtreRisque === f ? COULEURS[f] || '#1a3a2a' : '#e0ddd8',
                background:  filtreRisque === f ? (COULEURS[f] || '#1a3a2a') : 'white',
                color:       filtreRisque === f ? 'white' : '#4a6151',
                cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif',
                fontWeight: filtreRisque === f ? '600' : '400', transition: 'all 0.15s'
              }}
            >
              {/* Nombre total de parcelles */}
              {f === 'tous' ? `Tous (${parcelles.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* Légende des couleurs de risque */}
      <div className="card" style={{ marginBottom: '16px', padding: '12px 20px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4a6151' }}>Niveau de risque :</span>
          {/* Génération de légende depuis les couleurs */}
          {Object.entries(COULEURS).map(([risque, couleur]) => (
            <div key={risque} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: couleur, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              <span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{risque}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chargement ou carte */}
      {chargement ? (
        <div className="loader">Chargement de la carte...</div>
      ) : (
        <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: '520px' }}>
          <MapContainer
            // Centre sur la France ou sur la parcelle
            center={parcellesFiltrees.length > 0
              ? [parcellesFiltrees[0].coordonnees.lat, parcellesFiltrees[0].coordonnees.lng]
              : centreDefaut}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            {/* OpenStreetMap; carte gratuite et open source */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marqueur sur les parcelles */}
            {parcellesFiltrees.map(p => (
              p.coordonnees?.lat && p.coordonnees?.lng ? (
                <React.Fragment key={p._id}>

                  {/* Marqueur sur les coordonnées GPS */}
                  <Marker
                    position={[p.coordonnees.lat, p.coordonnees.lng]}
                    icon={iconePersonnalisee(COULEURS[p.niveauRisque] || '#5a9e6e')}
                  >
                    {/* Si clic sur parcelle - affichage des informations de la parcelle */}
                    <Popup>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '180px' }}>
                        <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>{p.nom}</strong>
                        <div style={{ fontSize: '0.82rem', lineHeight: '1.8', color: '#4a6151' }}>
                          <div>Culture : <strong>{p.culture}</strong></div>
                          <div>Surface : <strong>{p.surface} ha</strong></div>
                          {/* Niveau de risque */}
                          <div>Risque : <strong style={{ color: COULEURS[p.niveauRisque] }}>{p.niveauRisque}</strong></div>

                          {/* Données capteurs IoT (générées automatiquement pour MVP) */}
                          {p.donneesCapeurs?.temperature && (
                            <>
                              <hr style={{ margin: '6px 0', opacity: 0.2 }} />
                              <div>Temp. : <strong>{p.donneesCapeurs.temperature}°C</strong></div>
                              <div>Humidité : <strong>{p.donneesCapeurs.humidite}%</strong></div>
                              <div>pH : <strong>{p.donneesCapeurs.ph}</strong></div>
                            </>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Zone de risque affiché si supérieur à "faible" */}
                  {p.niveauRisque !== 'faible' && (
                    <Circle
                      center={[p.coordonnees.lat, p.coordonnees.lng]}
                      radius={
                        p.niveauRisque === 'critique' ? 8000 : 
                        p.niveauRisque === 'eleve'   ? 5000 : 
                        3000     
                      }
                      pathOptions={{
                        color:       COULEURS[p.niveauRisque],
                        fillColor:   COULEURS[p.niveauRisque],
                        fillOpacity: 0.08, 
                        weight:      1,
                        dashArray:   '6'  
                      }}
                    />
                  )}
                </React.Fragment>
              ) : null 
            ))}
          </MapContainer>
        </div>
      )}

      {/* Si aucune parcelle ne correspond au filtre */}
      {parcellesFiltrees.length === 0 && !chargement && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', marginTop: '16px' }}>
          Aucune parcelle à afficher pour le filtre sélectionné.
        </div>
      )}
    </div>
  );
}