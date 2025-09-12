import dayjs from 'dayjs';
import { ShiftInfo } from '../types';

export const SHIFTS: ShiftInfo[] = [
  {
    shift: 'first',
    startTime: '06:00',
    endTime: '14:00',
    label: 'Prva smena (06:00 - 14:00)'
  },
  {
    shift: 'second',
    startTime: '14:00',
    endTime: '22:00',
    label: 'Druga smena (14:00 - 22:00)'
  },
  {
    shift: 'third',
    startTime: '22:00',
    endTime: '06:00',
    label: 'Treća smena (22:00 - 06:00)'
  }
];

export const getCurrentShift = (): 'first' | 'second' | 'third' => {
  const now = dayjs();
  const hour = now.hour();

  if (hour >= 6 && hour < 14) {
    return 'first';
  } else if (hour >= 14 && hour < 22) {
    return 'second';
  } else {
    return 'third';
  }
};

export const getShiftInfo = (shift: 'first' | 'second' | 'third'): ShiftInfo => {
  return SHIFTS.find(s => s.shift === shift) || SHIFTS[0];
};

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('DD.MM.YYYY');
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD.MM.YYYY HH:mm');
};

export const getTodayDateString = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const generateShiftRows = (date: string) => {
  return SHIFTS.map(shift => ({
    date,
    shift: shift.shift,
    shiftLabel: shift.label,
    startTime: shift.startTime,
    endTime: shift.endTime
  }));
};
