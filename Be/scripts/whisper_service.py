import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from faster_whisper import WhisperModel
from dotenv import load_dotenv

ROOT_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ROOT_ENV_PATH, override=False)

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN")
if hf_token:
    os.environ["HF_TOKEN"] = hf_token
    os.environ.setdefault("HUGGINGFACE_HUB_TOKEN", hf_token)


MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

app = FastAPI(title="Whisper Pronunciation Service", version="1.0.0")

_model = WhisperModel(
    MODEL_SIZE,
    device=DEVICE,
    compute_type=COMPUTE_TYPE,
)


@app.get("/health")
def health():
    return {
        "ok": True,
        "model_size": MODEL_SIZE,
        "device": DEVICE,
        "compute_type": COMPUTE_TYPE,
        "hf_token_configured": bool(hf_token),
    }


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    if not audio:
        raise HTTPException(status_code=400, detail="No audio file uploaded")

    suffix = Path(audio.filename or "audio.webm").suffix or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await audio.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty audio file")
        tmp.write(content)
        tmp_path = tmp.name

    try:
        segments, info = _model.transcribe(
            tmp_path,
            language="zh",
            beam_size=5,
            vad_filter=True,
        )
        seg_list = list(segments)
        transcript = "".join(seg.text for seg in seg_list).strip()

        return {
            "transcript": transcript,
            "language": info.language,
            "language_probability": info.language_probability,
            "segments": [
                {
                    "start": seg.start,
                    "end": seg.end,
                    "text": seg.text,
                    "avg_logprob": seg.avg_logprob,
                    "no_speech_prob": seg.no_speech_prob,
                }
                for seg in seg_list
            ],
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {error}")
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
