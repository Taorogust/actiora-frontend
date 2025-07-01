// src/components/common/date-range-picker.tsx
import React, { useState } from 'react';
import { DayPicker, DateRange as RangedDate } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface DateRangePickerProps {
  selected: DateRange;
  onChange: (from?: Date, to?: Date) => void;
  className?: string;
  renderAnchor: (opts: { selected: DateRange; onClick: () => void }) => React.ReactNode;
}

export function DateRangePicker({
  selected,
  onChange,
  className = '',
  renderAnchor,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderAnchor({ selected, onClick: () => setOpen(true) })}
      </PopoverTrigger>
      <PopoverContent className={`p-0 ${className}`}>
        <DayPicker
          mode="range"
          selected={selected as RangedDate}
          onSelect={(range) => {
            // `range` may be undefined
            if (range) {
              onChange(range.from, range.to);
              if (range.from && range.to) {
                setOpen(false);
              }
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
