const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');

// 1. Add State and Functions
const stateCode = `
  // ==========================================
  // TAB 5: EVENTS / HACKATHONS
  // ==========================================
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await api.get('/university/events');
      setEvents(res.data.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleEventUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(\`/university/events/\${editingEvent._id}\`, editingEvent);
      toast.success('Event updated');
      setShowEventModal(false);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to update event');
    }
  };

  // ==========================================
  // TAB 6: FACILITIES
  // ==========================================
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  
  const fetchFacilities = async () => {
    try {
      setLoadingFacilities(true);
      const res = await api.get('/university/facilities');
      setFacilities(res.data.data);
    } catch (err) {
      toast.error('Failed to load facilities');
    } finally {
      setLoadingFacilities(false);
    }
  };

  const handleFacilityAction = async (facId, bookingId, status) => {
    try {
      await api.put(\`/university/facilities/\${facId}/bookings/\${bookingId}\`, { status });
      toast.success(\`Booking \${status}\`);
      fetchFacilities();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  // Trigger correct endpoints on activeTab change
`;
content = content.replace('  // Trigger correct endpoints on activeTab change', stateCode);

// 2. Add to useEffect
content = content.replace(
  '    if (activeTab === \'Suggestions\') fetchSuggestions();',
  '    if (activeTab === \'Suggestions\') fetchSuggestions();\n    if (activeTab === \'Events\') fetchEvents();\n    if (activeTab === \'Facilities\') fetchFacilities();'
);

// 3. Add to Tabs array
content = content.replace(
  '{ id: \'Suggestions\', label: \'Suggestions Moderation\', icon: Lightbulb },',
  `{ id: 'Suggestions', label: 'Suggestions Moderation', icon: Lightbulb },\n          { id: 'Events', label: 'Hackathons & Events', icon: Calendar },\n          { id: 'Facilities', label: 'Facility Requests', icon: Layers },`
);

// 4. Update Ragging UI in Complaints
content = content.replace(
  '<span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border dark:border-slate-850">{c.category}</span>',
  '<span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${c.category === \'Ragging\' ? \'bg-red-500/10 text-red-600 border-red-500/30\' : \'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 dark:border-slate-850\'}`}>{c.category}</span>'
);

// 5. Remove animations
content = content.replace('animate-pulse-slow', '');
content = content.replace('animate-pulse-slow', '');

// 6. Add JSX for Events and Facilities at the end before closing div
const jsxCode = `
        {/* 5. EVENTS / HACKATHONS */}
        {activeTab === 'Events' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Manage Hackathons & Events</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {events.map(ev => (
                <div key={ev._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">{ev.category}</span>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base mt-1">{ev.title}</h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ev.description}</p>
                    <div className="mt-3 text-[10px] text-slate-400 font-bold space-y-1">
                      <div>Date: {new Date(ev.date).toLocaleDateString()}</div>
                      <div>Location: {ev.location}</div>
                      <div>Registered: {ev.registeredStudents?.length || 0} / {ev.slots}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingEvent(ev); setShowEventModal(true); }}
                    className="mt-4 w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold py-2 rounded-xl text-xs transition-colors"
                  >
                    Edit Event Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FACILITIES */}
        {activeTab === 'Facilities' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Facility Booking Requests</h3>
            {facilities.map(fac => (
              <div key={fac._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-base">{fac.name} Bookings</h4>
                <div className="space-y-3">
                  {fac.bookings.length === 0 ? <p className="text-xs text-slate-500">No requests.</p> : fac.bookings.map(b => (
                    <div key={b._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">{b.studentName}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Purpose: {b.purpose}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Date: {new Date(b.bookingDate).toLocaleDateString()} • Status: <span className={b.status === 'Pending' ? 'text-amber-500' : b.status === 'Approved' ? 'text-emerald-500' : 'text-rose-500'}>{b.status}</span></p>
                      </div>
                      {b.status === 'Pending' && (
                        <div className="flex items-center gap-2 mt-3 sm:mt-0">
                          <button onClick={() => handleFacilityAction(fac._id, b._id, 'Approved')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg">Approve</button>
                          <button onClick={() => handleFacilityAction(fac._id, b._id, 'Rejected')} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg">Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EVENT EDIT MODAL */}
        <AnimatePresence>
          {showEventModal && editingEvent && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Edit Event</h3>
                  <button onClick={() => setShowEventModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleEventUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                    <input type="text" value={editingEvent.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-sm outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Location</label>
                    <input type="text" value={editingEvent.location} onChange={e => setEditingEvent({...editingEvent, location: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-sm outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Slots Limit</label>
                    <input type="number" value={editingEvent.slots} onChange={e => setEditingEvent({...editingEvent, slots: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-sm outline-none" required />
                  </div>
                  <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm">Save Changes</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};`;
content = content.replace('      </div>\n    </div>\n  );\n};', jsxCode);

fs.writeFileSync('frontend/src/pages/AdminDashboard.jsx', content);
console.log('AdminDashboard patched successfully');
