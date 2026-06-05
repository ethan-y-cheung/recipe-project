import "dotenv/config";
import cors from "cors";
import express from "express";
import adminRouter from "./routes/admin.js";
import usersRouter from "./routes/users.js";
import testRouter from "./routes/test.js";
import awsRouter from "./routes/aws.js";
import commentRouter from "./routes/comments.js";
import chatRouter from "./routes/openai.js";
import userRecipesRouter from "./routes/userRecipes.js";
import recipesRouter from "./routes/recipe.js";


const app = express();
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
app.use("/aws", awsRouter);
app.use("/comments", commentRouter);
app.use("/chat", chatRouter);
app.use("/userrecipe", userRecipesRouter);
app.use("/recipes", recipesRouter);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
