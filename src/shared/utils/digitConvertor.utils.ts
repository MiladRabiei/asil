export function convertToPersianDigits(input: string): string {
  return input.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(digit)]);
}
export function convertToLatinDigits(input: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

  return input.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit);
    if (persianIndex !== -1) return persianIndex.toString();

    const arabicIndex = arabicDigits.indexOf(digit);
    if (arabicIndex !== -1) return arabicIndex.toString();

    return digit;
  });
}
// IT CONVERTS ONLY THE TEXT NODES OF THE HTML NOT THE TAGS AND ATTRIBUTES
export const convertTextNodesToPersianDigits = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = convertToPersianDigits(node.textContent ?? '');
    } else {
      node.childNodes.forEach(walk);
    }
  };

  doc.body.childNodes.forEach(walk);
  return doc.body.innerHTML;
};
// Wraps formik's handleChange so the value is normalized to Latin digits
// before it ever reaches formik state or validation.
export function createLatinDigitChangeHandler(
  setFieldValue: (field: string, value: string, shouldValidate?: boolean) => void,
  fieldName: string
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, convertToLatinDigits(e.target.value));
  };
}
