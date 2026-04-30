# Flask Auth Backend

## 1) Create virtual env

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
```

## 2) Install dependencies

```bash
pip install -r requirements.txt
```

## 3) Start server

```bash
python app.py
```

Server runs at `http://127.0.0.1:5000`.

## 4) Frontend env (optional)

If you need another backend URL, set:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```
