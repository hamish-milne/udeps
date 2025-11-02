import { expect, test, vi } from "vitest";
import * as compat from "./compat.js";
import * as udeps from "./main.js";

const allLibs = [
  {
    name: "main",
    module: udeps,
  },
  {
    name: "compat",
    module: compat,
  },
];

test("base64", () => {
  const input = new Uint8Array(Array(0x100).keys());
  const encoded = udeps.base64Encode(input);
  expect(encoded).toBe(Buffer.from(input).toString("base64"));
  const decoded = udeps.base64Decode(encoded);
  expect(decoded).toEqual(input);
  const bigEncoded = udeps.base64Encode(new Uint8Array(1024 * 1024 * 4)); // 4MB
  expect(bigEncoded.length).toEqual(5592408);
});

test("chunk", () => {
  const input = [1, 2, 3, 4, 5, 6, 7];
  const chunks = Array.from(udeps.chunk(input, 3));
  expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
});

test("classJoin", () => {
  const result = udeps.classJoin(
    "btn",
    undefined,
    "btn-primary",
    false,
    "",
    "active",
  );
  expect(result).toBe("btn btn-primary active");
});

test("compact", () => {
  const input = [0, 1, false, 2, "", 3, null, undefined, 4];
  const output = udeps.compact(input);
  expect(output).toEqual([1, 2, 3, 4]);
});

test("difference", () => {
  const a = [1, 2, 3, 4, 5];
  const b = [4, 5, 6, 7, 8];
  const diff = udeps.difference(a, b);
  expect(diff).toEqual([1, 2, 3]);
});

test("forceArray", () => {
  expect(udeps.forceArray(5)).toEqual([5]);
  expect(udeps.forceArray([1, 2, 3])).toEqual([1, 2, 3]);
  expect(udeps.forceArray(null)).toEqual([]);
  expect(udeps.forceArray(new Set([1, 2, 3]))).toEqual([1, 2, 3]);
});

test("getIterator", () => {
  const array = [1, 2, 3];
  const set = new Set(["a", "b", "c"]);
  expect(udeps.getIterator(array).next().value).toBe(1);
  expect(udeps.getIterator(set).next().value).toBe("a");
});

test("hex", () => {
  const input = new Uint8Array([0, 15, 16, 255, 254, 253]);
  const hexed = udeps.hexEncode(input);
  expect(hexed).toBe("000f10fffefd");
  const unHexed = udeps.hexDecode(`${hexed}0`);
  expect(unHexed).toEqual(input);
  const bigHexed = udeps.hexEncode(new Uint8Array(1024 * 1024 * 2)); // 2MB
  expect(bigHexed.length).toEqual(1024 * 1024 * 4);
});

test("includes", () => {
  const array = [1, 2, 3];
  expect(udeps.includes(array, 2)).toBe(true);
  expect(udeps.includes(array, 4)).toBe(false);
});

test("intersection", () => {
  const a = [1, 2, 3, 4, 5];
  const b = [4, 5, 6, 7, 8];
  const intersect = udeps.intersection(a, b);
  expect(intersect).toEqual([4, 5]);
});

test("isAndroid", () => {
  vi.stubGlobal("navigator", {
    userAgent:
      "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36",
  } as Navigator);
  expect(udeps.isAndroid()).toBe(true);
  vi.stubGlobal("navigator", {
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1",
  } as Navigator);
  expect(udeps.isAndroid()).toBe(false);
});

test("isArrayLike", () => {
  expect(udeps.isArrayLike([])).toBe(true);
  expect(udeps.isArrayLike({ length: 0 })).toBe(true);
  expect(udeps.isArrayLike("string")).toBe(false);
  expect(udeps.isArrayLike(new Uint8Array(5))).toBe(true);
  expect(udeps.isArrayLike(null)).toBe(false);
});

