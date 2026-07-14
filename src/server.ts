// src/server.ts
// Standalone Express Server entry point hosting background agent endpoints.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import agentRouter from "./routes/agentRoutes";

dotenv.config();

const app = express();
const PORT = process.env.AGENT_SERVER_PORT || 3003;

app.use(cors());
app.use(express.json());

// Mount the background worker agent routes
app.use("/api/agents", agentRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "voltaic-agent-server" });
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🔋 Voltaic Background Agent Server running on PORT ${PORT}`);
  console.log(`🤖 Endpoints mounted at http://localhost:${PORT}/api/agents`);
  console.log(`================================================================`);
});
