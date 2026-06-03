import "../../styles/RecipeDetail.css";
import {X} from "lucide-react";
import {useState, useEffect, useRef} from 'react';
import axios from 'axios';

type ChatbotProps = {
  setClose: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ChatbotMessage {
  role: string;
  content: string;
}

const Chatbot = ( { setClose } : ChatbotProps ) => {
  const baseURL : string = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
  const [messages, setMessages] = useState<ChatbotMessage[]>([{role: "bot", content: "ask any cooking questions here!"}]);
  const [search, setSearch] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Scrolls the anchor div into view smoothly
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function sendMessage() {
    if (!search.trim()) return; // no empty searches

    const newMessages = [
      ...messages,
      { role: "user", content: search},
    ];
    setMessages(newMessages);

    try {
      const response = await axios.post(`${baseURL}/chat`,
        {messages: newMessages,}
      )

      setMessages([
        ...newMessages,
        response.data,
      ]);
      
      setSearch(""); // clear out search
    } catch (error) {
      console.error("Error in server:", error);
    }
  }

  // Trigger scroll every time the messages list changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <section className="chat-popup">
        {/* header */}
        <header className="chat-popup-header">
          <p className="chat-header-title">Recipe Help</p>
        </header>

        {/* message scroll */}
        <div className="message-scroll">
          {messages.map((message, index) => (
          <div className={`message ${message.role === "user" ? "user" : "bot"}`} key={index}>
            <p>
              {message.content}
            </p>
          </div>))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* searchbar */}
        <input placeholder="substitutes for onions..." 
          type="text" 
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {if (e.key === "Enter") sendMessage()}}
          className="chat-searchbar">
        </input>
        
        {/* exit button */}
        <X className="exit-button" onClick={() => setClose(prevState=>!prevState)}/>
      </section>
    </>
  );
}
export default Chatbot;