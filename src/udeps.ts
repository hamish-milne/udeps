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
 * Ensures the input is returned as an array.
 * @param input   Input value which can be a single item, an array, null, or undefined
 * @returns       An array containing the input value(s)
 * @requires      ES5
 */
export function forceArray<T>(input: T | T[] | null | undefined) {
  return input == null ? [] : Array.isArray(input) ? input : [input];
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
 * Maps the values of an object using a provided function.
 * @param obj   The object to map
 * @param fn    The mapping function
 * @returns     A new object with mapped values
 * @requires     ES5
 * @requires     ES2017.Object
 * @requires     ES2019.Object
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
 * Checks if a number is even.
 * @param num    Number to check
 * @returns      True if even, false otherwise
 * @deprecated   inline=consider
 */
export function isEven(num: number) {
  return num % 2 === 0;
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
 */
export function isNegativeZero(num: number) {
  return Object.is(num, -0);
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
 * Checks if the current environment is a Continuous Integration (CI) environment.
 * @returns      True if in CI environment, false otherwise
 * @deprecated   inline=consider
 * @requires     module:@types/node
 */
export function isCI() {
  return Boolean(process.env.CI);
}

/**
 * Checks if the parent process is npm.
 * @returns      True if parent process is npm, false otherwise
 * @requires     module:@types/node
 */
export function isNPM() {
  return Boolean(process.env.npm_config_user_agent?.startsWith("npm"));
}

/**
 * Checks if a value is a number or a numeric string.
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
 * Returns a new array with duplicate values removed.
 * @param input   Array to process
 * @returns       Array with unique values
 * @deprecated    inline=consider
 * @requires      ES5
 * @requires      ES2015.Collection
 */
export function unique<T>(input: readonly T[]) {
  return Array.from(new Set(input));
}
