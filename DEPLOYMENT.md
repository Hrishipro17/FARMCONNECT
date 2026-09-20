# FarmConnect deployment

## 1. MongoDB Atlas

1. Open MongoDB Atlas and create a database named `farmconnect`.
2. Create a database user and keep its username and password.
3. In **Network Access**, add the IP address allowed by your backend host. For a quick Render test, `0.0.0.0/0` allows connections from all addresses; restrict this later if possible.
4. Copy the connection string and replace its username, password, and database name.

## 2. Deploy the backend on Render

Create a **Web Service** from this repository with:

- Root Directory: `BACK END`
- Build Command: `npm install`
- Start Command: `npm start`
- Runtime: Node

Add these environment variables in Render. Do not commit them to GitHub:

```text
MONGO_URI=your MongoDB Atlas connection string
JWT_SECRET=a long random secret
FRONTEND_URL=https://your-vercel-site.vercel.app
```

After deployment, open:

```text
https://your-backend.onrender.com/api/health
```

The response should contain `"ok":true` and `"database":"connected"`.

## 3. Connect the Vercel frontend

In `FRONT END/script.js`, replace `YOUR-BACKEND.onrender.com` with the actual Render hostname:

```js
const API_URL = window.FARMCONNECT_API_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api"
        : "https://your-backend.onrender.com/api");
```

Deploy the `FRONT END` folder as the Vercel project root. Then register a user and add a product to confirm that MongoDB is working.
