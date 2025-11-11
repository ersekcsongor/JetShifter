import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
  StatusBar
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import ENV from '~/utils/constants';
import styles from "~/styles/AboutScreen.styles";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AboutScreen = ({ navigation }: { navigation: any }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! 👋 I'm your jet lag assistant. Ask me anything about jet lag, travel tips, or time zone adjustments!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    const messageToSend = inputText.trim();
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);
    Keyboard.dismiss();

    try {
      // Prepare history with ALL required fields including id
      const historyToSend = messages
        .filter(msg => msg.id !== '1') // Exclude welcome message
        .slice(-10) // Last 10 messages
        .map(msg => ({
          id: msg.id,
          text: msg.text,
          isUser: msg.isUser,
          timestamp: msg.timestamp.toISOString()
        }));

      const response = await axios.post(
        `${ENV.API_BASE_URL}/chat/jetlag`, 
        {
          message: messageToSend,
          conversationHistory: historyToSend
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const replyText = response.data.reply || 
                        response.data.response || 
                        response.data.message ||
                        'No response received';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('❌ Full error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorText = "Sorry, I'm having trouble responding right now.";
      
      if (error.response?.status === 400) {
        errorText = "I couldn't process that. Please try asking about jet lag, travel tips, or sleep schedules!";
      } else if (error.response?.status === 500) {
        errorText = "The server encountered an error. Please try again.";
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Jet Lag Assistant</Text>
          <Text style={styles.headerSubtitle}>Always here to help ✈️</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.statusDot} />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
              ]}
            >
              {!message.isUser && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>🤖</Text>
                </View>
              )}
              
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.aiMessage
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.isUser ? styles.userMessageTime : styles.aiMessageTime
                ]}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>

              {message.isUser && (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>👤</Text>
                </View>
              )}
            </View>
          ))}
          
          {isSending && (
            <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.aiMessage, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Box */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask about jet lag..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isSending) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AboutScreen;