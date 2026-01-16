import { makeApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function main() {
  await connectDB();

  const app = makeApp();
  app.listen(env.PORT, () => {
    console.log(`✅ API running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
});
