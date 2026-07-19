import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { translations } from '../../constants/translations';
import api from '../../services/api';
import { 
  Activity, 
  Mic, 
  MicOff, 
  Camera, 
  Trash2, 
  AlertTriangle, 
  FileText, 
  Plus, 
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

export const Assessment: React.FC = () => {
  const { medicalProfile, fetchMedicalProfile } = useAuthStore();
  const { language } = useThemeStore();
  const t = translations[language];

  // Forms states
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [symptoms, setSymptoms] = useState('');
  const [painLevel, setPainLevel] = useState(5);
  const [duration, setDuration] = useState('');
  const [includeProfile, setIncludeProfile] = useState(true);

  // Wound Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UI state
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfReport, setPdfReport] = useState<any>(null);

  // Collapsibles for Results
  const [showFirstAid, setShowFirstAid] = useState(true);
  const [showNextSteps, setShowNextSteps] = useState(true);

  useEffect(() => {
    fetchMedicalProfile();
    
    // Initialize Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-US';
      
      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setSymptoms(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, [fetchMedicalProfile, language]);

  // Handle Speech Toggle
  const toggleRecording = () => {
    if (!recognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognition.start();
    }
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Submit Triage Analysis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !symptoms || !duration) {
      setError('Please fill in Age, Symptoms description, and Duration.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setPdfReport(null);

    try {
      let response;

      // Extract context if included
      const medicalHistory = includeProfile ? medicalProfile?.chronicDiseases?.join(', ') : '';
      const allergies = includeProfile ? medicalProfile?.allergies?.join(', ') : '';
      const medications = includeProfile ? medicalProfile?.currentMedications?.join(', ') : '';

      if (imageFile) {
        // Upload Multipart Form Data for Wound Analysis
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('description', symptoms);
        formData.append('age', age);
        formData.append('gender', gender);
        formData.append('painLevel', painLevel.toString());
        formData.append('duration', duration);
        
        response = await api.post('/ai/analyze-wound', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Post standard text-based symptom request
        response = await api.post('/ai/analyze', {
          age: parseInt(age),
          gender,
          symptoms,
          painLevel,
          duration,
          medicalHistory,
          allergies,
          medications,
        });
      }

      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Triage engine connection failed. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  // Generate Report PDF
  const handleGeneratePdf = async () => {
    if (!result) return;
    setPdfGenerating(true);
    try {
      const response = await api.post(`/reports/generate/${result._id}`);
      if (response.data.success) {
        setPdfReport(response.data.data);
        // Direct download file trigger
        window.open(`/api/reports/download/${response.data.data._id}`, '_blank');
      }
    } catch (err) {
      alert('Failed to generate report PDF.');
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">
          {t.assessment}
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium mt-1">
          Perform immediate emergency triage powered by Google Gemini API logic
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Symptom Intake Form */}
        <div className="lg:col-span-7 glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 md:p-8 rounded-3xl space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-200/45 dark:border-slate-800/30 pb-3">
            <Activity className="w-5.5 h-5.5 text-medical-500 animate-pulse" />
            <span>Triage Intake Assessment</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid for Age, Gender, Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t.age} *</label>
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 32"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t.gender}</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t.duration} *</label>
                <input 
                  type="text" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2 hours, 3 days"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Pain Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400 dark:text-slate-500">{t.painLevel}</span>
                <span className="px-2 py-0.5 bg-medical-500 text-white rounded-md text-[10px]">{painLevel} / 10</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-medical-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1 - Mild discomfort</span>
                <span>5 - Moderate pain</span>
                <span>10 - Severe, unbearable pain</span>
              </div>
            </div>

            {/* Symptoms Description with Voice Assist */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400 dark:text-slate-500">{t.symptoms} *</span>
                <button 
                  type="button"
                  onClick={toggleRecording}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    isRecording 
                      ? 'bg-danger-500/10 text-danger-600 border-danger-500/20' 
                      : 'bg-medical-500/10 text-medical-600 border-medical-500/20 hover:bg-medical-500/20'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3 h-3 text-danger-500 animate-pulse" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 text-medical-500" />
                      <span>{t.voiceInactive}</span>
                    </>
                  )}
                </button>
              </div>

              <textarea 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe symptoms in detail. Mention where it hurts, radiating locations, breathing conditions, or visual lacerations. You can dictate by clicking the microphone above."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all resize-none"
                required
              />
            </div>

            {/* Wound Image Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.imageUpload}</label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white/10 dark:bg-slate-900/10 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition-all cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Camera className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-650 dark:text-slate-300">{t.selectImage}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{t.uploadImageDesc}</span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black/5 dark:bg-black/40 p-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={imagePreview} 
                      alt="Wound preview" 
                      className="w-14 h-14 object-cover rounded-lg shadow-sm"
                    />
                    <div>
                      <span className="text-xs font-bold block truncate max-w-xs">{imageFile?.name}</span>
                      <span className="text-[10px] text-slate-400">Ready to upload for analysis</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={removeImage}
                    className="p-2 bg-danger-500/10 text-danger-600 hover:bg-danger-550/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Include Profile Context */}
            {medicalProfile && (
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/30 rounded-2xl">
                <input 
                  type="checkbox"
                  checked={includeProfile}
                  onChange={(e) => setIncludeProfile(e.target.checked)}
                  className="rounded text-medical-500 focus:ring-medical-500 cursor-pointer w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Inject Medical Profile Context</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Include blood group, chronic conditions, and allergies in the AI evaluation automatically.
                  </span>
                </div>
              </label>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-danger-50 text-danger-600 rounded-xl text-xs flex items-center gap-2 border border-danger-500/10">
                <AlertTriangle className="w-4 h-4 shrink-0 text-danger-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-650 hover:to-medical-700 text-white font-bold rounded-2xl shadow-lg shadow-medical-500/15 transition-all text-sm flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>{t.analyzing}</span>
                </>
              ) : (
                <>
                  <span>Begin Analysis</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Triage Response results */}
        <div className="lg:col-span-5 space-y-6">
          {!result ? (
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-8 rounded-3xl text-center space-y-4 py-20">
              <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 rounded-full w-fit mx-auto">
                <ShieldCheck className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-650 dark:text-slate-350">Awaiting Triage Inputs</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
                Describe your symptoms on the left or upload a photo. Our medical triage decision engine will analyze details instantly.
              </p>
            </div>
          ) : (
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-3xl space-y-6 animate-fadeIn">
              
              {/* Severity Header */}
              <div className="text-center border-b border-slate-200/45 dark:border-slate-800/30 pb-4 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assessed Severity</span>
                
                {/* Severity Badge */}
                <div className={`
                  w-fit mx-auto px-6 py-2 rounded-full font-extrabold text-sm uppercase tracking-widest shadow-md
                  ${result.riskLevel === 'Low' && 'bg-success-500 text-white shadow-success-500/10'}
                  ${result.riskLevel === 'Moderate' && 'bg-warning-500 text-white shadow-warning-500/10'}
                  ${result.riskLevel === 'Critical' && 'bg-danger-500 text-white shadow-danger-500/10 animate-pulse'}
                `}>
                  {result.riskLevel}
                </div>

                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono pt-2">
                  <span>Priority: {result.aiResponse.estimated_priority}</span>
                  <span>|</span>
                  <span>Confidence: {Math.round((result.aiResponse.confidence || 0.9) * 100)}%</span>
                </div>
              </div>

              {/* General reasoning / conditions */}
              <div className="space-y-3 bg-slate-100/50 dark:bg-slate-900/30 p-4 border border-slate-200/40 dark:border-slate-800/30 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Reasoning</span>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                    {result.aiResponse.reasoning}
                  </p>
                </div>
                
                <div className="space-y-1 pt-2 border-t border-slate-200/30 dark:border-slate-800/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Possible Clinical Findings</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {result.aiResponse.possible_conditions.join(', ')}
                  </p>
                </div>
              </div>

              {/* Warning Signs (Critical Red Flags) */}
              {result.aiResponse.warning_signs && result.aiResponse.warning_signs.length > 0 && (
                <div className="p-4 bg-danger-500/15 border border-danger-500/20 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-danger-700 dark:text-danger-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-danger-500" />
                    <span>{t.warningSigns}</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.aiResponse.warning_signs.map((sign: string, idx: number) => (
                      <li key={idx} className="text-[11px] text-danger-700 dark:text-danger-400 leading-relaxed font-semibold">{sign}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Immediate First Aid instructions checklist */}
              <div className="border border-slate-200/40 dark:border-slate-800/30 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setShowFirstAid(!showFirstAid)}
                  className="w-full p-4 flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/30 text-left border-b border-slate-200/30 dark:border-slate-800/30"
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{t.firstAidInstructions}</span>
                  {showFirstAid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showFirstAid && (
                  <div className="p-4 space-y-2 bg-white/30 dark:bg-slate-950/20">
                    {result.aiResponse.first_aid.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 shrink-0 text-medical-500 mt-0.5" />
                        <span className="text-xs leading-relaxed text-slate-650 dark:text-slate-350">{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Steps */}
              <div className="border border-slate-200/40 dark:border-slate-800/30 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setShowNextSteps(!showNextSteps)}
                  className="w-full p-4 flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/30 text-left border-b border-slate-200/30 dark:border-slate-800/30"
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{t.nextActions}</span>
                  {showNextSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showNextSteps && (
                  <div className="p-4 space-y-2 bg-white/30 dark:bg-slate-950/20">
                    {result.aiResponse.next_steps.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <ArrowRight className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
                        <span className="text-xs leading-relaxed text-slate-650 dark:text-slate-350">{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hospital Locator / Ambulance warnings icons */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 border rounded-2xl flex flex-col items-center text-center justify-center ${result.aiResponse.hospital_needed ? 'border-amber-500/20 bg-amber-550/5 text-amber-600' : 'border-slate-200/50 dark:border-slate-800/30 text-slate-400'}`}>
                  <HelpCircle className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t.hospitalNeeded}</span>
                  <span className="text-[10px] font-medium mt-0.5">{result.aiResponse.hospital_needed ? 'Yes' : 'No'}</span>
                </div>

                <div className={`p-3 border rounded-2xl flex flex-col items-center text-center justify-center ${result.aiResponse.ambulance_required ? 'border-danger-500/20 bg-danger-550/5 text-danger-600' : 'border-slate-200/50 dark:border-slate-800/30 text-slate-400'}`}>
                  <AlertTriangle className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t.ambulanceRequired}</span>
                  <span className="text-[10px] font-medium mt-0.5">{result.aiResponse.ambulance_required ? 'Immediate Dial' : 'Not Urgent'}</span>
                </div>
              </div>

              {/* Generate PDF Button */}
              <button 
                onClick={handleGeneratePdf}
                disabled={pdfGenerating}
                className="w-full py-3 bg-medical-500 hover:bg-medical-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-medical-500/10 transition-all flex items-center justify-center gap-2"
              >
                {pdfGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling Report PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>{t.downloadPdf}</span>
                  </>
                )}
              </button>

              {/* Medical Disclaimer */}
              <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center leading-relaxed italic">
                {result.aiResponse.disclaimer || t.emergencyDisclaimer}
              </p>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Assessment;
