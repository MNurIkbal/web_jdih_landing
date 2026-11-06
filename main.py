"""
Kerangka penarik data berpaginasi dari endpoint JSON.
- Mengecek robots.txt dulu; berhenti kalau dilarang.
- Jeda antar permintaan, retry, dan bisa dilanjutkan (resume).
- Simpan data mentah ke JSONL, lalu ekspor ke CSV.

Cara pakai:
  pip install requests
  1. Isi API_URL dan PARAMS di bawah (lihat langkah DevTools di penjelasan).
  2. python scrape_jdihn.py
"""
import csv
import json
import os
import time
import urllib.robotparser
from urllib.parse import urlparse

import requests

# ====== ISI BAGIAN INI ======
API_URL = ""            # endpoint JSON dari tab Network (XHR/Fetch), bukan halaman HTML
PARAMS = {}             # parameter tetap, mis. {"c": "peraturan"}
PAGE_PARAM = "page"     # nama parameter halaman di endpoint
START_PAGE = 1
ITEMS_KEY = None        # kunci list data di JSON, mis. "data"; None jika responsnya langsung list
DELAY = 2.0             # detik antar permintaan, jangan terlalu cepat
OUT_JSONL = "jdihn_raw.jsonl"
OUT_CSV = "jdihn.csv"
USER_AGENT = "Riset-Hukum-Pribadi/1.0 (kontak: email-anda@contoh.com)"
# ============================


def allowed(url):
    p = urlparse(url)
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(f"{p.scheme}://{p.netloc}/robots.txt")
    rp.read()
    return rp.can_fetch(USER_AGENT, url)


def last_page_done():
    if not os.path.exists(OUT_JSONL):
        return START_PAGE - 1
    last = START_PAGE - 1
    with open(OUT_JSONL, encoding="utf-8") as f:
        for line in f:
            last = max(last, json.loads(line)["_page"])
    return last


def fetch(session, page):
    params = dict(PARAMS, **{PAGE_PARAM: page})
    for attempt in range(4):
        r = session.get(API_URL, params=params, timeout=30)
        if r.status_code == 200:
            return r.json()
        if r.status_code in (429, 500, 502, 503):
            time.sleep(5 * (attempt + 1))
            continue
        r.raise_for_status()
    raise RuntimeError(f"Gagal di halaman {page}")


def to_csv():
    rows = []
    with open(OUT_JSONL, encoding="utf-8") as f:
        for line in f:
            rows.append(json.loads(line))
    keys = sorted({k for r in rows for k in r})
    with open(OUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=keys)
        w.writeheader()
        for r in rows:
            w.writerow({k: json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v
                        for k, v in r.items()})
    print(f"CSV tersimpan: {OUT_CSV} ({len(rows)} baris)")


def main():
    if not API_URL:
        raise SystemExit("Isi API_URL dulu.")
    if not allowed(API_URL):
        raise SystemExit("robots.txt melarang akses otomatis ke URL ini. Berhenti. "
                         "Minta izin/API resmi ke pengelola situs.")
    s = requests.Session()
    s.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json"})
    page = last_page_done() + 1
    with open(OUT_JSONL, "a", encoding="utf-8") as out:
        while True:
            data = fetch(s, page)
            items = data.get(ITEMS_KEY, []) if ITEMS_KEY else data
            if not items:
                print(f"Selesai, halaman {page} kosong.")
                break
            for it in items:
                it["_page"] = page
                out.write(json.dumps(it, ensure_ascii=False) + "\n")
            out.flush()
            print(f"Halaman {page}: {len(items)} item")
            page += 1
            time.sleep(DELAY)
    to_csv()


if __name__ == "__main__":
    main()