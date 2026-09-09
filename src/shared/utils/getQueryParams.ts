/* eslint-disable @typescript-eslint/no-explicit-any */
function getQueryParams<T extends Record<string, any>>(
  params: T | undefined
): Record<string, string> {
  if (!params) return {};

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === '' || value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      // handle arrays as repeated keys — most REST APIs expect this
      value.forEach((v) => {
        result[key] = result[key] ? `${result[key]},${v}` : String(v);
      });
    } else if (typeof value === 'object') {
      // skip or JSON.stringify depending on your API contract
      result[key] = JSON.stringify(value);
    } else {
      result[key] = String(value);
    }
  }

  return result;
}
export default getQueryParams;
