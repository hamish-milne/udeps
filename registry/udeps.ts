// BSD Zero Clause License

/**
 * Decodes a base64-encoded string to a Uint8Array buffer. Cross-platform, but significantly slower than the Node.js Buffer API.
 * @param str   Base64-encoded string
 * @returns     Decoded Uint8Array buffer
 * @requires    ES5
 * @deprecated  since=node, replace-with={@link Buffer.from}
 * @deprecated  since=ESNext, replace-with={@link Uint8Array.fromBase64}
 */
export function base64Decode(str: string): Uint8Array {
  const raw = atob(str);
  const result = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    result[i] = raw.charCodeAt(i);
  }
  return result;
}

/**
 * Encodes a Uint8Array buffer to a base64-encoded string. Cross-platform, but significantly slower than the Node.js Buffer API.
 * @param buffer   Uint8Array buffer to encode
 * @returns        Base64-encoded string
 * @requires       ES5
 * @deprecated     since=node, replace-with={@link Buffer.prototype.toString}
 * @deprecated     since=ESNext, replace-with={@link Uint8Array.toBase64}
 */
export function base64Encode(buffer: Uint8Array): string {
  let str = "";
  const CHUNK_SIZE = 1024;
  let i = 0;
  for (; i < buffer.length; i += CHUNK_SIZE) {
    str += String.fromCharCode.apply(
      null,
      buffer.subarray(i, i + CHUNK_SIZE) as ArrayLike<number> as number[],
    );
  }
  return btoa(str);
}

/**
 * Splits an array into chunks of a specified size.
 * @param input  Array to be chunked
 * @param size   Maximum size of each chunk
 * @returns      Array of chunks
 * @requires     ES5
 */
export function chunk<T>(input: readonly T[], size: number) {
  return input.reduce<T[][]>((chunks, item, index) => {
    if (index % size === 0) {
      chunks.push([item]);
    } else {
      chunks[chunks.length - 1].push(item);
    }
    return chunks;
  }, []);
}

/**
 * Joins CSS class names into a single string, ignoring falsy values.
 * @param classes   Array of class names (strings) or falsy values
 * @returns         Joined class names as a single string
 * @requires        ES5
 */
export function classJoin(...classes: (string | false | null | undefined)[]) {
  let result = "";
  for (const cls of classes) {
    if (cls) {
      result += (result && " ") + cls;
    }
  }
  return result;
}

/**
 * Removes falsy values from an array.
 * @param input  Array to be compacted
 * @returns      Compacted array
 * @deprecated   inline=consider
 * @requires     ES5
 */
export function compact<T>(input: readonly T[]) {
  return input.filter(Boolean) as Exclude<T, false | null | undefined | 0>[];
}

/**
 * Returns the difference between an array and multiple other arrays.
 * @param include  Array to include items from
 * @param exclude  Arrays to exclude items from
 * @returns        Array of items in include but not in exclude
 * @requires       ES5
 * @requires       ES2016.Array.Include
 */
export function difference<T>(
  include: readonly T[],
  ...exclude: readonly T[][]
) {
  return include.filter((item) => exclude.every((arr) => !arr.includes(item)));
}

/**
 * Ensures the input is returned as an array.
 * @param input   Input value which can be a single item, an array, an iterable, null, or undefined
 * @returns       An array containing the input value(s), or an empty array if input is nullish
 * @requires      ES2015.Iterable
 */
export function forceArray<T>(input: T | T[] | null | undefined | Iterable<T>) {
  return input == null
    ? []
    : Array.isArray(input)
      ? input
      : typeof input === "object" && Symbol.iterator in input
        ? Array.from(input)
        : [input];
}

/**
 * Gets an iterator for the given iterable.
 * @param iterable  The iterable to get an iterator for
 * @returns         An iterator for the iterable
 * @requires        ES2015.Iterable
 * @deprecated      inline=recommend
 */
export function getIterator<T>(iterable: Iterable<T>) {
  return iterable[Symbol.iterator]();
}

/**
 * Decodes a hexadecimal string to a Uint8Array buffer. Cross-platform, but significantly slower than the Node.js Buffer API.
 * @param str   Hexadecimal string
 * @returns     Decoded Uint8Array buffer
 * @requires    ES5
 * @deprecated  since=node, replace-with={@link Buffer.from}
 * @deprecated  since=ESNext, replace-with={@link Uint8Array.fromHex}
 */
export function hexDecode(str: string): Uint8Array {
  const result = new Uint8Array(str.length / 2);
  const view = new DataView(result.buffer);
  let i = 0;
  for (; i < str.length - 7; i += 8) {
    view.setUint32(i / 2, parseInt(str.substring(i, i + 8), 16));
  }
  for (; i < str.length - 1; i += 2) {
    view.setUint8(i / 2, parseInt(str.substring(i, i + 2), 16));
  }
  return result;
}

/**
 * Encodes a Uint8Array buffer to a hexadecimal string. Cross-platform, but significantly slower than the Node.js Buffer API.
 * @param buffer   Uint8Array buffer to encode
 * @returns        Hexadecimal string
 * @requires       ES5
 * @deprecated     since=node, replace-with={@link Buffer.prototype.toString}
 * @deprecated     since=ESNext, replace-with={@link Uint8Array.toHex}
 */
