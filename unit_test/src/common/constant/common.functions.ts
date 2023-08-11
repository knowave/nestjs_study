import { formatInTimeZone } from 'date-fns-tz';

export function getKoreaTimeByDate(date?: Date) {
  const koreaTime = formatInTimeZone(
    date ?? new Date(),
    'Asia/Seoul',
    'yyyy-MM-dd HH:mm:ss',
  );

  const parsedKoreaTime = Date.parse(koreaTime);

  return parsedKoreaTime;
}