test("isBoolean", () => {
  expect(udeps.isBoolean(true)).toBe(true);
  expect(udeps.isBoolean(false)).toBe(true);
  expect(udeps.isBoolean(0)).toBe(false);
  expect(udeps.isBoolean("true")).toBe(false);
});

test("isCI", () => {
  const originalEnv = process.env;
  process.env = { CI: "true" };
  expect(udeps.isCI()).toBe(true);
  process.env = { CI: "" };
  expect(udeps.isCI()).toBe(false);
  process.env = originalEnv;
});

test("isEmail", () => {
  expect(udeps.isEmail("example@example.com")).toBe(true);
  expect(udeps.isEmail("john_doe+test@sub.domain.tld")).toBe(true);
  expect(udeps.isEmail("not an email")).toBe(false);
  expect(udeps.isEmail("example@.com")).toBe(false);
  expect(udeps.isEmail("example@localhost")).toBe(true);
});

test("isEven", () => {
  expect(udeps.isEven(2)).toBe(true);
  expect(udeps.isEven(3)).toBe(false);
  expect(udeps.isEven(0)).toBe(true);
  expect(udeps.isEven(-4)).toBe(true);
  expect(udeps.isEven(-5)).toBe(false);
  expect(udeps.isEven(NaN)).toBe(false);
  expect(udeps.isEven(Infinity)).toBe(false);
});

test("isInteger", () => {
  expect(udeps.isInteger(5)).toBe(true);
  expect(udeps.isInteger(-3)).toBe(true);
  expect(udeps.isInteger(0)).toBe(true);
  expect(udeps.isInteger(4.2)).toBe(false);
  expect(udeps.isInteger(NaN)).toBe(false);
  expect(udeps.isInteger(Infinity)).toBe(false);
});

test("isIOS", () => {
  vi.stubGlobal("navigator", {
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1",
  } as Navigator);
  expect(udeps.isIOS()).toBe(true);
  vi.stubGlobal("navigator", {
    userAgent:
      "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36",
  } as Navigator);
  expect(udeps.isIOS()).toBe(false);
});

test("isNegative", () => {
  expect(udeps.isNegative(-5)).toBe(true);
  expect(udeps.isNegative(3)).toBe(false);
  expect(udeps.isNegative(0)).toBe(false);
  expect(udeps.isNegative(-0)).toBe(false);
  expect(udeps.isNegative(NaN)).toBe(false);
  expect(udeps.isNegative(Infinity)).toBe(false);
});

test("isNegativeZero", () => {
  expect(udeps.isNegativeZero(-0)).toBe(true);
  expect(udeps.isNegativeZero(0)).toBe(false);
  expect(udeps.isNegativeZero(5)).toBe(false);
  expect(udeps.isNegativeZero(-3)).toBe(false);
  expect(udeps.isNegativeZero(NaN)).toBe(false);
  expect(udeps.isNegativeZero(Infinity)).toBe(false);
});

test("isNPM", () => {
  const originalEnv = process.env;
  process.env = {
    npm_config_user_agent: "npm/6.14.8 node/v14.15.1 darwin x64",
  };
  expect(udeps.isNPM()).toBe(true);
  process.env = {
    npm_config_user_agent: "yarn/1.22.10 npm/? node/v14.15.1 darwin x64",
  };
  expect(udeps.isNPM()).toBe(false);
  process.env = originalEnv;
});

test("isNumber", () => {
  expect(udeps.isNumber(5)).toBe(true);
  expect(udeps.isNumber(-3.2)).toBe(true);
  expect(udeps.isNumber(NaN)).toBe(true);
  expect(udeps.isNumber(Infinity)).toBe(true);
  expect(udeps.isNumber("5")).toBe(true);
  expect(udeps.isNumber(null)).toBe(false);
  expect(udeps.isNumber("infinity")).toBe(false);
});

