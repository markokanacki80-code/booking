# City Hill — apartman za izdavanje

Jednostavna, responzivna prezentacija za jedan apartman, sa formom za upit o rezervaciji i lokalnim panelom za upravljanje podacima.

## Pokretanje

Otvorite `index.html` u pregledaču ili objavite sadržaj iz grane `main` kroz GitHub Pages.

## Podešavanje apartmana

Kliknite **Upravljanje** u gornjem desnom uglu i unesite lokaciju, opis, cenu, kapacitet, pogodnosti, URL-ove fotografija, kontakt i datume kada apartman nije dostupan.

Podaci i poslati upiti čuvaju se u `localStorage` pregledača u kojem su uneti. Početno ime je **City Hill**.

## Ispravke prikaza

Stranica koristi jasniju hijerarhiju naslova, centrirani prikaz naslovne fotografije i prilagođene razmake za desktop i mobilne ekrane.

## Važna ograničenja trenutne verzije

- Ovo je prototip za jednog vlasnika i jedan pregledač. Promene se ne sinhronizuju sa drugim uređajima ili posetiocima sajta.
- Rezervaciona forma čuva upit lokalno; ne šalje e-mail, ne potvrđuje rezervaciju i ne obrađuje plaćanje.
- Admin panel nije zaštićen lozinkom. Ne unosite osetljive podatke i ne tretirajte ga kao privatni admin sistem.
- Google Sheets trenutno nije povezan.

## Sadržaj

- `index.html` — javna stranica i panel za upravljanje
- `styles.css` — dizajn za mobilne i desktop uređaje
- `app.js` — prikaz apartmana, lokalno čuvanje i validacija rezervacionih upita
