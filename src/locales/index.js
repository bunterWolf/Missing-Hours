// All UI translations, one JSON file per language (codes as in src/i18n/languages.js).
// A new key goes into every file in the same commit; src/i18n/locales.test.js checks that.
import en from './en.json';
import de from './de.json';
import fr from './fr.json';
import es from './es.json';
import it from './it.json';
import ptBR from './pt-BR.json';
import nl from './nl.json';
import pl from './pl.json';
import ja from './ja.json';
import ko from './ko.json';
import zhHans from './zh-Hans.json';
import zhHant from './zh-Hant.json';

export default {
  en,
  de,
  fr,
  es,
  it,
  'pt-BR': ptBR,
  nl,
  pl,
  ja,
  ko,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
};
