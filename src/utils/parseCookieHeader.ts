export function parseCookieHeader(
  cookieHeaderStr: string,
): Record<string, string> {
  const cookieKVpairs = cookieHeaderStr.split(";");
  let cookiesObj: Record<string, string> = {}; // Define the type explicitly

  for (const kvpair of cookieKVpairs) {
    let kv = kvpair.split("=");
    cookiesObj[kv[0].trim()] = kv[1];
  }

  return cookiesObj;
}
