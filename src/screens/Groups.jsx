import React, { useState } from "react";
import {
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Groups = ({ navigation }) => {
  const [loginUser, setLoginUser] = useState(null);

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
      refetch()

      return () => {};
    }, [])
  );

  const {
    data: groupsData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "get",
        url: "group/chatrooms", // Adjust this URL based on your API endpoint
      });
      return response;
    },
  });

  // Handle loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error loading groups.</Text>
      </SafeAreaView>
    );
  }

  const navigateToChat = (item) => {
    // Find the participants excluding the logged-in user
    const chatParticipants = item?.participants?.filter(
      (participant) => participant?._id !== loginUser?._id
    );
  
    // Navigate to the GroupDetails screen with the filtered participants
    navigation.navigate("GroupDetails", {
      chatUser: chatParticipants, 
      chatId: item?._id,
      groupDetails: item,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {(!groupsData?.data || groupsData?.data?.length === 0) ? (
        <View style={styles.noGroupsContainer}>
          <Text style={styles.noGroupsText}>No groups available.</Text>
        </View>
      ) : (
        <FlatList
          data={groupsData.data}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.groupContainer}
              onPress={() => navigateToChat(item)}
            >
              <View style={styles.groupContent}>
                <Text style={styles.groupName}>{item.groupName}</Text>
                <Text style={styles.groupDescription}>
                  {item.groupDescription}
                </Text>
                <View style={styles.participantContainer}>
                  {item.participants.map((participant) => (
                    <Text key={participant._id} style={styles.participantName}>
                      {participant.username}
                    </Text>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListHeaderComponent={() => (
            <Text style={styles.headerText}>Join a Community</Text>
          )}
        />
      )}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateGroup")}
      >
        <Text style={styles.createButtonText}>Create New Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  noGroupsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noGroupsText: {
    fontSize: 18,
    color: "#888",
  },
  groupContainer: {
    marginBottom: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  groupContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  groupDescription: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  participantContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  participantName: {
    fontSize: 14,
    color: "#007bff",
    marginRight: 10,
    textTransform: 'capitalize'
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    alignSelf: "center",
    width: "80%",
    elevation: 3,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Groups;