import os, re, time, smtplib, threading
import psycopg2
from email.message import EmailMessage
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
hits = {}

def query(sql, args=(), fetch=True):
    c = psycopg2.connect(
        host=os.getenv("DB_HOST", "db"), dbname=os.getenv("DB_NAME", "portfolio"),
        user=os.getenv("DB_USER", "portfolio"), password=os.getenv("DB_PASSWORD", "changeme"))
    try:
        with c, c.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, args)
            return cur.fetchall() if fetch else None
    finally:
        c.close()

def limited(ip):
    now = time.time()
    recent = [t for t in hits.get(ip, []) if now - t < 3600] + [now]
    hits[ip] = recent
    return len(recent) > 5

def send_mail(name, email, msg, ip):
    user, pw = os.getenv("SMTP_USER"), os.getenv("SMTP_PASS")
    to = os.getenv("MAIL_TO", user)
    if not (user and pw):
        app.logger.warning("SMTP_USER / SMTP_PASS not set - email not sent")
        return
    m = EmailMessage()
    m["Subject"] = "Portfolio message from " + name[:60]
    m["From"], m["To"], m["Reply-To"] = user, to, email
    m.set_content(f"Name: {name}\nEmail: {email}\nIP: {ip}\n\nMessage:\n{msg}")
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as s:
            s.starttls()
            s.login(user, pw)
            s.send_message(m)
    except Exception as e:
        app.logger.error("mail failed: %s", e)

@app.get("/api/health")
def health():
    query("SELECT 1")
    return {"status": "ok", "tier": "backend+db"}

@app.get("/api/profile")
def profile():
    return jsonify(
        skills=query("SELECT category,items FROM skills ORDER BY id"),
        projects=query("SELECT title,subtitle,stack,details,link FROM projects ORDER BY id"),
        experience=query("SELECT role,company,period,details FROM experience ORDER BY id"),
        education=query("SELECT degree,school,period,details FROM education ORDER BY id"),
        certifications=query("SELECT name,issued FROM certifications ORDER BY id"))

@app.post("/api/visit")
def visit():
    query("INSERT INTO visits DEFAULT VALUES", fetch=False)
    return query("SELECT count(*) AS total FROM visits")[0]

@app.post("/api/contact")
def contact():
    d = request.get_json(silent=True) or {}
    if str(d.get("website", "")).strip():            # honeypot: bots fill this hidden field
        return {"ok": True}, 201
    name, email, msg = (str(d.get(k, "")).strip() for k in ("name", "email", "message"))
    name = " ".join(name.split())
    if not (name and EMAIL_RE.match(email) and msg) or len(msg) > 2000 or len(name) > 100:
        return {"error": "Please fill all fields correctly"}, 400
    ip = request.headers.get("X-Real-IP", request.remote_addr)
    if limited(ip):
        return {"error": "Too many messages, try again later"}, 429
    query("INSERT INTO messages(name,email,message) VALUES(%s,%s,%s)", (name, email, msg), fetch=False)
    threading.Thread(target=send_mail, args=(name, email, msg, ip), daemon=True).start()
    return {"ok": True}, 201
