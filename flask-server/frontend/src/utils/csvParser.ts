import { Artist } from '../types';

export const parseCSVToArtists = (csvText: string): Artist[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const artists: Artist[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;

    try {
      const artist: Artist = {
        id: values[0], // artisan_id
        name: values[1], // name
        gender: values[2], // gender
        age: parseInt(values[3]) || 0, // age
        craft_type: values[4], // craft_type
        location: {
          state: values[5] || '', // state
          district: values[6] || '', // district
          village: values[7] || '', // village
        },
        contact: {
          email: values[9], // contact_email
          phone: formatPhoneNumber(values[10]), // contact_phone
          phone_available: values[11].toLowerCase() === 'yes', // contact_phone_boolean
        },
        languages: values[8].split(',').map(lang => lang.trim().replace(/"/g, '')), // languages_spoken
        government_id: values[12], // govt_artisan_id
        cluster_code: values[13], // artisan_cluster_code
      };

      artists.push(artist);
    } catch (error) {
      console.warn(`Error parsing line ${i + 1}:`, error);
    }
  }

  return artists;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

const formatPhoneNumber = (phone: string): string => {
  // Handle scientific notation like 9.16703E+11
  if (phone.includes('E+')) {
    const num = parseFloat(phone);
    const phoneStr = Math.round(num).toString();
    // Format as +91 XXXXXXXXXX for Indian phone numbers
    if (phoneStr.length === 12 && phoneStr.startsWith('91')) {
      return `+${phoneStr}`;
    }
    return phoneStr;
  }
  return phone;
};

