// src/components/common/search-input.tsx
import { forwardRef, InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

export const SearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      ref={ref}
      {...props}
      type="search"
      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dp-blue w-full sm:w-64"
    />
  </div>
));

SearchInput.displayName = 'SearchInput';
