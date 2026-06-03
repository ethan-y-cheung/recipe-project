import cors from "cors";
import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import adminRouter from "./routes/admin.js";
import usersRouter from "./routes/users.js";
import testRouter from "./routes/test.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());
app.use('/admin', adminRouter);
app.use('/users', usersRouter);
app.use('/test', testRouter);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
