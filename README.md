# gemini-flash-chatbot-starter
This is a practice repository for creating chatbot with vanilla HTML, CSS, and JS, with additional NodeJS and express for implementing Gemini API, powered by Gemini AI

## Prerequesite
- Knowlegde of HTML, CSS, and JS
- Node JS version 18+ (this repo is using 22.16.0)
- GEMINI API KEY (refer to document reference below)
- Document references:
  - [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
  - [Integrating Google Gemini to Node.js Application](https://medium.com/%40rajreetesh7/integrating-google-gemini-to-node-js-application-e45328613130)
  - [Gemini API docs for Chats](https://googleapis.github.io/js-genai/release_docs/classes/chats.Chat.html#gethistory)
- Postman for testing API (can use alternative like Thunder Client or REST Client in VS Code extensions)
- Gemini Code Assist extenstion in VS Code (optional but good to have for code assistance)

## Setup Parameter in Gemini configuration
| Parameter   |  Purpose                                              | Value range |
|:------------|:------------------------------------------------------|:----------: |
| temperature | Controls randomness in output. Higher = more creative | 0.0 - 2.0   |
| top_k       | Limits responses to top-K likely tokens               | 1 - 40      |
| top_p       | Uses nucleus sampling to limit randomness             | 0.0 - 1.0   |

### Why is this important?
Imagine your AI have differente "personalities":
- For **creative writinge**, you might want the **temperature: 0.9**.
- For **factual Q&A**, a lower value like **temperature: 0.2** ensures precision.


## How to run the web
1. run command `node --watch index.js`
2. in the browser, type `http://localhost:<port_number>
3. Have fun chatting with Gemini
4. can give feedback (optional hehe)

## Endpoints available
``` /api/chat
/api/chat -> for instance message return
method: POST
body: {
  "message": <string>
} (body in JSON)
```
``` /api/chat-stream
/api/chat-stream -> for streaming message return
method: POST
body: {
  "message": <string>
} (body in JSON)
```
