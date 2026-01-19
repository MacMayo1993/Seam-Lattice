import React, { useState } from 'react';
import { BookOpen, Lightbulb, ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react';
import { K_STAR } from '../constants';

export const InfoPanel: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    analogy: true,
    whyMatters: false,
    theMath: false,
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

      {/* Why This Matters - Collapsible */}
      <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('whyMatters')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-emerald-900/10 transition-colors"
          aria-expanded={expandedSections.whyMatters}
        >
          <h4 className="flex items-center gap-2 font-bold text-emerald-300">
            <Lightbulb size={16} />
            Why This Matters
          </h4>
          {expandedSections.whyMatters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.whyMatters && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-emerald-100/90 font-medium">
              <strong>The Core Question:</strong> How does understanding emerge from information?
            </p>
            <p className="text-xs text-emerald-200/80">
              This simulation models the discrete nature of cognitive breakthroughs ("A-ha moments").
              Key insights:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-1 text-xs text-emerald-200/80">
              <li><strong>Information accumulates continuously</strong> (neighbors influencing neighbors)</li>
              <li><strong>Understanding flips discretely</strong> (cells change state all-at-once)</li>
              <li><strong>There's a threshold</strong> (k*) where enough information triggers change</li>
              <li><strong>Resolution propagates</strong> (one insight leads to others)</li>
            </ul>
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded p-3 mt-3">
              <p className="text-xs font-bold text-emerald-300 mb-2">Real-World Parallels:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-emerald-200/70">
                <li>Learning a difficult concept (suddenly "gets it")</li>
                <li>Paradigm shifts in science (Kuhn's revolutions)</li>
                <li>Opinion change cascades (viral ideas)</li>
                <li>Phase transitions in physics (ice → water)</li>
                <li>Consensus formation in social networks</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* The Math Behind It - Collapsible */}
      <div className="bg-violet-900/20 border border-violet-500/20 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('theMath')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-violet-900/10 transition-colors"
          aria-expanded={expandedSections.theMath}
        >
          <h4 className="flex items-center gap-2 font-bold text-violet-300">
            <BookOpen size={16} />
            The Math Behind It
          </h4>
          {expandedSections.theMath ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.theMath && (
          <div className="px-4 pb-4 space-y-3">
            <div className="space-y-2">
              <p className="text-violet-200 font-bold text-sm">Propagation Rule:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-violet-200/80 ml-2">
                <li>For each active cell at (row, col):</li>
                <li className="ml-4">Flip its own state: +1 → -1 or -1 → +1</li>
                <li className="ml-4">Check 4 neighbors (toroidal wrapping)</li>
                <li className="ml-4">For each neighbor matching OLD state:</li>
                <li className="ml-8">Propagate if: <code className="bg-violet-950/50 px-1 rounded">random() &gt; (k* - bias)</code></li>
              </ol>
            </div>

            <div className="bg-violet-950/30 border border-violet-500/20 rounded p-3">
              <p className="text-violet-300 font-bold text-xs mb-2">Why k* ≈ 0.618?</p>
              <p className="text-xs text-violet-200/80">
                This is the <strong>percolation threshold</strong> for a 2D square lattice with
                entropy-driven propagation. It's related to the golden ratio φ ≈ 1.618 (reciprocal: 1/φ ≈ 0.618).
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-violet-200/70 mt-2 ml-2">
                <li><strong>Below k*:</strong> Cascades die out (subcritical)</li>
                <li><strong>At k*:</strong> Critical point - unpredictable behavior</li>
                <li><strong>Above k*:</strong> Cascades spread indefinitely (supercritical)</li>
              </ul>
            </div>

            <div className="bg-violet-950/30 border border-violet-500/20 rounded p-3">
              <p className="text-violet-300 font-bold text-xs mb-2">Coherence Metric:</p>
              <p className="text-xs font-mono text-violet-200/90 mb-1">
                Coherence = |positive - negative| / total
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-violet-200/70 ml-2">
                <li><strong>1.0:</strong> Perfect order (all same state)</li>
                <li><strong>0.5:</strong> Partial organization</li>
                <li><strong>0.0:</strong> Maximum disorder (perfect 50/50 split)</li>
              </ul>
            </div>
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
                This visualization models <strong>discrete understanding emergence</strong> using concepts
                from topology, percolation theory, and cognitive science.
              </p>

              <div className="bg-indigo-950/50 border border-indigo-500/30 rounded p-3 space-y-2">
                <h4 className="font-bold text-indigo-300 text-sm">The Deep Theory</h4>
                <p className="text-xs text-indigo-200/80">
                  The "seam" represents the <strong>boundary of incompatible states</strong>. In non-orientable
                  topology (like the Klein bottle), you can't consistently define "inside" vs "outside" everywhere.
                  Similarly, this simulation shows how local consistency (cell flips) creates global resolution
                  (annihilation).
                </p>
                <p className="text-xs text-indigo-200/80">
                  This models cognitive breakthroughs: beliefs don't have absolute truth values, understanding
                  involves resolving contradictions, and resolution happens discretely, not gradually.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-100">Related Concepts:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Möbius Strip:</strong> One-sided surface (topology)</li>
                  <li><strong>Klein Bottle:</strong> Non-orientable 4D surface</li>
                  <li><strong>Toroidal Topology:</strong> Wrapping boundaries (this simulation)</li>
                  <li><strong>Percolation Theory:</strong> Critical thresholds in networks</li>
                  <li><strong>Cellular Automata:</strong> Local rules → global patterns</li>
                  <li><strong>Phase Transitions:</strong> Discrete state changes (k* threshold)</li>
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