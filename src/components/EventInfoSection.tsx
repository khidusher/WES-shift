import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Calendar, Clock, MapPin, Users, Download, ExternalLink } from 'lucide-react';
import { EVENT_DETAILS, SCHEDULE_FLOW } from '../data/eventData';

export const EventInfoSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Calendar event generator (.ics format)
  const downloadCalendarFile = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SHIFT 1.0//Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'SUMMARY:SHIFT 1.0 — Beyond the Degree',
      'DESCRIPTION:A Christ-centered career\\, purpose and personal development experience designed to help university students look beyond their degrees.',
      'LOCATION:Old Auditorium\\, University of Energy and Natural Resources (UENR)\\, Sunyani\\, Ghana',
      'DTSTART:20261128T090000Z',
      'DTEND:20261128T140000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'SHIFT_1.0_Event.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    'SHIFT 1.0 | Beyond the Degree — Career, Purpose & Legacy'
  )}&dates=20261128T090000Z/20261128T140000Z&details=${encodeURIComponent(
    'A Christ-centered career, purpose and personal development experience. Organized by Worldwide Evangelism Service (WES) in collaboration with UENR SCC.'
  )}&location=${encodeURIComponent(EVENT_DETAILS.venue + ', ' + EVENT_DETAILS.city)}`;

  return (
    <section
      id="venue"
      aria-label="Event Information & Logistics"
      className="py-24 sm:py-32 bg-[#050505] border-t border-white/5 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#7EE647] uppercase">
            SAVE THE DATE
          </span>
          <span className="w-12 h-[2px] bg-[#7EE647]" />
        </motion.div>

        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-16"
        >
          <h2
            className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            YOUR PLACE. YOUR PEOPLE. <br />
            <span className="text-[#7EE647]">YOUR NEXT MOVE.</span>
          </h2>
          <p className="text-base sm:text-xl text-neutral-300 font-body leading-relaxed max-w-2xl">
            Confirmed convocation coordinates for university delegates, young professionals, and mentors.
          </p>
        </motion.div>

        {/* 4 Core Logistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          {/* DATE */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-[#090a09] border border-white/10 hover:border-[#7EE647]/50 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-white/5 w-fit mb-4 text-[#7EE647]">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#7EE647] font-bold uppercase tracking-wider block mb-1">
                DATE
              </span>
              <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                Saturday, 28 November 2026
              </h3>
            </div>
            <p className="text-xs text-neutral-400 font-body pt-2 border-t border-white/5">
              Official event convocation date.
            </p>
          </motion.div>

          {/* TIME */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.08 }}
            className="p-6 bg-[#090a09] border border-white/10 hover:border-[#7EE647]/50 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-white/5 w-fit mb-4 text-[#7EE647]">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#7EE647] font-bold uppercase tracking-wider block mb-1">
                TIME
              </span>
              <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                9:00 AM – 2:00 PM
              </h3>
            </div>
            <p className="text-xs text-neutral-400 font-body pt-2 border-t border-white/5">
              Timezone: Africa/Accra (GMT).
            </p>
          </motion.div>

          {/* VENUE */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.16 }}
            className="p-6 bg-[#090a09] border border-white/10 hover:border-[#7EE647]/50 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-white/5 w-fit mb-4 text-[#7EE647]">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#7EE647] font-bold uppercase tracking-wider block mb-1">
                VENUE
              </span>
              <h3 className="text-lg font-bold text-white mb-1 leading-snug">
                Old Auditorium
              </h3>
              <p className="text-xs text-neutral-300 font-medium font-body mb-2">
                University of Energy and Natural Resources (UENR), Sunyani, Ghana
              </p>
            </div>
            <a
              href={EVENT_DETAILS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7EE647] hover:text-[#90f05d] pt-2 border-t border-white/5 uppercase"
            >
              <span>GET DIRECTIONS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* ORGANIZERS */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.24 }}
            className="p-6 bg-[#090a09] border border-white/10 hover:border-[#7EE647]/50 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-white/5 w-fit mb-4 text-[#7EE647]">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#7EE647] font-bold uppercase tracking-wider block mb-1">
                ORGANIZERS
              </span>
              <h3 className="text-lg font-bold text-white mb-1 leading-snug">
                Worldwide Evangelism Service (WES)
              </h3>
              <p className="text-xs text-neutral-300 font-body">
                In collaboration with UENR SCC
              </p>
            </div>
            <p className="text-xs text-neutral-400 font-body pt-2 border-t border-white/5">
              Campus & Ministry Partnership.
            </p>
          </motion.div>

        </div>

        {/* Schedule Flow & Sync Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Schedule Architecture Flow */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-[#090a09] border border-white/10 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div>
                <span className="text-xs font-mono text-[#7EE647] font-bold uppercase tracking-wider">
                  SCHEDULE ARCHITECTURE
                </span>
                <h4 className="text-xl font-display font-bold text-white">Flow of the Day</h4>
              </div>
              <span className="text-xs font-mono text-neutral-400">9:00 AM – 2:00 PM GMT</span>
            </div>

            <div className="space-y-6">
              {SCHEDULE_FLOW.map((item, idx) => (
                <div key={item.time} className="flex gap-4 items-start group">
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-xs font-bold text-[#7EE647] bg-[#050505] px-2.5 py-1 border border-white/10 shrink-0">
                      {item.time}
                    </span>
                    {idx !== SCHEDULE_FLOW.length - 1 && (
                      <div className="w-[1px] h-10 bg-white/10 my-1 group-hover:bg-[#7EE647]/40 transition-colors" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm mb-1">{item.title}</h5>
                    <p className="text-xs text-neutral-400 leading-relaxed font-body">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sync & Location Action Boxes */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Calendar Integration */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
              className="p-6 bg-[#090a09] border border-white/10 flex flex-col gap-4"
            >
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7EE647]">
                CALENDAR SYNCHRONIZATION
              </span>
              <h4 className="text-base font-display font-bold text-white">
                Reserve Saturday, 28 November 2026
              </h4>
              <p className="text-xs text-neutral-300 font-body leading-relaxed">
                Add the convocation to your digital calendar to receive prompt reminders ahead of check-in at 9:00 AM.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white uppercase tracking-wider transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-[#7EE647]"
                >
                  <span>Google Calendar</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#7EE647]" />
                </a>
                <button
                  type="button"
                  onClick={downloadCalendarFile}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>Download .ICS</span>
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Directions & Campus Navigation */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
              className="p-6 bg-[#090a09] border border-white/10 flex flex-col gap-4"
            >
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7EE647]">
                LOCATION & DIRECTIONS
              </span>
              <h4 className="text-base font-display font-bold text-white">
                University of Energy and Natural Resources
              </h4>
              <p className="text-xs text-neutral-400 font-body leading-relaxed">
                Old Auditorium, UENR Main Campus, Sunyani, Ghana. Delegates arriving from across tertiary institutions are advised to enter via the central campus gate.
              </p>
              <a
                href={EVENT_DETAILS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-display font-bold text-white uppercase tracking-wider transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-[#7EE647]"
              >
                <span>GET DIRECTIONS (GOOGLE MAPS)</span>
                <ExternalLink className="w-4 h-4 text-[#7EE647]" />
              </a>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};
