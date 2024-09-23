import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";
import { useStateValue } from "../context/GlobalContextProvider";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";

const CompleteSignup = ({ navigation }) => {
  const [{}, dispatch] = useStateValue();
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [city, setCity] = useState("");
  const [disability, setDisability] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
      base64: true,
    });
    if (!result.cancelled) {
      const base64Image = `data:${result.assets[0]?.mimeType};base64,${result?.assets[0]?.base64}`;
      setProfileImage(base64Image);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      console.log(data,"dadad")
      const response = await apiRequest(urlType.BACKEND, {
        method: "put",
        url: `user`,
        data,
      });
      console.log("resd", response);
      return response;
    },
    onSuccess: async (e) => {
      console.log("Response from server:", e); // Log the server response
      if (e && e.status === 200) {
        await dispatch({
          type: "SET_LOGIN",
          isLogin: true,
        });
        navigation.navigate("BottomNavigation");
      } else {
        showMessage({
          message: e.message || "An Error occurred",
          type: "danger",
          color: "#fff",
          backgroundColor: "red",
          floating: true,
        });
      }
    },
  });

  const handleSave = async () => {
    if (
      bio.length > 0 &&
      phoneNumber.length > 0 &&
      city.length > 0 &&
      disability.length > 0
    ) {
      const data = {
        profileImage: profileImage,
        bio: bio,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth.toISOString(), // Save only date part
        city: city,
        disability: disability,
      };
      console.log("Data to be sent:", data); // Log the data
      try {
        await updateMutation.mutate(data);
      } catch (error) {
        console.log("Error during mutation:", error);
      }
    } else {
      console.log("Some fields are empty.");
      showMessage({
        message: "Please fill all the fields Or upload image",
        type: "danger",
        color: "#fff",
        backgroundColor: "red",
        floating: true,
      });
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === "ios"); // iOS needs explicit closing
    setDateOfBirth(currentDate);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : { uri: "https://via.placeholder.com/150" } // Using online placeholder image
          }
          style={styles.profileImage}
        />
        <Text style={styles.uploadText}>Upload Profile Picture</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline={true}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
      >
        <Text style={{ color: dateOfBirth ? "#000" : "#aaa" }}>
          {dateOfBirth ? dateOfBirth.toDateString() : "Select Date of Birth"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="Disability"
        value={disability}
        onChangeText={setDisability}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: "#ccc",
    borderWidth: 2,
    marginBottom: 20,
    alignSelf: "center",
  },
  uploadText: {
    textAlign: "center",
    color: "#007bff",
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginVertical: 10,
    borderRadius: 25,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    width: "30%",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CompleteSignup;
