# Promo Pulse — licitaciona platforma za usluge (Laravel + React/MUI)

Promo Pulse je web aplikacija koja povezuje **ponuđače usluga** i **kupce** kroz jednostavan sistem licitacija. Kupci pregledaju projekte/usluge, daju svoje ponude (zahteve) i ostavljaju recenzije, dok ponuđači upravljaju projektima, obrađuju pristigle ponude, donose odluke (odobreno/odbijeno), prate statistiku i po potrebi izvoze listu zahteva u PDF. Kroz čitav interfejs primenjeni su pregledni kartični prikazi, leve navigacione fioke sa ikonama (MUI Icons) i breadcrumbs navigacija radi lakšeg snalaženja.

Aplikacija je podeljena na dva sloja: **Laravel API** (autentikacija preko Sanctum tokena, validacije i poslovna pravila) i **React klijent** (MUI komponentni sistem, modalni dijalozi, Recharts grafikoni i pomoćni hookovi). U domenu zahteva primenjen je precizan model: svaka ponuda ima status (`obrada`, `odobren`, `odbijen`), samo **jedna** ponuda po projektu može biti odobrena, a nakon odobrenja se projekat zaključava i sve preostale ponude se automatski odbijaju. Na detaljima projekta kupac vidi **licitacioni baner** (trenutno najviša ponuda i ko je vodeći) i sam **taster za slanje zahteva** se automatski onemogućava ako projekat ima već odobren zahtev.

Recenzije se vezuju za **odobren** zahtev: kupac može ostaviti ocenu (zvezdice 1–5) i kratak komentar, a zatim recenziju izmeniti ili obrisati. Na stranici detalja projekta prikazuje se **prosečna ocena** (zvezdice sa decimalama i broj pored), a dodatno postoji i dugme **„Pogledaj sve recenzije“** koje otvara skrolabilni modal sa svim komentarima i zvezdicama. Za ponuđače je dostupna **statistika** sa grafikonima (Recharts) – kretanje zahteva kroz vreme, raspodela po statusima i top projekti po broju zahteva – kao i **izvoz lista zahteva u PDF** (DOMPDF), npr. za internu evidenciju.

