# Potrošnja Smole - Resin Consumption Tracking App

Aplikacija za praćenje potrošnje smole u industriji. Omogućava upravljanje inventarom, praćenje rashodovanja, kreiranje prijemnica i detaljno praćenje potrošnje materijala.

## 🚀 Brza instalacija za produkciju

```bash
# Kloniraj repozitorijum
git clone https://github.com/Nikjeremic/potrosnjaSmole.git
cd potrosnjaSmole

# Instaliraj sve zavisnosti
npm run install-all

# Build za produkciju
npm run build

# Pokreni aplikaciju
npm start
```

## 📋 Preduslovi

- Node.js (v16 ili noviji)
- MongoDB (lokalno ili MongoDB Atlas)
- npm ili yarn

## 🛠️ Razvoj

```bash
# Instaliraj zavisnosti
npm run install-all

# Pokreni u development modu
npm run dev
```

Aplikacija će biti dostupna na:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000

## 🏗️ Build za produkciju

```bash
# Automatski build skript
./build-production.sh

# Ili ručno
npm run build
```

## 🌐 Deployment

### Vercel (Preporučeno)

1. Instaliraj Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Postavi environment varijable u Vercel dashboard-u

### Druge platforme

Detaljne instrukcije u [DEPLOYMENT.md](./DEPLOYMENT.md)

## ⚙️ Konfiguracija

### Environment varijable

Kreiraj `backend/.env.production`:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-jwt-secret-key-here-minimum-32-characters
MONGODB_URI=mongodb://localhost:27017/potrosnja-smole-prod
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### MongoDB

- **Lokalno**: Instaliraj MongoDB i pokreni na portu 27017
- **MongoDB Atlas**: Kreiraj cluster i koristi connection string

## 📁 Struktura projekta

```
potrosnjaSmole/
├── frontend/          # React aplikacija
│   ├── src/
│   │   ├── components/    # React komponente
│   │   ├── services/      # API servisi
│   │   └── types.ts       # TypeScript tipovi
│   └── build/         # Production build
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── models/       # Mongoose modeli
│   │   ├── routes/        # API rute
│   │   └── middleware/    # Middleware funkcije
│   └── dist/          # Compiled JavaScript
├── vercel.json        # Vercel konfiguracija
└── DEPLOYMENT.md      # Detaljne instrukcije za deployment
```

## 🔧 Funkcionalnosti

- **Upravljanje materijalima**: Dodavanje, izmena i brisanje materijala
- **Praćenje potrošnje**: Detaljno praćenje potrošnje po smenama
- **Rashodovanje**: Evidencija rashodovanja sa razlozima
- **Prijemnice**: Kreiranje i upravljanje prijemnicama
- **Korisnici**: Upravljanje korisnicima sistema
- **Dashboard**: Pregled ključnih metrika

## 🛡️ Bezbednost

- JWT autentifikacija
- CORS zaštita
- Validacija podataka
- Hashovanje lozinki

## 📊 Tehnologije

### Frontend
- React 19
- TypeScript
- PrimeReact (UI komponente)
- Axios (HTTP klijent)
- React Router

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB/Mongoose
- JWT autentifikacija
- bcryptjs

## 🐛 Troubleshooting

### Česti problemi

1. **CORS greške**: Proveri `ALLOWED_ORIGINS` u environment varijablama
2. **Autentifikacija**: Proveri da li je `JWT_SECRET` isti na frontend i backend
3. **Database**: Proveri MongoDB connection string
4. **Build greške**: Proveri da li su sve zavisnosti instalirane

### Logovi

- Backend logovi: Console output
- Frontend greške: Browser Developer Tools
- Vercel logovi: Vercel dashboard

## �� Licenca

ISC License

## 👨‍💻 Autor

Nikjeremic

## 🤝 Doprinos

Pull requestovi su dobrodošli! Za veće promene, molimo otvorite issue prvo da diskutujemo šta želite da promenite.

## 📞 Podrška

Za probleme sa deployment-om ili funkcionalnostima, molimo otvorite issue na GitHub-u.
