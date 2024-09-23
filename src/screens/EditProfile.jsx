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
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import urlType from "../constants/UrlConstants";
import apiRequest from "../api/apiRequest";
import { useMutation, useQuery } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditProfile = ({ navigation, route }) => {
  const { userInfo } = route.params;
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(0);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [city, setCity] = useState("");
  const [disability, setDisability] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const userApiDetail = useQuery({
    queryKey: ["user", userInfo?._id],
    queryFn: async () => {
      try {
        const response = await apiRequest(urlType.BACKEND, {
          method: "get",
          url: `user?userId=${userInfo?._id}`,
        });
        if (response.data) {
          setProfileImage(response?.data?.profileImage);
          setBio(response?.data?.bio);
          setPhoneNumber(response?.data?.phoneNumber);
          // setDateOfBirth(new Date(response?.data?.dateOfBirth));
          setCity(response?.data?.city);
          setDisability(response?.data?.disability);
          return response.data;
        } else {
          throw new Error("Data not available");
        }
      } catch (error) {
        console.error("Error fetching user detail:", error);
        throw error;
      }
    },
    enabled: userInfo ? true : false,
  });

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
      const response = await apiRequest(urlType.BACKEND, {
        method: "put",
        url: `user`,
        data,
      });
      return response;
    },
    onSuccess: async (e) => {
      if (e.status === 200) {
        showMessage({
          message: e.message,
          type: "success",
          color: "#fff",
          backgroundColor: "green",
          floating: true,
        });
        navigation.goBack()
      } else if (e.status === 404) {
        showMessage({
          message: e.message,
          type: "danger",
          color: "#fff",
          backgroundColor: "red",
          floating: true,
        });
      } else {
        console.log("ISSUE", e)
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

  const handleSave = async () => {
    if (
      bio.length > 0 &&
      phoneNumber.length > 0 &&
      dateOfBirth.toISOString().length > 0 &&
      city.length > 0 &&
      disability.length > 0
    ) {
      const data = {
        profileImage: profileImage,
        bio: bio,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth.toISOString(),
        city: city,
        disability: disability,
      };
      await updateMutation.mutate(data);
      userApiDetail.refetch();
    } else {
      showMessage({
        message: "Please fill all the fields Or upload image",
        type: "danger",
        color: "#fff",
        backgroundColor: "red",
        floating: true,
      });
    }
  };

 
  const showDatePickerHandler = () => {
    setShowDatePicker(true); // This should be true to show the picker
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false); // Hide the picker after a date is selected
    setDateOfBirth(currentDate); // Set the selected date
  };

  return (
    <>
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="chevron-left"
            size={30}
            color="#000"
            style={styles.notificationsIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View> */}
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : { uri: "https://via.placeholder.com/150" }
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
          keyboardType="numeric"
          value={phoneNumber}
          maxLength={11}
          onChangeText={(text) => {
            const cleanedText = text.replace(/[^0-9]/g, "");
            setPhoneNumber(cleanedText);
          }}
        />
        <TouchableOpacity onPress={showDatePickerHandler} style={styles.input}>
          <Text>
            {" "}
            {dateOfBirth ? dateOfBirth.toDateString() : "Select Date"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()} // Optional: Prevents selecting a future date
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
          {updateMutation.isPending ? (
            <ActivityIndicator size={24} color={"#fff"} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: "#ccc",
    borderWidth: 2,
    marginBottom: 20,
    alignSelf: "center",
    backgroundColor: "#cccccc",
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

export default EditProfile;