export function hexEncode(buffer: Uint8Array): string {
  const view = new DataView(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength,
  );
  let result = "";
  let i = 0;
  for (; i < buffer.byteLength - 3; i += 4) {
    result += view.getUint32(i).toString(16).padStart(8, "0");
  }
  for (; i < buffer.byteLength; i++) {
    result += view.getUint8(i).toString(16).padStart(2, "0");
  }
  return result;
}

/**
 * Checks if an array includes a specific item (except `NaN`).
 * @param arr   Array to check
 * @param item  Item to find
 * @returns     True if item is found, false otherwise
 * @deprecated  since=ES2016.Array.Include, replace-with={@link Array.prototype.includes}, inline=consider
 */
export function includes<T>(arr: readonly T[], item: T) {
  return arr.indexOf(item) !== -1;
}

/**
 * Returns the intersection of multiple arrays.
 * @param first  First array
 * @param rest   Other arrays
 * @returns      Array of items present in all arrays
 * @requires     ES5
 * @requires     ES2016.Array.Include
 */
export function intersection<T>(first: readonly T[], ...rest: readonly T[][]) {
  return first.filter((item) => rest.every((arr) => arr.includes(item)));
}

/**
 * Checks if a value is array-like (i.e., has a numeric length property).
 * @param value   Value to check
 * @returns       True if value is array-like, false otherwise
 */
export function isArrayLike(value: unknown): value is ArrayLike<unknown> {
  return (
    Array.isArray(value) ||
    (typeof value === "object" &&
      value !== null &&
      "length" in value &&
      typeof value.length === "number")
  );
}

/**
 * Checks if a value is a boolean.
 * Note that this does not account for wrapper objects or cross-realm values, both of which are extremely rare in practice.
 * @param value   Value to check
 * @returns       True if value is a boolean, false otherwise
 * @deprecated    inline=recommend
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Checks if the current environment is a Continuous Integration (CI) environment.
 * @returns      True if in CI environment, false otherwise
 * @deprecated   inline=consider
 * @requires     node:process
 */
export function isCI() {
  return Boolean(process.env.CI);
}

/**
 * Checks if a number is even.
 * @param num    Number to check
 * @returns      True if even, false otherwise
 * @deprecated   inline=consider
 */
export function isEven(num: number) {
  return num % 2 === 0;
}

/**
 * Checks if a number is an integer.
 * @param value   Number to check
 * @returns       True if number is an integer, false otherwise
 * @deprecated    inline=consider, since=ES2015.Core, replace-with={@link Number.isInteger}
 */
export function isInteger(num: number): boolean {
  return num % 1 === 0;
}

/**
 * Checks if a number is negative.
 * @param num    Number to check
 * @returns      True if negative, false otherwise
 * @deprecated   inline=recommend
 */
export function isNegative(num: number) {
  return num < 0;
}

/**
 * Checks if a number is exactly negative zero.
 * @param num    Number to check
 * @returns      True if negative zero, false otherwise
 * @deprecated   inline=consider
 * @requires     ES2015.Core
 */
export function isNegativeZero(num: number) {
  return Object.is(num, -0);
}

/**
 * Checks if the parent process is npm.
 * @returns      True if parent process is npm, false otherwise
 * @requires     node:process
 */
export function isNPM() {
  return Boolean(process.env.npm_config_user_agent?.startsWith("npm"));
}

/**
 * Checks if a value is a number or a numeric string.
 * Note that this does not account for wrapper objects or cross-realm values, both of which are extremely rare in practice.
 * @param value   Value to check
 * @returns       True if value is a number or numeric string, false otherwise
 * @requires      ES2015.Core
 */
export function isNumber(value: unknown): value is number {
  return (
    typeof value === "number" ||
    (typeof value === "string" && Number.isFinite(+value))
  );
}

/**
 * Checks if a number is odd.
 * @param num    Number to check
 * @returns      True if odd, false otherwise
 * @deprecated   inline=consider
 */
export function isOdd(num: number) {
  return num % 2 !== 0;
}

/**
 * Checks if a value is a plain object (i.e., not an array, function, or instance of a class).
 * @param value   Value to check
 * @returns       True if value is a plain object, false otherwise
 * @requires      ES5
 */
export function isPlainObject(value: unknown): value is object {
  if (value && typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }
  return false;
}

/**
 * Checks if a number is exactly positive zero.
 * @param num    Number to check
 * @returns      True if positive zero, false otherwise
 * @deprecated   inline=consider
 * @requires     ES2015.Core
 */
export function isPositiveZero(num: number) {
  return Object.is(num, 0);
}

/**
 * Checks if a value is a string.
 * Note that this does not account for wrapper objects or cross-realm values, both of which are extremely rare in practice.
 * @param value   Value to check
 * @returns       True if value is a string, false otherwise
 * @deprecated    inline=recommend
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Returns the maximum item in an array based on a selector function.
 * @param arr       Array to search
 * @param selector  Function to select the value to compare
 * @returns         Maximum item or undefined if array is empty
 * @requires        ES5
 */
