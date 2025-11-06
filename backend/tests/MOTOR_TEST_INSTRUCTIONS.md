# Testing Motor Control Endpoints

## Setup

1. **Install axios for testing** (if not already installed):
   ```bash
   cd backend
   npm install axios --save-dev
   ```

2. **Configure your backend .env file**:
   Add these lines to your `backend/.env` file:
   ```
   # Motor Controller Configuration
   MOTOR_CONTROLLER_IP=localhost
   MOTOR_CONTROLLER_PORT=8888
   ```

## Testing Process

You'll need 3 terminal windows:

### Terminal 1: Start the Mock Motor Controller
```bash
cd backend
npm run motor:mock
```
This will start a mock motor controller on port 8888 that logs all received commands.

### Terminal 2: Start the Backend Server
```bash
cd backend
npm run dev
```
Your backend API should start on port 3001.

### Terminal 3: Run the Tests
```bash
cd backend
npm run motor:test
```
This will send test requests to all motor endpoints and show the results.

## What the Tests Do

The test script will:
1. Test each individual motor endpoint (`/move-x`, `/move-y`, `/zoom-in`, `/zoom-out`)
2. Test the generic `/command` endpoint
3. Test error handling with invalid commands and amounts
4. Show you the request/response for each test

## Expected Output

**Mock Motor Controller** will show:
- Connection logs when the API connects
- Received commands with their parameters
- Responses sent back

**Test Script** will show:
- Each endpoint being tested
- Success/failure status
- Response data from the API

## Manual Testing with cURL

You can also test manually using cURL:

```bash
# Move X motor 10 steps
curl -X POST http://localhost:3001/api/motor/move-x \
  -H "Content-Type: application/json" \
  -d '{"amount": 10}'

# Move Y motor 5 steps
curl -X POST http://localhost:3001/api/motor/move-y \
  -H "Content-Type: application/json" \
  -d '{"amount": 5}'

# Zoom in 3 steps
curl -X POST http://localhost:3001/api/motor/zoom-in \
  -H "Content-Type: application/json" \
  -d '{"amount": 3}'

# Generic command endpoint
curl -X POST http://localhost:3001/api/motor/command \
  -H "Content-Type: application/json" \
  -d '{"command": "move_x", "amount": 15}'
```

## Troubleshooting

- **Connection refused**: Make sure both the mock motor controller and backend are running
- **ECONNREFUSED on motor controller**: Check that the IP and port in .env match the mock server
- **Invalid command errors**: Check that you're using the exact command strings (move_x, move_y, zoom_in_fine, zoom_out_fine)
