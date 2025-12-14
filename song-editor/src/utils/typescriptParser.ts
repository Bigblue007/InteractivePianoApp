import { SongInput } from '../types/song';

/**
 * Parsuje TypeScript soubor a extrahuje POPULAR_SONGS array
 */
export function parseTypeScriptFile(content: string): SongInput[] {
  try {
    // Najít export const POPULAR_SONGS
    const exportMatch = content.match(/export\s+const\s+POPULAR_SONGS[^=]*=\s*\[([\s\S]*?)\];/);
    if (!exportMatch) {
      throw new Error('Nenalezen POPULAR_SONGS export');
    }

    const arrayContent = exportMatch[1];
    
    // Parsovat jednotlivé objekty v array pomocí lepšího přístupu
    const songs: SongInput[] = [];
    let braceCount = 0;
    let currentObject = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < arrayContent.length; i++) {
      const char = arrayContent[i];
      const prevChar = i > 0 ? arrayContent[i - 1] : '';
      
      // Sledovat stringy
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
      
      if (!inString) {
        if (char === '{') {
          if (braceCount === 0) {
            currentObject = '';
          }
          braceCount++;
          currentObject += char;
        } else if (char === '}') {
          currentObject += char;
          braceCount--;
          
          if (braceCount === 0 && currentObject.trim()) {
            try {
              const songObject = parseSongObject(currentObject);
              if (songObject) {
                songs.push(songObject);
              }
            } catch (error) {
              console.warn('Chyba při parsování objektu:', error, currentObject.substring(0, 100));
            }
            currentObject = '';
          }
        } else if (braceCount > 0) {
          currentObject += char;
        }
      } else {
        if (braceCount > 0) {
          currentObject += char;
        }
      }
    }

    return songs;
  } catch (error) {
    throw new Error(`Chyba při parsování TypeScript souboru: ${error}`);
  }
}

/**
 * Parsuje jeden song objekt z TypeScript kódu
 */
