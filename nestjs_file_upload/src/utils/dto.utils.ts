export const pick = <T>(obj, keys): T =>
  Object.fromEntries(
    keys.filter((key) => key in obj).map((key) => [key, obj[key]]),
  ) as T;

export const omit = <T>(obj, keys): T => {
  return keys.reduce((a, e) => {
    const { [e]: omit, ...rest } = a;
    return rest;
  }, obj) as T;
};
