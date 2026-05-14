## Features

The app will have the following features:
- Chat interface including message input and display current conversation
- Chat history on a sidebar with the ability to switch between conversations
- Support for multiple models and model switching

## Rules

- Build a context message, which includes the conversation history and the current user input, and send it to the local model via the ollama api.
- An input to select the model to use on each conversation.
- Disable the input for model selection when the conversation has messages, to avoid confusion. The model can only be selected at the beginning of the conversation.
- The app should be responsive and work well on both desktop and mobile devices.
- Generate a subject line for each conversation based on the first user message, and display it in the chat history sidebar.

## Api

The api is under `http://localhost:11434` and the endpoint is `/api/generate` for generating response, and `/api/tags` for listing all models, and `/api/ps` for listing all running models.

Use `.rest/ollama.http` for testing the api.


## TODOs

- Add a notification service when the model is not responding or something went wrong. A timeout limit for the model response should be fixed on a config file.