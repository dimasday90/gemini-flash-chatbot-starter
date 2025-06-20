const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const { GoogleGenAI } = require("@google/genai")

dotenv.config()
const app = express()
const port = process?.env?.PORT || 3000

/// Middleware
app.use(cors()) // Allows cross-origin requests (for frontend/backend separation).
app.use(express.json()) // Parses incoming JSON request bodies.
app.use(express.static("public")) // Serves frontend files (e.g., index.html, script.js, style.css) from public/folder.

/// Gemini setup
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY)
const modelStr = "gemini-2.5-flash"
const geminiConfig = {
  temperature: 1,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};
const chat = genAI.chats.create({ model: modelStr, config: geminiConfig })

/// Create chat API
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message

  if (!userMessage) {
    return res.status(400).json({ error: "No message provided" })
  }

  try {
    const response = await chat.sendMessage({
      message: userMessage
    })
    res.status(200).json({ reply: response.text })
  } catch (error) {
    console.log(error)
    res.status(500).json({ reply: "Something went wrong" })
  }
})

/// Create chat stream API (corrected and using a new path)
app.post("/api/chat-stream", async (req, res) => {
  const userMessage = req.body.message

  if (!userMessage) {
    return res.status(400).json({ error: "No message provided" })
  }

  try {
    // Set headers for a streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.status(200); // Set status before sending any data

    const stream = await chat.sendMessageStream({
      message: userMessage
    });

    for await (const chunk of stream) {
      // Each chunk is a GenerateContentResponse, access text via its text() method
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(chunkText); // Send the chunk of text to the client
      }
    }

    res.end(); // Signal that the response is complete
  } catch (error) {
    console.error("Error in chat stream:", error);
    // If headers haven't been sent, we can send a JSON error
    if (!res.headersSent) {
      res.status(500).json({ error: "Something went wrong with the stream" });
    } else {
      // If headers are already sent, just end the response.
      // The client will likely detect an incomplete stream.
      res.end();
    }
  }
})

app.listen(port, () => {
  console.log(`Welcome to my Gemini-Flash-Chatbot-Starter project, running on localhost:${port}`)
})