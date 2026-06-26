## Logging Middleware

A reusable logging package for Node.js applications. Sends structured log entries to a remote logging server via HTTP POST, and also prints color-coded output to the console for local debugging.

### Installation

Since this is a local package, add it to your app's `package.json`:

```json
{
  "dependencies": {
    "logging-middleware": "file:../logging-middleware"
  }
}
```

Then run `npm install`.

### Quick Start

```javascript
const { Log, initLogger } = require("logging-middleware");

// 1. Initialize with your Bearer token (once, at app startup)
initLogger({ token: "your-access-token" });

// 2. Use Log() anywhere
Log("backend", "info", "server", "Server started on port 3000");
Log("backend", "error", "handler", "Failed to process request");
```

### API

#### `initLogger(options)`

Sets up the logger with authentication credentials.

| Option  | Type   | Required | Description           |
|---------|--------|----------|-----------------------|
| `token` | string | Yes      | Bearer token for auth |

#### `Log(stack, level, package, message)`

Sends a log entry to the server and prints it to the console.

| Parameter | Type   | Description                                  |
|-----------|--------|----------------------------------------------|
| `stack`   | string | Application layer (`"backend"`, `"db"`, etc) |
| `level`   | string | Severity: `info`, `debug`, `warn`, `error`, `fatal` |
| `package` | string | Module name where the log originated         |
| `message` | string | Descriptive log message                      |

### Log Levels

- **info** — General operational messages (server started, request received)
- **debug** — Detailed info useful during development
- **warn** — Something unexpected but not breaking
- **error** — Something failed but the app can continue
- **fatal** — Critical failure, app may need to stop

### Running Tests

```bash
cd logging-middleware
npm test
```
