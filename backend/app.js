import cors from "cors";
import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import testRouter from "./routes/test.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/test', testRouter);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
