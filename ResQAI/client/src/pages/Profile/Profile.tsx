import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { translations } from '../../constants/translations';
import { 
  User, 
  Heart, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  Phone, 
  AlertTriangle, 
  Loader2, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { 
    user, 
    medicalProfile, 
    contacts, 
    loading, 
    error, 
    fetchMedicalProfile, 
    updateMedicalProfile, 
    fetchContacts, 
    addContact, 
    deleteContact,
    clearError
  } = useAuthStore();

  const { language } = useThemeStore();
  const t = translations[language];

  // Medical profile states
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown'>('Unknown');
  const [allergiesText, setAllergiesText] = useState('');
  const [diseasesText, setDiseasesText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNo, setInsurancePolicyNo] = useState('');
  
  // Update feedback state
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New contact states
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSOS, setIsSOS] = useState(true);
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    fetchMedicalProfile();
    fetchContacts();
    clearError();
  }, [fetchMedicalProfile, fetchContacts, clearError]);

  // Load profile values once fetched
  useEffect(() => {
    if (medicalProfile) {
      setBloodGroup(medicalProfile.bloodGroup || 'Unknown');
      setAllergiesText(medicalProfile.allergies?.join(', ') || '');
      setDiseasesText(medicalProfile.chronicDiseases?.join(', ') || '');
      setMedicationsText(medicalProfile.currentMedications?.join(', ') || '');
      setInsuranceProvider(medicalProfile.insuranceProvider || '');
      setInsurancePolicyNo(medicalProfile.insurancePolicyNo || '');
    }
  }, [medicalProfile]);

  // Save Medical Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    
    // Parse comma-separated inputs into clean arrays
    const allergies = allergiesText.split(',').map((x) => x.trim()).filter(Boolean);
    const chronicDiseases = diseasesText.split(',').map((x) => x.trim()).filter(Boolean);
    const currentMedications = medicationsText.split(',').map((x) => x.trim()).filter(Boolean);

    const success = await updateMedicalProfile({
      bloodGroup,
      allergies,
      chronicDiseases,
      currentMedications,
      insuranceProvider,
      insurancePolicyNo
    });

    if (success) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  // Add Emergency Contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactRelation || !contactPhone) {
      alert('Please fill in Name, Relation, and Phone.');
      return;
    }

    setContactSuccess(false);
    const success = await addContact({
      name: contactName,
      relation: contactRelation,
      phone: contactPhone,
      email: contactEmail || undefined,
      isSOS
    });

    if (success) {
      setContactSuccess(true);
      setContactName('');
      setContactRelation('');
      setContactPhone('');
      setContactEmail('');
      setIsSOS(true);
      setTimeout(() => setContactSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">
          {t.profile}
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium mt-1">
          Maintain your personal metrics and configure SMS contacts for SOS alerts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Medical Profile Form */}
        <div className="lg:col-span-7 glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 md:p-8 rounded-3xl space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-200/45 dark:border-slate-800/30 pb-3">
            <Heart className="w-5.5 h-5.5 text-medical-500" />
            <span>Clinical Indicators</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blood group */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t.bloodGroup}</label>
                <select 
                  value={bloodGroup}
                  onChange={(e: any) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Insurance provider */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t.insurance}</label>
                <input 
                  type="text" 
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  placeholder="e.g. Star Health Insurance"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Policy number */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t.policyNumber}</label>
                <input 
                  type="text" 
                  value={insurancePolicyNo}
                  onChange={(e) => setInsurancePolicyNo(e.target.value)}
                  placeholder="e.g. POL-99882211"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t.allergies} (comma separated)</label>
              <textarea 
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Chronic conditions */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t.medicalHistory} (comma separated)</label>
              <textarea 
                value={diseasesText}
                onChange={(e) => setDiseasesText(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Medications */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t.medications} (comma separated)</label>
              <textarea 
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="e.g. Metformin 500mg, Albuterol inhaler"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Feedback notifications */}
            {profileSuccess && (
              <div className="p-3 bg-success-50 text-success-600 rounded-xl text-xs flex items-center gap-2 border border-success-500/10">
                <CheckCircle className="w-4 h-4 text-success-500 shrink-0" />
                <span>Medical parameters updated successfully. Ready for AI context injection.</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-medical-500 hover:bg-medical-600 text-white font-bold rounded-2xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
              <span>Save Medical Metrics</span>
            </button>
          </form>
        </div>

        {/* Right Col: Emergency Contacts Management */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Add Contact Form */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-3xl space-y-4">
            <h2 className="text-base font-bold border-b border-slate-200/45 dark:border-slate-800/30 pb-2">
              Add Emergency Contact
            </h2>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Contact Name *"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="Relation (e.g. Spouse) *"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                  required
                />
                <input 
                  type="tel" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Phone Number *"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Email Address (optional)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input 
                  type="checkbox"
                  checked={isSOS}
                  onChange={(e) => setIsSOS(e.target.checked)}
                  className="rounded text-medical-500 focus:ring-medical-500 cursor-pointer w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Include in Quick SOS Alerts</span>
              </label>

              {contactSuccess && (
                <div className="p-2.5 bg-success-50 text-success-600 rounded-xl text-xs flex items-center gap-2 border border-success-500/10">
                  <CheckCircle className="w-4 h-4 text-success-500 shrink-0" />
                  <span>Contact added successfully!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-950 text-white font-bold rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addContact}</span>
              </button>
            </form>
          </div>

          {/* Contacts list */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-3xl space-y-4">
            <h2 className="text-base font-bold border-b border-slate-200/45 dark:border-slate-800/30 pb-2">
              SOS Broadcast Directory
            </h2>

            {contacts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No emergency contacts saved yet.</p>
            ) : (
              <div className="space-y-3.5">
                {contacts.map((c) => (
                  <div key={c._id} className="flex items-center justify-between gap-4 p-3 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/30 rounded-2xl">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded-md font-mono">
                          {c.relation}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <Phone className="w-3 h-3 text-medical-500" />
                        <span>{c.phone}</span>
                        {c.isSOS && (
                          <span className="text-[9px] text-danger-550 font-bold bg-danger-500/10 px-1 rounded-md">SOS Active</span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteContact(c._id)}
                      className="p-2 hover:bg-danger-50 text-slate-400 hover:text-danger-650 rounded-xl transition-all"
                      title="Delete contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
export default Profile;
