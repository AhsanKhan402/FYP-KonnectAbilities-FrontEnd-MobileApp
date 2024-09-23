import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";

const CreateGroup = ({ navigation }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch search results based on searchTerm
  const fetchSearchResults = async () => {
    const response = await apiRequest(urlType.BACKEND, {
      method: "get",
      url: `user/searchByUsername?username=${searchTerm}`,
    });
    return response.data;
  };

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["searchResults", searchTerm],
    queryFn: fetchSearchResults,
    enabled: !!searchTerm, // Only run the query if there's a search term
  });

  // Toggle user selection
  const toggleUserSelection = (user) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.some((selectedUser) => selectedUser._id === user._id)
        ? prevSelectedUsers.filter((selectedUser) => selectedUser._id !== user._id)
        : [...prevSelectedUsers, user]
    );
  };

  const createGroupMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: `/group/chatroom-create`,
        data,
      });
      return response;
    },
    onSuccess: (response) => {
      if (response.status === 200) {
        Alert.alert("Success", "Group created successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", response.message || "Failed to create group.");
      }
    },
    onError: (error) => {
      console.error("Error creating group:", error);
      Alert.alert("Error", "An error occurred while creating the group.");
    },
  });

  const handleCreateGroup = () => {
    if (!groupName.trim() || !description.trim()) {
      Alert.alert("Error", "Please provide both a group name and description.");
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert("Error", "Please select at least one user to add to the group.");
      return;
    }

    const userIds = selectedUsers.map((user) => user._id);
    const data = {
      groupName,
      groupDescription: description,
      participants: userIds,
    };

    createGroupMutation.mutate(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Group Name</Text>
        <TextInput
          style={styles.input}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Enter group name"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter group description"
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Add Users</Text>
        <TextInput
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by username"
        />
        {isLoading ? (
          <Text>Loading...</Text>
        ) : isError ? (
          <Text>Error loading search results</Text>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  selectedUsers.some((user) => user._id === item._id) &&
                    styles.selectedUser,
                ]}
                onPress={() => toggleUserSelection(item)}
              >
                <Text style={styles.username}>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  createButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    elevation: 2,
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  userItem: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedUser: {
    backgroundColor: "#cce5ff",
  },
  username: {
    textTransform: 'capitalize',
    fontSize: 16,
  },
});

export default CreateGroup;
