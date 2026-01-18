import React, { useState } from 'react';
import { BookOpen, Lightbulb, ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react';
import { K_STAR } from '../constants';

export const InfoPanel: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    analogy: true,
    science: false,
    details: false
  });
  const [showLearnMore, setShowLearnMore] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
      
      {/* What is happening - Collapsible */}
      <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('analogy')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-amber-900/10 transition-colors"
          aria-expanded={expandedSections.analogy}
        >
          <h4 className="flex items-center gap-2 font-bold text-amber-400">
            <Lightbulb size={16} />
            What is happening?
          </h4>
          {expandedSections.analogy ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.analogy && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-amber-100/90">
              <strong>The Analogy:</strong> Imagine this grid is a network of beliefs or opinions.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-1 text-amber-200/80 text-xs">
              <li><span className="text-rose-400 font-bold">Red Cells</span>: Holding "Opinion A".</li>
              <li><span className="text-blue-400 font-bold">Blue Cells</span>: Holding "Opinion B".</li>
              <li><span className="text-white font-bold">Glowing Cells</span>: The moment of doubt ("The Seam").</li>
            </ul>
            <p className="text-amber-100/90">
              When you change your mind on one thing (flip a cell), it creates a ripple effect.
              Neighboring beliefs must also flip to stay consistent. When the whole grid turns one
              color, the internal conflict is resolved (Annihilation).
            </p>
          </div>
        )}
      </div>

      {/* The Science - Collapsible */}
      <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('science')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-indigo-900/10 transition-colors"
          aria-expanded={expandedSections.science}
        >
          <h4 className="flex items-center gap-2 font-bold text-indigo-300">
            <BookOpen size={16} />
            The Science
          </h4>
          {expandedSections.science ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.science && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-xs">
              Technically, this visualizes the boundary point of structural discontinuity.
              The lattice models a non-orientable topology where understanding emerges discretely
              from continuous information acquisition.
            </p>
            <button
              onClick={() => setShowLearnMore(true)}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
            >
              <ExternalLink size={14} />
              Learn More
            </button>
          </div>
        )}
      </div>

      {/* Technical Details - Collapsible */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('details')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/70 transition-colors"
          aria-expanded={expandedSections.details}
        >
          <h4 className="flex items-center gap-2 font-bold text-zinc-300">
            <Info size={16} />
            Technical Details
          </h4>
          {expandedSections.details ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.details && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Threshold k*</div>
                <div className="font-mono text-lg text-emerald-400 font-bold">
                  {K_STAR.toFixed(3)}
                </div>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Topology</div>
                <div className="font-mono text-lg text-rose-400 font-bold">
                  Toroidal
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLearnMore(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-zinc-100 mb-4">Learn More</h3>
            <div className="space-y-4 text-sm text-zinc-300">
              <p>
                This visualization is based on concepts from topology and discrete mathematics,
                particularly non-orientable surfaces and phase transitions in lattice systems.
              </p>
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-100">Related Topics:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Möbius Strip (one-sided surface)</li>
                  <li>Klein Bottle (non-orientable surface)</li>
                  <li>Toroidal Topology (wrapping boundaries)</li>
                  <li>Percolation Theory</li>
                  <li>Cellular Automata</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-100">External Resources:</h4>
                <a
                  href="https://en.wikipedia.org/wiki/Klein_bottle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs"
                >
                  <ExternalLink size={12} />
                  Wikipedia: Klein Bottle
                </a>
                <a
                  href="https://en.wikipedia.org/wiki/Percolation_theory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs"
                >
                  <ExternalLink size={12} />
                  Wikipedia: Percolation Theory
                </a>
              </div>
            </div>
            <button
              onClick={() => setShowLearnMore(false)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex gap-2 text-xs text-zinc-500 pt-4 border-t border-zinc-800">
         <span>SeamAware.com Prototype</span>
         <span>•</span>
         <span>Mac Mayo</span>
      </div>
    </div>
  );
};