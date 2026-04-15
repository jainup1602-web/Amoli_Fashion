'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  images: string[];
  originalPrice: number;
  specialPrice?: number;
  category?: { name: string };
}

const RECENT_KEY = 'amoli_recent_searches';

const PLACEHOLDER_WORDS = [
  'Gold Necklace',
  'Diamond Earrings',
  'Silver Bracelet',
  'Bridal Jewellery',
  'Ethnic Rings',
  'Pearl Pendant',
  'Kundan Set',
  'Mangalsutra',
];

// Animated placeholder component
function AnimatedPlaceholder({ visible }: { visible: boolean }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    if (!visible) return;
    let timer: NodeJS.Timeout;

    if (phase === 'in') {
      timer = setTimeout(() => setPhase('hold'), 500);
    } else if (phase === 'hold') {
      timer = setTimeout(() => setPhase('out'), 1800);
    } else {
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % PLACEHOLDER_WORDS.length);
        setPhase('in');
      }, 400);
    }
    return () => clearTimeout(timer);
  }, [phase, visible]);

  if (!visible) return null;

  const style: React.CSSProperties = {
    opacity: phase === 'hold' ? 1 : 0,
    transform: phase === 'in' ? 'translateY(6px)' : phase === 'out' ? 'translateY(-6px)' : 'translateY(0)',
    transition: phase === 'in'
      ? 'opacity 0.4s ease, transform 0.4s ease'
      : phase === 'out'
      ? 'opacity 0.35s ease, transform 0.35s ease'
      : 'none',
  };

  return (
    <span
      className="pointer-events-none select-none absolute left-0 top-0 flex items-center h-full"
      style={style}
      aria-hidden
    >
      <span style={{
        fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: '0.875rem',
        color: '#9CA3AF',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}>
        {PLACEHOLDER_WORDS[index]}
      </span>
    </span>
  );
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=12`);
      const data = await res.json();
      const all: Suggestion[] = data.products || [];

      // Word-boundary filter: "ring" must not match "earring"
      // Match only if query appears at start of a word (not mid-word)
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundary = new RegExp(`(?<![a-zA-Z])${escaped}`, 'i');
      const filtered = all.filter((p) => wordBoundary.test(p.name));

      setSuggestions((filtered.length > 0 ? filtered : all).slice(0, 6));
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const saveRecent = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(0, 5);
    setRecentSearches(updated);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}
  };

  const handleSearch = (q: string = query) => {
    if (!q.trim()) return;
    saveRecent(q.trim());
    setIsOpen(false);
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const handleProductClick = (slug: string, name: string) => {
    saveRecent(name);
    setIsOpen(false);
    setQuery('');
    router.push(`/products/${slug}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  };

  const showDropdown = isOpen && (query.length >= 2 ? suggestions.length > 0 || loading : recentSearches.length > 0);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        className="flex items-center border border-gold/30 bg-white/90 backdrop-blur-sm"
      >
        <Search className="h-4 w-4 text-gray-400 ml-4 flex-shrink-0" />
        <div className="relative flex-1 flex items-center">
          <AnimatedPlaceholder visible={!query} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder=""
            className="search-input w-full px-3 py-2.5 bg-transparent text-sm text-gray-800 focus:outline-none font-light tracking-wide relative z-10"
          />
        </div>
        {query && (
          <button type="button" onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="submit" className="px-4 py-2.5 text-white text-xs font-elegant tracking-widest uppercase transition-colors" style={{ backgroundColor: '#B76E79' }}>
          Search
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gold/20 shadow-2xl z-50 max-h-[480px] overflow-y-auto">
          {/* Recent searches — shown when query is empty */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-[10px] font-elegant tracking-widest uppercase text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Recent
                </span>
                <button onClick={clearRecent} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">Clear</button>
              </div>
              {recentSearches.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(r)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F6F2] text-left transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-light">{r}</span>
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="px-4 py-6 text-center">
              <div className="inline-block w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
            </div>
          )}

          {/* Product suggestions */}
          {!loading && query.length >= 2 && suggestions.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-elegant tracking-widest uppercase text-gray-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Products
                </span>
              </div>
              {suggestions.map((product) => {
                const img = Array.isArray(product.images) ? product.images[0] : '/placeholder.svg';
                const price = product.specialPrice || product.originalPrice;
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.slug, product.name)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8F6F2] text-left transition-colors border-t border-gray-50"
                  >
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 overflow-hidden">
                      <img src={img || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium truncate">{product.name}</p>
                      <p className="text-[11px] text-gray-400 font-elegant tracking-wide">{product.category?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-gray-800">{formatPrice(price)}</p>
                      {product.specialPrice && (
                        <p className="text-[11px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                      )}
                    </div>
                  </button>
                );
              })}
              {/* View all */}
              <button
                onClick={() => handleSearch()}
                className="w-full px-4 py-3 text-center text-xs font-elegant tracking-widest uppercase border-t border-gold/10 hover:bg-[#F8F6F2] transition-colors"
                style={{ color: '#B76E79' }}
              >
                View all results for "{query}"
              </button>
            </div>
          )}

          {/* No results */}
          {!loading && query.length >= 2 && suggestions.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400 font-light">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
