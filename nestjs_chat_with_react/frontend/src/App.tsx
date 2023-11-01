import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import Chat from "./Chat";

const SERVER_URL = "http://localhost:3000"; // 백엔드 서버 주소

function App() {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null); // 사용자 정보를 저장할 상태

  useEffect(() => {
    const newSocket = io(SERVER_URL);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 사용자 정보를 서버에서 가져오는 함수
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/user`);
      setUserInfo(response.data); // 서버에서 받아온 사용자 정보 설정
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  return (
    <div className="App">
      <h1>Chat Application</h1>
      <div>
        <button onClick={fetchUserInfo}>Fetch User Info</button>
      </div>
      {userInfo && socket && <Chat socket={socket} userInfo={userInfo} />}
    </div>
  );
}

export default App;
