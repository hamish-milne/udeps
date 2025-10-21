/**
 * Compatibility udeps registry for older runtimes
 * @module udeps/registry/compat
 * @license 0BSD
 */

/**
 * Filters the entries of an object based on a provided predicate function.
 * @param obj   The object to filter
 * @param fn    The predicate function
 * @returns     A new object with filtered entries
 * @deprecated  since=ES2019
 */
export function objectFilter<T extends object, U extends keyof T>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => key is U,
) {
  const result = {} as Pick<T, U>;
  for (const key in obj) {
    const value = obj[key];
    if (fn(key, value)) {
      result[key] = value as T[Extract<keyof T, string> & U];
    }
  }
  return result;
}

/**
 * Maps the values of an object using a provided function.
 * @param obj   The object to map
 * @param fn    The mapping function
 * @returns     A new object with mapped values
 * @deprecated  since=ES2019
 */
export function objectMap<T extends object, U>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => U,
) {
  const result = {} as { [K in keyof T]: U };
  for (const key in obj) {
    const value = obj[key];
    result[key] = fn(key, value);
  }
  return result;
}

/**
 * Creates a new object by omitting specified keys from the original object.
 * @param obj    Original object
 * @param keys   Keys to omit
 * @returns      New object without omitted keys
 * @deprecated   since=ES2019
 */
export function omit<T extends object, K extends Extract<keyof T, string>>(
  obj: T,
  keys: readonly K[],
) {
  const result = {} as T;
  for (const key in obj) {
    if (keys.indexOf(key as K) === -1) {
      result[key] = obj[key];
    }
  }
  return result as Omit<T, K>;
}

/**
 * Creates a new object by picking specified keys from the original object.
 * @param obj    Original object
 * @param keys   Keys to pick
 * @returns      New object with picked keys
 * @deprecated   since=ES2019
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
) {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}
