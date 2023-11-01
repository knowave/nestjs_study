import React, { useState, useEffect } from "react";
import axios from "axios";

interface ChatProps {
  socket: SocketIOClient.Socket | null;
  userInfo: any; // 실제 사용자 정보
}

const Chat: React.FC<ChatProps> = ({ socket, userInfo }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [receiverId, setReceiverId] = useState<number | null>(null);

  const handleSendMessage = () => {
    if (socket && receiverId) {
      socket.emit("sendMessage", {
        senderId: userInfo.id,
        receiverId,
        content: message,
      });
      setMessage("");
    }
  };

  useEffect(() => {
    if (socket && userInfo) {
      // 사용자 정보를 가져오는 API 호출
      axios
        .get("API_ENDPOINT/user-info") // 실제 API 엔드포인트로 변경
        .then((response) => {
          const userData = response.data;
          if (userData && userData.id) {
            setReceiverId(userData.id);
          }
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
        });
    }
  }, [socket, userInfo]);

  useEffect(() => {
    if (socket) {
      socket.on("messageSent", (message: string) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, [socket]);

  return (
    <div>
      <h2>Chatting with User {receiverId}</h2>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
