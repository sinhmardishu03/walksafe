'use client';

import React, { useState, useEffect } from 'react';
import { safetyStore } from '@/lib/supabase/store';
import { CommunityReport, ReportCategory } from '@/lib/types/database';
import { InteractiveRouteMap } from '@/components/map/InteractiveRouteMap';
import { SAMPLE_ROUTES } from '@/lib/mock-data/seed';
import { AICommunityReportClassifier } from '@/lib/safety-engine/ai-report-classifier';
import {
  FileText,
  AlertTriangle,
  MapPin,
  Plus,
  ThumbsUp,
  Filter,
  CheckCircle2,
  Clock,
  Shield,
  Lightbulb,
  AlertOctagon,
  Users,
  Sparkles,
} from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<CommunityReport[]>(safetyStore.getReports());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('poor_lighting');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [locationName, setLocationName] = useState('Market St & 6th Ave');
  const [description, setDescription] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string>('');

  useEffect(() => {
    const unsub = safetyStore.subscribe(() => {
      setReports([...safetyStore.getReports()]);
    });
    return unsub;
  }, []);

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (text.length > 8) {
      const classified = AICommunityReportClassifier.classifyText(text);
      setCategory(classified.suggestedCategory);
      setSeverity(classified.suggestedSeverity);
      setAiSuggestion(`AI Auto-Classified: ${classified.extractedKeyHazard} (Severity: ${classified.suggestedSeverity.toUpperCase()})`);
    } else {
      setAiSuggestion('');
    }
  };

  const handleUpvote = (id: string) => {
    safetyStore.upvoteReport(id);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    safetyStore.addReport({
      title,
      category,
      severity,
      location_name: locationName,
      description,
      lat: 37.777 + (Math.random() - 0.5) * 0.008,
      lng: -122.418 + (Math.random() - 0.5) * 0.008,
    });
    setShowSubmitModal(false);
    setTitle('');
    setDescription('');
    setAiSuggestion('');
    setSuccessMsg('✓ Hazard report submitted and broadcast to the community safety grid!');
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const filteredReports =
    selectedCategory === 'all'
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Crowdsourced Safety Grid & AI Classification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Community Safety Reports</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time urban hazard mapping. Unstructured community reports are classified by AI to directly adjust SafeRoute scores.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Submit Safety Hazard Report
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          {successMsg}
        </div>
      )}

      {/* 2. MAP WITH HAZARD PINS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Live Urban Hazard Heatmap ({reports.length} Pins)
          </span>
          <span className="text-slate-400 text-[11px]">Click any hazard pin on the map to view details</span>
        </div>

        <InteractiveRouteMap
          routes={SAMPLE_ROUTES}
          reports={filteredReports}
          height="400px"
        />
      </div>

      {/* 3. CATEGORY FILTER TABS & REPORT CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'All Hazards' },
              { id: 'poor_lighting', label: '💡 Poor Lighting' },
              { id: 'harassment', label: '⚠️ Harassment' },
              { id: 'suspicious_activity', label: '👁️ Suspicious Activity' },
              { id: 'isolated_area', label: '🚪 Isolated Area' },
              { id: 'infrastructure_hazard', label: '🚧 Infrastructure' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'glass-panel text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono">{filteredReports.length} reports</span>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const aiInsight = AICommunityReportClassifier.classifyText(report.description);
            return (
              <div
                key={report.id}
                className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-3 flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        report.severity === 'high' || report.severity === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {report.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(report.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm leading-snug">{report.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{report.description}</p>

                  {/* AI Impact Summary */}
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] text-cyan-300 flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{aiInsight.routeImpactSummary}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{report.location_name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleUpvote(report.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Confirm ({report.upvotes})</span>
                    </button>

                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {report.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SUBMIT REPORT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Submit Hazard Report
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hazard Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Non-functional streetlights on alley"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description (AI Analyzed)</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Explain what is unsafe (e.g. 'Street lamps completely dark after 8pm, forcing people into shadows')..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
                {aiSuggestion && (
                  <div className="mt-1 text-[11px] text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{aiSuggestion}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReportCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="poor_lighting">Poor Lighting</option>
                    <option value="harassment">Harassment / Unsafe</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                    <option value="isolated_area">Isolated Area</option>
                    <option value="infrastructure_hazard">Infrastructure Hazard</option>
                    <option value="other">Other Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="low">Low (Notice)</option>
                    <option value="medium">Medium (Caution)</option>
                    <option value="high">High (Hazard)</option>
                    <option value="urgent">Urgent (Dangerous)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Street</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Park West Blvd & 8th St"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
