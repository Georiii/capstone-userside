import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  isFromCurrentUser: boolean;
}

export default function MessageUser() {
  const router = useRouter();
  const { sellerId, sellerEmail, productName, productImage } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
  }, []);

  // Reload messages when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMessages();
    }, [])
  );

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser) {
        console.error('No current user found');
        return;
      }

      // Find the seller user by email
      const response = await fetch(`http://10.163.13.238:3000/api/auth/user/${sellerEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const sellerData = await response.json();
        const sellerUserId = sellerData.user._id;

        // Now get chat messages with the seller
        const chatResponse = await fetch(`http://10.163.13.238:3000/api/chat/${sellerUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (chatResponse.ok) {
          const data = await chatResponse.json();
          console.log('Loaded messages from API:', data.messages);

          // Transform the messages to match our Message interface
          const transformedMessages = (data.messages || []).map((msg: any) => ({
            id: msg._id,
            text: msg.text,
            senderId: msg.senderId._id || msg.senderId,
            senderName: msg.senderId.name || 'Unknown',
            senderAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            timestamp: new Date(msg.timestamp),
            isFromCurrentUser: msg.senderId._id === currentUser.id || msg.senderId === currentUser.id
          }));

          setMessages(transformedMessages);
        } else {
          console.log('No messages found, setting default message');
          // If no messages exist, create initial message
          setMessages([{
            id: '1',
            text: 'Hello',
            senderId: sellerUserId,
            senderName: sellerId as string,
            senderAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            timestamp: new Date(),
            isFromCurrentUser: false
          }]);
        }
      } else {
        console.log('Failed to find seller, setting default message');
        // Set default message if API fails
        setMessages([{
          id: '1',
          text: 'Hello',
          senderId: sellerId as string,
          senderName: sellerId as string,
          senderAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          timestamp: new Date(),
          isFromCurrentUser: false
        }]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Set default message if API fails
      setMessages([{
        id: '1',
        text: 'Hello',
        senderId: sellerId as string,
        senderName: sellerId as string,
        senderAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        timestamp: new Date(),
        isFromCurrentUser: false
      }]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    console.log('📝 Sending message:', newMessage.trim());

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      senderId: currentUser?.email || 'currentUser',
      senderName: currentUser?.name || 'You',
      senderAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      timestamp: new Date(),
      isFromCurrentUser: true
    };

    try {
      const token = await AsyncStorage.getItem('token');
      
      console.log('🔍 Looking up seller by email:', sellerEmail);
      
      // Find the seller user by email
      const userResponse = await fetch(`http://10.163.13.238:3000/api/auth/user/${sellerEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const sellerData = await userResponse.json();
        const sellerUserId = sellerData.user._id;
        
        console.log('✅ Found seller user:', sellerData.user.email);
        console.log('📤 Sending message to seller ID:', sellerUserId);
        
        // Send message to the seller
        const response = await fetch('http://10.163.13.238:3000/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiverId: sellerUserId,
            text: newMessage.trim(),
            productName: productName,
          }),
        });

        if (response.ok) {
          console.log('✅ Message sent successfully to database');
          // Add message to local state immediately for better UX
          setMessages(prev => [...prev, message]);
          setNewMessage('');
          
          // Mark messages as read
          await fetch(`http://10.163.13.238:3000/api/chat/mark-read/${sellerUserId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          // Reload messages to get the latest from database
          setTimeout(() => {
            loadMessages();
          }, 500);
        } else {
          console.error('❌ Failed to send message:', response.status);
          // Still add message locally for better UX
          setMessages(prev => [...prev, message]);
          setNewMessage('');
        }
      } else {
        console.error('❌ Failed to find seller user');
        // Add message locally if user lookup fails
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Add message locally even if API fails
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const submitReport = async () => {
    if (!selectedReportReason) {
      Alert.alert('Error', 'Please select a reason for reporting');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      // Find the seller user by email
      const userResponse = await fetch(`http://10.163.13.238:3000/api/auth/user/${sellerEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const sellerData = await userResponse.json();
        const sellerUserId = sellerData.user._id;

        const response = await fetch('http://10.163.13.238:3000/api/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            reportedUserId: sellerUserId,
            reason: selectedReportReason,
          }),
        });

        if (response.ok) {
          Alert.alert('Success', 'Report submitted successfully');
          setShowReportModal(false);
          setSelectedReportReason('');
        } else {
          Alert.alert('Error', 'Failed to submit report');
        }
      } else {
        Alert.alert('Error', 'Failed to find user to report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  const reportReasons = [
    'Seller scammed me by requesting payment outside the app and never shipped the item.',
    'Seller falsely claimed the item was authentic when it wasn\'t.',
    'Seller made inappropriate/unprofessional comments during the transaction.',
    'Seller used misleading pricing to bait users.',
    'Seller is using pressure tactics to rush payment outside safe channels.'
  ];

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isFromCurrentUser ? styles.sentMessage : styles.receivedMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isFromCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft
      ]}>
        <Text style={[
          styles.messageText,
          item.isFromCurrentUser ? styles.sentText : styles.receivedText
        ]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {item.isFromCurrentUser && (
            <Ionicons 
              name="checkmark-done" 
              size={12} 
              color="#4CAF50" 
              style={styles.messageStatus}
            />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.headerAvatar}
          />
          <Text style={styles.headerName}>{sellerId}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowReportModal(true)}>
            <Ionicons name="warning" size={24} color="#E74C3C" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 10 }}>
            <Ionicons name="trash" size={24} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productCard}>
        <Image source={{ uri: productImage as string }} style={styles.productImage} />
        <Text style={styles.productName}>{productName}</Text>
      </View>

      {/* Chat Messages */}
      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map((message) => renderMessage({ item: message }))}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Write a message"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="paper-plane" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>Report user</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {reportReasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reportOption}
                onPress={() => setSelectedReportReason(reason)}
              >
                <View style={[
                  styles.checkbox,
                  selectedReportReason === reason && styles.checkboxSelected
                ]}>
                  {selectedReportReason === reason && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <Text style={styles.reportReason}>{reason}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.submitButton} onPress={submitReport}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF5F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  headerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: 'bold',
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatContent: {
    paddingVertical: 20,
  },
  messageContainer: {
    marginVertical: 5,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  messageBubbleLeft: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  messageBubbleRight: {
    backgroundColor: '#FF6B9D',
  },
  messageText: {
    fontSize: 16,
  },
  sentText: {
    color: 'white',
  },
  receivedText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginRight: 5,
  },
  messageStatus: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#FF6B9D',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  reportContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 10,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FFA500',
    borderColor: '#FFA500',
  },
  reportReason: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 