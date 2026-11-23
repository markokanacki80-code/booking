const DEFAULTS = {
  name: 'City Hill', location: 'Udoban boravak, na odličnoj lokaciji.',
  description: 'Udoban apartman za prijatan odmor i istraživanje grada. Sve što vam treba za bezbrižne dane — na jednom mestu.',
  price: 85, capacity: 4, bedrooms: 1, beds: 2,
  amenities: ['Wi-Fi', 'Klima uređaj', 'Kuhinja', 'Besplatan parking'],
  photos: [
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1500&q=85',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=82'
  ], phone: '', email: '', unavailable: []
};
const PROFILE_KEY = 'cityHillProfileV1';
const REQUESTS_KEY = 'cityHillRequestsV1';
const safeRead = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
let profile = { ...DEFAULTS, ...safeRead(PROFILE_KEY, {}) };
profile.amenities = Array.isArray(profile.amenities) ? profile.amenities : DEFAULTS.amenities;
profile.photos = Array.isArray(profile.photos) && profile.photos.length ? profile.photos : DEFAULTS.photos;
profile.unavailable = Array.isArray(profile.unavailable) ? profile.unavailable : [];
let requests = safeRead(REQUESTS_KEY, []);
if (!Array.isArray(requests)) requests = [];
const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const validPhoto = (value) => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const cleanPhotos = () => profile.photos.map(validPhoto).filter(Boolean);
const todayISO = () => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };
const dateOffset = (days) => { const date = new Date(`${todayISO()}T12:00:00`); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };
function saveLocal(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }

function renderProfile() {
  const photos = cleanPhotos();
  const name = profile.name || 'City Hill';
  document.title = `${name} — apartman za vaš odmor`;
  $('#brand-name').textContent = name;
  $('#hero-title').innerHTML = `Dobro došli u<br>${escapeHTML(name)}`;
  $('#hero-location').textContent = profile.location || 'Apartman za vaš odmor';
  $('#intro-name').textContent = name.toLocaleUpperCase('sr');
  $('#intro-title').textContent = `Uživajte u ${name}.`;
  $('#description').textContent = profile.description || '';
  $('#footer-name').textContent = name;
  $('#copyright-name').textContent = name;
  $('#footer-location').textContent = profile.location || 'Apartman za vaš odmor';
  const hero = $('#hero');
  hero.style.setProperty('--hero-image', `url("${photos[0] || DEFAULTS.photos[0]}")`);
  $('#gallery').innerHTML = photos.slice(0, 3).map((photo, index) => `<img src="${escapeHTML(photo)}" alt="${escapeHTML(name)} — fotografija ${index + 1}" loading="lazy">`).join('');
  $('#facts').innerHTML = `<span>♙ Do ${Number(profile.capacity) || 1} gostiju</span><span>▱ ${Number(profile.bedrooms) || 0} spavaćih soba</span><span>⌂ ${Number(profile.beds) || 1} kreveta</span><span>€ ${Number(profile.price) || 0} / noć</span>`;
  $('#amenities').innerHTML = (profile.amenities.length ? profile.amenities : ['Pogodnosti unesite kroz upravljanje']).map(item => `<span class="amenity"><i>✓</i>${escapeHTML(item)}</span>`).join('');
  const contact = [profile.phone, profile.email].filter(Boolean).join(' · ');
  $('#booking-contact').textContent = contact ? `Kontakt: ${contact}` : 'Kontakt podatke možete uneti kroz „Upravljanje“.';
  const contactLink = $('#contact-link');
  if (profile.email) { contactLink.href = `mailto:${profile.email}`; contactLink.textContent = profile.email; }
  else if (profile.phone) { contactLink.href = `tel:${profile.phone.replace(/[^+\d]/g, '')}`; contactLink.textContent = profile.phone; }
  else { contactLink.href = '#booking'; contactLink.textContent = 'Pošaljite upit za rezervaciju'; }
  const guestSelect = $('#guest-count');
  const maxGuests = Math.max(1, Math.min(30, Number(profile.capacity) || 1));
  guestSelect.innerHTML = Array.from({ length: maxGuests }, (_, index) => `<option value="${index + 1}">${index + 1} ${index === 0 ? 'gost' : index < 4 ? 'gosta' : 'gostiju'}</option>`).join('');
  updatePrice();
}
function nightsBetween(start, end) { return Math.round((new Date(`${end}T12:00:00`) - new Date(`${start}T12:00:00`)) / 86400000); }
function isUnavailable(start, end) { return profile.unavailable.some(day => day >= start && day < end); }
function updatePrice() {
  const start = $('#checkin').value, end = $('#checkout').value;
  const nights = start && end ? nightsBetween(start, end) : 0;
  $('#price-summary').textContent = `€${Number(profile.price) || 0} × ${nights > 0 ? `${nights} ${nights === 1 ? 'noć' : 'noći'}` : 'noć'}`;
  $('#estimated-total').textContent = nights > 0 ? `€${(Number(profile.price) || 0) * nights}` : `€${Number(profile.price) || 0}`;
}
$('#checkin').min = todayISO();
$('#checkin').value = dateOffset(1);
$('#checkout').min = dateOffset(2);
$('#checkout').value = dateOffset(3);
$('#checkin').addEventListener('change', () => { const next = new Date(`${$('#checkin').value}T12:00:00`); next.setDate(next.getDate() + 1); const minimum = next.toISOString().slice(0, 10); $('#checkout').min = minimum; if ($('#checkout').value < minimum) $('#checkout').value = minimum; updatePrice(); });
$('#checkout').addEventListener('change', updatePrice);