Stranica **„O nama“** prikazuje vrednosti i misiju platforme, kao i karticu sa nasumičnim citatom o napornom radu. Citati se dovlače sa DummyJSON, a prevod na srpski vrši se preko besplatnog javnog servisa **MyMemory** (bez API ključa), uz dugme **„Osveži citat“**. Interfejs je responzivan, sa fokusom na čitljivost i jasnoću (primarna boja #D42700). Leva fioka ima i skupljeno/rašireno stanje; širina u raširenom modu je povećana kako bi tekst stavki stao bez prelamanja.

![Logo](./images/logo.png)

---

## Tehnologije

**Backend**
- Laravel 10+
- Laravel Sanctum (token auth)
- Eloquent, Resources
- barryvdh/laravel-dompdf (PDF izvoz)

**Frontend**
- React (Vite)
- MUI (Material UI + ikone)
- Recharts (grafikoni)
- Fetch API
- MyMemory Translate (bez API ključa) za prevod citata

---

## Uloge i mogućnosti

### 1) Neulogovani korisnik
Neulogovani korisnik vidi javne stranice kao što su **Prijava**, **Registracija** i **O nama**. Navigaciona fioka i unutrašnje rute (projekti, zahtevi, statistika) nisu dostupne dok se korisnik ne autentifikuje. Pokušaji pristupa zaštićenim API rutama rezultuju odgovorom o neautorizovanom pristupu, a UI podrazumevano ne prikazuje stavke menija koje zahtevaju prijavu. Na stranici za prijavu i registraciju naglasak je na jasnim formama, validaciji i vizuelnom identitetu aplikacije.

### 2) Kupac
Kupac nakon prijave dolazi na svoju početnu (kupac) i ima pristup listi **Usluga/Projekata**. Sa liste se može preći na **Detalje usluge**, gde su prikazani naziv, kategorija, opis, budžet, rok i prioritet. Na toj stranici postoji **licitacioni baner** koji obaveštava o trenutnoj najvišoj ponudi i vodećem kupcu; ukupan broj pristiglih zahteva takođe je naveden. Kupac može da pošalje **Zahtev (ponudu)** preko modalnog prozora: unosi poruku i iznos ponude, pri čemu ponuda mora biti **≥ budžeta**. Ako je za projekat već odobrena neka ponuda, projekat je **zaključan** i dugme za slanje zahteva je onemogućeno.

Na stranici **„Moji Zahtevi“** kupac vidi sve svoje poslate zahteve. Dok je zahtev u statusu **„obrada“**, kupac može izmeniti poruku ili obrisati zahtev; kada je zahtev **„odobren“**, brisanje i izmena poruke više nisu dostupni (zadržava se istorija). Ako je zahtev **odobren**, kupac dobija mogućnost da ostavi **recenziju**: ocenu zvezdicama i kratak komentar. Recenzija je izmenjiva i brisiva, a prosečna ocena projekta (sa decimalama) prikazuje se na stranici detalja. Kupac, dakle, licitira, menja/uklanja zahteve u obradi i doprinosi kvalitetu platforme kroz povratne informacije.

### 3) Ponuđač
Ponuđač nakon prijave ima svoju početnu (ponuđač), poseduje stranicu **„Moje Usluge“** za pregled i uređivanje sopstvenih projekata i ključnu stranicu **„Moji Zahtevi“** koja prikazuje **sve pristigle ponude** za njegove projekte. Iz tabele ponuđač može da označi zahtev kao **„odobren“** ili **„odbijen“**. Pri odobrenju jednog zahteva:
- svi ostali zahtevi za taj projekat bivaju **automatski odbijeni**,
- projekat se označava kao **zaključan**,
- slanje novih zahteva od strane kupaca za taj projekat se onemogućava.

Ponuđač takođe poseduje stranicu **„Statistika Zahteva“**, gde su dostupni grafikoni: broj zahteva kroz vreme (grupisanje po danu ili sl.), raspodela statusa i top projekti po broju zahteva. Na vrhu se prikazuju agregati (ukupno, odobreni, odbijeni, konverzija). Za potrebe evidencije postoji dugme **„Export PDF“** koje generiše i preuzima PDF izveštaj sa spiskom zahteva (projekat, kupac, poruka, budžet, ponuda, status, vreme kreiranja). Ponuđač nema mogućnost da šalje zahteve niti da ostavlja recenzije — njegova uloga je upravljanje sopstvenim projektima i donošenje odluka o pristiglim ponudama.

---

## Funkcionalni tokovi i pravila

**Projekti (Usluge).** Svaki projekat ima budžet i vlasnika (ponuđača). Na detaljima projekta kupac vidi sve bitne informacije, prosečnu ocenu i, kada postoji licitacija, informativni baner o najvišoj ponudi i vodećem kupcu.

**Zahtevi (licitacije).** Kupac kreira zahtev uz poruku i iznos ponude. Pravilo je da **ponuda ne može biti manja od budžeta**. Ponuđač iz liste zahteva odobrava ili odbija. **Samo jedan odobreni zahtev po projektu**: odobrenjem jednog, ostali postaju odbijeni, a projekat se zaključava. Nakon zaključavanja više nije moguće slati nove zahteve niti promeniti status postojećih drugačije od pravila (server štiti i od pokušaja odobrenja dodatnog zahteva).

**Recenzije.** Vezuju se za **odobren** zahtev. Kupac može ostaviti ocenu (1–5) i komentar, izmeniti ili obrisati recenziju. Na detaljima projekta prikazuje se prosečna ocena zvezdicama sa decimalnom preciznošću i brojčani prikaz pored; klikom na „Pogledaj sve recenzije“ otvara se skrolabilni modal sa kompletnim listama i zvezdanim prikazima.

**Statistika i izvoz.** Ponuđač ima pregled nad performansama: vremenski tok zahteva, statusna raspodela i top projekti. Ti podaci su strukturirani tako da se lako prikazuju Recharts komponentama, a za administrativne/pregledne potrebe postoji **PDF izvoz** kompletne liste zahteva.

**Sigurnost i uloge.** API rute su zaštićene preko Sanctum-a. Kontroleri proveravaju uloge: npr. **kupac** može kreirati/menjati/brisati **sopstvene** zahteve i recenzije, a **ponuđač** može menjati status samo za zahteve nad sopstvenim projektima. UI dodatno skriva/onemogućava akcije u skladu sa rolama i statusima (npr. dugme za novu ponudu je onemogućeno kada je projekat zaključan).

---

## Interfejs i UX napomene

Leva navigaciona fioka (MUI Drawer) je **responzivna**, sa skupljenim (ikonice) i raširenim stanjem (ikonice + tekst). Raširena širina je povećana kako bi sve stavke stale bez lomljenja teksta, a breadcrumbs traka pomaže orijentaciji. Sve akcije koje menjaju stanje (slanje zahteva, izmena poruke, recenzije, promene statusa) rade kroz **modalne dijaloge** sa jasnim greškama/porukama uspeha. Na prvim ekranima (Početne stranice za kupca/ponuđača) postavljen je vizuelni fokus na glavni cilj (pretraga usluga, kreiranje usluge). Stranica „O nama“ sadrži i dinamičan citat o napornom radu na srpskom jeziku, koji se može **osvežiti** jednim klikom.

---

## Modeli (opisno)

- **User** — atribut `role` (kupac | ponudjac).  
- **Project** — veze sa ponuđačem (`service_seller_id`), finansije (`budget`), status zaključavanja (`is_locked`, `locked_at`), osnovni opis i parametri.  
- **Request** — veze sa kupcem (`service_buyer_id`) i projektom, polja `message`, `price_offer`, `status` (`obrada|odobren|odbijen`), `decided_at`.  
- **Review** — veže se na jedan **odobren** Request, sadrži `rating` (1–5) i `review` (tekst).  
- **Category** — opciona kategorizacija projekta.

Ova struktura omogućava čiste relacije (hasMany/belongsTo/hasOne), jednostavnu validaciju i jasna poslovna pravila oko licitacija, zaključavanja i recenziranja.

---

## Napomena o citatima

Za karticu sa citatima koristi se DummyJSON (nasumičan citat) i **MyMemory** za prevod na srpski. Rešenje radi **bez API ključa**, a postoji dugme „Osveži citat“ koje dovlači novi sadržaj. Kôd je inkapsuliran u `useCitat` hooku i lako se koristi unutar `ONama.jsx`.

---

Instalacija i pokretanje
---------------------------

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2024-projekat-freelance_aplikacija_20200114_20200233.git
```
2. Pokrenite backend:
```bash
   cd freelance-backend
   composer install
   php artisan migrate:fresh --seed
   php artisan serve
```
    
3. Pokrenite frontend:
```bash
   cd freelance-frontend
   npm install
   npm start
```
    
4.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)

---

## Zaključak

Promo Pulse spaja jasna **pravila licitacije** i **roles-based** dozvole sa prijatnim, brzom interfejsom. Kupci dobijaju transparentan način da ponude cenu i ostave recenziju, a ponuđači dobijaju praktične alate za odlučivanje, izveštavanje i analitiku. Arhitektura i UI su skrojeni tako da se lako nadograđuju – bilo da se proširuje domen (npr. escrow, chat, notifikacije) ili dodaju novi tipovi izveštaja i filtera.
