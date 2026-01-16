import { makeApp } from "./app.js";
import { initDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    initDB();
    const app = makeApp();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
}

main();
