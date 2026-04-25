# FocusRoom Full Security & Bug Audit Report

This report follows the four-step workflow covering automated SAST, manual vulnerability audits, pentest evaluation, and error-detective remediation mapping.

## Step 1: `SAST` & `find-bugs` (Automated & Static Analysis)

### 1A. Automated Scanning Findings
We simulated standard static checks, which immediately flagged critical supply-chain vulnerabilities in the dependencies context:
- **`socket.io-parser` (Severity: High)**: Discovered vulnerable version susceptible to Denial of Service (DoS) via unbounded binary attachments. 
- **`path-to-regexp` (Severity: High)**: Inherited path-parsing regex library vulnerable to ReDoS (Regular Expression Denial of Service).

### 1B. Surface-Level Bugs (`find-bugs`)
A thorough static code review uncovered critical operational bugs in WebSocket state management:

1. **Incorrect Object Targeting during Disconnect (Memory Leak & Zombie Connections)**
   - **File**: `backend/src/controller/socketManager.js:77-90`
   - **Problem**: In the `disconnect` listener, the nested loops check if `v[a] === socket.id`. However, `v` is an array of objects `[{id, username}]`, meaning `v[a]` is an object. The condition is never true.
   - **Impact**: When users disconnect, they are never cleanly removed from the `connections` object. Over time, memory will fill up with zombie connections. Because `indexOf(socket.id)` fails (returns `-1`), the `.splice(-1, 1)` operation mistakenly deletes the _last_ user in the array rather than the intended disconnected user.

2. **WebSocket Emit Error in Chat Broadcast**
   - **File**: `backend/src/controller/socketManager.js:63-65`
   - **Problem**: Broadcasting messages in `chat-message` does `io.to(ele).emit(...)` where `ele` is the object `{id, username}`, not a connection ID string.
   - **Impact**: Because `io.to()` expects a string Socket ID, message delivery will silently fail, breaking the chat functionality for all users in the room.

---

## Step 2: `security-auditor` & `vulnerability-scanner` (Deep Manual Audit)

Moving beyond basic scanning, this phase uncovers implicit application logic flaws and misconfigurations identifying *why* the implementation falls short of OWASP best practices.

1. **Security Misconfiguration: Overly Permissive CORS (OWASP A01 / A05)**
   - **Location**: `backend/app.js:18` & `backend/src/controller/socketManager.js:6`
   - **Issue**: `origin: (origin, callback) => callback(null, true)` with `credentials: true`.
   - **Why It's Dangerous**: This defeats cross-origin security entirely. By returning `true` for any origin while allowing credentials (cookies/tokens), any malicious website a user visits can read from and write to your API endpoints on behalf of the user, stealing data or overtaking accounts (Classic Cross-Site Request Forgery / CSRF vulnerability layout). 

2. **Cryptographic Failures: Insecure Tokens (OWASP A02)**
   - **Location**: `backend/src/controller/user_controller.js:23`
   - **Issue**: Session tokens are generated using `crypto.randomBytes(16).toString("hex")` and stored in plaintext in the database indefinitely without expiration. 
   - **Why It's Dangerous**: If the MongoDB database is ever compromised or backed up insecurely, all user sessions are immediately compromised. Standard practice requires tokens to expire and utilize cryptographically secure verification methods like JWTs, or heavily hashing bearer tokens before storage.

3. **Insecure Design: Missing Rate Limiting (OWASP A04 / A10)**
   - **Location**: `backend/src/routes/user_routes.js`
   - **Issue**: No throttling on `/login` or `/register` endpoints.
   - **Why It's Dangerous**: An attacker can easily launch unlimited credential stuffing attacks or brute-force user passwords. 

4. **Security Misconfiguration: Verbose Error Stacks (OWASP A05)**
   - **Location**: `backend/app.js:50`
   - **Issue**: Passing `err.stack` unconditionally if `NODE_ENV === "development"` safely limits the stack track footprint, but fallback messages might reveal internal Node/Mongoose details to callers on failure, facilitating backend reconnaissance for attackers.

---

## Step 3: `pentest-checklist` & `top-web-vulnerabilities`

Here is a simulated real-world attack behavior breakdown of how these would be abused.

- **Vulnerability Category 61/62 (Denial of Service - DoS)** 
  - *Attack Pattern*: Attackers establish multiple websockets, triggering the memory leak array-splice bug. Attackers simultaneously emit massive payloads or spam the `socket.io-parser` binary parser parsing bug found in NPM.
  - *Validation*: Penetration test would prove service disruption via resource exhaustion on `socketManager.js`.
  
- **Vulnerability Category 57 (Insecure Cross-Origin Comm)**
  - *Attack Pattern*: Attacker emails a phished link to the target user. Upon opening the malicious link, a hidden AJAX request triggers `localhost:8000/api/v1/users/login` using the user's active session, effectively bridging network contexts thanks to the wildcard CORS and `credentials:true` tag mapping.

- **Vulnerability Category 15 (Brute Force / Enumeration)**
  - *Attack Pattern*: Because `/login` indicates `"USER NOT FOUND!"` vs `"Invalid password"`, an attacker can easily enumerate through thousands of usernames to figure out who is registered, and then run a parallel dictionary attack against discovered users without triggering lockouts or timeouts.

---

## Step 4: `error-detective` & `threat-mitigation-mapping`

### Explain & Fix - Actionable Mitigation Map

#### 1. Fixing the Zombie WebSocket Connections & Splice Bug
**Threat**: Complete socket state corruption and continuous memory leaking.
**Mitigation Code**:
Modify `backend/src/controller/socketManager.js:76-88` to correctly target the object property `.id`:
```javascript
for (const key of Object.keys(connections)) {
    // Find the index by mapping objects to IDs first
    const index = connections[key].findIndex(user => user.id === socket.id);
    if (index !== -1) {
        // Emit user-left
        connections[key].forEach(user => {
            io.to(user.id).emit('user-left', socket.id);
        });
        // Remove the disconnected user
        connections[key].splice(index, 1);
        if (connections[key].length === 0) {
            delete connections[key];
        }
    }
}
```

#### 2. Fixing Chat Emit Failures
**Threat**: The app is passing an object into `io.to()`, causing chat payloads to get lost.
**Mitigation Code**:
Update the `chat-message` broadcast loop (`backend/src/controller/socketManager.js:63`) properly:
```javascript
for (const ele of connections[matchingRoom]) {
    io.to(ele.id).emit("chat-message", data, sender, socket.id);
}
```

#### 3. Fixing Wildcard CORS With Credentials
**Threat**: Broad data exposure to unauthorized sites.
**Mitigation Code**:
In `app.js:17` and `socketManager.js:5`, explicitly whitelist your real client URLs instead of allowing everything.
```javascript
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
```

#### 4. Hardening Dependencies & Passwords
**Threat**: Enumeration, ReDoS, and Brute Forcing.
**Mitigation Code**:
1. Run `npm i socket.io@latest path-to-regexp@latest` inside your backend to patch external high-severity vulnerabilities.
2. In `user_controller.js`, standardize the response to avoid enumeration (e.g., return "Invalid credentials" whether the failure is a bad username or bad password).
3. Introduce `express-rate-limit` on authorization endpoints to block brute-forcing.
