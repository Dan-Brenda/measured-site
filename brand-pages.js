/* Measured Size's brand pages (Phase 474). Built by release/site.js from the repository: the fit API's answers, then the page's wiring, comments out. It runs after the calculator's two files. Not edited by hand. */
/* release/api/answers.js */
const API_VERSION = '1.0.0';
const API_REFUSALS = [...CALC_REFUSALS, 'Beyond supported sizes', 'Not sized like a bra'];
const API_TRANSLATION_CEILING = 'Likely fits';
function apiMeasurements(underbust, bust, unit) {
const u = unit == null || unit === '' ? 'in' : String(unit).trim().toLowerCase();
if (u !== 'in' && u !== 'cm') return { ok: false, status: 400, error: 'bad_unit', message: 'unit must be "in" or "cm".' };
const number = (v) => (typeof v === 'number' ? v : (typeof v === 'string' && /^\s*\d+(\.\d+)?\s*$/.test(v) ? parseFloat(v) : NaN));
const nu = number(underbust);
const nb = number(bust);
if (!Number.isFinite(nu) || !Number.isFinite(nb)) {
return { ok: false, status: 400, error: 'bad_measurements', message: 'underbust and bust are both required, as numbers (decimals allowed), in the unit given.' };
}
const entry = calcMeasurementsFromEntry(String(nu), String(nb), u);
if (!entry.valid) return { ok: false, status: 422, error: 'measurements_refused', message: entry.message };
return { ok: true, m: { underbust: entry.underbust, bust: entry.bust, unit: u, entered: { underbust: nu, bust: nb, unit: u } } };
}
function apiEngineAnswer(decided) {
const a = decided.adjusted;
const show = (size) => calcShownLabel(decided, size);
const refused = API_REFUSALS.includes(a.confidence);
const whyBase = a.ownLetterBase || decided.baseSize;
let why = styleFitExplanation(a.confidence, a.confidenceFactors, null, whyBase ? show(whyBase) : null, show(a));
const noSizeToShow = !!a.outOfScope || !!(a.brandChartGap && !a.brandChartBetween);
if (a.belowBandFloor && !noSizeToShow) why += ` ${belowBandFloorSentence(show(a), show(a.belowBandFloor.sister), a.belowBandFloor.steps)}`;
const range = (a.confidenceFactors && a.confidenceFactors.matchDetail && a.confidenceFactors.matchDetail.brandRange) || null;
const closest = refused && range && range.closest ? { size: range.closest.shown || range.closest.label, leads: range.closest.leads === true } : null;
return {
size: refused ? null : show(),
rating: a.confidence,
badge: styleFitBadgeText(a.confidence),
refused,
why,
band_edge: (a.bandClamped && a.brandBandLimit != null) ? { side: a.bandClamped, band: a.brandBandLimit } : null,
...(closest ? { closest_made: closest } : {}),
};
}
function apiLabel(size) {
return size ? size.label : null;
}
function apiBaseSize(m, data) {
const your = calcYourSize(m);
const sisters = calcSisterSizes(your);
const intl = calcInternationalSizes(your);
const usual = calcUsualLetter(your);
const unknownStore = apiEngineAnswer(decideAnswer(calcListingPayload(null, CALC_BAND_CUP_STYLE), m, data.brandData, data.styleModifiers));
const unknownLetter = apiEngineAnswer(decideAnswer(calcListingPayload(null, CALC_LETTER_STYLES[0]), m, data.brandData, data.styleModifiers));
const letterRated = usual && usual.label && unknownLetter.size === usual.label;
const named = calcNamesASize(your);
return {
size: your.label,
band: named ? (your.kind === 'belowFloor' ? your.size.belowBandFloor.band : your.size.band) : null,
cup: named ? (your.kind === 'belowFloor' ? your.size.belowBandFloor.cup : your.size.cup) : null,
kind: your.kind,
note: your.note,
confidence: {
of: 'this size on a band and cup listing at a store Measured Size has no brand data for',
rating: unknownStore.rating,
badge: unknownStore.badge,
refused: unknownStore.refused,
why: unknownStore.why,
},
sister_sizes: sisters ? { band_down: apiLabel(sisters.down), band_up: apiLabel(sisters.up), at_band_28: apiLabel(sisters.at28) } : null,
international: intl,
usual_letter: letterRated ? { size: usual.label, plus_size: usual.plus, rating: unknownLetter.rating, badge: unknownLetter.badge, why: usual.sentence } : null,
};
}
function apiLetterSummary(row, bralette) {
const letters = row.letters;
if (!letters) return null;
if (letters.varies) return { varies_by_style: true, why: "The letter depends on the style; Measured Size gives it on each listing you open." };
if (letters.refused) return { refused: true, badge: letters.refused, band_edge: letters.edge ? { side: letters.edge.direction, band: letters.edge.band } : null };
return { size: letters.label, styles: letters.bralettesOnly ? 'bralettes' : 'all letter styles', rating: bralette.rating, badge: bralette.badge };
}
const API_STORE_NAMES = { 'amazon.com': 'Amazon', 'barenecessities.com': 'Bare Necessities', 'macys.com': "Macy's", 'nordstrom.com': 'Nordstrom', 'walmart.com': 'Walmart' };
function apiStoreLabels(entry, decided) {
const declared = entry && entry.cup_letters_at_stores;
const stores = declared && Array.isArray(declared.uk) ? declared.uk : [];
if (!stores.length) return null;
const shown = calcShownLabel(decided);
const uk = calcShownLabel({ ...decided, displayEntry: entryForListingCupLetters(decided.displayEntry || entry, { vocabulary: 'listing_uk' }) });
if (!uk || uk === shown) return null;
return [{ letters: 'UK', size: uk, stores: stores.map((s) => API_STORE_NAMES[s] || s) }];
}
function apiBrandOwnLabel(entry, decided, answer) {
const a = decided && decided.adjusted;
if (!a || a.band == null || !a.cup || answer.refused || !answer.size || a.beyondBandLadder || a.beyondLadder || /[+≤]/.test(answer.size)) return null;
const own = brandOwnEuropeanLabel({ band: a.band, cup: a.cup }, entry);
if (!own || own.label === answer.size) return null;
const us = displaySizeLabel({ band: a.band, cup: a.cup, label: `${a.band}${a.cup}` }, null);
const ownSaid = `Your ${us} is ${own.label} in ${possessiveName(entry.display_name)} own sizes.`;
const said = [`Your size here is ${answer.size}, in standard US sizes.`, `Your size here is ${answer.size}.`].find((s) => typeof answer.why === 'string' && answer.why.includes(s));
const why = said ? answer.why.split(said).join(ownSaid) : answer.why;
return { size: own.label, us_size: us, label_system: own.system.toUpperCase(), why };
}
function apiBrandSize(entry, m, data) {
const decide = (styleKey) => decideAnswer(calcListingPayload(entry.id, styleKey), { underbust: m.underbust, bust: m.bust }, data.brandData, data.styleModifiers);
const ask = (styleKey) => apiEngineAnswer(decide(styleKey));
const sold = (entry.sizing_systems && Array.isArray(entry.sizing_systems.sold)) ? entry.sizing_systems.sold : [];
const row = calcBrandAnswer(entry, m, data);
const result = { band_and_cup: null, letter_sizes: null };
if (sold.includes('band_cup')) {
const decided = decide(CALC_BAND_CUP_STYLE);
const answer = apiEngineAnswer(decided);
const storeLabels = answer.refused ? null : apiStoreLabels(entry, decided);
const ownLabel = apiBrandOwnLabel(entry, decided, answer);
const labelled = ownLabel ? { ...answer, ...ownLabel } : answer;
result.band_and_cup = storeLabels ? { ...labelled, store_labels: storeLabels } : labelled;
}
if (sold.includes('alpha_range_bucket')) {
const [bralette, letterSized] = CALC_LETTER_STYLES.map(ask);
result.letter_sizes = { overall: apiLetterSummary(row, bralette), bralette, letter_sized: letterSized };
}
return result;
}
function apiFindBrand(name, data) {
if (typeof name !== 'string' || !name.trim()) return null;
const brands = data.brandData.brands;
const hit = matchBrandByName(brands, name);
if (hit) return hit.brand;
const plain = name.trim().toLowerCase();
return brands.find((b) => b.id === plain) || null;
}
function apiLabelKey(text) {
return String(text).replace(/\s+/g, '').toUpperCase();
}
function apiTranslate(fromEntry, sizeText, toEntry, data) {
const table = data.labels;
const fromName = data.names[fromEntry.id] || fromEntry.display_name;
const toName = data.names[toEntry.id] || toEntry.display_name;
const refuse = (reason, why) => ({ refused: true, reason, why });
if (typeof sizeText !== 'string' || !sizeText.trim()) return refuse('no_size', 'Give the size she wears at the first brand, as that brand labels it (for example 34DD).');
const key = apiLabelKey(sizeText);
const fromLabels = table.brands[fromEntry.id];
if (!fromLabels) return refuse('from_brand_sells_no_band_and_cup', `${fromName} sells letter sizes only on Measured Size's record, and a letter size covers several band and cup sizes, so it can't be read back to one. Ask with her measurements instead.`);
if (!/\d/.test(key)) return refuse('letter_size', `A letter size covers several band and cup sizes, so ${sizeText.trim()} at ${fromName} can't be read back to one size. Ask with her measurements instead.`);
const matches = [];
fromLabels.forEach((label, i) => { if (label != null && apiLabelKey(label) === key) matches.push(i); });
if (!matches.length) return refuse('size_not_read', `No measurements Measured Size sizes give ${sizeText.trim()} at ${fromName}, so it can't be read back to a size. Check the label as ${fromName} prints it, or ask with her measurements.`);
if (matches.length > 1) return refuse('size_ambiguous', `${sizeText.trim()} at ${fromName} is given for more than one of Measured Size's sizes (${matches.map((i) => table.sizes[i]).join(', ')}), so it can't be read back to one. Ask with her measurements instead.`);
const i = matches[0];
const base = table.sizes[i];
const body = { underbust: table.bodies[i][0], bust: table.bodies[i][1] };
const toSold = (toEntry.sizing_systems && Array.isArray(toEntry.sizing_systems.sold)) ? toEntry.sizing_systems.sold : [];
if (!toSold.includes('band_cup')) return refuse('to_brand_sells_no_band_and_cup', `${toName} sells letter sizes only on Measured Size's record. Its letter for a size label isn't something Measured Size can give honestly; ask with her measurements instead.`);
const answer = apiEngineAnswer(decideAnswer(calcListingPayload(toEntry.id, CALC_BAND_CUP_STYLE), body, data.brandData, data.styleModifiers));
const rating = answer.refused ? answer.rating : capRating(answer.rating, API_TRANSLATION_CEILING);
return {
refused: answer.refused,
reason: answer.refused ? 'engine_refused' : null,
from: { size: fromLabels[i], base_size: base },
to: {
size: answer.size,
rating,
badge: styleFitBadgeText(rating),
rating_from_measurements: answer.rating,
why: answer.why,
band_edge: answer.band_edge,
},
why: answer.refused
? `${fromLabels[i]} at ${fromName} is Measured Size's ${base}, and ${toName} gives no size for it: ${answer.badge}.`
: `${fromLabels[i]} at ${fromName} is Measured Size's ${base}. A size label says less than her measurements do, so a translated size is rated no higher than ${styleFitBadgeText(API_TRANSLATION_CEILING)}.`,
};
}
/* release/brands/page.js */
function brandPageEntry(entry, ukStores) {
const stores = String(ukStores || '').split(' ').filter(Boolean);
return stores.length ? { ...entry, cup_letters_at_stores: { uk: stores } } : entry;
}
function brandPageList(items) {
return items.length <= 1 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
function brandPageView(answer) {
const a = answer.band_and_cup;
const labels = (a.store_labels || [])[0] || null;
const overall = answer.letter_sizes ? answer.letter_sizes.overall : null;
let letters = null;
if (overall && overall.varies_by_style) letters = { line: overall.why };
else if (overall && overall.refused) letters = { line: `In letter sizes: ${overall.badge}`, refused: true };
else if (overall) letters = { line: `In letter sizes${overall.styles === 'bralettes' ? ', for bralettes' : ''}: ${overall.size}`, badge: overall.badge };
return {
size: a.refused ? null : a.size,
refusal: a.refused ? a.badge : null,
badge: a.refused ? null : a.badge,
why: a.why,
usSize: a.us_size || null,
closest: a.refused && a.closest_made && a.closest_made.leads ? a.closest_made.size : null,
stores: labels ? `At ${brandPageList(labels.stores)}, this size is labeled ${labels.size}.` : null,
letters,
};
}
function brandPagePaint(panel, view, brandName) {
const add = (tag, className, content) => {
const el = document.createElement(tag);
if (className) el.className = className;
el.textContent = content;
panel.appendChild(el);
return el;
};
panel.textContent = '';
add('h2', '', `Your size at ${brandName}`);
if (view.size) add('p', 'calcBig', view.size);
if (view.refusal) add('p', 'calcMid', view.refusal);
if (view.closest) add('p', 'calcNote', `Closest it makes: ${view.closest}`);
if (view.usSize) add('p', 'calcNote', `Your US size: ${view.usSize}`);
if (view.badge) add('p', 'brandBadge', view.badge);
add('p', 'calcNote', view.why);
if (view.stores) add('p', '', view.stores);
if (view.letters) {
add('p', view.letters.badge || view.letters.refused ? 'brandLetters' : '', view.letters.line);
if (view.letters.badge) add('p', 'brandBadge', view.letters.badge);
}
}
function brandPageMount(form) {
const data = MEASURED_CALCULATOR_DATA;
const stored = data.brandData.brands.find((b) => b.id === form.dataset.brand);
if (!stored) return;
const entry = brandPageEntry(stored, form.dataset.ukStores);
const underbust = document.getElementById('brandUnderbust');
const bust = document.getElementById('brandBust');
const inches = document.getElementById('brandUnitIn');
const cm = document.getElementById('brandUnitCm');
const error = document.getElementById('brandError');
const panel = document.getElementById('brandResult');
const cmPerInch = SIZING_CONSTANTS.CM_PER_INCH;
let unit = cm.checked ? 'cm' : 'in';
const placeholders = { in: ['e.g. 34.25', 'e.g. 38.50'], cm: [`e.g. ${(34.25 * cmPerInch).toFixed(1)}`, `e.g. ${(38.5 * cmPerInch).toFixed(1)}`] };
const applyUnit = () => {
underbust.placeholder = placeholders[unit][0];
bust.placeholder = placeholders[unit][1];
form.querySelectorAll('.calcUnitName').forEach((el) => { el.textContent = unit === 'in' ? 'inches' : 'cm'; });
};
const convert = (input, from, to) => {
const raw = parseFloat(input.value);
if (Number.isNaN(raw)) return;
const asInches = from === 'in' ? raw : raw / cmPerInch;
input.value = to === 'in' ? Math.round(asInches * 100) / 100 : Math.round(asInches * cmPerInch * 10) / 10;
};
const switchUnit = (next) => {
if (next === unit) return;
convert(underbust, unit, next);
convert(bust, unit, next);
unit = next;
applyUnit();
};
inches.addEventListener('change', () => { if (inches.checked) switchUnit('in'); });
cm.addEventListener('change', () => { if (cm.checked) switchUnit('cm'); });
[underbust, bust].forEach((input) => input.addEventListener('input', () => {
const clean = sanitizeNumericInput(input.value);
if (clean !== input.value) input.value = clean;
}));
applyUnit();
form.addEventListener('submit', (event) => {
event.preventDefault();
const m = calcMeasurementsFromEntry(underbust.value, bust.value, unit);
if (!m.valid) {
error.textContent = m.message;
error.hidden = false;
panel.hidden = true;
return;
}
error.hidden = true;
brandPagePaint(panel, brandPageView(apiBrandSize(entry, m, data)), form.dataset.brandName);
panel.hidden = false;
panel.focus();
});
}
if (typeof document !== 'undefined' && document.getElementById('brandForm')) brandPageMount(document.getElementById('brandForm'));
