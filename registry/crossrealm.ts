/**
 * Utilities for working with cross-realm values.
 * These are values created in a different JavaScript realm (e.g., iframe, worker, or VM).
 * Most developers can use standard JavaScript features without worrying about realms.
 * Furthermore in most cases you will interact with these contexts using a serialization format like JSON or MessagePort,
 * so these utilities are only needed in specific scenarios like assertion libraries.
 * @module udeps/registry/crossrealm
 * @license 0BSD
 */

/**
 * Checks if a value is an Array, even if it comes from a different realm.
 * @param value   Value to check
 * @returns       True if the value is an Array, false otherwise
 * @deprecated    inline=recommend, replace={@link Array.isArray}
 */
export function crossrealm_isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}

/**
 * Checks if a value is a Date, even if it comes from a different realm.
 * Works regardless of the Symbol.toStringTag property.
 * Consider {@link crossrealm_normalize} if you need to work with the value instead of just checking its type.
 * @param value   Value to check
 * @returns       True if the value is a Date, false otherwise
 * @deprecated    since=node, use={@link node:utils/types.isDate}
 */
export function crossrealm_isDate(value: unknown): value is Date {
  try {
    Date.prototype.getTime.call(value);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Checks if a value is a RegExp, even if it comes from a different realm.
 * Works regardless of the Symbol.toStringTag property.
 * Consider {@link crossrealm_normalize} if you need to work with the value instead of just checking its type.
 * @param value   Value to check
 * @returns       True if the value is a RegExp, false otherwise
 * @deprecated    since=node, use={@link node:utils/types.isRegExp}
 */
export function crossrealm_isRegExp(value: unknown): value is RegExp {
  try {
    RegExp.prototype.test.call(value, "");
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Attempts to normalize a cross-realm value using structuredClone.
 * If structuredClone is not available or fails, returns the original value.
 * Requires either a modern (2022) browser or Node.js 17+.
 * @param value   The cross-realm value to unwrap
 * @returns       The unwrapped value, or the original value if unwrapping fails
 */
export function crossrealm_normalize<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch (_) {
    return value;
  }
}

/**
 * Gets the internal [[Class]] tag of an object.
 * Possible return values include: "Object", "Array", "Function", "Date", "RegExp", "Error", "Map", "Set", "WeakMap", "WeakSet", etc.
 * This can be a useful heuristic for type checking cross-realm values, but can be overridden by modifying the Symbol.toStringTag property.
 * @param value   Value to get the tag of
 * @returns       The internal [[Class]] tag
 * @requires      ES5
 */
export function getObjectTag(value: unknown) {
  return Object.prototype.toString.call(value).slice(8, -1);
}
