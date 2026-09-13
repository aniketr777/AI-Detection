import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Monitor,
  Server,
  Cpu,
  HardDrive,
  Clock,
  Sparkles,
  Search,
  RefreshCw,
  ExternalLink,
  Award,
  Film,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Info,
  Layers,
  Activity,
  Terminal,
  X,
  CheckCircle2,
  Copy,
  Check,
  BookOpen,
  Bot,
  FileText,
  Share2,
  Code
} from 'lucide-react';

export default function App() {
  const [celebrities, setCelebrities] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Security Mismatch Notification state
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [simulateRemote, setSimulateRemote] = useState(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState('all');

  // Celebrities state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCeleb, setSelectedCeleb] = useState(null);

  // Blogs state
  const [selectedBlogCategory, setSelectedBlogCategory] = useState('All');
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [copiedCite, setCopiedCite] = useState(false);

  // Diagnostics state
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [browserDetails, setBrowserDetails] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);

  // Capture client-side browser properties
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBrowserDetails({
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        colorDepth: `${window.screen.colorDepth}-bit`,
        pixelRatio: `${window.devicePixelRatio || 1}x`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled ? 'Enabled' : 'Disabled',
        onlineStatus: navigator.onLine ? 'Online' : 'Offline',
        language: navigator.language || 'en-US'
      });
    }
  }, []);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

  const fetchData = async (overrideSimulate = simulateRemote) => {
    const startTime = performance.now();
    try {
      setRefreshing(true);
      setError(null);

      const simQuery = overrideSimulate ? '?simulate_remote=true' : '';
      // Fetch celebrities, blogs, and client info in parallel
      const [celebRes, infoRes, blogRes] = await Promise.all([
        fetch(`${API_BASE}/api/celebs`),
        fetch(`${API_BASE}/api/client-info${simQuery}`),
        fetch(`${API_BASE}/api/blogs`)
      ]);

      if (!celebRes.ok || !infoRes.ok) {
        throw new Error('Failed to retrieve data from server.');
      }

      const celebData = await celebRes.json();
      const infoData = await infoRes.json();
      const blogData = blogRes.ok ? await blogRes.json() : { blogs: [] };

      setCelebrities(celebData.celebrities || []);
      setClientInfo(infoData);
      setBlogs(blogData.blogs || []);
      setLastRefreshed(new Date().toLocaleTimeString());
      setLatencyMs(Math.round(performance.now() - startTime));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Could not connect to Node.js backend');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleSimulate = () => {
    const nextState = !simulateRemote;
    setSimulateRemote(nextState);
    setDismissedAlert(false);
    fetchData(nextState);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Celebrities
  const filteredCelebrities = useMemo(() => {
    return celebrities.filter((celeb) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        celeb.category.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        celeb.name.toLowerCase().includes(query) ||
        celeb.role.toLowerCase().includes(query) ||
        celeb.nationality.toLowerCase().includes(query) ||
        celeb.tags?.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [celebrities, selectedCategory, searchQuery]);

  // Filtered Blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCat =
        selectedBlogCategory === 'All' ||
        blog.category.toLowerCase() === selectedBlogCategory.toLowerCase();
      const query = blogSearchQuery.toLowerCase();
      const matchesQuery =
        !query ||
        blog.title.toLowerCase().includes(query) ||
        blog.summary.toLowerCase().includes(query) ||
        blog.author.name.toLowerCase().includes(query) ||
        blog.tags?.some((t) => t.toLowerCase().includes(query));

      return matchesCat && matchesQuery;
    });
  }, [blogs, selectedBlogCategory, blogSearchQuery]);

  const categories = ['All', 'Film & TV', 'Music', 'Sports'];
  const blogCategories = ['All', 'Agentic AI', 'LLM Reliability', 'Multimodal AI', 'Edge Computing'];

  const handleCopyIp = () => {
    if (clientInfo?.client?.ip) {
      navigator.clipboard.writeText(clientInfo.client.ip);
      setCopiedHeader(true);
      setTimeout(() => setCopiedHeader(false), 2000);
    }
  };

  const handleCopyCitation = (blog) => {
    const citation = `"${blog.title}" by ${blog.author.name} (${new Date(blog.publishedAt).getFullYear()}). OmniPulse AI Research.`;
    navigator.clipboard.writeText(citation);
    setCopiedCite(true);
    setTimeout(() => setCopiedCite(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0b0f19]/85 border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  OmniPulse
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Hub
                </span>
              </div>
              <p className="text-xs text-slate-400">Celebrity Radar • AI Research • Machine Diagnostics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${error ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-slate-300 font-medium">
                {error ? 'Server Offline' : 'Node.js Active'}
              </span>
              {latencyMs !== null && !error && (
                <span className="text-slate-500 border-l border-slate-700 pl-2">
                  {latencyMs}ms
                </span>
              )}
            </div>

            {/* Device Origin Verification Badge */}
            {clientInfo?.security && (
              <div
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  clientInfo.security.mismatchDetected
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                }`}
                title={clientInfo.security.message}
              >
                {clientInfo.security.mismatchDetected ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Remote Access ({clientInfo.security.clientIp})</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Physical Device Verified</span>
                  </>
                )}
              </div>
            )}

            {/* Quick Filter Section Tabs */}
            <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Views
              </button>
              <button
                onClick={() => setActiveTab('celebs')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'celebs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Celebrities
              </button>
              <button
                onClick={() => setActiveTab('blogs')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'blogs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AI Blog
              </button>
              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'diagnostics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Diagnostics
              </button>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full flex-1 flex flex-col gap-12">
        {/* Security Notification: Non-Physical Device Access Detected */}
        {clientInfo?.security?.mismatchDetected && !dismissedAlert && (
          <div className="relative rounded-2xl bg-gradient-to-r from-amber-950/90 via-red-950/80 to-slate-900 border border-amber-500/50 p-4 sm:p-5 shadow-2xl shadow-amber-500/10 animate-in slide-in-from-top duration-300">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-amber-300">
                      Security Alert: Remote / External Device Access Detected
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                      IP Mismatch
                    </span>
                    {clientInfo.security.simulated && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Test Simulation Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    This website was accessed from a device with IP address{' '}
                    <strong className="font-mono text-amber-300 bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-500/30">
                      {clientInfo.security.clientIp}
                    </strong>
                    , which <strong>does not match</strong> the designated physical device IP (
                    <span className="font-mono text-slate-300">{clientInfo.security.primaryPhysicalIp}</span>).
                  </p>
                  <div className="pt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                    <span className="bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
                      Visitor OS: <strong className="text-white">{clientInfo.client?.os || 'Unknown'}</strong>
                    </span>
                    <span className="bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
                      Visitor Device: <strong className="text-white">{clientInfo.client?.deviceType || 'Desktop'}</strong>
                    </span>
                    <span className="bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
                      Visitor Browser: <strong className="text-white">{clientInfo.client?.browser || 'Unknown'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setDismissedAlert(true)}
                  className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error banner if backend unavailable */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3">
            <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-200">Unable to reach Node.js backend</p>
              <p className="mt-0.5 text-red-300/80">
                Attempted to fetch from <code className="bg-red-950/60 px-1.5 py-0.5 rounded text-red-200">{API_BASE || 'http://localhost:5000'}</code>.
                Ensure your backend is running and that <code className="bg-red-950/60 px-1.5 py-0.5 rounded text-red-200">VITE_API_BASE_URL</code> is set in Vercel environment variables.
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1: POPULAR CELEBRITIES SHOWCASE                       */}
        {/* ------------------------------------------------------------- */}
        {(activeTab === 'all' || activeTab === 'celebs') && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Popular Icons</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Trending Celebrities
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Worldwide cultural icons, film legends, record-breaking musicians, and sports stars.
                </p>
              </div>

              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search celebrity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-56 pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Celebrities Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-72 rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredCelebrities.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-8">
                <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-semibold">No celebrities found</p>
                <p className="text-xs text-slate-500 mt-1">Try changing your search query or selected category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCelebrities.map((celeb) => (
                  <div
                    key={celeb.id}
                    onClick={() => setSelectedCeleb(celeb)}
                    className="group relative rounded-2xl overflow-hidden bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col cursor-pointer"
                  >
                    {/* Image container */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                      <img
                        src={celeb.image}
                        alt={celeb.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Category badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-slate-900/90 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                          {celeb.category}
                        </span>
                      </div>

                      {/* Nationality badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/60 text-slate-300 border border-slate-700/60 backdrop-blur-md">
                          {celeb.nationality}
                        </span>
                      </div>

                      {/* Name and Role on image overlay */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                          {celeb.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-300 mt-0.5 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>{celeb.role}</span>
                        </p>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {celeb.bio}
                      </p>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                        <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/50">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                            Net Worth
                          </span>
                          <span className="text-emerald-400 font-bold mt-0.5 block">
                            {celeb.netWorth}
                          </span>
                        </div>
                        <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/50">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                            Social Reach
                          </span>
                          <span className="text-indigo-300 font-bold mt-0.5 block truncate">
                            {celeb.socialFollowers}
                          </span>
                        </div>
                      </div>

                      {/* Tags & Action */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-wrap gap-1.5">
                          {celeb.tags?.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/70 text-slate-400 border border-slate-700/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <span className="text-xs font-medium text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 transition-colors">
                          Details <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: AI TECH INSIGHTS & CRAWLABLE KNOWLEDGE BASE       */}
        {/* ------------------------------------------------------------- */}
        {(activeTab === 'all' || activeTab === 'blogs') && (
          <section className="space-y-6 pt-6 border-t border-slate-800/80">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Engineering Hub</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Crawlable by AI Agents</span>
                  </span>
                  <a
                    href={`${API_BASE}/llms.txt`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                  >
                    <FileText className="w-3 h-3 text-cyan-400" />
                    <span>llms.txt</span>
                  </a>
                  <a
                    href={`${API_BASE}/api/blogs/crawlable`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                  >
                    <Code className="w-3 h-3 text-emerald-400" />
                    <span>Raw JSON Feed</span>
                  </a>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  AI Tech Insights & Research
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Technical deep-dives on Agentic AI, production RAG grounding, and multimodal reasoning—optimized for crawlers and LLM readers.
                </p>
              </div>

              {/* Search and Category Filters for Blogs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search AI articles..."
                    value={blogSearchQuery}
                    onChange={(e) => setBlogSearchQuery(e.target.value)}
                    className="w-full sm:w-56 pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex flex-wrap items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                  {blogCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedBlogCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        selectedBlogCategory === cat
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog.id}
                  onClick={() => setSelectedBlog(blog)}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {blog.category}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blog.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight leading-snug">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {blog.summary}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={blog.author.avatar}
                        alt={blog.author.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{blog.author.name}</p>
                        <p className="text-[10px] text-slate-500">{blog.author.role}</p>
                      </div>
                    </div>

                    <span className="text-xs font-medium text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 transition-colors">
                      Read Paper <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 3: REQUESTING MACHINE & SERVER DIAGNOSTICS            */}
        {/* ------------------------------------------------------------- */}
        {(activeTab === 'all' || activeTab === 'diagnostics') && (
          <section className="space-y-6 pt-6 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mb-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Request & Machine Inspector</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Client & Server Intelligence
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Real-time parameters captured from the requesting machine, HTTP headers, and host server hardware specs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Simulator switch */}
                <button
                  onClick={handleToggleSimulate}
                  className={`flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    simulateRemote
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Test how the dashboard alerts when accessed from a different mobile/laptop IP"
                >
                  <AlertTriangle className={`w-3.5 h-3.5 ${simulateRemote ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{simulateRemote ? 'Test Mismatch (Active)' : 'Test Mismatch Alert'}</span>
                </button>

                {lastRefreshed && (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last updated at {lastRefreshed}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Diagnostic Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 1. Requesting Client Machine Info */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-lg shadow-black/20">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Requesting Machine</h4>
                        <p className="text-[11px] text-slate-400">Client identity & device specs</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                      {clientInfo?.client?.deviceType || 'Client'}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3.5 text-xs">
                    {/* Device Origin Verification Status */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                      clientInfo?.security?.mismatchDetected
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        {clientInfo?.security?.mismatchDetected ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span>
                          {clientInfo?.security?.mismatchDetected
                            ? 'Remote Device IP (Mismatch)'
                            : 'Physical Device IP (Verified Match)'}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 border border-slate-700">
                        {clientInfo?.security?.mismatchDetected ? 'Remote' : 'Physical'}
                      </span>
                    </div>

                    {/* IP Address */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                          Client IP Address
                        </span>
                        <button
                          onClick={handleCopyIp}
                          title="Copy IP Address"
                          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedHeader ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm font-mono font-semibold text-emerald-400 mt-1 break-all">
                        {clientInfo?.client?.ip || 'Detecting...'}
                      </p>
                    </div>

                    {/* OS and Browser */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                          Operating System
                        </span>
                        <p className="font-semibold text-slate-200 mt-0.5 truncate">
                          {clientInfo?.client?.os || 'Detecting...'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                          Browser
                        </span>
                        <p className="font-semibold text-slate-200 mt-0.5 truncate">
                          {clientInfo?.client?.browser || 'Detecting...'}
                        </p>
                      </div>
                    </div>

                    {/* Screen & Display metrics */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                        Display & Viewport
                      </span>
                      <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                        <span className="text-slate-400">Resolution:</span>
                        <span className="text-right font-mono text-slate-200">
                          {browserDetails.screenWidth} x {browserDetails.screenHeight}
                        </span>
                        <span className="text-slate-400">Color Depth:</span>
                        <span className="text-right font-mono text-slate-200">
                          {browserDetails.colorDepth}
                        </span>
                        <span className="text-slate-400">Pixel Ratio:</span>
                        <span className="text-right font-mono text-slate-200">
                          {browserDetails.pixelRatio}
                        </span>
                      </div>
                    </div>

                    {/* Client Localization */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          Timezone
                        </span>
                        <p className="font-mono text-[11px] text-slate-300 mt-0.5 truncate">
                          {browserDetails.timezone || 'UTC'}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          Language
                        </span>
                        <p className="font-mono text-[11px] text-slate-300 mt-0.5 truncate">
                          {clientInfo?.client?.primaryLanguage || browserDetails.language || 'en-US'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Method: <strong className="text-slate-300">{clientInfo?.client?.method || 'GET'}</strong></span>
                  <span>Protocol: <strong className="text-slate-300">{clientInfo?.client?.httpVersion || 'HTTP/1.1'}</strong></span>
                </div>
              </div>

              {/* 2. HTTP Request Headers & Protocol */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-lg shadow-black/20">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Terminal className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">HTTP Request Headers</h4>
                        <p className="text-[11px] text-slate-400">Incoming network payload headers</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                      HTTP/1.1
                    </span>
                  </div>

                  {/* Headers list */}
                  <div className="mt-5 space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] uppercase font-mono text-purple-400 font-semibold block">
                        user-agent
                      </span>
                      <p className="text-[11px] text-slate-300 font-mono mt-1 break-words line-clamp-3 leading-relaxed">
                        {clientInfo?.client?.headers?.['user-agent'] || 'Loading user agent...'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] uppercase font-mono text-purple-400 font-semibold block">
                        host
                      </span>
                      <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                        {clientInfo?.client?.headers?.host || 'localhost:5000'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] uppercase font-mono text-purple-400 font-semibold block">
                          sec-ch-platform
                        </span>
                        <p className="text-[11px] text-slate-300 font-mono mt-0.5 truncate">
                          {clientInfo?.client?.headers?.['sec-ch-ua-platform'] || '"Windows"'}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] uppercase font-mono text-purple-400 font-semibold block">
                          connection
                        </span>
                        <p className="text-[11px] text-slate-300 font-mono mt-0.5 truncate">
                          {clientInfo?.client?.headers?.connection || 'keep-alive'}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] uppercase font-mono text-purple-400 font-semibold block">
                        accept-language
                      </span>
                      <p className="text-[11px] text-slate-300 font-mono mt-0.5 truncate">
                        {clientInfo?.client?.headers?.['accept-language'] || 'en-US,en;q=0.9'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Secure (HTTPS): <strong className="text-slate-300">{clientInfo?.client?.secure ? 'Yes' : 'No'}</strong></span>
                  <span>Path: <strong className="text-slate-300 font-mono">/api/client-info</strong></span>
                </div>
              </div>

              {/* 3. Host Server Specs & Performance */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-lg shadow-black/20">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Server className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Target Server Host</h4>
                        <p className="text-[11px] text-slate-400">Node.js execution environment</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      Port {clientInfo?.server?.serverPort || 5000}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-xs">
                    {/* Hostname & Node Version */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          Hostname
                        </span>
                        <p className="font-mono text-sm font-semibold text-slate-200 mt-0.5">
                          {clientInfo?.server?.hostname || 'CLOUD-HOST'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          Node Engine
                        </span>
                        <p className="font-mono text-xs font-semibold text-emerald-400 mt-0.5">
                          {clientInfo?.server?.nodeVersion || 'v20+'}
                        </p>
                      </div>
                    </div>

                    {/* CPU Model & Cores */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-indigo-400" /> CPU Specs
                        </span>
                        <span className="font-mono text-[11px] text-indigo-300 font-semibold">
                          {clientInfo?.server?.cpuCount || 1} Cores ({clientInfo?.server?.architecture || 'x64'})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium truncate">
                        {clientInfo?.server?.cpuModel || 'Server Processor'}
                      </p>
                    </div>

                    {/* Memory Usage Bar */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-amber-400" /> RAM Utilization
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-amber-400">
                          {clientInfo?.server?.memoryUsagePercent || '0%'}
                        </span>
                      </div>

                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-amber-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: clientInfo?.server?.memoryUsagePercent || '50%'
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Used: {clientInfo?.server?.usedMemoryMB?.toLocaleString() || 0} MB</span>
                        <span>Total: {clientInfo?.server?.totalMemoryMB?.toLocaleString() || 0} MB</span>
                      </div>
                    </div>

                    {/* Uptime metrics */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          System Uptime
                        </span>
                        <p className="font-mono text-[11px] text-slate-300 mt-0.5 truncate">
                          {clientInfo?.server?.systemUptime || 'N/A'}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          Process PID
                        </span>
                        <p className="font-mono text-[11px] text-slate-300 mt-0.5">
                          #{clientInfo?.server?.processPid || '1'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>OS: <strong className="text-slate-300">{clientInfo?.server?.osType} ({clientInfo?.server?.platform})</strong></span>
                  <span>Env: <strong className="text-emerald-400">{clientInfo?.server?.environment || 'production'}</strong></span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* CELEBRITY DETAIL MODAL                                        */}
      {/* ------------------------------------------------------------- */}
      {selectedCeleb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCeleb(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-black/90 transition-all cursor-pointer backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Image */}
            <div className="relative h-64 w-full bg-slate-950 shrink-0">
              <img
                src={selectedCeleb.image}
                alt={selectedCeleb.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-sm">
                    {selectedCeleb.category}
                  </span>
                  <span className="text-xs text-slate-300">
                    {selectedCeleb.nationality} • Born {selectedCeleb.birthYear}
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  {selectedCeleb.name}
                </h3>
                <p className="text-sm font-medium text-indigo-300 mt-0.5">
                  {selectedCeleb.role}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
              <div>
                <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Biography & Background
                </h5>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {selectedCeleb.bio}
                </p>
              </div>

              {selectedCeleb.quote && (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 italic text-indigo-200 text-sm">
                  "{selectedCeleb.quote}"
                </div>
              )}

              <div>
                <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-indigo-400" />
                  <span>Notable Works & Franchises</span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCeleb.notableWorks?.map((work, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-200 border border-slate-700/60"
                    >
                      {work}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Key Accolades & Honours</span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCeleb.awards?.map((award, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      ★ {award}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] uppercase font-semibold text-slate-500 block">
                    Estimated Net Worth
                  </span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 block">
                    {selectedCeleb.netWorth}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] uppercase font-semibold text-slate-500 block">
                    Global Reach
                  </span>
                  <span className="text-lg font-bold text-indigo-300 mt-1 block">
                    {selectedCeleb.socialFollowers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AI BLOG READER MODAL (WITH CRAWLABLE SCHEMA PREVIEW)           */}
      {/* ------------------------------------------------------------- */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-black/90 transition-all cursor-pointer backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="p-6 pb-5 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-600 text-white shadow-sm">
                  {selectedBlog.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedBlog.readTime}
                </span>
                <span className="text-xs text-slate-400">• Published {new Date(selectedBlog.publishedAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                {selectedBlog.title}
              </h3>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedBlog.author.avatar}
                    alt={selectedBlog.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{selectedBlog.author.name}</p>
                    <p className="text-[11px] text-slate-400">{selectedBlog.author.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCitation(selectedBlog)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedCite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCite ? 'Copied' : 'Cite Article'}</span>
                  </button>
                  <a
                    href={`${API_BASE}/api/blogs/${selectedBlog.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors"
                  >
                    <span>Raw JSON</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[10px] block">
                  Executive Summary
                </span>
                <p className="text-slate-300 italic">{selectedBlog.summary}</p>
              </div>

              {/* Formatted Markdown Content */}
              <div className="space-y-4 text-slate-200">
                {selectedBlog.content.split('\n\n').map((para, i) => {
                  if (para.startsWith('## ')) {
                    return (
                      <h4 key={i} className="text-lg font-bold text-white pt-2 border-b border-slate-800 pb-1">
                        {para.replace('## ', '')}
                      </h4>
                    );
                  }
                  if (para.startsWith('### ')) {
                    return (
                      <h5 key={i} className="text-sm font-bold text-cyan-300 pt-1">
                        {para.replace('### ', '')}
                      </h5>
                    );
                  }
                  if (para.startsWith('```')) {
                    return (
                      <pre key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                        {para.replace(/```[a-z]*/g, '')}
                      </pre>
                    );
                  }
                  return (
                    <p key={i} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs uppercase font-semibold text-slate-400 block mb-2">
                  Keywords & Crawl Taxonomy
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedBlog.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-cyan-300 border border-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Structured Schema.org Preview */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-semibold text-slate-400 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                    Schema.org JSON-LD Metadata (Crawlable Spec)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Verified Crawlable</span>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
                  {JSON.stringify(selectedBlog.schemaOrg, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>OmniPulse Dashboard • Express Node.js & React 19 • Designed for Human & AI Exploration</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href={`${API_BASE}/llms.txt`} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              llms.txt
            </a>
            <a href={`${API_BASE}/robots.txt`} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              robots.txt
            </a>
            <a href={`${API_BASE}/api/blogs/crawlable`} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              AI Feed (JSON)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
