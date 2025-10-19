/**
 * Checks if an object has a specific property as its own (not inherited) property.
 * @param obj    Object to check
 * @param prop   Property name to check
 * @returns      True if property exists on object, false otherwise
 * @deprecated   since=ES2022.Object, replace-with={@link Object.hasOwn}
 */
export function objectHasOwn(obj: object, prop: string | symbol) {
  // biome-ignore lint/suspicious/noPrototypeBuiltins: legacy utility function
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Checks if an array includes a specific item.
 * @param arr   Array to check
 * @param item  Item to find
 * @returns     True if item is found, false otherwise
 * @deprecated  since=ES2016.Array.Include, replace-with={@link Array.prototype.includes}, inline=consider
 */
export function includes<T>(arr: readonly T[], item: T) {
  return arr.indexOf(item) !== -1;
}

/**
 * Returns the values of an object as an array.
 * @param obj   Object to get values from
 * @returns     Array of values
 * @requires    ES5
 * @deprecated  since=ES2017.Object, replace-with={@link Object.values}, inline=consider
 */
export function objectValues<T>(obj: { [s: string]: T }) {
  return Object.keys(obj).map((key) => obj[key]);
}

/**
 * Returns the entries of an object as an array of key-value pairs.
 * @param obj   Object to get entries from
 * @returns     Array of key-value pairs
 * @requires    ES5
 * @deprecated  since=ES2017.Object, replace-with={@link Object.entries}
 */
export function objectEntries<T>(obj: { [s: string]: T }) {
  return Object.keys(obj).map<[string, T]>((key) => [key, obj[key]]);
}

/**
 * Creates an object from an array of key-value pairs.
 * @param entries   Array of key-value pairs
 * @returns         Object created from entries
 * @requires        ES5
 * @deprecated      since=ES2019.Object, replace-with={@link Object.fromEntries}
 */
export function objectFromEntries<K extends string | number | symbol, V>(
  entries: readonly (readonly [K, V])[],
) {
  const obj = {} as { [key in K]: V };
  for (const [key, value] of entries) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Replaces all occurrences of a substring in a string with a new substring.
 * If the searchValue is a RegExp, you should use {@link String.prototype.replace} with the global flag instead.
 * @param str           Original string
 * @param searchValue   Substring to search for
 * @param replaceValue  Substring to replace with
 * @returns             New string with replacements
 * @requires            ES5
 * @deprecated          since=ES2021.String, replace-with={@link String.prototype.replaceAll}
 */
export function stringReplaceAll(
  str: string,
  searchValue: string,
  replaceValue: string,
) {
  return str.split(searchValue).join(replaceValue);
}

/**
 * Creates a new object by picking specified keys from the original object.
 * @param obj    Original object
 * @param keys   Keys to pick
 * @returns      New object with picked keys
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

/**
 * Creates a new object by omitting specified keys from the original object.
 * @param obj    Original object
 * @param keys   Keys to omit
 * @returns      New object without omitted keys
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
