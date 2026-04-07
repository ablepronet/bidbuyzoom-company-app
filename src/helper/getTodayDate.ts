import moment from 'moment';
import { Sale, SaleDatesResult } from './getTodayTpes';
export const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};
export const getTomorrowDateForPicker = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 1, 0); // ⬅️ key fix for Android
  return date;
};

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  export const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' @ ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };


export const getSaleDates = (sale?: Sale): SaleDatesResult => {
  const { slaeTypeTimeCheck, multiStartDate = [] } = sale || {};

  if (!multiStartDate.length) {
    return { start: null, end: null };
  }

  const formatDate = (d: string) =>
    moment(d).format('MMM DD, YYYY');

  const formatTime = (t?: string) =>
    t && t !== '00:00'
      ? moment(t, ['HH:mm', 'hh:mm A']).format('hh:mm A')
      : null;

  const buildDateTime = (date: string, time?: string) => {
    const formattedTime = formatTime(time);
    return formattedTime
      ? `${formatDate(date)} @ ${formattedTime}`
      : formatDate(date);
  };

  const start = multiStartDate[0];

  switch (slaeTypeTimeCheck) {

    case 'start_end': {
      const end = multiStartDate[1];

      return {
        start: buildDateTime(start.startDate, start.startTime),
        end: end ? buildDateTime(end.startDate, end.startTime) : null,
      };
    }

    case 'single':
      return {
        start: buildDateTime(start.startDate, start.startTime),
        end: start.endTime ? formatTime(start.endTime) : null,
      };

    case 'multiple': {
      const last = multiStartDate[multiStartDate.length - 1];

      return {
        start: buildDateTime(start.startDate, start.startTime),
        end:
          multiStartDate.length > 1
            ? buildDateTime(last.startDate, last.endTime || last.startTime)
            : start.endTime
            ? formatTime(start.endTime)
            : null,
      };
    }

    default:
      return {
        start: buildDateTime(start.startDate, start.startTime),
        end: null,
      };
  }
};