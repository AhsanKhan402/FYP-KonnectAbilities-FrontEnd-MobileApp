import React, { useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";
import { useMutation, useQuery } from "@tanstack/react-query";

const Home = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likes, setLikes] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const userString = await AsyncStorage.getItem("@user");
          const token = await AsyncStorage.getItem("@auth_token");
          const user = await JSON.parse(userString);

          if (user) {
            setUserInfo(user);
            console.log("user", user);
            console.log("token", token);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchData();

      postData.refetch()

      return () => {};
    }, [])
  );

 const postData = useQuery({
  queryKey: ["posts"],
  queryFn: async () => {
    try {
      const response = await apiRequest(urlType.BACKEND, {
        method: "get",
        url: "posts/followed-user-posts",
      });
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },
  onError: (error) => {
    console.error("Error in fetching posts:", error);
  },
});
console.group("Posts", postData?.data)

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: "post/like",
        data: { postId },
      });
      console.log("POSTID:", postId);
      return response.data;
    },
    onSuccess: (data, variables) => {
      setLikes((prevLikes) => ({
        ...prevLikes,
        [variables]: !prevLikes[variables],
      }));
      postData.refetch();
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (postId) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: "post/comment",
        data: { postId, text: commentText },
      });
      return response.data;
    },
    onSuccess: () => {
      setCommentText("");
      setSelectedPostId(null);
      postData.refetch();
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (postId) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: "post/share",
        data: { postId },
      });
      return response.data;
    },
    onSuccess: () => {
      postData.refetch();
    },
  });

  const handleLikePress = (postId) => {
    likeMutation.mutate(postId);
  };

  const handleCommentSubmit = (postId) => {
    if (commentText.trim()) {
      commentMutation.mutate(postId);
    }
  };

  const handleSharePress = (postId) => {
    shareMutation.mutate(postId);
  };
  // const handleCommentSubmit = (postId) => {
  //   if (commentText.trim()) {
  //     const updatedPosts = postData.data.map((post) => {
  //       if (post.id === postId) {
  //         return {
  //           ...post,
  //           comments: [
  //             ...post.comments,
  //             {
  //               username: userInfo.username,
  //               text: commentText,
  //               userProfileImage: userInfo.profileImage,
  //             },
  //           ],
  //         };
  //       }
  //       return post;
  //     });

  //     postData.refetch();

  //     setCommentText("");
  //     setSelectedPostId(null);
  //   }
  // };

  // const handleLikePress = (postId) => {
  //   setLikes((prevLikes) => {
  //     const isLiked = prevLikes[postId] || false;
  //     const newLikes = { ...prevLikes, [postId]: !isLiked };
  //     return newLikes;
  //   });
  // };

  // const handleSharePress = () => {
  //   setNotificationVisible(true);
  //   Animated.timing(notificationAnimation, {
  //     toValue: 1,
  //     duration: 300,
  //     useNativeDriver: true,
  //   }).start();

  //   setTimeout(() => {
  //     Animated.timing(notificationAnimation, {
  //       toValue: 0,
  //       duration: 300,
  //       useNativeDriver: true,
  //     }).start(() => setNotificationVisible(false));
  //   }, 3000);
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Konnect</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
          <Icon
            name="notifications-outline"
            size={30}
            color="#333"
            style={styles.notificationsIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <Text style={[styles.tabText, styles.activeTab]}>Shared</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Service")}>
          <Text style={styles.tabText}>Supportive</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => navigation.navigate("Groups")}
      >
        <Text style={styles.joinButtonText}>Join the conversation</Text>
      </TouchableOpacity>

      {postData.isFetching ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>
      ) : postData?.data?.length > 0 ? (
        <FlatList
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          data={postData?.data}
          refreshControl={
            <RefreshControl
              refreshing={postData.isFetching}
              onRefresh={() => postData.refetch()}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <TouchableOpacity style={styles.postHeader}>
                <Image
                  source={{ uri: item?.userInfo?.profileImage }}
                  style={styles.postProfileImage}
                />
                <View style={styles.postHeaderTextContainer}>
                  <Text style={styles.postUsername}>
                    {item?.userInfo?.username}
                  </Text>
                  <Text style={styles.postTimestamp}>
                    {item?.userInfo?.city},{" "}
                    {new Date(item?.createdAt).toDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.postDescription}>{item?.description}</Text>
              <Image source={{ uri: item?.image }} style={styles.postImage} />
              <View style={styles.engagementContainer}>
                <TouchableOpacity
                  style={styles.engagementButton}
                  onPress={() => handleLikePress(item?._id)}
                >
                  <Icon
                    name={likes[item._id] ? "heart" : "heart-outline"}
                    size={22}
                    color={likes[item._id] ? "#e63946" : "#6d6d6d"}
                  />
                  <Text style={styles.engagementText}>
                    {item.likes.length || 0}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.engagementButton}
                  onPress={() =>
                    setSelectedPostId(
                      selectedPostId === item._id ? null : item._id
                    )
                  }
                >
                  <Icon name="chatbubble-outline" size={22} color="#6d6d6d" />
                  <Text style={styles.engagementText}>
                    {item.comments.length || 0}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.engagementButton}
                  onPress={() => handleSharePress(item._id)}
                >
                  <Icon name="share-outline" size={22} color="#6d6d6d" />
                  <Text style={styles.engagementText}>{item?.shares?.length || 0}</Text>
                </TouchableOpacity>
              </View>
              {selectedPostId === item._id && (
                <>
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Write a comment..."
                      value={commentText}
                      onChangeText={setCommentText}
                    />
                    <TouchableOpacity
                      style={styles.commentSubmitButton}
                      onPress={() => handleCommentSubmit(item._id)}
                    >
                      <Icon name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {item?.comments?.map((comment, index) => (
                    <View style={styles.commentContainer} key={index}>
                      {comment?.userInfo?.profileImage && (
                        <Image
                          source={{ uri: comment?.userInfo?.profileImage }}
                          style={styles.commentProfileImage}
                        />
                      )}
                      <View style={styles.commentContent}>
                        <Text style={styles.commentUsername}>
                          {comment?.userInfo?.username}
                        </Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        />
      ) : (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>No posts</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  notificationsIcon: {},
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabText: {
    marginHorizontal: 25,
    fontSize: 16,
    color: "#6d6d6d",
    paddingVertical: 10,
  },
  activeTab: {
    fontWeight: "bold",
    color: "#333",
    borderBottomWidth: 2,
    borderBottomColor: "#007bff",
  },
  joinButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 15,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  postContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 20, // Ensures space between posts
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postProfileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
    backgroundColor: "#d1d1d1",
  },
  postHeaderTextContainer: {
    flex: 1,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  postTimestamp: {
    fontSize: 14,
    color: "#999",
  },
  postDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#d1d1d1",
  },
  engagementContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  engagementButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  engagementText: {
    fontSize: 14,
    color: "#6d6d6d",
    marginLeft: 5,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentProfileImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  commentText: {
    fontSize: 14,
    color: "#666",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
  },
  commentSubmitButton: {
    marginLeft: 10,
    backgroundColor: "#007bff",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  notificationText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
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

export default Home;
