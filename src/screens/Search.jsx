import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";

const Search = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Search</Text>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        placeholderTextColor="#888"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : isError || (searchResults && searchResults.length === 0) ? (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>User not found</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item._id}
              style={styles.subContainer}
              onPress={() => {
                navigation.navigate("UserProfile", { userData: item });
                setSearchTerm("");
              }}
            >
              <Image source={{ uri: item.profileImage }} style={styles.image} />
              <View style={styles.nameContainer}>
                <Text>{item?.username}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          numColumns={3}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  searchBar: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    margin: 10,
    backgroundColor: "#f0f0f0",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  grid: {
    paddingHorizontal: 5,
  },
  image: {
    position: "absolute",
    width: "95%",
    aspectRatio: 1,
    borderRadius: 5,
    backgroundColor: "#eee",
  },
  subContainer: {
    width: "32%",
    margin: "1%",
    aspectRatio: 1,
    alignItems: "center",
  },
  nameContainer: {
    top: 88,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 6,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 18,
    color: "#888",
  },
});

export default Search;