$('#booking-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  if (data.checkout <= data.checkin) { $('#booking-status').textContent = 'Datum odlaska mora biti nakon datuma dolaska.'; return; }
  if (Number(data.guests) > Number(profile.capacity)) { $('#booking-status').textContent = `Apartman prima najviše ${profile.capacity} gostiju.`; return; }
  if (isUnavailable(data.checkin, data.checkout)) { $('#booking-status').textContent = 'Izabrani termin ima nedostupne datume. Izaberite drugi termin.'; return; }
  requests.unshift({ ...data, id: Date.now(), createdAt: new Date().toLocaleString('sr-RS'), nights: nightsBetween(data.checkin, data.checkout) });
  if (!saveLocal(REQUESTS_KEY, requests)) { requests.shift(); $('#booking-status').textContent = 'Nije moguće sačuvati upit u ovom pregledaču.'; return; }
  form.reset(); $('#checkin').value = dateOffset(1); $('#checkout').value = dateOffset(3); $('#guest-count').value = '1'; updatePrice();
  $('#booking-status').textContent = 'Upit je sačuvan u ovom pregledaču. Domaćin još nije obavešten — kontaktirajte ga direktno.';
});

const adminDialog = $('#admin-dialog');
function fillAdminForm() {
  const form = $('#settings-form');
  for (const key of ['name', 'location', 'description', 'price', 'capacity', 'bedrooms', 'beds', 'phone', 'email']) form.elements[key].value = profile[key] ?? '';
  form.elements.amenities.value = profile.amenities.join(', ');
  form.elements.photos.value = profile.photos.join('\n');
  form.elements.unavailable.value = profile.unavailable.join('\n');
  renderRequests();
}
function renderRequests() {
  const container = $('#requests-list');
  if (!requests.length) { container.innerHTML = '<p class="empty-requests">Još nema sačuvanih upita.</p>'; return; }
  container.innerHTML = requests.map(request => `<article class="request-item"><div><strong>${escapeHTML(request.guestName)}</strong><span>${escapeHTML(request.checkin)} → ${escapeHTML(request.checkout)} · ${escapeHTML(request.guests)} gostiju</span><span>${escapeHTML(request.contact)} · ${escapeHTML(request.createdAt)}</span>${request.message ? `<p>${escapeHTML(request.message)}</p>` : ''}</div><button type="button" class="delete-request" data-request-id="${request.id}" aria-label="Obriši upit">Obriši</button></article>`).join('');
}
$('#admin-open').addEventListener('click', () => { fillAdminForm(); adminDialog.showModal(); });
$('#admin-close').addEventListener('click', () => adminDialog.close());
adminDialog.addEventListener('click', event => { if (event.target === adminDialog) adminDialog.close(); });
$('#settings-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const unavailable = data.unavailable.split(/\s+/).map(item => item.trim()).filter(item => /^\d{4}-\d{2}-\d{2}$/.test(item));
  const updated = { name: data.name.trim() || DEFAULTS.name, location: data.location.trim(), description: data.description.trim(), price: Number(data.price), capacity: Number(data.capacity), bedrooms: Number(data.bedrooms) || 0, beds: Number(data.beds) || 1, amenities: data.amenities.split(',').map(item => item.trim()).filter(Boolean), photos: data.photos.split(/\r?\n/).map(item => item.trim()).filter(Boolean).slice(0, 10), phone: data.phone.trim(), email: data.email.trim(), unavailable: [...new Set(unavailable)] };
  if (!updated.photos.length) updated.photos = DEFAULTS.photos;
  if (!saveLocal(PROFILE_KEY, updated)) { $('#settings-status').textContent = 'Čuvanje nije uspelo. Proverite prostor u pregledaču.'; return; }
  profile = updated; renderProfile(); $('#settings-status').textContent = 'Izmene su sačuvane u ovom pregledaču.';
});
$('#reset-settings').addEventListener('click', () => { profile = structuredClone(DEFAULTS); saveLocal(PROFILE_KEY, profile); renderProfile(); fillAdminForm(); $('#settings-status').textContent = 'Vraćeni su početni podaci.'; });
$('#requests-list').addEventListener('click', event => { const button = event.target.closest('[data-request-id]'); if (!button) return; requests = requests.filter(request => request.id !== Number(button.dataset.requestId)); saveLocal(REQUESTS_KEY, requests); renderRequests(); });
$('#year').textContent = new Date().getFullYear();
renderProfile();
