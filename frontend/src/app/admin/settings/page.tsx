"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { 
  Settings, Mail, CreditCard, Shield, Globe, 
  Terminal, Lock, Unlock, Eye, EyeOff, 
  Save, AlertCircle, Info, CheckCircle2, 
  ChevronRight, Search, RefreshCw, Layers,
  ExternalLink, Network, Database
} from "lucide-react";
import toast from "react-hot-toast";

interface Setting {
  key: string;
  value: string;
  category: string;
  description: string;
  isSecret: boolean;
}

const TABS = [
  { id: "SMTP", label: "SMTP Settings", icon: Mail },
  { id: "PAYMENT", label: "Stripe API", icon: CreditCard },
  { id: "SECURITY", label: "Security & Auth", icon: Shield },
  { id: "INTEGRATIONS", label: "Integrations", icon: Layers },
  { id: "LOGS", label: "Audit Logs", icon: Terminal },
];

export default function SystemConfigurationPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("SMTP");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [testEmail, setTestEmail] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/settings");
      setSettings(data);
    } catch (err) {
      toast.error("Failed to fetch system configurations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdate = async (key: string, value: string) => {
    const original = settings.find(s => s.key === key);
    if (!original) return;

    setSavingKey(key);
    try {
      await api.put(`/admin/settings/${key}`, { 
        value, 
        category: original.category, 
        description: original.description,
        isSecret: original.isSecret
      });
      toast.success(`${key} updated successfully`);
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    } catch (err) {
      toast.error(`Error updating system parameter: ${key}`);
    } finally {
      setSavingKey(null);
    }
  };

  const toggleSecret = (key: string) => {
    setShowSecret(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredSettings = settings.filter(s => {
    const matchesTab = s.category === activeTab || (activeTab === "GENERAL" && !s.category);
    const matchesSearch = s.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleBulkSave = async () => {
    setIsBulkSaving(true);
    try {
      const updates = filteredSettings.map(s => {
        const is2FA = s.key.startsWith("REQUIRE_2FA");
        const el = document.getElementById(`input-${s.key}`) as HTMLInputElement | HTMLSelectElement;
        if (!el) return null;
        let val = "";
        if (is2FA) {
          val = (el as HTMLInputElement).checked ? "true" : "false";
        } else {
          val = el.value;
        }
        if (val !== s.value) {
          return { key: s.key, value: val, category: s.category, description: s.description, isSecret: s.isSecret };
        }
        return null;
      }).filter(Boolean) as any[];

      if (updates.length === 0) {
        toast("No changes detected", { icon: "ℹ️" });
        setIsBulkSaving(false);
        return;
      }

      await Promise.all(updates.map(u => 
        api.put(`/admin/settings/${u.key}`, {
          value: u.value, 
          category: u.category, 
          description: u.description,
          isSecret: u.isSecret
        })
      ));

      setSettings(prev => prev.map(s => {
        const updated = updates.find(u => u.key === s.key);
        return updated ? { ...s, value: updated.value } : s;
      }));
      toast.success(`${updates.length} parameter(s) updated successfully`);
    } catch (err) {
      toast.error("Failed to save some changes. Check inputs.");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const activeTabLabel = TABS.find(t => t.id === activeTab)?.label || "Configuration";

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="size-12 border-4 border-tatt-lime/20 border-t-tatt-lime rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray mt-6">Initializing System Core...</p>
    </div>
  );

  if (user?.systemRole !== "SUPERADMIN") return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <Lock className="size-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-tatt-black italic uppercase tracking-tighter">Access Denied</h2>
      <p className="text-tatt-gray mt-2 font-medium max-w-sm">This sector of the dashboard is restricted to System Super Administrators only.</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans animate-in fade-in duration-700">
      {/* Internal Ribbon Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray mb-3 opacity-60">
            <span>Admin</span>
            <ChevronRight className="size-3" />
            <span>Settings</span>
            <ChevronRight className="size-3" />
            <span className="text-tatt-lime">{activeTabLabel}</span>
          </div>
          <h2 className="text-3xl font-black text-tatt-black tracking-tight leading-none">{activeTabLabel}</h2>
          <p className="text-tatt-gray mt-2 text-sm font-medium">Platform-wide state management and core credentials.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray size-3.5 group-focus-within:text-tatt-lime transition-colors" />
            <input 
              className="w-full lg:w-64 bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-tatt-lime outline-none transition-all placeholder:text-tatt-gray/40 font-bold" 
              placeholder="Filter parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchSettings}
            className="p-2.5 bg-surface border border-border rounded-xl text-tatt-gray hover:text-tatt-lime hover:border-tatt-lime transition-all"
            title="Reload from Source"
          >
            <RefreshCw className="size-4" />
          </button>
          <button 
            onClick={handleBulkSave}
            disabled={isBulkSaving}
            className="bg-tatt-lime text-tatt-black font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-tatt-lime/20 transition-all flex items-center gap-2 active:scale-95 shadow-sm disabled:opacity-50"
          >
             {isBulkSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
             {isBulkSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <nav className="flex flex-wrap gap-1 border-b border-border/50 mb-10 overflow-x-auto scrollbar-hide">
        {TABS.filter(t => t.id !== "LOGS").map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                activeTab === tab.id 
                ? "text-tatt-black" 
                : "text-tatt-gray hover:text-tatt-black opacity-40 hover:opacity-100"
              }`}
            >
              <Icon className={`size-4 ${activeTab === tab.id ? "text-tatt-lime" : ""}`} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tatt-lime animate-in slide-in-from-left duration-300"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        {/* Main Sections */}
        <div className="lg:col-span-12 space-y-8">
          {filteredSettings.length === 0 ? (
            <div className="p-20 bg-surface border border-dashed border-border rounded-[40px] text-center opacity-30">
               <Layers className="size-16 mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">No configurations in this sector.</p>
            </div>
          ) : (
            <>
              <div className="bg-surface border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
              <div className="px-8 py-6 bg-background border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-tatt-lime/10 flex items-center justify-center rounded-xl">
                    {activeTab === "GENERAL" ? <Settings className="size-5 text-tatt-lime" /> : 
                     activeTab === "SMTP" ? <Mail className="size-5 text-tatt-lime" /> :
                     activeTab === "PAYMENT" ? <CreditCard className="size-5 text-tatt-lime" /> :
                     activeTab === "SECURITY" ? <Shield className="size-5 text-tatt-lime" /> :
                     <Globe className="size-5 text-tatt-lime" />}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-tatt-black uppercase tracking-wider">{activeTabLabel} Module</h4>
                    <p className="text-[10px] text-tatt-gray font-bold">Managed Platform Variables</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-tatt-gray opacity-60">Status: Read Only</span>
                </div>
              </div>
              
              <div className="divide-y divide-border/30">
                {filteredSettings.map((s) => {
                  const isRotation = s.key === "PWD_ROTATION_POLICY";
                  const is2FA = s.key.startsWith("REQUIRE_2FA");
                  const isNumber = ["PWD_MIN_LENGTH", "PWD_PREVENT_REUSE_COUNT", "THROTTLE_LIMIT"].includes(s.key);

                  return (
                    <div key={s.key} className="p-8 hover:bg-background/40 transition-colors group">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h5 className="font-mono text-xs font-black text-tatt-black">{s.key}</h5>
                            {s.isSecret && (
                              <div className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-tighter rounded border border-red-500/10">Secret</div>
                            )}
                          </div>
                          <p className="text-xs text-tatt-gray font-medium leading-relaxed max-w-sm">{s.description}</p>
                        </div>
                        
                        <div className="w-full md:w-[320px] space-y-2.5">
                          <label className="text-[9px] font-black text-tatt-gray uppercase tracking-widest flex items-center gap-1.5 ml-1">
                            <Lock className="size-2.5" /> Parameter Value
                          </label>
                          <div className="relative group/input flex gap-2">
                            {isRotation ? (
                              <select 
                                id={`input-${s.key}`}
                                defaultValue={s.value}
                                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold focus:ring-1 focus:ring-tatt-lime outline-none appearance-none cursor-pointer"
                              >
                                <option value="NEVER">NEVER</option>
                                <option value="MONTHLY">MONTHLY</option>
                                <option value="QUARTERLY">QUARTERLY</option>
                                <option value="YEARLY">YEARLY</option>
                              </select>
                            ) : is2FA ? (
                              <div className="flex-1 flex items-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    id={`input-${s.key}`}
                                    defaultChecked={s.value === "true"}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tatt-lime"></div>
                                  <span className="ms-3 text-xs font-black uppercase tracking-widest text-tatt-gray peer-checked:text-tatt-black transition-colors">
                                    {s.value === "true" ? "Mandatory" : "Optional"}
                                  </span>
                                </label>
                              </div>
                            ) : (
                              <input 
                                type={s.isSecret && !showSecret[s.key] ? "password" : (isNumber ? "number" : "text")}
                                defaultValue={s.value}
                                id={`input-${s.key}`}
                                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-xs font-mono focus:ring-1 focus:ring-tatt-lime outline-none transition-all group-hover/input:border-tatt-lime/30"
                              />
                            )}

                            <div className="flex gap-1">
                              {s.isSecret && !isRotation && !is2FA && (
                                <button 
                                  onClick={() => toggleSecret(s.key)}
                                  className="size-10 rounded-xl bg-background border border-border flex items-center justify-center text-tatt-gray hover:text-tatt-black transition-colors"
                                >
                                  {showSecret[s.key] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  let val = "";
                                  const el = document.getElementById(`input-${s.key}`) as HTMLInputElement | HTMLSelectElement;
                                  if (is2FA) {
                                    val = (el as HTMLInputElement).checked ? "true" : "false";
                                  } else {
                                    val = el.value;
                                  }
                                  handleUpdate(s.key, val);
                                }}
                                disabled={savingKey === s.key}
                                className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                                  savingKey === s.key ? "bg-tatt-lime/10 text-tatt-lime" : "bg-tatt-black text-white hover:bg-tatt-lime hover:text-tatt-black shadow-sm"
                                }`}
                              >
                                {savingKey === s.key ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeTab === "SMTP" && (
                <div className="p-8 bg-tatt-lime/5 rounded-2xl border border-tatt-lime/20 mt-6 animate-in slide-in-from-bottom duration-500">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-tatt-black flex items-center gap-2 uppercase tracking-tight">
                        <Mail className="size-4 text-tatt-lime" /> Test Configuration
                      </h4>
                      <p className="text-xs text-tatt-gray font-medium">Send a test email to verify your SMTP settings.</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-3">
                      <input 
                        type="email" 
                        placeholder="test@example.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1 md:w-64 bg-background border border-border rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-tatt-lime outline-none"
                      />
                      <button 
                        onClick={async () => {
                          if (!testEmail) return toast.error("Enter a test email");
                          setTestingSmtp(true);
                          try {
                            const res = await api.post("/admin/settings/test-smtp", { email: testEmail });
                            if (res.data.success) toast.success(res.data.message);
                            else toast.error(res.data.message);
                          } catch (err: any) {
                            toast.error(err.response?.data?.message || "Test failed");
                          } finally {
                            setTestingSmtp(false);
                          }
                        }}
                        disabled={testingSmtp}
                        className="px-6 h-10 bg-tatt-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-tatt-lime hover:text-tatt-black transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        {testingSmtp ? <RefreshCw className="size-3.5 animate-spin" /> : <Layers className="size-3.5" />}
                        Run Test
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>


          </>
          )}
        </div>
      </div>
    </div>
  );
}
