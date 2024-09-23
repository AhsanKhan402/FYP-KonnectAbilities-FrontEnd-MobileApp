import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";

const ChatScreen = ({ navigation, route }) => {
  const [message, setMessage] = useState("");
  const { chatUser, chatId } = route.params;

  // Fetch messages by chatroom ID
  const chatData = useQuery({
    queryKey: ["chatroomMessages", chatId],
    queryFn: async () => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "get",
        url: `chatroom-messages?chatroomId=${chatId}`,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Chat Data:", data);
    },
  });

  // Mutation for sending a message
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: `send-message`,
        data: newMessage,
      });
      return response.data;
    },
    onSuccess: () => {
      chatData.refetch();
      setMessage("");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        chatRoomId: chatId,
        sender: chatUser._id,
        content: message,
      };
      sendMessageMutation.mutate(newMessage);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#007bff" />
        </TouchableOpacity>
        <Image
          source={{ uri: chatUser?.profileImage }}
          style={styles.profilePic}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.username}>{chatUser?.username}</Text>
          <Text style={styles.status}>Active 27 minutes ago</Text>
        </View>
        <TouchableOpacity style={styles.callButton}>
          <Icon name="phone" size={20} color="#007bff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chatData?.data?.messages || []}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.sender._id === chatUser._id
                ? styles.userMessage
                : styles.otherMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender._id === chatUser._id ? null: { color: "#000" },
              ]}
            >
              {item.content}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item._id.toString()}
        style={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Aa"
          value={message}
          onChangeText={(text) => setMessage(text)}
          placeholderTextColor="#7a7a7a"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={20} color="#007bff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#d1d1d1",
  },
  headerTextContainer: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  status: {
    fontSize: 14,
    color: "#6c757d",
  },
  callButton: {
    padding: 5,
    marginLeft: 10,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 20,
    maxWidth: "75%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f3f5",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderColor: "#ced4da",
    borderWidth: 1,
    backgroundColor: "#f8f9fa",
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
});

export default ChatScreen;
