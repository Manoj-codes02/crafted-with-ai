import React, { useState } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { translations } from '../../constants/translations';
import api from '../../services/api';
import { 
  Flame, 
  Droplet, 
  Activity, 
  Wind, 
  Sun, 
  Skull, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  CornerDownRight, 
  Send,
  Loader2,
  AlertOctagon
} from 'lucide-react';

export const Disaster: React.FC = () => {
  const { language } = useThemeStore();
  const t = translations[language];

  const categories = [
    { id: 'flood', name: 'Flood & Flash Floods', icon: Droplet, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { id: 'fire', name: 'Fire Emergencies', icon: Flame, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    { id: 'earthquake', name: 'Earthquakes & Tremors', icon: Activity, color: 'text-amber-600 bg-amber-600/10 border-amber-600/20' },
    { id: 'cyclone', name: 'Cyclones & High Winds', icon: Wind, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
    { id: 'heatwave', name: 'Severe Heatwave', icon: Sun, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    { id: 'snakebite', name: 'Venomous Snake Bite', icon: Skull, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'chemical', name: 'Hazardous Chemical Leak', icon: ShieldAlert, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('flood');
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fallback offline guides matching the server structure
  const offlineGuides: Record<string, any> = {
    flood: {
      immediate_actions: [
        'Move to higher ground immediately. Do not wait for instructions.',
        'Avoid walking or driving through flood waters.'
      ],
      dos: [
        'Turn off utilities (electricity, water, gas) if safe to do so.',
        'Monitor local weather reports via radio/phone.',
        'Wear sturdy shoes and keep an emergency kit handy.'
      ],
      donts: [
        'Do not drive around barricades; 2 feet of water can sweep cars away.',
        'Do not walk through moving water. Even 6 inches can knock you off balance.',
        'Do not touch electrical equipment if you are wet or standing in water.'
      ],
      evacuation_advice: [
        'Evacuate immediately if advised by local authorities.',
        'Use designated evacuation routes. Do not take shortcuts.',
        'Bring your emergency go-bag containing water, medications, documents, and charger.'
      ]
    },
    fire: {
      immediate_actions: [
        'Crawl low under smoke to exit the building.',
        'Before opening any door, feel the handle with the back of your hand. If hot, use another exit.'
      ],
      dos: [
        'Call emergency services once you are in a safe location.',
        'Stop, drop, and roll if your clothes catch fire.',
        'Cover your mouth and nose with a damp cloth if smoke is heavy.'
      ],
      donts: [
        'Do not use elevators under any circumstances.',
        'Do not go back inside to retrieve personal belongings.',
        'Do not open windows unless escaping through them, as oxygen feeds the fire.'
      ],
      evacuation_advice: [
        'Exit the building immediately using the nearest fire exit.',
        'Assemble at a safe designated meeting point outside.',
        'Alert others on your way out if possible.'
      ]
    },
    earthquake: {
      immediate_actions: [
        'Drop, Cover, and Hold On! Get under a heavy desk or table.',
        'If outdoors, move to an open area away from buildings, power lines, and trees.'
      ],
      dos: [
        'Stay indoors until shaking stops and it is safe to exit.',
        'Protect your head and neck with your arms.',
        'Expect aftershocks and remain alert.'
      ],
      donts: [
        'Do not stand in doorways, as they are not structurally safer than other parts of a modern house.',
        'Do not run outside while the ground is shaking.',
        'Do not use elevators or light matches/lighters (gas leaks might be present).'
      ],
      evacuation_advice: [
        'Once shaking stops, check for structural damage and safely exit the building.',
        'Do not enter damaged structures.',
        'Listen to emergency broadcasts for shelter locations.'
      ]
    },
    cyclone: {
      immediate_actions: [
        'Seek shelter in a sturdy, central room of the house or a public storm shelter.',
        'Stay away from windows and glass doors.'
      ],
      dos: [
        'Board up windows or apply tape to prevent flying glass.',
        'Store plenty of drinking water in clean containers.',
        'Keep batteries, flashlights, and a radio active.'
      ],
      donts: [
        'Do not go outside, even if the wind dies down, as the eye of the cyclone is passing and high winds will resume.',
        'Do not touch fallen power lines or drive through debris.'
      ],
      evacuation_advice: [
        'Evacuate if you live in a low-lying coastal zone or storm surge area.',
        'Secure external items that could become airborne before leaving.'
      ]
    },
    heatwave: {
      immediate_actions: [
        'Find an air-conditioned room or cool shaded area immediately.',
        'Drink plenty of water even if you do not feel thirsty.'
      ],
      dos: [
        'Wear loose, light-colored, lightweight clothing.',
        'Take cool baths or showers.',
        'Check on elderly neighbors, children, and pets.'
      ],
      donts: [
        'Do not drink caffeinated, alcoholic, or highly sugary beverages (they dehydrate).',
        'Do not engage in strenuous outdoor activity during peak sunlight hours (11 AM to 4 PM).',
        'Never leave anyone, especially children or pets, in a parked car.'
      ],
      evacuation_advice: [
        'If power fails and temperature becomes life-threatening, relocate to public cooling centers, malls, or libraries.'
      ]
    },
    snakebite: {
      immediate_actions: [
        'Keep the victim calm and restrict their movement to slow down venom circulation.',
        'Position the bitten limb at or slightly below the level of the heart.'
      ],
      dos: [
        'Clean the bite area gently with water, but do not scrub.',
        'Remove any jewelry or tight clothing before swelling starts.',
        'Try to remember the snake\'s appearance (color, shape, pattern) from a safe distance to help identify it for anti-venom.'
      ],
      donts: [
        'Do NOT use a tourniquet or constricting band.',
        'Do NOT cut the wound or try to suck out the venom.',
        'Do NOT apply ice or submerge the wound in water.',
        'Do NOT give the victim alcohol, caffeine, or aspirin.'
      ],
      evacuation_advice: [
        'Transport the victim immediately to the nearest hospital facility equipped with anti-venom. Call an ambulance immediately.'
      ]
    },
    chemical: {
      immediate_actions: [
        'Evacuate the area immediately, moving upwind and away from the chemical source.',
        'If indoors, close all windows, doors, and vents, and turn off heating/air conditioning (shelter-in-place).'
      ],
      dos: [
        'Seal doors and vents with plastic sheeting and duct tape if sheltering in place.',
        'If contaminated, remove clothing immediately and shower with large amounts of lukewarm water.',
        'Listen to authorities for instructions on chemical identification and evacuation.'
      ],
      donts: [
        'Do not go outside to investigate.',
        'Do not consume food or water that may have been exposed to the air.',
        'Do not rub your eyes or skin if exposed; flush them repeatedly.'
      ],
      evacuation_advice: [
        'Evacuate only when instructed, using routes specified to avoid the spreading gas/chemical plume.'
      ]
    }
  };

  const currentGuide = advice || offlineGuides[selectedCategory];

  const fetchAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/ai/disaster-advice', {
        category: selectedCategory,
        situation: situation.trim()
      });
      if (response.data.success) {
        setAdvice(response.data.data);
      }
    } catch (err) {
      console.warn('API advice fetch failed (offline). Using pre-loaded cached handbook.');
      // Force refresh current guide to show local cache and clean custom advice state
      setAdvice(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">
          {t.disasterSupport}
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium mt-1">
          Explore tactical evacuation guidance and coordinate with the AI disaster team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Categories & Custom Query */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Categories select list */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-3xl space-y-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Disaster Hazards</span>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setAdvice(null); // Clear previous custom advice
                      setSituation('');
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left
                      ${isSelected 
                        ? 'border-medical-500 bg-medical-500/10 text-medical-600 dark:text-medical-400 shadow-xs' 
                        : 'border-slate-200/40 dark:border-slate-800/30 text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-900/30'
                      }
                    `}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Situation consultation */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-3xl space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Specific Emergency?</span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Describe your direct scenario (e.g. trapped in room, gas smell) to request context-aware steps from ResQAI.
              </p>
            </div>
            
            <form onSubmit={fetchAdvice} className="space-y-3">
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="e.g. Trapped on second floor, room filling with dense dark smoke."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs focus:ring-2 focus:ring-medical-500 outline-none transition-all resize-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-650 hover:to-medical-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Consult Disaster AI</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Col: Guide breakdown */}
        <div className="lg:col-span-8 glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 md:p-8 rounded-3xl space-y-6">
          
          <div className="flex items-center gap-3 border-b border-slate-200/45 dark:border-slate-800/30 pb-4">
            <div className="p-2.5 bg-medical-500/10 text-medical-600 rounded-xl">
              <AlertOctagon className="w-6 h-6 animate-pulse text-medical-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {categories.find(c => c.id === selectedCategory)?.name} Guide
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {advice ? 'Dynamic AI Guidance Loaded' : 'Cached Local Emergency Guide (Offline-ready)'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Immediate Actions */}
            <div className="p-4 bg-red-500/5 border border-red-550/10 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-danger-650 dark:text-danger-400 uppercase tracking-wider flex items-center gap-1">
                <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
                <span>Immediate Critical Actions</span>
              </h3>
              <div className="space-y-2">
                {currentGuide.immediate_actions.map((act: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="font-extrabold text-red-500">{i + 1}.</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evacuation Advice */}
            <div className="p-4 bg-medical-500/5 border border-medical-550/10 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-medical-700 dark:text-medical-400 uppercase tracking-wider flex items-center gap-1">
                <CornerDownRight className="w-4 h-4 text-medical-500 shrink-0" />
                <span>Evacuation Protocol</span>
              </h3>
              <div className="space-y-2">
                {currentGuide.evacuation_advice.map((adv: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="text-medical-500 font-bold">•</span>
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200/40 dark:border-slate-800/30 pt-6">
            
            {/* Do's */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-success-600 dark:text-success-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-success-500 shrink-0" />
                <span>Do\'s</span>
              </h3>
              <div className="space-y-2.5">
                {currentGuide.dos.map((d: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-650 dark:text-slate-350">
                    <CheckCircle className="w-3.5 h-3.5 text-success-500 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Don'ts */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-danger-600 dark:text-danger-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-danger-500 shrink-0" />
                <span>Don\'ts</span>
              </h3>
              <div className="space-y-2.5">
                {currentGuide.donts.map((dont: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-650 dark:text-slate-350">
                    <XCircle className="w-3.5 h-3.5 text-danger-550 shrink-0 mt-0.5" />
                    <span>{dont}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
export default Disaster;
