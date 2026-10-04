import "dotenv/config";

import { createApp } from "./app.js";

const PORT = process.env.PORT || 3000;
const app = createApp({ frontendUrl: process.env.FRONTEND_URL });

app.listen(PORT, () => {
  console.log(`\nF1 Pitwall API running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health check: http://localhost:${PORT}/health\n`);
});
