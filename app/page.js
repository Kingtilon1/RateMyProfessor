"use client";
import Image from "next/image";
import ButtonAppBar from "./components/Appbar";
import { useState } from "react";
import { Box, Stack, TextField, Button, Paper, Typography } from "@mui/material";
import { motion,useMotionTemplate } from "framer-motion";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ]);

  const [message, setMessage] = useState("");
  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const backgroundImage = useMotionTemplate`linear-gradient(to right, #070F26, #D97E6A 50%, #070F26)`

  return (
  <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    sx={{
      background: "linear-gradient(to right, #070F26, #D97E6A 50%, #070F26)", // Symmetrical gradient
    }}
  >
    
    <Box
      width={{
        xs: "100vw",  // Full width for extra-small devices (mobile)
        sm: "90vw",   // 90% width for small devices (tablets)
        md: "80vw",   // 80% width for medium devices (laptops)
        lg: "70vw",   // 70% width for large devices (desktops)
      }}
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
     
      sx={{ backgroundColor: "#D97E6A" }}
    >
    
      {/* <ButtonAppBar title='Rate My Teacher'  /> */}
      <Stack
        direction={"column"}
        width={{
          xs: "90vw",   // Adjusts width for mobile screens
          sm: "80vw",   // Slightly less width for small devices
          md: "600px",  // Fixed width for medium devices and above
        }}
        height={{
          xs: "80vh",   // Adjust height for mobile devices
          sm: "70vh",   // Less height for small devices
          md: "700px",  // Fixed height for medium devices and above
        }}
        border="1px solid black"
        p={2}
        spacing={3}
        borderRadius="10px"
        sx={{ backgroundColor: "white", borderColor: 'white' }}
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={message.role === "assistant" ? "#696273" : "#D97E6A"}
                color="white"
                borderRadius={16}
                p={2} // Padding adjustment
                sx={{
                  width: {
                    xs: "75%",  // Messages take 75% width of the screen on mobile
                    sm: "70%",  // 70% on small screens
                    md: "60%",  // Fixed width on larger screens
                  },
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage} sx={{ backgroundColor: '#0D1940' }}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  </Box>
);

}
