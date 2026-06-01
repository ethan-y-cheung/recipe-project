import cors from "cors";
import "dotenv/config";
import express from "express";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