export function maxBy<T>(arr: readonly T[], selector: (item: T) => number) {
  return arr.reduce<T | undefined>(
    (maxItem, currentItem) =>
      maxItem === undefined || selector(currentItem) > selector(maxItem)
        ? currentItem
        : maxItem,
    undefined,
  );
}

/**
 * Returns the minimum item in an array based on a selector function.
 * @param arr       Array to search
 * @param selector  Function to select the value to compare
 * @returns         Minimum item or undefined if array is empty
 * @requires        ES5
 */
export function minBy<T>(arr: readonly T[], selector: (item: T) => number) {
  return arr.reduce<T | undefined>(
    (minItem, currentItem) =>
      minItem === undefined || selector(currentItem) < selector(minItem)
        ? currentItem
        : minItem,
    undefined,
  );
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
 * Filters the entries of an object based on a provided predicate function.
 * @param obj   The object to filter
 * @param fn    The predicate function
 * @returns     A new object with filtered entries
 * @requires    ES5
 * @requires    ES2017.Object
 * @requires    ES2019.Object
 */
export function objectFilter<T extends object, U extends keyof T>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => key is U,
) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => fn(key as keyof T, value)),
  ) as Pick<T, U>;
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
 * Checks if an object has a specific property as its own (not inherited) property.
 * @param obj    Object to check
 * @param prop   Property name to check
 * @returns      True if property exists on object, false otherwise
 * @deprecated   since=ES2022.Object, replace-with={@link Object.hasOwn}, inline=consider
 */
export function objectHasOwn(obj: object, prop: string | symbol) {
  // biome-ignore lint/suspicious/noPrototypeBuiltins: legacy utility function
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Maps the values of an object using a provided function.
 * @param obj   The object to map
 * @param fn    The mapping function
 * @returns     A new object with mapped values
 * @requires    ES5
 * @requires    ES2017.Object
 * @requires    ES2019.Object
 */
export function objectMap<T extends object, U>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => U,
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(key as keyof T, value)]),
  ) as { [K in keyof T]: U };
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
 * Creates a new object by omitting specified keys from the original object.
 * @param obj    Original object
 * @param keys   Keys to omit
 * @returns      New object without omitted keys
 * @requires     ES5
 * @requires     ES2016.Array.Include
 * @requires     ES2017.Object
 * @requires     ES2019.Object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K)),
  ) as Omit<T, K>;
}

/**
 * Creates a new object by picking specified keys from the original object.
 * @param obj    Original object
 * @param keys   Keys to pick
 * @returns      New object with picked keys
 * @requires     ES5
 * @requires     ES2016.Array.Include
 * @requires     ES2017.Object
 * @requires     ES2019.Object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as K)),
  ) as Pick<T, K>;
}

/**
 * Compares two values for equality using the SameValueZero algorithm.
 * This is the algorithm used by {@link Array.prototype.includes}, {@link Map}, and {@link Set}.
 * @param x   First value
 * @param y   Second value
 * @returns   True if values are equal, false otherwise
 */
export function sameValueZero(x: unknown, y: unknown) {
  return (
    x === y ||
    // biome-ignore lint/suspicious/noSelfCompare: checking for NaN
    (typeof x === "number" && typeof y === "number" && x !== x && y !== y)
  );
}

/**
 * Sets the toStringTag of an object.
 * @param target  The target object
 * @param value   The toStringTag value to set
 * @requires      ES2015.Symbol.WellKnown
 */
export function setToStringTag(target: object, value: string) {
  Object.defineProperty(target, Symbol.toStringTag, {
    value,
    configurable: true,
  });
}

/**
 * Asynchronous sleep for a specified duration.
 * @param ms    Duration in milliseconds
 * @returns     Promise that resolves after the specified duration
 * @requires    ES2015.Promise
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Splits a string into lines.
 * @param input   String to split
 * @returns       Array of lines
 * @requires      ES5
 */
export function splitLines(input: string) {
  return input.split(/\r?\n/);
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
 * Returns a new array with duplicate values removed.
 * @param input   Array to process
 * @returns       Array with unique values
 * @deprecated    inline=consider
 * @requires      ES2015.Iterable
 * @requires      ES2015.Collection
 */
export function unique<T>(input: readonly T[]) {
  return Array.from(new Set(input));
}

/**
 * Unwraps a primitive object to its corresponding primitive value.
 * Note that primitive object wrappers are extremely rare in practice.
 * @param value   Primitive object or primitive value
 * @returns       Unwrapped primitive value
 * @requires      ES5
 */
export function unwrapPrimitiveObject(value: unknown) {
  if (
    value instanceof Boolean ||
    value instanceof Number ||
    value instanceof String
  ) {
    return value.valueOf();
  }
  return value;
}

/**
 * Forces V8 to convert a string to a contiguous/flat representation.
 * This can improve performance in certain scenarios, like JSON.stringify, but has an immediate cost as well.
 * Be sure to benchmark before and after using this function!
 * @param str   String to flatten
 * @returns     The same string
 */
export function v8FlattenString(str: string): string {
  Number(str);
  return str;
}
