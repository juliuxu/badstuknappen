# 🌊 Badstuknappen 🧖

> [https://badstuknappen.julianjark.no](https://badstuknappen.julianjark.no)

## Beskrivelse

Bestill badstubesøk med så få steg som mulig

1. Fyll inn informasjonen din
2. Klikk bestill
3. Vent på betalingsvarsel fra Vipps og godta
4. Slapp av, og møt opp på badstuen 🧘

## Tech stack

- Bygget med [Remix](https://remix.run/)
- Automatisering med [Playwright](https://playwright.dev/)
- Styling med [Pico.css](https://picocss.com/)
- Kontainer [Docker](https://www.docker.com/)
- Hjemmehosting med [unRaid](https://unraid.net/)

## Utvikling

For lokal utvikling trenger du å lage en `.env` fil i rotmappa.

```sh
PASSWORD=din-hemmlighet
```

Installer pakker og kjør utviklingsserveren

```sh
# Installer npm pakker
npm install

# Installer nettleser som playwright bruker
npx playwright install --with-deps

# Kjør utviklingsserveren
npm run dev
```
