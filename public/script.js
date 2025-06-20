const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const thinkingIndicator = 'Gemini is thinking, please wait for a while...';
const API_STREAM_CHAT = "/api/chat-stream"; // Endpoint for streaming

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;
  appendMessageToChatBox('user', userMessage);
  input.value = '';

  // Create an empty message element for the bot's response, which will be streamed into.
  // It's added to the DOM here so it's in place and maintains message order.
  const botStreamResponseElement = createMessageElement('bot', thinkingIndicator);
  chatBox.appendChild(botStreamResponseElement);
  scrollToBottom(); // Scroll after adding the (currently empty) bot message container

  try {
    const response = await fetch(API_STREAM_CHAT, { // Use the stream API
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });
    // // Remove thinking indicator as soon as we have a response (or error before stream)
    // if (thinkingMessageElement && chatBox.contains(thinkingMessageElement)) {
    //   chatBox.removeChild(thinkingMessageElement);
    // }

    if (!response.ok) {
      const errorText = await response.text(); // Errors from stream might be text
      // Remove the empty bot stream placeholder if an error occurs before streaming
      if (chatBox.contains(botStreamResponseElement)) {
          chatBox.removeChild(botStreamResponseElement);
      }
      appendMessageToChatBox('bot', `Error: ${errorText || response.statusText}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8'); // Specify encoding, e.g., 'utf-8'

    // Stream the response into the botStreamResponseElement
    let accumulatedText = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      accumulatedText += decoder.decode(value, { stream: true }); // stream: true is important for multi-byte chars
      botStreamResponseElement.textContent = accumulatedText; // Update the content
      scrollToBottom();
    }
    // Final decode to flush any remaining bytes in the decoder's buffer
    const remainingText = decoder.decode();
    if (remainingText) {
        accumulatedText += remainingText;
        botStreamResponseElement.textContent = accumulatedText;
        scrollToBottom();
    }
    // If the stream was empty, botStreamResponseElement will remain empty, which is fine.

  } catch (error) {
    // Ensure thinking indicator is removed on network error
    const currentThinkingMsg = document.getElementById('thinking-message');
    if (currentThinkingMsg && chatBox.contains(currentThinkingMsg)) {
      chatBox.removeChild(currentThinkingMsg);
    }
    // Remove the bot stream placeholder if it's still in the DOM and an error occurred
    if (botStreamResponseElement && chatBox.contains(botStreamResponseElement)) {
        chatBox.removeChild(botStreamResponseElement);
    }

    console.error('Error processing stream:', error);
    appendMessageToChatBox('bot', 'Sorry, something went wrong while connecting to the bot. check console for details.');
  }
});

// Creates a message element, appends it to the chatBox, and returns the element.
// Optionally takes an id for the message element.
function appendMessageToChatBox(sender, text, id = null) {
  const msgElement = createMessageElement(sender, text);
  if (id) {
    msgElement.id = id;
  }
  chatBox.appendChild(msgElement);
  scrollToBottom(); // Scroll after any message is appended
  return msgElement;
}

// Creates a message element but does NOT append it.
// Useful for preparing an element that will be filled by a stream.
function createMessageElement(sender, text) {
  const msgElement = document.createElement('div');
  msgElement.classList.add('message', sender);
  // Using textContent is safer against XSS if the bot's response isn't sanitized.
  // If you intend to render HTML/Markdown from the bot, you'd use .innerHTML here
  // and ensure the content is properly sanitized or parsed by a markdown library.
  msgElement.textContent = text;
  return msgElement;
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}
