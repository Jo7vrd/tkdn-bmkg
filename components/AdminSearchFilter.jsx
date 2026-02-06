'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export default function AdminSearchFilter({ onSearch }) {
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = (value) => {
    setSearchKeyword(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Cari berdasarkan nama PPK atau ID pengajuan..."
        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );
}
