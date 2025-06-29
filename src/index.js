import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./routes/lib/db.js";
import job from "./routes/lib/cron.js";
const app = express();
const PORT = process.env.PORT || 3000;
job.start();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
console.log({ PORT });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