test("isOdd", () => {
  expect(udeps.isOdd(2)).toBe(false);
  expect(udeps.isOdd(3)).toBe(true);
  expect(udeps.isOdd(0)).toBe(false);
  expect(udeps.isOdd(-4)).toBe(false);
  expect(udeps.isOdd(-5)).toBe(true);
  expect(udeps.isOdd(NaN)).toBe(false);
  expect(udeps.isOdd(Infinity)).toBe(false);
});

test("isPlainObject", () => {
  expect(udeps.isPlainObject({})).toBe(true);
  expect(udeps.isPlainObject({ a: 1, b: 2 })).toBe(true);
  expect(udeps.isPlainObject(new Map())).toBe(false);
  expect(udeps.isPlainObject([])).toBe(false);
  expect(udeps.isPlainObject(null)).toBe(false);
  expect(udeps.isPlainObject({ __proto__: null })).toBe(true);
});

test("isPositiveZero", () => {
  expect(udeps.isPositiveZero(0)).toBe(true);
  expect(udeps.isPositiveZero(-0)).toBe(false);
  expect(udeps.isPositiveZero(5)).toBe(false);
  expect(udeps.isPositiveZero(-3)).toBe(false);
  expect(udeps.isPositiveZero(NaN)).toBe(false);
  expect(udeps.isPositiveZero(Infinity)).toBe(false);
});

test("isShebang", () => {
  expect(udeps.isShebang("#!/usr/bin/env node")).toBe(true);
  expect(udeps.isShebang("#! /bin/bash")).toBe(true);
  expect(udeps.isShebang("not a shebang")).toBe(false);
  expect(udeps.isShebang(" #!/usr/bin/env python")).toBe(false);
});

test("isString", () => {
  expect(udeps.isString("hello")).toBe(true);
  expect(udeps.isString("")).toBe(true);
  expect(udeps.isString(5)).toBe(false);
  expect(udeps.isString(null)).toBe(false);
});

test("isTouchDevice", () => {
  vi.stubGlobal("navigator", {
    maxTouchPoints: 5,
  } as Navigator);
  vi.stubGlobal("window", {});
  expect(udeps.isTouchDevice()).toBe(true);
  vi.stubGlobal("navigator", {
    maxTouchPoints: 0,
  } as Navigator);
  expect(udeps.isTouchDevice()).toBe(false);
});

test("isWhitespace", () => {
  expect(udeps.isWhitespace("")).toBe(true);
  expect(udeps.isWhitespace("   ")).toBe(true);
  expect(udeps.isWhitespace("\n\t")).toBe(true);
  expect(udeps.isWhitespace(" hello ")).toBe(false);
  expect(udeps.isWhitespace("world")).toBe(false);
});

test("maxBy", () => {
  const array = [{ value: 1 }, { value: 3 }, { value: 2 }];
  const maxItem = udeps.maxBy(array, (item) => item.value);
  expect(maxItem).toEqual({ value: 3 });
});

test("minBy", () => {
  const array = [{ value: 1 }, { value: 3 }, { value: 0 }];
  const minItem = udeps.minBy(array, (item) => item.value);
  expect(minItem).toEqual({ value: 0 });
});

test("normalizePathSlashes", () => {
  expect(udeps.normalizePathSlashes("C:\\Users\\Test\\file.txt")).toBe(
    "C:/Users/Test/file.txt",
  );
  expect(udeps.normalizePathSlashes("\\\\?\\C:\\Users\\Test\\file.txt")).toBe(
    "\\\\?\\C:\\Users\\Test\\file.txt",
  );
});

test("objectEntries", () => {
  const obj = { a: 1, b: 2, c: 3 };
  const entries = Array.from(udeps.objectEntries(obj));
  expect(entries).toEqual(Object.entries(obj));
});

test.each(allLibs)("objectFilter ($name)", ({ module }) => {
  const obj = { a: 1, b: "two", c: 3, d: "four" };
  const filtered = module.objectFilter(obj, (_key, value) => {
    return typeof value === "string";
  });
  expect(filtered).toEqual({ b: "two", d: "four" });
});

