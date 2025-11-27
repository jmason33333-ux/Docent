// Chat history
let conversationHistory = [];
let userId = generateUserId();
let messageCounter = 0;

// Generate a simple user ID for session tracking
function generateUserId() {
  const stored = localStorage.getItem('docent_user_id');
  if (stored) return stored;

  const newId = 'user_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('docent_user_id', newId);
  return newId;
}

// Add message to chat UI
function addMessage(sender, content, metadata = null) {
  const chatContainer = document.getElementById('chat-container');

  // Remove welcome message on first interaction
  const welcome = chatContainer.querySelector('.welcome-message');
  if (welcome) {
    welcome.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  // Generate unique ID for Rowan messages (for feedback tracking)
  const messageId = sender === 'rowan' ? `msg_${++messageCounter}_${Date.now()}` : null;
  if (messageId) {
    messageDiv.dataset.messageId = messageId;
    messageDiv.dataset.content = content;
    if (metadata) {
      messageDiv.dataset.metadata = JSON.stringify(metadata);
    }
  }

  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = sender === 'user' ? 'You' : 'Rowan';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = content;

  messageDiv.appendChild(header);
  messageDiv.appendChild(messageContent);

  // Add feedback UI for Rowan messages
  if (sender === 'rowan' && messageId) {
    const feedbackDiv = createFeedbackUI(messageId);
    messageDiv.appendChild(feedbackDiv);
  }

  chatContainer.appendChild(messageDiv);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Create feedback UI for a message
function createFeedbackUI(messageId) {
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-ui';
  feedbackDiv.id = `feedback-${messageId}`;

  feedbackDiv.innerHTML = `
    <div class="feedback-buttons">
      <button class="feedback-btn thumbs-up" onclick="submitQuickFeedback('${messageId}', 5)" title="Helpful!">
        👍
      </button>
      <button class="feedback-btn thumbs-down" onclick="showDetailedFeedback('${messageId}')" title="Not quite right">
        👎
      </button>
    </div>
    <div class="feedback-detailed" id="detailed-${messageId}" style="display: none;">
      <p class="feedback-prompt">Help me improve! (Optional)</p>
      <div class="feedback-survey">
        <label>
          <input type="checkbox" name="warmth" value="warmth"> Rowan felt too formal/cold
        </label>
        <label>
          <input type="checkbox" name="length" value="length"> Response was too long/short
        </label>
        <label>
          <input type="checkbox" name="spoilers" value="spoilers"> Worried about spoilers
        </label>
        <label>
          <input type="checkbox" name="clarity" value="clarity"> Answer wasn't clear
        </label>
      </div>
      <textarea
        class="feedback-text"
        placeholder="Anything else? (optional)"
        rows="2"
      ></textarea>
      <div class="feedback-actions">
        <button onclick="submitDetailedFeedback('${messageId}')" class="btn-submit">Send Feedback</button>
        <button onclick="cancelFeedback('${messageId}')" class="btn-cancel">Cancel</button>
      </div>
    </div>
    <div class="feedback-thanks" id="thanks-${messageId}" style="display: none;">
      Thanks for your feedback! 💜
    </div>
  `;

  return feedbackDiv;
}

// Show loading indicator
function showLoading() {
  const chatContainer = document.getElementById('chat-container');
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-indicator';
  loadingDiv.className = 'message rowan';

  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = 'Rowan';

  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.innerHTML = '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';

  loadingDiv.appendChild(header);
  loadingDiv.appendChild(loading);
  chatContainer.appendChild(loadingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Remove loading indicator
function removeLoading() {
  const loading = document.getElementById('loading-indicator');
  if (loading) loading.remove();
}

// Send message to Rowan
async function sendMessage() {
  const bookSelect = document.getElementById('book-select');
  const chapterInput = document.getElementById('chapter-input');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  const bookTitle = bookSelect.value;
  const chapter = parseInt(chapterInput.value);
  const message = messageInput.value.trim();

  // Validation
  if (!bookTitle) {
    alert('Please select a book first!');
    return;
  }

  if (!chapter || chapter < 1) {
    alert('Please enter a valid chapter number!');
    return;
  }

  if (!message) {
    alert('Please type a question!');
    return;
  }

  // Add user message to UI
  addMessage('user', message);
  messageInput.value = '';

  // Disable input while waiting
  sendButton.disabled = true;
  messageInput.disabled = true;
  showLoading();

  try {
    const response = await fetch('/api/rowan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookTitle,
        chapter,
        message,
        history: conversationHistory,
        userId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response');
    }

    const data = await response.json();

    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: data.message }
    );

    // Remove loading and add Rowan's response with metadata
    removeLoading();
    addMessage('rowan', data.message, data.metadata);

    // Store last question for feedback context
    window.lastQuestion = message;
    window.lastBook = bookTitle;
    window.lastChapter = chapter;

  } catch (error) {
    removeLoading();
    addMessage('rowan', `Sorry, I encountered an error: ${error.message}. Please try again!`);
    console.error('Error:', error);
  } finally {
    sendButton.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
}

// Allow Enter to send (Shift+Enter for new line)
document.getElementById('message-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Feedback functions
async function submitQuickFeedback(messageId, rating) {
  const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
  const answer = messageDiv.dataset.content;
  const metadata = JSON.parse(messageDiv.dataset.metadata || '{}');

  await sendFeedback({
    messageId,
    rating,
    answer,
    promptVersion: metadata.promptVersion
  });

  // Show thanks message
  showThanksMessage(messageId);
}

function showDetailedFeedback(messageId) {
  const detailedDiv = document.getElementById(`detailed-${messageId}`);
  const buttonsDiv = document.querySelector(`#feedback-${messageId} .feedback-buttons`);

  buttonsDiv.style.display = 'none';
  detailedDiv.style.display = 'block';
}

async function submitDetailedFeedback(messageId) {
  const detailedDiv = document.getElementById(`detailed-${messageId}`);
  const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
  const answer = messageDiv.dataset.content;
  const metadata = JSON.parse(messageDiv.dataset.metadata || '{}');

  // Collect survey responses
  const checkboxes = detailedDiv.querySelectorAll('input[type="checkbox"]:checked');
  const issues = Array.from(checkboxes).map(cb => cb.value);

  const feedbackText = detailedDiv.querySelector('.feedback-text').value;

  let feedbackMessage = '';
  if (issues.length > 0) {
    feedbackMessage = `Issues: ${issues.join(', ')}. `;
  }
  if (feedbackText) {
    feedbackMessage += feedbackText;
  }

  await sendFeedback({
    messageId,
    rating: 2, // Thumbs down = low rating
    feedback: feedbackMessage || 'No specific feedback provided',
    answer,
    promptVersion: metadata.promptVersion
  });

  showThanksMessage(messageId);
}

function cancelFeedback(messageId) {
  const detailedDiv = document.getElementById(`detailed-${messageId}`);
  const buttonsDiv = document.querySelector(`#feedback-${messageId} .feedback-buttons`);

  detailedDiv.style.display = 'none';
  buttonsDiv.style.display = 'flex';
}

function showThanksMessage(messageId) {
  const feedbackUI = document.getElementById(`feedback-${messageId}`);
  const thanksDiv = document.getElementById(`thanks-${messageId}`);

  // Hide all other elements
  feedbackUI.querySelector('.feedback-buttons').style.display = 'none';
  const detailedDiv = document.getElementById(`detailed-${messageId}`);
  if (detailedDiv) detailedDiv.style.display = 'none';

  // Show thanks
  thanksDiv.style.display = 'block';
}

async function sendFeedback({ messageId, rating, feedback = '', answer, promptVersion }) {
  try {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        bookTitle: window.lastBook || 'unknown',
        chapter: window.lastChapter || 0,
        question: window.lastQuestion || '',
        answer,
        rating,
        feedback,
        promptVersion,
        messageId
      })
    });
  } catch (error) {
    console.error('Failed to submit feedback:', error);
  }
}

// Clear history when book or chapter changes
document.getElementById('book-select').addEventListener('change', () => {
  conversationHistory = [];
});

document.getElementById('chapter-input').addEventListener('change', () => {
  conversationHistory = [];
});
