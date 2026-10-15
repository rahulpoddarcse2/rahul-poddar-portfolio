# Rahul Poddar - 3-Tier Portfolio

Tier 1: Nginx (static site, resume PDF, reverse proxy) -> Tier 2: Flask API (gunicorn, sends email) -> Tier 3: PostgreSQL (private network, volume-backed)

## Contact form -> your Gmail
Every message is saved in PostgreSQL and emailed to rahulpoddarcse1@gmail.com (Reply-To is the visitor's email, so you can just hit Reply).
1. Turn on 2-Step Verification for the Gmail account.
2. Google Account -> Security -> App passwords -> create one (16 characters).
3. Put it in `.env` as `SMTP_PASS` (or pass `-var smtp_password=...` to Terraform).
The password is never in the frontend or Git (`.env` is git-ignored).

## Run locally
    cp .env.example .env     # set DB_PASSWORD and SMTP_PASS
    docker compose up -d --build
    open http://localhost

## Deploy on AWS (ap-south-1)
1. Push this folder to your GitHub repo.
2. `cd terraform && terraform init`
3. `terraform apply -var key_name=<keypair> -var repo_url=<repo> -var my_ip_cidr=<ip>/32 -var db_password=<strong> -var smtp_password=<app-password>`
4. Open the `website_url` output after 3-4 minutes.

## Edit content
Edit `db/init.sql` (skills, projects, experience, education, certifications) before the first run.
To change a running server: `docker compose down -v && docker compose up -d --build` (wipes stored messages/visits).
To update the resume, replace `frontend/Rahul_Poddar_Resume.pdf` and rebuild: `docker compose up -d --build frontend`.
View messages saved in DB: `docker compose exec db psql -U portfolio -c "SELECT * FROM messages;"`

## Folder structure
    rahul-poddar-portfolio/
    ├── docker-compose.yml        # runs all 3 tiers
    ├── .env.example              # copy to .env and fill passwords
    ├── frontend/                 # Tier 1: Nginx + website + resume PDF
    │   ├── index.html  style.css  app.js
    │   ├── Rahul_Poddar_Resume.pdf
    │   ├── nginx.conf  Dockerfile
    ├── backend/                  # Tier 2: Flask API (+ contact email)
    │   ├── app.py  requirements.txt  Dockerfile
    ├── db/init.sql               # Tier 3: PostgreSQL schema + your content
    └── terraform/main.tf         # EC2 + security group + Elastic IP (ap-south-1)
