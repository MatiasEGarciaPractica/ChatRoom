import { useEffect, useState } from "react";
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient = null;
const ChatRoom = () => {
    const [privateChats, setPrivateChats] = useState(new Map());//key will be usernames, values is the list of messages sended by that particular user
    const [publicChats, setPublicChats] = useState([]);
    const [tab, setTab] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: ''
    });
    useEffect(() => {
        console.log(userData);
    }, [userData]);

    const connect = () => {
        let Sock = new SockJS('http://localhost:8080/ws');//this url is created by the backend(server)
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    }

    const onConnected = () => {
        setUserData({ ...userData, "connected": true });
        //here the actual user is suscribe to the chatroom, onMessageReceived is the method that will manage the messages when they come to the chatrrom
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        //here the actual user is suscribe to its private chanel, onPrivateMessage is the method that will manage the messages when they come to itSelf
        stompClient.subscribe(`/user/${userData.username}/private`, onPrivateMessage);
        userJoin();
    }

    const userJoin = () => {
        var chatMessage = {
            senderName: userData.username,
            status: "JOIN"
        }
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

    /*Method to manage messages when come to a the chatroom*/
    const onMessageReceived = (payload) => {
        var payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
        }
    }

    /*Method to manage messages when come to a specific user*/
    const onPrivateMessage = (payload) => {
        console.log(payload);
        var payloadData = JSON.parse(payload.body);
        if (privateChats.get(payloadData.senderName)) { //we search if the new message has its owner user already registred in privateChats, I mean that we already received messages from him and we need to add the new one
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(newMap(privateChats));
        } else { //if we didnt talk with this user before we create a new list and add that new message to it, and then add the list and the username to the privateChats
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onError = (err) => {
        console.log(err)
    }

    const handleMessage = (evt) => {
        const { value } = evt.target;
        setUserData({ ...userData, "message": value });
    }

    //this method is for send messages in the CHatroom, like all are included, there is not a receiver in the chatMessage
    const sendValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: "MESSAGE"
            }
            console.log(chatMessage);
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    const sendPrivateValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                message: userData.message,
                status: "MESSAGE"
            };
            console.log(tab);//////
            if (userData.username !== tab) {
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send("/app/private-message",
                {},
                JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    /*to set the username of the user that is connected*/
    const handleUsername = (evt) => {
        const { value } = evt.target;
        setUserData({ ...userData, "username": value });
    }

    const registerUser = () => {
        connect();
    }

    return (
        <div className="container">
            {/*user have to be connected to see chats*/}
            {userData.connected ?          
                <div className="chat-box">
                    <div className="member-list">
                        <ul>
                            <li onClick={() => { setTab("CHATROOM") }} className={`member ${tab === "CHATROOM" && "active"}`}>Chatroom</li>
                            {[...privateChats.keys()].map((name, index) => (
                                <li onClick={() => { setTab(name) }} className={`member ${tab === name && "active"}`} key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                    {tab === "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {publicChats.map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>} {/* this div is for messages with a different user */}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>} {/* this div is for messages for connected user */}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text"
                                className="input-message"
                                placeholder="enter the message"
                                value={userData.message}
                                onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendValue}>send</button>
                        </div>
                    </div>}
                    {tab !== "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {[...privateChats.get(tab)].map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text"
                                className="input-message"
                                placeholder="enter the message"
                                value={userData.message}
                                onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendPrivateValue}>send</button>
                        </div>

                    </div>
                    }
                </div>
                :
                <div className="register">
                    <input id="user-name" 
                            placeholder="Enter your name" 
                            name="userName" 
                            value={userData.username} 
                            onChange={handleUsername} 
                            margin="normal"/>
                    <button type="button" onClick={registerUser}>
                        connect
                    </button>
                </div>
            }
        </div>
    )
}

export default ChatRoom;