'use client';

import { useState, useEffect } from 'react';
import { ProductGrid, ViewMode } from '@/components/products/ProductGrid';
import { Pagination } from '@/components/common/Pagination';
import { ChevronDown, ChevronUp, X, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_OPTIONS: { mode: ViewMode; cols: number }[] = [
  { mode: '2col', cols: 2 },
  { mode: '3col', cols: 3 },
  { mode: '4col', cols: 4 },
  { mode: '5col', cols: 5 },
];

function GridIcon({ cols }: { cols: number }) {
  const boxes = Array.from({ length: Math.min(cols, 5) });
  return (
    <svg viewBox="0 0 20 10" className="h-3.5 w-5" fill="currentColor">
      {boxes.map((_, i) => {
        const w = 20 / cols - 1;
        const x = i * (20 / cols);
        return <rect key={i} x={x + 0.5} y={0.5} width={w} height={9} rx={0.5} />;
      })}
    </svg>
  );
}

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: 'Above ₹10,000', min: 10000, max: 999999 },
];

const MATERIAL_OPTIONS = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Pearl', 'Gemstone', 'Brass'];
const GENDER_OPTIONS = ['Women', 'Men', 'Unisex', 'Kids'];
const OCCASION_OPTIONS = ['Daily Wear', 'Party', 'Wedding', 'Festival', 'Office', 'Casual'];

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className="w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-all duration-150"
      style={checked ? { backgroundColor: '#B76E79', borderColor: '#B76E79' } : { borderColor: '#d1d5db' }}
    >
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      className="w-4 h-4 flex-shrink-0 rounded-full border flex items-center justify-center transition-all duration-150"
      style={checked ? { borderColor: '#B76E79' } : { borderColor: '#d1d5db' }}
    >
      {checked && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#B76E79' }} />}
    </span>
  );
}

