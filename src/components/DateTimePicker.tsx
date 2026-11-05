import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModalHeader } from '@/components/ui/modal-header';
interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}
export function DateTimePicker({
  value,
  onChange,
  placeholder,
  label
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);
  // Parse existing value on mount
  useEffect(() => {
    if (value) {
      try {
        const parts = value.split(' ');
        if (parts.length === 2) {
          const [datePart, timePart] = parts;
          const [year, month, day] = datePart.split('/').map(Number);
          const [hours, minutes, seconds] = timePart.split(':').map(Number);
          setSelectedDate(new Date(year, month - 1, day));
          setSelectedTime({
            hours,
            minutes,
            seconds
          });
          setCurrentMonth(new Date(year, month - 1, 1));
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }
  }, [value]);
  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      pickerRef.current &&
      !pickerRef.current.contains(event.target as Node))
      {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  const formatDateTime = (
  date: Date,
  time: {
    hours: number;
    minutes: number;
    seconds: number;
  }) =>
  {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(time.hours).padStart(2, '0');
    const minutes = String(time.minutes).padStart(2, '0');
    const seconds = String(time.seconds).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formatted = formatDateTime(date, selectedTime);
    onChange(formatted);
  };
  const handleTimeChange = (
  field: 'hours' | 'minutes' | 'seconds',
  value: number) =>
  {
    const newTime = {
      ...selectedTime,
      [field]: value
    };
    setSelectedTime(newTime);
    const formatted = formatDateTime(selectedDate, newTime);
    onChange(formatted);
  };
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (Date | null)[] = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };
  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };
  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear());

  };
  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear());

  };
  const monthNames = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-200 hover:bg-white transition-colors w-full">
        
        <Calendar className="w-4 h-4 text-slate-600 flex-shrink-0" />
        <div className="flex-1 text-left">
          {label &&
          <label className="text-xs text-slate-500 font-medium block">
              {label}
            </label>
          }
          <input
            type="text"
            value={value}
            readOnly
            placeholder={placeholder}
            className="bg-transparent text-xs font-medium text-slate-800 outline-none w-full placeholder:text-slate-400 cursor-pointer" />
          
        </div>
      </button>

      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: -10,
            scale: 0.95
          }}
          transition={{
            duration: 0.2
          }}
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
          style={{
            width: '320px'
          }}>
          
            {/* Calendar Header */}
            <ModalHeader
              title={`${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
              onClose={() => setIsOpen(false)}
              size="compact"
              actions={
                <>
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    aria-label="Mois précédent">
                    <ChevronLeft className="w-5 h-5 text-primary-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    aria-label="Mois suivant">
                    <ChevronRight className="w-5 h-5 text-primary-foreground" />
                  </button>
                </>
              }
            />

            {/* Calendar Grid */}
            <div className="p-3">
              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) =>
              <div
                key={day}
                className="text-center text-xs font-semibold text-slate-500 py-1">
                
                    {day}
                  </div>
              )}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, index) =>
              <button
                key={index}
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={`
                      aspect-square rounded-lg text-xs font-medium transition-all
                      ${!day ? 'invisible' : ''}
                      ${isSameDay(day, selectedDate) ? 'bg-blue-600 text-white shadow-md scale-105' : ''}
                      ${isToday(day) && !isSameDay(day, selectedDate) ? 'bg-blue-100 text-blue-700 font-bold' : ''}
                      ${day && !isSameDay(day, selectedDate) && !isToday(day) ? 'hover:bg-slate-100 text-slate-700' : ''}
                    `}>
                
                    {day?.getDate()}
                  </button>
              )}
              </div>
            </div>

            {/* Time Picker */}
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">
                  Heure
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Hours */}
                <div className="flex-1">
                  <input
                  type="number"
                  min="0"
                  max="23"
                  value={selectedTime.hours}
                  onChange={(e) =>
                  handleTimeChange(
                    'hours',
                    Math.min(
                      23,
                      Math.max(0, parseInt(e.target.value) || 0)
                    )
                  )
                  }
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                
                  <div className="text-xs text-slate-500 text-center mt-1">
                    Heures
                  </div>
                </div>

                <span className="text-slate-400 font-bold">:</span>

                {/* Minutes */}
                <div className="flex-1">
                  <input
                  type="number"
                  min="0"
                  max="59"
                  value={selectedTime.minutes}
                  onChange={(e) =>
                  handleTimeChange(
                    'minutes',
                    Math.min(
                      59,
                      Math.max(0, parseInt(e.target.value) || 0)
                    )
                  )
                  }
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                
                  <div className="text-xs text-slate-500 text-center mt-1">
                    Minutes
                  </div>
                </div>

                <span className="text-slate-400 font-bold">:</span>

                {/* Seconds */}
                <div className="flex-1">
                  <input
                  type="number"
                  min="0"
                  max="59"
                  value={selectedTime.seconds}
                  onChange={(e) =>
                  handleTimeChange(
                    'seconds',
                    Math.min(
                      59,
                      Math.max(0, parseInt(e.target.value) || 0)
                    )
                  )
                  }
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                
                  <div className="text-xs text-slate-500 text-center mt-1">
                    Secondes
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between bg-white">
              <button
              onClick={() => {
                const now = new Date();
                setSelectedDate(now);
                setSelectedTime({
                  hours: now.getHours(),
                  minutes: now.getMinutes(),
                  seconds: now.getSeconds()
                });
                onChange(
                  formatDateTime(now, {
                    hours: now.getHours(),
                    minutes: now.getMinutes(),
                    seconds: now.getSeconds()
                  })
                );
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              
                Maintenant
              </button>
              <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
              
                Valider
              </button>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}