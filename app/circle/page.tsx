'use client';

import React, { useState, useEffect } from 'react';
import { safetyStore } from '@/lib/supabase/store';
import { TrustedContact } from '@/lib/types/database';
import {
  UserCheck,
  Shield,
  Plus,
  Trash2,
  Bell,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Flame,
  User,
  Sliders,
} from 'lucide-react';

export default function TrustedCirclePage() {
  const [contacts, setContacts] = useState<TrustedContact[]>(safetyStore.getContacts());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [testSentMsg, setTestSentMsg] = useState<string>('');

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(1);
  const [notifyOnStart, setNotifyOnStart] = useState(true);
  const [notifyOnCheck, setNotifyOnCheck] = useState(true);
  const [notifyOnSOS, setNotifyOnSOS] = useState(true);

 useEffect(() => {
  const unsubscribe = safetyStore.subscribe(() => {
    setContacts([...safetyStore.getContacts()]);
  });

  return () => {
    unsubscribe();
  };
}, []);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    safetyStore.addContact({
      name,
      relationship,
      phone,
      email,
      alert_priority: priority,
      notify_on_start: notifyOnStart,
      notify_on_check_missed: notifyOnCheck,
      notify_on_sos: notifyOnSOS,
    });
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  const handleDelete = (id: string) => {
    safetyStore.deleteContact(id);
  };

  const handleSendTestPing = () => {
    const user = safetyStore.getCurrentUser();
    contacts.forEach((c) => {
      safetyStore.addNotification({
        channel: 'SMS',
        recipientName: c.name,
        recipientPhone: c.phone,
        message: `🛡️ WalkSafe Test Ping: ${user.full_name} is testing their emergency response link. Status: All Systems Operational.`,
        priority: 'NORMAL',
      });
    });
    setTestSentMsg('✓ Test SMS alert delivered to all active contacts! View in Notification Drawer.');
    setTimeout(() => setTestSentMsg(''), 4500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Emergency Responders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Trusted Circle Management</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Configure the inner circle of family, friends, and campus security who will receive automated alerts when safety checks are missed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendTestPing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            Test Alert Ping
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {testSentMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {testSentMsg}
        </div>
      )}

      {/* 2. ESCALATION TIER EXPLAINER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-cyan-400 space-y-1">
          <div className="text-xs font-bold text-cyan-400 uppercase font-mono">Priority 1 • Immediate</div>
          <div className="text-xs text-slate-300 font-semibold">Journey Start & First Alert</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Notified when trip begins and instantly when a 45s safety check is missed.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-amber-400 space-y-1">
          <div className="text-xs font-bold text-amber-400 uppercase font-mono">Priority 2 • Escalation</div>
          <div className="text-xs text-slate-300 font-semibold">Continued Non-Response</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Notified if traveler does not respond after 2 minutes of active alert state.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-rose-500 space-y-1">
          <div className="text-xs font-bold text-rose-400 uppercase font-mono">Priority 3 • Emergency</div>
          <div className="text-xs text-slate-300 font-semibold">Full Emergency SOS Dispatch</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Notified only during critical SOS mode with live GPS & medical profile.
          </p>
        </div>
      </div>

      {/* 3. CONTACT CARDS LIST */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Active Circle Members ({contacts.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-white">
                    {contact.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{contact.name}</h3>
                    <span className="text-xs text-slate-400">{contact.relationship}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      contact.alert_priority === 1
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : contact.alert_priority === 2
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    Priority {contact.alert_priority}
                  </span>

                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    title="Remove contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{contact.phone}</span>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
              </div>

              {/* Notification Permissions Matrix */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1.5 text-[10px] text-center">
                <span
                  className={`py-1 px-1.5 rounded ${
                    contact.notify_on_start ? 'bg-emerald-500/10 text-emerald-300 font-semibold' : 'text-slate-600'
                  }`}
                >
                  ✓ On Start
                </span>
                <span
                  className={`py-1 px-1.5 rounded ${
                    contact.notify_on_check_missed ? 'bg-amber-500/10 text-amber-300 font-semibold' : 'text-slate-600'
                  }`}
                >
                  ✓ On Alert
                </span>
                <span
                  className={`py-1 px-1.5 rounded ${
                    contact.notify_on_sos ? 'bg-rose-500/10 text-rose-300 font-semibold' : 'text-slate-600'
                  }`}
                >
                  ✓ On SOS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ADD CONTACT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Add Trusted Responder
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rivera"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Parent / Mother">Mother / Father</option>
                    <option value="Spouse / Partner">Spouse / Partner</option>
                    <option value="Roommate">Roommate</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Close Friend">Close Friend</option>
                    <option value="Campus Security">Campus Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={1}>Priority 1 (Immediate)</option>
                    <option value={2}>Priority 2 (Alert Escalation)</option>
                    <option value={3}>Priority 3 (SOS Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone (For SMS)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@email.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Save Responder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
