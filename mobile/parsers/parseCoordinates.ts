import type { Place } from '../models/Weather';
import { parsePlace } from './parsePlace';

// Return null for place-name input; throw for malformed coordinate input.
export function parseCoordinates(query: string): Place | null {
  const input = query.trim();
  const parts = input.split(',');
  const onlyCoordinateCharacters = /^[\d\s.,+-]+$/.test(input);
  const hasNumericPart = parts.some(part => /^[+-]?(?:\d|\.|Infinity$|NaN$)/i.test(part.trim()));

  if (!onlyCoordinateCharacters && !(parts.length > 1 && hasNumericPart)) {
    return null;
  }

  const decimalNumber = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
  if (parts.length !== 2 || !parts.every(part => decimalNumber.test(part.trim()))) {
    throw new Error('Enter latitude, longitude using decimal points, for example 60.383, 14.333.');
  }

  const latitude = Number(parts[0].trim());
  const longitude = Number(parts[1].trim());

  return parsePlace({
    place: `${latitude}, ${longitude}`,
    lat: latitude,
    lon: longitude,
  });
}
