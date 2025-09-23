import React, { useState, useEffect } from 'react';
import { useBookCategories } from '../hooks/useApi';

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
  initialValues?: {
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
  };
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  initialValues = {}
}) => {
  const [search, setSearch] = useState(initialValues.search || '');
  const [category, setCategory] = useState(initialValues.category || '');
  const [status, setStatus] = useState(initialValues.status || '');
  const [sort, setSort] = useState(initialValues.sort || '');

  const { data: categories } = useBookCategories();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, onSearchChange]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onCategoryChange(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onStatusChange(value);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange(value);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setSort('');
    onSearchChange('');
    onCategoryChange('');
    onStatusChange('');
    onSortChange('');
  };

  const hasActiveFilters = search || category || status || sort;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books, authors..."
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Availability
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Books</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="borrowed">Borrowed</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Default</option>
            <option value="title">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="year">Year (Old to New)</option>
            <option value="year_desc">Year (New to Old)</option>
            <option value="created_at">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;