import React from 'react';
import { Search, X, Filter, Tag, Layers, AlertCircle } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const FilterBar: React.FC = () => {
  const {
    tasks,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    selectedPriority,
    setSelectedPriority,
  } = useTaskContext();

  // Extract all unique tags present across tasks
  const availableTags = React.useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      (t.tags || []).forEach((tag) => set.add(tag));
    });
    return Array.from(set);
  }, [tasks]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedTag !== 'all' ||
    selectedPriority !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setSelectedPriority('all');
  };

  return (
    <div className="bg-[#141722]/80 backdrop-blur-md px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une tâche, sous-tâche, tag..."
          className="w-full bg-[#1b202e] border border-white/10 focus:border-blue-500/80 rounded-md pl-8 pr-7 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Filter */}
        <div className="flex items-center space-x-1 bg-[#1b202e] border border-white/10 px-2 py-1 rounded-md text-slate-300">
          <Layers className="w-3 h-3 text-blue-400" />
          <span className="text-[11px] text-slate-400">Catégorie:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#1b202e] text-slate-200">Toutes</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name} className="bg-[#1b202e] text-slate-200">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div className="flex items-center space-x-1 bg-[#1b202e] border border-white/10 px-2 py-1 rounded-md text-slate-300">
            <Tag className="w-3 h-3 text-pink-400" />
            <span className="text-[11px] text-slate-400">Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1b202e] text-slate-200">Tous les tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag} className="bg-[#1b202e] text-slate-200">
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Priority Filter */}
        <div className="flex items-center space-x-1 bg-[#1b202e] border border-white/10 px-2 py-1 rounded-md text-slate-300">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] text-slate-400">Priorité:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#1b202e] text-slate-200">Toutes</option>
            <option value="urgent" className="bg-[#1b202e] text-red-300">Urgente</option>
            <option value="high" className="bg-[#1b202e] text-orange-300">Haute</option>
            <option value="medium" className="bg-[#1b202e] text-blue-300">Moyenne</option>
            <option value="low" className="bg-[#1b202e] text-slate-300">Basse</option>
          </select>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 px-2 py-1 text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>
    </div>
  );
};
