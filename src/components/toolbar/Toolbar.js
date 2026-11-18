// Figma: Toolbar 2005:832
import React from 'react';
import DateNav from './DateNav';
import IntervalPicker from './IntervalPicker';
import TrackingButton from './TrackingButton';
import './Toolbar.css';

export default function Toolbar({
  selectedDate,
  availableDates,
  onDateChange,
  isTracking,
  onToggleTracking,
  aggregationInterval = 15,
  onIntervalChange,
}) {
  return (
    <header className="wm-toolbar">
      <DateNav selectedDate={selectedDate} availableDates={availableDates} onDateChange={onDateChange} />
      <div className="wm-toolbar-controls">
        <IntervalPicker value={aggregationInterval} onChange={onIntervalChange} />
        {/* In mock data mode it only switches a flag in the main process (nothing is tracked) */}
        <TrackingButton isTracking={isTracking} onToggle={onToggleTracking} />
      </div>
    </header>
  );
}
