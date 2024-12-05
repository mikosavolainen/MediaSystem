# MediaSystem Setup Guide 

Follow these steps to set up and run the MediaSystem project.

---

## 1. Start the MediaSystem Application

Open a new terminal and run the following commands:

```bash
cd mediasystem
npm install
npm start
```

---

## 2. Install Backend Dependencies

Open **another terminal** and run these commands:

```bash
cd mediasystem/backend
php composer.phar uninstall **
php composer.phar require firebase/php-jwt mongodb/mongodb
php -S localhost:24243 server.php
```

---

## Notes

- Ensure all dependencies are installed correctly.
- The development server will be available at: `http://localhost:24243`.




---


# MediaSystemin asennusohjeet

Noudata näitä ohjeita asentaaksesi ja käynnistääksesi MediaSystem-projektin.

---

## 1. Käynnistä MediaSystem-sovellus

Avaa uusi pääte ja suorita seuraavat komennot:

```bash
cd mediasystem
npm install
npm start
```

---

## 2. Asenna taustajärjestelmän riippuvuudet

Avaa **toinen pääte** ja suorita siellä seuraavat komennot:

```bash
cd mediasystem/backend
php composer.phar uninstall **
php composer.phar require firebase/php-jwt mongodb/mongodb
php -S localhost:24243 server.php
```

---

## Huomioitavaa

- Varmista, että kaikki riippuvuudet on asennettu oikein.
- Kehityspalvelin on käytettävissä osoitteessa: `http://localhost:24243`.
