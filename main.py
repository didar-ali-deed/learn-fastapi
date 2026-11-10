from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def greet():
    return "Welcome To Lesson-1"
