import { describe, expect, it, vi } from "vitest";
import { generateShuffledIndexes } from "../../../src/services/generateShuffledIndexes.js"; // Make sure to replace with the actual path to your module

describe("generateShuffledIndexes", () => {
  it("should generate an array of shuffled indexes", () => {
    const length = 10;
    const indexes = generateShuffledIndexes(length);

    // Verify the length of the generated array
    expect(indexes.length).toBe(length);

    // Verify that the indexes are within the valid range
    for (let i = 0; i < length; i++) {
      expect(indexes[i]).toBeGreaterThanOrEqual(0);
      expect(indexes[i]).toBeLessThan(length);
    }

    // Verify that the generated array is shuffled
    const sortedIndexes = [...indexes].sort((a, b) => a - b);
    expect(indexes).not.toEqual(sortedIndexes);
  });

  it("should generate an empty array when length is 0", () => {
    const length = 0;
    const indexes = generateShuffledIndexes(length);
    expect(indexes.length).toBe(0);
  });
});
