import "../styles/RecipeDetail.css";
import {Search, X} from "lucide-react";

type ChatbotProps = {
  setClose: React.Dispatch<React.SetStateAction<boolean>>;
}

const Chatbot = ( { setClose } : ChatbotProps ) => {
  return (
    <>
      <section className="chat-popup">
        <header className="chat-popup-header">
          <p className="chat-header-title">Recipe Help</p>
        </header>

        <input type="text" className="chat-searchbar"></input>
        <Search className="pin-to-searchbar"/>
        <X className="exit-button" onClick={() => setClose(prevState=>!prevState)}/>
      </section>
    </>
  );
}
export default Chatbot;