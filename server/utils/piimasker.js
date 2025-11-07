// utils/piiMasker.js
export function maskPII(text) {
  if (!text) return { masked: text, map: [] };
  const map = [];
  let id = 1;

  const register = (original) => {
    const token = `{{PII_${id++}}}`;
    map.push({ token, original });
    return token;
  };

  // Email
  text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (m) => register(m));

  // Phone numbers
  text = text.replace(/(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}\b/g, (m) => {
    const digits = m.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15 ? register(m) : m;
  });

  // Card numbers
  text = text.replace(/\b(?:\d[ -]*?){13,19}\b/g, (m) => register(m));

  // Address (basic pattern)
  text = text.replace(/\b\d{1,5}\s+[A-Za-z0-9\s]+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Dr|Drive)\b/gi, (m) => register(m));

  // Simple names (Two capitalized words)
  text = text.replace(/\b([A-Z][a-z]+)\s([A-Z][a-z]+)\b/g, (m) => register(m));

  return { masked: text, map };
}

export function unmaskPII(text, map = []) {
  if (!text || !map.length) return text;
  return map.reduce((acc, { token, original }) => acc.split(token).join(original), text);
}
