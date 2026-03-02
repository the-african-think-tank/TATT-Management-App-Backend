# Frontend Implementation: Networking & Direct Messaging

This section covers member discovery via the recommender system and the real-time communication engine.

## 1. Member Discovery (TATT Connect)
**Endpoint:** `GET /connections/recommend`

This returns a list of suggested members based on shared interests, chapter, and industry.
- Each item includes a `matchReason` with the calculated `score`.
- Use this to populate a "Suggested for You" horizontal scroll or sidebar.

---

## 2. Connections Management

### 2.1 Sending a Request
**Endpoint:** `POST /connections/request`  
**Payload:** `{ recipientId, message }` (Message is required, 20-500 chars).
**Restriction:** Only available to users with a `communityTier` of `UBUNTU`, `IMANI`, or `KIONGOZI`.

### 2.2 Managing Requests
- **Incoming:** `GET /connections/requests/incoming`
- **Sent:** `GET /connections/requests/sent`
- **Action:** `PATCH /connections/request/:id/respond`
  - **Payload:** `{ action: "ACCEPT" | "DECLINE" }`

---

## 3. Direct Messaging (Chat)

### 3.1 Fetching Chats
- **Conversation List:** `GET /messages/conversations` (Displays partners with unread counts and last message).
- **History:** `GET /messages/history/:connectionId?limit=50` (Paginated chat bubbles).

### 3.2 Real-time Interface (WebSockets)
**WebSocket Config:**
- **Host:** Same as API.
- **Namespace:** `/messages`
- **Auth:** Pass JWT in `handshake.auth.token`.

**Events for Frontend to Handle:**
| Event | Direction | Payload |
| :--- | :--- | :--- |
| `send_message` | Client -> Server | `{ connectionId, content, clientMessageId }` |
| `new_message` | Server -> Client | Full message object (incoming message). |
| `typing_status` | Server -> Client | `{ connectionId, userId, isTyping }` |
| `message_read` | Server -> Client | `{ connectionId, messageIds }` (Update UI seen states). |

### 3.3 Reliable Messaging
When sending a message via WebSocket, the frontend should generate a **UUID** as `clientMessageId`.
- If the connection drops and retries, the server will ignore the duplicate `clientMessageId`, preventing double-bubble issues.

---

## 4. Chat Partner Profiles
**Endpoint:** `GET /messages/partner/:connectionId`
Returns the full profile, bio, and industry of the chat partner. Useful for the "Chat Header" or a "View Profile" drawer.
