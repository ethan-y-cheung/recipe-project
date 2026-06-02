import cors from "cors";
import "dotenv/config";
import express from "express";
import testRouter from "./routes/test.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/test', testRouter);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
