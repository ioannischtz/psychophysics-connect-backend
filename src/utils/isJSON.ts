export default function isJSON(value: any): boolean {
  // Check if the value is an object and not an array or null
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    // Check if the `toString` method of the value returns "[object Object]"
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  return false;
}
