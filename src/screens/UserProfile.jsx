import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Animated,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";

const UserProfile = ({ navigation, route }) => {
  const { userData } = route.params;
  const [loginUser, setLoginUser] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likes, setLikes] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const userString = await AsyncStorage.getItem("@user");
          const user = await JSON.parse(userString);

          if (user) {
            setLoginUser(user);
            const userIdToCheck = user?._id;
            const followStatus = userData?.followStatus?.find(
              (status) => status.userId === userIdToCheck
            );
            if (followStatus) {
              setIsFollowing(followStatus?.followed);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchData();
    }, [userData])
  );

  const postData = useQuery({
    queryKey: ["userPosts", userData?._id],
    queryFn: async () => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "get",
        url: `posts/by-userId?userId=${userData?._id}`,
      });
      return response;
    },
    enabled: !!userData?._id,
  });
  console.log("dasda", postData?.data?.data?.[0]?.comments);

  const followUnfollowMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: "user/followUnfollow",
        data: { userId: userData._id },
      });
      return response.data;
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
    },
    onError: (error) => {
      showMessage({
        message: error.message || "An error occurred",
        type: "danger",
        color: "#fff",
        backgroundColor: "red",
        floating: true,
      });
    },
  });

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

  const chatroomMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: `/create-chatroom`,
        data,
      });
      return response;
    },
    onSuccess: (e) => {
      if (e.status === 200) {
        navigation.navigate("Messages");
      } else {
        showMessage({
          message: e.message || "An error occurred",
          type: "danger",
          color: "#fff",
          backgroundColor: "red",
          floating: true,
        });
      }
    },
  });

  const handleMessage = async () => {
    const data = {
      participants: [userData?._id, loginUser?._id],
    };
    await chatroomMutation.mutate(data);
  };

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

  const toggleFollow = () => {
    followUnfollowMutation.mutate();
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>User Profile</Text>
      </View>
      <SafeAreaView style={styles.container}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: userData?.profileImage || "" }}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>
              {userData?.username || "Unknown User"}
            </Text>
            <Text style={styles.bio}>{userData?.bio || ""}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statCount}>
                  {postData?.data?.data?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statCount}>
                  {userData?.followStatus?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statCount}>0</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          {loginUser?._id !== userData?._id && (
            <>
              <TouchableOpacity
                style={styles.followButton}
                onPress={toggleFollow}
              >
                <Text style={styles.buttonText}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
              >
                {chatroomMutation.isLoading ? (
                  <ActivityIndicator size={24} color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Message</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
        {postData?.isLoading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : postData?.isError || !postData?.data?.data?.length ? (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>Post not found</Text>
          </View>
        ) : postData?.data?.data?.length ? (
          <FlatList
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            data={postData?.data?.data || []}
            refreshControl={
              <RefreshControl
                refreshing={postData?.isFetching}
                onRefresh={() => postData?.refetch()}
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
                      {item?.likesCount}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.engagementButton}
                    onPress={() =>
                      setSelectedPostId(
                        selectedPostId === item?._id ? null : item?._id
                      )
                    }
                  >
                    <Icon name="chatbubble-outline" size={22} color="#6d6d6d" />
                    <Text style={styles.engagementText}>
                      {item?.commentsCount}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.engagementButton}
                    onPress={() => handleSharePress(item?._id)}
                  >
                    <Icon name="share-outline" size={22} color="#6d6d6d" />
                    <Text style={styles.engagementText}>
                      {item?.sharesCount}
                    </Text>
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
                        onPress={() => handleCommentSubmit(item?._id)}
                      >
                        <Icon name="send" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    {(item?.comments || []).map((comment, index) => (
                      <View style={styles.commentContainer} key={index}>
                        {comment?.userInfo?.profileImage && (
                          <Image
                            source={{ uri: comment?.userInfo?.profileImage }}
                            style={styles.commentProfileImage}
                          />
                        )}
                        <View style={styles.commentContent}>
                          <Text style={styles.commentUsername}>
                            {comment?.userInfo?.username || "Anonymous"}
                          </Text>
                          <Text style={styles.commentText}>
                            {comment?.text || ""}
                          </Text>
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
            <Text style={styles.notFoundText}>Post not found</Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  profileContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: "#d1d1d1",
  },
  userInfo: {
    justifyContent: "center",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  bio: {
    fontSize: 14,
    color: "#6d6d6d",
    width: "80%",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  stat: {
    alignItems: "center",
    marginRight: 16,
  },
  statCount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#6d6d6d",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  followButton: {
    flex: 1,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  messageButton: {
    flex: 1,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
  },
  postContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  postProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#d1d1d1",
  },
  postHeaderTextContainer: {
    flex: 1,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: "bold",
  },
  postTimestamp: {
    fontSize: 12,
    color: "#6d6d6d",
  },
  postDescription: {
    marginVertical: 8,
    fontSize: 14,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#d1d1d1",
  },
  engagementContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  engagementButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  engagementText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6d6d6d",
  },
  commentContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 10,
    borderColor: "#e6e6e6",
  },
  commentProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: "#d1d1d1",
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "bold",
  },
  commentText: {
    fontSize: 14,
    color: "#6d6d6d",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
    paddingTop: 8,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderColor: "#e6e6e6",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  commentSubmitButton: {
    marginLeft: 8,
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 16,
    alignItems: "center",
  },
  notificationContainer: {
    position: "absolute",
    bottom: 16,
    left: "10%",
    right: "10%",
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  notificationText: {
    color: "#fff",
    fontSize: 16,
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

export default UserProfile;
