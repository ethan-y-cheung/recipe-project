import "dotenv/config";
import OpenAI from "openai";
import express, { Request, Response} from 'express';


const router = express.Router();

// Create OpenAI client object (connect to OpenAI)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// POST endpoint - how we send messages to the server
router.post("/", async(req : Request, res : Response): Promise<void> => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({
      error: "Messages must be an array",
    });
    return
  }

  try {
    console.log("Incoming messages:", messages);

    const messagesWithSystem = [
      { role: "system", content: "You are a concise, helpful cooking assistant." },
      ...messages, // Spread operator to take multiple messages at once
    ];

    // OpenAI API Call - send request to API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messagesWithSystem,
    });

    // Extract AI's response - just the first if there are multiple
    const aiMessage = response.choices[0].message;

    console.log("AI response:", aiMessage);

    res.status(200).json({
      role: aiMessage.role,
      content: aiMessage.content,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: "OpenAI API failed",
    });
  }
});

export default router;