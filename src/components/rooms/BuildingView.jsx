import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloorBlock from './FloorBlock';
import { summarizeFloor } from '../../utils/roomUtils';

/**
 * Signature building visualization — floors stacked vertically.
 * Tapping a floor triggers a quick expand/fade, then navigates to floor view.
 */
export default function BuildingView({ floorSummaries }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);

  // Display top floor first (5 → 1 · 500 → 100 series)
  const ordered = [...floorSummaries].sort((a, b) => b.floorNumber - a.floorNumber);

  const handleSelect = (floorNumber) => {
    if (animating) return;
    setSelected(floorNumber);
    setAnimating(true);
    window.setTimeout(() => {
      navigate(`/rooms/floor/${floorNumber}`);
    }, 320);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border-2 border-nest-navy/25 bg-nest-navy/5 shadow-soft">
        {/* Roof */}
        <div className="border-b border-nest-navy/20 bg-nest-navy px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Building
          </p>
        </div>

        <div className="divide-y border-nest-navy/15">
          {ordered.map((floor) => {
            const summary = summarizeFloor(floor.rooms);
            return (
              <FloorBlock
                key={floor.floorNumber}
                floorNumber={floor.floorNumber}
                rooms={floor.rooms}
                residents={summary.residents}
                vacantBeds={summary.vacantBeds}
                totalRooms={summary.totalRooms}
                selected={selected === floor.floorNumber}
                fading={animating && selected !== floor.floorNumber}
                onSelect={handleSelect}
              />
            );
          })}
        </div>

        {/* Base / ground */}
        <div className="border-t border-nest-navy/20 bg-nest-navy/90 px-4 py-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
            100 – 500 series
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-nest-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-nest-green" /> Full
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-nest-amber" /> Partial
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> Vacant
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> Temporary stay
        </span>
      </div>
    </div>
  );
}