test("objectFromEntries", () => {
  const entries: [string, number][] = [
    ["a", 1],
    ["b", 2],
    ["c", 3],
  ];
  const obj = udeps.objectFromEntries(entries);
  expect(obj).toEqual(Object.fromEntries(entries));
});

test("objectHasOwn", () => {
  const proto = { c: 3 };
  const obj = { __proto__: proto, a: 1, b: 2 };
  expect(udeps.objectHasOwn(obj, "a")).toBe(true);
  expect(udeps.objectHasOwn(obj, "c")).toBe(false);
});

test.each(allLibs)("objectMap ($name)", ({ module }) => {
  const obj = { a: 1, b: 2, c: 3 };
  const mapped = module.objectMap(obj, (_key, value) => value * 2);
  expect(mapped).toEqual({ a: 2, b: 4, c: 6 });
});

test("objectValues", () => {
  const obj = { a: 1, b: 2, c: 3 };
  const values = Array.from(udeps.objectValues(obj));
  expect(values).toEqual(Object.values(obj));
});

test.each(allLibs)("omit ($name)", ({ module }) => {
  const obj = { a: 1, b: 2, c: 3, d: 4 };
  const omitted = module.omit(obj, ["b", "d"]);
  expect(omitted).toEqual({ a: 1, c: 3 });
});

test.each(allLibs)("pick ($name)", ({ module }) => {
  const obj = { a: 1, b: 2, c: 3, d: 4 };
  const picked = module.pick(obj, ["b", "d"]);
  expect(picked).toEqual({ b: 2, d: 4 });
});

test("sameValueZero", () => {
  expect(udeps.sameValueZero(NaN, NaN)).toBe(true);
  expect(udeps.sameValueZero(0, -0)).toBe(true);
  expect(udeps.sameValueZero(5, 5)).toBe(true);
  expect(udeps.sameValueZero(5, 6)).toBe(false);
});

test("setToStringTag", () => {
  class MyClass {}
  udeps.setToStringTag(MyClass.prototype, "MyCustomClass");
  const instance = new MyClass();
  expect(instance.toString()).toBe("[object MyCustomClass]");
});

test("sleep", async () => {
  vi.useFakeTimers();
  const sleepPromise = udeps.sleep(100);
  vi.advanceTimersByTime(100);
  await sleepPromise;
  vi.useRealTimers();
});

test("splitLines", () => {
  const text = "Line 1\r\nLine 2\nLine 3\rLine 4";
  const lines = udeps.splitLines(text);
  expect(lines).toEqual(["Line 1", "Line 2", "Line 3", "Line 4"]);
});

test("stringReplaceAll", () => {
  const text = "The quick brown fox jumps over the lazy dog. The dog barks.";
  const result = udeps.stringReplaceAll(text, "dog", "cat");
  expect(result).toBe(
    "The quick brown fox jumps over the lazy cat. The cat barks.",
  );
});

test("unique", () => {
  const array = [1, 2, 2, 3, 4, 4, 5];
  const uniqueArray = udeps.unique(array);
  expect(uniqueArray).toEqual([1, 2, 3, 4, 5]);
});

test("unwrapPrimitiveObject", () => {
  expect(udeps.unwrapPrimitiveObject(new String("hello"))).toBe("hello");
  expect(udeps.unwrapPrimitiveObject(new Number(5))).toBe(5);
  expect(udeps.unwrapPrimitiveObject(new Boolean(true))).toBe(true);
  expect(udeps.unwrapPrimitiveObject("world")).toBe("world");
  expect(udeps.unwrapPrimitiveObject(10)).toBe(10);
  expect(udeps.unwrapPrimitiveObject(false)).toBe(false);
});

test("v8FlattenString", () => {
  const input = "This is a test string to be flattened by V8 engine.";
  const flattened = udeps.v8FlattenString(input);
  expect(flattened).toBe(input);
});
