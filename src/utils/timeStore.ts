export const parseStoreTime = (timeString: string): Date => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
};

export const validateAndAdjustTimes = (
  openTime: Date,
  closeTime: Date,
): void => {
  if (closeTime <= openTime) {
    closeTime.setDate(closeTime.getDate() + 1);
  }
};
export const generateTimeSlots = (
  openTime: string,
  closeTime: string,
): string[] => {
  const slots: string[] = [];
  let currentTime = new Date(openTime);
  const openTimeFo = new Date(openTime);
  const adjustedCloseTime = new Date(closeTime);
  if (adjustedCloseTime <= openTimeFo) {
    adjustedCloseTime.setDate(adjustedCloseTime.getDate() + 1);
  }

  while (currentTime < adjustedCloseTime) {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);

    currentTime = new Date(currentTime.getTime() + 30 * 60000);
  }

  return slots;
};
