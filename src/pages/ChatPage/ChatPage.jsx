import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./ChatPage.css";
import { sendRequest } from "../../utilities/users/send-request";

function ChatPage() {
    const [input, setInput] = useState("");
    const [msgs, setMsgs] = useState([]);
    async function getMessages() {
        const msgLog = await sendRequest("/api/messages");
        console.log(msgLog);
        setMsgs(msgLog);
    }

    const socketRef = useRef();

    useEffect(() => {
        // setMsgs(getMessages());
        getMessages();

        if (!socketRef.current) {
            socketRef.current = io({
                autoConnect: false,
            });
        }
        const socket = socketRef.current;

        socket.connect();

        // 💡 from server.js > io.on > socket.on > socket.broadcast.emit("newMsg")
        socket.on("newMsg", (msg) => {
            setMsgs((msgs) => [...msgs, msg]);
        });

        return () => {
            socket.off("newMsg");
            socket.disconnect();
        };
    }, []);

    function handleChange(e) {
        setInput(e.target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const newMsg = { text: input };

        setMsgs((msgs) => [...msgs, newMsg]);

        // 💡 to server.js > io.on > socket.on
        socketRef.current.emit("sendMsg", input);

        setInput("");
    }

    return (
        <div className="ChatPage">
            <h1>ChatPage</h1>
            <div className="chat-box">
                <ul>
                    {msgs.map((msg) => {
                        return <li>{msg.text}</li>;
                    })}
                </ul>
            </div>
            <div className="wrapper">
                <form onSubmit={handleSubmit}>
                    <input type="text" value={input} onChange={handleChange} />
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
}

export default ChatPage;