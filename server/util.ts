export const pick = <T extends object, K extends Extract<keyof T, string>>(
  obj: T,
  keys: K[],
) => {
  const res = {} as Pick<T, K>;
  for (const k of keys) res[k] = obj[k];
  return res;
};
export const omit = <T extends object, K extends Extract<keyof T, string>>(
  obj: T,
  keys: K[],
) => {
  const res = { ...obj } as Omit<T, K>;
  //@ts-ignore
  for (const k of keys) delete res[k];
  return res;
};
