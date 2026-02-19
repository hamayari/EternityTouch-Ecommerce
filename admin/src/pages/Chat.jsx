import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Chip,
  Badge,
  Divider,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import {
  Send,
  Person,
  Circle,
  CheckCircle,
  Close
} from '@mui/icons-material';

const Chat = ({ token }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState('all');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    fetchChats();
  }, [filter]);

  useEffect(() => {
    if (selectedChat && socket) {
      socket.emit('join-chat', selectedChat._id);

      socket.on('new-message', (data) => {
        if (data.chatId === selectedChat._id) {
          setSelectedChat(prev => ({
            ...prev,
            messages: [...prev.messages, data.message]
          }));
          scrollToBottom();
        }
        fetchChats(); // Refresh chat list
      });
    }
  }, [selectedChat, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/chat/all?status=${filter}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignChat = async (chatId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/chat/assign`,
        { chatId, adminName: 'Admin' },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Chat assigned');
        fetchChats();
        if (selectedChat?._id === chatId) {
          setSelectedChat(response.data.chat);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to assign chat');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      sender: 'admin',
      senderName: 'Support Team',
      message: message.trim(),
      timestamp: new Date(),
      read: false
    };

    try {
      const response = await axios.post(
        `${backendUrl}/api/chat/admin-send`,
        {
          chatId: selectedChat._id,
          ...newMessage
        },
        { headers: { token } }
      );

      if (response.data.success) {
        socket?.emit('send-message', {
          chatId: selectedChat._id,
          message: newMessage
        });
        setMessage('');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message');
    }
  };

  const handleCloseChat = async (chatId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/chat/close`,
        { chatId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Chat closed');
        fetchChats();
        if (selectedChat?._id === chatId) {
          setSelectedChat(null);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to close chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'waiting': return 'warning';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getUnreadCount = (chat) => {
    return chat.messages.filter(m => m.sender === 'user' && !m.read).length;
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Live Chat Support
      </Typography>

      <Grid container spacing={2} sx={{ height: 'calc(100% - 60px)' }}>
        {/* Chat List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tabs
              value={filter}
              onChange={(e, newValue) => setFilter(newValue)}
              variant="fullWidth"
            >
              <Tab label="All" value="all" />
              <Tab label="Waiting" value="waiting" />
              <Tab label="Active" value="active" />
            </Tabs>
            <Divider />
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {chats.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No chats found
                  </Typography>
                </Box>
              ) : (
                chats.map((chat) => (
                  <ListItem key={chat._id} disablePadding>
                    <ListItemButton
                      selected={selectedChat?._id === chat._id}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <ListItemAvatar>
                        <Badge badgeContent={getUnreadCount(chat)} color="error">
                          <Avatar>
                            <Person />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {chat.userName}
                            </Typography>
                            <Chip
                              label={chat.status}
                              size="small"
                              color={getStatusColor(chat.status)}
                              sx={{ height: 20 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {chat.messages.length > 0
                              ? chat.messages[chat.messages.length - 1].message.substring(0, 30) + '...'
                              : 'No messages yet'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Chat Window */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedChat ? (
              <>
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedChat.userName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedChat.userEmail}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedChat.status === 'waiting' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={() => handleAssignChat(selectedChat._id)}
                        sx={{ bgcolor: 'black', '&:hover': { bgcolor: 'grey.800' } }}
                      >
                        Accept Chat
                      </Button>
                    )}
                    {selectedChat.status !== 'closed' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Close />}
                        onClick={() => handleCloseChat(selectedChat._id)}
                      >
                        Close
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.50' }}>
                  {selectedChat.messages.map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                        mb: 1.5
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          maxWidth: '70%',
                          bgcolor: msg.sender === 'admin' ? 'black' : 'white',
                          color: msg.sender === 'admin' ? 'white' : 'black'
                        }}
                      >
                        {msg.sender === 'user' && (
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                            {msg.senderName}
                          </Typography>
                        )}
                        <Typography variant="body2">{msg.message}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input */}
                {selectedChat.status !== 'closed' && (
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        sx={{
                          bgcolor: 'black',
                          color: 'white',
                          '&:hover': { bgcolor: 'grey.800' }
                        }}
                      >
                        <Send />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Select a chat to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chat;
