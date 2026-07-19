import React from 'react';
import { Download, FolderOpen, ArrowUpRight, Lock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Resource } from '../types';

interface ResourceLibraryProps {
  userRole: string;
  initialSelectedResourceId?: string;
  onClearInitialSelectedResourceId?: () => void;
}

export default function ResourceLibrary({ userRole, initialSelectedResourceId, onClearInitialSelectedResourceId }: ResourceLibraryProps) {
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeDownloadId, setActiveDownloadId] = React.useState<string | null>(null);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Failed to load resources');
      const data = await res.json();
      setResources(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchResources();
  }, []);

  // Handle highlighting and scrolling for selected resource
  React.useEffect(() => {
    if (initialSelectedResourceId && resources.length > 0) {
      const element = document.getElementById(`resource-item-${initialSelectedResourceId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-2');
          }, 3000);
          onClearInitialSelectedResourceId?.();
        }, 150);
      }
    }
  }, [initialSelectedResourceId, resources]);

  const handleDownload = async (resource: Resource) => {
    if (userRole === 'anonymous') {
      alert("Registration Required: Free downloads require registered accounts. Use the Role Switcher at the top of the screen to sign in as a Reader!");
      return;
    }

    setActiveDownloadId(resource.id);
    try {
      // Trigger API log count
      const res = await fetch(`/api/resources/${resource.id}/download`, { method: 'POST' });
      if (!res.ok) throw new Error('Could not record download');
      
      // Update local state
      await fetchResources();

      // Trigger simulated file browser download of text data
      const dataStr = `--- NEXUS PUBLISHING PREMIUM RESOURCE ---
TITLE: ${resource.title}
AUTHOR: ${resource.author}
DOWNLOAD URL: ${resource.fileUrl}
TYPE: ${resource.type}
COMPILATION DATE: July 2026

This is a real, high-quality technical publishing asset. Keep learning with Nexus!`;
      
      const blob = new Blob([dataStr], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resource.title.toLowerCase().replace(/\s+/g, '_')}_nexus.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Resource download failed:", err);
    } finally {
      setTimeout(() => setActiveDownloadId(null), 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">Opening library inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100/50 text-xs font-semibold animate-pulse">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Exclusive Learning Content</span>
        </div>
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
          Nexus Premium Resource Library
        </h1>
        <p className="font-sans text-sm text-gray-500">
          Gain immediate access to premium blueprints, prompt packs, Excel budget models, and system checklists.
        </p>
      </div>

      {/* Access Gate Alert for Anonymous Users */}
      {userRole === 'anonymous' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-left max-w-xl mx-auto animate-in slide-in-from-top-4 duration-300">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-800">Resource Vault Locked</h4>
            <p className="text-[11px] text-amber-700 leading-normal">
              You are viewing the platform as an <strong>Anonymous Visitor</strong>. Downloads require a free reader account. 
              Simply use the <strong>User Role Switcher</strong> in the top header to select "Registered Reader" to unlock immediately!
            </p>
          </div>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res) => {
          const isDownloading = activeDownloadId === res.id;
          return (
            <div
              key={res.id}
              id={`resource-item-${res.id}`}
              className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left"
            >
              <div className="space-y-3">
                {/* Type Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100/30 rounded-md">
                    {res.type}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 font-bold">{res.fileSize}</span>
                </div>

                <h3 className="font-sans font-bold text-base text-gray-900 leading-snug">{res.title}</h3>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">{res.description}</p>
              </div>

              {/* Action row */}
              <div className="border-t border-gray-50 pt-4 mt-5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider leading-none">Downloads</span>
                  <span className="text-sm font-bold text-gray-800">{res.downloadsCount}</span>
                </div>

                <button
                  onClick={() => handleDownload(res)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 focus:outline-none ${
                    userRole === 'anonymous'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-100 hover:shadow-lg'
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : userRole === 'anonymous' ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Get Free</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
