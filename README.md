# Coache digital SL API


## Setup dev

  - Requirements: Node.js 18+, npm, PostgreSQL (database `coaching`)
  - Copy `.env.example` to `.env` and fill in the PostgreSQL connection
  - Generate the two local secrets and paste them in `.env`:
    - `openssl rand -hex 32` for `JWT_SECRET`
    - `openssl rand -base64 24` for `PASSWORD_SALT`
  - Leave `SENDGRID_API_KEY` empty: in development the OTP code is printed in the server log (`[OTP dev] email=... code=...`)
  - Run `npm install`
  - Run `npm run migration:run` to create the tables
  - Run `npm run start:dev`
  - Optional: run `npm run seed:fr` to load the French demo data (regions, schools, coaches, teachers, competences, questions and sessions; all fictitious). Admin login: `admin.test@example.com`, coach login: `coach.demo@example.com`
  - DRC: run `npm run seed:grille-rdc` to load the observation grid of annex B (6 sub-domains, 30 behaviours, help texts from the user manual, file `src/database/seeds/grille-rdc.json`). Add `-- --replace` to mark the sub-domains and behaviours missing from the file as deleted (for instance those of the demo data)
  - DRC: run `npm run seed:territoires-rdc` to load the education hierarchy (26 provinces, 60 PROVED, 635 sous-PROVED, file `src/database/seeds/territoires-rdc.csv`). Schools are then imported from the admin (Schools > Import data) with a CSV file `numero_secope,nom,province,proved,sous_proved`; the SECOPE number is optional. Example with fictitious schools: `src/database/seeds/ecoles-exemple-rdc.csv`
  - API: `http://localhost:3000/{COUNTRY}/api/`
  - Swagger: `http://localhost:3000/{COUNTRY}/api/docs`

## Setup prod with docker

  - Copy .env.example to .env
  - Run `npm run build-docker` or `docker build -t coach-backend-sl .`
  - Run `docker-compose up -d`
  - Open `http://localhost:3000/{COUNTRY}/api/docs`
