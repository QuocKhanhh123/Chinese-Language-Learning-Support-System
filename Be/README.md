# Backend

## Pronunciation Evaluation (Whisper)

Backend now exposes pronunciation scoring endpoint for FE:

- `POST /api/vocabularies/pronunciation/evaluate`
- Auth: `student` or `teacher`
- `multipart/form-data`:
	- `audio`: webm/wav/mp3/m4a/ogg
	- `target_text`: expected Chinese text

Response data:

- `asr_text`: transcript from Whisper
- `score`: accuracy 0-100
- `band`: one of `chua_dat`, `dat_co_ban`, `kha`, `tot`
- `bandLabel`: human-readable label
- `details`: mismatch hints

## Run Whisper Service (Python)

Backend forwards audio to external Whisper service via:

- `WHISPER_SERVICE_URL` (default: `http://127.0.0.1:8000/transcribe`)

Whisper service script also reads `Be/.env` directly, so you can manage config in one place.

### 1. Install Python dependencies

```bash
pip install -r scripts/requirements-whisper.txt
```

### 2. Start service

```bash
uvicorn scripts.whisper_service:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Optional env tuning

- `WHISPER_MODEL_SIZE` (default: `small`)
- `WHISPER_DEVICE` (default: `cpu`)
- `WHISPER_COMPUTE_TYPE` (default: `int8`)
- `HF_HUB_DISABLE_SYMLINKS_WARNING` (set `1` to suppress Windows symlink cache warning)
- `HF_TOKEN` (recommended to avoid anonymous Hugging Face warning and improve download limits)

If you still see:

- `Warning: You are sending unauthenticated requests to the HF Hub...`

add your Hugging Face access token in `Be/.env`:

```env
HF_TOKEN=hf_xxx_your_token
```

then restart uvicorn.

## Quick check

1. Start Whisper service (port 8000).
2. Start Node backend (port 4000).
3. Open FE pronunciation screen and record audio.
