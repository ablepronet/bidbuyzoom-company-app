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