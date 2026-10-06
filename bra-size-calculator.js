/* Measured's bra size calculator (Phase 385). Built by release/site.js from the repository: the extension's own sizing code (src/sizingConstants.js, src/fitEngine.js, src/sizeLabelReader.js, src/europeanBandLabels.js, src/measurementValidation.js, src/fitInstructionParser.js, src/cupInstructionParser.js, src/chartMatcher.js, src/letterConsensus.js, src/styleAdjustment.js, src/cupLadder.js, src/brandFormula.js, src/cupDisplay.js, src/shopifyVariantFeed.js, src/sizeAvailability.js, src/alphaSizeAvailability.js, src/badgeCopy.js, src/decideAnswer.js), then release/calculator/answers.js and release/calculator/ui.js and release/calculator/page.js, comments out. Not edited by hand. */
/* src/sizingConstants.js */
const SIZING_CONSTANTS = (() => {
const freeze = (value) => Object.freeze(value);
const CUP_LETTERS = freeze(['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']);
const VALID_BANDS = freeze([28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54]);
const SUB_LADDER_BANDS = freeze([24, 26]);
const ALPHA_SIZE_ORDER = freeze(['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);
const PLUS_SIZE_ORDER = freeze(['1X', '2X', '3X', '4X', '5X']);
const PLUS_LETTER_EQUIVALENTS = freeze({ XXL: '1X', XXXL: '2X' });
const LETTER_SPELLINGS = freeze({ '2XS': 'XXS', '2XL': 'XXL', '3XL': 'XXXL', XXXXL: '4XL' });
const MAX_CANDIDATES = 3;
const CATEGORY_ORDER = freeze(['sister', 'same-band', 'band-only', 'nearest']);
const MAX_BAND_SUBSTITUTION_STEPS = 1;
const MAX_SUBSTITUTE_INCHES = 4;
const MAX_SAME_BAND_CUP_STEPS = 1;
const MAX_ALPHA_SUBSTITUTION_DISTANCE = 1;
const RATING_LADDER = freeze(['Great match', 'Good match', 'Likely fits', 'Uncertain, check size chart']);
const WIDE_RANGE_INCHES = 4;
const WIDE_RANGE_PENALTY = 0.3;
const AMBIGUITY_PENALTY = 0.25;
const NEAR_MISS_TOLERANCE_INCHES = 1.5;
const NEAR_MISS_EDGE_POSITION = 0.5;
const NEAR_MISS_DECAY = 0.15;
const NEAR_MISS_SCORE_CEILING = NEAR_MISS_EDGE_POSITION - NEAR_MISS_DECAY;
const EXACT_MATCH_FLOOR = 0.8;
const LIST_SISTER_POSITION = 0.4;
const SINGLE_VALUE_REACH_INCHES = 2;
const PLAUSIBLE_INCHES = freeze({ bust: freeze([26, 65]), underbust: freeze([20, 60]) });
const POSSIBLE_INCHES = freeze({ bust: freeze([22, 75]), underbust: freeze([18, 65]) });
const CHART_ROW_LIMITS_INCHES = freeze({ underbust: freeze([20, 62]), bust: freeze([24, 72]) });
const CHART_ROW_WIDEST_RANGE_INCHES = 10;
const NEAR_EDGE_POSITION = 0.6;
const TIER_SCORE_CENTRED = 0.9;
const TIER_SCORE_COMFORTABLE = 0.75;
const TIER_SCORE_POSSIBLE = 0.4;
const CHART_DETAIL_POSITION = 0.5;
const SCORE_TOLERANCE = 1e-9;
const CM_PER_INCH = 2.54;
const CHART_CM_FROM = 58;
const CHART_INCHES_TO = 60;
const CHART_LIST_SHARE = 0.7;
const PAGE_SIZE_CHART_LIMIT = 16;
const PAGE_CHART_MIN_ROWS = 2;
const PAGE_CHART_MAX_ROWS = 400;
const MIN_BUCKETS_FOR_A_USABLE_CHART = 2;
const CARD_LINE_WORD_LIMIT = 20;
const NUMBER_WORDS = freeze(['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
const MIN_VOTES = 3;
const CLOSE_VOTE_SHARE = 0.15;
return freeze({
CUP_LETTERS, VALID_BANDS, SUB_LADDER_BANDS, ALPHA_SIZE_ORDER, PLUS_SIZE_ORDER, PLUS_LETTER_EQUIVALENTS, LETTER_SPELLINGS,
MAX_CANDIDATES, CATEGORY_ORDER, MAX_BAND_SUBSTITUTION_STEPS, MAX_SUBSTITUTE_INCHES, MAX_SAME_BAND_CUP_STEPS, MAX_ALPHA_SUBSTITUTION_DISTANCE,
RATING_LADDER,
WIDE_RANGE_INCHES, WIDE_RANGE_PENALTY, AMBIGUITY_PENALTY, NEAR_MISS_TOLERANCE_INCHES, NEAR_MISS_EDGE_POSITION, NEAR_MISS_DECAY,
NEAR_MISS_SCORE_CEILING, EXACT_MATCH_FLOOR, LIST_SISTER_POSITION, SINGLE_VALUE_REACH_INCHES, PLAUSIBLE_INCHES, POSSIBLE_INCHES,
CHART_ROW_LIMITS_INCHES, CHART_ROW_WIDEST_RANGE_INCHES, NEAR_EDGE_POSITION, TIER_SCORE_CENTRED, TIER_SCORE_COMFORTABLE,
TIER_SCORE_POSSIBLE, CHART_DETAIL_POSITION, SCORE_TOLERANCE,
CM_PER_INCH, CHART_CM_FROM, CHART_INCHES_TO, CHART_LIST_SHARE, PAGE_SIZE_CHART_LIMIT, PAGE_CHART_MIN_ROWS, PAGE_CHART_MAX_ROWS,
MIN_BUCKETS_FOR_A_USABLE_CHART,
CARD_LINE_WORD_LIMIT, NUMBER_WORDS,
MIN_VOTES, CLOSE_VOTE_SHARE,
});
})();
if (typeof module !== 'undefined' && module.exports) {
module.exports = SIZING_CONSTANTS;
}
/* src/fitEngine.js */
const _feK = (typeof module !== 'undefined' && module.exports) ? require('./sizingConstants') : SIZING_CONSTANTS;
const CUP_LETTERS = _feK.CUP_LETTERS;
const VALID_BANDS = _feK.VALID_BANDS;
const SUB_LADDER_BANDS = _feK.SUB_LADDER_BANDS;
function rawBandSize(underbustInches) {
if (typeof underbustInches !== 'number' || !Number.isFinite(underbustInches) || underbustInches <= 0) {
throw new Error('underbustInches must be a positive number');
}
return 2 * Math.round(underbustInches / 2);
}
function exceedsBandLadder(underbustInches) {
const raw = rawBandSize(underbustInches);
return raw > VALID_BANDS[VALID_BANDS.length - 1] || raw < VALID_BANDS[0];
}
function calculateBandSize(underbustInches) {
const band = rawBandSize(underbustInches);
return VALID_BANDS.reduce((closest, candidate) =>
Math.abs(candidate - band) < Math.abs(closest - band) ? candidate : closest
);
}
const CUP_LADDER_MAX_DIFFERENCE = CUP_LETTERS.length - 1;
function cupDifference(bustInches, bandSize) {
return Math.round(bustInches - bandSize);
}
function measuredCupStep(underbustInches, bustInches, bandSize) {
const difference = bustInches - (underbustInches + bandSize) / 2;
return roundHalfUp(difference);
}
function roundHalfUp(value) {
return Math.round(Math.round(value * 1e6) / 1e6);
}
function exceedsCupLadder(bustInches, bandSize) {
return cupDifference(bustInches, bandSize) > CUP_LADDER_MAX_DIFFERENCE;
}
function calculateCupSize(bustInches, bandSize) {
if (typeof bustInches !== 'number' || !Number.isFinite(bustInches) || bustInches <= 0) {
throw new Error('bustInches must be a positive number');
}
const diff = cupDifference(bustInches, bandSize);
const index = Math.max(0, Math.min(diff, CUP_LADDER_MAX_DIFFERENCE));
return CUP_LETTERS[index];
}
function calculateSize(underbustInches, bustInches) {
if (typeof bustInches !== 'number' || !Number.isFinite(bustInches) || bustInches <= 0) {
throw new Error('bustInches must be a positive number');
}
const band = calculateBandSize(underbustInches);
const step = measuredCupStep(underbustInches, bustInches, band);
const cup = CUP_LETTERS[Math.max(0, Math.min(step, CUP_LADDER_MAX_DIFFERENCE))];
const size = { band, cup, label: `${band}${cup}` };
if (step > CUP_LADDER_MAX_DIFFERENCE) {
size.beyondLadder = true;
size.trueDifference = step;
}
if (exceedsBandLadder(underbustInches)) {
const trueBand = rawBandSize(underbustInches);
if (SUB_LADDER_BANDS.includes(trueBand) && band === VALID_BANDS[0]) {
const steps = (band - trueBand) / 2;
const ownStep = step + steps;
if (step >= 0 && ownStep <= CUP_LADDER_MAX_DIFFERENCE) {
const ownCup = CUP_LETTERS[ownStep];
size.belowBandFloor = { band: trueBand, cup: ownCup, label: `${trueBand}${ownCup}`, steps };
return size;
}
}
size.beyondBandLadder = true;
size.trueBand = trueBand;
}
return size;
}
function belowFloorClaimSize(adjusted, base28, steps, claimSteps) {
if (!adjusted || !base28 || base28.band !== VALID_BANDS[0] || !(steps >= 1) || !claimSteps) return null;
const baseIndex = CUP_LETTERS.indexOf(base28.cup);
const shownIndex = CUP_LETTERS.indexOf(adjusted.cup);
if (baseIndex === -1 || shownIndex === -1) return null;
const cupIndex = baseIndex + steps + (shownIndex - baseIndex);
const band = VALID_BANDS[0] - 2 * steps + 2 * claimSteps;
if (cupIndex < 0 || cupIndex > CUP_LADDER_MAX_DIFFERENCE) return null;
const cup = CUP_LETTERS[cupIndex];
if (band >= VALID_BANDS[0]) {
return VALID_BANDS.includes(band) ? { band, cup, label: `${band}${cup}` } : null;
}
if (!SUB_LADDER_BANDS.includes(band)) return null;
const ownSteps = (VALID_BANDS[0] - band) / 2;
const sisterIndex = cupIndex - ownSteps;
if (sisterIndex < 0) return null;
const sister = { band: VALID_BANDS[0], cup: CUP_LETTERS[sisterIndex], label: `${VALID_BANDS[0]}${CUP_LETTERS[sisterIndex]}` };
return { band, cup, label: `${band}${cup}`, belowBandFloor: { band, cup, label: `${band}${cup}`, steps: ownSteps, sister } };
}
function belowFloorSize(size, steps) {
if (!size || size.band !== VALID_BANDS[0] || !(steps >= 1)) return null;
const cupIndex = CUP_LETTERS.indexOf(size.cup);
if (cupIndex === -1 || cupIndex + steps > CUP_LADDER_MAX_DIFFERENCE) return null;
const band = VALID_BANDS[0] - 2 * steps;
const cup = CUP_LETTERS[cupIndex + steps];
return { band, cup, label: `${band}${cup}` };
}
function getSisterSizes(band, cup) {
const cupIndex = CUP_LETTERS.indexOf(cup);
if (cupIndex === -1) throw new Error(`Unknown cup letter: ${cup}`);
const bandIndex = VALID_BANDS.indexOf(band);
if (bandIndex === -1) throw new Error(`Unknown band size: ${band}`);
const result = {};
if (bandIndex < VALID_BANDS.length - 1 && cupIndex > 0) {
const upBand = VALID_BANDS[bandIndex + 1];
const upCup = CUP_LETTERS[cupIndex - 1];
result.sizeUp = { band: upBand, cup: upCup, label: `${upBand}${upCup}` };
}
if (bandIndex > 0 && cupIndex < CUP_LETTERS.length - 1) {
const downBand = VALID_BANDS[bandIndex - 1];
const downCup = CUP_LETTERS[cupIndex + 1];
result.sizeDown = { band: downBand, cup: downCup, label: `${downBand}${downCup}` };
}
return result;
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
CUP_LETTERS,
VALID_BANDS,
SUB_LADDER_BANDS,
belowFloorClaimSize,
belowFloorSize,
CUP_LADDER_MAX_DIFFERENCE,
calculateBandSize,
rawBandSize,
exceedsBandLadder,
calculateCupSize,
cupDifference,
measuredCupStep,
roundHalfUp,
exceedsCupLadder,
calculateSize,
getSisterSizes,
};
}
/* src/sizeLabelReader.js */
const _slrCupName = '(?:AAA|AA|DDDDD|DDDD|DDD|DD|FF|GG|HH|JJ|KK|LL|[A-R])';
const _slrAnyLetters = '[A-Z]{1,4}';
const _slrHalf = '(?:\\s?½|\\s?-?\\s?1\\/2|\\.5)';
const _slrLetterAbbrev = '(?:X{1,4}S|[2-6]XS|S|M|X{0,4}L|[1-9]XL|[0-9]X)';
const _slrLetterShort = '(?:SML|SM|MED|MD|LRG|LG)';
const _slrShortToLetter = { SM: 'S', SML: 'S', MD: 'M', MED: 'M', LG: 'L', LRG: 'L' };
const _slrWordToLetter = {
XXSMALL: 'XXS',
XSMALL: 'XS',
EXTRASMALL: 'XS',
SMALL: 'S',
MEDIUM: 'M',
LARGE: 'L',
XLARGE: 'XL',
EXTRALARGE: 'XL',
XXLARGE: 'XXL',
XXXLARGE: 'XXXL',
'3XLARGE': 'XXXL',
};
const _slrNumberedLargeRe = /^([2-9])XLARGE$/;
const _slrNumberedSmallRe = /^([2-6])XSMALL$/;
const _slrOneSizeRe = /^(?:ONE\s?SIZE(?:\s?FITS\s?(?:ALL|MOST))?|OS|O\/S|OSFA|OSFM|TU|1SZ)$/;
const _slrStockNoteRe = /\s*(?:[-\u2013\u2014:|]\s*|\(\s*)(only\s+(?:one|\d+)\s+left|low\s+(?:in\s+)?stock|sold\s*out|out\s+of\s+stock|unavailable|no\s+longer\s+available|back\s*order(?:ed)?|pre-?order)\s*\)?\s*\.?$/i;
const _slrPackCount = '(?:SINGLE(?:\\s?PACK)?|\\d{1,2}\\s?-?\\s?(?:PACKS?|PK|PCS|PIECES?|COUNT)|(?:PACK|SET)\\s?OF\\s?\\d{1,2})';
const _slrPackCountAfterRe = new RegExp(`^(.*?[0-9A-Z+½)])\\s*(?:[-,/|:]\\s*)?\\(?\\s*${_slrPackCount}\\s*\\)?$`);
const _slrPackCountBeforeRe = new RegExp(`^\\(?${_slrPackCount}\\)?\\s*[-,/|:]?\\s+(.+)$`);
const _slrSystemWord = '(?:US|USA|UK|EU|EUR|FR|IT|AU|INT)';
const _slrSystemNames = { US: 'us', USA: 'us', UK: 'uk', EU: 'eu', EUR: 'eu', FR: 'fr', IT: 'it', AU: 'au', INT: 'int' };
const _slrRe = (body) => new RegExp(`^${body}$`);
const _slrCupHalfRe = _slrRe(`(${_slrCupName})(${_slrHalf})?`);
const _slrCupBracketRe = _slrRe(`(${_slrCupName})(${_slrHalf})?\\s*\\(\\s*(${_slrCupName})(${_slrHalf})?\\s*\\)`);
const _slrCupSlashRe = _slrRe(`(${_slrCupName})(${_slrHalf})?\\s*\\/\\s*(${_slrCupName})(${_slrHalf})?`);
const _slrCupRangeRe = _slrRe(`(${_slrCupName})(${_slrHalf})?\\s*[-&]\\s*(${_slrCupName})(${_slrHalf})?(\\+)?`);
const _slrCupOpenRe = _slrRe(`(${_slrCupName})\\+`);
function sizeLabelBandSystems(n, digits) {
const systems = [];
if (!Number.isInteger(n)) return systems;
if (n >= 24 && n <= 58) systems.push('inch');
if (n >= 60 && n <= 130 && n % 5 === 0) systems.push('eu');
if (n >= 75 && n <= 145 && n % 5 === 0) systems.push('fr');
if (n >= 6 && n <= 26 && n % 2 === 0) systems.push('au');
if (digits === 1 && n >= 1 && n <= 8) systems.push('it');
return systems;
}
function _slrClean(raw) {
const noise = [];
let text = String(raw == null ? '' : raw)
.replace(/[\u00a0\u2007\u202f\t\r\n]+/g, ' ')
.replace(/[\u2010-\u2015\u2212]/g, '-')
.replace(/\s+/g, ' ')
.trim();
const note = _slrStockNoteRe.exec(text);
if (note && note.index > 0) {
noise.push('stock note');
text = text.slice(0, note.index).trim();
}
let upper = text.toUpperCase();
const quoted = /^["'](.*)["']$/.exec(upper);
if (quoted) {
noise.push('quotes');
upper = quoted[1].trim();
}
const prefixed = /^(?:SIZE|SZ)\s*[:.]?\s+(.+)$/.exec(upper);
if (prefixed) {
noise.push('size prefix');
upper = prefixed[1];
}
const bracketed = /^\((\d{2,3})\)\s*(.+)$/.exec(upper);
if (bracketed) {
if (bracketed[2].startsWith(bracketed[1])) {
noise.push('repeated band');
upper = bracketed[2];
} else if (_slrReadCup(bracketed[2])) {
noise.push('bracketed band');
upper = `${bracketed[1]}${bracketed[2]}`;
}
}
const garment = /^(.*[0-9A-Z])\s?WOMEN'?S$/.exec(upper);
if (garment && /\d/.test(garment[1])) {
noise.push('garment word');
upper = garment[1];
}
const pack = _slrPackCountAfterRe.exec(upper) || _slrPackCountBeforeRe.exec(upper);
if (pack && pack[1].trim()) {
noise.push('pack count');
upper = pack[1];
}
return { text, upper: upper.trim(), noise };
}
function _slrReadCup(text) {
const t = String(text || '').trim().replace(/\s?-?\s?CUPS?$/, '');
let m = _slrCupHalfRe.exec(t);
if (m) return { cup: m[1], cupHalf: !!m[2] };
m = _slrCupBracketRe.exec(t);
if (m) return { cup: m[1], cupHalf: !!m[2], cupAlso: m[3], cupAlsoHalf: !!m[4], cupJoin: 'bracket' };
m = _slrCupSlashRe.exec(t);
if (m) return { cup: m[1], cupHalf: !!m[2], cupAlso: m[3], cupAlsoHalf: !!m[4], cupJoin: 'slash' };
m = _slrCupRangeRe.exec(t);
if (m) {
const range = { cupRange: [m[1], m[3]], cupRangeOpen: !!m[5] };
if (m[2] || m[4]) range.cupRangeHalf = [!!m[2], !!m[4]];
return range;
}
m = _slrCupOpenRe.exec(t);
if (m) return { cupRange: [m[1], null], cupRangeOpen: true };
return null;
}
function _slrReadLetter(text) {
const mod = /^(.*?)\s?(\+\+|\+|-|PLUS)?$/.exec(String(text || '').trim());
const body = mod[1].trim();
const modifier = mod[2] || null;
if (!body) return null;
if (_slrRe(_slrLetterAbbrev).test(body)) return { letter: body, spelling: 'abbreviation', modifier };
if (_slrRe(_slrLetterShort).test(body)) return { letter: _slrShortToLetter[body], spelling: 'short', modifier };
if (/^[A-Z0-9]+(?:[ -][A-Z0-9]+)*$/.test(body)) {
const key = body.replace(/[ -]/g, '');
if (_slrWordToLetter[key]) return { letter: _slrWordToLetter[key], spelling: 'word', modifier };
const large = _slrNumberedLargeRe.exec(key);
if (large) return { letter: `${large[1]}XL`, spelling: 'word', modifier };
const small = _slrNumberedSmallRe.exec(key);
if (small) return { letter: `${small[1]}XS`, spelling: 'word', modifier };
}
return null;
}
function _slrReadLetters(text) {
const asPair = (read) => {
const spellings = [...new Set(read.map((r) => r.spelling))];
return { letters: read.map((r) => r.letter), spelling: spellings.length === 1 ? spellings[0] : 'mixed' };
};
for (const sep of [/\s*\/\s*/, /\s*-\s*/]) {
const parts = String(text || '').split(sep);
if (parts.length < 2) continue;
const read = parts.map(_slrReadLetter);
if (read.every((r) => r && !r.modifier)) return asPair(read);
}
const dashes = String(text || '').split(/\s*-\s*/);
if (dashes.length > 2) {
const splits = [];
for (let i = 1; i < dashes.length; i += 1) {
const halves = [dashes.slice(0, i).join('-'), dashes.slice(i).join('-')].map(_slrReadLetter);
if (halves.every((r) => r && !r.modifier)) splits.push(halves);
}
if (splits.length === 1) return asPair(splits[0]);
}
return null;
}
function _slrSplitSystem(text) {
let m = new RegExp(`^(.+?)\\s(${_slrSystemWord})(?:\\s?(?:&|AND|\\/)\\s?(${_slrSystemWord}))?$`).exec(text);
if (m) return { body: m[1], system: _slrSystemNames[m[2]] + (m[3] ? `+${_slrSystemNames[m[3]]}` : '') };
m = new RegExp(`^(${_slrSystemWord})\\s(.+)$`).exec(text);
if (m) return { body: m[2], system: _slrSystemNames[m[1]] };
return null;
}
function _slrEmpty() {
return {
system: 'unknown',
band: null,
bandSystems: [],
bandSpaced: false,
cup: null,
cupHalf: false,
cupAlso: null,
cupAlsoHalf: false,
cupJoin: null,
cupRange: null,
cupRangeOpen: false,
cupRangeHalf: null,
cupFirst: false,
labelSystem: null,
letter: null,
letterSpelling: null,
letterModifier: null,
letterIsCupName: false,
letters: null,
number: null,
sizes: null,
scaleName: null,
also: null,
alsoSize: null,
};
}
function _slrReadCore(t) {
const banded = /^(\d{1,3})(\s?)(.+)$/.exec(t);
if (banded) {
const cup = _slrReadCup(banded[3]);
if (cup) {
const n = Number(banded[1]);
return { system: 'band_cup', band: n, bandSystems: sizeLabelBandSystems(n, banded[1].length), bandSpaced: !!banded[2], ...cup };
}
}
const cupFirst = new RegExp(`^(${_slrCupName})\\s?(\\d{2,3})$`).exec(t);
if (cupFirst) {
const n = Number(cupFirst[2]);
return { system: 'band_cup', band: n, bandSystems: sizeLabelBandSystems(n, cupFirst[2].length), cup: cupFirst[1], cupFirst: true };
}
if (/^\d{1,3}(?:\.\d)?$/.test(t)) {
const n = Number(t);
return { system: 'number', number: n, bandSystems: sizeLabelBandSystems(n, t.includes('.') ? 0 : t.length) };
}
if (_slrOneSizeRe.test(t)) return { system: 'one_size' };
const letter = _slrReadLetter(t);
if (letter) {
const alsoCup = letter.spelling === 'abbreviation' && !letter.modifier && _slrRe(_slrCupName).test(t);
return { system: 'letter', letter: letter.letter, letterSpelling: letter.spelling, letterModifier: letter.modifier, letterIsCupName: alsoCup };
}
const letters = _slrReadLetters(t);
if (letters) return { system: 'letter_pair', letters: letters.letters, letterSpelling: letters.spelling };
const letterCup = _slrReadLetterCup(t);
if (letterCup) return { system: 'letter_cup', ...letterCup };
const cup = _slrReadCup(t);
if (cup) return { system: 'cup', ...cup };
if (_slrIsMeasurement(t)) return { system: 'measurement' };
return null;
}
function _slrReadLetterCup(t) {
const letterPart = `(${_slrLetterAbbrev}|${_slrLetterShort})`;
const tries = [
new RegExp(`^${letterPart}\\s*\\(\\s*(.+?)\\s*\\)$`),
new RegExp(`^${letterPart}(?:\\s|\\s?-\\s?)(.+)$`),
new RegExp(`^${letterPart}(${_slrCupName}\\s*-\\s*${_slrCupName}\\+?)$`),
];
for (const re of tries) {
const m = re.exec(t);
if (!m) continue;
const cup = _slrReadCup(m[2]);
if (!cup || cup.cupHalf || cup.cupJoin === 'bracket') continue;
if (!cup.cupRange && !cup.cupAlso && _slrReadLetter(cup.cup)) continue;
return {
letter: _slrShortToLetter[m[1]] || m[1],
letterSpelling: _slrShortToLetter[m[1]] ? 'short' : 'abbreviation',
...cup,
};
}
return null;
}
function _slrIsMeasurement(t) {
const withoutUnits = t.replace(/(?:INCHES|INCH|IN|CM|MM)\b\.?/g, ' ');
const namesItsUnit = withoutUnits !== t;
if (/[A-Z]/.test(withoutUnits)) return false;
const numbers = withoutUnits.match(/\d+(?:\.\d+)?/g) || [];
if (numbers.length === 2) return true;
if (numbers.length !== 1) return false;
return namesItsUnit || /[^0-9.\s]/.test(withoutUnits);
}
function _slrSummary(read) {
const out = { system: read.system };
['band', 'cup', 'cupAlso', 'cupRange', 'letter', 'letters', 'number', 'numbers', 'sizes', 'labelSystem'].forEach((k) => {
if (read[k] != null && read[k] !== false) out[k] = read[k];
});
return out;
}
function _slrReadListSize(text) {
const core = _slrReadCore(text.trim());
return core && core.system === 'band_cup' && !core.cupFirst ? core : null;
}
function _slrReadDecorated(t) {
const listed = new RegExp(`^\\(\\s*([^()]+?)\\s*\\)\\s*(\\d{2})(?:\\s?-\\s?(\\d{2}))?\\s?(${_slrCupName})(?:\\s?\\/\\s?(${_slrCupName}))?$`).exec(t);
if (listed) {
const letter = _slrReadCore(listed[1]);
const from = Number(listed[2]);
const to = listed[3] ? Number(listed[3]) : from;
if (letter && letter.system === 'letter' && to >= from && to - from <= 12 && (to - from) % 2 === 0) {
const sizes = [];
for (let band = from; band <= to; band += 2) {
sizes.push(listed[5] ? { band, cup: null, cupRange: [listed[4], listed[5]] } : { band, cup: listed[4] });
}
return { ...letter, letterIsCupName: false, also: { system: 'band_cup_list', sizes } };
}
}
const twoSystems = new RegExp(`^(${_slrSystemWord})\\s(.+?)\\s-\\s(${_slrSystemWord})\\s(.+)$`).exec(t);
if (twoSystems) {
const side = (text) => { const cup = _slrReadCup(text); return cup ? { system: 'cup', ...cup } : _slrReadCore(text); };
const a = side(twoSystems[2]);
const b = side(twoSystems[4]);
if (a && b && a.system === b.system && (a.system === 'cup' || a.system === 'band_cup') && !a.cupAlso && !b.cupAlso) {
return { ...a, labelSystem: _slrSystemNames[twoSystems[1]], also: { ..._slrSummary(b), labelSystem: _slrSystemNames[twoSystems[3]] } };
}
}
const marked = _slrSplitSystem(t);
if (marked) {
const core = _slrReadCore(marked.body);
if (core && (core.system === 'band_cup' || core.system === 'cup')) return { ...core, labelSystem: marked.system };
}
const named = /^([A-Z]{1,2}\d{1,2})\s-\s(.+)$/.exec(t);
const listText = named ? named[2] : t;
const parts = listText.split(/\s*[/,]\s*/);
if (parts.length >= 2 && parts.every((p) => /^\d/.test(p))) {
const sizes = parts.map(_slrReadListSize);
if (sizes.every(Boolean)) {
return { system: 'band_cup_list', sizes: sizes.map(_slrListEntry), scaleName: named ? named[1] : null };
}
}
const bracket = /^(.+?)\s?\(\s*(.+?)\s*\)$/.exec(t);
if (bracket) {
const outer = _slrReadCore(bracket[1].trim());
const inner = _slrReadBracket(bracket[2]);
if (outer && inner && ['number', 'letter', 'letter_pair'].includes(outer.system)) {
return { ...outer, letterIsCupName: false, also: inner };
}
}
const slashed = /^(\d{1,2})\s?\/\s?(.+)$/.exec(t);
if (slashed) {
const other = _slrReadCore(slashed[2]);
if (other && (other.system === 'letter' || other.system === 'letter_pair')) {
const n = Number(slashed[1]);
return { system: 'number', number: n, bandSystems: sizeLabelBandSystems(n, slashed[1].length), also: _slrSummary(other) };
}
}
return null;
}
function _slrListEntry(read) {
const entry = { band: read.band, cup: read.cup };
if (read.cupRange) { entry.cup = null; entry.cupRange = read.cupRange; }
if (read.cupAlso) entry.cupAlso = read.cupAlso;
return entry;
}
function _slrReadBracket(text) {
let t = String(text || '').trim();
let labelSystem = null;
const marked = new RegExp(`^(.+?)\\s(${_slrSystemWord})$`).exec(t);
if (marked) { t = marked[1]; labelSystem = _slrSystemNames[marked[2]]; }
const numbers = /^(\d{1,2}(?:\.\d)?)(?:\s?-\s?(\d{1,2}(?:\.\d)?))?$/.exec(t);
if (numbers) {
const out = { system: 'number', numbers: numbers[2] ? [Number(numbers[1]), Number(numbers[2])] : [Number(numbers[1])] };
if (labelSystem) out.labelSystem = labelSystem;
return out;
}
if (labelSystem) return null;
const core = _slrReadCore(t);
if (core && ['letter', 'letter_pair'].includes(core.system) && !core.letterModifier) return _slrSummary(core);
const cups = _slrReadCup(t);
if (cups && cups.cupRange) return { system: 'cup', cupRange: cups.cupRange };
const parts = t.split(/\s*,\s*/);
if (parts.length >= 1 && parts.every((p) => /^\d/.test(p))) {
const sizes = parts.map(_slrReadListSize);
if (sizes.every(Boolean)) return { system: 'band_cup_list', sizes: sizes.map(_slrListEntry) };
}
return null;
}
function readSizeLabel(label) {
const clean = _slrClean(label);
const t = clean.upper;
const out = { raw: typeof label === 'string' ? label : String(label == null ? '' : label), text: t, ..._slrEmpty(), noise: clean.noise };
if (!t) return out;
const dual = new RegExp(`^(\\d{2,3})\\s?(${_slrAnyLetters})\\s*\\(\\s*(?:(?:US|USA)\\s+(\\d{2,3})\\s?(${_slrAnyLetters}(?:\\/${_slrAnyLetters})?)|(\\d{2,3})\\s?(${_slrAnyLetters}(?:\\/${_slrAnyLetters})?)\\s+(?:US|USA))\\s*\\)$`).exec(t);
if (dual) {
const n = Number(dual[1]);
const alsoCups = (dual[4] || dual[6]).split('/');
return {
...out,
system: 'band_cup',
band: n,
bandSystems: sizeLabelBandSystems(n, dual[1].length),
cup: dual[2],
alsoSize: { band: Number(dual[3] || dual[5]), cup: alsoCups[0], cupAlso: alsoCups[1] || null, labelSystem: 'us' },
};
}
const read = _slrReadCore(t) || _slrReadDecorated(t);
return read ? { ...out, ...read } : out;
}
const _slrSpellingNoise = ['repeated band', 'bracketed band', 'garment word', 'quotes', 'size prefix', 'pack count'];
function sizeLabelOnlySpelling(read) {
return !!read && read.noise.every((n) => _slrSpellingNoise.includes(n));
}
function sizeLabelIsMeasurement(text) {
const t = String(text == null ? '' : text).trim().toUpperCase();
return !!t && _slrIsMeasurement(t);
}
function isSizeLabelCupName(text) {
return _slrRe(_slrCupName).test(String(text || '').trim().toUpperCase());
}
function tidyPrintedSizeLabel(text) {
if (typeof text !== 'string') return text;
const read = readSizeLabel(text);
if (read.system !== 'band_cup' || read.noise.some((n) => n !== 'repeated band')) return text;
return text.trim()
.replace(/^\(\s*(\d{2,3})\s*\)\s*(?=\1(?!\d))/, '')
.replace(/^(\d{2,3})\s+(?=[A-Za-z])/, '$1')
.replace(/^(\d{2,3})([A-Za-z]+(?:\s*\/\s*[A-Za-z]+)*)/, (whole, band, cups) => `${band}${cups.toUpperCase()}`);
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
readSizeLabel,
sizeLabelBandSystems,
sizeLabelIsMeasurement,
sizeLabelOnlySpelling,
isSizeLabelCupName,
tidyPrintedSizeLabel,
};
}
/* src/europeanBandLabels.js */
const _ebLabelReader = (typeof module !== 'undefined' && module.exports) ? require('./sizeLabelReader') : null;
const _ebReadSizeLabel = _ebLabelReader ? _ebLabelReader.readSizeLabel : readSizeLabel;
const EUROPEAN_BAND_TABLE = {
eu: { 65: 30, 70: 32, 75: 34, 80: 36, 85: 38, 90: 40, 95: 42, 100: 44 },
fr: { 85: 32, 90: 34, 95: 36, 100: 38, 105: 40 },
it: { 1: 32, 2: 34, 3: 36, 4: 38, 5: 40 },
};
const _EB_SHARED_CUPS = ['AA', 'A', 'B', 'C', 'D'];
function readEuropeanLabel(label, bareBands) {
if (typeof label !== 'string' || !label.trim()) return null;
const read = _ebReadSizeLabel(label);
if (bareBands && read.system === 'number' && Number.isFinite(read.number) && read.number >= 60 && read.number <= 145 && read.number % 5 === 0) {
return { band: read.number, cup: null, marked: null };
}
if (read.system !== 'band_cup' || read.band == null || !read.cup || read.cupAlso || read.alsoSize || read.cupRange || read.cupHalf) return null;
const marked = read.labelSystem && ['eu', 'fr', 'it'].includes(read.labelSystem) ? read.labelSystem : null;
const band = Number(read.band);
if (!Number.isFinite(band)) return null;
const centimetres = band >= 60 && band <= 145 && band % 5 === 0;
const italian = band >= 1 && band <= 8;
if (!centimetres && !(italian && marked === 'it')) return null;
return { band, cup: String(read.cup).toUpperCase(), marked };
}
function printsCupRow(labels) {
const cups = new Set((labels || []).map((l) => (typeof l === 'string' ? _ebReadSizeLabel(l) : null)).filter((r) => r && r.system === 'cup' && r.cup).map((r) => r.cup));
return cups.size >= 2;
}
function listingEuropeanBandSystem(labels, brandEntry) {
const bare = printsCupRow(labels);
const reads = (labels || []).map((l) => readEuropeanLabel(l, bare)).filter(Boolean);
if (!reads.length) return null;
const marks = [...new Set(reads.map((r) => r.marked).filter(Boolean))];
if (marks.length === 1) return { system: marks[0], decidedBy: 'label' };
if (marks.length > 1) return null;
const declared = brandEntry && brandEntry.band_labels && brandEntry.band_labels.system;
if (['eu', 'fr', 'it'].includes(declared)) return { system: declared, decidedBy: 'brand' };
if (reads.every((r) => r.band >= 60) && reads.some((r) => r.band === 65 || r.band === 70)) return { system: 'eu', decidedBy: 'run' };
return null;
}
function usBandFor(band, system, brandEntry) {
const own = brandEntry && brandEntry.band_labels && brandEntry.band_labels.system === system && brandEntry.band_labels.bands;
if (own && Object.prototype.hasOwnProperty.call(own, String(band))) return Number(own[String(band)]);
const table = EUROPEAN_BAND_TABLE[system];
return table && Object.prototype.hasOwnProperty.call(table, band) ? table[band] : null;
}
function europeanBandRelabels(labels, brandEntry) {
const decided = listingEuropeanBandSystem(labels, brandEntry);
if (!decided) return null;
const cupPairs = (brandEntry && brandEntry.band_labels && brandEntry.band_labels.cups) || {};
const ownLetters = !!(brandEntry && brandEntry.cup_display && brandEntry.cup_display.vocabulary);
const renamed = {};
const unread = [];
const bare = printsCupRow(labels);
(labels || []).forEach((label) => {
const read = readEuropeanLabel(label, bare);
if (!read) return;
if (read.marked && read.marked !== decided.system) { unread.push(label); return; }
const us = usBandFor(read.band, decided.system, brandEntry);
if (us == null) { unread.push(label); return; }
if (read.cup == null) { renamed[label] = String(us); return; }
let cup = null;
if (_EB_SHARED_CUPS.includes(read.cup)) cup = read.cup;
else if (Object.prototype.hasOwnProperty.call(cupPairs, read.cup)) cup = String(cupPairs[read.cup]);
else if (ownLetters) cup = read.cup;
if (!cup) { unread.push(label); return; }
renamed[label] = `${us}${cup}`;
});
return { ...decided, renamed, unread };
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = { EUROPEAN_BAND_TABLE, readEuropeanLabel, listingEuropeanBandSystem, usBandFor, europeanBandRelabels };
}
/* src/measurementValidation.js */
const REALISTIC_BOUNDS_INCHES = {
underbust: [20, 60],
bust: [20, 70],
};
function sanitizeNumericInput(raw) {
if (!raw) return '';
const digitsAndDots = raw.replace(/[^0-9.]/g, '');
const firstDot = digitsAndDots.indexOf('.');
if (firstDot === -1) return digitsAndDots;
return digitsAndDots.slice(0, firstDot + 1) + digitsAndDots.slice(firstDot + 1).replace(/\./g, '');
}
function isRealisticMeasurement(value, field) {
if (typeof value !== 'number' || Number.isNaN(value)) return false;
const [min, max] = REALISTIC_BOUNDS_INCHES[field];
return value >= min && value <= max;
}
const _mvCmPerInch = ((typeof module !== 'undefined' && module.exports) ? require('./sizingConstants') : SIZING_CONSTANTS).CM_PER_INCH;
function validateMeasurements(underbust, bust, unit) {
if (Number.isNaN(underbust) || Number.isNaN(bust)) {
return { valid: false, message: 'Please enter both measurements as numbers.' };
}
const say = (inches) => (unit === 'cm' ? `${Math.round(inches * _mvCmPerInch * 10) / 10} cm` : `${inches}"`);
if (!isRealisticMeasurement(underbust, 'underbust')) {
const [min, max] = REALISTIC_BOUNDS_INCHES.underbust;
return { valid: false, message: `Underbust should be between ${say(min)} and ${say(max)}. Double check your measurement and unit.` };
}
if (!isRealisticMeasurement(bust, 'bust')) {
const [min, max] = REALISTIC_BOUNDS_INCHES.bust;
return { valid: false, message: `Bust should be between ${say(min)} and ${say(max)}. Double check your measurement and unit.` };
}
if (bust <= underbust) {
return { valid: false, message: 'Bust should be larger than underbust. Double check your measurements.' };
}
return { valid: true };
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = { sanitizeNumericInput, isRealisticMeasurement, validateMeasurements, REALISTIC_BOUNDS_INCHES };
}
/* src/fitInstructionParser.js */
const _fipNumberWords = { one: 1, two: 2, three: 3 };
function _fipWordToNumber(token) {
const n = parseInt(token, 10);
return Number.isNaN(n) ? (_fipNumberWords[(token || '').toLowerCase()] || null) : n;
}
const _fipBandPatterns = [
{ re: /size\s+up\s+(\d+|one|two|three)\s*band\s*sizes?/i, group: 1, direction: 1 },
{ re: /size\s+down\s+(\d+|one|two|three)\s*band\s*sizes?/i, group: 1, direction: -1 },
{ re: /(?:size|go|order)\s+up\s+(?:a|one)\s+band\s+size/i, fixed: 1, direction: 1 },
{ re: /(?:size|go|order)\s+down\s+(?:a|one)\s+band\s+size/i, fixed: 1, direction: -1 },
{ re: /runs?\s+small\s+in\s+the\s+band/i, fixed: 1, direction: 1 },
{ re: /runs?\s+(?:large|big)\s+in\s+the\s+band/i, fixed: 1, direction: -1 },
{ re: /\bband\s+runs?\s+small\b/i, fixed: 1, direction: 1 },
{ re: /\bband\s+runs?\s+(?:large|big)\b/i, fixed: 1, direction: -1 },
];
function parseBandAdjustment(fullText) {
const text = fullText || '';
for (const pattern of _fipBandPatterns) {
const re = new RegExp(pattern.re.source, 'gi');
let match;
while ((match = re.exec(text))) {
if (_fipSisterSizeFollows(text.slice(match.index + match[0].length), pattern.direction)) continue;
if (_fipClaimNegated(text, match)) continue;
const magnitude = pattern.fixed != null ? pattern.fixed : _fipWordToNumber(match[pattern.group]);
if (magnitude && magnitude <= _FIP_MAX_CLAIM_STEPS) return { direction: pattern.direction, magnitude, matchedText: match[0].trim() };
}
}
return null;
}
const _FIP_MAX_CLAIM_STEPS = 3;
const _FIP_NEGATED_BEFORE = /\b(?:do\s+not|don'?t|does\s+not|doesn'?t|did\s+not|didn'?t|never|no\s+need\s+to|not|nor|without|should\s+not|shouldn'?t|need\s+not|needn'?t|won'?t\s+need\s+to|will\s+not\s+need\s+to|avoid)\s+(?:[a-z'-]+\s+){0,2}$/i;
const _FIP_NEGATED_AFTER = /^[^.!?;]{0,24}?\b(?:is|are|was|were)?\s*(?:not|n't)\s+(?:recommended|necessary|needed|required|advised)\b/i;
function _fipClaimNegated(text, match) {
const before = text.slice(Math.max(0, match.index - 60), match.index).split(/[.!?;]/).pop();
const after = text.slice(match.index + match[0].length);
return _FIP_NEGATED_BEFORE.test(before) || _FIP_NEGATED_AFTER.test(after);
}
function _fipSisterSizeFollows(rest, bandDirection) {
const m = /^\s*(?:,|and|then|,\s*and|,\s*then)\s+(?:(?:go|size|order)\s+)?(up|down)\s+(?:a|one|1)\s+cup(?:\s+size)?/i.exec(rest);
if (!m) return false;
return (m[1].toLowerCase() === 'up' ? 1 : -1) === -bandDirection;
}
const _fipConditionalPatterns = [
{ re: /if\s+you'?re?\s+between\s+sizes,?\s+(?:we\s+recommend\s+)?siz(?:e|ing)\s+up/i, note: "This listing suggests sizing up if you're between sizes." },
{ re: /if\s+you'?re?\s+between\s+sizes,?\s+(?:we\s+recommend\s+)?siz(?:e|ing)\s+down/i, note: "This listing suggests sizing down if you're between sizes." },
{ re: /if\s+in\s+between\s+sizes,?\s+siz(?:e|ing)\s+up/i, note: "This listing suggests sizing up if you're between sizes." },
{ re: /if\s+in\s+between\s+sizes,?\s+siz(?:e|ing)\s+down/i, note: "This listing suggests sizing down if you're between sizes." },
{ re: /consider\s+sizing\s+up(?:\s+for\s+a\s+(?:looser|roomier)\s+fit)?/i, note: 'This listing suggests considering sizing up for a looser fit.' },
{ re: /consider\s+sizing\s+down(?:\s+for\s+a\s+(?:snugger|tighter)\s+fit)?/i, note: 'This listing suggests considering sizing down for a snugger fit.' },
{ re: /you\s+may\s+want\s+to\s+size\s+up/i, note: 'This listing suggests you may want to size up.' },
{ re: /you\s+may\s+want\s+to\s+size\s+down/i, note: 'This listing suggests you may want to size down.' },
];
function parseConditionalInstruction(fullText) {
const text = fullText || '';
for (const pattern of _fipConditionalPatterns) {
const match = text.match(pattern.re);
if (match) return { note: pattern.note, matchedText: match[0].trim() };
}
return null;
}
const _fipVaguePatterns = [
{ re: /\bruns?\s+small\b/i, note: 'This listing mentions that it runs small.' },
{ re: /\bruns?\s+(?:large|big)\b/i, note: 'This listing mentions that it runs large.' },
{ re: /\btrue\s+to\s+size\b/i, note: 'This listing describes the fit as true to size.' },
];
function parseVagueSignal(fullText) {
const text = fullText || '';
for (const pattern of _fipVaguePatterns) {
const match = text.match(pattern.re);
if (match) return { note: pattern.note, matchedText: match[0].trim() };
}
return null;
}
function parseFitInstructions(fullText, appliedElsewhere) {
const text = fullText || '';
const bandAdjustment = parseBandAdjustment(text);
const textForVagueScan = [bandAdjustment && bandAdjustment.matchedText, ...(appliedElsewhere || [])]
.filter(Boolean).reduce((rest, claim) => rest.replace(claim, ''), text);
return {
bandAdjustment,
conditional: parseConditionalInstruction(text),
vague: parseVagueSignal(textForVagueScan),
};
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = { parseBandAdjustment, parseConditionalInstruction, parseVagueSignal, parseFitInstructions };
}
/* src/cupInstructionParser.js */
const _cipNumberWords = { one: 1, two: 2, three: 3, four: 4 };
function _cipWordToNumber(token) {
const n = parseInt(token, 10);
return Number.isNaN(n) ? (_cipNumberWords[(token || '').toLowerCase()] || null) : n;
}
const _cipAppearancePatterns = [
{
re: /\b(?:adds?|adding)\s+up\s+to\s+(\d+|one|two|three|four)\s+cup\s*sizes?/i,
group: 1,
},
{
re: /\badds?[\s-]*(\d+|one|two|three|four)[\s-]*cups?\b/i,
group: 1,
},
{
re: /\b(?:adds?|adding)\s+(\d+|one|two|three|four)\s+cup\s*sizes?/i,
group: 1,
},
{
re: /\b(?:adds?|adding)\s+a\s+full\s+cup(?:\s*size)?/i,
fixed: 1,
},
{
re: /\b(?:creates?|gives?\s+you|transforms?|enhances?)\s+[^.;]{0,40}\b(?:lift|cleavage|shape|silhouette|volume|fullness)\b/i,
fixed: null,
},
];
function parseAppearanceClaim(fullText) {
const text = fullText || '';
for (const pattern of _cipAppearancePatterns) {
const match = text.match(pattern.re);
if (!match) continue;
const cupSizes = pattern.fixed !== undefined && pattern.fixed !== null
? pattern.fixed
: (pattern.group ? _cipWordToNumber(match[pattern.group]) : null);
return {
cupSizes: cupSizes || null,
matchedText: match[0].trim(),
note: cupSizes
? `This listing says its padding adds up to ${cupSizes === 1 ? 'a cup size' : `${cupSizes} cup sizes`} of lift. That describes how it looks, not what size to buy.`
: 'This listing describes the shape and lift its padding creates. That describes how it looks, not what size to buy.',
};
}
return null;
}
function stripAppearanceClaims(fullText) {
let text = fullText || '';
_cipAppearancePatterns.forEach((pattern) => {
text = text.replace(new RegExp(pattern.re.source, 'gi'), ' ');
});
return text;
}
const _CIP_MAX_CLAIM_STEPS = 3;
const _CIP_NEGATED_BEFORE = /\b(?:do\s+not|don'?t|does\s+not|doesn'?t|did\s+not|didn'?t|never|no\s+need\s+to|not|nor|without|should\s+not|shouldn'?t|need\s+not|needn'?t|won'?t\s+need\s+to|will\s+not\s+need\s+to|avoid)\s+(?:[a-z'-]+\s+){0,2}$/i;
const _CIP_NEGATED_AFTER = /^[^.!?;]{0,24}?\b(?:is|are|was|were)?\s*(?:not|n't)\s+(?:recommended|necessary|needed|required|advised)\b/i;
function _cipClaimNegated(text, match) {
const before = text.slice(Math.max(0, match.index - 60), match.index).split(/[.!?;]/).pop();
const after = text.slice(match.index + match[0].length);
return _CIP_NEGATED_BEFORE.test(before) || _CIP_NEGATED_AFTER.test(after);
}
const _cipCupPatterns = [
{ re: /size\s+up\s+(\d+|one|two|three)\s*cup\s*sizes?/i, group: 1, direction: 1 },
{ re: /size\s+down\s+(\d+|one|two|three)\s*cup\s*sizes?/i, group: 1, direction: -1 },
{ re: /(?:size|go|order)\s+up\s+(?:a|one)\s+cup\s+size/i, fixed: 1, direction: 1 },
{ re: /(?:size|go|order)\s+down\s+(?:a|one)\s+cup\s+size/i, fixed: 1, direction: -1 },
{ re: /recommend\s+(?:going|sizing)\s+up\s+(?:a|one)\s+cup(?:\s+size)?/i, fixed: 1, direction: 1 },
{ re: /recommend\s+(?:going|sizing)\s+down\s+(?:a|one)\s+cup(?:\s+size)?/i, fixed: 1, direction: -1 },
{ re: /runs?\s+small\s+in\s+the\s+cup/i, fixed: 1, direction: 1 },
{ re: /runs?\s+(?:large|big)\s+in\s+the\s+cup/i, fixed: 1, direction: -1 },
{ re: /\bcups?\s+runs?\s+small\b/i, fixed: 1, direction: 1 },
{ re: /\bcups?\s+runs?\s+(?:large|big)\b/i, fixed: 1, direction: -1 },
];
function parseCupAdjustment(fullText) {
const text = stripAppearanceClaims(fullText);
for (const pattern of _cipCupPatterns) {
const re = new RegExp(pattern.re.source, 'gi');
let match;
while ((match = re.exec(text))) {
if (_cipSisterSizeAround(text, match, pattern.direction)) continue;
if (_cipClaimNegated(text, match)) continue;
const magnitude = pattern.fixed != null ? pattern.fixed : _cipWordToNumber(match[pattern.group]);
if (magnitude && magnitude <= _CIP_MAX_CLAIM_STEPS) return { direction: pattern.direction, magnitude, matchedText: match[0].trim() };
}
}
return null;
}
function _cipSisterSizeAround(text, match, cupDirection) {
const band = '(?:(?:go|size|order)\\s+)?(up|down)\\s+(?:a|one|1)\\s+band(?:\\s+size)?';
const joiner = '\\s*(?:,|and|then|,\\s*and|,\\s*then)\\s+';
const before = new RegExp(`${band}${joiner}(?:(?:go|size|order)\\s+)?$`, 'i').exec(text.slice(Math.max(0, match.index - 80), match.index));
const after = new RegExp(`^${joiner}${band}`, 'i').exec(text.slice(match.index + match[0].length));
const opposite = (m) => !!m && (m[1].toLowerCase() === 'up' ? 1 : -1) === -cupDirection;
return opposite(before) || opposite(after);
}
const _cipConditionalPatterns = [
{ re: /if\s+you'?re?\s+between\s+cup\s+sizes,?\s+(?:we\s+recommend\s+)?siz(?:e|ing)\s+up/i, note: "This listing suggests the larger cup if you're between cup sizes." },
{ re: /if\s+you'?re?\s+between\s+cup\s+sizes,?\s+(?:we\s+recommend\s+)?siz(?:e|ing)\s+down/i, note: "This listing suggests the smaller cup if you're between cup sizes." },
{ re: /if\s+you'?re?\s+between\s+sizes,?\s+(?:we\s+recommend\s+)?(?:the\s+)?(?:larger|bigger)\s+cup/i, note: "This listing suggests the larger cup if you're between sizes." },
{ re: /if\s+you'?re?\s+between\s+sizes,?\s+(?:we\s+recommend\s+)?(?:the\s+)?smaller\s+cup/i, note: "This listing suggests the smaller cup if you're between sizes." },
{ re: /consider\s+(?:sizing|going)\s+up\s+a\s+cup(?:\s+size)?/i, note: 'This listing suggests considering a larger cup.' },
{ re: /consider\s+(?:sizing|going)\s+down\s+a\s+cup(?:\s+size)?/i, note: 'This listing suggests considering a smaller cup.' },
];
function parseConditionalCupInstruction(fullText) {
const text = stripAppearanceClaims(fullText);
for (const pattern of _cipConditionalPatterns) {
const match = text.match(pattern.re);
if (match) return { note: pattern.note, matchedText: match[0].trim() };
}
return null;
}
const _cipVaguePatterns = [
{ re: /\b(?:generous|roomy)\s+cups?\b/i, note: 'This listing describes the cup as generous.' },
{ re: /\bcups?\s+(?:are\s+)?(?:cut\s+)?shallow\b/i, note: 'This listing describes the cup as shallow.' },
{ re: /\bshallow\s+cups?\b/i, note: 'This listing describes the cup as shallow.' },
{ re: /\bdeep(?:er)?\s+cups?\b/i, note: 'This listing describes the cup as deep.' },
];
function parseVagueCupSignal(fullText) {
const text = stripAppearanceClaims(fullText);
for (const pattern of _cipVaguePatterns) {
const match = text.match(pattern.re);
if (match) return { note: pattern.note, matchedText: match[0].trim() };
}
return null;
}
function parseCupInstructions(fullText) {
const raw = fullText || '';
const appearance = parseAppearanceClaim(raw);
const text = stripAppearanceClaims(raw);
const cupAdjustment = parseCupAdjustment(text);
const textForVagueScan = cupAdjustment ? text.replace(cupAdjustment.matchedText, '') : text;
return {
cupAdjustment,
conditional: parseConditionalCupInstruction(text),
vague: parseVagueCupSignal(textForVagueScan),
appearance,
};
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
parseAppearanceClaim,
stripAppearanceClaims,
parseCupAdjustment,
parseConditionalCupInstruction,
parseVagueCupSignal,
parseCupInstructions,
};
}
/* src/chartMatcher.js */
const _cmK = (typeof module !== 'undefined' && module.exports) ? require('./sizingConstants') : SIZING_CONSTANTS;
const WIDE_RANGE_INCHES = _cmK.WIDE_RANGE_INCHES;
function _cmSettle(value) {
const scale = Math.round(1 / _cmK.SCORE_TOLERANCE);
return Math.round(value * scale) / scale;
}
function _rangePosition(value, range) {
const [min, max] = range;
if (typeof value !== 'number' || value < min || value > max) return null;
const halfWidth = (max - min) / 2;
if (halfWidth === 0) return 1;
const mid = (min + max) / 2;
return _cmSettle(1 - Math.abs(value - mid) / halfWidth);
}
const NEAR_MISS_TOLERANCE_INCHES = _cmK.NEAR_MISS_TOLERANCE_INCHES;
function _rangeMiss(value, range) {
if (typeof value !== 'number' || Number.isNaN(value)) return null;
const [min, max] = range;
if (value < min) return min - value;
if (value > max) return value - max;
return 0;
}
function _nearMissPosition(value, range, miss) {
if (miss === 0) return _rangePosition(value, range);
return _cmSettle(Math.max(0, _cmK.NEAR_MISS_EDGE_POSITION - (miss / NEAR_MISS_TOLERANCE_INCHES) * _cmK.NEAR_MISS_DECAY));
}
const NEAR_MISS_SCORE_CEILING = _cmK.NEAR_MISS_SCORE_CEILING;
function _bucketMisses(measurements, bucket) {
const out = [];
['underbust', 'bust'].forEach((dim) => {
const range = bucket.ranges && bucket.ranges[dim];
const value = measurements[dim];
if (!range || typeof value !== 'number' || Number.isNaN(value)) return;
const miss = _rangeMiss(value, range);
if (!miss) return;
const above = value > range[1];
const printed = Array.isArray(bucket.widenedDimensions) && bucket.widenedDimensions.includes(dim) && bucket.printedRanges && bucket.printedRanges[dim];
out.push({ dimension: dim, value, edge: above ? range[1] : range[0], miss, side: above ? 'above' : 'below',
...(printed ? { printedValue: above ? printed[1] : printed[0] } : {}) });
});
return out;
}
function _closestOutsideBucket(measurements, buckets) {
const scored = [];
for (const bucket of buckets) {
if (!bucket || !bucket.ranges || (!bucket.ranges.underbust && !bucket.ranges.bust)) continue;
if (bucket.ranges.underbust && typeof measurements.underbust !== 'number') continue;
if (!bucket.ranges.underbust && typeof measurements.bust !== 'number') continue;
const misses = _bucketMisses(measurements, bucket);
scored.push({ bucket, misses, totalMiss: misses.reduce((sum, m) => sum + m.miss, 0) });
}
if (!scored.length) return null;
const best = Math.min(...scored.map((s) => s.totalMiss));
const closest = scored.filter((s) => Math.abs(s.totalMiss - best) < 1e-9);
const labels = [...new Set(closest.map((s) => s.bucket.label))];
if (labels.length !== 1) return { label: null, misses: [], totalMiss: best };
return { label: labels[0], misses: closest[0].misses, totalMiss: best };
}
function chartMissPhrase(misses) {
if (!Array.isArray(misses) || !misses.length) return null;
const inches = (n) => {
const tenth = Math.round(n * 10) / 10;
return `${tenth === 0 ? Math.round(n * 100) / 100 : tenth}"`;
};
return misses.map((m) => (typeof m.printedValue === 'number'
? `your ${m.dimension}, ${inches(m.value)}, is ${inches(Math.abs(m.value - m.printedValue))} ${m.side} the ${inches(m.printedValue)} ${m.dimension} it prints`
: `your ${m.dimension}, ${inches(m.value)}, is ${inches(m.miss)} ${m.side} its ${m.dimension} range, which ${m.side === 'above' ? 'ends' : 'starts'} at ${inches(m.edge)}`)).join(', and ');
}
const EXACT_MATCH_FLOOR = _cmK.EXACT_MATCH_FLOOR;
function _pairPosition(measurements, bucket) {
const pair = `${measurements.band}${measurements.cup}`;
const exactIdx = bucket.pairs.indexOf(pair);
if (exactIdx !== -1) {
if (bucket.pairs.length === 1) return { position: 1, matchType: 'exact' };
const sortedPairs = [...bucket.pairs].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
const sortedIdx = sortedPairs.indexOf(pair);
const center = (sortedPairs.length - 1) / 2;
const centeredness = center === 0 ? 1 : 1 - Math.abs(sortedIdx - center) / center;
const position = _cmSettle(EXACT_MATCH_FLOOR + centeredness * (1 - EXACT_MATCH_FLOOR));
return { position, matchType: 'exact' };
}
const sisterHit = (measurements.sisterPairs || []).some((p) => bucket.pairs.includes(p));
if (sisterHit) return { position: _cmK.LIST_SISTER_POSITION, matchType: 'sister' };
return null;
}
function singleValuesAsRanges(buckets) {
if (!Array.isArray(buckets) || buckets.length < 2) return buckets;
const isPoint = (r) => Array.isArray(r) && r.length === 2 && r[0] === r[1] && typeof r[0] === 'number';
const isRange = (r) => Array.isArray(r) && r.length === 2 && typeof r[0] === 'number' && typeof r[1] === 'number' && r[1] > r[0];
if (!buckets.some((b) => b && b.ranges && (isPoint(b.ranges.underbust) || isPoint(b.ranges.bust)))) return buckets;
const out = buckets.map((b) => ({ printed: b, ranges: b && b.ranges ? { ...b.ranges } : null, widened: [] }));
['underbust', 'bust'].forEach((dim) => {
const other = dim === 'underbust' ? 'bust' : 'underbust';
const printing = out.filter((o) => o.printed && o.printed.ranges && o.printed.ranges[dim]);
const byOther = printing.length > 0 && printing.every((o) => isRange(o.printed.ranges[other]));
const groups = new Map();
out.forEach((o) => {
const r = o.printed && o.printed.ranges;
if (!r || !r[dim]) return;
const key = byOther ? `${r[other][0]}-${r[other][1]}` : 'all';
if (!groups.has(key)) groups.set(key, []);
groups.get(key).push(o);
});
groups.forEach((rows) => {
if (!rows.every((o) => isPoint(o.printed.ranges[dim]))) return;
const sorted = rows.slice().sort((a, b) => a.printed.ranges[dim][0] - b.printed.ranges[dim][0]);
const values = [...new Set(sorted.map((o) => o.printed.ranges[dim][0]))];
if (values.length < 2) return;
const labelsAt = values.map((v) => [...new Set(sorted.filter((o) => o.printed.ranges[dim][0] === v).map((o) => o.printed.label))].sort().join('|'));
const runStart = [];
values.forEach((v, i) => { if (i === 0 || labelsAt[i] !== labelsAt[i - 1]) runStart.push(i); });
runStart.forEach((start, r) => {
const end = (r + 1 < runStart.length ? runStart[r + 1] : values.length) - 1;
const lo = Math.max(values[start] - SINGLE_VALUE_REACH_INCHES,
start === 0 ? values[0] - (values[1] - values[0]) / 2 : (values[start - 1] + values[start]) / 2);
const hi = Math.min(values[end] + SINGLE_VALUE_REACH_INCHES,
end === values.length - 1 ? values[end] + (values[end] - values[end - 1]) / 2 : (values[end] + values[end + 1]) / 2);
sorted.forEach((o) => {
const v = o.printed.ranges[dim][0];
if (v >= values[start] && v <= values[end]) { o.ranges[dim] = [lo, hi]; o.widened.push(dim); }
});
});
});
});
const seen = new Set();
return out.filter((o) => {
if (!o.widened.length) return true;
const key = `${o.printed.label}|${JSON.stringify(o.ranges.underbust || null)}|${JSON.stringify(o.ranges.bust || null)}`;
if (seen.has(key)) return false;
seen.add(key);
return true;
}).map((o) => (o.widened.length
? { ...o.printed, ranges: o.ranges, printedRanges: o.printed.ranges, widenedDimensions: o.widened.slice() }
: o.printed));
}
const SINGLE_VALUE_REACH_INCHES = _cmK.SINGLE_VALUE_REACH_INCHES;
const PLAUSIBLE_INCHES = _cmK.PLAUSIBLE_INCHES;
const POSSIBLE_INCHES = _cmK.POSSIBLE_INCHES;
function chartPlausibility(buckets) {
if (!Array.isArray(buckets)) return { plausible: true, reason: null };
for (const dim of ['bust', 'underbust']) {
const values = [];
buckets.forEach((b) => {
const r = b && b.ranges && b.ranges[dim];
if (Array.isArray(r) && r.length === 2) values.push(r[0], r[1]);
});
if (!values.length) continue;
const [pLo, pHi] = PLAUSIBLE_INCHES[dim];
const [hLo, hHi] = POSSIBLE_INCHES[dim];
if (values.some((v) => typeof v !== 'number' || !Number.isFinite(v) || v < hLo || v > hHi)) {
return { plausible: false, reason: `it prints a ${dim} of ${values.find((v) => !(v >= hLo && v <= hHi))}, which is not a body measurement in inches` };
}
const outside = values.filter((v) => v < pLo || v > pHi).length;
if (outside > values.length / 2) {
return { plausible: false, reason: `its ${dim} values mostly fall outside ${pLo} to ${pHi} inches, so it is not read as a body chart in inches` };
}
}
return { plausible: true, reason: null };
}
function usableListingChart(buckets) {
if (!Array.isArray(buckets) || !buckets.length) return null;
const sizes = new Set(buckets.filter((b) => b && b.label).map((b) => String(b.label)));
if (sizes.size < _cmK.MIN_BUCKETS_FOR_A_USABLE_CHART) return null;
return chartPlausibility(buckets).plausible ? buckets : null;
}
function matchMeasurementsToChart(measurements, rawBuckets) {
const plausibility = chartPlausibility(rawBuckets);
if (!plausibility.plausible) {
return { matched: false, bucket: null, dimensionPositions: null, rangeWidths: {}, matchType: null, pairMatchType: null, ambiguous: false, implausibleChart: true, note: `This chart is not used: ${plausibility.reason}.` };
}
const buckets = singleValuesAsRanges(rawBuckets);
if (!measurements || !buckets || buckets.length === 0) {
return { matched: false, bucket: null, dimensionPositions: null, rangeWidths: {}, matchType: null, pairMatchType: null, ambiguous: false, note: 'No chart buckets to match against.' };
}
const candidates = [];
for (const bucket of buckets) {
if (bucket.ranges) {
if (!bucket.ranges.underbust && !bucket.ranges.bust) continue;
const dims = {};
const widths = {};
if (bucket.ranges.underbust) {
const underbustPos = _rangePosition(measurements.underbust, bucket.ranges.underbust);
if (underbustPos === null) continue;
dims.underbust = underbustPos;
widths.underbust = bucket.ranges.underbust[1] - bucket.ranges.underbust[0];
} else if (typeof measurements.bust !== 'number') {
continue;
}
if (bucket.ranges.bust && typeof measurements.bust === 'number') {
const bustPos = _rangePosition(measurements.bust, bucket.ranges.bust);
if (bustPos === null) continue;
dims.bust = bustPos;
widths.bust = bucket.ranges.bust[1] - bucket.ranges.bust[0];
}
candidates.push({ bucket, dimensionPositions: dims, rangeWidths: widths, matchType: 'range', pairMatchType: null });
} else if (bucket.pairs) {
const pairResult = _pairPosition(measurements, bucket);
if (!pairResult) continue;
candidates.push({ bucket, dimensionPositions: { pair: pairResult.position }, rangeWidths: {}, matchType: 'pair', pairMatchType: pairResult.matchType });
}
}
if (candidates.length === 0) {
const nearMisses = [];
for (const bucket of buckets) {
if (!bucket.ranges || (!bucket.ranges.underbust && !bucket.ranges.bust)) continue;
const dims = {};
const widths = {};
let totalMiss = 0;
if (bucket.ranges.underbust) {
const underbustMiss = _rangeMiss(measurements.underbust, bucket.ranges.underbust);
if (underbustMiss === null || underbustMiss > NEAR_MISS_TOLERANCE_INCHES) continue;
dims.underbust = _nearMissPosition(measurements.underbust, bucket.ranges.underbust, underbustMiss);
widths.underbust = bucket.ranges.underbust[1] - bucket.ranges.underbust[0];
totalMiss = underbustMiss;
} else if (typeof measurements.bust !== 'number') {
continue;
}
if (bucket.ranges.bust && typeof measurements.bust === 'number') {
const bustMiss = _rangeMiss(measurements.bust, bucket.ranges.bust);
if (bustMiss === null || bustMiss > NEAR_MISS_TOLERANCE_INCHES) continue;
dims.bust = _nearMissPosition(measurements.bust, bucket.ranges.bust, bustMiss);
widths.bust = bucket.ranges.bust[1] - bucket.ranges.bust[0];
totalMiss += bustMiss;
}
nearMisses.push({ bucket, dimensionPositions: dims, rangeWidths: widths, matchType: 'range-nearest', pairMatchType: null, totalMiss });
}
if (nearMisses.length) {
nearMisses.sort((a, b) => a.totalMiss - b.totalMiss);
const closest = nearMisses[0];
const tiedWith = nearMisses.find((m) => m.bucket.label !== closest.bucket.label && Math.abs(m.totalMiss - closest.totalMiss) < _cmK.SCORE_TOLERANCE);
return {
matched: true,
bucket: closest.bucket,
dimensionPositions: closest.dimensionPositions,
rangeWidths: closest.rangeWidths,
matchType: 'range-nearest',
pairMatchType: null,
nearestMatch: true,
nearestMisses: _bucketMisses(measurements, closest.bucket),
...(tiedWith ? { tiedWith: tiedWith.bucket.label } : {}),
ambiguous: false,
note: `Your measurements fall between sizes on this chart. ${closest.bucket.label} is the closest.`,
};
}
const outside = _closestOutsideBucket(measurements, buckets);
return {
matched: false, bucket: null, dimensionPositions: null, rangeWidths: {}, matchType: null, pairMatchType: null, ambiguous: false,
...(outside ? { outsideChart: { label: outside.label, misses: outside.misses, totalMiss: outside.totalMiss } } : {}),
note: "This chart doesn't have a bucket covering these measurements.",
};
}
candidates.sort((a, b) => Math.min(...Object.values(b.dimensionPositions)) - Math.min(...Object.values(a.dimensionPositions)));
const best = candidates[0];
const weakestOf = (c) => Math.min(...Object.values(c.dimensionPositions));
const tiedWith = candidates.find((c) => c.bucket.label !== best.bucket.label && Math.abs(weakestOf(c) - weakestOf(best)) < _cmK.SCORE_TOLERANCE);
const sizesHolding = new Set(candidates.map((c) => c.bucket.label)).size;
return {
matched: true,
bucket: best.bucket,
dimensionPositions: best.dimensionPositions,
rangeWidths: best.rangeWidths,
matchType: best.matchType,
pairMatchType: best.pairMatchType,
...(tiedWith ? { tiedWith: tiedWith.bucket.label } : {}),
ambiguous: sizesHolding > 1,
note: sizesHolding > 1 ? 'These measurements fall within more than one size bucket on this chart.' : '',
};
}
const NEAR_EDGE_POSITION = _cmK.NEAR_EDGE_POSITION;
const TIER_SCORE_CENTRED = _cmK.TIER_SCORE_CENTRED;
const TIER_SCORE_COMFORTABLE = _cmK.TIER_SCORE_COMFORTABLE;
const TIER_SCORE_POSSIBLE = _cmK.TIER_SCORE_POSSIBLE;
const LETTER_ORDER = _cmK.ALPHA_SIZE_ORDER;
function _letterPlace(label) {
const raw = String(label || '').trim().toUpperCase();
const letter = _cmK.LETTER_SPELLINGS[raw] || raw;
const misses = LETTER_ORDER.indexOf(letter);
if (misses !== -1) return { run: 'misses', at: misses };
const plus = _cmK.PLUS_SIZE_ORDER.indexOf(letter);
return plus === -1 ? null : { run: 'plus', at: plus };
}
function _midpoint(range) {
return (range[0] + range[1]) / 2;
}
function boundaryAlternate(measurements, rawBuckets, matchResult) {
const buckets = singleValuesAsRanges(rawBuckets);
if (!measurements || !Array.isArray(buckets) || !matchResult || !matchResult.matched || !matchResult.bucket) return null;
const matched = matchResult.bucket;
const compound = (label) => String(label || '').includes('/');
if (compound(matched.label)) return null;
const others = buckets.filter((b) => b && b.label && b.label !== matched.label && !compound(b.label));
if (!others.length) return null;
if (matchResult.matchType === 'pair') {
if (!matchResult.ambiguous) return null;
const pair = `${measurements.band}${measurements.cup}`;
const sisters = measurements.sisterPairs || [];
const exact = others.filter((b) => (b.pairs || []).includes(pair));
const pool = exact.length ? exact : others.filter((b) => (b.pairs || []).some((p) => sisters.includes(p)));
const labels = [...new Set(pool.map((b) => b.label))];
if (labels.length !== 1) return null;
const from = _letterPlace(matched.label);
const to = _letterPlace(labels[0]);
if (!from || !to || from.run !== to.run || from.at === to.at) return null;
return { label: labels[0], direction: to.at > from.at ? 'up' : 'down' };
}
if (!matched.ranges || !matchResult.dimensionPositions) return null;
const positions = matchResult.dimensionPositions;
const nearEdge = Math.min(...Object.values(positions)) < NEAR_EDGE_POSITION;
if (!matchResult.nearestMatch && !matchResult.ambiguous && !nearEdge) return null;
const dims = Object.keys(positions).filter((k) => matched.ranges[k] && typeof measurements[k] === 'number');
if (!dims.length) return null;
const weakest = dims.reduce((a, b) => (positions[b] < positions[a] ? b : a));
const leanUp = measurements[weakest] > _midpoint(matched.ranges[weakest]);
if (measurements[weakest] === _midpoint(matched.ranges[weakest]) && !matchResult.ambiguous) return null;
const reach = [];
for (const bucket of others) {
if (!bucket.ranges || (!bucket.ranges.underbust && !bucket.ranges.bust)) continue;
let total = 0;
let within = true;
for (const k of dims) {
if (!bucket.ranges[k]) { within = false; break; }
const miss = _rangeMiss(measurements[k], bucket.ranges[k]);
if (miss === null || miss > NEAR_MISS_TOLERANCE_INCHES) { within = false; break; }
total += miss;
}
if (!within) continue;
const delta = _midpoint(bucket.ranges[weakest]) - _midpoint(matched.ranges[weakest]);
if (delta === 0) continue;
if (!matchResult.ambiguous && (delta > 0) !== leanUp) continue;
reach.push({ label: bucket.label, total, up: delta > 0 });
}
if (!reach.length) return null;
const best = Math.min(...reach.map((r) => r.total));
const closest = reach.filter((r) => r.total === best);
if (new Set(closest.map((r) => r.label)).size !== 1) return null;
const up = new Set(closest.map((r) => r.up));
if (up.size !== 1) return null;
return { label: closest[0].label, direction: closest[0].up ? 'up' : 'down' };
}
const CHART_QUALITY_DETAILED = 'Detailed chart';
const CHART_QUALITY_BASIC = 'Basic chart';
const CHART_QUALITY_BRA_SIZES = 'Chart of bra sizes';
const CHART_QUALITY_NEAR_EDGE = 'Chart, near a size edge';
const CHART_QUALITY_LIMITED = 'Limited data';
function chartQualityFor(matchResult) {
if (!matchResult || !matchResult.matched || !matchResult.dimensionPositions) return CHART_QUALITY_LIMITED;
const dimensions = Object.keys(matchResult.dimensionPositions);
const positions = Object.values(matchResult.dimensionPositions);
if (positions.length >= 2 && positions.every((p) => p >= _cmK.CHART_DETAIL_POSITION)) return CHART_QUALITY_DETAILED;
if (dimensions.length === 1 && dimensions[0] === 'pair') return CHART_QUALITY_BRA_SIZES;
return positions.length >= 2 ? CHART_QUALITY_NEAR_EDGE : CHART_QUALITY_BASIC;
}
function getChartConfidence(matchResult, extractionFidelity) {
if (extractionFidelity === 'failed') {
return { confidence: 'Uncertain, check size chart', score: 0, reason: "This listing's size chart couldn't be read cleanly, so this match can't be trusted.", chartQuality: CHART_QUALITY_LIMITED };
}
if (!matchResult || !matchResult.matched) {
return { confidence: 'Uncertain, check size chart', score: 0, reason: "Your measurements didn't clearly fall into any size on this chart.", chartQuality: CHART_QUALITY_LIMITED };
}
const positions = Object.values(matchResult.dimensionPositions);
let score = Math.min(...positions);
const hasWideRange = Object.values(matchResult.rangeWidths || {}).some((w) => w >= WIDE_RANGE_INCHES);
if (hasWideRange) score -= _cmK.WIDE_RANGE_PENALTY;
if (matchResult.ambiguous) score -= _cmK.AMBIGUITY_PENALTY;
if (matchResult.nearestMatch) score = Math.min(score, NEAR_MISS_SCORE_CEILING);
score = _cmSettle(Math.max(0, Math.min(1, score)));
let confidence;
if (score >= TIER_SCORE_CENTRED) confidence = 'Great match';
else if (score >= TIER_SCORE_COMFORTABLE) confidence = 'Good match';
else if (score >= TIER_SCORE_POSSIBLE) confidence = 'Likely fits';
else confidence = 'Uncertain, check size chart';
return { confidence, score, reason: '', chartQuality: chartQualityFor(matchResult) };
}
function confidenceTierLegend() {
return [
{ tier: 'Best Match', phrase: "Confirmed for you, either against this listing's own size chart or against this brand's own verified sizing formula." },
{ tier: 'Strong Match', phrase: "Your measurements fall comfortably within this size's range." },
{ tier: 'Possible Match', phrase: 'Your measurements are near the edge of this size. A neighboring size may also work.' },
{ tier: 'Limited Data', phrase: "This size can't be confirmed for you: this listing gives too little sizing information, its own chart can't reliably place you, or the size shown is only a rough stand-in for yours." },
];
}
const NON_RATING_LEGEND = Object.freeze({
'Not carried here': "Your band is outside the sizes this brand makes.",
'Not a bra size': "This product isn't sized by band and cup.",
'Not on their chart': "This chart has no size for your measurements.",
'Between chart sizes': "Your measurements fall between two sizes on this chart; both are shown.",
'Beyond our range': "Your measurements are past the sizes Measured Size can work out.",
});
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
NON_RATING_LEGEND,
matchMeasurementsToChart,
singleValuesAsRanges,
chartPlausibility,
usableListingChart,
SINGLE_VALUE_REACH_INCHES,
boundaryAlternate,
chartMissPhrase,
NEAR_MISS_SCORE_CEILING,
NEAR_MISS_TOLERANCE_INCHES,
NEAR_EDGE_POSITION,
TIER_SCORE_CENTRED,
TIER_SCORE_COMFORTABLE,
TIER_SCORE_POSSIBLE,
getChartConfidence,
confidenceTierLegend,
chartQualityFor,
CHART_QUALITY_DETAILED,
CHART_QUALITY_BASIC,
CHART_QUALITY_BRA_SIZES,
CHART_QUALITY_NEAR_EDGE,
CHART_QUALITY_LIMITED,
};
}
/* src/letterConsensus.js */
const LETTER_CONSENSUS = {
"30AA": {"misses":["XS",2,4,1,[["XXS",2],["XS",2]],true]},
"30A": {"misses":["XS",14,20,2]},
"30B": {"misses":["XS",19,24,2]},
"30C": {"misses":["XS",17,23,1]},
"30D": {"misses":["S",10,20,2,[["XS",9],["S",10]],true]},
"30DD": {"misses":["S",6,12,2]},
"30DDD": {"misses":["S",4,9,2]},
"30G": {"misses":["M",2,4,2]},
"32AA": {"misses":["XS",4,6,2]},
"32A": {"misses":["XS",19,29,2]},
"32B": {"misses":["XS",17,33,1,[["XS",17],["S",16]],true]},
"32C": {"misses":["S",29,33,2]},
"32D": {"misses":["S",27,33,1]},
"32DD": {"misses":["M",13,20,2]},
"32DDD": {"misses":["M",7,11,2]},
"32G": {"misses":["M",0,3,2]},
"34AA": {"misses":["S",4,5,1]},
"34A": {"misses":["S",24,32,2]},
"34B": {"misses":["S",26,36,1]},
"34C": {"misses":["M",25,34,1]},
"34D": {"misses":["M",28,33,2]},
"34DD": {"misses":["L",12,24,3,[["M",9],["L",12]],true]},
"34DDD": {"misses":["L",9,13,2]},
"34G": {"misses":["L",2,4,2,[["L",2],["XL",1]]]},
"36A": {"misses":["M",23,28,2]},
"36B": {"misses":["M",24,35,2]},
"36C": {"misses":["L",20,34,2]},
"36D": {"misses":["L",26,33,2]},
"36DD": {"misses":["L",16,26,2]},
"36DDD": {"misses":["XL",10,13,1]},
"36G": {"misses":["XL",1,4,2]},
"38A": {"misses":["L",18,21,2]},
"38B": {"misses":["L",23,34,2]},
"38C": {"misses":["L",19,34,2]},
"38D": {"misses":["XL",23,31,2]},
"38DD": {"misses":["XL",16,21,2],"plus":["1X",3,3,0]},
"38DDD": {"misses":["XL",7,11,1],"plus":["1X",3,4,1]},
"38G": {"misses":["XL",2,3,1,[["XL",2],["XXL",1]]]},
"40A": {"misses":["XL",10,15,3]},
"40B": {"misses":["XL",14,22,3]},
"40C": {"misses":["XL",15,24,2],"plus":["1X",3,3,0]},
"40D": {"misses":["XXL",9,20,2,[["XL",8],["XXL",9]],true],"plus":["1X",5,6,1]},
"40DD": {"misses":["XXL",10,15,1],"plus":["2X",3,6,1,[["1X",3],["2X",3]],true]},
"40DDD": {"misses":["XXL",5,8,2],"plus":["2X",3,7,2,[["1X",3],["2X",3]],true]},
"40G": {"misses":["XXL",2,4,2,[["XXL",2],["XXXL",1]]]},
"42A": {"misses":["XXL",3,8,2,[["XL",3],["XXL",3]],true]},
"42B": {"misses":["XXL",6,11,2],"plus":["1X",2,3,1]},
"42C": {"misses":["XXL",8,16,3],"plus":["2X",3,5,1,[["1X",2],["2X",3]]]},
"42D": {"misses":["XXL",5,14,2],"plus":["2X",6,9,2]},
"42DD": {"misses":["XXXL",6,11,2],"plus":["2X",5,8,1]},
"42DDD": {"misses":["XXXL",5,7,2],"plus":["3X",4,7,1,[["2X",3],["3X",4]],true]},
"42G": {"misses":["XXXL",3,4,1]},
"44A": {"misses":["XXXL",3,6,3,[["XXL",2],["XXXL",3]]]},
"44B": {"misses":["XXXL",4,8,3],"plus":["2X",4,5,1]},
"44C": {"misses":["XXXL",6,11,2],"plus":["2X",4,6,1]},
"44D": {"misses":["XXXL",5,9,2],"plus":["3X",4,5,1]},
"44DD": {"misses":["XXXL",4,7,2],"plus":["3X",5,6,1]},
"44DDD": {"misses":["XXXL",3,6,2],"plus":["3X",3,5,1,[["3X",3],["4X",2]]]},
"44G": {"misses":["XXXL",2,3,1]},
"46B": {"misses":["XXXL",1,3,2],"plus":["3X",5,5,0]},
"46C": {"misses":["4XL",2,7,3,[["XXXL",2],["4XL",2]],true],"plus":["3X",5,6,1]},
"46D": {"misses":["XXXL",1,6,2],"plus":["3X",4,5,1]},
"46DD": {"misses":["XXXL",0,3,2],"plus":["4X",2,3,1,[["3X",1],["4X",2]]]},
"46DDD": {"plus":["4X",3,3,0]},
"48C": {"misses":["XXXL",1,4,1]},
"48D": {"misses":["XXXL",0,3,0]}
};
const LETTER_CONSENSUS_FLOORED = {
"32G": {"misses":{"from":"32DDD","split":[["S",2],["L",1]]}},
"36G": {"misses":{"from":"36DDD","split":[["L",2],["XL",1],["XXL",1]]}},
"46B": {"misses":{"from":"44B","split":[["XL",2],["XXXL",1]]}},
"46D": {"misses":{"from":"44D","split":[["XXL",3],["XXXL",1],["4XL",2]]}},
"46DD": {"misses":{"from":"44DD","split":[["XXL",2],["4XL",1]]}},
"48C": {"misses":{"from":"46C","fromTie":true,"split":[["XXL",3],["XXXL",1]]}},
"48D": {"misses":{"from":"48C"}}
};
const _lcK = (typeof module !== 'undefined' && module.exports) ? require('./sizingConstants') : SIZING_CONSTANTS;
const LETTER_CONSENSUS_FAMILIES = {
misses: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL'],
plus: _lcK.PLUS_SIZE_ORDER,
};
const PLUS_LETTER_EQUIVALENTS = _lcK.PLUS_LETTER_EQUIVALENTS;
function equivalentLetter(family, letter) {
if (family === 'misses' && PLUS_LETTER_EQUIVALENTS[letter]) return { family: 'plus', letter: PLUS_LETTER_EQUIVALENTS[letter] };
if (family === 'plus') {
const misses = Object.keys(PLUS_LETTER_EQUIVALENTS).find((m) => PLUS_LETTER_EQUIVALENTS[m] === letter);
if (misses) return { family: 'misses', letter: misses };
}
return null;
}
const _lcLabelReader = (typeof module !== 'undefined' && module.exports) ? require('./sizeLabelReader') : null;
const _lcReadSizeLabel = _lcLabelReader ? _lcLabelReader.readSizeLabel : readSizeLabel;
const _lcMissesAliases = _lcK.LETTER_SPELLINGS;
function letterFamilyOf(label) {
if (typeof label !== 'string' || !label.trim()) return null;
const read = _lcReadSizeLabel(label);
if (read.system !== 'letter' || read.letterModifier || read.noise.length || read.also) return null;
const letter = _lcMissesAliases[read.letter] || read.letter;
if (LETTER_CONSENSUS_FAMILIES.misses.includes(letter)) return { family: 'misses', letter };
if (LETTER_CONSENSUS_FAMILIES.plus.includes(letter)) return { family: 'plus', letter };
return null;
}
function lettersOfOption(label) {
const one = letterFamilyOf(label);
if (one) return [one];
if (typeof label !== 'string') return [];
const read = _lcReadSizeLabel(label);
if (read.system !== 'letter_pair' || !Array.isArray(read.letters) || read.letters.length !== 2 || read.noise.length || read.also) return [];
const both = read.letters.map((l) => letterFamilyOf(l));
if (both.some((l) => !l) || both[0].family !== both[1].family) return [];
const order = LETTER_CONSENSUS_FAMILIES[both[0].family];
return Math.abs(order.indexOf(both[0].letter) - order.indexOf(both[1].letter)) === 1 ? both : [];
}
function nearerToStock(split, family, inStock) {
const order = LETTER_CONSENSUS_FAMILIES[family];
const stocked = inStock.filter((o) => o.family === family).map((o) => order.indexOf(o.letter));
if (!stocked.length) return null;
const distance = ([letter]) => Math.min(...stocked.map((i) => Math.abs(i - order.indexOf(letter))));
const [a, b] = split.map(distance);
if (a === b) return null;
return a < b ? split[0] : split[1];
}
function _lcRaisedBy(band, cup, family, letter) {
const cups = (typeof module !== 'undefined' && module.exports) ? require('./fitEngine').CUP_LETTERS : CUP_LETTERS;
const c = cups.indexOf(cup);
const neighbours = [c > 0 ? `${band}${cups[c - 1]}` : null, `${band - 2}${cup}`].filter(Boolean);
const from = neighbours
.map((cell) => ({ cell, a: LETTER_CONSENSUS[cell] && LETTER_CONSENSUS[cell][family] }))
.filter((n) => n.a && n.a[0] === letter)
.sort((x, y) => y.a[1] - x.a[1])[0];
return from ? { cell: from.cell, agree: from.a[1], total: from.a[2] } : null;
}
function letterConsensusFor(band, cup, offeredLabels, inStockLabels) {
if (band == null || !cup) return null;
const cell = `${band}${cup}`;
const entry = LETTER_CONSENSUS[cell];
if (!entry) return null;
const offered = (offeredLabels || []).map(letterFamilyOf).filter(Boolean);
const lettersSold = (labels) => (labels || []).flatMap(lettersOfOption);
const sold = lettersSold(offeredLabels);
const inStock = lettersSold(inStockLabels);
const has = (list, family, letter) => list.some((o) => o.family === family && o.letter === letter);
const withEquivalents = (list) => list.concat(list.map((o) => equivalentLetter(o.family, o.letter)).filter(Boolean));
const offeredX = withEquivalents(offered);
const soldX = withEquivalents(sold);
const inStockX = withEquivalents(inStock);
const answer = (family) => {
const a = entry[family];
if (!a) return null;
const split = Array.isArray(a[4]) ? a[4] : null;
const floorFacts = LETTER_CONSENSUS_FLOORED[cell] && LETTER_CONSENSUS_FLOORED[cell][family];
const floored = floorFacts ? { floored: { cell: floorFacts.from, ...(floorFacts.fromTie ? { fromTie: true } : {}), ...(floorFacts.split ? { split: floorFacts.split } : {}) } } : {};
if (!split) return { label: a[0], family, cell, agree: a[1], total: a[2], spread: a[3], ...(a[1] === 0 ? { raisedBy: _lcRaisedBy(band, cup, family, a[0]) } : {}), ...floored };
const [smaller, larger] = split;
const lead = split.find(([letter]) => letter === a[0]) || larger;
const other = lead === larger ? smaller : larger;
const exactTie = smaller[1] === larger[1];
const tie = exactTie || a[5] === true;
const leadPick = exactTie ? 'larger' : 'majority';
let pick = lead;
let splitPick = leadPick;
if (tie && offered.length) {
const inStockBoth = split.filter(([letter]) => has(inStockX, family, letter));
const soldBoth = split.filter(([letter]) => has(soldX, family, letter));
const nearest = inStockBoth.length ? null : nearerToStock(split, family, inStockX);
if (inStockBoth.length === 1) { pick = inStockBoth[0]; splitPick = 'in stock'; }
else if (inStockBoth.length === 2) { pick = larger; splitPick = 'larger'; }
else if (nearest) { pick = nearest; splitPick = 'nearest'; }
else if (soldBoth.length === 1) { pick = soldBoth[0]; splitPick = 'sold'; }
return { label: pick[0], family, cell, agree: pick[1], total: a[2], spread: a[3], split: [smaller.slice(), larger.slice()], splitPick, ...floored };
}
if (offered.length && !has(soldX, family, lead[0])) {
if (has(inStockX, family, other[0])) { pick = other; splitPick = 'in stock'; }
else if (has(soldX, family, other[0])) { pick = other; splitPick = 'sold'; }
else {
const nearest = nearerToStock(split, family, inStockX);
if (nearest) { pick = nearest; splitPick = 'nearest'; }
}
}
return { label: pick[0], family, cell, agree: pick[1], total: a[2], spread: a[3], split: [smaller.slice(), larger.slice()], splitPick, ...floored };
};
if (!offered.length) return answer('misses') || answer('plus');
const sells = (family) => offered.some((o) => o.family === family);
const lettersOf = (family) => (Array.isArray(entry[family][4]) ? entry[family][4].map((s) => s[0]) : [entry[family][0]]);
const offersIn = (family, soldList, offeredList) => !!entry[family] && lettersOf(family).some((letter) => has(Array.isArray(entry[family][4]) ? soldList : offeredList, family, letter));
const inListingLetters = (r) => {
if (!r || has(sold, r.family, r.label) || has(offered, r.family, r.label)) return r;
const same = equivalentLetter(r.family, r.label);
if (!same || !(has(sold, same.family, same.letter) || has(offered, same.family, same.letter))) return r;
return { ...r, label: same.letter, family: same.family, equivalentOf: r.label };
};
if (offersIn('misses', sold, offered)) return inListingLetters(answer('misses'));
if (offersIn('plus', sold, offered)) return inListingLetters(answer('plus'));
if (offersIn('misses', soldX, offeredX)) return inListingLetters(answer('misses'));
if (offersIn('plus', soldX, offeredX)) return inListingLetters(answer('plus'));
if (sells('misses') && entry.misses) return answer('misses');
if (sells('plus') && entry.plus) return answer('plus');
return null;
}
const _lcLetterBesideBandCup = /\b(?:XXS|XS|S|M|L|XL|XXL|XXXL|[1-4]X|X-Small|Small|Medium|Large|X-Large)\b[^"\n]{0,24}?\b(?:2[68]|3[02468]|4[02468])(?:AA|A|B|C|DDD|DD|D|E|F|G)\b/;
function _lcHasLetterKey(value) {
if (!value || typeof value !== 'object') return false;
return Object.keys(value).some((key) => (key !== 'bralette_wireless' && /alpha|bralette/i.test(key)) || _lcHasLetterKey(value[key]));
}
function brandRecordsLetterSizing(entry) {
if (!entry || typeof entry !== 'object') return false;
if (entry.alpha_size_table || entry.cup_group_sizes) return true;
if (_lcHasLetterKey(entry)) return true;
return _lcLetterBesideBandCup.test(JSON.stringify(entry));
}
const _LC_STEPS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'];
const _LC_PLUS_STEPS = { '1X': 5.5, '2X': 6.5, '3X': 7.5, '4X': 8.5, '5X': 9.5 };
function letterWithinReason(label, size) {
const read = letterFamilyOf(label);
const stepOf = (family, letter) => (family === 'plus' ? _LC_PLUS_STEPS[letter] : (_LC_STEPS.includes(letter) ? _LC_STEPS.indexOf(letter) : null));
const step = read ? stepOf(read.family, read.letter) : null;
if (step == null || !size || size.band == null || !size.cup) return true;
const cups = (typeof module !== 'undefined' && module.exports) ? require('./fitEngine').CUP_LETTERS : CUP_LETTERS;
const c = cups.indexOf(size.cup);
if (c === -1) return true;
const steps = [];
[[size.band, c], [size.band - 2, c + 1], [size.band + 2, c - 1]].forEach(([band, i]) => {
const entry = i >= 0 && i < cups.length ? LETTER_CONSENSUS[`${band}${cups[i]}`] : null;
const run = entry && (entry.misses ? ['misses', entry.misses] : (entry.plus ? ['plus', entry.plus] : null));
if (!run) return;
const [family, a] = run;
[a[0], ...(Array.isArray(a[4]) ? a[4].map(([letter]) => letter) : [])].forEach((letter) => {
const s = stepOf(family, letter);
if (s != null) steps.push(s);
});
});
if (!steps.length) return true;
const lo = Math.min(...steps);
const hi = Math.max(...steps);
return (step < lo ? lo - step : (step > hi ? step - hi : 0)) < 2;
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = { letterWithinReason, letterConsensusFor, letterFamilyOf, brandRecordsLetterSizing, equivalentLetter, LETTER_CONSENSUS, LETTER_CONSENSUS_FLOORED, LETTER_CONSENSUS_FAMILIES, PLUS_LETTER_EQUIVALENTS };
}
/* src/styleAdjustment.js */
const _saFitEngine = (typeof module !== 'undefined' && module.exports) ? require('./fitEngine') : null;
const _saK = (typeof module !== 'undefined' && module.exports) ? require('./sizingConstants') : SIZING_CONSTANTS;
const _saCupLetters = _saFitEngine ? _saFitEngine.CUP_LETTERS : CUP_LETTERS;
const _saValidBands = _saFitEngine ? _saFitEngine.VALID_BANDS : VALID_BANDS;
const _saFitInstructionParser = (typeof module !== 'undefined' && module.exports) ? require('./fitInstructionParser') : null;
const _saParseFitInstructions = _saFitInstructionParser ? _saFitInstructionParser.parseFitInstructions : parseFitInstructions;
const _saCupInstructionParser = (typeof module !== 'undefined' && module.exports) ? require('./cupInstructionParser') : null;
const _saParseCupInstructions = _saCupInstructionParser ? _saCupInstructionParser.parseCupInstructions : parseCupInstructions;
const _saChartMatcher = (typeof module !== 'undefined' && module.exports) ? require('./chartMatcher') : null;
const _saMatchMeasurementsToChart = _saChartMatcher ? _saChartMatcher.matchMeasurementsToChart : matchMeasurementsToChart;
const _saGetChartConfidence = _saChartMatcher ? _saChartMatcher.getChartConfidence : getChartConfidence;
const _saChartQualityFor = _saChartMatcher ? _saChartMatcher.chartQualityFor : chartQualityFor;
const _saBoundaryAlternate = _saChartMatcher ? _saChartMatcher.boundaryAlternate : boundaryAlternate;
const _saChartMissPhrase = _saChartMatcher ? _saChartMatcher.chartMissPhrase : chartMissPhrase;
const _saGetSisterSizes = _saFitEngine ? _saFitEngine.getSisterSizes : getSisterSizes;
const _saCalculateSize = _saFitEngine ? _saFitEngine.calculateSize : calculateSize;
const _saLetterConsensus = (typeof module !== 'undefined' && module.exports) ? require('./letterConsensus') : null;
const _saLetterConsensusFor = _saLetterConsensus ? _saLetterConsensus.letterConsensusFor : letterConsensusFor;
const _saLetterConsensusFamilies = _saLetterConsensus ? _saLetterConsensus.LETTER_CONSENSUS_FAMILIES : LETTER_CONSENSUS_FAMILIES;
function applyCupShift(cupIndex, cupShift) {
if (!cupShift) return cupIndex;
const step = Math.sign(cupShift) * Math.ceil(Math.abs(cupShift));
return Math.max(0, Math.min(cupIndex + step, _saCupLetters.length - 1));
}
function bandClaimNote(bandAdjustment, applied) {
const claim = ` This listing's own description says "${bandAdjustment.matchedText},"`;
return applied
? `${claim} so that specific band claim was applied.`
: `${claim} but your band is already at the edge of the range we size, so that claim couldn't be applied here.`;
}
function applyBandShift(bandIndex, steps) {
if (!steps) return bandIndex;
return Math.max(0, Math.min(bandIndex + steps, _saValidBands.length - 1));
}
function listingClaimSize(baseSize, bandAdjustment, cupAdjustment, styleCupShift) {
const cupIndex = _saCupLetters.indexOf(baseSize.cup);
const cupShift = cupAdjustment ? cupAdjustment.direction * cupAdjustment.magnitude : styleCupShift;
const shiftedIndex = applyCupShift(cupIndex, cupShift);
const bandSteps = bandAdjustment ? bandAdjustment.direction * bandAdjustment.magnitude : 0;
const band = bandSteps ? _saValidBands[applyBandShift(_saValidBands.indexOf(baseSize.band), bandSteps)] : baseSize.band;
const cup = _saCupLetters[shiftedIndex];
const cupSteps = shiftedIndex - cupIndex;
return {
band,
cup,
label: `${band}${cup}`,
bandApplied: !!bandSteps && (band !== baseSize.band || !!baseSize.belowBandFloor),
cupSteps,
cupClaimApplied: !!cupAdjustment && cupSteps !== 0,
bandSteps,
};
}
function composeFitInstructionNote(fitInstructions, cupInstructions) {
const parts = [];
if (fitInstructions) parts.push(fitInstructions.conditional, fitInstructions.vague);
if (cupInstructions) parts.push(cupInstructions.conditional, cupInstructions.vague, cupInstructions.appearance);
const notes = parts.filter(Boolean).map((n) => n.note);
return notes.length ? ` ${notes.join(' ')}` : '';
}
function _saCapitalize(text) {
return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
function _saJoinList(items) {
if (items.length <= 1) return items[0] || '';
return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
function composeStyleAttributeNote(styleAttributes, styleModifiers, hasPrimaryStyle) {
if (!Array.isArray(styleAttributes) || !styleAttributes.length) return '';
const labelled = styleAttributes.filter((attribute) => attribute && attribute.label);
if (!labelled.length) return '';
const list = _saJoinList(labelled.map((attribute) => attribute.label));
if (!hasPrimaryStyle) {
return `${_saCapitalize(list)}. Those are real features of this listing, but none of them names a cut, so there's no cut-based adjustment to apply.`;
}
const shifting = labelled.filter((attribute) => {
const attributeRule = styleModifiers && styleModifiers[attribute.styleKey];
return !!attributeRule && typeof attributeRule.cupShift === 'number' && attributeRule.cupShift !== 0;
});
if (shifting.length) {
const shiftingList = _saJoinList(shifting.map((attribute) => attribute.label));
return `${_saCapitalize(list)}. ${_saCapitalize(shiftingList)} can affect cup fit too, but only one style adjustment is applied here, never several stacked on top of each other.`;
}
return `${_saCapitalize(list)}. Those describe how this bra is built rather than how it is cut, so they don't change the recommended size on their own.`;
}
function headlineStyleNoteFor(styleAttributes, styleModifiers, primaryStyleKey) {
if (!Array.isArray(styleAttributes)) return null;
const kept = styleAttributes.find((attribute) => {
if (!attribute || attribute.styleKey === primaryStyleKey) return false;
const attributeRule = styleModifiers && styleModifiers[attribute.styleKey];
return !!attributeRule && attributeRule.keepNoteInHeadline === true && !!attributeRule.note;
});
return kept ? styleModifiers[kept.styleKey].note : null;
}
function withHeadlineStyleNote(result, headlineStyleNote) {
if (headlineStyleNote && result && result.confidenceFactors && result.confidenceFactors.matchDetail) {
result.confidenceFactors.matchDetail.headlineStyleNote = headlineStyleNote;
}
return result;
}
function normalizeCupToBand(band, cupIndex, referenceBand) {
const bandIndex = _saValidBands.indexOf(band);
const refIndex = _saValidBands.indexOf(referenceBand);
const normalized = cupIndex + (bandIndex - refIndex);
return Math.max(0, Math.min(normalized, _saCupLetters.length - 1));
}
function lookupFlatSizeTable(band, cup, table) {
const [min, max] = table.bandRange;
const clampedBand = band < min ? min : (band > max ? max : null);
const lookupBand = clampedBand || band;
const rawLabel = table.flat[`${lookupBand}${cup}`];
const malformed = typeof rawLabel === 'string' && rawLabel.includes(',');
const label = malformed ? null : rawLabel;
return { label: label == null ? null : label, clampedBand, malformed };
}
function projectVerifiedAlphaLabel(band, cup, table, measurements) {
if (activeMeasurementRule(table)) {
const hit = lookupMeasurementAlphaRule(measurements, activeMeasurementRule(table));
return hit ? hit.label : null;
}
if (!table || !Array.isArray(table.reverseProjectionVerifiedCups)) return null;
if (!table.reverseProjectionVerifiedCups.includes(cup)) return null;
const result = lookupFlatSizeTable(band, cup, table);
return result.label;
}
function activeMeasurementRule(table) {
if (!table || !table.measurement_rule || typeof table.measurement_rule !== 'object') return null;
if (table.measurement_rule_record_only === true) return null;
if (table.measurement_rule_record_only !== undefined) {
throw new Error(`alpha_size_table declares measurement_rule_record_only as ${JSON.stringify(table.measurement_rule_record_only)}, which is not true`);
}
return table.measurement_rule;
}
function openedByLetterListings(table) {
if (!table || table.opened_by_its_letter_listings === undefined) return false;
if (table.opened_by_its_letter_listings === true) return true;
throw new Error(`alpha_size_table declares opened_by_its_letter_listings as ${JSON.stringify(table.opened_by_its_letter_listings)}, which is not true`);
}
function cupGroupCells(table) {
const cells = {};
const doubled = [];
const sizes = (table && table.sizes) || {};
Object.keys(sizes).filter((label) => !label.startsWith('_')).forEach((label) => {
(sizes[label] || []).forEach((row) => {
(row.cups || []).forEach((cup) => {
const cell = `${row.band}${cup}`;
if (cells[cell] !== undefined && cells[cell] !== label) doubled.push(cell);
cells[cell] = label;
});
});
});
doubled.forEach((cell) => { delete cells[cell]; });
return { cells, doubled };
}
function lookupCupGroupSize(band, cup, listing) {
if (!listing || !listing.table || band == null || !cup) return null;
const cell = `${band}${cup}`;
const printedLabel = cupGroupCells(listing.table).cells[cell];
if (!printedLabel) return null;
const canonical = listing.canonical || {};
return { label: canonical[printedLabel] || printedLabel, printedLabel, cell };
}
function cupGroupListedSizes(listing) {
const out = {};
if (!listing || !listing.table) return out;
const { cells } = cupGroupCells(listing.table);
const canonical = listing.canonical || {};
Object.keys(cells).forEach((cell) => {
const m = /^(\d+)([A-Z]+)$/.exec(cell);
if (!m) return;
const label = canonical[cells[cell]] || cells[cell];
(out[label] = out[label] || []).push({ band: Number(m[1]), cup: m[2] });
});
return out;
}
const _saLabelReader = (typeof module !== 'undefined' && module.exports) ? require('./sizeLabelReader') : null;
const _saReadSizeLabel = _saLabelReader ? _saLabelReader.readSizeLabel : readSizeLabel;
const _saPlainLetterFamilyRe = /^(XXS|XS|S|M|L|XL|XXL|XXXL|XXXXL|[0-9]X|[0-9]XL)$/;
function _saIsPlainLetterSize(label) {
const read = _saReadSizeLabel(label);
if (read.system !== 'letter' || read.letterModifier || read.noise.length || read.also) return false;
if (read.letterSpelling === 'abbreviation') return _saPlainLetterFamilyRe.test(read.letter);
return read.letterSpelling === 'short' && ['SM', 'MD', 'LG'].includes(read.text);
}
function listingSellsCupGroupSizes(offeredLabels, table) {
const sizes = table && table.sizes;
if (!sizes) return false;
const own = new Set(Object.keys(sizes)
.filter((label) => !label.startsWith('_') && !_saIsPlainLetterSize(label.trim()))
.map((label) => label.trim().toUpperCase()));
return (offeredLabels || []).some((label) => own.has(String(label || '').trim().toUpperCase()));
}
function cupGroupSizesForListing(brandEntry, alphaGrid) {
const table = brandEntry && brandEntry.cup_group_sizes;
if (!table || !table.sizes) return null;
if (!listingSellsCupGroupSizes(alphaGrid && alphaGrid.offeredLabels, table)) return null;
const aliases = brandEntry.size_label_aliases;
const shown = table.shown_on_listing_page;
if (shown !== undefined && typeof shown !== 'boolean') {
throw new Error(`cup_group_sizes declares shown_on_listing_page as ${JSON.stringify(shown)}, which is neither true nor false`);
}
return { table, canonical: (aliases && aliases.canonical) || {}, held: !!table.held, onListingPage: shown === true };
}
function _saBrandLetterTableAnswers(baseSize, rule, brandTable, measurements) {
if (!brandTable) return false;
if (activeMeasurementRule(brandTable)) return true;
if (rule && rule.publishedTableOnlyForVerifiedCups) {
return !!projectVerifiedAlphaLabel(baseSize.band, baseSize.cup, brandTable, measurements);
}
return !!(brandTable.flat && lookupFlatSizeTable(baseSize.band, baseSize.cup, brandTable).label);
}
function lookupMeasurementAlphaRule(measurements, rule) {
if (!rule || !measurements) return null;
if (Array.isArray(rule.underbust_rows)) {
const read = readUnderbustLetterRows(measurements, rule);
return read && read.label ? { label: read.label, underbustRow: read.row, underbust: read.underbust } : null;
}
if (rule.grid) {
const read = readMeasurementGrid(measurements, rule);
return read && read.label ? { label: read.label, gridCell: read.cell, underbust: read.underbust, bust: read.bust } : null;
}
const underbust = Number(measurements.underbust);
const bust = Number(measurements.bust);
if (!Number.isFinite(underbust) || !Number.isFinite(bust)) return null;
const fraction = underbust % 1;
const rounded = fraction > 0.5 ? underbust - fraction + 1 : underbust - fraction;
const bandHit = rule.underbust_buckets.find((b) => rounded >= b.min && rounded <= b.max);
const bustHit = rule.bust_buckets.find((b) => bust >= b.min && bust <= b.max);
if (!bandHit || !bustHit) return null;
const cup = (rule.cup_by_bust_bucket[bustHit.bucket] || {})[bandHit.band];
const label = rule.letter_by_band[bandHit.band];
if (!cup || !label) return null;
return { label, brandSize: `${bandHit.band}${cup}` };
}
function readUnderbustLetterRows(measurements, rule) {
if (!rule || !Array.isArray(rule.underbust_rows) || !rule.underbust_rows.length || !measurements) return null;
const underbust = Number(measurements.underbust);
if (!Number.isFinite(underbust)) return null;
const rows = rule.underbust_rows;
const holding = rows.filter((row) => underbust >= row.min && underbust <= row.max);
if (holding.length === 1) return { label: holding[0].label, row: holding[0], underbust };
if (holding.length > 1) return { refused: 'two-rows', rows: holding, underbust };
const below = rows.filter((row) => row.max < underbust);
const above = rows.filter((row) => row.min > underbust);
if (below.length && above.length) {
return { refused: 'gap', rows: [below[below.length - 1], above[0]], underbust };
}
return { refused: 'outside', rows: [rows[0], rows[rows.length - 1]], underbust };
}
function readMeasurementGrid(measurements, rule) {
const grid = rule && rule.grid;
if (!grid || !Array.isArray(grid.underbust_rows) || !Array.isArray(grid.bust_columns) || !Array.isArray(grid.cells) || !measurements) return null;
const underbust = Number(measurements.underbust);
const bust = Number(measurements.bust);
if (!Number.isFinite(underbust) || !Number.isFinite(bust)) return null;
const factor = rule.unit === 'cm' ? _saK.CM_PER_INCH : 1;
const halfway = rule.between_ranges === 'halfway';
const pick = (value, ranges) => {
for (let i = 0; i < ranges.length; i += 1) {
if (value >= ranges[i].min && value <= ranges[i].max) return { index: i, inRange: true };
const next = ranges[i + 1];
if (next && value > ranges[i].max && value < next.min) {
if (!halfway) return null;
const mid = (ranges[i].max + next.min) / 2;
return { index: value < mid ? i : i + 1, inRange: false };
}
}
return null;
};
const row = pick(Math.round(underbust * factor * 1e6) / 1e6, grid.underbust_rows);
const column = pick(Math.round(bust * factor * 1e6) / 1e6, grid.bust_columns);
if (!row || !column) return { label: null, cell: null, underbust, bust };
const label = (grid.cells[row.index] || [])[column.index] || null;
return {
label,
cell: label ? {
unit: rule.unit === 'cm' ? 'cm' : 'inches',
underbust: { ...grid.underbust_rows[row.index], inRange: row.inRange },
bust: { ...grid.bust_columns[column.index], inRange: column.inRange },
} : null,
underbust,
bust,
};
}
function underbustChartGapResult(baseSize, styleKey, source, ambiguous, refusal, detectionMeta, fitInstructionNote) {
const brandName = ((detectionMeta && detectionMeta.brandDisplayName) || '').replace(/\s*\([^)]*\)\s*$/, '') || 'This brand';
const inches = (n) => `${Math.round(n * 100) / 100}"`;
const row = (r) => `${r.label} (${r.min}-${r.max}")`;
const [first, second] = refusal.rows;
let note;
if (refusal.refused === 'two-rows') {
note = `Your underbust, ${inches(refusal.underbust)}, is where two rows of ${brandName}'s size chart meet: the chart puts it in both ${row(first)} and ${row(second)}, and says nothing about which one. Both are shown here, and neither is picked for you.`;
} else if (refusal.refused === 'gap') {
note = `${brandName}'s size chart has no size for an underbust of ${inches(refusal.underbust)}: it goes from ${row(first)} to ${row(second)}, with nothing in between, so no ${brandName} size is recommended here.`;
} else {
note = `${brandName}'s size chart has no size for an underbust of ${inches(refusal.underbust)}: its sizes run from ${first.min}" to ${second.max}", so no ${brandName} size is recommended here.`;
}
const twoRows = refusal.refused === 'two-rows';
return {
label: baseSize.label,
band: null,
cup: null,
brandChartGap: true,
brandChartBetween: twoRows ? [first.label, second.label] : null,
explanation: `${note}${fitInstructionNote}`,
confidence: twoRows ? "Between this brand's chart rows" : "Not on this brand's chart",
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: false, styleKey, shiftMagnitude: 0,
matchDetail: {
type: 'brandChartGap', styleKey, baseLabel: baseSize.label, brandDisplayName: brandName, between: null,
underbustRows: { refused: refusal.refused, underbust: refusal.underbust, rows: refusal.rows.map((r) => ({ label: r.label, min: r.min, max: r.max })) },
note,
},
},
fitInstructionNote: fitInstructionNote.trim() || null,
};
}
function listingChartOutsideResult(baseSize, styleKey, source, ambiguous, outside, detectionMeta, fitInstructionNote) {
const sold = ((detectionMeta && detectionMeta.listingLetters) || []).map(String);
const nameable = outside.label && (!String(outside.label).includes('/') || sold.includes(String(outside.label)));
const closest = nameable ? outside.label : null;
const phrase = closest ? _saChartMissPhrase(outside.misses) : null;
const note = closest && phrase
? `This listing's own size chart has no size for your measurements, so no size is recommended here. Its closest size is ${closest}, too far to recommend: ${phrase}.`
: "This listing's own size chart has no size for your measurements, so no size is recommended here.";
return {
label: baseSize.label,
band: null,
cup: null,
brandChartGap: true,
brandChartBetween: null,
explanation: `${note}${fitInstructionNote}`,
confidence: "Not on this brand's chart",
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: true, styleKey, shiftMagnitude: 0,
matchDetail: {
type: 'brandChartGap', styleKey, baseLabel: baseSize.label, brandDisplayName: null, between: null,
listingChartOutside: { closest, misses: closest ? outside.misses : [] },
note,
},
},
fitInstructionNote: fitInstructionNote.trim() || null,
};
}
const MEASUREMENT_INPUT_STEP_INCHES = 0.01;
function measurementRuleFingerprint(rule) {
const text = JSON.stringify([rule.underbust_buckets, rule.bust_buckets, rule.cup_by_bust_bucket, rule.letter_by_band]);
let h = 0x811c9dc5;
for (let i = 0; i < text.length; i += 1) {
h ^= text.charCodeAt(i);
h = Math.imul(h, 0x01000193) >>> 0;
}
return h;
}
function sizeCalculatorExhaustivelyVerified(rule) {
if (!rule || typeof rule !== 'object') return false;
const record = rule.exhaustive_live_verification;
if (!record || typeof record !== 'object') return false;
const whole = (n) => Number.isInteger(n) && n >= 0;
if (record.disagreements !== 0) return false;
if (!whole(record.bodies) || !whole(record.answered) || !whole(record.refused)) return false;
if (record.answered === 0 || record.answered + record.refused !== record.bodies) return false;
if (record.unit !== 'inches' || rule.unit !== 'inches') return false;
const step = record.step;
if (typeof step !== 'number' || !(step > 0) || step > MEASUREMENT_INPUT_STEP_INCHES) return false;
const range = (r) => Array.isArray(r) && r.length === 2 && r.every(Number.isFinite) && r[0] < r[1];
if (!range(record.underbust) || !range(record.bust)) return false;
const points = (r) => Math.round((r[1] - r[0]) / step) + 1;
if (record.bodies !== points(record.underbust) * points(record.bust)) return false;
const ub = Array.isArray(rule.underbust_buckets) ? rule.underbust_buckets : [];
const bu = Array.isArray(rule.bust_buckets) ? rule.bust_buckets : [];
if (!ub.length || !bu.length) return false;
const lowest = (list) => Math.min(...list.map((b) => b.min));
const highest = (list) => Math.max(...list.map((b) => b.max));
if (record.underbust[0] > lowest(ub) - 0.5 || record.underbust[1] < highest(ub) + 0.5) return false;
if (record.bust[0] > lowest(bu) || record.bust[1] < highest(bu)) return false;
return record.rule_fingerprint === measurementRuleFingerprint(rule);
}
function unresolvedAlphaSizeResult(baseSize, rule, styleKey, reason, fitInstructionNote, diagnosis, chartQuality) {
const own = (baseSize.bandClamped && baseSize.honestLabel) ? baseSize.honestLabel : baseSize.label;
return {
label: own,
band: null,
cup: null,
...(chartQuality ? { chartQuality } : {}),
explanation: `${rule.note} ${reason} Showing your calculated band and cup size, ${own}, instead.${fitInstructionNote}`,
confidence: 'Uncertain, check size chart',
confidenceFactors: {
source: 'heuristic', ambiguous: false, usesOwnSizingTable: true, styleKey, shiftMagnitude: 0,
matchDetail: { type: 'unresolvedAlpha', styleKey, baseLabel: own, reason, ...(diagnosis || {}) },
},
unresolvedAlphaSize: true,
fitInstructionNote: fitInstructionNote.trim() || null,
};
}
function letterConsensusResult(baseSize, rule, styleKey, source, ambiguous, hit, detectionMeta, fitInstructionNote, attributeNote) {
const family = _saLetterConsensusFamilies[hit.family] || [];
const offered = ((detectionMeta && detectionMeta.listingLetters) || []).map((l) => String(l).trim().toUpperCase());
const listed = family.filter((letter) => offered.includes(letter));
return {
label: hit.label,
band: null,
cup: null,
explanation: hit.split
? `${rule.note} No size conversion for this brand is on file, so this is the usual one, and the brand size charts Measured Size has split on ${baseSize.label}: ${hit.split[0][1]} of the ${hit.total} that list it give ${hit.split[0][0]}, and ${hit.split[1][1]} give ${hit.split[1][0]}. If this listing has its own size chart, it is the one to go by.${fitInstructionNote}`
: `${rule.note} No size conversion for this brand is on file, so this is the usual one: ${hit.agree} of the ${hit.total} brand size charts Measured Size has that list ${baseSize.label} give ${hit.label}. If this listing has its own size chart, it is the one to go by.${fitInstructionNote}`,
confidence: 'Uncertain, check size chart',
detailQuality: detailQualityFor(ambiguous, source),
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: true, styleKey, shiftMagnitude: 1,
matchDetail: {
type: 'letterConsensus',
styleKey,
bucketLabel: hit.label,
baseLabel: baseSize.label,
cell: hit.cell,
family: hit.family,
agree: hit.agree,
total: hit.total,
spread: hit.spread,
...(hit.split ? { split: hit.split, splitPick: hit.splitPick } : {}),
...(hit.equivalentOf ? { equivalentOf: hit.equivalentOf } : {}),
...(hit.raisedBy ? { raisedBy: hit.raisedBy } : {}),
...(hit.floored ? { floored: hit.floored } : {}),
},
},
alphaSequence: listed.length ? listed : family.slice(),
fitInstructionNote: fitInstructionNote.trim() || null,
styleAttributeNote: attributeNote || null,
};
}
function usualLetterFor(size, detectionMeta) {
if (!detectionMeta || detectionMeta.usualLetterAllowed !== true) return null;
const key = usualLetterKeySize(size, detectionMeta);
if (!key || key.band == null || !key.cup) return null;
const hit = _saLetterConsensusFor(key.band, key.cup, detectionMeta.listingLetters || null, detectionMeta.listingLettersInStock || null);
return hit ? { ...hit, keySize: key } : null;
}
function usualLetterKeySize(size, detectionMeta) {
const raw = detectionMeta && detectionMeta.rawMeasurements;
const underbust = Number(raw && raw.underbust);
const bust = Number(raw && raw.bust);
if (!Number.isFinite(underbust) || !Number.isFinite(bust)) return size || null;
const own = _saCalculateSize(underbust, bust);
if (!own || own.beyondLadder || own.beyondBandLadder) return null;
return { band: own.band, cup: own.cup, label: own.label };
}
function resolveListingBrandSize(band, cup, chart, soldLabels) {
const sold = soldLabels || [];
if (!chart) {
return { label: null, failureKind: 'no brand size chart read', reason: "This listing's own size chart couldn't be read." };
}
if (!chart.brandSizes.some((size) => sold.includes(size))) {
return { label: null, failureKind: 'chart names none of the sizes sold', reason: "This listing's own size chart doesn't use the numbered sizes it is sold in, so it can't say which number fits you." };
}
const named = (chart.byBandCup && chart.byBandCup[`${band}${cup}`]) || [];
const soldNamed = named.filter((size) => sold.includes(size));
if (soldNamed.length === 1) return { label: soldNamed[0] };
if (soldNamed.length > 1) {
return {
label: null,
failureKind: 'chart lists this size twice',
chartLabels: soldNamed,
reason: `This listing's own size chart lists your size under more than one of its sizes (${soldNamed.join(' and ')}), so neither can be picked for you.`,
};
}
if (named.length) {
return {
label: null,
failureKind: 'chart size not sold here',
chartLabels: named,
reason: `This listing's own size chart puts your size in a ${named.join(' or ')}, which this listing isn't sold in.`,
};
}
return { label: null, failureKind: 'size not in chart', reason: "This listing's own size chart doesn't list your size." };
}
function listingBrandSizeResult(baseSize, rule, styleKey, ambiguous, source, detectionMeta, fitInstructionNote, attributeNote) {
const listing = (detectionMeta && detectionMeta.listingBrandSizing) || null;
const resolved = resolveListingBrandSize(baseSize.band, baseSize.cup, listing && listing.chart, listing && listing.soldLabels);
if (!resolved.label) {
return unresolvedAlphaSizeResult(
baseSize, rule, styleKey, resolved.reason, fitInstructionNote,
{ failedTable: "this listing's own brand size chart", failureKind: resolved.failureKind, listingBrandSizeChart: true, ...(resolved.chartLabels ? { chartLabels: resolved.chartLabels } : {}) },
null, null
);
}
const label = resolved.label;
return {
label,
band: null,
cup: null,
explanation: `${rule.note} This listing's own size chart puts your base size (${baseSize.label}) in a ${label}.${fitInstructionNote}`,
confidence: getConfidence(styleKey, ambiguous, source),
detailQuality: detailQualityFor(ambiguous, source),
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: true, styleKey, shiftMagnitude: 1,
matchDetail: { type: 'staticTable', styleKey, bucketLabel: label, fromPublishedTable: false, listingBrandSizeChart: true, baseLabel: baseSize.label },
},
alphaSequence: (listing.soldLabels || []).slice(),
fitInstructionNote: fitInstructionNote.trim() || null,
styleAttributeNote: attributeNote || null,
};
}
function _saWeakerRating(rating, cap) {
const RANK = _saK.RATING_LADDER;
if (!RANK.includes(rating) || !RANK.includes(cap)) return rating;
return RANK[Math.max(RANK.indexOf(rating), RANK.indexOf(cap))];
}
function getConfidence(styleKey, ambiguous, source) {
if (!styleKey) return 'Uncertain, check size chart';
let score = source === 'jsonld' ? 2 : 1;
score += ambiguous ? 0 : 2;
if (score >= 4) return 'Good match';
if (score >= 2) return 'Likely fits';
return 'Uncertain, check size chart';
}
function wholeInchMeasurements(measurements) {
const whole = (v) => {
const n = Number(v);
return Number.isFinite(n) && Math.abs(n - Math.round(n)) < 1e-6;
};
return !!measurements && whole(measurements.underbust) && whole(measurements.bust);
}
function verifiedFormulaConfidence(styleKey, rule, ambiguous, source, detectionMeta, listingClaimApplied) {
if (!detectionMeta || detectionMeta.brandFormulaVerified !== true) return null;
if (detectionMeta.brandBandRuleRecordOnly === true) return null;
if (detectionMeta.brandFormulaWholeInchOnly === true && !wholeInchMeasurements(detectionMeta.rawMeasurements)) return null;
if (!styleKey || !rule) return null;
if (ambiguous || source !== 'jsonld') return null;
if (rule.disputedFactor) return null;
if (listingClaimApplied) return null;
return 'Great match';
}
function brandCalculatorLetterConfidence(styleKey, rule, ambiguous, source, measurementRule, measured) {
if (!measured || !sizeCalculatorExhaustivelyVerified(measurementRule)) return null;
if (!styleKey || !rule) return null;
if (ambiguous || source !== 'jsonld') return null;
if (rule.disputedFactor) return null;
return 'Great match';
}
const DETAIL_QUALITY_CONFIRMED = 'Confirmed product details';
const DETAIL_QUALITY_ESTIMATED = 'Estimated from description';
function detailQualityFor(ambiguous, source) {
return (source === 'jsonld' && !ambiguous) ? DETAIL_QUALITY_CONFIRMED : DETAIL_QUALITY_ESTIMATED;
}
function chartMeasurementsFor(baseSize, detectionMeta) {
const clamped = !!(baseSize && baseSize.bandClamped);
const band = clamped ? baseSize.honestBand : baseSize.band;
const cup = clamped ? baseSize.honestCup : baseSize.cup;
const sisters = _saGetSisterSizes(band, cup);
const sisterPairs = [sisters.sizeUp, sisters.sizeDown].filter(Boolean).map((s) => s.label);
const rawMeasurements = (detectionMeta && detectionMeta.rawMeasurements) || {};
return { band, cup, sisterPairs, underbust: rawMeasurements.underbust, bust: rawMeasurements.bust };
}
function _saLetterChartReaches(baseSize, rule, detectionMeta) {
if (!rule || !rule.usesOwnSizingTable || rule.answersFromListingBrandSizeChart) return false;
const buckets = detectionMeta && detectionMeta.listingChart;
if (!buckets || !buckets.length) return false;
const match = _saMatchMeasurementsToChart(chartMeasurementsFor(baseSize, detectionMeta), buckets);
return !!(match && match.matched);
}
function _saHonestLetterSize(baseSize, rule, detectionMeta) {
if (!baseSize || !baseSize.bandClamped || !rule || !rule.usesOwnSizingTable || rule.answersFromListingBrandSizeChart) return null;
if (baseSize.honestBand == null || !baseSize.honestCup) return null;
const honest = { band: baseSize.honestBand, cup: baseSize.honestCup, label: baseSize.honestLabel, pastClamp: true };
const meta = detectionMeta || {};
const brandTable = meta.brandAlphaTable || null;
if (brandTable) {
if (activeMeasurementRule(brandTable)) {
return lookupMeasurementAlphaRule(meta.rawMeasurements, activeMeasurementRule(brandTable)) ? honest : null;
}
if (!brandTable.flat || !Array.isArray(brandTable.bandRange)) return null;
if (honest.band < brandTable.bandRange[0] || honest.band > brandTable.bandRange[1]) return null;
if (rule.publishedTableOnlyForVerifiedCups
&& !(Array.isArray(brandTable.reverseProjectionVerifiedCups) && brandTable.reverseProjectionVerifiedCups.includes(honest.cup))) return null;
const hit = lookupFlatSizeTable(honest.band, honest.cup, brandTable);
return hit.label && !hit.clampedBand ? honest : null;
}
if (meta.brandCupGroupSizes) {
return lookupCupGroupSize(honest.band, honest.cup, meta.brandCupGroupSizes) ? honest : null;
}
if (meta.listingChart && meta.listingChart.length) return null;
return usualLetterFor(honest, meta) ? honest : null;
}
function listedSizeResult(adjusted, listed, own, styleKey, source, ambiguous) {
const RANK = _saK.RATING_LADDER;
const styled = getConfidence(styleKey, ambiguous, source);
let confidence = RANK.includes(styled) ? RANK[Math.max(RANK.indexOf(styled), 1)] : styled;
if (listed.decidedBy === 'evidence' && RANK.includes(confidence)) confidence = 'Uncertain, check size chart';
return {
label: listed.token,
band: null,
cup: null,
explanation: '',
confidence,
detailQuality: detailQualityFor(ambiguous, source),
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: true, styleKey, shiftMagnitude: 0,
matchDetail: { type: 'listedSize', styleKey, bucketLabel: listed.token, baseLabel: own.label, cell: listed.cell, relation: listed.relation, lettering: listed.decidedBy ? { reading: listed.reading, decidedBy: listed.decidedBy, pastDD: (listed.pastDD || []).slice() } : null },
},
listedSize: listed,
fitInstructionNote: (adjusted && adjusted.fitInstructionNote) || null,
styleAttributeNote: (adjusted && adjusted.styleAttributeNote) || null,
};
}
function _saTwoSizeCell(rawCell, detectionMeta) {
const sizes = String(rawCell || '').split(',').map((s) => s.trim()).filter(Boolean);
if (sizes.length !== 2 || sizes[0] === sizes[1]) return null;
if (!sizes.every((s) => /^[A-Z0-9]+\+?$/i.test(s))) return null;
const canon = (label) => String(label).trim().toUpperCase();
const offered = ((detectionMeta && detectionMeta.listingLetters) || []).map(canon);
const inStockList = detectionMeta && detectionMeta.listingLettersInStock;
const inStock = (inStockList || []).map(canon);
const [smaller, larger] = sizes;
const pickOf = (label, pick) => ({ sizes, label, pick, stockRead: !!inStockList });
if (inStockList) {
const both = sizes.filter((s) => inStock.includes(canon(s)));
if (both.length === 1) return pickOf(both[0], 'in stock');
if (both.length === 2) return pickOf(larger, 'larger');
const at = (s) => offered.indexOf(canon(s));
const stockAt = offered.map((l, i) => (inStock.includes(l) ? i : -1)).filter((i) => i !== -1);
const distance = (s) => (at(s) === -1 || !stockAt.length ? Infinity : Math.min(...stockAt.map((i) => Math.abs(i - at(s)))));
if (distance(smaller) !== distance(larger)) return pickOf(distance(smaller) < distance(larger) ? smaller : larger, 'nearest');
}
const sold = sizes.filter((s) => offered.includes(canon(s)));
if (sold.length === 1) return pickOf(sold[0], 'sold');
return pickOf(larger, inStockList ? 'neither' : 'larger');
}
function _saChartEdgeSize(table, baseSize, edgeBand, detectionMeta) {
const up = edgeBand > baseSize.band;
const c = _saCupLetters.indexOf(baseSize.cup) + (up ? -1 : 1);
if (c < 0 || c >= _saCupLetters.length) return null;
const cell = `${edgeBand}${_saCupLetters[c]}`;
const label = table.flat[cell];
if (typeof label !== 'string' || !label || label.includes(',')) return null;
const withinReason = _saLetterConsensus ? _saLetterConsensus.letterWithinReason : letterWithinReason;
if (!withinReason(label, { band: baseSize.band, cup: baseSize.cup })) return null;
const sold = ((detectionMeta && detectionMeta.listingLetters) || []).map((l) => String(l).trim().toUpperCase());
if (sold.length && !sold.includes(label.trim().toUpperCase())) return null;
return { label, cell, direction: up ? 'smaller' : 'larger' };
}
const _saLetterFamilyMemo = new Map();
const _saUsualCellsMemo = new Map();
function _saMemo(map, key, compute) {
if (map.has(key)) return map.get(key);
if (map.size > 5000) map.clear();
const value = compute();
map.set(key, value);
return value;
}
let _saAlphaAvailabilityLazy = null;
function _saClosestInStockPlaced(offered, available, target, named) {
if (typeof module !== 'undefined' && module.exports) {
return (_saAlphaAvailabilityLazy || (_saAlphaAvailabilityLazy = require('./alphaSizeAvailability'))).closestInStockPlaced(offered, available, target, named);
}
return typeof closestInStockPlaced === 'function' ? closestInStockPlaced(offered, available, target, named) : null;
}
function closestLetterBeyondSources(size, detectionMeta, alphaGrid) {
const found = _saClosestLetterBeyondSources(size, detectionMeta, alphaGrid);
if (found || !size || size.band == null || !size.cup || !alphaGrid || !alphaGrid.offeredLabels) return found;
const available = (alphaGrid.availableLabels || []).map(String);
if (!available.length) return null;
const familyOf = (label) => _saMemo(_saLetterFamilyMemo, String(label),
() => (_saLetterConsensus ? _saLetterConsensus.letterFamilyOf : letterFamilyOf)(label));
const consensus = _saLetterConsensus ? _saLetterConsensus.LETTER_CONSENSUS : LETTER_CONSENSUS;
const cellsOf = (family) => Object.keys(consensus).filter((cell) => /^\d+[A-Z]+$/.test(cell) && consensus[cell][family]);
const families = [...new Set(available.map((l) => familyOf(l)).filter(Boolean).map((r) => r.family))];
const findAvailable = (typeof module !== 'undefined' && module.exports) ? _saSizeAvailabilityLazyModule().findAvailableSize : findAvailableSize;
const split = (cell) => { const m = /^(\d+)([A-Z]+)$/.exec(cell); return { band: Number(m[1]), cup: m[2] }; };
let best = null;
families.forEach((family) => {
const pairs = cellsOf(family);
if (!pairs.length) return;
const ranked = findAvailable({ band: size.band, cup: size.cup }, {
availableBands: [...new Set(pairs.map((cell) => split(cell).band))],
availableCups: [...new Set(pairs.map((cell) => split(cell).cup))],
availablePairs: pairs,
});
const top = (ranked.candidates && ranked.candidates[0]) || ranked.nearestBeyondReach || null;
if (!top || !consensus[top.label] || !consensus[top.label][family]) return;
const letter = consensus[top.label][family][0];
const order = (_saLetterConsensus ? _saLetterConsensus.LETTER_CONSENSUS_FAMILIES : LETTER_CONSENSUS_FAMILIES)[family];
available.forEach((label) => {
const read = familyOf(label);
if (!read || read.family !== family) return;
const distance = Math.abs(order.indexOf(read.letter) - order.indexOf(letter));
if (!best || distance < best.distance || (distance === best.distance && order.indexOf(read.letter) > best.index)) {
best = { label, distance, index: order.indexOf(read.letter), relation: order.indexOf(read.letter) < order.indexOf(letter) ? 'size-down' : 'size-up' };
}
});
});
if (best) return { label: best.label, inStock: true, namedOnly: true, source: 'naming', closestInStockNamed: { label: best.label, distance: best.distance, relation: best.relation } };
const misses = cellsOf('misses');
if (!misses.length) return null;
const ranked = findAvailable({ band: size.band, cup: size.cup }, {
availableBands: [...new Set(misses.map((cell) => split(cell).band))],
availableCups: [...new Set(misses.map((cell) => split(cell).cup))],
availablePairs: misses,
});
const top = (ranked.candidates && ranked.candidates[0]) || ranked.nearestBeyondReach || null;
const letter = top && consensus[top.label] && consensus[top.label].misses ? consensus[top.label].misses[0] : null;
const named = letter ? _saClosestInStockPlaced(alphaGrid.offeredLabels, available, letter) : null;
return named ? { label: named.label, inStock: true, namedOnly: true, source: 'naming', closestInStockNamed: named } : null;
}
function _saClosestLetterBeyondSources(size, detectionMeta, alphaGrid) {
if (!size || size.band == null || !size.cup || !alphaGrid) return null;
const meta = detectionMeta || {};
const offered = (alphaGrid.offeredLabels || alphaGrid.availableLabels || []).map(String);
const available = (alphaGrid.availableLabels || []).map(String);
if (!offered.length) return null;
const familyOf = (label) => _saMemo(_saLetterFamilyMemo, String(label),
() => (_saLetterConsensus ? _saLetterConsensus.letterFamilyOf : letterFamilyOf)(label));
const cells = {};
const splits = {};
let source = null;
const table = meta.brandAlphaTable;
if (table && !activeMeasurementRule(table) && table.flat) {
Object.keys(table.flat).forEach((cell) => {
const value = table.flat[cell];
if (typeof value === 'string' && !value.includes(',') && familyOf(value)) cells[cell] = value;
});
source = 'brand-table';
} else if (meta.brandCupGroupSizes) {
const { cells: groups } = cupGroupCells(meta.brandCupGroupSizes.table);
const canonical = meta.brandCupGroupSizes.canonical || {};
Object.keys(groups).forEach((cell) => { cells[cell] = canonical[groups[cell]] || groups[cell]; });
source = 'cup-group';
}
if (!Object.keys(cells).length && !(meta.listingChart && meta.listingChart.length)) {
const stock = alphaGrid.offeredLabels ? available : null;
const usual = _saMemo(_saUsualCellsMemo, JSON.stringify([offered, stock]), () => {
const consensus = _saLetterConsensus ? _saLetterConsensus.LETTER_CONSENSUS : LETTER_CONSENSUS;
const found = { cells: {}, splits: {} };
Object.keys(consensus).forEach((cell) => {
const m = /^(\d+)([A-Z]+)$/.exec(cell);
const hit = m ? _saLetterConsensusFor(Number(m[1]), m[2], offered, stock) : null;
if (hit) found.cells[cell] = hit.label;
if (hit && hit.split) found.splits[cell] = hit.split.map((s) => s[0]);
});
return found;
});
Object.assign(cells, usual.cells);
Object.assign(splits, usual.splits);
source = 'usual';
}
const pairs = Object.keys(cells).filter((cell) => /^\d+[A-Z]+$/.test(cell));
if (!pairs.length) return null;
const findAvailable = (typeof module !== 'undefined' && module.exports) ? _saSizeAvailabilityLazyModule().findAvailableSize : findAvailableSize;
const split = (cell) => { const m = /^(\d+)([A-Z]+)$/.exec(cell); return { band: Number(m[1]), cup: m[2] }; };
const grid = {
availableBands: [...new Set(pairs.map((cell) => split(cell).band))],
availableCups: [...new Set(pairs.map((cell) => split(cell).cup))],
availablePairs: pairs,
};
const ranked = findAvailable({ band: size.band, cup: size.cup }, grid);
const top = (ranked.candidates && ranked.candidates[0]) || ranked.nearestBeyondReach || null;
if (!top || !cells[top.label]) return null;
const sourceLetter = cells[top.label];
const want = familyOf(sourceLetter);
if (!want) return null;
const order = (_saLetterConsensus ? _saLetterConsensus.LETTER_CONSENSUS_FAMILIES : LETTER_CONSENSUS_FAMILIES)[want.family];
const sold = offered
.map((label) => ({ label, read: familyOf(label) }))
.filter((o) => o.read && o.read.family === want.family)
.map((o) => ({ label: o.label, distance: Math.abs(order.indexOf(o.read.letter) - order.indexOf(want.letter)), index: order.indexOf(o.read.letter) }))
.sort((a, b) => (a.distance - b.distance) || (b.index - a.index));
if (!sold.length) return null;
const pick = sold[0].label;
const sameRun = alphaGrid.offeredLabels ? sold.find((o) => available.includes(o.label)) : null;
const stockedNearest = (alphaGrid.offeredLabels && !available.includes(pick))
? _saClosestInStockPlaced(offered, available, pick, sameRun ? sameRun.label : undefined)
|| (sameRun ? { label: sameRun.label, distance: Math.max(1, sameRun.distance), relation: sameRun.index < sold[0].index ? 'size-down' : 'size-up' } : null)
: null;
let coverage = null;
let closestInStock = null;
if (source === 'brand-table' && alphaGrid.availableLabels) {
const stocked = new Set(available.map((label) => { const r = familyOf(label); return r ? `${r.family}:${r.letter}` : null; }).filter(Boolean));
const stockedPairs = pairs.filter((cell) => { const r = familyOf(cells[cell]); return r && stocked.has(`${r.family}:${r.letter}`); });
if (stockedPairs.length) {
const near = findAvailable({ band: size.band, cup: size.cup }, {
availableBands: [...new Set(stockedPairs.map((cell) => split(cell).band))],
availableCups: [...new Set(stockedPairs.map((cell) => split(cell).cup))],
availablePairs: stockedPairs,
});
const at = (near.candidates && near.candidates[0]) || near.nearestBeyondReach || null;
const letters = _saCupLetters || [];
if (at && cells[at.label] && letters.includes(at.cup) && letters.includes(size.cup)) {
const want = familyOf(cells[at.label]);
const shown = available.find((label) => { const r = familyOf(label); return r && r.family === want.family && r.letter === want.letter; });
const bandDiff = (at.band - size.band) / 2;
const volumeDiff = bandDiff + (letters.indexOf(at.cup) - letters.indexOf(size.cup));
const costOf = (typeof module !== 'undefined' && module.exports) ? _saSizeAvailabilityLazyModule().bandStepCost : bandStepCost;
closestInStock = { label: shown, cell: at.label, band: at.band, cup: at.cup, bandDiff, volumeDiff, inches: costOf(bandDiff, volumeDiff - bandDiff) };
}
}
}
if (source === 'brand-table') {
const cellParts = pairs.map(split);
const cupAt = (cup) => (_saCupLetters ? _saCupLetters.indexOf(cup) : -1);
const cupsSeen = [...new Set(cellParts.map((c) => c.cup))].filter((cup) => cupAt(cup) !== -1).sort((a, b) => cupAt(a) - cupAt(b));
const bandsSeen = [...new Set(cellParts.map((c) => c.band))].sort((a, b) => a - b);
if (cupsSeen.length && bandsSeen.length && cupAt(size.cup) !== -1) {
const cupPast = cupAt(size.cup) < cupAt(cupsSeen[0]) || cupAt(size.cup) > cupAt(cupsSeen[cupsSeen.length - 1]);
const bandPast = size.band < bandsSeen[0] || size.band > bandsSeen[bandsSeen.length - 1];
coverage = {
cups: [cupsSeen[0], cupsSeen[cupsSeen.length - 1]],
bands: [bandsSeen[0], bandsSeen[bandsSeen.length - 1]],
past: cupPast && bandPast ? 'both' : (cupPast ? 'cup' : (bandPast ? 'band' : null)),
...(bandPast ? { bandSide: size.band < bandsSeen[0] ? 'below' : 'above' } : {}),
};
}
}
return {
label: pick,
inStock: available.includes(pick),
...(stockedNearest && stockedNearest.label !== pick ? { closestInStockLabel: stockedNearest.label, closestInStockNamed: stockedNearest } : {}),
coverage,
...(closestInStock && coverage && coverage.past ? { closestInStock } : {}),
sourceLetter,
sourceLetterSold: sold[0].distance === 0,
...(splits[top.label] ? { sourceSplit: splits[top.label] } : {}),
cell: top.label,
relation: ranked.candidates && ranked.candidates[0] ? ranked.candidates[0].relation : 'beyond-reach',
source,
};
}
const LISTING_LETTERING_CAPPED_RATINGS = _saK.RATING_LADDER.slice(0, 3);
function withListingCupLetters(result, lettering) {
if (!result || !lettering || result.band == null) return result;
const facts = { reading: lettering.reading, decidedBy: lettering.decidedBy, pastDD: (lettering.pastDD || []).slice() };
const added = (lettering.decidedBy === 'brand' && Array.isArray(lettering.added)) ? lettering.added : null;
if (added) {
facts.added = added.map((a) => ({ printed: a.printed, ours: a.ours }));
facts.brandName = lettering.brandName || null;
}
const readThroughAdded = !!(added && added.some((a) => a.ours === result.cup));
if (added) facts.readThroughAdded = readThroughAdded;
const capped = (lettering.decidedBy === 'evidence' || readThroughAdded) && LISTING_LETTERING_CAPPED_RATINGS.includes(result.confidence);
return {
...result,
...(capped ? { confidence: 'Uncertain, check size chart' } : {}),
confidenceFactors: { ...(result.confidenceFactors || {}), listingCupLetters: facts },
};
}
function getAdjustedSize(baseSize, styleKey, styleModifiers, detectionMeta) {
const result = adjustedSizeFor(baseSize, styleKey, styleModifiers, detectionMeta);
const rule = styleKey ? styleModifiers[styleKey] : null;
if (!rule || !rule.usesOwnSizingTable) return result;
return withHeadlineStyleNote(result, headlineStyleNoteFor(detectionMeta && detectionMeta.styleAttributes, styleModifiers, styleKey));
}
function adjustedSizeFor(baseSize, styleKey, styleModifiers, detectionMeta) {
const rule = styleKey ? styleModifiers[styleKey] : null;
const source = (detectionMeta && detectionMeta.source) || 'heuristic';
const ambiguous = !!(detectionMeta && detectionMeta.ambiguous);
const cupInstructions = (detectionMeta && detectionMeta.fullText) ? _saParseCupInstructions(detectionMeta.fullText) : null;
const fitInstructions = (detectionMeta && detectionMeta.fullText)
? _saParseFitInstructions(detectionMeta.fullText, cupInstructions && cupInstructions.cupAdjustment ? [cupInstructions.cupAdjustment.matchedText] : [])
: null;
const fitInstructionNote = composeFitInstructionNote(fitInstructions, cupInstructions);
const bandAdjustment = fitInstructions && fitInstructions.bandAdjustment;
const cupAdjustment = cupInstructions && cupInstructions.cupAdjustment;
const attributeNote = composeStyleAttributeNote(
detectionMeta && detectionMeta.styleAttributes,
styleModifiers,
!!rule
);
if (baseSize && baseSize.beyondBandLadder) {
const belowLadder = baseSize.trueBand < baseSize.band;
const why = belowLadder
? `Your underbust puts your band at ${baseSize.trueBand}, which is below the smallest band this app can currently size. Your band is at most a ${baseSize.band}, and because we had to bring the band up to fit our range, the cup we calculated for you is not one we can stand behind, so we are not showing it. A fitter, or a brand that specialises in this range, will get you closer than we can.`
: `Your underbust measures ${baseSize.trueBand}", which is past the largest band this app can currently size. Your band is at least a ${baseSize.band}, and because we had to bring the band down to fit our range, the cup we calculated for you is larger than your real one, so we are not showing it. A fitter, or a brand that specialises in this range, will get you closer than we can.`;
return {
label: belowLadder ? `≤${baseSize.band}` : `${baseSize.band}+`,
band: baseSize.band,
cup: baseSize.cup,
beyondBandLadder: true,
trueBand: baseSize.trueBand,
explanation: `${why}${fitInstructionNote}`,
confidence: 'Beyond supported sizes',
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: false, styleKey, shiftMagnitude: 0,
matchDetail: {
type: 'beyondBandLadder',
floorBand: baseSize.band,
trueBand: baseSize.trueBand,
why,
},
},
fitInstructionNote: fitInstructionNote.trim() || null,
};
}
if (baseSize && baseSize.beyondLadder) {
const why = `Your measurements put you past the largest cup this app can currently size, so we can't give you an exact answer here. Your band is ${baseSize.band}, and your cup is at least a ${baseSize.cup}. A fitter, or a brand that specialises in this range, will get you closer than we can.`;
return {
label: `${baseSize.label}+`,
band: baseSize.band,
cup: baseSize.cup,
beyondLadder: true,
trueDifference: baseSize.trueDifference,
explanation: `${why}${fitInstructionNote}`,
confidence: 'Beyond supported sizes',
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: false, styleKey, shiftMagnitude: 0,
matchDetail: {
type: 'beyondLadder',
band: baseSize.band,
floorCup: baseSize.cup,
trueDifference: baseSize.trueDifference,
why,
},
},
fitInstructionNote: fitInstructionNote.trim() || null,
};
}
if (rule && rule.outOfScope) {
const ownLabel = (baseSize.bandClamped && baseSize.honestLabel) ? baseSize.honestLabel : baseSize.label;
return {
label: ownLabel,
band: null,
cup: null,
explanation: `${rule.note} Your calculated size is ${ownLabel}, which is worth knowing, but check this retailer's own guide for how this particular product is sized.${fitInstructionNote}`,
confidence: 'Not sized like a bra',
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: false, styleKey, shiftMagnitude: 0,
matchDetail: { type: 'outOfScope', styleKey, baseLabel: ownLabel, note: rule.note },
},
outOfScope: true,
fitInstructionNote: fitInstructionNote.trim() || null,
};
}
const clampedPastLetterChart = !!(baseSize && baseSize.bandClamped && !_saLetterChartReaches(baseSize, rule, detectionMeta));
const honestLetterSize = clampedPastLetterChart
? _saHonestLetterSize(baseSize, rule, detectionMeta)
: null;
if (honestLetterSize) {
const own = adjustedSizeFor(honestLetterSize, styleKey, styleModifiers, detectionMeta);
return { ...own, ownLetterBase: own.ownLetterBase || honestLetterSize };
}
if (clampedPastLetterChart) {
const brandName = (detectionMeta && detectionMeta.brandDisplayName) || 'this brand';
const over = baseSize.bandClamped === 'above';
const direction = over ? 'larger than' : 'smaller than';
const edge = over ? 'largest' : 'smallest';
const why = `Your band is ${direction} anything ${brandName} makes. Their ${edge} band is ${baseSize.brandBandLimit}, and your measurements put you at a ${baseSize.honestBand}, so your size is ${baseSize.honestLabel}. That is worth knowing anywhere else; it just isn't a size this brand carries.`;
return {
label: baseSize.honestLabel,
band: baseSize.honestBand,
cup: baseSize.honestCup,
bandClamped: baseSize.bandClamped,
brandBandLimit: baseSize.brandBandLimit,
explanation: `${why}${fitInstructionNote}`,
confidence: "Outside this brand's range",
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: false, styleKey, shiftMagnitude: 0,
matchDetail: {
type: 'bandClamped',
direction: baseSize.bandClamped,
brandBandLimit: baseSize.brandBandLimit,
honestBand: baseSize.honestBand,
honestCup: baseSize.honestCup,
why,
},
},
fitInstructionNote: fitInstructionNote.trim() || null,
};
}
if (!rule) {
const claimed = listingClaimSize(baseSize, bandAdjustment, cupAdjustment, 0);
const bandNote = bandAdjustment ? bandClaimNote(bandAdjustment, claimed.bandApplied) : '';
const claimApplied = claimed.bandApplied || claimed.cupClaimApplied;
return {
label: claimed.label,
band: claimed.band,
cup: claimed.cup,
explanation: "We couldn't identify a specific cut for this product, so this is your calculated size with no style-specific adjustment. It's still a solid starting point, but padding, cut, or construction details for this particular style may shift the ideal fit."
+ bandNote + fitInstructionNote,
confidence: 'No style detected',
confidenceFactors: claimApplied ? {
source, ambiguous, usesOwnSizingTable: false, styleKey: null, shiftMagnitude: Math.abs(claimed.cupSteps),
matchDetail: {
type: 'cupShift',
styleKey: null,
shiftDirection: Math.sign(claimed.cupSteps),
shiftMagnitude: Math.abs(claimed.cupSteps),
styleNote: null,
label: claimed.label,
baseLabel: baseSize.label,
verifiedFormula: null,
usedProductClaim: claimed.cupClaimApplied,
bandAdjustmentApplied: claimed.bandApplied,
bandAdjustmentSteps: claimed.bandApplied ? claimed.bandSteps : 0,
cupAdjustmentApplied: claimed.cupClaimApplied,
},
} : null,
fitInstructionNote: fitInstructionNote.trim() || null,
styleAttributeNote: attributeNote || null,
};
}
if (rule.usesOwnSizingTable) {
if (rule.answersFromListingBrandSizeChart) {
return listingBrandSizeResult(baseSize, rule, styleKey, ambiguous, source, detectionMeta, fitInstructionNote, attributeNote);
}
const listingBuckets = detectionMeta && detectionMeta.listingChart;
let failedListingChartQuality = null;
if (listingBuckets && listingBuckets.length) {
const chartMeasurements = chartMeasurementsFor(baseSize, detectionMeta);
const matchResult = _saMatchMeasurementsToChart(chartMeasurements, listingBuckets);
const soldAsOneOption = Array.isArray(detectionMeta.listingLetters)
&& detectionMeta.listingLetters.map(String).includes(String(matchResult.bucket && matchResult.bucket.label));
if (matchResult.matched && String(matchResult.bucket.label || '').includes('/') && !soldAsOneOption) {
return unresolvedAlphaSizeResult(
baseSize, rule, styleKey,
"This retailer's own chart lists a combined range for your size rather than one clear letter.",
fitInstructionNote,
{ failedTable: "this listing's own chart", failureKind: 'compound cell', compoundRow: matchResult.bucket.label },
_saChartQualityFor(matchResult),
null
);
}
if (matchResult.matched) {
const boundaryAlternate = _saBoundaryAlternate(chartMeasurements, listingBuckets, matchResult);
const { confidence: chartConfidence, chartQuality, score: chartScore } = _saGetChartConfidence(matchResult, 'clean');
const label = matchResult.bucket.label;
const chartBands = listingBuckets.flatMap((b) => (Array.isArray(b.pairs) ? b.pairs : []))
.map((p) => /^(\d+)/.exec(String(p))).filter(Boolean).map((m) => Number(m[1]));
const pastChartEdge = (matchResult.pairMatchType === 'sister' && chartBands.length
&& (chartMeasurements.band < Math.min(...chartBands) || chartMeasurements.band > Math.max(...chartBands)))
? { direction: chartMeasurements.band < Math.min(...chartBands) ? 'smaller' : 'larger' }
: null;
if (pastChartEdge && !(_saLetterConsensus ? _saLetterConsensus.letterWithinReason : letterWithinReason)(label, { band: chartMeasurements.band, cup: chartMeasurements.cup })) {
return unresolvedAlphaSizeResult(
baseSize, rule, styleKey,
"This listing's own size chart starts past your band, and its nearest size isn't within reason for your measurements, so no letter is recommended.",
fitInstructionNote,
{ failedTable: "this listing's own chart", failureKind: 'band outside chart' },
_saChartQualityFor(matchResult),
null
);
}
const confidence = pastChartEdge && ['Great match', 'Good match', 'Likely fits'].includes(chartConfidence)
? 'Uncertain, check size chart' : chartConfidence;
const baseLabelForChart = baseSize.bandClamped ? baseSize.honestLabel : baseSize.label;
let explanation = `${rule.note} Your base size (${baseLabelForChart}) matches this listing's own size chart as a ${label}.`;
if (matchResult.pairMatchType === 'sister') {
explanation += " (Based on a true sister size of your calculated size, since your exact size isn't one of this chart's listed combinations.)";
}
if (matchResult.ambiguous) explanation += ` ${matchResult.note}`;
explanation += fitInstructionNote;
return {
label,
band: null,
cup: null,
explanation,
confidence,
chartQuality,
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: true, styleKey, shiftMagnitude: 1,
matchDetail: {
type: 'chartMatch',
matchType: matchResult.matchType,
pairMatchType: matchResult.pairMatchType,
dimensionPositions: matchResult.dimensionPositions,
chartScore,
ambiguousChart: matchResult.ambiguous,
nearestMatch: !!matchResult.nearestMatch,
...(matchResult.nearestMatch ? { nearestMisses: matchResult.nearestMisses || [] } : {}),
boundaryAlternate,
...(matchResult.tiedWith ? { tiedWith: matchResult.tiedWith } : {}),
...(Object.values(matchResult.rangeWidths || {}).some((w) => w >= _saK.WIDE_RANGE_INCHES) ? { wideRange: true } : {}),
bucketLabel: label,
baseBand: chartMeasurements.band,
baseCup: chartMeasurements.cup,
...(pastChartEdge ? { pastChartEdge } : {}),
},
},
alphaSequence: listingBuckets.map((b) => b.label),
fitInstructionNote: fitInstructionNote.trim() || null,
styleAttributeNote: attributeNote || null,
};
}
if (matchResult.outsideChart) {
return listingChartOutsideResult(baseSize, styleKey, source, ambiguous, matchResult.outsideChart, detectionMeta, fitInstructionNote);
}
failedListingChartQuality = _saChartQualityFor(matchResult);
}
const liveChart = detectionMeta && detectionMeta.sizeChart && detectionMeta.sizeChart.chart;
const brandTable = (detectionMeta && detectionMeta.brandAlphaTable) || null;
const table = liveChart || brandTable;
const fromPublishedTable = !liveChart;
const cupGroupListing = (!liveChart && detectionMeta && detectionMeta.brandCupGroupSizes) || null;
const cupGroupHit = (cupGroupListing && !_saBrandLetterTableAnswers(baseSize, rule, brandTable, detectionMeta && detectionMeta.rawMeasurements))
? lookupCupGroupSize(baseSize.band, baseSize.cup, cupGroupListing)
: null;
if (cupGroupHit) {
const label = cupGroupHit.label;
return {
label,
band: null,
cup: null,
explanation: `${rule.note} Your base size (${baseSize.label}) is a ${cupGroupHit.printedLabel} on this retailer's own conversion from band and cup sizes to the letter sizes this listing sells. ${cupGroupListing.onListingPage ? "This comes from this retailer's own size conversion tool, the one on this listing's page." : "This comes from this retailer's own published sizing rather than from this listing's page."}${fitInstructionNote}`,
confidence: 'Likely fits',
detailQuality: detailQualityFor(ambiguous, source),
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: true, styleKey, shiftMagnitude: 1,
matchDetail: {
type: 'staticTable',
styleKey,
bucketLabel: label,
fromPublishedTable: true,
cupGroupSize: { cell: cupGroupHit.cell, printedLabel: cupGroupHit.printedLabel, ...(cupGroupListing.onListingPage ? { onListingPage: true } : {}) },
},
},
alphaSequence: Object.keys(cupGroupListing.table.sizes).filter((l) => !l.startsWith('_'))
.map((l) => (cupGroupListing.canonical || {})[l] || l),
fitInstructionNote: fitInstructionNote.trim() || null,
styleAttributeNote: attributeNote || null,
};
}
if (!table) {
const usual = (!(listingBuckets && listingBuckets.length) && !cupGroupListing)
? usualLetterFor(baseSize, detectionMeta)
: null;
if (usual) {
const key = usual.keySize;
const sameSize = key.label === baseSize.label && !baseSize.pastClamp;
const result = letterConsensusResult(key, rule, styleKey, source, ambiguous, usual, detectionMeta, fitInstructionNote, attributeNote);
return (key.label === baseSize.label) ? result : { ...result, ownLetterBase: key };
}
return unresolvedAlphaSizeResult(
baseSize, rule, styleKey,
"We don't have a verified letter-size conversion for this retailer yet, and this listing's own size chart couldn't be read, so this is your calculated band and cup size instead.",
fitInstructionNote,
{ failedTable: 'no verified table for this retailer', failureKind: 'no verified conversion' },
failedListingChartQuality
);
}
const cupVerified = !!table.reverseProjectionVerifiedCups
&& Array.isArray(table.reverseProjectionVerifiedCups)
&& table.reverseProjectionVerifiedCups.includes(baseSize.cup);
const measurementRule = fromPublishedTable ? activeMeasurementRule(table) : null;
const measured = measurementRule
? lookupMeasurementAlphaRule(detectionMeta && detectionMeta.rawMeasurements, measurementRule)
: null;
const underbustRefusal = (measurementRule && Array.isArray(measurementRule.underbust_rows) && !measured)
? readUnderbustLetterRows(detectionMeta && detectionMeta.rawMeasurements, measurementRule)
: null;
if (underbustRefusal && underbustRefusal.refused) {
return underbustChartGapResult(baseSize, styleKey, source, ambiguous, underbustRefusal, detectionMeta, fitInstructionNote);
}
const openedByItsLetterListings = fromPublishedTable && openedByLetterListings(table);
if (rule.publishedTableOnlyForVerifiedCups && fromPublishedTable && !cupVerified && !measurementRule && !openedByItsLetterListings) {
return unresolvedAlphaSizeResult(
baseSize, rule, styleKey,
"This listing's own size chart couldn't be read, and this retailer's letter-size chart hasn't been verified for band-and-cup bras in your cup.",
fitInstructionNote,
{ failedTable: "this retailer's published chart", failureKind: 'cup not verified for band/cup bras' },
failedListingChartQuality
);
}
const { label: rawLabel, clampedBand, malformed } = measurementRule
? { label: measured ? measured.label : null, clampedBand: null, malformed: false }
: lookupFlatSizeTable(baseSize.band, baseSize.cup, table);
const twoSizes = (malformed && fromPublishedTable)
? _saTwoSizeCell(table.flat[`${clampedBand || baseSize.band}${baseSize.cup}`], detectionMeta)
: null;
const edgeSize = (clampedBand && fromPublishedTable && !measurementRule && Math.abs(baseSize.band - clampedBand) === 2)
? _saChartEdgeSize(table, baseSize, clampedBand, detectionMeta)
: null;
if (malformed && !twoSizes && !edgeSize) {
return unresolvedAlphaSizeResult(
baseSize, rule, styleKey,
fromPublishedTable
? "This listing's own size chart couldn't be read, and this retailer's published chart lists a combined range for your size rather than one clear letter."
: "This retailer's own chart lists a combined range for your size rather than one clear letter.",
fitInstructionNote,
{ failedTable: fromPublishedTable ? "this retailer's published chart" : "this retailer's own chart", failureKind: 'compound cell' },
failedListingChartQuality
);
}
if (clampedBand && fromPublishedTable && !measurementRule && !edgeSize) {
return unresolvedAlphaSizeResult(
baseSize, rule, styleKey,
`This brand's own letter-size chart covers bands ${table.bandRange[0]} to ${table.bandRange[1]}, and your band, ${baseSize.band}, is outside it, so no letter is recommended.`,
fitInstructionNote,
{ failedTable: "this brand's own letter-size chart", failureKind: 'band outside chart' },
failedListingChartQuality
);
}
if (!rawLabel && !twoSizes && !edgeSize) {
return unresolvedAlphaSizeResult(
baseSize, rule, styleKey,
fromPublishedTable
? "This listing's own size chart couldn't be read, and this retailer's published chart doesn't cover your size."
: "This retailer's sizing information doesn't cover your size.",
fitInstructionNote,
{ failedTable: fromPublishedTable ? "this retailer's published chart" : "this retailer's own chart", failureKind: 'size not listed' },
failedListingChartQuality
);
}
const label = edgeSize ? edgeSize.label : (twoSizes ? twoSizes.label : rawLabel);
let explanation;
if (measured && measured.underbustRow) {
explanation = `${rule.note} Your underbust, ${Math.round(measured.underbust * 100) / 100}", is in the ${measured.underbustRow.min}-${measured.underbustRow.max}" row of this retailer's own size chart, which it sells as ${label}.`;
} else if (measured && measured.gridCell) {
const g = measured.gridCell;
const unit = g.unit === 'cm' ? ' cm' : '"';
explanation = `${rule.note} Your underbust and bust fall in the ${g.underbust.min}-${g.underbust.max}${unit} underbust row and the ${g.bust.min}-${g.bust.max}${unit} bust column of this retailer's own size chart, which it sells as ${label}.`;
} else if (measured) {
explanation = `${rule.note} Your measurements are a ${measured.brandSize} on this retailer's own size calculator, which its size chart sells as ${label}.`;
} else {
explanation = `${rule.note} Your base size (${baseSize.label}) maps to a ${label}.`;
}
if (clampedBand) {
explanation += ` (Based on the closest documented band, ${clampedBand}, since ${baseSize.band} isn't in this retailer's chart.)`;
}
if (fromPublishedTable) {
explanation += ' This comes from this retailer\'s own published size chart rather than from this listing\'s page.';
}
explanation += fitInstructionNote;
const calculatorLetterTier = brandCalculatorLetterConfidence(styleKey, rule, ambiguous, source, measurementRule, measured);
return {
label,
band: null,
cup: null,
explanation,
confidence: calculatorLetterTier || ((twoSizes || edgeSize) ? 'Uncertain, check size chart'
: (fromPublishedTable ? 'Likely fits' : _saWeakerRating(getConfidence(styleKey, ambiguous, source), detectionMeta.sizeChart.confidence))),
detailQuality: detailQualityFor(ambiguous, source),
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: true, styleKey, shiftMagnitude: 1,
matchDetail: {
type: 'staticTable',
styleKey,
bucketLabel: label,
fromPublishedTable,
...(twoSizes ? { twoSizes: { sizes: twoSizes.sizes, pick: twoSizes.pick, stockRead: twoSizes.stockRead, brandDisplayName: (detectionMeta && detectionMeta.brandDisplayName) || null } } : {}),
...(edgeSize ? { pastChartEdge: { direction: edgeSize.direction, cell: edgeSize.cell } } : {}),
...(calculatorLetterTier ? {
brandCalculator: {
brandDisplayName: (detectionMeta && detectionMeta.brandDisplayName) || null,
brandSize: measured.brandSize,
},
} : {}),
...(measured && measured.gridCell ? {
gridCell: {
brandDisplayName: (detectionMeta && detectionMeta.brandDisplayName) || null,
underbust: Math.round(measured.underbust * 100) / 100,
bust: Math.round(measured.bust * 100) / 100,
unit: measured.gridCell.unit,
underbustRange: { min: measured.gridCell.underbust.min, max: measured.gridCell.underbust.max, inRange: measured.gridCell.underbust.inRange },
bustRange: { min: measured.gridCell.bust.min, max: measured.gridCell.bust.max, inRange: measured.gridCell.bust.inRange },
},
} : {}),
...(measured && measured.underbustRow ? {
underbustRow: {
brandDisplayName: (detectionMeta && detectionMeta.brandDisplayName) || null,
underbust: Math.round(measured.underbust * 100) / 100,
min: measured.underbustRow.min,
max: measured.underbustRow.max,
},
} : {}),
},
},
alphaSequence: measurementRule
? (Array.isArray(measurementRule.underbust_rows)
? measurementRule.underbust_rows.map((r) => r.label)
: measurementRule.grid
? [...new Set((measurementRule.grid.cells || []).flat().filter(Boolean))]
: Object.values(measurementRule.letter_by_band || {}))
: Object.values(table.flat || {}).filter((v) => v && !v.includes(',')),
fitInstructionNote: fitInstructionNote.trim() || null,
styleAttributeNote: attributeNote || null,
};
}
const claimed = listingClaimSize(baseSize, bandAdjustment, cupAdjustment, rule.cupShift);
const band = claimed.band;
const shiftedCup = claimed.cup;
const effectiveCupShift = claimed.cupSteps;
const magnitudeNote = claimed.cupClaimApplied
? ` This listing's own description says "${cupAdjustment.matchedText}," so that specific cup claim was applied.`
: '';
const bandNote = bandAdjustment ? bandClaimNote(bandAdjustment, claimed.bandApplied) : '';
const label = claimed.label;
const explanation = (shiftedCup === baseSize.cup && band === baseSize.band
? rule.note
: `${rule.note} Adjusted from your base ${baseSize.label} to a ${label} for this style.`) + magnitudeNote + bandNote + fitInstructionNote;
const listingClaimApplied = claimed.bandApplied || claimed.cupClaimApplied;
const verifiedFormulaTier = verifiedFormulaConfidence(styleKey, rule, ambiguous, source, detectionMeta, listingClaimApplied);
const confidence = verifiedFormulaTier || getConfidence(styleKey, ambiguous, source);
return {
label,
band,
cup: shiftedCup,
explanation,
confidence,
detailQuality: detailQualityFor(ambiguous, source),
confidenceFactors: {
source, ambiguous, usesOwnSizingTable: false, styleKey, shiftMagnitude: Math.abs(effectiveCupShift || 0),
matchDetail: {
type: 'cupShift',
styleKey,
shiftDirection: Math.sign(effectiveCupShift || 0),
shiftMagnitude: Math.abs(effectiveCupShift || 0),
styleNote: rule.note || null,
label,
baseLabel: baseSize.label,
verifiedFormula: verifiedFormulaTier
? { brandDisplayName: (detectionMeta && detectionMeta.brandDisplayName) || null }
: null,
usedProductClaim: !!magnitudeNote,
bandAdjustmentApplied: claimed.bandApplied,
bandAdjustmentSteps: claimed.bandApplied ? claimed.bandSteps : 0,
cupAdjustmentApplied: claimed.cupClaimApplied,
},
},
fitInstructionNote: fitInstructionNote.trim() || null,
styleAttributeNote: attributeNote || null,
};
}
function hasNoResolvableAlphaSize(adjusted) {
return !!adjusted && adjusted.unresolvedAlphaSize === true;
}
let _saSizeAvailabilityLazy = null;
const _saSizeAvailabilityLazyModule = () => (_saSizeAvailabilityLazy || (_saSizeAvailabilityLazy = require('./sizeAvailability')));
if (typeof module !== 'undefined' && module.exports) {
module.exports = { getAdjustedSize, resolveListingBrandSize, normalizeCupToBand, lookupFlatSizeTable, projectVerifiedAlphaLabel, activeMeasurementRule, openedByLetterListings, cupGroupCells, lookupCupGroupSize, listingSellsCupGroupSizes, cupGroupSizesForListing, lookupMeasurementAlphaRule, readUnderbustLetterRows, readMeasurementGrid, MEASUREMENT_INPUT_STEP_INCHES, measurementRuleFingerprint, sizeCalculatorExhaustivelyVerified, getConfidence, verifiedFormulaConfidence, brandCalculatorLetterConfidence, detailQualityFor, applyCupShift, applyBandShift, composeFitInstructionNote, composeStyleAttributeNote, hasNoResolvableAlphaSize, withListingCupLetters, closestLetterBeyondSources, listedSizeResult, cupGroupListedSizes };
}
/* src/cupLadder.js */
const _clFitEngine = (typeof module !== 'undefined' && module.exports) ? require('./fitEngine') : null;
const _clCupLetters = _clFitEngine ? _clFitEngine.CUP_LETTERS : CUP_LETTERS;
const LADDER_STANDARD = 'standard';
const LADDER_VOCABULARY = 'vocabulary';
const LADDER_ZERO_OFFSET = 'zero_offset';
const CUP_VOCABULARIES = {
uk: {
theirs: ['B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J', 'JJ', 'K'],
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
},
us_f_for_ddd: {
theirs: ['B', 'C', 'D', 'DD', 'F', 'G'],
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G'],
},
us_f_for_ddd_aa_through_h: {
theirs: ['AA', 'A', 'B', 'C', 'D', 'DD', 'F', 'G', 'H'],
ours: ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
},
us_f_for_ddd_a_through_k: {
theirs: ['A', 'B', 'C', 'D', 'DD', 'F', 'G', 'H', 'I', 'J', 'K'],
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K'],
},
e_f_for_dd_ddd: {
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
},
dual_label: {
theirs: ['A', 'B', 'C', 'D', 'DD/E', 'DDD/F', 'G', 'H'],
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
},
f_between_ddd_and_g: {
theirs: ['B', 'C', 'D', 'DD', 'DDD', 'F', 'G', 'H'],
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I'],
},
f_between_ddd_and_g_through_k: {
theirs: ['B', 'C', 'D', 'DD', 'DDD', 'F', 'G', 'H', 'I', 'J', 'K'],
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L'],
},
uk_through_f: {
theirs: ['A', 'B', 'C', 'D', 'DD', 'E', 'F'],
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G'],
},
};
function resolveCupLadder(brandEntry) {
const declared = brandEntry && brandEntry.cup_ladder;
if (!declared || !declared.kind || declared.kind === LADDER_STANDARD) {
return { kind: LADDER_STANDARD };
}
if (declared.kind === LADDER_VOCABULARY && CUP_VOCABULARIES[declared.system]) {
return { kind: LADDER_VOCABULARY, system: declared.system };
}
if (declared.kind === LADDER_ZERO_OFFSET && typeof declared.offset_letters === 'number') {
return { kind: LADDER_ZERO_OFFSET, offsetLetters: declared.offset_letters };
}
return { kind: LADDER_STANDARD, malformed: true };
}
function _clResult(index) {
if (index < 0) return { cup: null, outOfRange: 'below' };
if (index > _clCupLetters.length - 1) {
return { cup: null, outOfRange: 'beyond', standardIndex: index };
}
return { cup: _clCupLetters[index], standardIndex: index };
}
function toStandardCup(brandCup, ladder) {
if (!brandCup) return { cup: null, unknown: true };
const spec = ladder || { kind: LADDER_STANDARD };
if (spec.kind === LADDER_VOCABULARY) {
const vocab = CUP_VOCABULARIES[spec.system];
const at = vocab.theirs.indexOf(brandCup);
if (at === -1) return { cup: null, unknown: true };
const ourLetter = vocab.ours[at];
const index = _clCupLetters.indexOf(ourLetter);
if (index === -1) return { cup: null, outOfRange: 'beyond', beyondAs: ourLetter };
return { cup: ourLetter, standardIndex: index };
}
if (spec.kind === LADDER_ZERO_OFFSET) {
const at = _clCupLetters.indexOf(brandCup);
if (at === -1) return { cup: null, unknown: true };
return _clResult(at + spec.offsetLetters);
}
const at = _clCupLetters.indexOf(brandCup);
if (at === -1) return { cup: null, unknown: true };
return { cup: brandCup, standardIndex: at };
}
function toBrandCup(standardCup, ladder) {
if (!standardCup) return { cup: null, unknown: true };
const spec = ladder || { kind: LADDER_STANDARD };
if (spec.kind === LADDER_VOCABULARY) {
const vocab = CUP_VOCABULARIES[spec.system];
const at = vocab.ours.indexOf(standardCup);
if (at === -1) return { cup: null, unknown: true };
return { cup: vocab.theirs[at] };
}
if (spec.kind === LADDER_ZERO_OFFSET) {
const at = _clCupLetters.indexOf(standardCup);
if (at === -1) return { cup: null, unknown: true };
const shifted = at - spec.offsetLetters;
if (shifted < 0) return { cup: null, outOfRange: 'below' };
if (shifted > _clCupLetters.length - 1) return { cup: null, outOfRange: 'beyond' };
return { cup: _clCupLetters[shifted] };
}
const at = _clCupLetters.indexOf(standardCup);
if (at === -1) return { cup: null, unknown: true };
return { cup: standardCup };
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
LADDER_STANDARD,
LADDER_VOCABULARY,
LADDER_ZERO_OFFSET,
CUP_VOCABULARIES,
resolveCupLadder,
toStandardCup,
toBrandCup,
};
}
/* src/brandFormula.js */
const _bfFitEngine = (typeof module !== 'undefined' && module.exports) ? require('./fitEngine') : null;
const _bfValidBands = _bfFitEngine ? _bfFitEngine.VALID_BANDS : VALID_BANDS;
const _bfRawBandSize = _bfFitEngine ? _bfFitEngine.rawBandSize : rawBandSize;
const _bfCalculateCupSize = _bfFitEngine ? _bfFitEngine.calculateCupSize : calculateCupSize;
const _bfCalculateSize = _bfFitEngine ? _bfFitEngine.calculateSize : calculateSize;
const _BF_METHOD_KEYS = ['from_bras_size_chart', 'from_band_range_chart', 'cup_from_underbust', 'cup_from_cup_chart', 'cup_from_raw_band', 'from_size_calculator'];
function _bfDeclares(bandFormula, key) {
const value = bandFormula[key];
if (value === undefined || typeof value === 'boolean') return value === true;
throw new Error(`band_formula declares ${key} as ${JSON.stringify(value)}, which is neither true nor false; a declaration spelled any other way would switch its reader off without a word`);
}
function clampBandToRange(rawBand, bandRange) {
if (!Array.isArray(bandRange) || bandRange.length < 2) return _bfValidBands.reduce((closest, c) =>
Math.abs(c - rawBand) < Math.abs(closest - rawBand) ? c : closest
);
const [min, max] = bandRange;
const inRange = _bfValidBands.filter((b) => b >= min && b <= max);
const candidates = inRange.length ? inRange : _bfValidBands;
return candidates.reduce((closest, c) =>
Math.abs(c - rawBand) < Math.abs(closest - rawBand) ? c : closest
);
}
function _bfBandIsMeasured(bandFormula) {
if (_bfMethodRecordOnly(bandFormula)) return true;
const recordOnly = _bfDeclares(bandFormula, 'band_rule_record_only');
const ownBandOrCup = ['from_band_range_chart', 'cup_from_underbust', 'cup_from_cup_chart', 'cup_from_raw_band']
.some((key) => _bfDeclares(bandFormula, key));
const ownSize = ['from_bras_size_chart', 'from_size_calculator'].some((key) => _bfDeclares(bandFormula, key));
const hasParityOffset = bandFormula.even_underbust_offset !== undefined || bandFormula.odd_underbust_offset !== undefined;
const hasFlatOffset = bandFormula.underbust_offset !== undefined;
if (recordOnly) {
if (ownBandOrCup || ownSize) {
throw new Error('band_formula declares band_rule_record_only beside a band or cup declaration; a record-only band rule sizes nobody, so nothing else on it can size either');
}
if (!hasParityOffset && !hasFlatOffset) {
throw new Error('band_formula declares band_rule_record_only, but records no band offset; there is no band rule to keep on record');
}
return true;
}
return !ownBandOrCup && !hasParityOffset && (!hasFlatOffset || bandFormula.underbust_offset === 0);
}
function _bfMethodRecordOnly(bandFormula) {
if (!_bfDeclares(bandFormula, 'method_record_only')) return false;
const declared = (key) => _bfDeclares(bandFormula, key);
const wholeSize = ['from_bras_size_chart', 'from_size_calculator'].filter(declared);
const band = ['from_band_range_chart'].filter(declared);
const cup = ['cup_from_underbust', 'cup_from_cup_chart', 'cup_from_raw_band'].filter(declared);
if (!wholeSize.length && !band.length && !cup.length) {
throw new Error('band_formula declares method_record_only, but declares no band or cup method; there is no method to keep on record');
}
if (declared('band_rule_record_only')) {
throw new Error('band_formula declares method_record_only beside band_rule_record_only; one entry keeps one kind of record');
}
if (wholeSize.length > 1 || (wholeSize.length && (band.length || cup.length)) || cup.length > 1) {
throw new Error(`band_formula declares method_record_only over ${[...wholeSize, ...band, ...cup].join(', ')}, a combination no reader accepts; the record would not be one the brand's method could be`);
}
return true;
}
function _bfMeasuredBrandSize(underbustInches, bustInches, brandEntry) {
const measured = _bfCalculateSize(underbustInches, bustInches);
const raw = _bfRawBandSize(underbustInches);
const band = clampBandToRange(raw, brandEntry.band_range);
if (band === measured.band) return measured;
const size = { band, cup: _bfCalculateCupSize(bustInches, band), label: '' };
size.label = `${band}${size.cup}`;
if (measured.beyondLadder) {
size.beyondLadder = true;
size.trueDifference = measured.trueDifference;
}
const range = brandEntry.band_range;
size.bandClamped = band < measured.band ? 'above' : 'below';
size.brandBandLimit = Array.isArray(range) && range.length >= 2
? (size.bandClamped === 'above' ? range[1] : range[0])
: null;
const honest = measured.belowBandFloor || measured;
size.honestBand = honest.band;
size.honestCup = honest.cup;
size.honestLabel = honest.label;
if (measured.beyondBandLadder) {
size.beyondBandLadder = true;
size.trueBand = measured.trueBand;
}
return size;
}
function calculateBrandSize(underbustInches, bustInches, brandEntry) {
const formula = brandEntry.band_formula;
const declared = _BF_METHOD_KEYS.filter((key) => _bfDeclares(formula, key));
if (declared.length && !_bfMethodRecordOnly(formula)) {
throw new Error(`band_formula declares ${declared.join(', ')} without method_record_only; a brand's own method sizes nobody until a phase brings it back with fit evidence (RULEBOOK.md)`);
}
if (!_bfBandIsMeasured(formula)) {
throw new Error('band_formula declares a band offset that is not kept on record only (band_rule_record_only); a brand\'s own band rule sizes nobody until a phase brings it back with fit evidence (RULEBOOK.md)');
}
return _bfMeasuredBrandSize(underbustInches, bustInches, brandEntry);
}
function hasVerifiedBandFormula(brandEntry) {
const formula = brandEntry && brandEntry.band_formula;
if (!formula || formula.published === false) return false;
const hasOffset = formula.underbust_offset !== undefined
|| formula.even_underbust_offset !== undefined
|| formula.odd_underbust_offset !== undefined;
return hasOffset && brandEntry.formula_verified_live === true;
}
function hasRecordOnlyBandRule(brandEntry) {
const formula = brandEntry && brandEntry.band_formula;
return !!formula && _bfDeclares(formula, 'band_rule_record_only');
}
function hasRecordOnlyMethod(brandEntry) {
const formula = brandEntry && brandEntry.band_formula;
return !!formula && _bfMethodRecordOnly(formula);
}
function hasWholeInchOnlyVerification(brandEntry) {
const formula = brandEntry && brandEntry.band_formula;
if (!formula || !_bfDeclares(formula, 'verified_whole_inch_only')) return false;
if (!hasVerifiedBandFormula(brandEntry)) {
throw new Error('band_formula declares verified_whole_inch_only on a rule hasVerifiedBandFormula() does not pass; there is no verified tier for it to limit');
}
return true;
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
calculateBrandSize,
clampBandToRange,
hasVerifiedBandFormula,
hasRecordOnlyBandRule,
hasWholeInchOnlyVerification,
hasRecordOnlyMethod,
bandIsMeasured: _bfBandIsMeasured,
};
}
/* src/cupDisplay.js */
const CUP_DISPLAY_VOCABULARIES = {
knix: {
ours: ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'E/DDD', 'F', 'G', 'H'],
},
hanro: {
ours: ['A', 'B', 'C', 'D', 'DD'],
theirs: ['A', 'B', 'C', 'D', 'E'],
},
montelle: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
},
torrid: {
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I'],
theirs: ['B', 'C', 'D', 'DD', 'DDD', 'F', 'G', 'H'],
},
cacique_lane_bryant: {
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L'],
theirs: ['B', 'C', 'D', 'DD', 'DDD', 'F', 'G', 'H', 'I', 'J', 'K'],
},
curvy_kate: {
ours: ['D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
theirs: ['D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J', 'JJ', 'K'],
},
bravissimo: {
ours: ['D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
theirs: ['D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J', 'JJ', 'K'],
unread: ['KK', 'L'],
},
pour_moi: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J'],
},
fleur_du_mal: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'F', 'G'],
},
simone_perele: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
},
cuup: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
},
naturana: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
},
journelle: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
},
le_mystere: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
alsoReads: { 'E/DD': 'DD', 'F/DDD': 'DDD', 'G/DDDD': 'G' },
},
agent_provocateur: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'E', 'F'],
unread: ['G'],
},
sculptresse: {
ours: ['D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
theirs: ['D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J', 'JJ', 'K'],
},
honeylove_uk: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G'],
unread: ['H', 'J', 'K'],
},
thirdlove: {
ours: ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
},
skims: {
ours: ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['AA', 'A', 'B', 'C', 'D', 'DD', 'F', 'G', 'H'],
},
glamorise: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'F', 'G', 'H', 'I', 'J', 'K'],
},
chantelle: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
},
harper_wilde: {
ours: ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J'],
theirs: ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J'],
alsoReads: { E: 'DD', F: 'DDD', 'DD/E': 'DD', 'DDD/F': 'DDD', 'E/DD': 'DD', 'F/DDD': 'DDD' },
},
brooks: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G'],
},
lise_charmel: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
},
huit: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F'],
},
passionata: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
},
aubade: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
},
sweaty_betty: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G'],
alsoReads: { 'DD/E': 'DD', 'DDD/F': 'DDD', E: 'DDD', F: 'G' },
},
dita_von_teese: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I'],
alsoReads: { 'DD/E': 'DD', E: 'DD', 'DDD/F': 'DDD', F: 'DDD' },
},
cortland_intimates: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
alsoReads: { 'DD/E': 'DD', E: 'DD', 'DDD/F': 'DDD', F: 'DDD' },
},
marie_jo: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'DDD'],
alsoReads: { E: 'DD', F: 'DDD' },
},
marlies_dekkers: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'F'],
alsoReads: { 'DDD/E': 'DDD', E: 'DDD' },
unread: ['G'],
},
boux_avenue: {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K'],
theirs: ['A', 'B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H'],
},
freya_uk: {
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
theirs: ['B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J', 'JJ', 'K'],
},
fantasie_uk: {
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
theirs: ['B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J', 'JJ'],
},
elomi_uk: {
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
theirs: ['B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J', 'JJ', 'K'],
unread: ['KK', 'L', 'LL'],
},
panache_uk: {
ours: ['B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
theirs: ['B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J', 'JJ', 'K'],
},
listing_uk: {
ours: ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
theirs: ['AA', 'A', 'B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG', 'H', 'HH', 'J', 'JJ', 'K'],
},
listing_e_f_for_dd_ddd: {
ours: ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K'],
theirs: ['AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
},
listing_f_for_ddd: {
ours: ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J', 'K'],
theirs: ['AA', 'A', 'B', 'C', 'D', 'DD', 'F', 'G', 'H', 'I', 'J', 'K'],
},
};
function entryForListingCupLetters(brandEntry, lettering) {
if (!lettering || !Object.prototype.hasOwnProperty.call(CUP_DISPLAY_VOCABULARIES, lettering.vocabulary || '')) return brandEntry;
if (_cdDeclaresVocabulary(brandEntry)) {
return listingLettersExtendBrandLetters(brandEntry, lettering)
? { ...brandEntry, cup_display: { vocabulary: lettering.vocabulary } }
: brandEntry;
}
return { ...(brandEntry || {}), cup_display: { vocabulary: lettering.vocabulary } };
}
function listingLettersExtendBrandLetters(brandEntry, lettering) {
const own = resolveCupDisplay(brandEntry);
const listing = lettering && CUP_DISPLAY_VOCABULARIES[lettering.vocabulary];
const letters = (lettering && Array.isArray(lettering.pastDD)) ? lettering.pastDD : [];
if (!own || !listing || !letters.length) return null;
const readBy = (vocab, letter) => {
const at = vocab.theirs.indexOf(letter);
if (at !== -1) return vocab.ours[at];
return (vocab.alsoReads && vocab.alsoReads[letter]) || null;
};
let shared = 0;
const added = [];
for (const raw of letters) {
const letter = String(raw).trim().toUpperCase();
const brandReads = readBy(own, letter);
const listingReads = readBy(listing, letter);
if (brandReads && !listingReads) return null;
if (brandReads && listingReads !== brandReads) return null;
if (brandReads) shared += 1;
else if (listingReads) {
if (_cdIsUnreadCup(letter, brandEntry)) return null;
added.push({ printed: letter, ours: listingReads });
}
}
return (shared > 0 && added.length) ? { added } : null;
}
function resolveCupDisplay(brandEntry) {
const declared = brandEntry && brandEntry.cup_display;
if (!declared || typeof declared.vocabulary !== 'string') return null;
return CUP_DISPLAY_VOCABULARIES[declared.vocabulary] || null;
}
function displayCup(cup, brandEntry) {
const vocab = resolveCupDisplay(brandEntry);
if (!vocab) return cup;
const at = vocab.ours.indexOf(cup);
return at === -1 ? null : vocab.theirs[at];
}
function displaySizeLabel(size, brandEntry) {
if (!size) return size;
const label = size.label;
if (!resolveCupDisplay(brandEntry)) return label;
if (typeof size.band !== 'number' || typeof size.cup !== 'string') return label;
const theirs = displayCup(size.cup, brandEntry);
if (!theirs) return label;
const plain = `${size.band}${size.cup}`;
if (label === plain) return `${size.band}${theirs}`;
if (label === `${plain}+`) return `${size.band}${theirs}+`;
if (label === `${plain}½`) return `${size.band}${theirs}½`;
return label;
}
const _cdFitEngine = (typeof module !== 'undefined' && module.exports) ? require('./fitEngine') : null;
const _cdCupLetters = _cdFitEngine ? _cdFitEngine.CUP_LETTERS : CUP_LETTERS;
const _cdLabelReader = (typeof module !== 'undefined' && module.exports) ? require('./sizeLabelReader') : null;
const _cdReadSizeLabel = _cdLabelReader ? _cdLabelReader.readSizeLabel : readSizeLabel;
const _cdOnlySpelling = _cdLabelReader ? _cdLabelReader.sizeLabelOnlySpelling : sizeLabelOnlySpelling;
function _cdSplitLabel(label) {
const read = _cdReadSizeLabel(label);
if (!_cdOnlySpelling(read)) return null;
if (read.cupHalf || read.cupAlsoHalf || read.cupRange || read.labelSystem || read.alsoSize || read.also) return null;
let cup = null;
if (read.system === 'letter') cup = read.letterIsCupName ? read.letter : null;
else if (read.system === 'cup' || read.system === 'band_cup') {
if (read.cupJoin === 'bracket') cup = `${read.cup}(${read.cupAlso})`;
else if (read.cupJoin === 'slash') cup = `${read.cup}/${read.cupAlso}`;
else cup = read.cup;
}
if (!cup) return null;
if (read.system !== 'band_cup') return { band: null, cup };
if (read.cupFirst || read.band < 10 || read.band > 99) return null;
return { band: read.band, cup };
}
function _cdIsUnreadCup(theirs, brandEntry) {
const vocab = resolveCupDisplay(brandEntry);
const listed = brandEntry && brandEntry.cup_letters_unread && brandEntry.cup_letters_unread.letters;
const cup = theirs.toUpperCase();
return !!((vocab && Array.isArray(vocab.unread) && vocab.unread.includes(cup))
|| (Array.isArray(listed) && listed.includes(cup)));
}
function _cdReadCup(theirs, brandEntry) {
const vocab = resolveCupDisplay(brandEntry);
if (vocab) {
const at = vocab.theirs.indexOf(theirs.toUpperCase());
if (at !== -1) return vocab.ours[at];
const also = vocab.alsoReads && vocab.alsoReads[theirs.toUpperCase().replace(/\s+/g, '')];
return also || null;
}
const ladder = brandEntry && brandEntry.cup_ladder;
if (ladder && ladder.kind === 'vocabulary' && ladder.system === 'dual_label') {
const joined = /^([A-Z]{1,3})\/[A-Z]{1,3}$/.exec(theirs);
return joined && _cdCupLetters.includes(joined[1]) ? joined[1] : null;
}
return null;
}
function parseDualSizeLabel(label) {
if (typeof label !== 'string') return null;
const read = _cdReadSizeLabel(label);
const also = read.alsoSize;
if (!also || read.noise.length || read.band < 10 || read.band > 99 || also.band < 10 || also.band > 99) return null;
return { printed: `${read.band}${read.cup}`, us: `${also.band}${also.cup}`, usCup: also.cup };
}
const _cdEuCupNames = {
ours: ['A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'],
theirs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
};
function parseDualCupLabel(label) {
if (typeof label !== 'string') return null;
const read = _cdReadSizeLabel(label);
if (read.system !== 'cup' || read.cupJoin !== 'bracket' || read.cupHalf || read.cupAlsoHalf || read.noise.length) return null;
const ours = read.cup;
const at = _cdEuCupNames.ours.indexOf(ours);
if (at === -1 || _cdEuCupNames.theirs[at] === ours || _cdEuCupNames.theirs[at] !== read.cupAlso) return null;
return { printed: ours, us: ours, usCup: ours };
}
function _cdParseDual(label) {
return parseDualSizeLabel(label) || parseDualCupLabel(label);
}
function _cdDeclaresVocabulary(brandEntry) {
if (resolveCupDisplay(brandEntry)) return true;
const ladder = brandEntry && brandEntry.cup_ladder;
return !!(ladder && ladder.kind === 'vocabulary' && ladder.system === 'dual_label');
}
function _cdReadDualLabel(dual, brandEntry) {
if (!_cdCupLetters.includes(dual.usCup)) return null;
if (_cdDeclaresVocabulary(brandEntry) && readSelectorLabel(dual.printed, brandEntry) !== dual.us) return null;
return dual.us;
}
function readSelectorLabel(label, brandEntry) {
if (typeof label !== 'string') return label;
const trimmed = label.trim();
const dual = _cdParseDual(trimmed);
if (dual) return _cdReadDualLabel(dual, brandEntry) || label;
const split = _cdSplitLabel(trimmed);
if (!split) return label;
const cup = _cdReadCup(split.cup, brandEntry);
if (!cup) {
const slash = split.band != null && /^([A-Z]+)\/([A-Z]+)$/.exec(split.cup);
if (slash) {
const [a, b] = [slash[1], slash[2]];
const ra = _cdReadCup(a, brandEntry);
const rb = _cdReadCup(b, brandEntry);
const one = (ra && (ra === b || ra === rb)) ? ra : ((rb && rb === a) ? rb : null);
if (one && _cdCupLetters.includes(one)) return `${split.band}${one}`;
}
return label;
}
return split.band == null ? cup : `${split.band}${cup}`;
}
function isUnreadSelectorLabel(label, brandEntry) {
if (typeof label !== 'string') return false;
const trimmed = label.trim();
const dual = _cdParseDual(trimmed);
if (dual) {
if (!_cdDeclaresVocabulary(brandEntry)) return false;
return isUnreadSelectorLabel(dual.printed, brandEntry) || readSelectorLabel(dual.printed, brandEntry) !== dual.us;
}
const split = _cdSplitLabel(trimmed);
return !!(split && _cdIsUnreadCup(split.cup, brandEntry));
}
const _cdForeignPlainCups = ['E', 'F', 'FF', 'GG', 'HH', 'JJ', 'KK'];
function _cdPrintsForeignPlainCup(label) {
const split = _cdSplitLabel(label);
return !!split && _cdForeignPlainCups.includes(split.cup);
}
const _cdUkDoubleCups = ['FF', 'GG', 'HH', 'JJ', 'KK'];
function _cdIsForeignSelectList(cluster, brandEntry) {
if (_cdDeclaresVocabulary(brandEntry)) return false;
if (brandEntry && brandEntry.cup_letters_unread && Array.isArray(brandEntry.cup_letters_unread.letters)) return false;
const cupOf = (item) => {
if (!item || typeof item.label !== 'string' || parseDualSizeLabel(item.label)) return null;
const split = _cdSplitLabel(item.label.trim());
return split ? split.cup : null;
};
const selectCups = cluster.filter((item) => item && item.fromSelect).map(cupOf).filter(Boolean);
const selectUsMarked = selectCups.some((cup) => cup === 'DD' || cup === 'DDD');
return cluster.some((item) => {
const cup = cupOf(item);
if (!cup) return false;
if (item.fromSelect) return selectUsMarked ? _cdUkDoubleCups.includes(cup) : _cdForeignPlainCups.includes(cup);
if (!item.fromProductData) return false;
return _cdUkDoubleCups.includes(cup);
});
}
function _cdIsGtin(code) {
if (typeof code !== 'string' || !/^(\d{8}|\d{12,14})$/.test(code)) return false;
const digits = code.split('').map(Number);
const check = digits.pop();
const sum = digits.reverse().reduce((total, d, i) => total + d * (i % 2 ? 1 : 3), 0);
return (10 - (sum % 10)) % 10 === check;
}
const _cdNormalSize = (size) => {
const read = _cdReadSizeLabel(String(size == null ? '' : size));
if (read.system !== 'band_cup' || read.cupFirst || read.cupJoin || read.cupHalf || read.cupRange || read.labelSystem
|| read.alsoSize || read.noise.length || read.band < 10 || read.band > 99 || read.cup.length > 3) return null;
return `${read.band}${read.cup}`;
};
function findRelabelledSizes(variants, colour, brandEntry) {
const usable = (variants || [])
.map((v) => ({ color: String((v && v.color) || ''), size: _cdNormalSize(v && v.size), code: String((v && v.code) || '') }))
.filter((v) => v.size && _cdIsGtin(v.code));
const colours = [...new Set(usable.map((v) => v.color))];
const known = colours.includes(colour) ? colour : (colours.length === 1 ? colours[0] : null);
const vocab = resolveCupDisplay(brandEntry);
const ambiguousCups = vocab
? vocab.theirs.filter((cup) => { const at = vocab.ours.indexOf(cup); return at !== -1 && vocab.theirs[at] !== cup; })
: [];
const read = {};
const refused = new Set();
const proven = new Set();
let signature = false;
(known === null ? colours : [known]).forEach((c) => {
const byCode = new Map();
usable.filter((v) => v.color === c).forEach((v) => {
if (!byCode.has(v.code)) byCode.set(v.code, []);
if (!byCode.get(v.code).includes(v.size)) byCode.get(v.code).push(v.size);
});
byCode.forEach((sizes) => {
if (sizes.length < 2) return;
const genuine = sizes.filter((g) => sizes.every((s) => s === g || s === readSelectorLabel(g, brandEntry)));
if (genuine.length === 1) {
signature = true;
proven.add(genuine[0]);
sizes.forEach((s) => { if (s !== genuine[0]) read[s] = readSelectorLabel(genuine[0], brandEntry); });
} else if (new Set(sizes.map((s) => readSelectorLabel(s, brandEntry))).size > 1) {
sizes.forEach((s) => refused.add(s));
}
});
});
if (!signature && !refused.size) return null;
if (known === null) Object.keys(read).forEach((s) => { refused.add(s); delete read[s]; });
return {
colour: known,
read,
refused: [...refused],
proven: [...proven],
ambiguousCups: signature ? ambiguousCups : [],
};
}
function _cdPrintedSize(label) {
if (typeof label !== 'string') return null;
const dual = parseDualSizeLabel(label);
return _cdNormalSize(dual ? dual.printed : label);
}
function readSelectorCupGroup(label, brandEntry) {
const groups = brandEntry && brandEntry.cup_display && brandEntry.cup_display.cup_groups;
if (!groups || typeof label !== 'string') return null;
const members = groups[label.trim().toUpperCase()];
if (!Array.isArray(members) || !members.length) return null;
const ours = members.map((member) => _cdReadCup(String(member), brandEntry));
return ours.every((cup) => cup && _cdCupLetters.includes(cup)) ? ours : null;
}
function listedCupLetters(brandEntry, alphaGrid) {
const own = resolveCupDisplay(brandEntry || null);
if (own) return { vocabulary: own, decidedBy: null, reading: null, pastDD: [] };
const lettering = alphaGrid && alphaGrid.listedLettering;
if (lettering && Object.prototype.hasOwnProperty.call(CUP_DISPLAY_VOCABULARIES, lettering.vocabulary || '')) {
return { vocabulary: CUP_DISPLAY_VOCABULARIES[lettering.vocabulary], decidedBy: lettering.decidedBy || null, reading: lettering.reading || null, pastDD: lettering.pastDD || [] };
}
return null;
}
function readSelectorCupRange(label, brandEntry) {
if (typeof label !== 'string') return null;
const split = _cdSplitLabel(label.trim());
if (!split || split.band == null) return null;
const slash = /^([A-Z]+)\/([A-Z]+)$/.exec(split.cup);
if (!slash) return null;
const sizes = [slash[1], slash[2]].map((letter) => {
const alone = `${split.band}${letter}`;
if (isUnreadSelectorLabel(alone, brandEntry)) return null;
const read = _cdSplitLabel(readSelectorLabel(alone, brandEntry));
return (read && read.band === split.band && _cdCupLetters.includes(read.cup)) ? `${split.band}${read.cup}` : null;
});
if (sizes.some((size) => !size)) return null;
const covered = [...new Set(sizes)];
return covered.length === 2 ? covered : null;
}
function readSelectorClusters(clusters, brandEntry, relabels) {
return (clusters || []).map((cluster) => {
const items = cluster || [];
if (_cdIsForeignSelectList(items, brandEntry)) return [];
return items.flatMap((item) => {
const group = readSelectorCupGroup(item.label, brandEntry);
if (group) return group.map((cup) => ({ ...item, label: cup, groupedFrom: item.label }));
const printed = relabels ? _cdPrintedSize(item.label) : null;
if (printed) {
if (Object.prototype.hasOwnProperty.call(relabels.read, printed)) {
return { ...item, label: relabels.read[printed], relabelledFrom: item.label };
}
if (relabels.refused.includes(printed)
|| (relabels.ambiguousCups.includes(printed.slice(2)) && !relabels.proven.includes(printed))) {
const dual = _cdParseDual(item.label);
return { ...item, label: dual ? dual.us : item.label, disabled: true, unreadCup: true, relabelRefused: true, printedDisabled: !!item.disabled };
}
}
if (!isUnreadSelectorLabel(item.label, brandEntry)) {
const read = readSelectorLabel(item.label, brandEntry);
const range = read === item.label ? readSelectorCupRange(item.label, brandEntry) : null;
if (range) return range.map((label) => ({ ...item, label, cupRangeFrom: item.label }));
return { ...item, label: read };
}
const dual = _cdParseDual(item.label);
return { ...item, label: dual ? dual.us : item.label, disabled: true, unreadCup: true, printedDisabled: !!item.disabled };
});
});
}
function _cdNoToggleReading(brandEntry, toggle, pathname) {
const rules = Array.isArray(toggle.whenNoToggle) ? toggle.whenNoToggle : [];
const path = typeof pathname === 'string' ? pathname : '';
const rule = rules.find((r) => r && typeof r.pathPrefix === 'string' && path.startsWith(r.pathPrefix));
if (!rule) return { entry: brandEntry, state: 'no toggle on the page', refused: false };
const state = `no toggle on the page, and ${rule.pathPrefix} serves ${rule.state}`;
const vocabulary = toggle.states[rule.state];
if (vocabulary === null) return { entry: brandEntry, state, refused: false };
if (!Object.prototype.hasOwnProperty.call(CUP_DISPLAY_VOCABULARIES, vocabulary || '')) {
return { entry: brandEntry, state, refused: true };
}
return { entry: { ...(brandEntry || {}), cup_display: { vocabulary } }, state, refused: false };
}
function readerEntryForSizeToggle(brandEntry, toggle, buttons, pathname) {
if (!toggle || !toggle.states || typeof toggle.states !== 'object') {
return { entry: brandEntry, state: null, refused: false };
}
const declared = (buttons || []).filter((b) => b && Object.prototype.hasOwnProperty.call(toggle.states, b.name));
if (!declared.length) return _cdNoToggleReading(brandEntry, toggle, pathname);
const showing = declared.filter((b) => b.active);
if (showing.length !== 1) {
return { entry: brandEntry, state: `${showing.length} of ${declared.length} toggle buttons marked showing`, refused: true };
}
const name = showing[0].name;
const vocabulary = toggle.states[name];
if (vocabulary === null) return { entry: brandEntry, state: name, refused: false };
if (!Object.prototype.hasOwnProperty.call(CUP_DISPLAY_VOCABULARIES, vocabulary)) {
return { entry: brandEntry, state: name, refused: true };
}
return { entry: { ...(brandEntry || {}), cup_display: { vocabulary } }, state: name, refused: false };
}
function entryForHostCupLetters(brandEntry, hostConfig) {
if (!brandEntry || !brandEntry.cup_display) return brandEntry;
if (!hostConfig || hostConfig.printsThisProjectsCupLetters !== true) return brandEntry;
const { cup_display: _ignored, ...rest } = brandEntry;
return rest;
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
entryForHostCupLetters,
entryForListingCupLetters,
listingLettersExtendBrandLetters,
CUP_DISPLAY_VOCABULARIES,
resolveCupDisplay,
displayCup,
displaySizeLabel,
readSelectorLabel,
isUnreadSelectorLabel,
readSelectorClusters,
readSelectorCupGroup,
listedCupLetters,
findRelabelledSizes,
parseDualSizeLabel,
parseDualCupLabel,
readerEntryForSizeToggle,
};
}
/* src/shopifyVariantFeed.js */
const _svfFitEngine = (typeof module !== 'undefined' && module.exports) ? require('./fitEngine') : null;
const _svfCupLetters = _svfFitEngine ? _svfFitEngine.CUP_LETTERS : CUP_LETTERS;
const _svfValidBands = _svfFitEngine ? _svfFitEngine.VALID_BANDS : VALID_BANDS;
const _svfSubLadderBands = _svfFitEngine ? _svfFitEngine.SUB_LADDER_BANDS : SUB_LADDER_BANDS;
const _svfBandRead = (band) => _svfValidBands.includes(band) || _svfSubLadderBands.includes(band);
const _svfCupDisplay = (typeof module !== 'undefined' && module.exports) ? require('./cupDisplay') : null;
const _svfLabelReader = (typeof module !== 'undefined' && module.exports) ? require('./sizeLabelReader') : null;
const _svfReadSizeLabel = _svfLabelReader ? _svfLabelReader.readSizeLabel : readSizeLabel;
const _svfOnlySpelling = _svfLabelReader ? _svfLabelReader.sizeLabelOnlySpelling : sizeLabelOnlySpelling;
const _svfReadSelectorLabel = _svfCupDisplay ? _svfCupDisplay.readSelectorLabel : readSelectorLabel;
const _svfEuropean = (typeof module !== 'undefined' && module.exports) ? require('./europeanBandLabels') : null;
const _svfEuropeanBandRelabels = _svfEuropean ? _svfEuropean.europeanBandRelabels
: (typeof europeanBandRelabels === 'function' ? europeanBandRelabels : null);
const _svfIsUnreadLabel = (label, brandEntry) => {
const test = _svfCupDisplay ? _svfCupDisplay.isUnreadSelectorLabel
: (typeof isUnreadSelectorLabel === 'function' ? isUnreadSelectorLabel : null);
return !!(test && test(label, brandEntry));
};
const SHOPIFY_FEED_TIMEOUT_MS = 3000;
const SHOPIFY_FEED_MAX_TRUSTED_VARIANTS = 249;
const _svfSizeOptionName = /size|band|cup|dimension|taille|größe/i;
function _svfIsHalfCup(value) {
const text = typeof value === 'string' ? value : '';
if (/½|1\/2/.test(text)) return true;
const read = _svfReadSizeLabel(text);
return !!(read.cupHalf || read.cupAlsoHalf || (read.cupRangeHalf && read.cupRangeHalf.some(Boolean)));
}
function shopifyProductHandle(pathname) {
const match = /\/products\/([^/?#]+)\/?$/.exec(typeof pathname === 'string' ? pathname : '');
if (!match) return null;
try {
return decodeURIComponent(match[1]);
} catch (err) {
return null;
}
}
function isShopifyStorefront(signals) {
return !!(signals && signals.shopifyFeaturesScript === true);
}
function shopifyFeedPath(handle) {
return `/products/${encodeURIComponent(handle)}.js`;
}
function _svfReadCup(value, brandEntry) {
const read = _svfReadSelectorLabel(value, brandEntry);
return _svfCupLetters.includes(read) ? read : null;
}
const _svfReadCupGroup = (label, brandEntry) => {
const read = _svfCupDisplay ? _svfCupDisplay.readSelectorCupGroup
: (typeof readSelectorCupGroup === 'function' ? readSelectorCupGroup : null);
return read ? read(label, brandEntry) : null;
};
function _svfReadBandCup(value, brandEntry) {
const renamed = _svfReadSelectorLabel(value, brandEntry);
const read = _svfReadSizeLabel(typeof renamed === 'string' ? renamed : '');
if (read.system !== 'band_cup' || !_svfOnlySpelling(read) || read.cupFirst || read.cupJoin || read.cupHalf || read.cupRange
|| read.labelSystem || read.alsoSize) return null;
return (_svfBandRead(read.band) && _svfCupLetters.includes(read.cup)) ? `${read.band}${read.cup}` : null;
}
function _svfReadHalfPair(bandValue, cupValue, brandEntry) {
const read = _svfReadSizeLabel(String(cupValue == null ? bandValue : cupValue));
if (!read.cupHalf || read.cupAlso || read.cupRange || read.labelSystem || read.alsoSize) return null;
let band = read.band;
if (cupValue != null) {
if (read.system !== 'cup' || !_svfIsBandValue(String(bandValue))) return null;
band = Number(String(bandValue).trim());
} else if (read.system !== 'band_cup' || !_svfBandRead(band)) return null;
const cup = _svfReadCup(read.cup, brandEntry);
return cup ? `${band}${cup}½` : null;
}
function _svfIsBandValue(value) {
const read = _svfReadSizeLabel(value);
return read.system === 'number' && !read.noise.length && !read.also && /^\d{2}$/.test(read.text) && _svfBandRead(read.number);
}
function _svfClassifyOption(option, brandEntry) {
const all = (option && Array.isArray(option.values)) ? option.values.map((v) => String(v).trim().toUpperCase()) : [];
const values = all.filter((v) => !_svfIsHalfCup(v));
if (!values.length) return { kind: 'unreadable', values };
if (values.every(_svfIsBandValue)) return { kind: 'band', values };
if (values.every((v) => _svfReadBandCup(v, brandEntry))) return { kind: 'bandCup', values };
if (values.every((v) => _svfReadCup(v, brandEntry))) return { kind: 'cup', values };
const sizeShaped = values.some((v) => /^\d{2}\s?[A-Z]{0,4}$/.test(v) || /^\d{2,3}$/.test(v));
const sizeNamed = _svfSizeOptionName.test(String((option && option.name) || ''));
return { kind: (sizeShaped || sizeNamed) ? 'unreadable' : 'other', values };
}
function readShopifyVariantFeed(json, handle, brandEntry) {
if (!json || typeof json !== 'object') return { ok: false, reason: 'not-json-object' };
if (!handle || json.handle !== handle) return { ok: false, reason: 'handle-mismatch' };
if (_svfEuropeanBandRelabels && Array.isArray(json.options) && Array.isArray(json.variants)) {
const eu = _svfEuropeanBandRelabels(json.options.flatMap((o) => (o && Array.isArray(o.values) ? o.values : [])).map(String), brandEntry);
if (eu && Object.keys(eu.renamed).length) {
const map = (v) => (Object.prototype.hasOwnProperty.call(eu.renamed, String(v)) ? eu.renamed[String(v)] : v);
json = {
...json,
options: json.options.map((o) => (o && Array.isArray(o.values) ? { ...o, values: o.values.map(map) } : o)),
variants: json.variants.map((v) => (v && Array.isArray(v.options) ? { ...v, options: v.options.map(map) } : v)),
};
}
}
const variants = Array.isArray(json.variants) ? json.variants : [];
if (!variants.length) return { ok: false, reason: 'no-variants' };
if (variants.length > SHOPIFY_FEED_MAX_TRUSTED_VARIANTS) return { ok: false, reason: 'variant-list-may-be-truncated' };
const options = Array.isArray(json.options) ? json.options : [];
if (!options.length) return { ok: false, reason: 'no-options' };
const kinds = options.map((option) => _svfClassifyOption(option, brandEntry).kind);
if (kinds.includes('unreadable')) return { ok: false, reason: 'unreadable-sizes' };
const bandAt = kinds.indexOf('band');
const cupAt = kinds.indexOf('cup');
const bandCupAt = kinds.indexOf('bandCup');
const count = (kind) => kinds.filter((k) => k === kind).length;
const split = count('band') === 1 && count('cup') === 1 && count('bandCup') === 0;
const combined = count('bandCup') === 1 && count('band') === 0 && count('cup') === 0;
if (!split && !combined) return { ok: false, reason: 'no-band-cup-options' };
const byPair = new Map();
const byHalfPair = new Map();
for (const variant of variants) {
const values = (variant && Array.isArray(variant.options)) ? variant.options : null;
if (!values || values.length !== options.length) return { ok: false, reason: 'variant-options-mismatch' };
if (typeof variant.available !== 'boolean') return { ok: false, reason: 'no-availability' };
const upper = values.map((v) => String(v).trim().toUpperCase());
if (upper.some(_svfIsHalfCup)) {
const half = combined ? _svfReadHalfPair(upper[bandCupAt], null, brandEntry) : _svfReadHalfPair(upper[bandAt], upper[cupAt], brandEntry);
if (half) {
if (!byHalfPair.has(half)) byHalfPair.set(half, []);
byHalfPair.get(half).push(variant.available);
}
continue;
}
const pair = combined
? _svfReadBandCup(upper[bandCupAt], brandEntry)
: (() => {
const cup = _svfReadCup(upper[cupAt], brandEntry);
return cup ? `${Number(upper[bandAt])}${cup}` : null;
})();
if (!pair) return { ok: false, reason: 'unreadable-sizes' };
if (!byPair.has(pair)) byPair.set(pair, []);
byPair.get(pair).push(variant.available);
}
if (!byPair.size) return { ok: false, reason: 'no-whole-cup-sizes' };
const madePairs = [...byPair.keys()].sort();
const soldOutPairs = madePairs.filter((pair) => byPair.get(pair).every((available) => available === false));
const variantsPerSize = Math.max(...madePairs.map((pair) => byPair.get(pair).length));
return { ok: true, handle, variantCount: variants.length, variantsPerSize, madePairs, soldOutPairs, ..._svfHalfPairFacts(byHalfPair) };
}
function readShopifyColourStock(json, handle, brandEntry, variantId, pageColour) {
if (!json || typeof json !== 'object' || json.handle !== handle) return { ok: false, reason: 'handle-mismatch' };
if (!variantId) return { ok: false, reason: 'no-variant-in-the-address' };
const variants = Array.isArray(json.variants) ? json.variants : [];
const options = Array.isArray(json.options) ? json.options : [];
const variant = variants.find((v) => v && String(v.id) === String(variantId));
if (!variant || !Array.isArray(variant.options)) return { ok: false, reason: 'variant-not-in-the-product' };
const colourAt = options.map((o, i) => (/^(colou?r|shade)$/i.test(String((o && o.name) || '').trim()) ? i : -1)).filter((i) => i !== -1);
if (colourAt.length !== 1) return { ok: false, reason: 'no-single-colour-option' };
const at = colourAt[0];
const shown = String(variant.options[at] || '').trim();
if (!shown || typeof pageColour !== 'string' || pageColour.trim().toLowerCase() !== shown.toLowerCase()) {
return { ok: false, reason: "the page's chosen colour does not confirm the address's variant" };
}
const colours = [];
const values = [...new Set(variants.map((v) => String((v && v.options && v.options[at]) || '').trim()).filter(Boolean))];
for (const colour of values) {
if (colour.toLowerCase() === shown.toLowerCase()) continue;
const read = readShopifyVariantFeed({ ...json, variants: variants.filter((v) => String((v.options || [])[at] || '').trim() === colour) }, handle, brandEntry);
if (!read.ok) return { ok: false, reason: `another colour could not be read: ${read.reason}` };
colours.push({ colour, pairs: read.madePairs.filter((pair) => !read.soldOutPairs.includes(pair)) });
}
return { ok: true, shown, colours };
}
function _svfHalfPairFacts(byHalfPair) {
if (!byHalfPair.size) return {};
const madeHalfPairs = [...byHalfPair.keys()].sort();
return {
madeHalfPairs,
soldOutHalfPairs: madeHalfPairs.filter((pair) => byHalfPair.get(pair).every((available) => available === false)),
halfVariantsPerSize: Math.max(...madeHalfPairs.map((pair) => byHalfPair.get(pair).length)),
};
}
function readListingGroupStock(variants, brandEntry) {
if (!Array.isArray(variants) || !variants.length) return { ok: false, reason: 'no-variants' };
if (variants.length > SHOPIFY_FEED_MAX_TRUSTED_VARIANTS) return { ok: false, reason: 'variant-list-may-be-truncated' };
const byPair = new Map();
const byHalfPair = new Map();
for (const variant of variants) {
if (!variant || typeof variant !== 'object') return { ok: false, reason: 'variant-options-mismatch' };
const label = String(variant.size == null ? '' : variant.size).trim().toUpperCase().replace(/\s+/g, '');
if (!label) return { ok: false, reason: 'unreadable-sizes' };
if (_svfIsHalfCup(label)) {
const half = typeof variant.available === 'boolean' ? _svfReadHalfPair(label, null, brandEntry) : null;
if (half) {
if (!byHalfPair.has(half)) byHalfPair.set(half, []);
byHalfPair.get(half).push(variant.available);
}
continue;
}
if (typeof variant.available !== 'boolean') return { ok: false, reason: 'no-availability' };
const pair = _svfReadBandCup(label, brandEntry);
if (!pair) return { ok: false, reason: 'unreadable-sizes' };
if (!byPair.has(pair)) byPair.set(pair, []);
byPair.get(pair).push(variant.available);
}
if (!byPair.size) return { ok: false, reason: 'no-whole-cup-sizes' };
const madePairs = [...byPair.keys()].sort();
const soldOutPairs = madePairs.filter((pair) => byPair.get(pair).every((available) => available === false));
const variantsPerSize = Math.max(...madePairs.map((pair) => byPair.get(pair).length));
return { ok: true, variantCount: variants.length, variantsPerSize, madePairs, soldOutPairs, ..._svfHalfPairFacts(byHalfPair) };
}
function readBandVariationStock(answers, attributes, brandEntry) {
if (!Array.isArray(answers) || !answers.length) return { ok: false, reason: 'no-answers' };
const bandId = attributes && attributes.bandAttribute;
const cupId = attributes && attributes.cupAttribute;
if (!bandId || !cupId) return { ok: false, reason: 'no-attribute-ids' };
const pairs = new Set();
for (const answer of answers) {
const read = _svfBandCupAttributes(answer && answer.json, bandId, cupId);
if (!read.ok) return read;
const byCup = answer.cup != null && answer.band == null;
const chosen = String(byCup ? answer.cup : (answer.band == null ? '' : answer.band)).trim();
const chosenAttribute = byCup ? read.cup : read.band;
const listedAttribute = byCup ? read.band : read.cup;
const selected = chosenAttribute.values.filter((value) => value && value.selected === true).map((value) => String(value.value).trim());
if (selected.length !== 1 || selected[0] !== chosen) return { ok: false, reason: byCup ? 'cup-not-selected' : 'band-not-selected' };
for (const value of listedAttribute.values) {
if (!value || typeof value.selectable !== 'boolean') return { ok: false, reason: 'no-availability' };
const listed = String(value.value == null ? '' : value.value).trim().toUpperCase();
if (!value.selectable || !listed) continue;
const band = byCup ? listed : chosen;
const cup = (byCup ? chosen : listed).toUpperCase();
if (_svfIsHalfCup(cup)) continue;
const group = _svfReadCupGroup(cup, brandEntry);
if (group) {
group.forEach((member) => { const pair = _svfReadBandCup(`${band}${member}`, null); if (pair) pairs.add(pair); });
continue;
}
if (_svfIsUnreadLabel(cup, brandEntry)) continue;
const pair = _svfReadBandCup(`${band}${cup}`, brandEntry);
if (pair) pairs.add(pair);
}
}
return { ok: true, bandsRead: answers.length, inStockPairs: [...pairs].sort() };
}
function _svfBandCupAttributes(json, bandId, cupId) {
const product = json && json.product;
const variationAttributes = product && Array.isArray(product.variationAttributes) ? product.variationAttributes : null;
if (!variationAttributes) return { ok: false, reason: 'not-a-variation-answer' };
const band = variationAttributes.find((attribute) => attribute && attribute.id === bandId);
const cup = variationAttributes.find((attribute) => attribute && attribute.id === cupId);
if (!band || !cup || !Array.isArray(band.values) || !Array.isArray(cup.values)) return { ok: false, reason: 'no-band-cup-attributes' };
return { ok: true, band, cup };
}
function gridMarksUnreadCupInStock(grid) {
return !!(grid && Array.isArray(grid.cupRow) && grid.cupRow.some((entry) => entry && entry.printed && !entry.ours && entry.inStock));
}
function readableSelectorCup(value, brandEntry) {
const cup = String(value == null ? '' : value).trim().toUpperCase();
if (!cup || _svfIsHalfCup(cup)) return null;
const group = _svfReadCupGroup(cup, brandEntry);
if (group) return group[0];
if (_svfIsUnreadLabel(cup, brandEntry)) return null;
return _svfReadCup(cup, brandEntry);
}
function readKeyedListedSizes(records, colour, knownColours, fields) {
if (!records || typeof records !== 'object') return { ok: false, reason: 'no-records' };
if (typeof colour !== 'string' || !colour) return { ok: false, reason: 'no-colour-on-screen' };
if (!Array.isArray(knownColours) || !knownColours.includes(colour)) return { ok: false, reason: 'colour-not-in-the-product-data' };
const f = fields || {};
const listedSizes = {};
const inStock = new Set();
for (const [key, record] of Object.entries(records)) {
const parts = key.split('|');
if (parts.length !== 3) return { ok: false, reason: 'unexpected-key' };
if (parts[0] !== colour) continue;
const size = record && typeof record[f.size] === 'string' ? record[f.size].trim().toUpperCase() : '';
const band = Number(record && record[f.band]);
const cup = String((record && record[f.cup]) || '').trim().toUpperCase();
if (!size || !Number.isFinite(band) || !cup || String(band) !== parts[1].trim() || cup !== parts[2].trim().toUpperCase()) return { ok: false, reason: 'unexpected-record' };
if (typeof record[f.stock] !== 'string') return { ok: false, reason: 'no-availability' };
(listedSizes[size] = listedSizes[size] || []).push({ band, cup });
if (record[f.stock] === f.inStock) inStock.add(size);
}
const offeredLabels = Object.keys(listedSizes);
if (!offeredLabels.length) return { ok: false, reason: 'no-sizes-for-the-colour' };
return { ok: true, listedSizes, offeredLabels, availableLabels: offeredLabels.filter((size) => inStock.has(size)) };
}
function readKeyedVariantStock(records, colour, knownColours, brandEntry) {
if (!records || typeof records !== 'object') return { ok: false, reason: 'no-records' };
if (typeof colour !== 'string' || !colour) return { ok: false, reason: 'no-colour-on-screen' };
if (!Array.isArray(knownColours) || !knownColours.includes(colour)) return { ok: false, reason: 'colour-not-in-the-product-data' };
const pairs = new Set();
let variantCount = 0;
for (const [key, record] of Object.entries(records)) {
const parts = key.split('|');
if (parts.length !== 3) return { ok: false, reason: 'unexpected-key' };
if (parts[0] !== colour) continue;
variantCount += 1;
if (!record || typeof record.priceKey !== 'string') return { ok: false, reason: 'no-availability' };
if (record.priceKey.split('|')[1] !== 'IN_STOCK' || record.isBackOrdered === true) continue;
const cup = parts[2].trim().toUpperCase();
if (_svfIsHalfCup(cup) || _svfIsUnreadLabel(cup, brandEntry)) continue;
const pair = _svfReadBandCup(`${parts[1].trim()}${cup}`, brandEntry);
if (pair) pairs.add(pair);
}
return { ok: true, inStockPairs: [...pairs].sort(), variantCount };
}
function readVariationHierarchyPairs(hierarchy, page, brandEntry) {
if (!Array.isArray(hierarchy) || !hierarchy.length) return { ok: false, reason: 'no-hierarchy' };
const levelOf = (name) => {
const n = String(name || '').trim().toLowerCase();
if (n === 'color' || n === 'colour') return 'colour';
if (n === 'band size') return 'band';
if (n === 'cup size') return 'cup';
return n;
};
const leaves = [];
const walk = (nodes, trail) => (nodes || []).forEach((node) => {
if (!node || typeof node !== 'object') return;
const next = { ...trail, [levelOf(node.name)]: node.value };
if (Array.isArray(node.variation_hierarchy) && node.variation_hierarchy.length) walk(node.variation_hierarchy, next);
else leaves.push({ ...next, tcin: node.tcin == null ? null : String(node.tcin) });
});
walk(hierarchy, {});
if (!leaves.some((leaf) => leaf.band != null && leaf.cup != null)) return { ok: false, reason: 'no-band-and-cup-levels' };
const pageId = page && page.pageId ? String(page.pageId) : null;
const own = pageId ? leaves.find((leaf) => leaf.tcin === pageId) : null;
const title = String((page && page.title) || '').toLowerCase();
const colours = [...new Set(leaves.map((leaf) => leaf.colour).filter(Boolean))];
const named = colours.filter((c) => title.includes(String(c).toLowerCase())).sort((a, b) => String(b).length - String(a).length);
const colour = (own && own.colour) || named[0] || null;
const pairs = new Set();
const pairOf = (leaf) => {
const cup = String(leaf.cup).replace(/\s*women'?s\s*plus/i, '').trim();
return _svfReadBandCup(`${String(leaf.band).trim()}${cup}`, brandEntry);
};
const pairByItem = {};
leaves.filter((leaf) => leaf.band != null && leaf.cup != null).forEach((leaf) => {
const pair = pairOf(leaf);
if (!pair) return;
if (leaf.tcin) pairByItem[leaf.tcin] = pair;
if (!colour || leaf.colour === colour) pairs.add(pair);
});
return pairs.size ? { ok: true, madePairs: [...pairs].sort(), colour, pairByItem } : { ok: false, reason: 'no-pair-read' };
}
function readVariationHierarchySizes(hierarchy, page) {
if (!Array.isArray(hierarchy) || !hierarchy.length) return { ok: false, reason: 'no-hierarchy' };
const levelOf = (name) => {
const n = String(name || '').trim().toLowerCase();
return (n === 'color' || n === 'colour') ? 'colour' : n;
};
const leaves = [];
const walk = (nodes, trail) => (nodes || []).forEach((node) => {
if (!node || typeof node !== 'object') return;
const next = { ...trail, [levelOf(node.name)]: node.value };
if (Array.isArray(node.variation_hierarchy) && node.variation_hierarchy.length) walk(node.variation_hierarchy, next);
else leaves.push({ ...next, tcin: node.tcin == null ? null : String(node.tcin) });
});
walk(hierarchy, {});
const levels = new Set(leaves.flatMap((leaf) => Object.keys(leaf).filter((k) => k !== 'tcin')));
if (!levels.has('size') || [...levels].some((k) => k !== 'size' && k !== 'colour')) return { ok: false, reason: 'not-one-size-level' };
const pageId = page && page.pageId ? String(page.pageId) : null;
const own = pageId ? leaves.find((leaf) => leaf.tcin === pageId) : null;
const title = String((page && page.title) || '').toLowerCase();
const colours = [...new Set(leaves.map((leaf) => leaf.colour).filter(Boolean))];
const named = colours.filter((c) => title.includes(String(c).toLowerCase())).sort((a, b) => String(b).length - String(a).length);
const colour = (own && own.colour) || named[0] || (colours.length <= 1 ? (colours[0] || null) : null);
if (colours.length > 1 && !colour) return { ok: false, reason: 'colour-on-screen-unknown' };
const options = [];
const seen = new Set();
leaves.filter((leaf) => leaf.size != null && (!colour || leaf.colour === colour)).forEach((leaf) => {
const label = String(leaf.size).trim();
if (!label || seen.has(label)) return;
seen.add(label);
options.push({ label, itemId: leaf.tcin });
});
return options.length >= 2 ? { ok: true, colour, options } : { ok: false, reason: 'fewer-than-two-sizes' };
}
function pairsFromVariationTree(grid, read) {
if (!grid || grid.splitSelector !== true || grid.availablePairs != null) return { grid, applied: false, reason: 'the size grid is not a split band and cup selector without pairs' };
if (!read || !Array.isArray(read.madePairs) || !read.madePairs.length) return { grid, applied: false, reason: 'no combinations were read' };
const pairByItem = read.pairByItem || {};
const made = new Set(read.madePairs);
const soldOut = new Set(Array.isArray(grid.soldOutPairs) ? grid.soldOutPairs : []);
const shown = new Set();
(Array.isArray(grid.chipItems) ? grid.chipItems : []).forEach((chip) => {
const pair = chip && pairByItem[chip.itemId];
if (!pair) return;
if (chip.disabled) soldOut.add(pair);
else if (!chip.stockUnread) shown.add(pair);
});
soldOut.forEach((pair) => shown.delete(pair));
const availablePairs = read.madePairs.filter((pair) => !soldOut.has(pair));
const split = (pair) => /^(\d+)([A-Z]+)$/.exec(pair);
const bands = [...new Set(availablePairs.map((p) => Number(split(p)[1])))].sort((a, b) => a - b);
const cups = [...new Set(availablePairs.map((p) => split(p)[2]))];
const out = {
...grid,
availableBands: bands.length ? bands : grid.availableBands,
availableCups: cups.length ? cups : grid.availableCups,
availablePairs,
stockShownPairs: [...shown].filter((pair) => made.has(pair)).sort(),
};
if (soldOut.size) out.soldOutPairs = [...soldOut].sort();
return { grid: out, applied: true, reason: 'the combinations the listing makes, stock where a chip shows it' };
}
function restrictToMadePairs(grid, madePairs) {
if (!grid || grid.splitSelector !== true || grid.availablePairs != null) return { grid, applied: false, reason: 'the size grid is not a split band and cup selector without pairs' };
if (!Array.isArray(madePairs) || !madePairs.length) return { grid, applied: false, reason: 'no combinations were read' };
const made = new Set(madePairs);
const pairs = [];
const soldOut = new Set(Array.isArray(grid.soldOutPairs) ? grid.soldOutPairs : []);
(grid.availableBands || []).forEach((band) => (grid.availableCups || []).forEach((cup) => { if (made.has(`${band}${cup}`) && !soldOut.has(`${band}${cup}`)) pairs.push(`${band}${cup}`); }));
return { grid: { ...grid, availablePairs: pairs }, applied: true, reason: 'combinations the listing makes' };
}
function applyVariantFeedStockPairs(grid, feed, hostConfig) {
const unchanged = (reason) => ({ grid, applied: false, reason });
const takesPairsFromList = !!hostConfig && hostConfig.variantFeedStockPairs === true;
const pairsRequired = !!hostConfig && hostConfig.stockPairsRequired === true;
if (!takesPairsFromList && !pairsRequired) return unchanged('this store is not declared to take its stock pairs from its own list');
if (!grid || grid.splitSelector !== true || grid.availablePairs != null) return unchanged('the size grid is not a split band and cup selector without pairs');
const withoutPairs = (reason) => (pairsRequired
? { grid: { ...grid, pairsRequired: true, pairsListDeclared: takesPairsFromList }, applied: false, reason }
: unchanged(reason));
if (!takesPairsFromList) return withoutPairs('this store declares no list to take its stock pairs from');
if (!feed || !Array.isArray(feed.madePairs) || !Array.isArray(feed.soldOutPairs)) return withoutPairs('no variant list was read');
if (feed.variantsPerSize !== 1) return withoutPairs('a size has more than one variant (colours), so which is on screen cannot be told');
const inStock = feed.madePairs.filter((pair) => !feed.soldOutPairs.includes(pair));
if (!inStock.length && feed.emptyIsAnswer === true) {
return { grid: { ...grid, availablePairs: [], nothingInStock: true }, applied: true, reason: "the store's own answer has no size in stock" };
}
if (!inStock.length) return withoutPairs('the list has no size in stock');
return { grid: { ...grid, availablePairs: inStock }, applied: true, reason: 'in-stock pairs from the store list' };
}
function variantFeedFactFor(variantFeed, calculatedLabel) {
if (!variantFeed || !Array.isArray(variantFeed.madePairs) || !Array.isArray(variantFeed.soldOutPairs)) return null;
if (typeof calculatedLabel !== 'string' || !variantFeed.madePairs.length) return null;
if (!variantFeed.madePairs.includes(calculatedLabel)) return 'notMade';
if (variantFeed.soldOutPairs.includes(calculatedLabel)) return 'soldOut';
return null;
}
function variantFeedFactText(fact, shownLabel) {
if (fact === 'notMade') return `This style isn't made in ${shownLabel} here, so it won't come back in stock.`;
if (fact === 'soldOut') return `This style is made in ${shownLabel}, but the store's own product list shows it sold out right now.`;
return null;
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
SHOPIFY_FEED_TIMEOUT_MS,
SHOPIFY_FEED_MAX_TRUSTED_VARIANTS,
shopifyProductHandle,
isShopifyStorefront,
shopifyFeedPath,
readShopifyVariantFeed,
readShopifyColourStock,
readKeyedListedSizes,
readVariationHierarchyPairs,
readVariationHierarchySizes,
restrictToMadePairs,
pairsFromVariationTree,
readListingGroupStock,
readBandVariationStock,
readableSelectorCup,
gridMarksUnreadCupInStock,
readKeyedVariantStock,
applyVariantFeedStockPairs,
variantFeedFactFor,
variantFeedFactText,
};
}
/* src/sizeAvailability.js */
const _szFitEngine = (typeof module !== 'undefined' && module.exports) ? require('./fitEngine') : null;
const _szK = (typeof module !== 'undefined' && module.exports) ? require('./sizingConstants') : SIZING_CONSTANTS;
const _szCupLetters = _szFitEngine ? _szFitEngine.CUP_LETTERS : CUP_LETTERS;
const _szValidBands = _szFitEngine ? _szFitEngine.VALID_BANDS : VALID_BANDS;
const _szSubLadderBands = _szFitEngine ? _szFitEngine.SUB_LADDER_BANDS : SUB_LADDER_BANDS;
const _szBandIndex = (band) => ((_szValidBands.includes(band) || _szSubLadderBands.includes(band)) ? (band - _szValidBands[0]) / 2 : null);
const MAX_CANDIDATES = _szK.MAX_CANDIDATES;
const CATEGORY_ORDER = _szK.CATEGORY_ORDER;
const MAX_BAND_SUBSTITUTION_STEPS = _szK.MAX_BAND_SUBSTITUTION_STEPS;
function bandStepCost(bandDiff, cupDiff) {
return 2 * Math.abs(bandDiff) + Math.abs(bandDiff + cupDiff);
}
const MAX_SUBSTITUTE_INCHES = _szK.MAX_SUBSTITUTE_INCHES;
const MAX_SAME_BAND_CUP_STEPS = _szK.MAX_SAME_BAND_CUP_STEPS;
function substituteCost(candidate) {
return bandStepCost(candidate.bandDiff, candidate.cupDiff);
}
function cheapestInStock(inStock, lead) {
return inStock.reduce((keep, c) => {
if (substituteCost(c) !== substituteCost(keep)) return substituteCost(c) < substituteCost(keep) ? c : keep;
if (keep === lead) return keep;
return Math.abs(c.bandDiff) < Math.abs(keep.bandDiff) ? c : keep;
}, lead);
}
function isSisterRelation(relation) {
return relation === 'sister-size-up' || relation === 'sister-size-down';
}
function pastBandCap(candidate) {
if (!isSisterRelation(candidate.relation) || Math.abs(candidate.bandDiff) <= MAX_BAND_SUBSTITUTION_STEPS) return candidate;
const relation = 'nearest-available';
return { ...candidate, relation, note: noteForRelation(relation, candidate.cupDiff), confidence: rateCandidateConfidence(relation) };
}
function withoutDiffs({ bandDiff, cupDiff, ...candidate }) {
return candidate;
}
function categoryOf(relation) {
if (relation === 'sister-size-up' || relation === 'sister-size-down') return 'sister';
if (relation === 'same-band-larger-cup' || relation === 'same-band-smaller-cup') return 'same-band';
if (relation === 'band-up-same-cup' || relation === 'band-down-same-cup') return 'band-only';
return 'nearest';
}
function classifyRelation(bandDiff, cupDiff) {
if (bandDiff === 0 && cupDiff === 0) return 'exact';
if (bandDiff !== 0 && cupDiff === -bandDiff) return bandDiff > 0 ? 'sister-size-up' : 'sister-size-down';
if (bandDiff === 0 && cupDiff !== 0) return cupDiff > 0 ? 'same-band-larger-cup' : 'same-band-smaller-cup';
if (cupDiff === 0 && bandDiff !== 0) return bandDiff > 0 ? 'band-up-same-cup' : 'band-down-same-cup';
return 'nearest-available';
}
function rateCandidateConfidence(relation) {
if (relation === 'exact' || relation === 'sister-size-up' || relation === 'sister-size-down') return 'Good match';
if (relation === 'same-band-larger-cup' || relation === 'same-band-smaller-cup') return 'Likely fits';
return 'Uncertain, check size chart';
}
const RATING_LADDER = _szK.RATING_LADDER;
function substituteRatingCeiling(candidate, trueSize) {
if (!candidate || candidate.relation === 'exact') return null;
const sameBand = candidate.relation === 'same-band-larger-cup' || candidate.relation === 'same-band-smaller-cup';
const steps = (sameBand && trueSize && _szCupLetters.includes(trueSize.cup) && _szCupLetters.includes(candidate.cup))
? Math.abs(_szCupLetters.indexOf(candidate.cup) - _szCupLetters.indexOf(trueSize.cup))
: null;
return ratingCeiling(candidate.relation, steps);
}
function ratingCeiling(relation, steps, options) {
const { sisterCeiling = null, distanceCounts = false } = options || {};
if (relation === 'exact') return null;
const withinOne = steps === 1;
if (isSisterRelation(relation)) return (!distanceCounts || withinOne) ? sisterCeiling : 'Uncertain, check size chart';
if (relation === 'same-band-larger-cup' || relation === 'same-band-smaller-cup') return withinOne ? 'Likely fits' : 'Uncertain, check size chart';
if (relation === 'size-up' || relation === 'size-down') return (!distanceCounts || withinOne) ? 'Likely fits' : 'Uncertain, check size chart';
return 'Uncertain, check size chart';
}
function capRating(rating, ceiling, options) {
if (!ceiling) return rating;
const lowest = options && options.nonRating === 'lowest';
const rung = RATING_LADDER.indexOf(rating);
if (rung === -1) return lowest ? 'Uncertain, check size chart' : rating;
return RATING_LADDER.indexOf(ceiling) > rung ? ceiling : rating;
}
function ratingForSizeShown(ownRating, candidate, trueSize) {
return capRating(ownRating, substituteRatingCeiling(candidate, trueSize));
}
function substituteGap(candidate, trueSize) {
if (!candidate || candidate.relation === 'exact') return null;
if (candidate.relation === 'size-up' || candidate.relation === 'size-down') {
return (typeof candidate.distance === 'number' && candidate.distance > 0)
? { letterSteps: candidate.relation === 'size-up' ? candidate.distance : -candidate.distance }
: null;
}
if (!trueSize || typeof candidate.band !== 'number' || typeof trueSize.band !== 'number') return null;
const cupDiff = _szCupLetters.indexOf(candidate.cup) - _szCupLetters.indexOf(trueSize.cup);
if (!_szCupLetters.includes(candidate.cup) || !_szCupLetters.includes(trueSize.cup)) return null;
const bandDiff = (candidate.band - trueSize.band) / 2;
return { bandDiff, cupDiff, volumeDiff: bandDiff + cupDiff };
}
function noteForRelation(relation, cupDiff) {
const steps = Math.abs(cupDiff);
const word = steps === 1 ? 'letter' : 'letters';
switch (relation) {
case 'exact':
return '';
case 'sister-size-up':
return 'True sister size: same cup volume, bigger band. Cup letters are sized relative to the band, so the cup holds the same.';
case 'sister-size-down':
return 'True sister size: same cup volume, smaller band. Cup letters are sized relative to the band, so the cup holds the same.';
case 'same-band-larger-cup':
return `Same band as your size, ${steps} cup ${word} up. The band does most of the supporting, and it stays as calculated.`;
case 'same-band-smaller-cup':
return `Same band as your size, ${steps} cup ${word} down. The band does most of the supporting, and it stays as calculated.`;
case 'band-up-same-cup':
return 'Same cup letter, bigger band, the closest this item comes to your size. Will run looser around the ribcage.';
case 'band-down-same-cup':
return 'Same cup letter, smaller band, the closest this item comes to your size. Will run tighter around the ribcage.';
default:
return 'Closest available size, not a true sister size. Expect a different fit.';
}
}
function withLabel(node) {
return { ...node, label: `${node.band}${node.cup}` };
}
function findAvailableSize(styleAdjustedSize, grid) {
const result = findAvailableReadableSize(styleAdjustedSize, grid);
if (result.status === 'exact' || result.nothingInStock) return result;
const unread = unreadCupsNearSize(styleAdjustedSize, grid && grid.cupRow);
return unread ? { ...result, unreadNearSize: unread } : result;
}
function unreadCupsNearSize(size, cupRow) {
if (!size || !Array.isArray(cupRow) || !cupRow.length) return null;
const herIndex = _szCupLetters.indexOf(size.cup);
if (herIndex === -1) return null;
const read = cupRow.filter((entry) => entry && entry.ours).map((entry) => _szCupLetters.indexOf(entry.ours));
if (read.includes(herIndex)) return null;
if (!read.some((index) => index !== -1 && index < herIndex)) return null;
const found = cupRow.filter((entry) => entry && entry.printed && entry.inStock).map((entry) => entry.printed);
return found.length ? found : null;
}
function findAvailableReadableSize(styleAdjustedSize, grid) {
const trueSize = withLabel(styleAdjustedSize);
if (grid && grid.nothingInStock === true && Array.isArray(grid.availablePairs) && !grid.availablePairs.length) {
return {
status: 'out-of-range',
trueSize,
candidates: [],
note: "Nothing on this listing is in stock right now, in the colour shown.",
nothingInStock: true,
};
}
const _pairList = (grid && Array.isArray(grid.availablePairs)) ? grid.availablePairs.map((p) => /^(\d+)([A-Z]+)$/.exec(String(p))).filter(Boolean) : [];
const cleanGrid = {
availableBands: [...new Set([...((grid && grid.availableBands) || []), ..._pairList.map((m) => Number(m[1]))])].filter((b) => _szBandIndex(b) !== null),
availableCups: [...new Set([...((grid && grid.availableCups) || []), ..._pairList.map((m) => m[2])])].filter((c) => _szCupLetters.includes(c)),
};
const pageOffers = !!grid && ((Array.isArray(grid.offeredPairs) && grid.offeredPairs.length > 0) || (Array.isArray(grid.offeredBands) && grid.offeredBands.length > 0) || (Array.isArray(grid.soldOutPairs) && grid.soldOutPairs.length > 0));
const nothingShownInStock = { status: 'out-of-range', trueSize, candidates: [], note: 'No size on this listing is shown in stock in the colour shown.', nothingInStock: true, nothingInStockFrom: 'page' };
if (cleanGrid.availableBands.length === 0 || cleanGrid.availableCups.length === 0) {
if (pageOffers) return nothingShownInStock;
return {
status: 'out-of-range',
trueSize,
candidates: [],
note: "This retailer's available sizes for this item couldn't be read.",
};
}
if (!sizeGridPairsReadable(grid)) {
throw new TypeError(grid.availablePairs == null
? "findAvailableSize: this grid's host requires its in-stock pairs and none were read, so which band and cup combinations are in stock is unknown"
: "findAvailableSize: grid.availablePairs is present but is not a list of pairs, so which band and cup combinations are in stock is unknown");
}
const availablePairs = (grid && grid.availablePairs != null) ? new Set(grid.availablePairs) : null;
const soldOutPairs = new Set((grid && Array.isArray(grid.soldOutPairs)) ? grid.soldOutPairs : []);
const trueBandIndex = _szBandIndex(trueSize.band) === null ? -1 : _szBandIndex(trueSize.band);
const trueCupIndex = _szCupLetters.indexOf(trueSize.cup);
let exactMatch = null;
const bestByCategory = {};
const inStock = [];
for (const band of cleanGrid.availableBands) {
const bandDiff = _szBandIndex(band) - trueBandIndex;
for (const cup of cleanGrid.availableCups) {
if (availablePairs && !availablePairs.has(`${band}${cup}`)) continue;
if (soldOutPairs.has(`${band}${cup}`)) continue;
const cupDiff = _szCupLetters.indexOf(cup) - trueCupIndex;
const distance = Math.abs(bandDiff) + Math.abs(cupDiff);
if (distance === 0) {
exactMatch = { band, cup, label: `${band}${cup}`, relation: 'exact', distance: 0, note: '', confidence: 'Good match' };
continue;
}
const relation = classifyRelation(bandDiff, cupDiff);
const category = categoryOf(relation);
const candidate = {
band,
cup,
label: `${band}${cup}`,
relation,
distance,
note: noteForRelation(relation, cupDiff),
confidence: rateCandidateConfidence(relation),
bandDiff,
cupDiff,
};
inStock.push(candidate);
if (!bestByCategory[category] || distance < bestByCategory[category].distance) {
bestByCategory[category] = candidate;
}
}
}
if (exactMatch) {
const alternates = CATEGORY_ORDER
.map((cat) => bestByCategory[cat])
.filter(Boolean)
.filter((c) => substituteCost(c) <= MAX_SUBSTITUTE_INCHES)
.slice(0, MAX_CANDIDATES - 1)
.map((c) => withoutDiffs(pastBandCap(c)));
return { status: 'exact', trueSize, candidates: [exactMatch, ...alternates], note: '' };
}
const ranked = CATEGORY_ORDER.map((cat) => bestByCategory[cat]).filter(Boolean);
if (!ranked.length) {
if (pageOffers || (availablePairs && availablePairs.size === 0)) return nothingShownInStock;
return {
status: 'out-of-range',
trueSize,
candidates: [],
note: "This retailer's available sizes for this item couldn't be matched to a specific size.",
};
}
if (Math.abs(ranked[0].bandDiff) > MAX_BAND_SUBSTITUTION_STEPS) {
const lead = ranked[0];
const closest = cheapestInStock(inStock, lead);
if (closest !== lead) {
const at = ranked.indexOf(closest);
if (at !== -1) ranked.splice(at, 1);
ranked.unshift(closest);
}
}
const refusal = (closest) => ({
status: 'out-of-range',
trueSize,
candidates: [],
note: "Your size isn't in stock here, and no size close enough to recommend is.",
nearestBeyondReach: {
targetLabel: trueSize.label,
band: closest.band,
cup: closest.cup,
label: closest.label,
bandDiff: closest.bandDiff,
volumeDiff: closest.bandDiff + closest.cupDiff,
inches: substituteCost(closest),
},
});
if (substituteCost(ranked[0]) > MAX_SUBSTITUTE_INCHES) {
const closest = cheapestInStock(inStock, ranked[0]);
if (substituteCost(closest) > MAX_SUBSTITUTE_INCHES) return refusal(closest);
const at = ranked.indexOf(closest);
if (at !== -1) ranked.splice(at, 1);
ranked.unshift(closest);
}
if (ranked[0].bandDiff === 0 && Math.abs(ranked[0].cupDiff) > MAX_SAME_BAND_CUP_STEPS) {
return refusal(cheapestInStock(inStock, ranked[0]));
}
if (ranked[0].bandDiff !== 0
&& !(isSisterRelation(ranked[0].relation) && Math.abs(ranked[0].bandDiff) <= MAX_BAND_SUBSTITUTION_STEPS)) {
return refusal(cheapestInStock(inStock, ranked[0]));
}
const candidates = [ranked[0], ...ranked.slice(1).filter((c) => substituteCost(c) <= MAX_SUBSTITUTE_INCHES)]
.slice(0, MAX_CANDIDATES).map((c) => withoutDiffs(pastBandCap(c)));
const best = candidates[0];
const status = isSisterRelation(best.relation) ? 'substituted' : 'approximate';
const note = status === 'approximate'
? "This item doesn't have your calculated size or a true sister size available. Closest available option shown, but fit will differ more than a sister-size substitution would."
: '';
return { status, trueSize, candidates, note };
}
function withStockShown(gridResult, grid) {
if (!gridResult || !grid || !Array.isArray(grid.stockShownPairs)) return gridResult;
const shown = new Set(grid.stockShownPairs);
const top = gridResult.candidates && gridResult.candidates[0];
if (top && !shown.has(`${top.band}${top.cup}`) && top.relation !== 'exact' && gridResult.trueSize) {
const t = gridResult.trueSize;
const within = (c) => {
const bandDiff = (c.band - t.band) / 2;
const cupDiff = _szCupLetters.indexOf(c.cup) - _szCupLetters.indexOf(t.cup);
return (bandDiff === 0 && Math.abs(cupDiff) === MAX_SAME_BAND_CUP_STEPS) || (Math.abs(bandDiff) === MAX_BAND_SUBSTITUTION_STEPS && cupDiff === -bandDiff);
};
let confirmed = gridResult.candidates.find((c) => c !== top && shown.has(`${c.band}${c.cup}`) && within(c));
if (!confirmed && Array.isArray(grid.availablePairs)) {
const offered = new Set(grid.availablePairs);
const found = grid.stockShownPairs
.map((pair) => /^(\d+)([A-Z]+)$/.exec(pair))
.filter((m) => m && offered.has(m[0]) && _szCupLetters.indexOf(m[2]) !== -1)
.map((m) => ({ band: Number(m[1]), cup: m[2] }))
.filter((c) => !(c.band === top.band && c.cup === top.cup) && within(c))
.map((c) => {
const bandDiff = (c.band - t.band) / 2;
const cupDiff = _szCupLetters.indexOf(c.cup) - _szCupLetters.indexOf(t.cup);
const relation = classifyRelation(bandDiff, cupDiff);
return { band: c.band, cup: c.cup, label: `${c.band}${c.cup}`, relation, distance: Math.abs(bandDiff) + Math.abs(cupDiff), note: noteForRelation(relation, cupDiff), confidence: rateCandidateConfidence(relation) };
})
.sort((a, b) => CATEGORY_ORDER.indexOf(categoryOf(a.relation)) - CATEGORY_ORDER.indexOf(categoryOf(b.relation)) || a.distance - b.distance || a.band - b.band);
if (found.length) confirmed = found[0];
}
if (confirmed) {
const candidates = [confirmed, ...gridResult.candidates.filter((c) => c !== confirmed)];
return { ...gridResult, status: isSisterRelation(confirmed.relation) ? 'substituted' : 'approximate', candidates };
}
}
if (top) return shown.has(`${top.band}${top.cup}`) ? gridResult : { ...gridResult, stockUnconfirmed: `${top.band}${top.cup}` };
const near = gridResult.nearestBeyondReach;
if (!near || typeof near.band !== 'number' || shown.has(near.label)) return gridResult;
const { nearestBeyondReach, ...rest } = gridResult;
const pairs = grid.stockShownPairs.filter((pair) => /^\d+[A-Z]+$/.test(pair));
if (!pairs.length || !gridResult.trueSize) return rest;
const split = (pair) => /^(\d+)([A-Z]+)$/.exec(pair);
const again = findAvailableReadableSize({ band: gridResult.trueSize.band, cup: gridResult.trueSize.cup }, {
availableBands: [...new Set(pairs.map((p) => Number(split(p)[1])))],
availableCups: [...new Set(pairs.map((p) => split(p)[2]))],
availablePairs: pairs,
});
return again.nearestBeyondReach ? { ...rest, nearestBeyondReach: again.nearestBeyondReach } : rest;
}
function otherColourAvailability(otherColours, size, offeredHere) {
if (!otherColours || !Array.isArray(otherColours.colours) || !size || !size.label) return null;
const bandCup = typeof size.band === 'number' && !!size.cup;
const stockOf = (c) => (bandCup ? c.pairs : c.labels);
const colours = otherColours.colours.filter((c) => Array.isArray(stockOf(c)) && stockOf(c).length);
if (!colours.length) return null;
const key = bandCup ? `${size.band}${size.cup}` : size.label;
const own = colours.filter((c) => stockOf(c).includes(key)).map((c) => c.colour);
if (own.length) return { own: true, band: bandCup ? size.band : null, cup: bandCup ? size.cup : null, label: key, colours: own };
if (offeredHere) return null;
const all = [...new Set(colours.flatMap(stockOf))];
let top = null;
if (bandCup) {
const pairs = all.map((p) => /^(\d+)([A-Z]+)$/.exec(p)).filter(Boolean);
if (!pairs.length) return null;
const result = findAvailableSize({ band: size.band, cup: size.cup }, {
availableBands: [...new Set(pairs.map((m) => Number(m[1])))],
availableCups: [...new Set(pairs.map((m) => m[2]))],
availablePairs: pairs.map((m) => m[0]),
});
top = result.candidates && result.candidates[0];
} else {
const alpha = (typeof module !== 'undefined' && module.exports) ? _szAlphaLazyModule().findAvailableAlphaSize : findAvailableAlphaSize;
const result = alpha(size.label, { availableLabels: all });
top = result.candidates && result.candidates[0];
}
if (!top || top.relation === 'exact') return null;
const label = bandCup ? `${top.band}${top.cup}` : top.label;
return { own: false, band: bandCup ? top.band : null, cup: bandCup ? top.cup : null, label, colours: colours.filter((c) => stockOf(c).includes(label)).map((c) => c.colour) };
}
function selectAlternateCandidates(gridResult, isNearBoundary, headlineLabel, baseLabel) {
if (!isNearBoundary) return [];
if (!gridResult || !gridResult.candidates || !gridResult.candidates.length) return [];
const sister = gridResult.candidates.find((c) => c.relation === 'sister-size-up' || c.relation === 'sister-size-down');
const sameBand = gridResult.candidates.find((c) => c.relation === 'same-band-larger-cup' || c.relation === 'same-band-smaller-cup');
return [sister, sameBand]
.filter(Boolean)
.filter((c) => c.label !== headlineLabel && c.label !== baseLabel);
}
function gridMatchConfidence(gridResult) {
const top = gridResult && gridResult.candidates && gridResult.candidates[0];
return top ? top.confidence : null;
}
function sizeGridPairsReadable(grid) {
if (!grid) return true;
if (grid.availablePairs == null) return grid.pairsRequired !== true;
const pairs = grid.availablePairs;
if (pairs instanceof Set) return true;
return Array.isArray(pairs) && pairs.every((pair) => typeof pair === 'string');
}
function findUnmadeListingSize(styleAdjustedSize, listedSizes, brandEntry) {
if (!styleAdjustedSize || !_szValidBands.includes(styleAdjustedSize.band) || !_szCupLetters.includes(styleAdjustedSize.cup)) return null;
if (!Array.isArray(listedSizes) || !listedSizes.length) return null;
if (!brandEntry || brandEntry.cup_ladder) return null;
const range = Array.isArray(brandEntry.cup_range) ? brandEntry.cup_range.map((cup) => _szCupLetters.indexOf(cup)) : [];
const cupIndex = _szCupLetters.indexOf(styleAdjustedSize.cup);
if (range.length !== 2 || range[0] < 0 || range[1] < 0 || cupIndex < range[0] || cupIndex > range[1]) return null;
const listed = listedSizes.filter((size) => typeof size === 'string').map((size) => size.replace(/\s+/g, '').toUpperCase());
const readable = listed.filter((size) => {
const match = /^(\d{2})([A-Z]+)$/.exec(size);
return !!match && _szValidBands.includes(Number(match[1])) && _szCupLetters.includes(match[2]);
});
if (!readable.length) return null;
const trueSize = withLabel(styleAdjustedSize);
if (listed.includes(trueSize.label)) return null;
return {
status: 'out-of-range',
trueSize,
candidates: [],
note: "This listing's own product data lists every size it is made in, and this size isn't one of them.",
notMade: true,
};
}
function halfCupSizeFor(measurements, size, variantFeed) {
const made = variantFeed && Array.isArray(variantFeed.madeHalfPairs) ? variantFeed.madeHalfPairs : null;
if (!made || !made.length || !size || typeof size.band !== 'number' || typeof size.cup !== 'string') return null;
const underbust = Number(measurements && measurements.underbust);
const bust = Number(measurements && measurements.bust);
if (!Number.isFinite(underbust) || !Number.isFinite(bust)) return null;
const halves = (_szFitEngine ? _szFitEngine.roundHalfUp : roundHalfUp)((bust - (underbust + size.band) / 2) * 2);
if (halves % 2 === 0) return null;
const lower = (halves - 1) / 2;
if (lower < 0 || lower + 1 >= _szCupLetters.length) return null;
const whole = _szCupLetters.indexOf(size.cup);
if (whole !== lower && whole !== lower + 1) return null;
const label = `${size.band}${_szCupLetters[lower]}½`;
if (!made.includes(label)) return null;
const soldOut = Array.isArray(variantFeed.soldOutHalfPairs) && variantFeed.soldOutHalfPairs.includes(label);
const inStock = soldOut ? false : (variantFeed.halfVariantsPerSize === 1 ? true : null);
return { label, band: size.band, cup: _szCupLetters[lower], upperCup: _szCupLetters[lower + 1], inStock };
}
function halfCupShown(measurements, size, variantFeed) {
const half = halfCupSizeFor(measurements, size, variantFeed);
return (half && half.inStock === true) ? half : null;
}
function bandOnlyStock(size, bandOnly) {
if (!size || !bandOnly) return null;
const at = _szBandIndex(size.band);
const cup = _szCupLetters.indexOf(size.cup);
if (at === null || cup === -1) return null;
const pairFor = (band) => {
const b = _szBandIndex(band);
if (b === null) return null;
const i = cup - (b - at);
return (i >= 0 && i < _szCupLetters.length) ? `${band}${_szCupLetters[i]}` : null;
};
const pairsOf = (bands) => [...new Set((bands || []).map(pairFor).filter(Boolean))];
const availablePairs = pairsOf(bandOnly.availableBands);
const grid = {
availableBands: [...new Set(availablePairs.map((p) => Number(/^\d+/.exec(p)[0])))],
availableCups: [...new Set(availablePairs.map((p) => p.replace(/^\d+/, '')))],
availablePairs,
offeredPairs: pairsOf(bandOnly.offeredBands),
};
const printedLabels = {};
grid.offeredPairs.forEach((pair) => {
const band = /^\d+/.exec(pair)[0];
printedLabels[pair] = (bandOnly.printedLabels && bandOnly.printedLabels[band]) || band;
});
const result = findAvailableReadableSize({ band: size.band, cup: size.cup }, grid);
const near = result.nearestBeyondReach ? { nearestBeyondReach: { ...result.nearestBeyondReach, bandOnly: true } } : {};
return { ...result, ...near, bandOnly: true, printedLabels, soldHere: grid.offeredPairs.includes(`${size.band}${size.cup}`) };
}
const _szRangeLetter = '(AA|A|B|C|DDD|DD|D|G|H|I|J|K)';
const _szRangeJoin = '\\s*(?:-|\\u2013|to|through|thru)\\s*';
const _szCupRangeRes = [
new RegExp(`(?:[Cc]up [Ss]izes?|[Cc]ups?)\\s*(?:from\\s*)?${_szRangeLetter}${_szRangeJoin}${_szRangeLetter}(?![A-Za-z])`, 'g'),
new RegExp(`(?<![A-Za-z0-9])${_szRangeLetter}${_szRangeJoin}${_szRangeLetter}\\s*[Cc]ups?\\b`, 'g'),
];
function readListingCupRange(text) {
if (typeof text !== 'string' || !text) return null;
const found = new Set();
_szCupRangeRes.forEach((re) => {
re.lastIndex = 0;
let m;
while ((m = re.exec(text))) {
const from = _szCupLetters.indexOf(m[1]);
const to = _szCupLetters.indexOf(m[2]);
if (from !== -1 && to !== -1 && from < to) found.add(`${m[1]}-${m[2]}`);
}
});
if (found.size !== 1) return null;
const [from, to] = [...found][0].split('-');
return { from, to, cups: _szCupLetters.slice(_szCupLetters.indexOf(from), _szCupLetters.indexOf(to) + 1) };
}
let _szAlphaLazy = null;
const _szAlphaLazyModule = () => (_szAlphaLazy || (_szAlphaLazy = require('./alphaSizeAvailability')));
if (typeof module !== 'undefined' && module.exports) {
module.exports = { bandOnlyStock, readListingCupRange, withStockShown, halfCupSizeFor, halfCupShown, findAvailableSize, findUnmadeListingSize, unreadCupsNearSize, MAX_BAND_SUBSTITUTION_STEPS, MAX_SUBSTITUTE_INCHES, MAX_SAME_BAND_CUP_STEPS, bandStepCost, cheapestInStock, sizeGridPairsReadable, classifyRelation, rateCandidateConfidence, substituteRatingCeiling, ratingCeiling, capRating, ratingForSizeShown, substituteGap, otherColourAvailability, RATING_LADDER, noteForRelation, selectAlternateCandidates, gridMatchConfidence };
}
/* src/alphaSizeAvailability.js */
const _asaK = (typeof module !== 'undefined' && module.exports) ? require('./sizingConstants') : SIZING_CONSTANTS;
const ALPHA_SIZE_ORDER = _asaK.ALPHA_SIZE_ORDER;
const PLUS_SIZE_ORDER = _asaK.PLUS_SIZE_ORDER;
const _asaLabelReader = (typeof module !== 'undefined' && module.exports) ? require('./sizeLabelReader') : null;
const _asaReadSizeLabel = _asaLabelReader ? _asaLabelReader.readSizeLabel : readSizeLabel;
const MAX_ALPHA_SUBSTITUTION_DISTANCE = _asaK.MAX_ALPHA_SUBSTITUTION_DISTANCE;
function alphaSizeIndex(label) {
return ALPHA_SIZE_ORDER.indexOf((label || '').trim().toUpperCase());
}
function pairedLabelHolding(targetLabel, grid) {
const target = (targetLabel || '').trim().toUpperCase();
const targetIndex = alphaSizeIndex(target);
if (targetIndex === -1) return null;
const offered = offeredAlphaLabels(grid);
if (offered.includes(target)) return null;
const holding = offered.filter((label) => {
const pair = adjacentLetterPair(label);
return !!pair && (pair[0] === targetIndex || pair[1] === targetIndex);
});
return holding.length === 1 ? holding[0] : null;
}
function offeredAlphaLabels(grid) {
return ((grid && (grid.offeredLabels || grid.availableLabels)) || []).map((l) => String(l).trim().toUpperCase());
}
function adjacentLetterPair(label) {
const read = _asaReadSizeLabel(label);
if (read.system !== 'letter_pair' || read.letters.length !== 2 || read.letterSpelling !== 'abbreviation'
|| read.noise.length || read.also || !/\//.test(read.text)) return null;
const low = alphaSizeIndex(read.letters[0]);
const high = alphaSizeIndex(read.letters[1]);
return low !== -1 && high === low + 1 ? [low, high] : null;
}
function nearbyRowsOnPairedGrid(rows, grid, ownLabel) {
const offered = offeredAlphaLabels(grid);
if (!offered.some((label) => adjacentLetterPair(label))) return rows || [];
const own = (ownLabel || '').trim().toUpperCase();
const seen = new Set([pairedLabelHolding(own, grid) || own]);
const kept = [];
(rows || []).forEach((row) => {
const label = String(row.label || '').trim().toUpperCase();
const soldAs = offered.includes(label) ? label : pairedLabelHolding(label, grid);
if (!soldAs || seen.has(soldAs)) return;
seen.add(soldAs);
kept.push({ ...row, label: soldAs });
});
return kept;
}
const _asaSameLetter = { '3XL': 'XXXL', '2XL': 'XXL', '2XS': 'XXS' };
const _asaCanonLetter = (label) => { const upper = String(label || '').trim().toUpperCase(); return _asaSameLetter[upper] || upper; };
function closestInStockByOrder(offered, available, target) {
const placed = closestInStockPlaced(offered, available, target);
return placed ? placed.label : null;
}
function closestInStockPlaced(offered, available, target, named) {
const list = (offered || []).map(String);
const stock = (available || []).map(String);
if (!list.length || !stock.length || !target) return null;
const same = (a, b) => _asaCanonLetter(a) === _asaCanonLetter(b);
const lettersOf = (label) => String(label).toUpperCase().split('/')
.map((part) => _asaCanonLetter(part.trim().split(/[-\s(]/)[0].replace(/\+$/, '')))
.filter(Boolean);
const ladderAt = (label) => {
const at = lettersOf(label).map((l) => ALPHA_SIZE_ORDER.indexOf(l)).filter((i) => i !== -1);
return at.length ? at.reduce((a, b) => a + b, 0) / at.length : null;
};
let at = list.findIndex((o) => same(o, target));
let half = 0;
if (at === -1) {
const wanted = lettersOf(target)[0];
at = wanted ? list.findIndex((o) => lettersOf(o).includes(wanted)) : -1;
if (at !== -1 && /\+$/.test(String(target).trim()) && !/\+$/.test(list[at])) half = 0.5;
}
if (at === -1) {
const place = ladderAt(target);
if (place != null) {
let bestDistance = Infinity;
list.forEach((o, i) => {
const p = ladderAt(o);
if (p == null) return;
const d = Math.abs(p - place);
if (d < bestDistance || (d === bestDistance && i > at)) { bestDistance = d; at = i; }
});
}
}
if (at === -1) return null;
const from = at + half;
const stocked = list.map((o, i) => ({ o, i })).filter(({ o }) => stock.some((a) => same(a, o)));
if (!stocked.length) return null;
stocked.sort((x, y) => (Math.abs(x.i - from) - Math.abs(y.i - from)) || (y.i - x.i));
const pick = named ? stocked.find(({ o }) => same(o, named)) : stocked[0];
if (!pick) return null;
return { label: pick.o, distance: Math.max(1, Math.ceil(Math.abs(pick.i - from))), relation: pick.i < from ? 'size-down' : 'size-up' };
}
const JOINED_AT_XL_ORDER = ALPHA_SIZE_ORDER.slice(0, ALPHA_SIZE_ORDER.indexOf('XL') + 1).concat(PLUS_SIZE_ORDER);
function listingRunJoinsAtXl(grid) {
const offered = offeredAlphaLabels(grid);
return offered.includes('XL') && offered.includes('1X') && !offered.some((l) => ['XXL', 'XXXL', '2XL', '3XL', '4XL'].includes(l));
}
function letterPlace(label, grid) {
const joined = !!grid && listingRunJoinsAtXl(grid);
const pair = adjacentLetterPair(label);
if (pair) return { order: joined ? JOINED_AT_XL_ORDER : ALPHA_SIZE_ORDER, at: (pair[0] + pair[1]) / 2, holds: pair };
const letter = _asaCanonLetter(label);
const orders = [...(joined ? [JOINED_AT_XL_ORDER] : []), ALPHA_SIZE_ORDER, PLUS_SIZE_ORDER];
for (const order of orders) {
const at = order.indexOf(letter);
if (at !== -1) return { order, at, holds: [at, at] };
}
return null;
}
function findAvailableAlphaSize(targetLabel, grid) {
const printedTarget = (targetLabel || '').trim().toUpperCase();
if (_asaSameLetter[printedTarget]) targetLabel = _asaSameLetter[printedTarget];
const available = (grid && grid.availableLabels) || [];
const pair = pairedLabelHolding(targetLabel, grid);
if (pair) {
if (available.includes(pair)) {
return { status: 'exact', candidates: [{ label: pair, relation: 'exact', distance: 0, confidence: 'Good match', note: `Your ${targetLabel.trim().toUpperCase()} is sold here as ${pair}.` }], note: '', soldAsPair: pair, pairedFrom: targetLabel.trim().toUpperCase() };
}
return { status: 'out-of-range', candidates: [], note: `Your ${targetLabel.trim().toUpperCase()} is sold here as ${pair}, which isn't in stock.`, soldAsPair: pair, pairedFrom: targetLabel.trim().toUpperCase() };
}
const upperTarget = (targetLabel || '').trim().toUpperCase();
const targetAt = alphaSizeIndex(upperTarget);
const offeredHere = offeredAlphaLabels(grid);
const overlapping = (targetAt === -1 || offeredHere.includes(upperTarget)) ? [] : offeredHere.filter((label) => {
const held = adjacentLetterPair(label);
return !!held && (held[0] === targetAt || held[1] === targetAt);
}).sort((a, b) => adjacentLetterPair(a)[0] - adjacentLetterPair(b)[0]);
if (overlapping.length === 2) {
const inStock = overlapping.filter((label) => available.map((l) => String(l).trim().toUpperCase()).includes(label));
const both = `${overlapping[0]} and ${overlapping[1]}`;
if (!inStock.length) {
const placedOverlap = closestInStockPlaced(offeredHere, available, overlapping[1]);
return { status: 'out-of-range', candidates: [], note: `Your ${upperTarget} is sold here as ${both}, and neither is in stock.`, soldAsPair: overlapping[1], soldInPairs: overlapping, pairedFrom: upperTarget, ...(placedOverlap ? { closestInStockLabel: placedOverlap.label, closestInStockNamed: placedOverlap } : {}) };
}
const pick = inStock[inStock.length - 1];
const other = overlapping.find((label) => label !== pick);
const note = inStock.length === 2
? `Your ${upperTarget} is sold here as both ${both}; ${pick}, the larger, is shown, and ${other} may suit you as well.`
: `Your ${upperTarget} is sold here as ${both}; ${pick} is the one in stock.`;
return {
status: 'exact',
candidates: [{ label: pick, relation: 'exact', distance: 0, confidence: inStock.length === 2 ? 'Likely fits' : 'Good match', note }],
note: '',
soldAsPair: pick,
soldInPairs: overlapping,
pairedFrom: upperTarget,
bothInStock: inStock.length === 2,
};
}
if (available.length === 0 && offeredAlphaLabels(grid).length) {
return { status: 'out-of-range', candidates: [], note: 'No size on this listing is shown in stock.', nothingInStock: true, nothingInStockFrom: 'page' };
}
if (available.length === 0) {
return { status: 'out-of-range', candidates: [], note: "This retailer's available sizes for this item couldn't be read." };
}
const sameLabel = (a, b) => _asaCanonLetter(a) === _asaCanonLetter(b);
if (available.some((label) => sameLabel(label, targetLabel))) {
return { status: 'exact', candidates: [{ label: targetLabel, relation: 'exact', distance: 0, confidence: 'Good match', note: '' }], note: '' };
}
const joined = listingRunJoinsAtXl(grid) && JOINED_AT_XL_ORDER.includes((_asaSameLetter[printedTarget] || printedTarget));
const inRun = (label) => {
const upper = _asaCanonLetter(label);
if (joined && JOINED_AT_XL_ORDER.includes(upper)) return { order: JOINED_AT_XL_ORDER, index: JOINED_AT_XL_ORDER.indexOf(upper) };
if (ALPHA_SIZE_ORDER.includes(upper)) return { order: ALPHA_SIZE_ORDER, index: ALPHA_SIZE_ORDER.indexOf(upper) };
if (PLUS_SIZE_ORDER.includes(upper)) return { order: PLUS_SIZE_ORDER, index: PLUS_SIZE_ORDER.indexOf(upper) };
return null;
};
const offered = offeredAlphaLabels(grid);
const soldOutHere = (label) => offered.find((o) => sameLabel(o, label)) || null;
const named = (placed) => (placed ? { closestInStockLabel: placed.label, closestInStockNamed: placed } : {});
const notCarried = () => ({
status: 'out-of-range', candidates: [], note: "This retailer doesn't carry your calculated size.",
...named(closestInStockPlaced(offered, available, printedTarget || targetLabel)),
});
const soldOutResult = (soldOut) => ({
status: 'out-of-range', candidates: [], note: "Your size is sold here and isn't in stock.", soldOutHere: soldOut,
...named(closestInStockPlaced(offered, available, soldOut)),
});
const target = inRun(targetLabel);
if (!target) {
const soldOut = soldOutHere(printedTarget) || soldOutHere((targetLabel || '').trim().toUpperCase());
if (soldOut) return soldOutResult(soldOut);
return notCarried();
}
const targetIndex = target.index;
const ranked = available
.map((label) => ({ label, run: inRun(label) }))
.filter((entry) => entry.run && entry.run.order === target.order)
.map((entry) => ({ label: entry.label, index: entry.run.index, distance: Math.abs(entry.run.index - targetIndex) }))
.sort((a, b) => a.distance - b.distance);
if (!ranked.length) {
const soldOut = soldOutHere((targetLabel || '').trim().toUpperCase()) || soldOutHere(printedTarget);
if (soldOut) return soldOutResult(soldOut);
return notCarried();
}
const withinReach = ranked.filter((entry) => entry.distance <= MAX_ALPHA_SUBSTITUTION_DISTANCE);
if (!withinReach.length) {
const nearest = ranked[0];
return {
status: 'out-of-range',
candidates: [],
note: "Your size isn't in stock here, and no size close enough to recommend is.",
nearestBeyondReach: {
targetLabel,
label: nearest.label,
distance: nearest.distance,
relation: nearest.index > targetIndex ? 'size-up' : 'size-down',
},
};
}
const candidates = withinReach.slice(0, _asaK.MAX_CANDIDATES).map((entry) => ({
label: entry.label,
relation: entry.index > targetIndex ? 'size-up' : 'size-down',
distance: entry.distance,
confidence: 'Likely fits',
note: entry.index > targetIndex
? `One size up from your calculated ${targetLabel}.`
: `One size down from your calculated ${targetLabel}.`,
}));
return {
status: 'approximate',
candidates,
note: "Your exact size isn't offered here. Closest available size shown instead.",
};
}
function adjacentAlphaSizes(label, availableLabels, grid) {
const own = _asaCanonLetter(label);
const joinedRun = !!grid && listingRunJoinsAtXl(grid) && JOINED_AT_XL_ORDER.includes(own);
const order = joinedRun ? JOINED_AT_XL_ORDER : (ALPHA_SIZE_ORDER.includes(own) ? ALPHA_SIZE_ORDER : (PLUS_SIZE_ORDER.includes(own) ? PLUS_SIZE_ORDER : null));
if (!order) return [];
const at = order.indexOf(own);
const byCanon = new Map();
(availableLabels || []).forEach((l) => { const c = _asaCanonLetter(l); if (c && order.includes(c) && !byCanon.has(c)) byCanon.set(c, String(l).trim()); });
const rows = [];
if (order[at + 1] && byCanon.has(order[at + 1])) rows.push({ label: byCanon.get(order[at + 1]), relation: 'size-up' });
if (at > 0 && byCanon.has(order[at - 1])) rows.push({ label: byCanon.get(order[at - 1]), relation: 'size-down' });
return rows;
}
function _asaListedCells(alphaGrid, letters) {
const listed = (alphaGrid && alphaGrid.listedSizes) || {};
const cupLetters = (typeof module !== 'undefined' && module.exports) ? require('./fitEngine').CUP_LETTERS : CUP_LETTERS;
const vocab = (letters && letters.vocabulary) || null;
const lettering = letters && letters.decidedBy ? letters : null;
const ladder = vocab ? vocab.theirs : cupLetters;
const ours = (printed) => {
const at = ladder.indexOf(String(printed || '').toUpperCase());
if (at === -1) return null;
return vocab ? vocab.ours[at] : ladder[at];
};
const cells = {};
Object.keys(listed).forEach((token) => {
const out = [];
(listed[token] || []).forEach((size) => {
let printed = [];
if (size.cupRange) {
const from = ladder.indexOf(String(size.cupRange[0]).toUpperCase());
const to = ladder.indexOf(String(size.cupRange[1]).toUpperCase());
if (from !== -1 && to >= from) printed = ladder.slice(from, to + 1);
} else {
printed = [size.cup, size.cupAlso].filter(Boolean);
}
printed.map(ours).filter(Boolean).forEach((cup) => out.push(`${size.band}${cup}`));
});
cells[token] = [...new Set(out)];
});
return { cells, decidedBy: lettering ? lettering.decidedBy : null, reading: lettering ? lettering.reading : null, pastDD: lettering ? (lettering.pastDD || []) : [] };
}
function listedSizeFor(size, alphaGrid, letters) {
if (!size || size.band == null || !size.cup || !alphaGrid || !alphaGrid.listedSizes) return null;
const { cells, decidedBy, reading, pastDD } = _asaListedCells(alphaGrid, letters);
const own = `${size.band}${size.cup}`;
const holding = (cell) => Object.keys(cells).filter((token) => cells[token].includes(cell));
const exact = holding(own);
if (exact.length === 1) return { token: exact[0], cell: own, relation: 'exact', decidedBy, reading, pastDD };
if (exact.length > 1) return null;
const all = [...new Set(Object.values(cells).flat())];
if (!all.length) return null;
const findAvailable = (typeof module !== 'undefined' && module.exports) ? _asaSizeAvailabilityLazyModule().findAvailableSize : findAvailableSize;
const split = (cell) => { const m = /^(\d+)([A-Z]+)$/.exec(cell); return { band: Number(m[1]), cup: m[2] }; };
const ranked = findAvailable({ band: size.band, cup: size.cup }, {
availableBands: [...new Set(all.map((c) => split(c).band))],
availableCups: [...new Set(all.map((c) => split(c).cup))],
availablePairs: all,
});
const top = ranked.candidates && ranked.candidates[0];
if (!top || !/^sister-size-/.test(top.relation)) return null;
const sister = holding(top.label);
return sister.length === 1 ? { token: sister[0], cell: top.label, relation: top.relation, decidedBy, reading, pastDD } : null;
}
function findAvailableListedSize(size, answer, alphaGrid, letters) {
const available = (alphaGrid && alphaGrid.availableLabels) || [];
const trueSize = { band: size.band, cup: size.cup, label: `${size.band}${size.cup}` };
if (available.includes(answer.token)) {
return { status: 'exact', trueSize, candidates: [{ label: answer.token, relation: 'exact', distance: 0, confidence: 'Good match', note: '', listedCell: answer.cell }], note: '' };
}
const { cells } = _asaListedCells(alphaGrid, letters);
const inStock = Object.keys(cells).filter((token) => available.includes(token) && token !== answer.token);
const pool = [...new Set(inStock.flatMap((token) => cells[token]))];
if (pool.length) {
const findAvailable = (typeof module !== 'undefined' && module.exports) ? _asaSizeAvailabilityLazyModule().findAvailableSize : findAvailableSize;
const split = (cell) => { const m = /^(\d+)([A-Z]+)$/.exec(cell); return { band: Number(m[1]), cup: m[2] }; };
const ranked = findAvailable({ band: size.band, cup: size.cup }, {
availableBands: [...new Set(pool.map((c) => split(c).band))],
availableCups: [...new Set(pool.map((c) => split(c).cup))],
availablePairs: pool,
});
const top = ranked.candidates && ranked.candidates[0];
const holders = top ? inStock.filter((token) => cells[token].includes(top.label)) : [];
if (top && holders.length === 1) {
return {
status: /^sister-size-/.test(top.relation) ? 'substituted' : 'approximate',
trueSize,
candidates: [{ label: holders[0], relation: top.relation, distance: top.distance, confidence: top.confidence, note: top.note, listedCell: top.label, band: top.band, cup: top.cup }],
note: `Your size's option, ${answer.token}, isn't in stock.`,
};
}
}
return { status: 'out-of-range', trueSize, candidates: [], note: `Your size's option, ${answer.token}, isn't in stock, and no other option lists a size close enough to recommend.`, listedSoldOut: answer.token };
}
let _asaSizeAvailabilityLazy = null;
const _asaSizeAvailabilityLazyModule = () => (_asaSizeAvailabilityLazy || (_asaSizeAvailabilityLazy = require('./sizeAvailability')));
if (typeof module !== 'undefined' && module.exports) {
module.exports = { letterPlace, canonicalLetter: _asaCanonLetter, offeredAlphaLabels, closestInStockByOrder, closestInStockPlaced, listedSizeFor, findAvailableListedSize, findAvailableAlphaSize, pairedLabelHolding, nearbyRowsOnPairedGrid, alphaSizeIndex, listingRunJoinsAtXl, adjacentAlphaSizes, ALPHA_SIZE_ORDER, PLUS_SIZE_ORDER, MAX_ALPHA_SUBSTITUTION_DISTANCE };
}
/* src/badgeCopy.js */
const _bcVariantFeed = (typeof module !== 'undefined' && module.exports) ? require('./shopifyVariantFeed') : null;
const _bcVariantFeedFactText = _bcVariantFeed ? _bcVariantFeed.variantFeedFactText : (typeof variantFeedFactText === 'function' ? variantFeedFactText : null);
const _bcChartMatcher = (typeof module !== 'undefined' && module.exports) ? require('./chartMatcher') : null;
const _bcK = (typeof module !== 'undefined' && module.exports) ? require('./sizingConstants') : SIZING_CONSTANTS;
const CHART_TIER_CENTRED = _bcChartMatcher ? _bcChartMatcher.TIER_SCORE_CENTRED : TIER_SCORE_CENTRED;
const CHART_TIER_COMFORTABLE = _bcChartMatcher ? _bcChartMatcher.TIER_SCORE_COMFORTABLE : TIER_SCORE_COMFORTABLE;
const CHART_TIER_POSSIBLE = _bcChartMatcher ? _bcChartMatcher.TIER_SCORE_POSSIBLE : TIER_SCORE_POSSIBLE;
const CHART_NEAR_EDGE = _bcChartMatcher ? _bcChartMatcher.NEAR_EDGE_POSITION : NEAR_EDGE_POSITION;
const _bcChartMissPhrase = _bcChartMatcher ? _bcChartMatcher.chartMissPhrase : chartMissPhrase;
function styleFitBadgeText(confidence) {
if (confidence === 'Great match') return 'Best Match';
if (confidence === 'Good match') return 'Strong Match';
if (confidence === 'Likely fits') return 'Possible Match';
if (confidence === 'No style detected') return 'Base size, no adjustment';
if (confidence === 'Not sized like a bra') return 'Not a bra size';
if (confidence === 'Beyond supported sizes') return 'Beyond our range';
if (confidence === "Outside this brand's range") return 'Not carried here';
if (confidence === "Not on this brand's chart") return 'Not on their chart';
if (confidence === "Between this brand's chart rows") return 'Between chart sizes';
return 'Limited Data';
}
const QUALITY_DETAIL_TEXT = {
'Detailed chart': "This listing's own size chart, which gave two measurements that agreed.",
'Basic chart': "This listing's chart gives one measurement per size.",
'Chart of bra sizes': "This listing's chart lists the bra sizes each letter fits.",
'Chart, near a size edge': "Your measurements are near the edge of a size on this listing's chart.",
'Limited data': "This listing's own size chart, which couldn't be used for your measurements.",
'Confirmed product details': "The retailer's own product details, which named this style outright.",
'Estimated from description': 'The product description, which this style was estimated from.',
};
function qualityDetailText(quality) {
if (typeof quality !== 'string') return null;
return QUALITY_DETAIL_TEXT[quality] || null;
}
function baseSizeStepText(baseSize, shownLabel, brandDisplayName) {
const internalLabel = baseSize && baseSize.label;
if (!internalLabel || !shownLabel || shownLabel === internalLabel) return shownLabel || internalLabel;
const brand = (brandDisplayName || '').replace(/\s*\([^)]*\)\s*$/, '');
const whose = brand ? `${brand}'s` : "this brand's";
const lead = `${shownLabel}, in ${whose} own cup letters.`;
const band = baseSize.band == null ? '' : String(baseSize.band);
if (!band || !baseSize.cup || !shownLabel.startsWith(band) || internalLabel !== band + baseSize.cup) return lead;
const theirCup = shownLabel.slice(band.length);
return `${lead} ${brand ? `${brand}'s` : 'Its'} ${theirCup} is the standard US ${baseSize.cup}.`;
}
function brandChartGapDetailText(factors) {
const matchDetail = factors && factors.matchDetail;
if (!matchDetail || matchDetail.type !== 'brandChartGap') return null;
const outside = matchDetail.listingChartOutside;
if (outside) {
return outside.closest
? `This listing's own size chart, which prints no size for your measurements; its closest is ${outside.closest}. The base size above is this app's own calculation of your size, not one of this listing's sizes.`
: "This listing's own size chart, which prints no size for your measurements. The base size above is this app's own calculation of your size, not one of this listing's sizes.";
}
const brand = matchDetail.brandDisplayName || 'This brand';
const underbustRows = matchDetail.underbustRows;
if (underbustRows && underbustRows.refused === 'two-rows') {
const [a, b] = underbustRows.rows;
return `${brand}'s size chart, which puts your underbust in two sizes at once, ${a.label} (${a.min}-${a.max}") and ${b.label} (${b.min}-${b.max}"). The base size above is this app's own calculation of your size, not a ${brand} size.`;
}
return `${brand}'s size chart, which prints no size for your measurements. The base size above is this app's own calculation of your size, not a ${brand} size.`;
}
function confidenceClass(confidence) {
if (confidence === 'Great match') return 'confidenceGreat';
if (confidence === 'Good match') return 'confidenceGood';
if (confidence === 'Likely fits') return 'confidenceLikely';
if (confidence === 'No style detected') return 'confidenceNeutral';
if (confidence === 'Not sized like a bra') return 'confidenceNeutral';
if (confidence === 'Beyond supported sizes') return 'confidenceNeutral';
if (confidence === "Outside this brand's range") return 'confidenceNeutral';
if (confidence === "Not on this brand's chart" || confidence === "Between this brand's chart rows") return 'confidenceNeutral';
return 'confidenceUncertain';
}
const HYPHENATED_STYLE_NAMES = {
tShirt: 't-shirt',
pushUp: 'push-up',
listingLetterSized: 'letter-sized',
listingBrandSized: "brand's own numbered sizes",
};
function humanizeStyleKey(styleKey) {
if (HYPHENATED_STYLE_NAMES[styleKey]) return HYPHENATED_STYLE_NAMES[styleKey];
return (styleKey || '').replace(/([A-Z])/g, ' $1').toLowerCase().trim();
}
function capitalize(text) {
return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
function styleSubject(humanized, noun) {
return capitalize(`${humanized} ${noun}`.trim());
}
function composeChartMatchPositionExplanation(matchDetail) {
const { matchType, pairMatchType, dimensionPositions, ambiguousChart, bucketLabel, nearestMatch } = matchDetail;
const positions = Object.values(dimensionPositions);
const minPosition = Math.min(...positions);
const alternate = matchDetail.boundaryAlternate || null;
const nudge = alternate ? chartAlternateNudge(alternate) : null;
const ratedScore = typeof matchDetail.chartScore === 'number' ? matchDetail.chartScore : minPosition;
const limited = ratedScore < CHART_TIER_POSSIBLE;
const tiedWith = matchDetail.tiedWith && matchDetail.tiedWith !== bucketLabel ? matchDetail.tiedWith : null;
const equally = tiedWith ? `${bucketLabel} and ${tiedWith} are equally close` : null;
const missPhrase = nearestMatch ? _bcChartMissPhrase(matchDetail.nearestMisses) : null;
if (nearestMatch && missPhrase) {
return nudge
? `Your measurements fall between ${bucketLabel} and ${alternate.label} on this retailer's own chart, outside both, so it can't reliably place you in either. ${equally || `${bucketLabel} is the closer`}: ${missPhrase}. ${nudge}`
: `Your measurements fall outside every size on this retailer's own chart, so it can't reliably place you in one. ${equally || `The closest is ${bucketLabel}`}: ${missPhrase}.`;
}
if (nearestMatch) {
if (limited) {
return nudge
? `Your measurements fall between ${bucketLabel} and ${alternate.label} on this retailer's own chart, so it can't reliably place you in either. ${equally || `${bucketLabel} is the closer`}. ${nudge}`
: `Your measurements fall between sizes on this retailer's own chart, so it can't reliably place you in one. ${equally || `${bucketLabel} is the closest`}.`;
}
return nudge
? `Your measurements fall between ${bucketLabel} and ${alternate.label} on this retailer's own chart, and ${equally || `${bucketLabel} is the closer`}. ${nudge}`
: `Your measurements fall between sizes on this retailer's own chart, and ${equally || `${bucketLabel} is the closest`}.`;
}
if (matchType === 'pair' && pairMatchType === 'sister') {
if (limited) {
return nudge
? `Your exact size isn't on this retailer's own chart, and a true sister size of yours is listed under both ${bucketLabel} and ${alternate.label}, so it can't reliably place you in either. ${nudge}`
: `Your exact size isn't listed for ${bucketLabel}, only a true sister size of yours is, so this retailer's own chart can't reliably place you. ${bucketLabel} is where it lists that sister size.`;
}
return nudge
? `Your exact size isn't on this retailer's own chart, but a true sister size of yours is listed under ${bucketLabel} and also under ${alternate.label}. ${nudge}`
: `Your exact size isn't listed for ${bucketLabel}, but your true sister size is, so ${bucketLabel} should give a comparable fit.`;
}
if (ambiguousChart) {
if (limited) {
return nudge
? `Your measurements sit close to the boundary between ${bucketLabel} and ${alternate.label} on this retailer's own chart, so it can't reliably place you in either. ${equally || `${bucketLabel} is the closer of the two`}, and ${nudge}`
: `Your measurements sit close to the boundary between two sizes on this retailer's own chart, so it can't reliably place you in either. ${equally || `${bucketLabel} is the closer of the two`}, but a different size may fit better.`;
}
return nudge
? `Your measurements sit close to the boundary between ${bucketLabel} and ${alternate.label} on this retailer's own chart. ${equally || `${bucketLabel} is the closer of the two`}, and ${nudge}`
: `Your measurements sit close to the boundary between two sizes on this retailer's own chart. ${equally || `${bucketLabel} is the closer of the two`}, but a different size may fit better.`;
}
if (ratedScore >= CHART_TIER_CENTRED) {
return `Your measurements are right in the middle of this retailer's ${bucketLabel} size, making it a confident match.`;
}
if (ratedScore >= CHART_TIER_COMFORTABLE) {
return `Your measurements fall comfortably within this retailer's ${bucketLabel} size.`;
}
if (matchDetail.wideRange && !ambiguousChart && minPosition >= CHART_NEAR_EDGE) {
return limited
? `Your measurements fall within this retailer's ${bucketLabel} size, but its range is wide, so its own chart can't reliably place you in it.`
: `Your measurements fall within this retailer's ${bucketLabel} size, but its range is wide, so a different size may also fit.`;
}
if (limited) {
return nudge
? `You're between ${bucketLabel} and ${alternate.label} on this retailer's own chart: your measurements sit near the edge of its ${bucketLabel}, next to its ${alternate.label}, so it can't reliably place you in either. ${nudge}`
: `Your measurements sit near the edge of this retailer's ${bucketLabel} size, so its own chart can't reliably place you in it. A different size may fit better.`;
}
return nudge
? `Your measurements sit near the edge of this retailer's ${bucketLabel} size, next to its ${alternate.label}. ${nudge}`
: `Your measurements sit near the edge of this retailer's ${bucketLabel} size. A different size may fit better.`;
}
function chartAlternateNudge(alternate) {
if (!alternate || !alternate.label) return null;
if (alternate.direction === 'up') return `${alternate.label} is worth trying if you'd like a little more room to move.`;
if (alternate.direction === 'down') return `${alternate.label} is worth trying if you'd like a closer, more fitted feel.`;
return null;
}
const NEARBY_PLAIN_REASON = Object.freeze({
'size-up': 'The next size up.',
'size-down': 'The next size down.',
});
function whyLineArguedAlternate(whyLineText, matchDetail) {
const alternate = matchDetail ? matchDetail.boundaryAlternate : null;
const nudge = chartAlternateNudge(alternate);
if (!nudge || !whyLineText || !whyLineText.includes(nudge)) return null;
return { label: alternate.label, relation: alternate.direction === 'up' ? 'size-up' : 'size-down' };
}
function nearbyRowReason(row, fullReason, argued) {
if (argued && row && row.label === argued.label && row.relation === argued.relation) {
return NEARBY_PLAIN_REASON[row.relation] || fullReason;
}
return fullReason;
}
function composeCupShiftExplanation(matchDetail, displayBaseLabel, displayLabel) {
const { styleKey, shiftDirection, shiftMagnitude, label, usedProductClaim, styleNote, baseLabel } = matchDetail;
const humanized = humanizeStyleKey(styleKey);
const shownBase = baseLabel ? (displayBaseLabel || baseLabel) : baseLabel;
const shownLabel = label ? (displayLabel || label) : label;
if ((usedProductClaim || matchDetail.bandAdjustmentApplied) && shownBase && shownLabel && shownBase !== shownLabel) {
const bandSteps = matchDetail.bandAdjustmentApplied ? (matchDetail.bandAdjustmentSteps || 0) : 0;
const cupSteps = usedProductClaim ? shiftDirection * Math.max(1, Math.round(Math.abs(shiftMagnitude))) : 0;
const step = (n, one, many) => `${n > 0 ? 'up' : 'down'} ${Math.abs(n) === 1 ? one : `${Math.abs(n)} ${many}`}`;
const moves = [
bandSteps ? step(bandSteps, 'a band size', 'band sizes') : null,
cupSteps ? step(cupSteps, 'a full cup size', 'cup sizes') : null,
].filter(Boolean).join(' and ');
if (moves) return `This product's own description specifies sizing ${moves}, so we sized from your calculated ${shownBase} to ${shownLabel}.`;
}
if (!shiftMagnitude) {
const body = styleNote || `${styleSubject(humanized, 'bras')} run true to your calculated size, so no adjustment was needed.`;
const sized = shownBase ? `${body} Your size here is ${shownBase}.` : body;
if (matchDetail.verifiedFormula) {
const brand = matchDetail.verifiedFormula.brandDisplayName;
const whose = brand ? `${brand}'s` : "this brand's";
return `${sized} That comes from ${whose} own published sizing, not an estimate.`;
}
return sized;
}
const letters = Math.max(1, Math.round(Math.abs(shiftMagnitude)));
const cupWord = letters === 1 ? 'a full cup size' : `${letters} cup sizes`;
const direction = shiftDirection > 0 ? 'up' : 'down';
const from = shownBase ? `from your calculated ${shownBase} ` : '';
if (usedProductClaim) {
return `This product's own description specifies sizing ${direction} ${cupWord}, so we sized ${from}to ${shownLabel}.`;
}
if (shiftDirection > 0) {
return `${styleSubject(humanized, 'cups')} are built with padding and structure that take up room inside the cup, so the same label holds less of you. We sized up ${cupWord} ${from}to ${shownLabel}.`;
}
return `${styleSubject(humanized, 'cups')} are cut shallower, so tissue that needs a fuller cup in a standard shape sits correctly in a smaller one here. We sized down ${cupWord} ${from}to ${shownLabel}.`;
}
function substitutionFeelPhrase(relation) {
switch (relation) {
case 'sister-size-up': return 'bands tend to feel tight on you';
case 'sister-size-down': return 'bands tend to feel loose on you';
case 'same-band-larger-cup': return 'cups tend to feel snug or cut in at the top on you';
case 'same-band-smaller-cup': return 'cups tend to gap or wrinkle on you';
case 'band-up-same-cup': return 'the band and cups both tend to feel snug on you';
case 'band-down-same-cup': return 'the band and cups both tend to feel loose on you';
case 'size-up': return 'bras tend to feel snug on you';
case 'size-down': return 'bras tend to feel loose on you';
default: return null;
}
}
function substitutionAvailabilityPhrase(substitution, long) {
const calculated = substitution.calculatedLabel || null;
const projected = substitution.projectedLabel && substitution.projectedLabel !== substitution.headlineLabel ? substitution.projectedLabel : null;
if (projected) return long ? `In this retailer's own sizes you measure as ${projected}, which isn't available here` : `Your ${projected} isn't available here`;
if (Array.isArray(substitution.unreadLetters) && substitution.unreadLetters.length && calculated) {
return `${calculated} isn't among the sizes Measured Size can read on this listing`;
}
if (substitution.availability === 'notMade' && calculated) return `This style isn't made in ${calculated}`;
if (substitution.availability === 'brandRange' && calculated) return long ? `${calculated} isn't made here` : `Your ${calculated} isn't made here`;
if (substitution.availability === 'soldOut' && calculated) return long ? `${calculated} is sold out in this style right now` : `${calculated} is sold out in this style`;
return calculated ? `Your ${calculated} isn't available here` : "Your size isn't available here";
}
function joinLetters(letters) {
if (letters.length < 2) return letters[0] || '';
return `${letters.slice(0, -1).join(', ')} and ${letters[letters.length - 1]}`;
}
function unreadLettersSentence(letters, shownLabel) {
const cups = `${joinLetters(letters)} cups`;
const closer = shownLabel ? `closer to your size than ${shownLabel}` : 'your size';
return `This listing also has ${cups} in stock, in letters Measured Size can't yet match to your measurements, and ${letters.length === 1 ? 'that' : 'one of those'} may be ${closer}. The brand's own size guide can tell you which.`;
}
function unreadLettersStepText(letters, calculatedLabel) {
return `${calculatedLabel} isn't among the sizes Measured Size can read here. ${joinLetters(letters)} cups are in stock in letters Measured Size can't match yet, so your size may be one of them.`;
}
function substitutionWhy(baseSentence, substitution) {
if (!substitution) return baseSentence;
const shown = substitution.headlineLabel;
const unread = Array.isArray(substitution.unreadLetters) && substitution.unreadLetters.length && substitution.calculatedLabel;
const trade = /^sister-size/.test(substitution.relation || '') ? `${shown} is its sister size`
: (unread ? `${shown} is the closest it can` : `${shown} is the closest size here`);
const gap = substituteGapPhrase(substitution.gap, 'long');
const parts = [`${substitutionAvailabilityPhrase(substitution, true)}, and ${trade}${gap ? `: ${gap}` : ''}.`];
const feel = substitutionFeelPhrase(substitution.relation);
if (feel) parts.push(`It's a good choice if ${feel}.`);
if (unread) {
parts.push(unreadLettersSentence(substitution.unreadLetters, shown));
}
const detail = String(baseSentence || '').replace(/ ?Your size here is [^\s.]+\./, '').trim();
if (detail) parts.push(detail);
return parts.join(' ');
}
function substituteCardLine(substitution) {
if (!substitution || !substitution.headlineLabel) return null;
if (Array.isArray(substitution.unreadLetters) && substitution.unreadLetters.length && substitution.calculatedLabel) {
const letters = substitution.unreadLetters;
const one = letters.length === 1;
const named = letters.length > 6 ? `${letters.slice(0, 5).join(', ')} and more` : joinLetters(letters);
return `${named} cups here couldn't be read, and ${one ? 'that' : 'one of them'} may be your size.`;
}
const shown = substitution.headlineLabel;
const gap = substituteGapPhrase(substitution.gap, 'short');
const what = /^sister-size/.test(substitution.relation || '') ? 'its sister size' : (gap || 'the closest here');
return `${substitutionAvailabilityPhrase(substitution, false)}; ${shown} is ${what}.`;
}
function substituteGapPhrase(gap, form) {
if (!gap) return null;
const words = _bcK.NUMBER_WORDS;
const count = (n, noun) => `${words[Math.abs(n)] || Math.abs(n)} ${noun}${Math.abs(n) === 1 ? '' : 's'}`;
const way = (n) => (n > 0 ? 'larger' : 'smaller');
if (typeof gap.letterSteps === 'number') {
return gap.letterSteps ? `${count(gap.letterSteps, 'size')} ${way(gap.letterSteps)}` : null;
}
if (typeof gap.bandDiff !== 'number' || typeof gap.cupDiff !== 'number') return null;
if (form === 'short') {
if (gap.bandDiff === 0 && !gap.cupDiff) return null;
return closestDistancePhrase(gap.bandDiff, gap.bandDiff === 0 ? gap.cupDiff : (gap.volumeDiff || 0));
}
if (gap.bandDiff === 0) {
return gap.cupDiff ? `${count(gap.cupDiff, 'cup size')} ${way(gap.cupDiff)} on the same band` : null;
}
if (!gap.volumeDiff) return `the same cup volume on a band ${count(gap.bandDiff, 'size')} ${way(gap.bandDiff)}`;
return `${count(gap.bandDiff, 'band size')} ${way(gap.bandDiff)}, with a cup that holds ${count(gap.volumeDiff, 'size')} ${gap.volumeDiff > 0 ? 'more' : 'less'}`;
}
function belowBandFloorSentence(ownLabel, sisterLabel, steps) {
const band = String(ownLabel).match(/^\d+/);
const lead = `Band ${band ? band[0] : ''} is below the smallest band most stores make.`;
return steps === 1
? `${lead} Your sister size at band 28, ${sisterLabel}, holds the same cup volume.`
: `${lead} At band 28, ${sisterLabel} holds the same cup volume, ${steps === 2 ? 'two' : steps} band sizes larger than ${ownLabel}.`;
}
const GARMENT_TYPE_WORDS = [
['everyday', 'everyday bras'],
['bralette_wireless', 'bralettes and wireless bras'],
['bandeau', 'bandeaus'],
['sports_encapsulation', 'sports bras'],
['sports_compression', 'sports bras'],
['nursing', 'nursing bras'],
['shapewear', 'shapewear'],
];
function garmentTypesPhrase(types) {
if (!Array.isArray(types) || !types.length) return null;
const declared = new Set(types);
const words = [];
GARMENT_TYPE_WORDS.forEach(([id, phrase]) => {
if (declared.has(id) && words.indexOf(phrase) === -1) words.push(phrase);
});
if (!words.length) return null;
if (words.length === 1) return words[0];
return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}
const CROSS_RETAILER_SUMMARY_CHAR_LIMIT = 34;
function crossRetailerNoteParts(suggestion, shownCalculatedLabel) {
if (!suggestion || !shownCalculatedLabel) return null;
const confidence = suggestion.trigger === 'confidence';
const named = [suggestion, suggestion.second].filter(Boolean);
const total = 1 + (typeof suggestion.alsoCount === 'number' ? suggestion.alsoCount : 0);
const size = shownCalculatedLabel;
const line = (subject, plural) => `${confidence ? 'Surer fit: ' : ''}${subject} ${plural ? 'make' : 'makes'} ${confidence ? size : `your ${size}`}`;
const first = named[0].displayName;
const summaries = [];
if (named.length === 2) {
const pair = `${first} and ${named[1].displayName}`;
if (total > 2) summaries.push(line(`${first}, ${named[1].displayName} and ${total - 2} more`, true));
summaries.push(line(pair, true));
if (confidence) summaries.push(`Surer fit: ${pair}`);
}
summaries.push(total === 1 ? line(first, false) : line(`${first} and ${total - 1} more`, true));
if (total > 1) summaries.push(line(first, false));
summaries.push(total === 1 ? line(confidence ? 'one brand' : 'One brand', false) : line(`${total} brands`, true));
const lead = confidence
? `${suggestion.sizeFromBase === true ? `Your base size, ${size},` : size} is made by brands whose sizing Measured Size knows better than this listing's.`
: (total === 1 ? `${size} isn't available here, and ${first} makes it.` : `${size} isn't available here, and these brands make it.`);
const brands = named.map((b) => {
const theirs = b.destinationLabel && b.destinationLabel !== size ? `, labelled ${b.destinationLabel} there` : '';
const sells = garmentTypesPhrase(b.garmentTypes);
return {
name: b.displayName,
host: b.host,
url: `https://${b.host}/`,
detail: `Bands ${b.bandRange[0]} to ${b.bandRange[1]}, cups ${b.cupRange[0]} to ${b.cupRange[1]}${theirs}.`,
sells: sells ? `Sells ${sells}.` : null,
};
});
const more = (Array.isArray(suggestion.others) ? suggestion.others : [])
.filter((o) => o && o.displayName && o.host)
.map((o) => ({ name: o.displayName, host: o.host, url: `https://${o.host}/` }));
return {
summaries: summaries.filter((t, i) => summaries.indexOf(t) === i),
lead,
brands,
more,
moreCount: Math.max(0, total - named.length),
caveat: "Measured Size hasn't checked their stock.",
};
}
function bandOnlyWhy(matchDetail, substitution, displayBaseLabel) {
const own = displayBaseLabel || matchDetail.baseLabel;
if (!substitution || typeof substitution.bandDiff !== 'number' || !substitution.bandDiff) {
return `${BAND_ONLY_LINE} Your size is ${own}, so its band, ${matchDetail.band}, is shown.`;
}
const where = matchDetail.soldHere ? "isn't in stock here" : "isn't sold here";
const sister = substitution.sisterLabel
? (Math.abs(substitution.bandDiff) === 1 ? `: your sister size in that band is ${substitution.sisterLabel}` : `: your cup volume in that band is ${substitution.sisterLabel}`)
: '';
return `${BAND_ONLY_LINE} Your size is ${own}, and its band, ${matchDetail.band}, ${where}, so ${substitution.headlineLabel}, ${bandOnlyDistancePhrase(substitution.bandDiff)}, is shown${sister}.`;
}
function styleFitExplanation(confidence, factors, substitution, displayBaseLabel, displayLabel) {
const matchDetail = factors && factors.matchDetail;
let base;
if (matchDetail && matchDetail.type === 'bandOnly') return bandOnlyWhy(matchDetail, substitution, displayBaseLabel);
if (matchDetail && matchDetail.type === 'oneSizeOnly') return ONE_SIZE_ONLY_LINE;
if (matchDetail && matchDetail.type === 'storeSizesUnread') {
return `Measured Size can't read this store's sizes, so this is your base size, ${displayBaseLabel || matchDetail.baseLabel}, worked out from your measurements alone, not one from this listing.`;
}
if (matchDetail && matchDetail.type === 'brandDataUnavailable') {
return `Measured Size couldn't load its brand data, so this is your base size, ${displayBaseLabel || matchDetail.baseLabel}, worked out from your measurements alone, not this store's size. Close and reopen Measured Size to try again.`;
}
if (!matchDetail) {
base = (confidence === 'No style detected')
? "We couldn't identify a specific cut, so this is your calculated size with no style correction applied."
: "This cut is hard to predict from measurements alone. Compare to the listing's chart.";
} else if (matchDetail.type === 'outOfScope') {
base = matchDetail.note || 'This product is not sized by band and cup.';
} else if (matchDetail.type === 'brandChartGap') {
base = matchDetail.note;
} else if (matchDetail.type === 'chartMatch') {
base = composeChartMatchPositionExplanation(matchDetail);
} else if (matchDetail.type === 'unresolvedAlpha' && matchDetail.listingBrandSizeChart) {
const shown = displayBaseLabel || matchDetail.baseLabel;
base = `This listing is sold in the brand's own numbered sizes, not band and cup. ${matchDetail.reason} So this is your calculated band and cup size, ${shown}.`;
} else if (matchDetail.type === 'unresolvedAlpha') {
const humanized = humanizeStyleKey(matchDetail.styleKey);
const shown = displayBaseLabel || matchDetail.baseLabel;
base = `${styleSubject(humanized, 'styles')} are sold in S/M/L, but no conversion for your size could be confirmed for this retailer, so this is your calculated band and cup size, ${shown}.`;
} else if (matchDetail.type === 'listedSize') {
const shown = displayBaseLabel || matchDetail.baseLabel;
const holds = matchDetail.relation === 'exact'
? `lists your size, ${shown}`
: `lists ${matchDetail.cell}, your sister size, which holds the same cup volume as your ${shown}`;
base = `This listing's own size options each list the band and cup sizes they are made for, and ${matchDetail.bucketLabel} ${holds}.`;
const lettering = matchDetail.lettering;
if (lettering && lettering.decidedBy === 'evidence') {
const meaning = lettering.reading === 'continental' ? 'E is the US DD and F the US DDD' : 'F is the US DDD';
base = `${base} Its cup letters were read the way listings printing them like this mean them (${meaning}); the listing doesn't say so itself, so this is rated lower.`;
}
} else if (matchDetail.type === 'letterConsensus') {
base = `${usualLetterSentence(matchDetail, displayBaseLabel)} This brand has no size conversion on file, so this is the usual one. If this listing has its own size chart, check it.`;
} else if (matchDetail.type === 'staticTable' && matchDetail.listingBrandSizeChart) {
const shown = displayBaseLabel || matchDetail.baseLabel;
const bandOfShown = shown ? String(shown).match(/^\d+/) : null;
const differs = bandOfShown && bandOfShown[0] !== String(matchDetail.bucketLabel);
base = differs
? `This listing is sold in the brand's own numbered sizes, and its own size chart puts your ${shown} in a ${matchDetail.bucketLabel}, not a ${bandOfShown[0]}.`
: `This listing is sold in the brand's own numbered sizes, and its own size chart puts your ${shown} in a ${matchDetail.bucketLabel}.`;
} else if (matchDetail.type === 'staticTable') {
const humanized = humanizeStyleKey(matchDetail.styleKey);
const calculator = matchDetail.brandCalculator;
const calculatorBrand = calculator ? (calculator.brandDisplayName || '').replace(/\s*\([^)]*\)\s*$/, '') : '';
const underbustRow = matchDetail.underbustRow;
const rowBrand = underbustRow ? (underbustRow.brandDisplayName || '').replace(/\s*\([^)]*\)\s*$/, '') : '';
const gridCell = matchDetail.gridCell;
const gridBrand = gridCell ? (gridCell.brandDisplayName || '').replace(/\s*\([^)]*\)\s*$/, '') : '';
const gridUnit = gridCell && gridCell.unit === 'cm' ? ' cm' : '"';
const gridPlace = (range) => `${range.inRange ? 'in' : 'nearest'} its ${range.min}-${range.max}${gridUnit}`;
base = underbustRow
? `This style is sold in letter sizes. ${rowBrand ? `${rowBrand}'s` : "This brand's"} size chart for it goes by underbust alone, and puts your ${underbustRow.underbust}" underbust in its ${underbustRow.min}-${underbustRow.max}" row, which it sells as ${matchDetail.bucketLabel}.`
: gridCell
? `This style is sold in letter sizes. ${gridBrand ? `${gridBrand}'s` : "This brand's"} size chart for it goes by underbust and bust together: your ${gridCell.underbust}" underbust is ${gridPlace(gridCell.underbustRange)} row, and your ${gridCell.bust}" bust ${gridPlace(gridCell.bustRange)} column, which it sells as ${matchDetail.bucketLabel}.`
: calculator
? `This style is sold in letter sizes. ${calculatorBrand ? `${calculatorBrand}'s` : "This brand's"} own size calculator gives your measurements a ${calculator.brandSize}, which ${calculatorBrand ? `${calculatorBrand}'s` : 'its'} size chart sells as ${matchDetail.bucketLabel}.`
: matchDetail.fromPublishedTable && matchDetail.cupGroupSize && matchDetail.cupGroupSize.onListingPage
? `This ${humanized} style uses a different cup sizing system than your standard size, so we matched your measurements to this retailer's own ${matchDetail.bucketLabel} size. This comes from this retailer's own size conversion tool, the one on this listing's page.`
: matchDetail.fromPublishedTable
? `This ${humanized} style uses a different cup sizing system than your standard size, so we matched your measurements to this retailer's own ${matchDetail.bucketLabel} size. This comes from this retailer's own published size chart rather than from this listing's page.`
: `This ${humanized} style uses a different cup sizing system than your standard size, so we matched your measurements to this retailer's own ${matchDetail.bucketLabel} size.`;
} else if (matchDetail && ['bandClamped', 'beyondLadder', 'beyondBandLadder'].includes(matchDetail.type) && matchDetail.why) {
base = matchDetail.why;
} else {
base = composeCupShiftExplanation(matchDetail, displayBaseLabel, displayLabel);
}
if (matchDetail && matchDetail.headlineStyleNote) {
base = `${matchDetail.headlineStyleNote} ${base}`;
}
let sentence = substitutionWhy(base, substitution);
const listingCupLetters = factors && factors.listingCupLetters;
if (listingCupLetters) {
sentence = `${sentence} ${listingCupLettersSentence(listingCupLetters)}`;
}
const halfCup = factors && factors.halfCup;
if (halfCup) {
sentence = `${sentence} Your measurements fall between ${halfCup.lower} and ${halfCup.upper}, and this listing sells the half cup between them, ${halfCup.shown}, which is the nearest size to your measurements.`;
}
return sentence;
}
const FIT_CHECK_TIP_TEXT = {
'sister-size-up': 'When it arrives, check the band first, since that is the part that got bigger. It should feel snug and stay level around your back when you raise your arms. If it rides up, try a tighter hook, and if it still rides up, the band is too loose for you and a smaller band would fit better.',
'sister-size-down': 'When it arrives, check the band first, since that is the part that got smaller. Firmer than you are used to is fine as long as you can breathe deeply and slide two fingers under it at the back. If it digs in or leaves deep marks even on the loosest hook, the band is too tight for you.',
'same-band-larger-cup': 'When it arrives, check the cups, since the band is the same as your size. The top edge should lie flat against you and the fabric should be smooth. If there is still empty space or wrinkling in the cup after you lean forward and settle into it, the cup is too big for you and a smaller one would fit better.',
'same-band-smaller-cup': "When it arrives, check the cups, since the band is the same as your size. Nothing should spill over the top edge or out at the sides, and the edge shouldn't cut into you. On an underwired bra, the wire should rest on your ribcage around your breast, not on it, and the center between the cups should touch your chest.",
'band-up-same-cup': "When it arrives, check the band and the cups, since a bigger band with the same cup letter is both looser and roomier. The band should feel snug and stay level around your back when you raise your arms, and the cups shouldn't gap at the top edge. If either feels loose, it is too big for you.",
'band-down-same-cup': 'When it arrives, check the band and the cups, since a smaller band with the same cup letter is both firmer and holds less. You should still breathe comfortably with the band fastened, and nothing should spill over the top edge or out at the sides of the cups. If either digs in, it is too small for you.',
'different-size': 'When it arrives, check the band and the cups one at a time, since this size differs from yours in both. The band should feel snug and stay level when you raise your arms, and the cups should lie smooth. A band that rides up or a cup that gaps means too big, and one that digs in or spills means too small.',
'cup-check': 'When it arrives, check the cups closely, since the cup was adjusted for this style. They should lie smooth with no gap at the top edge, nothing should spill over the top or out at the sides, and any wire should rest on your ribcage around your breast rather than on it.',
'band-and-cup-check': 'When it arrives, check the band and the cups one at a time. The band should feel snug and stay level around your back when you raise your arms. The cups should lie smooth, with no gap at the top edge and nothing spilling over it.',
'letter-size-up': 'When it arrives, check that the band stays in place when you raise your arms instead of riding up, and that the cups lie against you without gaping or wrinkling, since a size up gives more room in both. If it feels easy and stays put, it fits, and if it slides or gapes, it is too big for you.',
'letter-size-down': "When it arrives, check that the band doesn't dig in or leave deep marks, and that nothing spills over the edges of the cups, since a size down gives less room in both. Firm but comfortable is right, and if it pinches or you spill over, it is too small for you.",
'letter-size-check': 'When it arrives, check that the band lies flat and stays in place when you raise your arms, and that the cups cover you smoothly without gaping at the top or spilling over the edges. If it slides up or gapes, a size down may suit you, and if it digs in or you spill over, a size up may.',
};
const FIT_CHECK_LOWER_TIERS = _bcK.RATING_LADDER.slice(2);
const FIT_CHECK_NON_RATINGS = ['Not sized like a bra', 'Beyond supported sizes', "Outside this brand's range", "Not on this brand's chart", "Between this brand's chart rows"];
function fitCheckTipKey(ctx) {
if (!ctx) return null;
const { relation, confidence, matchDetail, letterSized } = ctx;
if (matchDetail && (matchDetail.type === 'outOfScope' || matchDetail.styleKey === 'mastectomy' || matchDetail.headlineStyleNote)) return null;
if (FIT_CHECK_NON_RATINGS.includes(confidence)) return null;
const moved = !!relation && relation !== 'exact';
const lowerTier = FIT_CHECK_LOWER_TIERS.includes(confidence);
if (letterSized) {
if (relation === 'size-up') return 'letter-size-up';
if (relation === 'size-down') return 'letter-size-down';
return (moved || lowerTier) ? 'letter-size-check' : null;
}
if (moved) return Object.prototype.hasOwnProperty.call(FIT_CHECK_TIP_TEXT, relation) ? relation : 'different-size';
if (!lowerTier) return null;
if (matchDetail && matchDetail.type === 'cupShift' && matchDetail.shiftMagnitude) return 'cup-check';
return 'band-and-cup-check';
}
function fitCheckTipText(key) {
return (key && FIT_CHECK_TIP_TEXT[key]) || null;
}
const CHOOSE_SIZE_HINT_TEXT = 'In between sizes, or think we got your size wrong? Try another to see its stock and match rating here.';
const NO_STYLE_ADJUSTMENT_NOTE = 'No style-specific adjustment for this cut.';
function composeAdjustmentSummary(factors) {
const matchDetail = factors && factors.matchDetail;
if (!matchDetail) return NO_STYLE_ADJUSTMENT_NOTE;
if (matchDetail.type === 'outOfScope') {
return 'This product is not sized by band and cup, so no bra-size adjustment applies.';
}
if (matchDetail.type === 'brandChartGap') {
return "No single size of this brand's was worked out, so no style adjustment applies.";
}
if (matchDetail.type === 'bandOnly') {
return "This listing is sold by band only: your band is read as its band, and the cup fit isn't checked.";
}
if (matchDetail.type === 'oneSizeOnly') {
return 'This listing comes in one size only, so no bra-size adjustment applies.';
}
if (matchDetail.type === 'brandDataUnavailable') {
return "Measured Size's brand data didn't load, so no brand or listing adjustment was made.";
}
if (matchDetail.type === 'storeSizesUnread') {
return "This store's sizes couldn't be read, so no listing adjustment was made.";
}
if (matchDetail.type === 'cupShift') {
if (!matchDetail.shiftMagnitude) {
if (!matchDetail.styleKey) return NO_STYLE_ADJUSTMENT_NOTE;
return `No cup adjustment for this ${humanizeStyleKey(matchDetail.styleKey)} style.`;
}
const letters = Math.max(1, Math.round(Math.abs(matchDetail.shiftMagnitude)));
const sign = matchDetail.shiftDirection > 0 ? '+' : '-';
const cupWord = letters === 1 ? 'cup' : 'cups';
const humanized = humanizeStyleKey(matchDetail.styleKey);
const source = matchDetail.usedProductClaim
? "This product's own description specifies this adjustment."
: `${styleSubject(humanized, 'styles')} typically need this adjustment.`;
return `${sign}${letters} ${cupWord}. ${source}`;
}
if (matchDetail.type === 'unresolvedAlpha') {
if (matchDetail.listingBrandSizeChart) return `No numbered size could be resolved. ${matchDetail.reason}`;
return `No S/M/L conversion could be resolved. ${matchDetail.reason}`;
}
if (matchDetail.type === 'chartMatch') {
return `Matched directly to this retailer's own size chart as a ${matchDetail.bucketLabel}.`;
}
if (matchDetail.type === 'listedSize') {
return `Read off this listing's own size option, ${matchDetail.bucketLabel}, which lists the band and cup sizes it is made for.`;
}
if (matchDetail.type === 'letterConsensus') {
return `Converted to the usual letter size for your size: ${matchDetail.agree} of the ${matchDetail.total} brand size charts on file that list your size give that letter. No size conversion for this brand is on file.`;
}
if (matchDetail.type === 'staticTable' && matchDetail.listingBrandSizeChart) {
return `Matched directly to this listing's own brand size chart as a ${matchDetail.bucketLabel}.`;
}
if (matchDetail.type === 'staticTable') {
return matchDetail.fromPublishedTable
? `Matched to this retailer's own size chart as a ${matchDetail.bucketLabel}, published on their site rather than read from this listing's page.`
: `Matched directly to this retailer's own size chart as a ${matchDetail.bucketLabel}.`;
}
return NO_STYLE_ADJUSTMENT_NOTE;
}
function bandCupDistancePhrase(bandDiff, volumeDiff) {
const words = _bcK.NUMBER_WORDS;
const count = (n, noun) => `${words[Math.abs(n)] || Math.abs(n)} ${noun}${Math.abs(n) === 1 ? '' : 's'}`;
if (bandDiff === 0) return `${count(volumeDiff, 'cup size')} ${volumeDiff > 0 ? 'larger' : 'smaller'} on the same band`;
const band = `${count(bandDiff, 'band size')} ${bandDiff > 0 ? 'larger' : 'smaller'}`;
if (volumeDiff === 0) return `${band}, with the same cup volume`;
return `${band}, with a cup that holds ${count(volumeDiff, 'size')} ${volumeDiff > 0 ? 'more' : 'less'}`;
}
function availabilityInfo(gridResult, gridSkippedReason, productName, productUnavailable, stockStatus, calculatedLabel, nearestLabel) {
const retailer = productName || 'this retailer';
if (productUnavailable) {
return {
label: 'Product unavailable',
icon: '⊘',
cls: 'availBad',
tooltip: `${retailer === 'this retailer' ? 'This listing' : retailer} appears to be out of stock or no longer available, independent of size.`,
};
}
if (!gridResult) {
if (stockStatus && stockStatus.state === 'low-stock') {
const units = typeof stockStatus.unitsLeft === 'number' ? stockStatus.unitsLeft : null;
return {
label: 'Low stock',
icon: '!',
cls: 'availWarn',
tooltip: units === 1
? 'This retailer says there is only 1 left of this listing. That is the whole listing, not your size specifically.'
: `This retailer says there are only ${units === null ? 'a few' : units} left of this listing. That is the whole listing, not your size specifically.`,
};
}
if (gridSkippedReason === 'not-sized-like-a-bra') {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: `${retailer === 'this retailer' ? 'This listing' : retailer} is not sold in band and cup sizes, so your size is not one of its options and there was no stock check to run.`,
};
}
if (gridSkippedReason === 'one-size-only') {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: `${retailer === 'this retailer' ? 'This listing' : retailer} comes in one size only, so there is no size of yours on it to check stock for.`,
};
}
if (gridSkippedReason === 'brand-data-unavailable') {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: "Measured Size couldn't load its brand data, so it didn't match your size to this listing's sizes or check their stock. Close and reopen Measured Size to try again.",
};
}
if (gridSkippedReason === 'brand-calculator-refused') {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: `The brand's own size calculator gives no size for your measurements, so there was no size on ${retailer === 'this retailer' ? 'this listing' : retailer} to check stock for.`,
};
}
if (gridSkippedReason === 'brand-chart-gap') {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: `The brand's own size chart gives no single size for your measurements, so there was no size on ${retailer === 'this retailer' ? 'this listing' : retailer} to check stock for.`,
};
}
if ((gridSkippedReason === 'no-size-resolved' || gridSkippedReason === 'alpha-sized') && calculatedLabel) {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: `Your measurements work out to ${calculatedLabel}, but which of ${retailer === 'this retailer' ? "this listing's" : `${retailer}'s`} own sizes that is couldn't be confirmed, so there was no size of theirs to check stock against.`,
};
}
if (gridSkippedReason === 'no-size-resolved' || gridSkippedReason === 'alpha-sized') {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: `No confident size for ${retailer === 'this retailer' ? 'this listing' : retailer} could be worked out from your measurements, so there was no size to check stock against.`,
};
}
if (gridSkippedReason === 'stock-list-unread') {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: "This retailer does publish which sizes are in stock, but its list couldn't be read just now, and this listing's size options don't say which band and cup combinations exist on their own. So no stock check was made this time.",
};
}
if (gridSkippedReason === 'size-list-unread') {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: "This listing's sizes couldn't be read: its size options hadn't loaded when Measured Size read the page, so no size on it was checked. Close and reopen Measured Size to read them again.",
};
}
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: "This retailer doesn't publish which sizes are in stock in a way Measured Size can read, so no stock check was attempted. Nothing went wrong.",
};
}
if (gridResult.stockUnconfirmed && (gridResult.status === 'exact' || gridResult.status === 'substituted' || gridResult.status === 'approximate')) {
return {
label: 'Availability not tracked',
icon: '○',
cls: 'availNeutral',
tooltip: "This size is made in the colour shown, but the page doesn't show whether it's in stock until it's chosen there, so no stock is claimed.",
};
}
if (gridResult.status === 'exact' || gridResult.status === 'substituted' || gridResult.status === 'approximate') {
return { label: 'This size is in stock', icon: '✓', cls: 'availGood', tooltip: 'This size is available on this listing.' };
}
if (gridResult.status === 'out-of-range' && gridResult.nothingInStock) {
const shown = calculatedLabel || (gridResult.trueSize && gridResult.trueSize.label) || null;
return {
label: 'Not available here',
icon: '✕',
cls: 'availBad',
tooltip: gridResult.nothingInStockFrom === 'page'
? `Nothing is in stock in your size${shown ? `, ${shown},` : ''} on this listing right now. The listing shows every size sold out in the colour shown.`
: `Nothing is in stock in your size${shown ? `, ${shown},` : ''} on this listing right now. The store's own stock list shows no size in stock in the colour shown.`,
};
}
if (gridResult.status === 'out-of-range' && gridResult.bandOnly) {
const shown = calculatedLabel || (gridResult.trueSize && gridResult.trueSize.label) || 'your size';
if (gridResult.cupRangeExcluded) {
return { label: 'Not available here', icon: '✕', cls: 'availBad', tooltip: `${gridResult.note} Your size is ${shown}.` };
}
const near = gridResult.nearestBeyondReach;
return {
label: 'Not available here',
icon: '✕',
cls: 'availBad',
tooltip: near && typeof near.bandDiff === 'number' && near.bandDiff !== 0
? `This bra is sold by band only, and your size, ${shown}, isn't within one band of a band in stock here. The closest size that is, ${nearestLabel || near.label}, is ${bandOnlyDistancePhrase(near.bandDiff)}, too far from your size to recommend.`
: `This bra is sold by band only, and no band in stock here is close enough to your size, ${shown}, to recommend.`,
};
}
if (gridResult.status === 'out-of-range' && gridResult.noLetterSource) {
const shown = calculatedLabel || (gridResult.trueSize && gridResult.trueSize.label) || 'your size';
const c = gridResult.closestLetter;
const cupsShown = c && Array.isArray(c.coverageCupsShown) && c.coverageCupsShown.length === 2 ? c.coverageCupsShown : null;
const cov = c && c.source === 'brand-table' && c.sourceName && (c.ownLettersShown === true || cupsShown) ? c.coverage : null;
const cups = cov ? (cupsShown || cov.cups) : null;
const range = cov && cov.past
? ({
cup: `${cups[0]} to ${cups[1]} cups`,
band: `bands ${cov.bands[0]} to ${cov.bands[1]}`,
both: `bands ${cov.bands[0]} to ${cov.bands[1]} and ${cups[0]} to ${cups[1]} cups`,
})[cov.past]
: null;
const bandEnd = cov && cov.past === 'band' && cov.bandSide
? (cov.bandSide === 'below' ? `start at a ${cov.bands[0]} band` : `end at a ${cov.bands[1]} band`)
: null;
const lead = bandEnd
? `${c.sourceName}'s letter sizes ${bandEnd}; your size is ${shown}, so no letter is recommended.`
: range
? `${c.sourceName}'s letter sizes are made for ${range}; your size is ${shown}, so no letter is recommended.`
: ((c && c.source === 'usual' && c.usualAllowed === false && c.sourceName)
? `Measured Size has ${c.sourceName}'s own letter sizing on record, but not in a form it can use for ${shown}, so no letter is recommended.`
: `No size chart Measured Size uses for this listing gives ${shown} a letter size, so no letter is recommended.`);
if (!c || !c.label) return { label: 'Not available here', icon: '✕', cls: 'availBad', tooltip: lead };
if (c.namedOnly) return { label: 'Not available here', icon: '✕', cls: 'availBad', tooltip: `${lead} ${namedClosestSentence(c.closestInStockNamed || { label: c.label })}` };
const owner = c.sourceName ? `${c.sourceName}'s` : "The brand's";
const via = c.source === 'brand-table' ? `${owner} own letter size chart`
: (c.source === 'cup-group' ? `${owner} own size record` : 'The usual conversion across brand size charts');
let cell = nearestLabel || c.cell;
if (c.cell === c.own) cell = 'your size';
else if (/^sister/.test(c.relation || '')) cell = `your sister size, ${cell},`;
const an = (letter) => (/^[SMLXF]/.test(letter) ? `an ${letter}` : `a ${letter}`);
const split = Array.isArray(c.sourceSplit) && c.sourceSplit.length === 2 ? c.sourceSplit : null;
const puts = split
? `${via} splits ${cell} between ${an(split[0])} and ${an(split[1])}.`
: ((c.sourceLetterSold === true || c.sourceLetter === c.label)
? `${via} puts ${cell} in ${an(c.label)}.`
: `${via} puts ${cell} in ${an(c.sourceLetter)}, which this listing doesn't sell.`);
return {
label: 'Not available here',
icon: '✕',
cls: 'availBad',
tooltip: c.inStock || !c.closestInStockLabel
? `${lead} The closest size this listing sells is ${c.label}${c.inStock ? '' : ' (not in stock)'}. ${puts}`
: `${lead} The closest size this listing sells is ${c.label} (not in stock). ${puts} ${namedClosestSentence(c.closestInStockNamed || { label: c.closestInStockLabel })}`,
};
}
if (gridResult.status === 'out-of-range' && Array.isArray(gridResult.unreadNearSize) && gridResult.unreadNearSize.length) {
const shown = calculatedLabel || (gridResult.trueSize && gridResult.trueSize.label) || 'Your size';
const closest = gridResult.nearestBeyondReach
? closestInStockSentence(gridResult.nearestBeyondReach, nearestLabel || gridResult.nearestBeyondReach.label, null)
: null;
return {
label: 'Not confirmed here',
icon: '○',
cls: 'availNeutral',
tooltip: `${shown} isn't among the sizes Measured Size can read on this listing. ${unreadLettersSentence(gridResult.unreadNearSize, null)}${closest ? ` ${closest}` : ''}`,
};
}
const beyond = gridResult.nearestBeyondReach;
if (beyond && beyond.targetLabel && beyond.label && beyond.distance > 1) {
const words = _bcK.NUMBER_WORDS.slice(0, 8);
const howFar = `${words[beyond.distance] || beyond.distance} sizes ${beyond.relation === 'size-down' ? 'smaller' : 'larger'}`;
return {
label: 'Not available here',
icon: '✕',
cls: 'availBad',
tooltip: `${beyond.targetLabel} isn't in stock on this listing. The closest size that is, ${beyond.label}, is ${howFar}, too far from your size to recommend.`,
};
}
if (beyond && beyond.targetLabel && beyond.label && typeof beyond.inches === 'number') {
return {
label: 'Not available here',
icon: '✕',
cls: 'availBad',
tooltip: `${calculatedLabel || beyond.targetLabel} isn't in stock on this listing. The closest size that is, ${nearestLabel || beyond.label}, is ${bandCupDistancePhrase(beyond.bandDiff, beyond.volumeDiff)}, too far from your size to recommend.`,
};
}
if (gridResult.listedSoldOut) {
return {
label: 'Not available here',
icon: '✕',
cls: 'availBad',
tooltip: `This listing sells your size as ${gridResult.listedSoldOut}, which isn't in stock. No other size it sells covers a size close enough to yours to recommend.`,
};
}
if (gridResult.soldOutHere) {
return {
label: 'Not available here',
icon: '✕',
cls: 'availBad',
tooltip: gridResult.closestInStockLabel
? `This listing sells your size, ${gridResult.soldOutHere}, and it isn't in stock right now. No other size is recommended in its place. ${namedClosestSentence(gridResult.closestInStockNamed || { label: gridResult.closestInStockLabel })}`
: `This listing sells your size, ${gridResult.soldOutHere}, and it isn't in stock right now. No other size is recommended in its place.`,
};
}
if (Array.isArray(gridResult.soldInPairs) && gridResult.soldInPairs.length === 2 && gridResult.pairedFrom) {
const closest = gridResult.closestInStockLabel ? ` ${namedClosestSentence(gridResult.closestInStockNamed || { label: gridResult.closestInStockLabel })}` : '';
return { label: 'Not available here', icon: '\u2715', cls: 'availBad', tooltip: `This listing sells ${gridResult.pairedFrom} as ${gridResult.soldInPairs[0]} and ${gridResult.soldInPairs[1]}, and neither is in stock. No other size is recommended in its place.${closest}` };
}
if (gridResult.soldAsPair && gridResult.pairedFrom) {
return {
label: 'Not available here',
icon: '✕',
cls: 'availBad',
tooltip: `This listing sells ${gridResult.pairedFrom} as ${gridResult.soldAsPair}, and ${gridResult.soldAsPair} isn't in stock. No other size is recommended in its place, because the next option on this listing is a pair of two other sizes.`,
};
}
if (gridResult.notMade && _bcVariantFeedFactText) {
const shown = calculatedLabel || (gridResult.trueSize && gridResult.trueSize.label);
if (shown) return { label: 'Not available here', icon: '✕', cls: 'availBad', tooltip: _bcVariantFeedFactText('notMade', shown) };
}
if (gridResult.closestInStockLabel) {
return { label: 'Not available here', icon: '✕', cls: 'availBad', tooltip: `This listing doesn't carry your size. ${namedClosestSentence(gridResult.closestInStockNamed || { label: gridResult.closestInStockLabel })}` };
}
return { label: 'Not available here', icon: '✕', cls: 'availBad', tooltip: "This listing doesn't carry your size, or anything close to it." };
}
function listingCupLettersSentence(letters) {
const joined = (cups) => (cups.length > 1 ? `${cups.slice(0, -1).join(', ')} and ${cups[cups.length - 1]}` : (cups[0] || ''));
const pastDD = letters.pastDD || [];
if (letters.decidedBy === 'letters') {
const ukOnly = pastDD.filter((c) => /^(FF|GG|HH|JJ|KK|LL)$/.test(c)).slice(0, 3);
return `This listing prints UK cup letters (it sells ${joined(ukOnly)}, which only UK sizing has), so your size is shown in UK letters.`;
}
if (letters.decidedBy === 'brand' && Array.isArray(letters.added) && letters.added.length) {
const brand = letters.brandName || 'This brand';
const added = letters.added.slice(0, 3);
const printed = joined(added.map((a) => a.printed));
const meaning = joined(added.map((a) => `${a.printed} is the US ${a.ours}`));
const lead = `This listing prints ${printed}, which ${brand} doesn't use itself. Read with ${brand}'s own letters and where the listing places it, ${meaning}, so your size is shown that way.`;
return letters.readThroughAdded ? `${lead} The listing doesn't say so itself, so this is rated lower.` : lead;
}
const list = joined(pastDD.slice(0, 4));
const meaning = letters.reading === 'continental'
? 'E is the US DD and F the US DDD'
: 'F is the US DDD';
const shape = letters.reading === 'continental' ? `cup letters ${list} with no DD` : `DD and then ${list} with no E or DDD`;
return `This listing prints ${shape}, which on listings like it means ${meaning}, so your size is shown that way. The listing doesn't say so itself, so this is rated lower.`;
}
function letterSizeArticle(label) {
return /^[SMLX]/i.test(String(label || '')) ? 'an' : 'a';
}
function usualLetterSentence(matchDetail, displayBaseLabel) {
const size = displayBaseLabel || matchDetail.baseLabel;
const given = matchDetail.equivalentOf || matchDetail.bucketLabel;
const letter = `${letterSizeArticle(given)} ${given}`;
const sameSize = matchDetail.equivalentOf
? ` This listing sells it as ${matchDetail.bucketLabel}: charts that print both give ${matchDetail.equivalentOf} and ${matchDetail.bucketLabel} as one size.`
: '';
const split = Array.isArray(matchDetail.split) && matchDetail.split.length === 2 ? matchDetail.split : null;
const floored = matchDetail.floored;
if (floored && Array.isArray(floored.split) && floored.split.length >= 2) {
const letters = floored.split.map(([l]) => l);
const named = `${letters.slice(0, -1).join(', ')} and ${letters[letters.length - 1]}`;
const [[firstLetter, firstVotes], ...others] = floored.split;
const othersSaid = others.map(([l, v], i) => `${i === others.length - 1 ? 'and ' : ''}${v} give ${l}`).join(', ');
return `Brands split between ${named} for your ${size}: ${firstVotes} of the ${matchDetail.total} brand size charts Measured Size has that list it give ${firstLetter}, ${othersSaid}, so the charts disagree. ${given} is shown: ${floored.cell}, a smaller size, ${floored.fromTie ? 'can get' : 'gets'} ${letter}, and a larger size never gets a smaller letter.${sameSize}`;
}
if (split) {
const [[a, va], [b, vb]] = split;
const shown = given;
const why = matchDetail.splitPick === 'in stock' ? `${shown} is the one of the two this listing has in stock.`
: (matchDetail.splitPick === 'sold' ? `${shown} is the one of the two this listing sells.`
: (matchDetail.splitPick === 'nearest' ? `${shown} is the one of the two nearer a size this listing has in stock.`
: (matchDetail.splitPick === 'majority' ? `${shown}, the one more of them give, is shown.` : `${shown}, the larger, is shown.`)));
return `Brands split between ${a} and ${b} for your ${size}: ${va} of the ${matchDetail.total} brand size charts Measured Size has that list it give ${a}, and ${vb} give ${b}. ${why}${sameSize}`;
}
if (!matchDetail.agree) {
const from = matchDetail.raisedBy;
return from
? `None of the ${matchDetail.total} brand size charts Measured Size has that list your ${size} give ${letter}. ${from.agree} of the ${from.total} that list ${from.cell}, a smaller size, give it ${letter}, and a larger size never gets a smaller letter, so yours is ${letter}.${sameSize}`
: `None of the ${matchDetail.total} brand size charts Measured Size has that list your ${size} give ${letter}; it is ${letter} because the charts give that to a smaller size, and a larger size never gets a smaller letter.${sameSize}`;
}
return (matchDetail.agree * 2 > matchDetail.total
? `${matchDetail.agree} of the ${matchDetail.total} brand size charts Measured Size has that list your ${size} put it in ${letter}.`
: `Brand size charts disagree about your ${size}: ${matchDetail.agree} of the ${matchDetail.total} Measured Size has that list it put it in ${letter}.`) + sameSize;
}
function provenanceFor(confidenceFactors, extractionTier) {
const matchDetail = confidenceFactors && confidenceFactors.matchDetail;
if (!matchDetail) return null;
if (matchDetail.usedProductClaim || matchDetail.bandAdjustmentApplied || matchDetail.cupAdjustmentApplied) {
return { sourceLabel: 'product description', detectionLabel: 'product description' };
}
const usedRealChart = matchDetail.type === 'chartMatch' || matchDetail.type === 'listedSize'
|| (matchDetail.type === 'staticTable' && !matchDetail.fromPublishedTable);
if (!usedRealChart) return null;
const detectionLabel = (typeof extractionTier === 'string' && extractionTier) ? extractionTier : null;
if (!detectionLabel) return null;
return { sourceLabel: "this listing's own size chart", detectionLabel };
}
const CARD_LINE_WORD_LIMIT = _bcK.CARD_LINE_WORD_LIMIT;
const cardLineWords = (text) => String(text || '').split(/\s+/).filter(Boolean).length;
function tidyColourName(name) {
const text = String(name || '').trim().replace(/\s+/g, ' ');
return (text === text.toUpperCase() && /[A-Z]/.test(text))
? text.toLowerCase().replace(/(^|[\s/(-])([a-z])/g, (m, lead, ch) => lead + ch.toUpperCase())
: text;
}
function otherColourCardLine(found, herSize, shownSize, onScreen) {
if (!found || !Array.isArray(found.colours) || !found.colours.length || !herSize) return null;
if (!found.own && !shownSize) return null;
const colours = found.colours.map(tidyColourName);
const here = onScreen ? tidyColourName(onScreen) : 'the colour shown';
const listOf = (n) => {
const named = colours.slice(0, n);
const more = colours.length - named.length;
const counted = `${more} other colour${more === 1 ? '' : 's'}`;
if (!named.length) return counted;
if (more > 0) return `${named.join(', ')} and ${counted}`;
return named.length === 1 ? named[0] : `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}`;
};
const say = (list) => (found.own
? `Your ${herSize} is in stock in ${list}, not ${here}.`
: `Your ${herSize} isn't in stock in any colour; ${shownSize} is, in ${list}.`);
for (let n = Math.min(3, colours.length); n > 0; n -= 1) {
const text = say(listOf(n));
if (cardLineWords(text) <= CARD_LINE_WORD_LIMIT) return text;
}
return say(listOf(0));
}
function closestDistancePhrase(bandDiff, volumeDiff) {
const words = _bcK.NUMBER_WORDS;
const count = (n, noun) => `${words[Math.abs(n)] || Math.abs(n)} ${noun}${Math.abs(n) === 1 ? '' : 's'}`;
if (bandDiff === 0) return `${count(volumeDiff, 'cup size')} ${volumeDiff > 0 ? 'larger' : 'smaller'}, same band`;
const band = `${count(bandDiff, 'band size')} ${bandDiff > 0 ? 'larger' : 'smaller'}`;
return volumeDiff === 0 ? `${band}, same cup volume` : `${band}, ${count(volumeDiff, 'cup size')} ${volumeDiff > 0 ? 'more' : 'less'} volume`;
}
function closestInStockSentence(beyond, shownLabel, colour) {
if (!beyond || !(shownLabel || beyond.label)) return null;
const words = _bcK.NUMBER_WORDS;
const count = (n, noun) => `${words[Math.abs(n)] || Math.abs(n)} ${noun}${Math.abs(n) === 1 ? '' : 's'}`;
let howFar = null;
if (beyond.bandOnly === true && typeof beyond.bandDiff === 'number' && beyond.bandDiff !== 0) {
howFar = bandOnlyDistancePhrase(beyond.bandDiff);
} else if (typeof beyond.inches === 'number' && typeof beyond.bandDiff === 'number' && typeof beyond.volumeDiff === 'number') {
howFar = closestDistancePhrase(beyond.bandDiff, beyond.volumeDiff);
} else if (typeof beyond.distance === 'number' && beyond.distance > 0) {
howFar = `${count(beyond.distance, 'size')} ${beyond.relation === 'size-down' ? 'smaller' : 'larger'}`;
}
if (!howFar) return null;
const where = colour ? ` in ${tidyColourName(colour)}` : '';
return `Closest in stock${where}: ${shownLabel || beyond.label}, ${howFar}.`;
}
function namedClosestSentence(named) {
if (!named || !named.label) return null;
return closestInStockSentence(named, named.label, null) || `Closest in stock: ${named.label}.`;
}
function chartBetweenCardLine(matchDetail) {
if (!matchDetail || matchDetail.type !== 'chartMatch') return null;
const alternate = matchDetail.boundaryAlternate;
if (!alternate || !alternate.label || !matchDetail.bucketLabel || alternate.label === matchDetail.bucketLabel) return null;
if (matchDetail.matchType === 'pair' && matchDetail.pairMatchType === 'sister') return null;
if (matchDetail.tiedWith && matchDetail.tiedWith !== matchDetail.bucketLabel) return `Between ${matchDetail.bucketLabel} and ${alternate.label} on this chart.`;
return `Between ${matchDetail.bucketLabel} and ${alternate.label} on this chart; ${matchDetail.bucketLabel} is closer.`;
}
function cardLine(pieces) {
const p = pieces || {};
const order = [['oneSize', p.oneSize], ['brandData', p.brandData], ['storeSizes', p.storeSizes], ['otherColour', p.otherColour], ['closest', p.closest], ['bandOnly', p.bandOnly], ['substitute', p.substitute], ['twoSizes', p.twoSizes], ['pastChartEdge', p.pastChartEdge], ['between', p.between], ['stock', p.stock]]
.filter(([, text]) => !!text);
if (!order.length) return { text: null, kind: null, displaced: [] };
return { text: order[0][1], kind: order[0][0], displaced: order.slice(1).map(([kind, text]) => ({ kind, text })) };
}
const BAND_ONLY_LINE = "This bra is sold by band only, so the cup fit isn't checked.";
const ONE_SIZE_ONLY_LINE = "This bra comes in one size only, so Measured Size can't check it against yours.";
const BRAND_DATA_UNAVAILABLE_LINE = "Measured Size couldn't load its brand data, so this is your base size, not this store's size.";
const STORE_SIZES_UNREAD_LINE = "Measured Size can't read this store's sizes, so this is your base size, not one from this listing.";
function bandOnlyDistancePhrase(bandDiff) {
const words = _bcK.NUMBER_WORDS;
const n = Math.abs(bandDiff);
return `${words[n] || n} band size${n === 1 ? '' : 's'} ${bandDiff > 0 ? 'larger' : 'smaller'}`;
}
function pastChartEdgeCardLine(pastChartEdge) {
return pastChartEdge.direction === 'larger'
? "Your band is one size larger than this chart's largest."
: "Your band is one size smaller than this chart's smallest.";
}
function twoSizesCardLine(twoSizes, shownLabel, printed) {
const brand = (twoSizes.brandDisplayName || '').replace(/\s*\([^)]*\)\s*$/, '');
const [a, b] = twoSizes.sizes.map(printed);
const lead = `${brand ? `${brand}'s` : "The brand's"} chart gives your size as ${a} or ${b}`;
if (!twoSizes.stockRead) return `${lead}.`;
if (twoSizes.pick === 'in stock') return `${lead}; ${shownLabel} is in stock.`;
if (twoSizes.pick === 'larger') return `${lead}; both are in stock, and ${shownLabel} is the larger.`;
return `${lead}; neither is in stock.`;
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = { BAND_ONLY_LINE, ONE_SIZE_ONLY_LINE, BRAND_DATA_UNAVAILABLE_LINE, STORE_SIZES_UNREAD_LINE, bandOnlyWhy, bandOnlyDistancePhrase, namedClosestSentence, pastChartEdgeCardLine, twoSizesCardLine, closestInStockSentence, closestDistancePhrase, styleFitBadgeText, qualityDetailText, baseSizeStepText, brandChartGapDetailText, confidenceClass, styleFitExplanation, fitCheckTipKey, fitCheckTipText, FIT_CHECK_TIP_TEXT, CHOOSE_SIZE_HINT_TEXT, composeAdjustmentSummary, availabilityInfo, unreadLettersSentence, unreadLettersStepText, NO_STYLE_ADJUSTMENT_NOTE, provenanceFor, whyLineArguedAlternate, nearbyRowReason, NEARBY_PLAIN_REASON, crossRetailerNoteParts, garmentTypesPhrase, FIT_CHECK_LOWER_TIERS, substituteGapPhrase, substituteCardLine, substitutionWhy, cardLine, chartBetweenCardLine, otherColourCardLine, CARD_LINE_WORD_LIMIT, CROSS_RETAILER_SUMMARY_CHAR_LIMIT, belowBandFloorSentence, usualLetterSentence, letterSizeArticle, listingCupLettersSentence };
}
/* src/decideAnswer.js */
const _daNode = typeof module !== 'undefined' && module.exports;
let _daEngineCache = null;
function _daEngine() {
if (_daEngineCache) return _daEngineCache;
_daEngineCache = _daBuildEngine();
return _daEngineCache;
}
function _daBuildEngine() {
if (_daNode) {
const engine = {};
const _fitEngine = require('./fitEngine');
engine.calculateSize = _fitEngine.calculateSize;
engine.belowFloorClaimSize = _fitEngine.belowFloorClaimSize;
engine.belowFloorSize = _fitEngine.belowFloorSize;
const _brandFormula = require('./brandFormula');
engine.hasVerifiedBandFormula = _brandFormula.hasVerifiedBandFormula;
engine.hasRecordOnlyBandRule = _brandFormula.hasRecordOnlyBandRule;
engine.hasWholeInchOnlyVerification = _brandFormula.hasWholeInchOnlyVerification;
engine.calculateBrandSize = _brandFormula.calculateBrandSize;
const _styleAdjustment = require('./styleAdjustment');
engine.cupGroupSizesForListing = _styleAdjustment.cupGroupSizesForListing;
engine.getAdjustedSize = _styleAdjustment.getAdjustedSize;
engine.withListingCupLetters = _styleAdjustment.withListingCupLetters;
engine.listedSizeResult = _styleAdjustment.listedSizeResult;
engine.hasNoResolvableAlphaSize = _styleAdjustment.hasNoResolvableAlphaSize;
engine.cupGroupListedSizes = _styleAdjustment.cupGroupListedSizes;
engine.projectVerifiedAlphaLabel = _styleAdjustment.projectVerifiedAlphaLabel;
engine.closestLetterBeyondSources = _styleAdjustment.closestLetterBeyondSources;
const _sizeAvailability = require('./sizeAvailability');
engine.sizeGridPairsReadable = _sizeAvailability.sizeGridPairsReadable;
engine.findUnmadeListingSize = _sizeAvailability.findUnmadeListingSize;
engine.findAvailableSize = _sizeAvailability.findAvailableSize;
engine.withStockShown = _sizeAvailability.withStockShown;
engine.halfCupShown = _sizeAvailability.halfCupShown;
engine.bandOnlyStock = _sizeAvailability.bandOnlyStock;
engine.readListingCupRange = _sizeAvailability.readListingCupRange;
const _alphaSizeAvailability = require('./alphaSizeAvailability');
engine.listedSizeFor = _alphaSizeAvailability.listedSizeFor;
engine.findAvailableListedSize = _alphaSizeAvailability.findAvailableListedSize;
engine.findAvailableAlphaSize = _alphaSizeAvailability.findAvailableAlphaSize;
const _cupDisplay = require('./cupDisplay');
engine.entryForHostCupLetters = _cupDisplay.entryForHostCupLetters;
engine.entryForListingCupLetters = _cupDisplay.entryForListingCupLetters;
engine.listedCupLetters = _cupDisplay.listedCupLetters;
engine.displayCup = _cupDisplay.displayCup;
engine.displaySizeLabel = _cupDisplay.displaySizeLabel;
const _letterConsensus = require('./letterConsensus');
engine.brandRecordsLetterSizing = _letterConsensus.brandRecordsLetterSizing;
engine.usableListingChart = require('./chartMatcher').usableListingChart;
return engine;
}
return {
calculateSize, belowFloorClaimSize, belowFloorSize,
hasVerifiedBandFormula, hasRecordOnlyBandRule, hasWholeInchOnlyVerification, calculateBrandSize,
cupGroupSizesForListing, getAdjustedSize, withListingCupLetters, listedSizeResult, hasNoResolvableAlphaSize, cupGroupListedSizes, projectVerifiedAlphaLabel, closestLetterBeyondSources,
sizeGridPairsReadable, findUnmadeListingSize, findAvailableSize, withStockShown, halfCupShown, bandOnlyStock, readListingCupRange,
listedSizeFor, findAvailableListedSize, findAvailableAlphaSize,
entryForHostCupLetters, entryForListingCupLetters, listedCupLetters, displayCup, displaySizeLabel,
brandRecordsLetterSizing, usableListingChart,
};
}
function sizeAtOwnBandBelowFloor(size, steps) {
if (!size || size.bandClamped || size.band == null) return size;
const own = _daEngine().belowFloorSize(size, steps);
if (!own) return size;
return {
...size,
band: own.band,
cup: own.cup,
label: own.label,
belowBandFloor: { band: own.band, cup: own.cup, label: own.label, steps, sister: { band: size.band, cup: size.cup, label: size.label } },
};
}
function gridSaysNotMade(grid, size) {
if (!grid || !size || size.band == null || !size.cup) return false;
if (grid.splitSelector !== true) {
const offered = Array.isArray(grid.offeredPairs) ? grid.offeredPairs : [];
if (!offered.length) return false;
if (Array.isArray(grid.cupRow)) return !offered.some((pair) => Number(/^\d+/.exec(pair)[0]) === size.band);
return !offered.includes(`${size.band}${size.cup}`);
}
if (Array.isArray(grid.offeredBands) && grid.offeredBands.length && !grid.offeredBands.includes(size.band)) return true;
return grid.cupRowBand === size.band && Array.isArray(grid.cupRowCups) && grid.cupRowCups.length > 0 && !grid.cupRowCups.includes(size.cup);
}
function notMadeByRows(size) {
return {
status: 'out-of-range',
trueSize: { band: size.band, cup: size.cup, label: `${size.band}${size.cup}` },
candidates: [],
note: "This listing's own size rows don't include this size.",
notMade: true,
notOfferedByRows: true,
};
}
function decideAnswer(response, measurements, brandData, styleModifiers) {
const {
calculateSize,
belowFloorClaimSize,
belowFloorSize,
hasVerifiedBandFormula,
hasRecordOnlyBandRule,
hasWholeInchOnlyVerification,
calculateBrandSize,
cupGroupSizesForListing,
getAdjustedSize,
withListingCupLetters,
listedSizeResult,
hasNoResolvableAlphaSize,
cupGroupListedSizes,
projectVerifiedAlphaLabel,
closestLetterBeyondSources,
sizeGridPairsReadable,
findUnmadeListingSize,
findAvailableSize,
withStockShown,
halfCupShown,
bandOnlyStock,
readListingCupRange,
listedSizeFor,
findAvailableListedSize,
findAvailableAlphaSize,
entryForHostCupLetters,
entryForListingCupLetters,
listedCupLetters,
displayCup,
displaySizeLabel,
brandRecordsLetterSizing,
usableListingChart,
} = _daEngine();
const brandEntry = entryForHostCupLetters(brandData.brands.find((b) => b.id === response.brandId),
{ printsThisProjectsCupLetters: response.hostPrintsThisProjectsCupLetters === true });
const displayEntry = entryForListingCupLetters(brandEntry, response.listingCupLetters || null);
const detectionMeta = {
source: response.product.source,
ambiguous: response.product.ambiguous,
styleAttributes: response.product.styleAttributes,
fullText: response.product.fullText,
sizeChart: response.sizeChart,
listingChart: usableListingChart(response.listingChart) || usableListingChart(response.pageListingChartFallback || null),
listingBrandSizing: response.listingBrandSizing || null,
brandAlphaTable: (brandEntry && brandEntry.alpha_size_table && !brandEntry.alpha_size_table.record_only)
? brandEntry.alpha_size_table : null,
brandCupGroupSizes: (() => {
const listing = cupGroupSizesForListing(brandEntry, response.alphaGrid || null);
return (listing && !listing.held) ? listing : null;
})(),
listingLetters: (response.alphaGrid && (response.alphaGrid.offeredLabels || response.alphaGrid.availableLabels)) || null,
listingLettersInStock: (response.alphaGrid && response.alphaGrid.offeredLabels && response.alphaGrid.availableLabels) || null,
usualLetterAllowed: (!brandEntry || !brandRecordsLetterSizing(brandEntry)) && !(response.grid && !response.alphaGrid),
brandFormulaVerified: hasVerifiedBandFormula(brandEntry),
brandBandRuleRecordOnly: hasRecordOnlyBandRule(brandEntry),
brandFormulaWholeInchOnly: hasWholeInchOnlyVerification(brandEntry),
brandDisplayName: (brandEntry && brandEntry.display_name) || null,
brandId: response.brandId,
rawMeasurements: measurements,
};
let brandBaseSize = (brandEntry && brandEntry.band_formula)
? calculateBrandSize(measurements.underbust, measurements.bust, brandEntry)
: calculateSize(measurements.underbust, measurements.bust);
let adjusted = getAdjustedSize(brandBaseSize, response.product.styleKey, styleModifiers, detectionMeta);
if (brandBaseSize.belowBandFloor) {
const matchDetail = adjusted.confidenceFactors && adjusted.confidenceFactors.matchDetail;
const claimSteps = (matchDetail && matchDetail.bandAdjustmentSteps) || 0;
const claimed = (claimSteps && adjusted.band != null && !adjusted.bandClamped)
? belowFloorClaimSize(adjusted, brandBaseSize, brandBaseSize.belowBandFloor.steps, claimSteps)
: null;
adjusted = claimed ? { ...adjusted, ...claimed } : sizeAtOwnBandBelowFloor(adjusted, brandBaseSize.belowBandFloor.steps);
brandBaseSize = sizeAtOwnBandBelowFloor(brandBaseSize, brandBaseSize.belowBandFloor.steps);
}
if (response.brandDataUnavailable === true) {
const base = brandBaseSize;
return {
product: response.product,
adjusted: {
label: base.label,
band: base.band,
cup: base.cup,
...(base.belowBandFloor ? { belowBandFloor: base.belowBandFloor } : {}),
...(base.beyondLadder ? { beyondLadder: base.beyondLadder } : {}),
...(base.beyondBandLadder ? { beyondBandLadder: base.beyondBandLadder } : {}),
confidence: 'Uncertain, check size chart',
confidenceFactors: {
source: response.product.source,
ambiguous: response.product.ambiguous,
styleKey: response.product.styleKey,
matchDetail: { type: 'brandDataUnavailable', styleKey: response.product.styleKey, baseLabel: base.label },
},
},
gridResult: null,
gridSkippedReason: 'brand-data-unavailable',
productUnavailable: response.productUnavailable,
measurements,
provenance: response.provenance,
baseSize: base,
stockStatus: response.stockStatus,
alphaProjection: null,
displayEntry: null,
grids: { grid: response.grid || null, alphaGrid: response.alphaGrid || null, variantFeed: response.variantFeed || null, otherColours: response.otherColours || null },
brandEntry: null,
detectionMeta,
};
}
adjusted = withListingCupLetters(adjusted, response.listingCupLetters || null);
const listedFromSize = brandBaseSize.belowBandFloor ? brandBaseSize.belowBandFloor.sister
: ((brandBaseSize.bandClamped && brandBaseSize.honestBand != null)
? { band: brandBaseSize.honestBand, cup: brandBaseSize.honestCup, label: brandBaseSize.honestLabel }
: { band: brandBaseSize.band, cup: brandBaseSize.cup, label: brandBaseSize.label });
const listedSize = (response.alphaGrid && response.alphaGrid.listedSizes && !response.grid && !adjusted.outOfScope
&& !adjusted.brandChartGap && !brandBaseSize.beyondLadder && !brandBaseSize.beyondBandLadder)
? listedSizeFor(listedFromSize, response.alphaGrid, listedCupLetters(displayEntry, response.alphaGrid))
: null;
if (listedSize) {
adjusted = listedSizeResult(adjusted, listedSize, listedFromSize, response.product.styleKey, response.product.source, response.product.ambiguous);
}
let gridResult = null;
let gridSkippedReason = null;
let alphaProjection = null;
if (adjusted.brandChartGap) {
gridSkippedReason = 'brand-chart-gap';
} else if (adjusted.band == null) {
if (hasNoResolvableAlphaSize(adjusted)) {
gridSkippedReason = 'no-size-resolved';
if (gridSaysNotMade(response.grid, brandBaseSize)) {
gridResult = sizeGridPairsReadable(response.grid) && Array.isArray(response.grid.availablePairs)
? findAvailableSize({ band: brandBaseSize.band, cup: brandBaseSize.cup }, response.grid)
: notMadeByRows(brandBaseSize);
if (typeof withStockShown === 'function' && gridResult.status !== 'out-of-range') gridResult = withStockShown(gridResult, response.grid);
gridSkippedReason = null;
}
} else if (adjusted.listedSize && response.alphaGrid) {
gridResult = findAvailableListedSize(listedFromSize, adjusted.listedSize, response.alphaGrid, listedCupLetters(displayEntry, response.alphaGrid));
} else if (response.alphaGrid) {
gridResult = findAvailableAlphaSize(adjusted.label, response.alphaGrid);
const unreadTop = response.alphaGrid.stockUnread === true && gridResult && gridResult.candidates && gridResult.candidates[0];
if (unreadTop && !gridResult.stockUnconfirmed) gridResult = { ...gridResult, stockUnconfirmed: unreadTop.label };
const cupGroupHit = adjusted.confidenceFactors && adjusted.confidenceFactors.matchDetail && adjusted.confidenceFactors.matchDetail.cupGroupSize;
const cupGroupCell = cupGroupHit && /^(\d+)([A-Z]+)$/.exec(cupGroupHit.cell);
if (gridResult.status === 'out-of-range' && !gridResult.soldAsPair && cupGroupCell && detectionMeta.brandCupGroupSizes) {
gridResult = findAvailableListedSize({ band: Number(cupGroupCell[1]), cup: cupGroupCell[2] }, { token: adjusted.label, cell: cupGroupHit.cell },
{ ...response.alphaGrid, listedSizes: cupGroupListedSizes(detectionMeta.brandCupGroupSizes) }, null);
}
} else {
gridSkippedReason = 'no-grid-data';
}
} else if (!response.grid) {
const projectFrom = adjusted.belowBandFloor ? adjusted.belowBandFloor.sister : adjusted;
const projectedLabel = projectVerifiedAlphaLabel(projectFrom.band, projectFrom.cup, detectionMeta.brandAlphaTable, measurements);
if (response.alphaGrid && projectedLabel) {
alphaProjection = { label: projectedLabel, availableLabels: response.alphaGrid.availableLabels };
gridResult = findAvailableAlphaSize(projectedLabel, response.alphaGrid);
} else {
gridSkippedReason = 'no-grid-data';
}
} else if (!sizeGridPairsReadable(response.grid)) {
const grid = response.grid;
gridSkippedReason = (grid.pairsRequired === true && grid.pairsListDeclared === true)
? 'stock-list-unread'
: 'no-grid-data';
const unmade = (gridSkippedReason === 'no-grid-data' && !(brandEntry && brandEntry.cup_display))
? findUnmadeListingSize({ band: adjusted.band, cup: adjusted.cup }, response.listingMadeSizes, brandEntry)
: null;
if (unmade) {
gridResult = unmade;
gridSkippedReason = null;
}
if (!gridResult && gridSaysNotMade(grid, adjusted)) {
gridResult = notMadeByRows(adjusted);
gridSkippedReason = null;
}
} else {
gridResult = findAvailableSize({ band: adjusted.band, cup: adjusted.cup }, response.grid);
if (typeof withStockShown === 'function') gridResult = withStockShown(gridResult, response.grid);
}
if (response.sizeListUnread === true && gridSkippedReason === 'no-grid-data' && !response.grid && !response.alphaGrid) {
gridSkippedReason = 'size-list-unread';
}
if (response.storeUnknown === true && (gridSkippedReason === 'no-grid-data' || gridSkippedReason === 'size-list-unread')
&& !response.grid && !response.alphaGrid && !response.bandOnly && !response.oneSizeOnly && !adjusted.outOfScope) {
const base = brandBaseSize;
adjusted = {
label: base.label,
band: base.band,
cup: base.cup,
...(base.belowBandFloor ? { belowBandFloor: base.belowBandFloor } : {}),
...(base.beyondLadder ? { beyondLadder: base.beyondLadder } : {}),
...(base.beyondBandLadder ? { beyondBandLadder: base.beyondBandLadder } : {}),
confidence: 'Uncertain, check size chart',
confidenceFactors: {
source: response.product.source,
ambiguous: response.product.ambiguous,
styleKey: response.product.styleKey,
matchDetail: { type: 'storeSizesUnread', styleKey: response.product.styleKey, baseLabel: base.label },
},
};
gridResult = null;
gridSkippedReason = 'store-sizes-unread';
}
const listingLetterOptions = (response.alphaGrid && (response.alphaGrid.offeredLabels || response.alphaGrid.availableLabels)) || [];
if (response.alphaGrid && !response.grid && listingLetterOptions.length && !response.productUnavailable && !adjusted.outOfScope
&& (gridSkippedReason === 'no-size-resolved' || (adjusted.band != null && gridSkippedReason === 'no-grid-data'))) {
const shownSize = adjusted.band != null ? adjusted : brandBaseSize;
const own = (shownSize.bandClamped && shownSize.honestBand != null)
? { band: shownSize.honestBand, cup: shownSize.honestCup, label: shownSize.honestLabel }
: { band: shownSize.band, cup: shownSize.cup, label: shownSize.label };
const rankFrom = brandBaseSize.belowBandFloor ? brandBaseSize.belowBandFloor.sister : own;
const closest = closestLetterBeyondSources(rankFrom, detectionMeta, response.alphaGrid);
const coverageCups = closest && closest.coverage ? closest.coverage.cups : null;
const coverageCupsShown = coverageCups && displayEntry && displayEntry.cup_display && typeof displayCup === 'function'
? coverageCups.map((cup) => displayCup(cup, displayEntry))
: null;
gridResult = {
status: 'out-of-range',
trueSize: own,
candidates: [],
note: 'No size chart Measured Size can use gives this size a letter size.',
noLetterSource: true,
closestLetter: closest ? {
...closest,
own: own.label,
usualAllowed: detectionMeta.usualLetterAllowed === true,
sourceName: (brandEntry && brandEntry.display_name) || null,
ownLettersShown: !(displayEntry && displayEntry.cup_display),
...(coverageCupsShown && coverageCupsShown.every(Boolean) ? { coverageCupsShown } : {}),
} : null,
};
gridSkippedReason = null;
}
const ownBaseSize = (brandBaseSize.bandClamped && brandBaseSize.honestBand != null)
? { band: brandBaseSize.honestBand, cup: brandBaseSize.honestCup, label: brandBaseSize.honestLabel }
: { band: brandBaseSize.band, cup: brandBaseSize.cup, label: brandBaseSize.label };
const styleFacts = { source: response.product.source, ambiguous: response.product.ambiguous, styleKey: response.product.styleKey };
if (response.oneSizeOnly && !response.grid && !response.alphaGrid && !response.bandOnly && !adjusted.outOfScope) {
adjusted = {
label: ownBaseSize.label,
band: ownBaseSize.band,
cup: ownBaseSize.cup,
...(brandBaseSize.belowBandFloor ? { belowBandFloor: brandBaseSize.belowBandFloor } : {}),
confidence: adjusted.confidence,
confidenceFactors: { ...styleFacts, matchDetail: { type: 'oneSizeOnly', styleKey: response.product.styleKey, baseLabel: ownBaseSize.label, option: response.oneSizeOnly.label || null } },
};
gridResult = null;
gridSkippedReason = 'one-size-only';
}
const detailNow = adjusted.confidenceFactors && adjusted.confidenceFactors.matchDetail;
const brandSizeChartAnswered = adjusted.band == null && !!(detailNow && detailNow.type === 'staticTable' && detailNow.listingBrandSizeChart);
const bandOnly = response.bandOnly;
if (bandOnly && Array.isArray(bandOnly.offeredBands) && bandOnly.offeredBands.length && !response.grid && !response.alphaGrid
&& !adjusted.outOfScope && !adjusted.brandChartGap && !brandBaseSize.beyondLadder && !brandBaseSize.beyondBandLadder && !brandSizeChartAnswered) {
const ownSize = (adjusted.band != null && !adjusted.bandClamped && !adjusted.belowBandFloor)
? { band: adjusted.band, cup: adjusted.cup, label: adjusted.label }
: ownBaseSize;
const lookup = brandBaseSize.belowBandFloor ? brandBaseSize.belowBandFloor.sister : ownSize;
const cupRange = typeof readListingCupRange === 'function' ? readListingCupRange(response.product.fullText || '') : null;
const result = (cupRange && !cupRange.cups.includes(lookup.cup))
? {
status: 'out-of-range',
trueSize: { band: lookup.band, cup: lookup.cup, label: `${lookup.band}${lookup.cup}` },
candidates: [],
note: `This listing's own description says it is made for ${cupRange.from} to ${cupRange.to} cups, which leaves out yours.`,
bandOnly: true,
cupRangeExcluded: cupRange,
}
: bandOnlyStock(lookup, bandOnly);
if (result) {
adjusted = {
label: ownSize.label,
band: ownSize.band,
cup: ownSize.cup,
...(brandBaseSize.belowBandFloor ? { belowBandFloor: brandBaseSize.belowBandFloor } : {}),
confidence: 'Uncertain, check size chart',
confidenceFactors: {
...styleFacts,
matchDetail: {
type: 'bandOnly', styleKey: response.product.styleKey, baseLabel: ownSize.label, band: lookup.band, soldHere: result.soldHere === true,
...(cupRange ? { cupRange } : {}),
},
},
};
gridResult = result;
gridSkippedReason = null;
}
}
const halfCup = (adjusted.band != null && !adjusted.bandClamped && !adjusted.beyondLadder && !adjusted.beyondBandLadder && !(gridResult && gridResult.bandOnly)
&& !brandBaseSize.belowBandFloor && adjusted.band === brandBaseSize.band && adjusted.cup === brandBaseSize.cup)
? halfCupShown(measurements, adjusted, response.variantFeed || null)
: null;
if (halfCup) {
const shownHalf = (cup, label) => displaySizeLabel({ band: halfCup.band, cup, label }, displayEntry || null);
adjusted = {
...adjusted,
label: halfCup.label,
cup: halfCup.cup,
confidenceFactors: {
...(adjusted.confidenceFactors || {}),
halfCup: {
shown: shownHalf(halfCup.cup, halfCup.label),
lower: shownHalf(halfCup.cup, `${halfCup.band}${halfCup.cup}`),
upper: shownHalf(halfCup.upperCup, `${halfCup.band}${halfCup.upperCup}`),
},
},
};
gridResult = { status: 'exact', candidates: [{ label: halfCup.label, band: halfCup.band, cup: halfCup.cup, relation: 'exact', distance: 0, confidence: adjusted.confidence, note: '' }], note: '' };
}
adjusted = ratedByWhatWasConfirmed(adjusted, gridResult);
adjusted = ratedByOverlappingPairs(adjusted, gridResult);
return {
product: response.product,
adjusted,
gridResult,
gridSkippedReason,
productUnavailable: response.productUnavailable,
measurements,
provenance: response.provenance,
baseSize: brandBaseSize,
stockStatus: response.stockStatus,
alphaProjection,
displayEntry,
grids: { grid: response.grid || null, alphaGrid: response.alphaGrid || null, variantFeed: response.variantFeed || null, otherColours: response.otherColours || null },
brandEntry,
detectionMeta,
};
}
function ratedByWhatWasConfirmed(adjusted, gridResult) {
if (!adjusted || adjusted.band == null || adjusted.outOfScope || adjusted.bandClamped || adjusted.beyondLadder
|| adjusted.beyondBandLadder || adjusted.belowBandFloor) return adjusted;
const detail = (adjusted.confidenceFactors && adjusted.confidenceFactors.matchDetail) || null;
const styled = detail && detail.type === 'cupShift';
const unstyled = adjusted.confidence === 'No style detected';
if (!styled && !unstyled) return adjusted;
if (detail && (detail.verifiedFormula || detail.usedProductClaim || detail.bandAdjustmentApplied || detail.cupAdjustmentApplied)) return adjusted;
const top = gridResult && gridResult.candidates && gridResult.candidates[0];
const confirmed = !!(gridResult && gridResult.status === 'exact' && top && top.relation === 'exact' && !gridResult.stockUnconfirmed);
return { ...adjusted, confidence: confirmed ? 'Good match' : 'Likely fits', ratedBy: confirmed ? 'on the listing, in stock' : 'not confirmed in stock here' };
}
function ratedByOverlappingPairs(adjusted, gridResult) {
if (!adjusted || !gridResult || gridResult.status !== 'exact' || !gridResult.bothInStock) return adjusted;
const ladder = (_daNode ? require('./sizingConstants') : SIZING_CONSTANTS).RATING_LADDER;
const rung = ladder.indexOf(adjusted.confidence);
if (rung === -1) return adjusted;
return { ...adjusted, confidence: ladder[Math.min(rung + 1, ladder.length - 1)], ratedBy: 'her letter is in two overlapping options, both in stock' };
}
if (_daNode) {
module.exports = { decideAnswer, sizeAtOwnBandBelowFloor, ratedByWhatWasConfirmed };
}
/* release/calculator/answers.js */
const CALC_BAND_CUP_STYLE = 'underwire';
const CALC_LETTER_STYLES = ['bralette', 'listingLetterSized'];
const CALC_REFUSALS = ["Outside this brand's range", "Not on this brand's chart", "Between this brand's chart rows"];
function calcMeasurementsFromEntry(underbustText, bustText, unit) {
const rawUnderbust = parseFloat(underbustText);
const rawBust = parseFloat(bustText);
const cmPerInch = SIZING_CONSTANTS.CM_PER_INCH;
const underbust = unit === 'cm' ? Math.round((rawUnderbust / cmPerInch) * 100) / 100 : rawUnderbust;
const bust = unit === 'cm' ? Math.round((rawBust / cmPerInch) * 100) / 100 : rawBust;
const validation = validateMeasurements(underbust, bust, unit);
if (!validation.valid) return { valid: false, message: validation.message };
return { valid: true, underbust, bust, unit };
}
function calcYourSize(m) {
const size = calculateSize(m.underbust, m.bust);
if (size.beyondBandLadder && size.trueBand < size.band) {
return { size, label: `≤${size.band}`, note: 'Below the smallest band we can size.', kind: 'belowBands' };
}
if (size.beyondBandLadder) return { size, label: `${size.band}+`, note: 'Past the largest band we can size.', kind: 'pastBands' };
if (size.belowBandFloor) {
return { size, label: size.belowBandFloor.label, note: `Most stores start at band 28, where your sister size is ${size.label}.`, kind: 'belowFloor' };
}
if (size.beyondLadder) return { size, label: `${size.label}+`, note: 'Past the largest cup we can size.', kind: 'pastCups' };
return { size, label: size.label, note: null, kind: 'size' };
}
function calcNamesASize(your) {
return your.kind === 'size' || your.kind === 'belowFloor';
}
function calcSisterSizes(your) {
if (!calcNamesASize(your)) return null;
const size = your.size;
if (your.kind === 'belowFloor') {
const at28 = { band: size.band, cup: size.cup, label: size.label };
return size.belowBandFloor.steps === 1 ? { down: null, up: at28, at28: null } : { down: null, up: null, at28 };
}
const sisters = getSisterSizes(size.band, size.cup);
return { down: sisters.sizeDown || null, up: sisters.sizeUp || null, at28: null };
}
function calcInternationalSizes(your) {
if (!calcNamesASize(your)) return null;
const own = your.kind === 'belowFloor' ? your.size.belowBandFloor : your.size;
const shared = _EB_SHARED_CUPS.includes(own.cup) ? own.cup : null;
const ukCup = shared || toBrandCup(own.cup, { kind: LADDER_VOCABULARY, system: 'uk' }).cup;
const whole = (table) => {
const band = Object.keys(table).find((label) => table[label] === own.band);
return band != null && shared ? `${band}${shared}` : null;
};
return {
uk: ukCup ? `${own.band}${ukCup}` : null,
eu: whole(EUROPEAN_BAND_TABLE.eu),
fr: whole(EUROPEAN_BAND_TABLE.fr),
};
}
function calcUsualLetter(your) {
if (!calcNamesASize(your)) return null;
const size = your.size;
const usual = letterConsensusFor(size.band, size.cup, null, null);
if (!usual) return { label: null, sentence: null, plus: null };
const sentence = usualLetterSentence({
bucketLabel: usual.label,
baseLabel: size.label,
agree: usual.agree,
total: usual.total,
split: usual.split,
splitPick: usual.splitPick,
floored: usual.floored,
raisedBy: usual.raisedBy,
}, size.label);
const other = equivalentLetter(usual.family, usual.label);
return { label: usual.label, sentence, plus: other && other.family === 'plus' ? other.letter : null };
}
function calcListingPayload(brandId, styleKey) {
return {
product: { styleKey, source: 'jsonld', ambiguous: false, styleAttributes: [], fullText: '' },
brandId,
grid: null,
alphaGrid: null,
productUnavailable: false,
};
}
function calcShownLabel(decided, size) {
const shown = size || decided.adjusted;
const base = decided.baseSize;
const which = (shown.unresolvedAlphaSize && base && shown.label === base.label) ? base : shown;
return displaySizeLabel(which, decided.displayEntry || null);
}
function calcRefusal(adjusted) {
const words = styleFitBadgeText(adjusted.confidence);
if (!adjusted.bandClamped || adjusted.brandBandLimit == null) return { refused: words, edge: null };
return { refused: words, edge: { direction: adjusted.bandClamped, band: adjusted.brandBandLimit } };
}
function calcBrandAnswer(entry, m, data) {
const ask = (styleKey) => decideAnswer(calcListingPayload(entry.id, styleKey), { underbust: m.underbust, bust: m.bust }, data.brandData, data.styleModifiers);
const sold = (entry.sizing_systems && Array.isArray(entry.sizing_systems.sold)) ? entry.sizing_systems.sold : [];
const row = { id: entry.id, name: (data.names && data.names[entry.id]) || entry.display_name, bandCup: null, letters: null };
if (sold.includes('band_cup')) {
const decided = ask(CALC_BAND_CUP_STYLE);
const a = decided.adjusted;
row.bandCup = CALC_REFUSALS.includes(a.confidence)
? calcRefusal(a)
: { label: calcShownLabel(decided), at28: a.belowBandFloor ? displaySizeLabel(a.belowBandFloor.sister, decided.displayEntry || null) : null };
}
if (sold.includes('alpha_range_bucket')) {
const answers = CALC_LETTER_STYLES.map(ask);
const type = (d) => ((d.adjusted.confidenceFactors || {}).matchDetail || {}).type;
const [bralette, letterSized] = answers;
const fromChart = (d) => type(d) === 'staticTable';
if (answers.every(fromChart) && calcShownLabel(bralette) === calcShownLabel(letterSized)) {
row.letters = { label: calcShownLabel(bralette), limited: bralette.adjusted.confidence === 'Uncertain, check size chart' };
} else if (fromChart(bralette)) {
row.letters = { label: calcShownLabel(bralette), limited: bralette.adjusted.confidence === 'Uncertain, check size chart', bralettesOnly: true };
} else if (answers.every((d) => CALC_REFUSALS.includes(d.adjusted.confidence) && d.adjusted.confidence === bralette.adjusted.confidence)) {
row.letters = calcRefusal(bralette.adjusted);
} else {
row.letters = { varies: true };
}
}
return row;
}
function calculatorAnswer(m, data) {
const your = calcYourSize(m);
return {
your,
sisters: calcSisterSizes(your),
international: calcInternationalSizes(your),
usualLetter: calcUsualLetter(your),
brands: data.brandData.brands.map((entry) => calcBrandAnswer(entry, m, data)),
};
}
/* release/calculator/ui.js */
const CALC_BRANDS_SHOWN = 25;
const calcEscape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function calcSavedFromEntry(m, underbustText, bustText) {
return m.unit === 'cm'
? { underbust: m.underbust, bust: m.bust, unit: 'cm', underbustCm: parseFloat(underbustText), bustCm: parseFloat(bustText) }
: { underbust: m.underbust, bust: m.bust, unit: 'in' };
}
function calcEntryFromSaved(saved, validateMeasurements) {
if (!saved || typeof saved !== 'object') return null;
const check = validateMeasurements(saved.underbust, saved.bust, saved.unit);
if (!check.valid) return null;
if (saved.unit === 'cm' && Number.isFinite(saved.underbustCm) && Number.isFinite(saved.bustCm)) {
return { unit: 'cm', underbust: String(saved.underbustCm), bust: String(saved.bustCm) };
}
return { unit: 'in', underbust: String(saved.underbust), bust: String(saved.bust) };
}
function calcUiMarkup({ brandCount, guideHtml = '', idPrefix = 'calc' }) {
const id = (name) => `${idPrefix}${name}`;
return `<section class="calc" aria-label="Your measurements">
<form id="${id('Form')}" novalidate>
<fieldset class="calcUnits">
<legend class="sr-only">Measurement unit</legend>
<label><input type="radio" name="${id('Unit')}" id="${id('UnitIn')}" value="in" checked><span>Inches</span></label>
<label><input type="radio" name="${id('Unit')}" id="${id('UnitCm')}" value="cm"><span>cm</span></label>
</fieldset>
<details class="howToMeasure" open>
<summary>How to measure</summary>
${guideHtml}
</details>
<label class="calcField" for="${id('Underbust')}"><span>Underbust, in <span class="calcUnitName">inches</span></span>
<input id="${id('Underbust')}" name="underbust" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="${id('Error')}"></label>
<label class="calcField" for="${id('Bust')}"><span>Bust, in <span class="calcUnitName">inches</span></span>
<input id="${id('Bust')}" name="bust" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="${id('Error')}"></label>
<div class="calcMemory" id="${id('Memory')}" hidden>
<label class="calcRemember" for="${id('Remember')}"><input type="checkbox" id="${id('Remember')}"><span id="${id('RememberLabel')}">Remember my measurements on this device</span></label>
<p class="calcSmall" id="${id('RememberNote')}" hidden></p>
<p class="calcSmall" id="${id('MemoryStatus')}" role="status"></p>
<button class="calcButton secondary" type="button" id="${id('Forget')}" hidden>Forget my measurements</button>
</div>
<p class="calcError" id="${id('Error')}" role="alert" hidden></p>
<button class="calcButton" type="submit">Show my size</button>
</form>
</section>
<section class="calcResults" id="${id('Results')}" tabindex="-1" aria-labelledby="${id('ResultsTitle')}" hidden>
<h2 id="${id('ResultsTitle')}">Your size</h2>
<p class="calcBig" id="${id('YourSize')}"></p>
<p class="calcNote" id="${id('YourNote')}" hidden></p>
<p class="calcSmall">Band from your underbust, to the nearest even inch. Cup from how much bigger your bust is: one US cup letter per inch, counted from halfway between your underbust and the band.</p>
<h3>Sister sizes</h3>
<ul class="calcChips" id="${id('Sisters')}"></ul>
<p class="calcSmall" id="${id('SistersWhen')}">The same cup volume on a band one size tighter or looser. Worth trying when your size is sold out, or when the band feels too tight (go up) or too loose (go down).</p>
<p class="calcSmall" id="${id('SistersNone')}" hidden>None to show for a size past the ends of our range.</p>
<h3>In other countries' sizes</h3>
<div class="table"><table id="${id('IntlTable')}"><thead><tr><th scope="col">Country</th><th scope="col">Size</th></tr></thead><tbody id="${id('Intl')}"></tbody></table></div>
<p class="calcSmall" id="${id('IntlNone')}" hidden>None to show for a size past the ends of our range.</p>
<h3>In letter sizes</h3>
<p class="calcMid" id="${id('UsualLetter')}"></p>
<p class="calcSmall" id="${id('UsualSentence')}"></p>
<p class="calcSmall" id="${id('UsualPlus')}" hidden></p>
<p class="calcSmall">The usual letter, from the brand letter charts Measured Size has. A brand's own chart comes first, below.</p>
<h3>In each brand's own labels</h3>
<p class="calcSmall" id="${id('BrandCount')}"></p>
<label class="calcSearch" for="${id('BrandSearch')}"><span>Find a brand</span><input id="${id('BrandSearch')}" type="search" autocomplete="off" spellcheck="false"></label>
<ul class="calcBrands" id="${id('BrandList')}" aria-live="polite"></ul>
<p class="calcSmall" id="${id('NoMatch')}" hidden></p>
<p><button class="calcButton secondary" type="button" id="${id('ShowAll')}" hidden>Show all ${calcEscape(brandCount)} brands</button></p>
</section>`;
}
function mountBraSizeCalculator(container, opts) {
const { engine, data, memory = null, onAnswer = null } = opts;
const prefix = opts.idPrefix || 'calc';
if (!container.querySelector(`#${prefix}Form`)) {
container.innerHTML = calcUiMarkup({ brandCount: data.brandData.brands.length, guideHtml: opts.guideHtml || '', idPrefix: prefix });
}
const $ = (name) => container.querySelector(`#${prefix}${name}`);
const form = $('Form');
const underbustInput = $('Underbust');
const bustInput = $('Bust');
const unitInches = $('UnitIn');
const unitCm = $('UnitCm');
const errorText = $('Error');
const results = $('Results');
const search = $('BrandSearch');
const list = $('BrandList');
const showAll = $('ShowAll');
const brandCount = $('BrandCount');
const noMatch = $('NoMatch');
const cmPerInch = engine.cmPerInch;
let unit = 'in';
let rows = [];
let expanded = false;
let shown = null;
const text = (el, value) => { el.textContent = value; };
const make = (tag, className, content) => {
const el = document.createElement(tag);
if (className) el.className = className;
if (content != null) el.textContent = content;
return el;
};
const placeholders = { in: ['e.g. 34.25', 'e.g. 38.50'], cm: [`e.g. ${(34.25 * cmPerInch).toFixed(1)}`, `e.g. ${(38.5 * cmPerInch).toFixed(1)}`] };
const applyUnit = () => {
underbustInput.placeholder = placeholders[unit][0];
bustInput.placeholder = placeholders[unit][1];
container.querySelectorAll('.calcUnitName').forEach((el) => { el.textContent = unit === 'in' ? 'inches' : 'cm'; });
};
const convert = (input, from, to) => {
const raw = parseFloat(input.value);
if (Number.isNaN(raw)) return;
const inches = from === 'in' ? raw : raw / cmPerInch;
input.value = to === 'in' ? Math.round(inches * 100) / 100 : Math.round(inches * cmPerInch * 10) / 10;
};
const switchUnit = (next) => {
if (next === unit) return;
convert(underbustInput, unit, next);
convert(bustInput, unit, next);
unit = next;
applyUnit();
};
unitInches.addEventListener('change', () => { if (unitInches.checked) switchUnit('in'); });
unitCm.addEventListener('change', () => { if (unitCm.checked) switchUnit('cm'); });
[underbustInput, bustInput].forEach((input) => input.addEventListener('input', () => {
const clean = engine.sanitizeNumericInput(input.value);
if (clean !== input.value) input.value = clean;
}));
unit = unitCm.checked ? 'cm' : 'in';
applyUnit();
const paintYourSize = (answer) => {
text($('YourSize'), answer.your.label);
const note = $('YourNote');
note.hidden = !answer.your.note;
text(note, answer.your.note || '');
};
const paintSisters = (sisters) => {
const out = $('Sisters');
out.innerHTML = '';
$('SistersNone').hidden = !!sisters;
$('SistersWhen').hidden = !sisters;
if (!sisters) return;
const item = (caption, size) => {
const li = make('li', 'calcChip');
li.appendChild(make('span', 'calcChipSize', size.label));
li.appendChild(make('span', 'calcChipCaption', caption));
out.appendChild(li);
};
if (sisters.down) item('one band down', sisters.down);
if (sisters.up) item('one band up', sisters.up);
if (sisters.at28) item('at band 28, two bands up', sisters.at28);
};
const paintInternational = (intl) => {
const body = $('Intl');
body.innerHTML = '';
const lines = intl ? [
['UK', { size: intl.uk, note: 'Same band; UK cup letters.' }],
['EU', { size: intl.eu, note: '' }],
['France', { size: intl.fr, note: '' }],
].filter(([, cell]) => cell.size) : [];
$('IntlNone').hidden = lines.length > 0;
$('IntlTable').hidden = lines.length === 0;
lines.forEach(([country, cell]) => {
const tr = document.createElement('tr');
tr.appendChild(make('th', null, country)).setAttribute('scope', 'row');
const td = tr.appendChild(make('td', 'calcIntlSize', cell.size));
if (cell.note) td.appendChild(make('span', 'calcIntlNote', cell.note));
body.appendChild(tr);
});
};
const paintLetter = (usual) => {
const label = $('UsualLetter');
const sentence = $('UsualSentence');
const plus = $('UsualPlus');
if (!usual || !usual.label) {
text(label, '');
label.hidden = true;
text(sentence, usual ? 'Fewer than three of the brand letter charts Measured Size has list your size, so there is no usual letter for it. Each brand below says what it can.' : 'No letter size for a size past the ends of our range.');
plus.hidden = true;
return;
}
label.hidden = false;
text(label, usual.label);
text(sentence, usual.sentence);
plus.hidden = !usual.plus;
text(plus, usual.plus ? `Stores that use plus sizes sell ${usual.label} as ${usual.plus}.` : '');
};
const bandCupText = (cell) => {
if (cell.refused) {
if (!cell.edge) return { main: cell.refused, muted: true };
return { main: cell.refused, sub: cell.edge.direction === 'above' ? `Their bands stop at ${cell.edge.band}.` : `Their bands start at ${cell.edge.band}.`, muted: true };
}
return { main: cell.label, sub: cell.at28 ? `${cell.at28} at band 28, where most stores start.` : null };
};
const lettersText = (cell) => {
if (cell.varies) return { main: 'Letter sizes: varies by style', sub: 'Measured Size reads it on each listing.', muted: true };
if (cell.refused) {
const edge = cell.edge ? (cell.edge.direction === 'above' ? ` Their bands stop at ${cell.edge.band}.` : ` Their bands start at ${cell.edge.band}.`) : '';
return { main: `Letter sizes: ${cell.refused}`, sub: edge.trim() || null, muted: true };
}
const check = cell.limited ? ' Check their chart.' : '';
if (cell.bralettesOnly) return { main: `Bralettes: ${cell.label}`, sub: `Other letter sizes vary by style; Measured Size reads them on each listing.${check}` };
return { main: `Letter sizes: ${cell.label}`, sub: check.trim() || null };
};
const renderBrands = () => {
const query = search.value.trim().toLowerCase();
const matches = (row) => !query || row.search.includes(query);
const found = rows.filter(matches);
list.innerHTML = '';
const limit = query || expanded ? found.length : Math.min(found.length, CALC_BRANDS_SHOWN);
found.slice(0, limit).forEach((row) => {
const li = make('li', 'calcBrand');
li.appendChild(make('span', 'calcBrandName', row.name));
const sizes = make('span', 'calcBrandSizes');
[row.bandCup && bandCupText(row.bandCup), row.letters && lettersText(row.letters)].filter(Boolean).forEach((cell, n) => {
const block = make('span', `calcBrandCell${n === 0 && row.bandCup ? ' calcBrandMain' : ''}${cell.muted ? ' calcMuted' : ''}`);
block.appendChild(make('span', 'calcBrandLabel', cell.main));
if (cell.sub) block.appendChild(make('span', 'calcBrandSub', cell.sub));
sizes.appendChild(block);
});
li.appendChild(sizes);
list.appendChild(li);
});
noMatch.hidden = found.length > 0;
if (!found.length) text(noMatch, `No brand on file matches "${search.value.trim()}". On a listing, Measured Size still shows your own size in that listing's labels.`);
showAll.hidden = !!query || expanded || found.length <= CALC_BRANDS_SHOWN;
text(brandCount, `${rows.length} brands on file: the ${data.leading} with the widest reach first, then A to Z.`);
};
search.addEventListener('input', renderBrands);
showAll.addEventListener('click', () => { expanded = true; renderBrands(); });
const remember = $('Remember');
const rememberNote = $('RememberNote');
const memoryStatus = $('MemoryStatus');
const forget = $('Forget');
const where = memory && memory.device === 'phone' ? 'on this phone' : 'on this device';
const keep = () => {
if (!shown) return;
if (memory.save(calcSavedFromEntry(shown.m, shown.underbustText, shown.bustText))) {
forget.hidden = false;
text(memoryStatus, '');
} else {
text(memoryStatus, 'This browser would not keep them.');
}
};
if (memory) {
$('Memory').hidden = false;
text($('RememberLabel'), `Remember my measurements ${where}`);
remember.addEventListener('change', () => {
rememberNote.hidden = !(remember.checked && memory.tickNote);
text(rememberNote, remember.checked && memory.tickNote ? memory.tickNote : '');
if (remember.checked) {
keep();
if (!shown) text(memoryStatus, 'They are kept when you choose Show my size.');
} else {
memory.forget();
forget.hidden = true;
text(memoryStatus, `Not kept ${where}.`);
}
});
forget.addEventListener('click', () => {
memory.forget();
remember.checked = false;
rememberNote.hidden = true;
forget.hidden = true;
text(memoryStatus, `Your measurements are forgotten ${where}.`);
});
}
const answerEntry = ({ focus }) => {
const m = engine.calcMeasurementsFromEntry(underbustInput.value, bustInput.value, unit);
if (!m.valid) {
text(errorText, m.message);
errorText.hidden = false;
results.hidden = true;
shown = null;
return;
}
errorText.hidden = true;
const answer = engine.calculatorAnswer(m, data);
shown = { m, underbustText: underbustInput.value, bustText: bustInput.value, answer };
if (memory && remember.checked) keep();
paintYourSize(answer);
paintSisters(answer.sisters);
paintInternational(answer.international);
paintLetter(answer.usualLetter);
rows = answer.brands.map((row) => {
const entry = data.brandData.brands.find((b) => b.id === row.id);
const aliases = (entry && entry.aliases) || [];
return { ...row, search: [row.name, ...aliases].join(' ').toLowerCase() };
});
expanded = false;
renderBrands();
results.hidden = false;
if (focus) results.focus();
if (onAnswer) onAnswer(answer);
};
form.addEventListener('submit', (event) => {
event.preventDefault();
answerEntry({ focus: true });
});
const saved = memory ? calcEntryFromSaved(memory.load(), engine.validateMeasurements) : null;
if (saved) {
unitInches.checked = saved.unit === 'in';
unitCm.checked = saved.unit === 'cm';
unit = saved.unit;
applyUnit();
underbustInput.value = saved.underbust;
bustInput.value = saved.bust;
remember.checked = true;
forget.hidden = false;
const guide = container.querySelector('.howToMeasure');
if (guide) guide.open = false;
answerEntry({ focus: false });
}
return { answer: () => (shown ? shown.answer : null) };
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = { calcUiMarkup, mountBraSizeCalculator, calcSavedFromEntry, calcEntryFromSaved, CALC_BRANDS_SHOWN };
}
/* release/calculator/page.js */
const CALC_MEMORY_KEY = 'measurements';
const CALC_HINT_DISMISSED_KEY = 'installHintDismissed';
function calcStorage() {
try { return window.localStorage; } catch (err) { return null; }
}
function calcLocalMemory(device, tickNote) {
return {
device,
tickNote,
load() {
try {
const store = calcStorage();
const raw = store && store.getItem(CALC_MEMORY_KEY);
return raw ? JSON.parse(raw) : null;
} catch (err) { return null; }
},
save(saved) {
try { calcStorage().setItem(CALC_MEMORY_KEY, JSON.stringify(saved)); return true; } catch (err) { return false; }
},
forget() {
try { calcStorage().removeItem(CALC_MEMORY_KEY); } catch (err) { }
},
};
}
function calcPhone(ua) {
if (/iPhone|iPod/.test(ua)) return 'iphone';
if (/Android/.test(ua) && /Mobile/.test(ua)) return 'android';
return null;
}
function calcSafari(ua, touchPoints) {
if (!/Version\/[\d.]+.* Safari\//.test(ua) || /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\/|YaBrowser|DuckDuckGo|Chrome|Chromium|Edg\/|Android/.test(ua)) return null;
if (/iPhone|iPod/.test(ua)) return 'iphone';
if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1)) return 'ipad';
if (/Macintosh/.test(ua)) return 'mac';
return null;
}
function calcTickNote(ua, touchPoints, installed) {
if (installed) return null;
const words = [];
if (calcPhone(ua) === 'iphone') words.push("If you add this to your home screen, you'll enter them once more there.");
const safari = calcSafari(ua, touchPoints);
if (safari) words.push("Safari may clear these if you don't visit for a week.");
if (safari === 'iphone' || safari === 'ipad') words.push('Added to your home screen, they stay.');
return words.length ? words.join(' ') : null;
}
function calcInstalled() {
return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
}
function calcServiceWorker(container) {
if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
const hadWorker = !!navigator.serviceWorker.controller;
let typed = false;
container.addEventListener('input', () => { typed = true; });
container.addEventListener('submit', () => { typed = true; });
navigator.serviceWorker.addEventListener('controllerchange', () => {
if (hadWorker && !typed) location.reload();
});
navigator.serviceWorker.register('sw.js').catch(() => { });
}
function calcInstallHint(phone) {
const hint = document.getElementById('calcAppHint');
const words = document.getElementById('calcAppHintText');
const add = document.getElementById('calcAppHintAdd');
const close = document.getElementById('calcAppHintClose');
if (!hint || !phone || calcInstalled()) return () => {};
const dismissed = () => { try { return calcStorage().getItem(CALC_HINT_DISMISSED_KEY) === '1'; } catch (err) { return false; } };
const dismiss = () => {
hint.hidden = true;
try { calcStorage().setItem(CALC_HINT_DISMISSED_KEY, '1'); } catch (err) { }
};
let prompt = null;
let answered = false;
const show = () => {
if (!answered || dismissed()) return;
if (phone === 'iphone') {
words.textContent = 'Add Measured Size to your home screen to use it offline: tap Share (on iOS 26 and later, it is in Safari\'s ⋯ menu), then Add to Home Screen.';
add.hidden = true;
} else if (prompt) {
words.textContent = 'Add Measured Size to your home screen to use it offline.';
add.hidden = false;
} else {
return;
}
hint.hidden = false;
};
window.addEventListener('beforeinstallprompt', (event) => {
event.preventDefault();
prompt = event;
show();
});
window.addEventListener('appinstalled', () => { hint.hidden = true; prompt = null; });
add.addEventListener('click', () => {
if (!prompt) return;
const asked = prompt;
prompt = null;
hint.hidden = true;
asked.prompt();
if (asked.userChoice) asked.userChoice.then((choice) => { if (choice && choice.outcome === 'dismissed') dismiss(); }).catch(() => {});
});
close.addEventListener('click', dismiss);
return () => { answered = true; show(); };
}
function calcPage() {
const container = document.getElementById('calcApp');
const ua = navigator.userAgent || '';
const phone = calcPhone(ua);
const tickNote = calcTickNote(ua, navigator.maxTouchPoints || 0, calcInstalled());
const answered = calcInstallHint(phone);
mountBraSizeCalculator(container, {
engine: {
calcMeasurementsFromEntry,
calculatorAnswer,
sanitizeNumericInput,
validateMeasurements,
cmPerInch: SIZING_CONSTANTS.CM_PER_INCH,
},
data: MEASURED_CALCULATOR_DATA,
memory: calcLocalMemory(phone ? 'phone' : 'device', tickNote),
onAnswer: answered,
});
calcServiceWorker(container);
}
if (typeof document !== 'undefined' && document.getElementById('calcApp')) calcPage();
