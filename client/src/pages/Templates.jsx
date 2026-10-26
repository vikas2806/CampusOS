import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Copy,
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Code,
  Compass,
  Cpu,
  Flame,
  Search,
  Filter,
  X
} from 'lucide-react';
import { eventService, clubService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRESET_TEMPLATES = [
  {
    _id: 'preset-hackathon',
    isPreset: true,
    templateName: 'Flagship 24H Hackathon',
    title: 'HackCampus 2026',
    category: 'hackathon',
    description: 'Complete 24-hour sprint blueprint including 3 checkpoint review rounds, mentorship slots, and pitching rubrics.',
    venue: 'Auditorium & Lab Complex',
    capacity: 250,
    rules: 'Teams of 3 to 4. Fresh code only. GitHub repo commits mandatory every 4 hours.',
    tags: ['Tech', 'Coding', 'Overnight', 'Mentorship'],
    scheduleCount: 6,
    customFieldsCount: 4,
  },
  {
    _id: 'preset-workshop',
    isPreset: true,
    templateName: '3-Hour Hands-on Tech Workshop',
    title: 'Fullstack Next.js Deep Dive',
    category: 'workshop',
    description: 'Fast-paced interactive laboratory session with pre-installed boilerplate, live exercises, and Q&A.',
    venue: 'Computing Centre 2',
    capacity: 80,
    rules: 'Personal laptops required with Node.js and VSCode pre-installed. Zero-tolerance piracy.',
    tags: ['Workshop', 'Skill-building', 'Certificate'],
    scheduleCount: 3,
    customFieldsCount: 2,
  },
  {
    _id: 'preset-seminar',
    isPreset: true,
    templateName: 'Industry Keynote & Fireside Chat',
    title: 'Tech Leaders Speaker Series',
    category: 'seminar',
    description: 'Executive speaker session structure with opening remarks, 45-min talk, moderated fireside, and networking tea.',
    venue: 'Management Seminar Hall',
    capacity: 180,
    rules: 'Formal or smart-casual attire. Questions submitted via Slido or live floor mic.',
    tags: ['Keynote', 'Alumni', 'Networking'],
    scheduleCount: 4,
    customFieldsCount: 3,
  },
  {
    _id: 'preset-contest',
    isPreset: true,
    templateName: 'Speed Coding & DSA Challenge',
    title: 'ByteCode Blitz 2026',
    category: 'hackathon',
    description: 'High-intensity 2-hour competitive programming sprint on HackerRank / Codeforces platform.',
    venue: 'Virtual & Lab 1',
    capacity: 120,
    rules: 'Individual contest. Anti-cheating proctoring enforced. Plagiarism checker active.',
    tags: ['Competitive', 'DSA', 'Rankings'],
    scheduleCount: 3,
    customFieldsCount: 2,
  },
  {
    _id: 'preset-cultural',
    isPreset: true,
    templateName: 'Cultural Open Mic & Talent Night',
    title: 'Campus Unplugged: Acoustic & Comedy',
    category: 'cultural',
    description: 'Lively showcase for student musicians, poets, and standup comics with slotted 5-minute performance stages.',
    venue: 'Open Air Amphitheatre',
    capacity: 350,
    rules: 'Performance duration strictly 5-7 mins. PG-13 content guidelines apply.',
    tags: ['Music', 'Open Mic', 'Stage'],
    scheduleCount: 5,
    customFieldsCount: 3,
  },
];

export default function Templates() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dbTemplates, setDbTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected template for preview or instantiate
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [instantiateTemplate, setInstantiateTemplate] = useState(null);
  const [isInstantiating, setIsInstantiating] = useState(false);

  // Form state for instantiating
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    venue: '',
    capacity: 100,
  });

  // Modal for creating custom template
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateData, setNewTemplateData] = useState({
    templateName: '',
    title: '',
    description: '',
    venue: '',
    capacity: 100,
    rules: '',
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await eventService.listTemplates();
      if (res.data?.success) {
        setDbTemplates(res.data.templates || []);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      // Not fatal if empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Combine custom DB templates with preset templates
  const allTemplates = [
    ...dbTemplates.map((t) => ({ ...t, isCustom: true })),
    ...PRESET_TEMPLATES,
  ];

  const filteredTemplates = allTemplates.filter((t) => {
    const nameMatch = (t.templateName || t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!nameMatch) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'custom') return t.isCustom;
    if (activeCategory === 'hackathon') return t.category === 'hackathon' || (t.templateName || '').toLowerCase().includes('hack');
    if (activeCategory === 'workshop') return t.category === 'workshop' || (t.templateName || '').toLowerCase().includes('workshop');
    if (activeCategory === 'cultural') return t.category === 'cultural' || (t.templateName || '').toLowerCase().includes('cultur') || (t.templateName || '').toLowerCase().includes('mic');
    return true;
  });

  const openInstantiateModal = (template) => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekEnd = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
    
    // Format to datetime-local input string YYYY-MM-DDTHH:MM
    const formatDt = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`;
    };

    setFormData({
      title: template.title || template.templateName || 'New Event',
      startDate: formatDt(nextWeek),
      endDate: formatDt(nextWeekEnd),
      venue: template.venue || 'Campus Auditorium',
      capacity: template.capacity || 100,
    });
    setInstantiateTemplate(template);
  };

  const handleInstantiate = async (e) => {
    e.preventDefault();
    if (!instantiateTemplate) return;

    try {
      setIsInstantiating(true);
      setError('');
      setSuccessMsg('');

      let newEventId = null;

      if (instantiateTemplate.isCustom && instantiateTemplate._id) {
        // Real DB template
        const payload = {
          clubId: user?.club?._id || user?.club,
          title: formData.title,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          venue: formData.venue,
          capacity: Number(formData.capacity) || 100,
        };
        const res = await eventService.instantiateTemplate(instantiateTemplate._id, payload);
        if (res.data?.success) {
          newEventId = res.data.event?._id;
        }
      } else {
        // Preset template: create directly via eventService.create
        const payload = {
          clubId: user?.club?._id || user?.club,
          title: formData.title,
          description: instantiateTemplate.description,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          venue: formData.venue,
          capacity: Number(formData.capacity) || 100,
          rules: instantiateTemplate.rules || '',
          isPublic: true,
          status: 'draft',
        };
        const res = await eventService.create(payload);
        if (res.data?.success) {
          newEventId = res.data.event?._id;
        }
      }

      setSuccessMsg('Event created successfully from template!');
      setInstantiateTemplate(null);

      if (newEventId) {
        setTimeout(() => {
          navigate(`/dashboard/events/${newEventId}`);
        }, 800);
      } else {
        fetchTemplates();
      }
    } catch (err) {
      console.error('Failed to instantiate template:', err);
      setError(err.response?.data?.message || 'Failed to create event from template.');
    } finally {
      setIsInstantiating(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      setError('');
      const payload = {
        clubId: user?.club?._id || user?.club,
        templateName: newTemplateData.templateName,
        title: newTemplateData.title || newTemplateData.templateName,
        description: newTemplateData.description,
        venue: newTemplateData.venue,
        capacity: Number(newTemplateData.capacity) || 100,
        rules: newTemplateData.rules,
      };

      const res = await eventService.createTemplate(payload);
      if (res.data?.success) {
        setSuccessMsg('New event template created successfully!');
        setShowCreateModal(false);
        setNewTemplateData({
          templateName: '',
          title: '',
          description: '',
          venue: '',
          capacity: 100,
          rules: '',
        });
        fetchTemplates();
      }
    } catch (err) {
      console.error('Failed to create template:', err);
      setError(err.response?.data?.message || 'Failed to create template.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this custom template?')) return;
    try {
      const res = await eventService.deleteTemplate(templateId);
      if (res.data?.success) {
        setSuccessMsg('Template deleted.');
        fetchTemplates();
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
      setError(err.response?.data?.message || 'Failed to delete template.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1 tracking-wider uppercase">
            <Layers className="w-4 h-4" />
            <span>Blueprint Repository</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Event Templates & Kits
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {allTemplates.length} Available
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Launch campus hackathons, workshops, and symposiums in under 30 seconds with pre-structured schedules, capacities, and rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Template</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Formats' },
            { id: 'hackathon', label: 'Hackathons & Coding' },
            { id: 'workshop', label: 'Workshops & Labs' },
            { id: 'cultural', label: 'Cultural & Fests' },
            { id: 'custom', label: 'My Club Blueprints' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No blueprints found</h3>
          <p className="text-slate-500 text-xs mt-1">Try selecting another filter or create a new template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const isCustom = template.isCustom;
            return (
              <div
                key={template._id}
                className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 p-5 backdrop-blur-sm"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isCustom
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {isCustom ? 'Custom Blueprint' : 'CampusOS Preset'}
                    </span>

                    {isCustom && (
                      <button
                        onClick={() => handleDeleteTemplate(template._id)}
                        title="Delete template"
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {template.templateName || template.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {template.description || 'Quick event foundation ready for immediate customization and deployment.'}
                  </p>

                  {/* Meta Specs */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{template.venue || 'Flexible Venue'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{template.capacity || '100'} Attendees</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {template.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700/50 text-center"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => openInstantiateModal(template)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20"
                  >
                    <span>Use Blueprint</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Instantiate Modal */}
      {instantiateTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Instantiate Blueprint
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Blueprint: <span className="text-indigo-300 font-medium">{instantiateTemplate.templateName || instantiateTemplate.title}</span>
                </p>
              </div>
              <button
                onClick={() => setInstantiateTemplate(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInstantiate} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. HackSprint Spring 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Venue / Room *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Main Auditorium"
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInstantiateTemplate(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInstantiating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  {isInstantiating ? (
                    <span>Creating Event...</span>
                  ) : (
                    <>
                      <span>Launch Event</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  Blueprint Preview
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {previewTemplate.templateName || previewTemplate.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description & Overview
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                  {previewTemplate.description || 'No description provided.'}
                </p>
              </div>

              {previewTemplate.rules && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Event Rules & Guidelines
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 whitespace-pre-wrap">
                    {previewTemplate.rules}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Default Venue
                  </div>
                  <div className="font-semibold text-slate-200">{previewTemplate.venue || 'Campus Auditorium'}</div>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Suggested Capacity
                  </div>
                  <div className="font-semibold text-slate-200">{previewTemplate.capacity || '100'} attendees</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = previewTemplate;
                  setPreviewTemplate(null);
                  openInstantiateModal(target);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Use This Template</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Custom Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Create Custom Blueprint
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTemplateData.templateName}
                  onChange={(e) => setNewTemplateData({ ...newTemplateData, templateName: e.target.value })}
                  placeholder="e.g. Annual Intra-College Quiz Bowl"
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Default Event Title
                </label>
                <input
                  type="text"
                  value={newTemplateData.title}
                  onChange={(e) => setNewTemplateData({ ...newTemplateData, title: e.target.value })}
                  placeholder="e.g. Brainiac 2026: General Quiz"
                  className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={newTemplateData.description}
                  onChange={(e) => setNewTemplateData({ ...newTemplateData, description: e.target.value })}
                  placeholder="Explain the format, target audience, and goals of this event structure..."
                  className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Default Venue
                  </label>
                  <input
                    type="text"
                    value={newTemplateData.venue}
                    onChange={(e) => setNewTemplateData({ ...newTemplateData, venue: e.target.value })}
                    placeholder="e.g. Seminar Hall A"
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Suggested Capacity
                  </label>
                  <input
                    type="number"
                    value={newTemplateData.capacity}
                    onChange={(e) => setNewTemplateData({ ...newTemplateData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Default Rules
                </label>
                <textarea
                  rows="2"
                  value={newTemplateData.rules}
                  onChange={(e) => setNewTemplateData({ ...newTemplateData, rules: e.target.value })}
                  placeholder="Rules, requirements, team sizes, eligibility..."
                  className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25"
                >
                  {isCreating ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
