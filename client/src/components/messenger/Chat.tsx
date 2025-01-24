import "./chat-style.css";

import SendIcon from "@mui/icons-material/Send";

const Chat = () => {
  return (
    <>
      <section className="chat">
        {/* Messages */}
        <div className="messages-container">
          <div className="message sender">
            <p className="message-text">Hello! How are you?</p>
            <span className="message-time">10:30 AM</span>
          </div>
          <div className="message receiver">
            <p className="message-text">I'm good, thank you! And you?</p>
            <span className="message-time">10:31 AM</span>
          </div>
          <div className="message sender">
            <p className="message-text">Doing great! Thanks for asking.</p>
            <span className="message-time">10:32 AM</span>
          </div>
          <div className="message sender">
            <p className="message-text">Hello! How are you?</p>
            <span className="message-time">10:30 AM</span>
          </div>
          <div className="message receiver">
            <p className="message-text">I'm good, thank you! And you?</p>
            <span className="message-time">10:31 AM</span>
          </div>
          <div className="message sender">
            <p className="message-text">Doing great! Thanks for asking.</p>
            <span className="message-time">10:32 AM</span>
          </div>
          <div className="message sender">
            <p className="message-text">Hello! How are you?</p>
            <span className="message-time">10:30 AM</span>
          </div>
          <div className="message receiver">
            <p className="message-text">I'm good, thank you! And you?</p>
            <span className="message-time">10:31 AM</span>
          </div>
          <div className="message sender">
            <p className="message-text">Doing great! Thanks for asking.</p>
            <span className="message-time">10:32 AM</span>
          </div>
        </div>

        {/* Send Message Form */}
        <div className="send-message-container mt-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="message-input"
          />
          <button type="submit" className="send-button">
            <SendIcon />
          </button>
        </div>
      </section>
    </>
  );
};

export default Chat;
