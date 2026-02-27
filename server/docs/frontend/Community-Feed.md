# Frontend Implementation: Community Feed

The Feed is the central social hub for TATT. It handles content discovery, engagement, and membership-gated resources.

## 1. Fetching the Feed
**Endpoint:** `GET /feed`

**Query Parameters:**
- `type`: `ALL` (default), `CHAPTER` (localized), `PREMIUM` (paid).
- `page`: Pagination page (default 1).
- `limit`: Results per page (default 20).

### Content Gating UI
Posts returned in the list contain an `isPremiumLocked` boolean.
- If `isPremiumLocked: true`: The `content` field will be `null`. The frontend should display a "Locked" state with a clear "Upgrade Membership" CTA.
- If `isPremiumLocked: false`: Display the full `content`.

---

## 2. Post Creation
**Endpoint:** `POST /feed`

**Payload:**
```json
{
  "title": "Post Title",
  "content": "Body text or HTML",
  "contentFormat": "PLAIN | MARKDOWN | HTML",
  "type": "GENERAL | RESOURCE | EVENT | ANNOUNCEMENT",
  "isPremium": true, // Requires paid tier or staff role
  "mediaUrls": ["https://..."], // URLs from Uploads API
  "tags": ["Tech", "Business"]
}
```

### Rich Text Editor
- If `contentFormat` is `HTML`, the frontend should use a library like **Quill**, **Tiptap**, or **CKEditor**.
- The backend runs a strict sanitizer. Avoid using unsupported tags like `<script>` or `<iframe>` as they will be stripped.

---

## 3. Social Interaction

### 3.1 Likes
**Endpoint:** `POST /feed/:id/like`  
**Toggle Behavior:** Re-calling the endpoint on an already-liked post will **unlike** it.
**UI Update:** Increment/decrement the local `likesCount` and toggle the `isLikedByMe` state.

### 3.2 Comments & Replies
**Fetch Comments:** `GET /feed/:id/comments` (returns a flat list).
**Add Comment:** `POST /feed/:id/comment`
- **Payload:** `{ content, parentId }`
- **Nesting:** If `parentId` is provided, the comment is treated as a reply. Note that the backend currently only supports **one level** of nesting.

---

## 4. Media Integration
Before creating a post with images or videos:
1. Call `POST /uploads/media` with a `multipart/form-data` payload.
2. The API returns an array of `publicUrl` strings.
3. Pass these strings into the `mediaUrls` array of the `POST /feed` payload.

## 5. View Logic
- **`CHAPTER` Feed:** Scopes content to the user's registered chapter. 
- **`PREMIUM` Feed:** Aggregates all high-value resources and announcements meant for paid tiers. Use this for the "Resources" or "Discover" tab.
