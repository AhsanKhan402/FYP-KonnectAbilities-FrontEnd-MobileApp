import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useStateValue } from "../context/GlobalContextProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomModal from "../components/CustomModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";
import Icon from "react-native-vector-icons/Ionicons";

const Profile = ({ navigation }) => {
  const [{}, dispatch] = useStateValue();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [likes, setLikes] = useState({});
  const [selectedPostId, setSelectedPostId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const userString = await AsyncStorage.getItem("@user");
          const user = JSON.parse(userString);

          if (user) {
            setUserInfo(user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchData();
      return () => {};
    }, [])
  );

  const userApiDetail = useQuery({
    queryKey: ["user", userInfo?._id],
    queryFn: async () => {
      try {
        const response = await apiRequest(urlType.BACKEND, {
          method: "get",
          url: `user?userId=${userInfo?._id}`,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching user detail:", error);
        throw error;
      }
    },
    enabled: !!userInfo?._id, // Ensure query runs only when userInfo._id is defined
  });

  const postData = useQuery({
    queryKey: ["loginUserPosts", userInfo?._id],
    queryFn: async () => {
      try {
        const response = await apiRequest(urlType.BACKEND, {
          method: "get",
          url: `posts/by-userId?userId=${userInfo?._id}`,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
    },
    enabled: !!userInfo?._id,
  });

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem("@auth_token");
    await AsyncStorage.removeItem("@user");
    dispatch({
      type: "SET_LOGIN",
      isLogin: false,
    });
    setLogoutModalVisible(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (userInfo?._id) {
        userApiDetail.refetch();
        postData.refetch();
      }
    }, [userInfo?._id])
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout}>
            <MaterialIcon name="logout" size={28} color="indianred" />
          </TouchableOpacity>
        </View>
        <View style={styles.aboveHeader}>
          <Image
            source={{ uri: userApiDetail?.data?.profileImage || "" }}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>
                {userApiDetail?.data?.username || "Username"}
              </Text>
              {userApiDetail?.data?.isVerified === "verified" ? (
                <MaterialIcon name="verified" size={20} color="#1DA1F2" />
              ) : null}
            </View>
            <Text style={styles.bio}>{userApiDetail?.data?.bio || ""}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statCount}>
                  {postData?.data?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statCount}>
                  {postData?.data?.[0]?.userInfo?.followStatus?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statCount}>{2}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() =>
              navigation.navigate("EditProfile", { userInfo: userInfo })
            }
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          {userApiDetail?.data?.isVerified === "not verified" ? (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => navigation.navigate("Verification")}
            >
              <Text style={styles.verifyButtonText}>Verify Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.verifyButton, { backgroundColor: "#cccc" }]}
              disabled={true}
            >
              <Text style={[styles.verifyButtonText, { color: "#101010" }]}>
                {userApiDetail?.data?.isVerified}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            width: "100%",
            height: 2,
            backgroundColor: "#d1d1d1",
            marginVertical: 20,
          }}
        ></View>
        {postData.isFetching ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>
        ) : postData?.data?.length > 0 ? (
          <FlatList
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            data={postData?.data || []}
            refreshControl={
              <RefreshControl
                refreshing={postData.isFetching}
                onRefresh={() => postData.refetch()}
              />
            }
            renderItem={({ item, index }) => (
              <View style={styles.postContainer} key={index}>
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
                    // onPress={() => handleLikePress(item?._id)}
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
                    // onPress={() => handleSharePress(item?._id)}
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
                      {/* <TextInput
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
                      </TouchableOpacity> */}
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
          <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
            No posts
          </Text>
        )}
      </SafeAreaView>
      <CustomModal
        visible={isLogoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onAction={confirmLogout}
        action="Sign out"
        message="Are you sure you want to sign out?"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  aboveHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#d1d1d1",
  },
  userInfo: {
    marginLeft: 20,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginRight: 5,
  },
  bio: {
    marginTop: 5,
    color: "#666",
    width: "80%",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  stat: {
    marginRight: 20,
    alignItems: "center",
  },
  statCount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#666",
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  editProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007bff",
    borderRadius: 25,
  },
  editProfileButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  verifyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 25,
  },
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  postContainer: {
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    borderRadius: 12,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#d1d1d1",
  },
  postHeaderTextContainer: {
    flex: 1,
  },
  postUsername: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  postDescription: {
    fontSize: 14,
    color: "#000",
    textAlign: "justify",
    marginBottom: 5,
  },
  postTimestamp: {
    color: "#888",
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
});

export default Profile;
