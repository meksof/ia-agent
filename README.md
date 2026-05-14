# IA Agent

A chat app to interact with local model via an ollama api.

## Api

The api is under `http://localhost:11434` and the endpoint is `/api/generate` for generating response, and `/api/tags` for listing all models, and `/api/ps` for listing all running models.

`.rest/ollama.http` file should help you test the api.

## TODOs

- Add a notification service when the model is not responding or something went wrong. A timeout limit for the model response should be fixed on a config file.