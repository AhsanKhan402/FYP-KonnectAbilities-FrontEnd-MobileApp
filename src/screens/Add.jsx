import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { showMessage } from "react-native-flash-message";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";
import { useMutation } from "@tanstack/react-query";

const Add = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true, // Include this to get the Base64 string
    });
    if (!result.cancelled) {
      const base64Image = `data:${result.assets[0]?.mimeType};base64,${result?.assets[0]?.base64}`;
      setSelectedImage(base64Image);
    }
  };

  const addPostMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: `post`,
        data,
      });
      console.log("Response from API:", response);
      return response;
    },
  
    onSuccess: async (e) => {
      console.log("Success callback:", e);
      if (e && e.status === 200) {  // Ensure `e` is not undefined or null
        showMessage({
          message: e.message,
          type: "success",
          color: "#fff",
          backgroundColor: "green",
          floating: true,
        });
        setCaption("");
        setSelectedImage(null);
      } else {
        console.log("Error in response:", e);
        showMessage({
          message: e.message || "An Error occurred",
          type: "danger",
          color: "#fff",
          backgroundColor: "red",
          floating: true,
        });
      }
    },
  
    onError: (error) => {
      console.error("Mutation Error:", error);
      showMessage({
        message: error.message || "An unexpected error occurred",
        type: "danger",
        color: "#fff",
        backgroundColor: "red",
        floating: true,
      });
    },
  });

  const handleUpload = async () => {
    if (caption.length > 0 && selectedImage.length > 0) {
      const data = {
        description: caption,
        image: selectedImage,
      };
      await addPostMutation.mutate(data);
    } else {
      showMessage({
        message: "Please fill all the fields",
        type: "danger",
        color: "#fff",
        backgroundColor: "red",
        floating: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>New Post</Text>
        <TouchableOpacity onPress={handleUpload}>
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.preview} />
        ) : (
          <Text style={styles.imagePickerText}>Pick an image</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.captionInput}
        placeholder="Write a caption..."
        multiline
        value={caption}
        onChangeText={setCaption}
      />
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  cancelText: {
    color: "#007aff",
    fontSize: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  uploadText: {
    color: "#007aff",
    fontSize: 16,
  },
  imagePicker: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginTop: 20,
  },
  imagePickerText: {
    fontSize: 16,
    color: "#888",
  },
  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  captionInput: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 20,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
  },
});

export default Add;
