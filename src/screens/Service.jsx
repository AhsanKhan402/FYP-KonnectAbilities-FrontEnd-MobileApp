import React, { useState } from "react";
import {
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Service = ({ navigation }) => {
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
      refetch();
      return () => {};
    }, [])
  );

  const fetchServices = async () => {
    const response = await apiRequest(urlType.BACKEND, {
      method: "get",
      url: `/services/user`,
    });
    return response.data;
  };

  const {
    data: services,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });


  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "accepted":
        return styles.statusAccepted;
      case "canceled":
        return styles.statusCanceled;
      case "completed":
        return styles.statusCompleted;
      default:
        return styles.statusDefault;
    }
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupContainer}
    >
      <View style={styles.groupContent}>
        <Text style={styles.groupName}>{item.title}</Text>
        <Text style={styles.groupDescription}>{item.description}</Text>
        <View style={styles.participantContainer}>
          <Text style={styles.participantName}>
            {item.pickLocation} to {item.dropLocation}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {item.date} at {item.time}
        </Text>
        <Text style={[styles.statusText, getStatusStyle(item.status)]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Failed to load services.</Text>
        {/* Optionally, you can keep the 'Book New Service' button here */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("CreateService")}
        >
          <Text style={styles.createButtonText}>Book New Service</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {services?.length === 0 ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>No services found.</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          renderItem={renderServiceItem}
        />
      )}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateService")}
      >
        <Text style={styles.createButtonText}>Book New Service</Text>
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginBottom: 10,
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
    textTransform: "capitalize",
  },
  dateText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  statusPending: {
    color: "#ffc107",
  },
  statusAccepted: {
    color: "#28a745",
  },
  statusCanceled: {
    color: "#dc3545",
  },
  statusCompleted: {
    color: "#17a2b8",
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

export default Service;
