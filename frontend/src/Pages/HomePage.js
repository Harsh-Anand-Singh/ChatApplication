import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Text,
  TabList,
  Tab,
  Tabs,
  TabPanel,
  TabPanels,
} from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useHistory } from "react-router-dom";

const catchyLines = [
  "Join the Conversation",
  "Start Chatting Today",
  "Connect with Friends",
  "Share Your Thoughts",
  "Chat, Share, Connect",
  "Let's Get Talking",
  "Open Up and Chat",
  "Stay Connected",
  "Discover New Conversations",
  "Your Chatting Destination",
];

const HomePage = () => {
  const history = useHistory();
  const [isFooterAbsolute, setIsFooterAbsolute] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) history.push("/chats");

    // Set up an interval to change the catchy line every second
    const interval = setInterval(() => {
      setCurrentLineIndex((prevIndex) =>
        prevIndex === catchyLines.length - 1 ? 0 : prevIndex + 1
      );
    }, 1300);

    // Clear the interval on component unmount to avoid memory leaks
    return () => clearInterval(interval);
  }, [history]);

  const fadeInOutStyle = {
    fontSize: "2rem", // Increase the font size
    fontFamily: "Lato", // Change the font style
    opacity: "0.8",
    animation: "fadeInOut 2s infinite",
  };

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="transparent"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text style={fadeInOutStyle}>
          {catchyLines[currentLineIndex]}
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="solid-rounded">
          <TabList mb="1em">
            <Tab border={"1px solid blue"}>Login</Tab>
            <Tab border={"1px solid blue"}>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      {/* Footer */}
      <Box
        bg="rgb(2,2,2,.5)"
        p={2}
        textAlign="center"
        fontWeight="bold"
        color="white"
        position={isFooterAbsolute ? "absolute" : "relative"}
        bottom={isFooterAbsolute ? "0" : "auto"}
        width="100%"
        rounded="lg" // Add the rounded prop here
      >
        Developed by Harsh Anand Singh
      </Box>
    </Container>
  );
};

export default HomePage;
