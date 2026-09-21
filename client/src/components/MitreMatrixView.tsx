import React from 'react';
import { MitreTechnique } from '../types.ts';
import { ExternalLink, ShieldCheck, Crosshair, Bookmark } from 'lucide-react';

interface MitreMatrixViewProps {
  techniques: MitreTechnique[];
}

export const MitreMatrixView: React.FC<MitreMatrixViewProps> = ({ techniques }) => {
  if (techniques.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 text-xs">
        No MITRE ATT&CK techniques mapped for this incident.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Crosshair className="h-4 w-4 text-orange-400" />
            <span>MITRE ATT&CK Enterprise Matrix Mapping</span>
          </h3>
          <p className="text-xs text-slate-400">
            Standardized adversary tactics, techniques, and procedures (TTPs) detected
          </p>
        </div>
        <a
          href="https://attack.mitre.org/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-orange-400 hover:text-orange-300 flex items-center space-x-1 font-mono transition"
        >
          <span>MITRE Matrix Knowledgebase</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {techniques.map((tech) => (
          <div
            key={tech.id}
            className="rounded-xl border border-orange-900/30 bg-slate-900/60 p-4 hover:border-orange-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-orange-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-orange-400 border border-orange-500/30">
                  {tech.technique_id}
                </span>
                <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                  {tech.tactic}
                </span>
              </div>

              <h4 className="mt-2.5 text-xs font-bold text-white line-clamp-2">
                {tech.technique_name}
              </h4>

              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {tech.relevance_note}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                Adversary Technique
              </span>
              <a
                href={tech.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center space-x-1 font-mono transition"
              >
                <span>Documentation</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
