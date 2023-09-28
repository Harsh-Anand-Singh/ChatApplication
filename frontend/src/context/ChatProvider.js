import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

//The below code is used to create a context, in this case, the context is called 'ChatContext'
const ChatContext = createContext();

//parameter children is basically whole of the app
const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);

  const history = useHistory();

  useEffect(() => {
    //If we want to login, we need to get the user info from the local storage
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    //if there is no user info, then redirect to login page
    if (!userInfo) history.push("/");
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

//every state is present inside the ChatState, so we can use it anywhere in the app
export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
