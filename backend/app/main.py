from fastapi import FastAPI

app = FastAPI(title="Smart Event Management System")


@app.get("/health")
def health_check():
    return {"status": "ok"}
