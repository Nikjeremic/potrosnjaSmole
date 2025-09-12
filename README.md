# Potrošnja Smole - Aplikacija za praćenje potrošnje smole

Aplikacija za praćenje potrošnje smole sa automatskim generisanjem smena i upravljanjem inventarom.

## Funkcionalnosti

### Autentifikacija
- Login sistem sa korisničkim imenom i lozinkom
- Dve uloge: Admin i Korisnik
- JWT token autentifikacija

### Upravljanje korisnicima (Admin)
- Dodavanje novih korisnika
- Brisanje korisnika
- Resetovanje lozinki
- Izmena korisničkih podataka

### Upravljanje smolama
- Dodavanje novih tipova smola (BMGR-1, BMGR-2, itd.)
- Definisanje težine za svaku smolu
- Pregled dostupnih smola

### Praćenje potrošnje
- Automatsko generisanje redova za tri smene dnevno:
  - Prva smena: 06:00 - 14:00
  - Druga smena: 14:00 - 22:00
  - Treća smena: 22:00 - 06:00
- Unos imena i prezimena zaposlenog
- Odabir smole iz dropdown liste
- Unos broja veziva
- Automatsko računanje ukupne potrošnje (vezivo × težina smole)
- Oduzimanje od ukupnog stanja inventara

### Dashboard
- Pregled ukupnog dostupnog stanja
- Pregled ukupne potrošnje
- Pregled dnevne potrošnje
- Statistike po smenama

## Tehnologije

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT autentifikacija
- bcryptjs za hashovanje lozinki

### Frontend
- React.js
- TypeScript
- PrimeReact UI komponente
- PrimeFlex CSS framework
- PrimeIcons ikone
- React Router
- Axios za API pozive
- Day.js za rad sa datumima

## Instalacija i pokretanje

### Backend
```bash
cd backend
npm install
npm run dev
```

Backend će biti dostupan na `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend će biti dostupan na `http://localhost:3000`

### Pokretanje oba servera odjednom
```bash
npm run dev
```

## Baza podataka

Aplikacija koristi MongoDB Atlas sa sledećom konekcijom:
```
mongodb+srv://niksys97_mngdb_user:ViMBLXmhnOd9Sc34@potrosnjasmole.jmojzq5.mongodb.net/?retryWrites=true&w=majority&appName=potrosnjaSmole
```

## Struktura baze podataka

### Users
- username, email, password, firstName, lastName, role

### Resins
- name, weight

### Consumption
- date, shift, employeeName, resinId, resinName, resinWeight, usageCount, totalConsumption

### Inventory
- resinId, resinName, totalWeight, consumedWeight, availableWeight

## API Endpoints

### Autentifikacija
- POST `/api/auth/login` - Prijava
- POST `/api/auth/register` - Registracija
- GET `/api/auth/me` - Trenutni korisnik

### Korisnici (Admin)
- GET `/api/users` - Lista korisnika
- POST `/api/users` - Kreiranje korisnika
- PUT `/api/users/:id` - Ažuriranje korisnika
- PUT `/api/users/:id/reset-password` - Resetovanje lozinke
- DELETE `/api/users/:id` - Brisanje korisnika

### Smole
- GET `/api/resins` - Lista smola
- POST `/api/resins` - Kreiranje smole
- PUT `/api/resins/:id` - Ažuriranje smole
- DELETE `/api/resins/:id` - Brisanje smole

### Potrošnja
- GET `/api/consumption` - Lista potrošnje
- POST `/api/consumption` - Kreiranje zapisa potrošnje
- PUT `/api/consumption/:id` - Ažuriranje zapisa
- DELETE `/api/consumption/:id` - Brisanje zapisa

### Inventar
- GET `/api/inventory` - Stanje inventara
- PUT `/api/inventory/:id` - Ažuriranje ukupne težine

## Korišćenje

1. Pokrenite backend i frontend aplikacije
2. Otvorite `http://localhost:3000`
3. Prijavite se sa admin nalogom
4. Dodajte tipove smola sa njihovim težinama
5. Dodajte korisnike ako je potrebno
6. Idite na "Potrošnja" tab da dodajete zapise o potrošnji
7. Pregledajte statistike na Dashboard-u

## Napomene

- Aplikacija automatski generiše redove za svaku smenu svakog dana
- Ukupno stanje se automatski ažurira kada se dodaju novi zapisi potrošnje
- Admin može ručno ažurirati ukupno stanje ako je potrebno
- Sve akcije su logovane sa timestamp-om
- UI je dizajniran sa PrimeReact komponentama za moderni izgled

## PrimeReact Komponente

Aplikacija koristi sledeće PrimeReact komponente:
- Card - za kartice sa statistikama
- DataTable - za tabele sa podacima
- Dialog - za modalne prozore
- Button - za dugmad
- InputText - za tekstualne inpute
- Password - za lozinke
- Dropdown - za padajuće liste
- Calendar - za odabir datuma
- Message - za poruke
- ConfirmDialog - za potvrde brisanja
- Sidebar - za navigaciju
- Menu - za menije
- SplitButton - za dugmad sa opcijama

## Stilizovanje

Aplikacija koristi:
- PrimeReact tema: Lara Light Blue
- PrimeFlex za flexbox layout
- PrimeIcons za ikone
- Custom CSS klase za dodatno stilizovanje
