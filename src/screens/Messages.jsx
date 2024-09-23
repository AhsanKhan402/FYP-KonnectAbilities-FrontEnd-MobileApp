import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // Import Icon
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Messages = () => {
  const [loginUser, setLoginUser] = useState(null);
  const navigation = useNavigation(); // Initialize navigation

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const userString = await AsyncStorage.getItem("@user");
          const user = await JSON.parse(userString);

          if (user) {
            setLoginUser(user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchData();

      return () => {};
    }, [])
  );

  const chatroomData = useQuery({
    queryKey: ["chatroom"],
    queryFn: async () => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "get",
        url: `chatrooms`,
      });
      return response.data;
    },
  });
  // console.log("Data", chatroomData.data[0]?.messages);

  const navigateToChat = (item) => {
    const chatUser =
      item?.participants?.[0]?._id === loginUser?._id
        ? item?.participants[1]
        : item?.participants[0];

    navigation.navigate("Chat", { chatUser: chatUser, chatId: item?._id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Messages</Text>

        {/* Search Icon */}
        <TouchableOpacity
          onPress={() => {
            /* Handle search action here */
          }}
        >
          <Icon name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {!chatroomData?.data || chatroomData?.data.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "grey" }}>No Chat</Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={chatroomData?.data}
          refreshControl={
            <RefreshControl
              refreshing={chatroomData.isFetching}
              onRefresh={() => chatroomData.refetch()}
            />
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.messageContainer}
              key={index}
              onPress={() => navigateToChat(item)} // Handle navigation on click
            >
              {item.participants[0]._id === loginUser?._id ? (
                <>
                  <Image
                    source={{ uri: item?.participants?.[1]?.profileImage }}
                    style={styles.avatar}
                  />
                  <View style={styles.messageContent}>
                    <Text style={styles.username}>
                      {item?.participants[1].username}
                    </Text>
                    <Text style={styles.lastMessage}>{item?.messages?.[1]?.content}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Image
                    source={{ uri: item?.participants?.[0]?.profileImage }}
                    style={styles.avatar}
                  />
                  <View style={styles.messageContent}>
                    <Text style={styles.username}>
                      {item.participants[0].username}
                    </Text>
                    <Text style={styles.lastMessage}>{item?.messages?.[0]?.content}</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  messageContainer: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#d1d1d1",
  },
  messageContent: {
    marginLeft: 15,
    justifyContent: "center",
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    textTransform: "capitalize",
  },
  lastMessage: {
    color: "#777",
    marginTop: 5,
    fontSize: 14,
  },
});

export default Messages;