function FilterSection({ id, label, collapsed, toggle, children }: {
  id: string; label: string;
  collapsed: Record<string, boolean>;
  toggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const isOpen = !collapsed[id];
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => toggle(id)}
        className="flex items-center justify-between w-full text-left py-3.5 px-5"
      >
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-gray-800">{label}</span>
        {isOpen
          ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
          : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [perPage, setPerPage] = useState(24);
  const [viewMode, setViewMode] = useState<ViewMode>('4col');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    if (selectedCategories.length === 1) fetchSubcategories(selectedCategories[0]);
    else { setSubcategories([]); setSelectedSubcategories([]); }
  }, [selectedCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedSubcategories, selectedPriceRange, selectedMaterials, selectedGenders, selectedOccasions, inStockOnly, sortBy, perPage]);

  useEffect(() => { fetchProducts(); }, [currentPage, sortBy, perPage, selectedCategories, selectedSubcategories, selectedPriceRange, selectedMaterials, selectedGenders, selectedOccasions, inStockOnly]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
    } catch {}
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/subcategories?categoryId=${categoryId}`);
      const data = await res.json();
      if (data.success) setSubcategories(data.subcategories || []);
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage.toString(), limit: perPage.toString() });
      if (sortBy === 'price-asc') { params.set('sortBy', 'originalPrice'); params.set('sortOrder', 'asc'); }
      else if (sortBy === 'price-desc') { params.set('sortBy', 'originalPrice'); params.set('sortOrder', 'desc'); }
      else { params.set('sortBy', 'createdAt'); params.set('sortOrder', 'desc'); }
      if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
      if (selectedSubcategories.length === 1) params.set('subcategory', selectedSubcategories[0]);
      if (selectedPriceRange !== null) {
        params.set('minPrice', PRICE_RANGES[selectedPriceRange].min.toString());
        params.set('maxPrice', PRICE_RANGES[selectedPriceRange].max.toString());
      }
      if (selectedMaterials.length === 1) params.set('material', selectedMaterials[0]);
      if (selectedGenders.length === 1) params.set('gender', selectedGenders[0]);
      if (selectedOccasions.length === 1) params.set('occasion', selectedOccasions[0]);
      if (inStockOnly) params.set('inStock', 'true');
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCount(data.pagination?.total || data.products?.length || 0);
      } else setProducts([]);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const toggleSection = (id: string) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleCheckbox = (value: string, selected: string[], setSelected: (v: string[]) => void) =>
    setSelected(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);

  const activeFilterCount = selectedCategories.length + selectedSubcategories.length +
    (selectedPriceRange !== null ? 1 : 0) + selectedMaterials.length +
    selectedGenders.length + selectedOccasions.length + (inStockOnly ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]); setSelectedSubcategories([]); setSelectedPriceRange(null);
    setSelectedMaterials([]); setSelectedGenders([]); setSelectedOccasions([]); setInStockOnly(false);
  };

  const SidebarContent = () => (
    <div>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" style={{ color: '#B76E79' }} />
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-gray-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold" style={{ backgroundColor: '#B76E79' }}>
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-[10px] tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors font-medium">
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection id="categories" label="Categories" collapsed={collapsed} toggle={toggleSection}>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCheckbox(cat.id, selectedCategories, setSelectedCategories)} />
              <CheckBox checked={selectedCategories.includes(cat.id)} />
              <span className={`text-sm transition-colors ${selectedCategories.includes(cat.id) ? 'font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
                style={selectedCategories.includes(cat.id) ? { color: '#B76E79' } : {}}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {subcategories.length > 0 && (
        <FilterSection id="subcategories" label="Subcategories" collapsed={collapsed} toggle={toggleSection}>
          <div className="space-y-2.5">
            {subcategories.map((sub) => (
              <label key={sub.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" className="hidden" checked={selectedSubcategories.includes(sub.id)}
                  onChange={() => toggleCheckbox(sub.id, selectedSubcategories, setSelectedSubcategories)} />
                <CheckBox checked={selectedSubcategories.includes(sub.id)} />
                <span className={`text-sm transition-colors ${selectedSubcategories.includes(sub.id) ? 'font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
                  style={selectedSubcategories.includes(sub.id) ? { color: '#B76E79' } : {}}>
                  {sub.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection id="price" label="Price Range" collapsed={collapsed} toggle={toggleSection}>
        <div className="space-y-2.5">
          {PRICE_RANGES.map((range, idx) => (
            <label key={idx} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="price" className="hidden" checked={selectedPriceRange === idx}
                onChange={() => setSelectedPriceRange(selectedPriceRange === idx ? null : idx)} />
              <RadioDot checked={selectedPriceRange === idx} />
              <span className={`text-sm transition-colors ${selectedPriceRange === idx ? 'font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
                style={selectedPriceRange === idx ? { color: '#B76E79' } : {}}>
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection id="material" label="Material" collapsed={collapsed} toggle={toggleSection}>
        <div className="space-y-2.5">
          {MATERIAL_OPTIONS.map((m) => (
            <label key={m} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="hidden" checked={selectedMaterials.includes(m)}
                onChange={() => toggleCheckbox(m, selectedMaterials, setSelectedMaterials)} />
              <CheckBox checked={selectedMaterials.includes(m)} />
              <span className={`text-sm transition-colors ${selectedMaterials.includes(m) ? 'font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
                style={selectedMaterials.includes(m) ? { color: '#B76E79' } : {}}>{m}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection id="gender" label="Gender" collapsed={collapsed} toggle={toggleSection}>
        <div className="space-y-2.5">
          {GENDER_OPTIONS.map((g) => (
            <label key={g} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="hidden" checked={selectedGenders.includes(g)}
                onChange={() => toggleCheckbox(g, selectedGenders, setSelectedGenders)} />
              <CheckBox checked={selectedGenders.includes(g)} />
              <span className={`text-sm transition-colors ${selectedGenders.includes(g) ? 'font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
                style={selectedGenders.includes(g) ? { color: '#B76E79' } : {}}>{g}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection id="occasion" label="Occasion" collapsed={collapsed} toggle={toggleSection}>
        <div className="space-y-2.5">
          {OCCASION_OPTIONS.map((o) => (
            <label key={o} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="hidden" checked={selectedOccasions.includes(o)}
                onChange={() => toggleCheckbox(o, selectedOccasions, setSelectedOccasions)} />
              <CheckBox checked={selectedOccasions.includes(o)} />
              <span className={`text-sm transition-colors ${selectedOccasions.includes(o) ? 'font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
                style={selectedOccasions.includes(o) ? { color: '#B76E79' } : {}}>{o}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection id="availability" label="Availability" collapsed={collapsed} toggle={toggleSection}>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input type="checkbox" className="hidden" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
          <CheckBox checked={inStockOnly} />
          <span className={`text-sm transition-colors ${inStockOnly ? 'font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
            style={inStockOnly ? { color: '#B76E79' } : {}}>In Stock Only</span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      {/* Hero Banner */}
      <div className="relative text-white" style={{ backgroundColor: '#B76E79' }}>
        <div className="max-w-full px-8 py-12 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/50 mb-2">Discover</p>
          <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">Exquisite Collections</h1>
          <p className="text-white/55 text-sm font-light max-w-md mx-auto">
            Timeless elegance, meticulously handcrafted for every occasion.
          </p>
        </div>
      </div>

      {/* Body: Sidebar + Content flush to edges */}
      <div className="flex min-h-screen">

        {/* Desktop Sidebar — flush left edge */}
        <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0 bg-white border-r border-gray-100 self-start sticky top-0 min-h-screen overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-wrap sticky top-0 z-10">
            {/* Mobile filter trigger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase border border-gray-200 px-3 py-1.5 hover:border-[#B76E79] transition-colors"
              style={{ color: '#B76E79' }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full" style={{ backgroundColor: '#B76E79' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Count */}
            <span className="text-[11px] tracking-widest uppercase text-gray-400 hidden lg:block">
              {loading ? '—' : `${totalCount} Designs`}
            </span>

            <div className="flex items-center gap-3 ml-auto flex-wrap">
              {/* Grid toggle */}
              <div className="flex items-center border border-gray-200 overflow-hidden">
                {GRID_OPTIONS.map(({ mode, cols }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    title={`${cols} columns`}
                    className="px-2.5 py-2 transition-colors"
                    style={viewMode === mode ? { backgroundColor: '#B76E79', color: '#fff' } : { color: '#9ca3af' }}
                  >
                    <GridIcon cols={cols} />
                  </button>
                ))}
              </div>

              {/* Per page */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] tracking-widest uppercase text-gray-400 hidden sm:block">Show</span>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="border border-gray-200 bg-white text-[11px] tracking-widest uppercase text-gray-700 px-2 py-1.5 focus:outline-none focus:border-[#B76E79] cursor-pointer"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] tracking-widest uppercase text-gray-400 hidden sm:block">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 bg-white text-[11px] tracking-widest uppercase text-gray-700 px-2 py-1.5 focus:outline-none focus:border-[#B76E79] cursor-pointer"
                >
                  <option value="newest">Latest</option>
                  <option value="price-asc">Price: Low–High</option>
                  <option value="price-desc">Price: High–Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 px-5 pt-4">
              {selectedCategories.map(id => {
                const cat = categories.find(c => c.id === id);
                return cat ? (
                  <span key={id} className="flex items-center gap-1 text-[10px] px-2.5 py-1 border font-semibold tracking-widest uppercase"
                    style={{ borderColor: '#B76E79', color: '#B76E79' }}>
                    {cat.name}
                    <button onClick={() => toggleCheckbox(id, selectedCategories, setSelectedCategories)}><X className="h-2.5 w-2.5" /></button>
                  </span>
                ) : null;
              })}
              {selectedSubcategories.map(id => {
                const sub = subcategories.find(s => s.id === id);
                return sub ? (
                  <span key={id} className="flex items-center gap-1 text-[10px] px-2.5 py-1 border font-semibold tracking-widest uppercase"
                    style={{ borderColor: '#B76E79', color: '#B76E79' }}>
                    {sub.name}
                    <button onClick={() => toggleCheckbox(id, selectedSubcategories, setSelectedSubcategories)}><X className="h-2.5 w-2.5" /></button>
                  </span>
                ) : null;
              })}
              {selectedPriceRange !== null && (
                <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 border font-semibold tracking-widest uppercase"
                  style={{ borderColor: '#B76E79', color: '#B76E79' }}>
                  {PRICE_RANGES[selectedPriceRange].label}
                  <button onClick={() => setSelectedPriceRange(null)}><X className="h-2.5 w-2.5" /></button>
                </span>
              )}
              {selectedMaterials.map(m => (
                <span key={m} className="flex items-center gap-1 text-[10px] px-2.5 py-1 border font-semibold tracking-widest uppercase"
                  style={{ borderColor: '#B76E79', color: '#B76E79' }}>
                  {m}<button onClick={() => toggleCheckbox(m, selectedMaterials, setSelectedMaterials)}><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
              {selectedGenders.map(g => (
                <span key={g} className="flex items-center gap-1 text-[10px] px-2.5 py-1 border font-semibold tracking-widest uppercase"
                  style={{ borderColor: '#B76E79', color: '#B76E79' }}>
                  {g}<button onClick={() => toggleCheckbox(g, selectedGenders, setSelectedGenders)}><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
              {selectedOccasions.map(o => (
                <span key={o} className="flex items-center gap-1 text-[10px] px-2.5 py-1 border font-semibold tracking-widest uppercase"
                  style={{ borderColor: '#B76E79', color: '#B76E79' }}>
                  {o}<button onClick={() => toggleCheckbox(o, selectedOccasions, setSelectedOccasions)}><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
              {inStockOnly && (
                <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 border font-semibold tracking-widest uppercase"
                  style={{ borderColor: '#B76E79', color: '#B76E79' }}>
                  In Stock<button onClick={() => setInStockOnly(false)}><X className="h-2.5 w-2.5" /></button>
                </span>
              )}
            </div>
          )}

          {/* Products grid */}
          <div className="p-5">
            {loading ? (
              <div className={`grid gap-4 ${viewMode === '2col' ? 'grid-cols-2' : viewMode === '3col' ? 'grid-cols-2 sm:grid-cols-3' : viewMode === '5col' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                {[...Array(perPage > 12 ? 12 : perPage)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square mb-3 rounded" />
                    <div className="h-3 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-gray-100 p-16 text-center mt-2">
                <LayoutGrid className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-gray-800 mb-1">No products found</h3>
                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="mt-5 text-[11px] font-semibold tracking-widest uppercase text-white px-6 py-2.5" style={{ backgroundColor: '#B76E79' }}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <ProductGrid products={products} viewMode={viewMode} />
                {totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 overflow-y-auto lg:hidden shadow-2xl"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ backgroundColor: '#B76E79' }}>
                <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-white">Filters</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-white/70 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
