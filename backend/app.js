import cors from "cors";
import express from "express";
import adminRouter from "./routes/admin.js";
import usersRouter from "./routes/users.js";
import dotenv from "dotenv";
import testRouter from "./routes/test.js";
import awsRouter from "./routes/aws.js";

dotenv.config();

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);
app.use(express.json());
app.use("/admin", adminRouter);
app.use("/users", usersRouter);
app.use("/test", testRouter);
app.use('/aws', awsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
