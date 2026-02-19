import { useState, useEffect, useContext, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Badge,
  Slide,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  Chat,
  Close,
  Send,
  SupportAgent,
  Circle
} from '@mui/icons-material';

const ChatWidget = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (token && open && !chat) {
      initChat();
    }
  }, [token, open]);

  useEffect(() => {
    if (chat && !socket) {
      const newSocket = io(backendUrl);
      setSocket(newSocket);

      newSocket.emit('join-chat', chat._id);

      newSocket.on('new-message', (data) => {
        if (data.chatId === chat._id) {
          setMessages(prev => [...prev, data.message]);
          if (data.message.sender === 'admin' && !open) {
            setUnreadCount(prev => prev + 1);
          }
          scrollToBottom();
        }
      });

      newSocket.on('user-typing', (data) => {
        if (data.chatId === chat._id) {
          setTyping(data.typing);
        }
      });

      return () => newSocket.close();
    }
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
      markMessagesAsRead();
    }
  }, [open]);

  const initChat = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/chat/get-chat`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setChat(response.data.chat);
        setMessages(response.data.chat.messages);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load chat');
    }
  };

  const markMessagesAsRead = async () => {
    if (!chat) return;
    try {
      await axios.post(
        `${backendUrl}/api/chat/mark-read`,
        { chatId: chat._id, sender: 'user' },
        { headers: { token } }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !chat) return;

    const newMessage = {
      sender: 'user',
      senderName: 'You',
      message: message.trim(),
      timestamp: new Date(),
      read: false
    };

    try {
      const response = await axios.post(
        `${backendUrl}/api/chat/send-message`,
        {
          chatId: chat._id,
          ...newMessage
        },
        { headers: { token } }
      );

      if (response.data.success) {
        socket?.emit('send-message', {
          chatId: chat._id,
          message: newMessage
        });
        setMessage('');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (socket && chat) {
      socket.emit('typing', { chatId: chat._id, typing: true });
      setTimeout(() => {
        socket.emit('typing', { chatId: chat._id, typing: false });
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = () => {
    if (!chat) return 'grey';
    switch (chat.status) {
      case 'active': return 'success';
      case 'waiting': return 'warning';
      case 'closed': return 'error';
      default: return 'grey';
    }
  };

  const getStatusText = () => {
    if (!chat) return 'Offline';
    switch (chat.status) {
      case 'active': return 'Online';
      case 'waiting': return 'Waiting...';
      case 'closed': return 'Closed';
      default: return 'Offline';
    }
  };

  if (!token) return null;

  return (
    <>
      {/* Chat Window */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'black',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'white', color: 'black' }}>
                <SupportAgent />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Support Chat
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Circle sx={{ fontSize: 8, color: getStatusColor() + '.main' }} />
                  <Typography variant="caption">
                    {getStatusText()}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: 'grey.50',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SupportAgent sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Start a conversation with our support team
                </Typography>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '75%',
                      bgcolor: msg.sender === 'user' ? 'black' : 'white',
                      color: msg.sender === 'user' ? 'white' : 'black',
                      borderRadius: 2,
                      borderBottomRightRadius: msg.sender === 'user' ? 0 : 2,
                      borderBottomLeftRadius: msg.sender === 'admin' ? 0 : 2
                    }}
                  >
                    {msg.sender === 'admin' && (
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        {msg.senderName}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {msg.message}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
            {typing && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Chip label="Support is typing..." size="small" />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={chat?.status === 'closed'}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!message.trim() || chat?.status === 'closed'}
                sx={{
                  bgcolor: 'black',
                  color: 'white',
                  '&:hover': { bgcolor: 'grey.800' },
                  '&:disabled': { bgcolor: 'grey.300' }
                }}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* Floating Button */}
      <Fab
        color="primary"
        onClick={() => setOpen(!open)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: 'black',
          '&:hover': { bgcolor: 'grey.800' },
          zIndex: 1300
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {open ? <Close /> : <Chat />}
        </Badge>
      </Fab>
    </>
  );
};

export default ChatWidget;
