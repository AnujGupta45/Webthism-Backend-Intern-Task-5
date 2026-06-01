import dotenv from "dotenv";
// Load env before other files
dotenv.config();

import app from "./app";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});

// Handle unhandled Promise rejections globally
process.on("unhandledRejection", (err: any) => {
  console.error("UNHANDLED REJECTION! Shutting down server...", err);
  server.close(() => {
    process.exit(1);
  });
});
