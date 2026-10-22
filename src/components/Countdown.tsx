import React, { useEffect, useState } from 'react';
import { EVENT_DETAILS } from '../data/eventData';

export type EventStatus = 'upcoming' | 'in-progress' | 'completed';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: EventStatus;
}

export const Countdown: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: 'upcoming',
  });

  useEffect(() => {
    // 28 November 2026, 9:00 AM UTC (Africa/Accra is GMT / UTC+0)
    const startTime = new Date(EVENT_DETAILS.isoDate).getTime();
    // 28 November 2026, 2:00 PM UTC
    const endTime = new Date('2026-11-28T14:00:00Z').getTime();

    const calculate = () => {
      const now = new Date().getTime();

      if (now >= endTime) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          status: 'completed',
        });
        return;
      }

      if (now >= startTime && now < endTime) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          status: 'in-progress',
        });
        return;
      }

      const difference = startTime - now;
      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          status: 'in-progress',
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        status: 'upcoming',
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft.status === 'in-progress') {
    return (
      <div className="inline-flex items-center gap-2.5 px-4 py-2.5 border border-[#7EE647] bg-[#7EE647]/10 text-[#7EE647] font-display font-black text-xs uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-[#7EE647] animate-pulse" />
        <span>SHIFT 1.0 IS IN PROGRESS</span>
      </div>
    );
  }

  if (timeLeft.status === 'completed') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/20 bg-white/5 text-white font-display font-bold text-xs uppercase tracking-wider">
        <span>THANK YOU FOR BEING PART OF SHIFT 1.0</span>
      </div>
    );
  }

  const items = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-3 font-mono text-xs text-neutral-300">
        <span className="text-[#7EE647] uppercase font-sans font-semibold tracking-wider">STARTS IN:</span>
        <div className="flex items-center gap-1.5 tabular-nums">
          <span className="text-white font-bold">{String(timeLeft.days).padStart(2, '0')}d</span>
          <span>:</span>
          <span className="text-white font-bold">{String(timeLeft.hours).padStart(2, '0')}h</span>
          <span>:</span>
          <span className="text-white font-bold">{String(timeLeft.minutes).padStart(2, '0')}m</span>
          <span>:</span>
          <span className="text-[#7EE647] font-bold">{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 4-Column on Desktop/Tablet, 2x2 Grid on Narrow Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center p-3 sm:p-5 bg-[#090a09] border border-white/10 hover:border-[#7EE647]/50 transition-colors shadow-inner"
          >
            <span className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs text-[#7EE647] font-bold tracking-widest mt-1 font-body uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
