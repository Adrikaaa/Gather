# Gather — Real-time Group Chat

A web app where signed-in users can group chat in real time.
Built with React + Vite, Express, MongoDB, and Socket.IO.

## Getting started

Requirements: Node.js 20.19+ and a running MongoDB instance.

```sh
npm install
npm run setup   # creates server/.env with JWT secrets
npm run dev     # starts the server and client together
```

Then open http://localhost:5173

## How to use

1. Open the app in **two different browsers** (for example Chrome and Brave).
2. Sign in with a **different account** in each one (register if you don't have one).
3. Click **Open chat** on your account page.
4. Send a message: it shows up in the other browser instantly, with the sender's email.

> Why two browsers? Your login is stored in a cookie, so two tabs in the same
> browser share one account. Two browsers let you chat as two different people.