function parseSongObject(objectString: string): SongInput | null {
  try {
    // Extrahovat title
    const titleMatch = objectString.match(/title:\s*["']([^"']+)["']/);
    if (!titleMatch) {
      console.warn('Nenalezen title v objektu:', objectString.substring(0, 100));
      return null;
    }
    const title = titleMatch[1];

    // Extrahovat artist
    const artistMatch = objectString.match(/artist:\s*["']([^"']+)["']/);
    if (!artistMatch) {
      console.warn('Nenalezen artist v objektu:', title);
      return null;
    }
    const artist = artistMatch[1];

    // Najít pozici sections pro správné parsování chords
    const sectionsStart = objectString.indexOf('sections:');
    let sectionsEnd = -1;
    if (sectionsStart >= 0) {
      const sectionsArrayStart = objectString.indexOf('[', sectionsStart);
      if (sectionsArrayStart >= 0) {
        sectionsEnd = findMatchingBrace(objectString, sectionsArrayStart);
      }
    }
    
    // Extrahovat chords (deprecated, ale může být přítomno)
    // Musíme najít chords array, který není uvnitř sections
    let chords: string[] | undefined;
    
    // Najít všechny výskyty "chords:"
    let chordsPos = objectString.indexOf('chords:');
    while (chordsPos >= 0) {
      // Zkontrolovat, jestli není uvnitř sections
      if (sectionsStart < 0 || chordsPos < sectionsStart || (sectionsEnd >= 0 && chordsPos > sectionsEnd)) {
        const arrayStart = objectString.indexOf('[', chordsPos);
        if (arrayStart >= 0) {
          const arrayEnd = findMatchingBrace(objectString, arrayStart);
          if (arrayEnd >= 0) {
            const chordsStr = objectString.substring(arrayStart + 1, arrayEnd);
            chords = chordsStr
              .split(',')
              .map((c) => c.trim().replace(/["']/g, ''))
              .filter((c) => c);
            break;
          }
        }
      }
      // Najít další výskyt
      chordsPos = objectString.indexOf('chords:', chordsPos + 1);
    }

    // Extrahovat sections pomocí findMatchingBrace
    let sections: SongInput['sections'] | undefined;
    if (sectionsStart >= 0) {
      const arrayStart = objectString.indexOf('[', sectionsStart);
      if (arrayStart >= 0) {
        const arrayEnd = findMatchingBrace(objectString, arrayStart);
        if (arrayEnd >= 0) {
          const sectionsStr = objectString.substring(arrayStart + 1, arrayEnd);
          sections = parseSections(sectionsStr);
          if (sections && sections.length > 0) {
            console.log(`Načteno ${sections.length} sekcí pro píseň: ${title}`);
          }
        } else {
          console.warn(`Nenalezen konec sections array pro píseň: ${title}`);
        }
      } else {
        console.warn(`Nenalezen začátek sections array pro píseň: ${title}`);
      }
    }

    const result: SongInput = {
      title,
      artist,
    };
    
    if (chords && chords.length > 0) {
      result.chords = chords;
    }
    
    if (sections && sections.length > 0) {
      result.sections = sections;
    }
    
    return result;
  } catch (error) {
    console.error('Chyba při parsování song objektu:', error);
    return null;
  }
}

/**
 * Najde odpovídající závorku
 */
function findMatchingBrace(str: string, startPos: number): number {
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = startPos; i < str.length; i++) {
    const char = str[i];
    const prevChar = i > 0 ? str[i - 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    if (!inString) {
      if (char === '[') braceCount++;
      if (char === ']') {
        braceCount--;
        if (braceCount === 0) return i;
      }
    }
  }
  
  return -1;
}

/**
 * Parsuje sections array
 */
function parseSections(sectionsString: string): SongInput['sections'] {
  const sections: SongInput['sections'] = [];
  let braceCount = 0;
  let currentSection = '';
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < sectionsString.length; i++) {
    const char = sectionsString[i];
    const prevChar = i > 0 ? sectionsString[i - 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    if (!inString) {
      if (char === '{') {
        if (braceCount === 0) {
          currentSection = '';
        }
        braceCount++;
        currentSection += char;
      } else if (char === '}') {
        currentSection += char;
        braceCount--;
        
        if (braceCount === 0 && currentSection.trim()) {
          try {
            const section = parseSection(currentSection);
            if (section) {
              sections.push(section);
            }
          } catch (error) {
            console.warn('Chyba při parsování sekce:', error);
          }
          currentSection = '';
        }
      } else if (braceCount > 0) {
        currentSection += char;
      }
    } else {
      if (braceCount > 0) {
        currentSection += char;
      }
    }
  }

  return sections.length > 0 ? sections : undefined;
}

/**
 * Parsuje jednu sekci
 */
function parseSection(sectionString: string): SongInput['sections']![0] | null {
  try {
    // Extrahovat type
    const typeMatch = sectionString.match(/type:\s*["']([^"']+)["']/);
    if (!typeMatch) return null;
    const type = typeMatch[1] as SongInput['sections']![0]['type'];

    // Extrahovat label (volitelný)
    const labelMatch = sectionString.match(/label:\s*["']([^"']+)["']/);
    const label = labelMatch ? labelMatch[1] : undefined;

    // Extrahovat chords - najít array uvnitř sekce pomocí lepšího přístupu
    const chordsStart = sectionString.indexOf('chords:');
    if (chordsStart < 0) return null;
    
    const arrayStart = sectionString.indexOf('[', chordsStart);
    if (arrayStart < 0) return null;
    
    const arrayEnd = findMatchingBrace(sectionString, arrayStart);
    if (arrayEnd < 0) return null;
    
    const chordsStr = sectionString.substring(arrayStart + 1, arrayEnd);
    const chords = chordsStr
      .split(',')
      .map((c) => c.trim().replace(/["']/g, ''))
      .filter((c) => c);

    return {
      type,
      ...(label ? { label } : {}),
      chords,
    };
  } catch (error) {
    console.error('Chyba při parsování sekce:', error);
    return null;
  }
}

/**
 * Alternativní metoda: Parsuje vložený TypeScript kód z textarea
 */
export function parseTypeScriptCode(code: string): SongInput[] {
  return parseTypeScriptFile(code);
}
