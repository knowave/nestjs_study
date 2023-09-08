import { formatInTimeZone } from 'date-fns-tz';

export function getLastDayOfMonth(year: number, month: number) {
  // month 파라미터는 0부터 시작하므로 1을 빼줍니다.
  month--;

  // 해당 월의 마지막 날짜를 구하기 위해 현재 달의 다음 달의 첫 번째 날짜를 가져옵니다.
  const nextMonth = new Date(year, month + 1, 1);

  // 다음 달의 첫 번째 날짜의 하루 전인 현재 달의 마지막 날짜를 반환합니다.
  return new Date(+nextMonth - 1).getDate();
}

export function getYearAndMonth(target: string) {
  const day = new Date(target);
  const year = day.getFullYear();
  const month = ('0' + (1 + day.getMonth())).slice(-2);
  const date = ('0' + day.getDate()).slice(-2);

  return year + month + date;
}

export function getKoreaTime() {
  const date = new Date();
  const koreaTime = formatInTimeZone(
    date,
    'Asia/Seoul',
    'yyyy-MM-dd HH:mm:ss zzz',
  );

  return koreaTime;
}

export function getTodayDate() {
  const date = new Date(getKoreaTimeByDate());
  const year = date.getFullYear();
  const month = ('0' + (1 + date.getMonth())).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return year + month + day;
}

export function getKoreaTimeByDate(date?: Date) {
  const koreaTime = formatInTimeZone(
    date ?? new Date(),
    'Asia/Seoul',
    'yyyy-MM-dd HH:mm:ss',
  );

  const parsedKoreaTime = Date.parse(koreaTime);

  return parsedKoreaTime;
}

export function createPaymentCode(imp_uid: string) {
  return getTodayDate() + '-' + imp_uid.slice(-12);
}

export function checkAvailableDate(startDate: Date, endDate: Date) {
  try {
    const now = new Date(getKoreaTimeByDate());

    // 경우 1. 할인 기간이 없는경우
    if (!(startDate || endDate)) return true;

    // 경우 2. 시작날만 있는 경우
    if (startDate && !endDate && now.getTime() >= startDate.getTime())
      return true;

    // 경우 3. 마지막날만 있는 경우
    if (!startDate && endDate && now.getTime() <= endDate.getTime())
      return true;

    // 경우 4. 시작날 마지막날 둘다 있는 경우
    if (
      startDate &&
      endDate &&
      now.getTime() >= startDate.getTime() &&
      now.getTime() <= endDate.getTime()
    )
      return true;

    return false;
  } catch (error) {
    throw error;
  }
}
