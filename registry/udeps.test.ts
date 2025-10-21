import { expect, test } from "vitest";
import * as udeps from "./udeps.js";

test("base64", () => {
  const input = [0, 1, 2, 3, 0xfc, 0xfd, 0xfe, 0xff];
  const encoded = udeps.base64Encode(input);
  expect(encoded).toBe("AAECA/z9/v8=");
  const decoded = udeps.base64Decode(encoded);
  expect(decoded).toEqual(new Uint8Array(input));
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
});

test("getIterator", () => {
  const array = [1, 2, 3];
  const set = new Set(["a", "b", "c"]);
  expect(udeps.getIterator(array).next().value).toBe(1);
  expect(udeps.getIterator(set).next().value).toBe("a");
});

test("hex", () => {
  const input = [0, 15, 16, 255, 254, 253];
  const hexed = udeps.hexEncode(input);
  expect(hexed).toBe("000f10fffefd");
  const unhexed = udeps.hexDecode(`${hexed}0`);
  expect(unhexed).toEqual(new Uint8Array(input));
  const bigHexed = udeps.hexEncode(new Uint8Array(1024 * 1024 * 2)); // 2MB
  expect(bigHexed.length).toEqual(1024 * 1024 * 4);
});

test("includes", () => {
  const array = [1, 2, 3];
  expect(udeps.includes(array, 2)).toBe(true);
  expect(udeps.includes(array, 4)).toBe(false);
});
