import React, { useState } from 'react';
import { IndicatorOfCompromise, IocType } from '../types.ts';
import { Globe, Copy, Check, ShieldAlert, FileCode, UserCheck } from 'lucide-react';

interface IocTableViewProps {
  iocs: IndicatorOfCompromise[];
}

export const IocTableView: React.FC<IocTableViewProps> = ({ iocs }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredIocs = iocs.filter(
    (ioc) => filterType === 'ALL' || ioc.ioc_type === filterType
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getReputationBadge = (rep: IndicatorOfCompromise['reputation']) => {
    switch (rep) {
      case 'MALICIOUS':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'SUSPICIOUS':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'BENIGN':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getIocIcon = (type: IocType) => {
    switch (type) {
      case 'IP':
        return <Globe className="h-3.5 w-3.5 text-cyan-400" />;
      case 'DOMAIN':
      case 'URL':
        return <Globe className="h-3.5 w-3.5 text-indigo-400" />;
      case 'HASH_SHA256':
      case 'HASH_MD5':
        return <FileCode className="h-3.5 w-3.5 text-purple-400" />;
      case 'USER_ACCOUNT':
        return <UserCheck className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1 overflow-x-auto text-xs">
          {['ALL', 'IP', 'DOMAIN', 'URL', 'HASH_SHA256', 'USER_ACCOUNT'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg font-mono transition ${
                filterType === t
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t} ({t === 'ALL' ? iocs.length : iocs.filter((i) => i.ioc_type === t).length})
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          *Values are defanged for safe analyst handling
        </span>
      </div>

      {/* IOC Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
            <tr>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Defanged Value</th>
              <th className="py-2.5 px-3">Reputation</th>
              <th className="py-2.5 px-3">Threat Score</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredIocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No indicators match this category.
                </td>
              </tr>
            ) : (
              filteredIocs.map((ioc) => (
                <tr key={ioc.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      {getIocIcon(ioc.ioc_type)}
                      <span className="font-semibold text-slate-300">{ioc.ioc_type}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 max-w-[280px] truncate text-cyan-300 font-bold">
                    {ioc.defanged_value || ioc.ioc_value}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getReputationBadge(ioc.reputation)}`}>
                      {ioc.reputation}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            ioc.threat_intel_score > 80
                              ? 'bg-rose-500'
                              : ioc.threat_intel_score > 50
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${ioc.threat_intel_score}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-300 font-bold">
                        {ioc.threat_intel_score}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleCopy(ioc.id, ioc.ioc_value)}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                    >
                      {copiedId === ioc.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-slate-400" />
                          <span>Copy Raw</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
