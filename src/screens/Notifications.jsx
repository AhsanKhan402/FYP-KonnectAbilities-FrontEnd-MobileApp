import React from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";

const notifications = [
  {
    id: "1",
    userName: "Apex Sports",
    userImage: "https://via.placeholder.com/50",
    message: 'added a new video: "Naseem Shah crying after loss against..."',
    timestamp: "Yesterday at 7:32 am",
  },
  {
    id: "2",
    userName: "Apex Sports",
    userImage: "https://via.placeholder.com/50",
    message: 'added a new video: "Ahmed shehzad got emotional and start..."',
    timestamp: "Sun at 12:56 pm",
  },
  {
    id: "3",
    userName: "Apex Sports",
    userImage: "https://via.placeholder.com/50",
    message: 'added a new video: "Victim of system - Ahmed Shahzad. kesa..."',
    timestamp: "Sun at 8:01 am",
  },
  {
    id: "4",
    userName: "Apex Sports",
    userImage: "https://via.placeholder.com/50",
    message: 'added a new video: "No practice session for Pakistan today..."',
    timestamp: "Sat at 11:59 pm",
  },
  {
    id: "5",
    userName: "Apex Sports",
    userImage: "https://via.placeholder.com/50",
    message: 'added a new video: "Breaking News! Imad Wasim is set to be..."',
    timestamp: "Sat at 11:12 pm",
  },
  {
    id: "6",
    userName: "Apex Sports",
    userImage: "https://via.placeholder.com/50",
    message: 'added a new video: "Rohit Sharma is World Class player. Its..."',
    timestamp: "Sat at 7:45 pm",
  },
  {
    id: "7",
    userName: "Apex Sports",
    userImage: "https://via.placeholder.com/50",
    message: 'added a new video: "Fazal e haq Farooqi - The super star..."',
    timestamp: "Sat at 6:07 pm",
  },
];

const NotificationItem = ({ item }) => (
  <View style={styles.notificationContainer}>
    <Image source={{ uri: item.userImage }} style={styles.userImage} />
    <View style={styles.textContainer}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
    <Icon name="dots-three-vertical" type="entypo" size={20} color="#000" />
  </View>
);

const Notifications = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Icon name="search" size={24} color="#000" />
      </View>
      <Text style={styles.earlierText}>Earlier</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  earlierText: {
    fontSize: 18,
    color: "#666",
    marginVertical: 10,
    marginLeft: 20,
  },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  message: {
    color: "#555",
    marginTop: 2,
    fontSize: 14,
  },
  timestamp: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
});

export default Notifications;
