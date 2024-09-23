import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";

const CreateService = () => {
  const navigation = useNavigation();
  const [serviceTitle, setServiceTitle] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (
      serviceTitle.trim() &&
      pickupLocation.trim() &&
      dropLocation.trim() &&
      date &&
      time &&
      phoneNumber.trim() &&
      details.trim()
    ) {
      const formData = {
        title: serviceTitle,
        pickLocation: pickupLocation,
        dropLocation: dropLocation,
        date: date.toDateString(),
        time: time.toTimeString().split(" ")[0], // Extracting time in HH:MM:SS format
        phoneNumber,
        description: details,
      };
      addServiceMutation.mutate(formData);
    } else {
      showMessage({
        message: "Please fill in all the fields.",
        type: "danger",
        color: "#fff",
        backgroundColor: "red",
        floating: true,
      });
    }
  };

  const addServiceMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: "/service",
        data: formData,
      });
      return response;
    },
    onSuccess: (response) => {
      showMessage({
        message: "Service request submitted successfully!",
        type: "success",
        color: "#fff",
        backgroundColor: "green",
        floating: true,
      });
      navigation.goBack();
    },
    onError: (error) => {
      showMessage({
        message: "Failed to submit service request.",
        type: "danger",
        color: "#fff",
        backgroundColor: "red",
        floating: true,
      });
    },
  });

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === "ios");
    setTime(currentTime);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Service Title"
          placeholderTextColor="#999"
          value={serviceTitle}
          onChangeText={setServiceTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Pickup Location"
          placeholderTextColor="#999"
          value={pickupLocation}
          onChangeText={setPickupLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Drop Location"
          placeholderTextColor="#999"
          value={dropLocation}
          onChangeText={setDropLocation}
        />

        {/* Date Picker Button */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {date ? date.toDateString() : "Select Date"}
          </Text>
        </TouchableOpacity>

        {/* Show Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        {/* Time Picker Button */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.dateText}>
            {time ? time.toTimeString().split(" ")[0] : "Select Time"}
          </Text>
        </TouchableOpacity>

        {/* Show Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <TextInput
          style={[styles.input, styles.detailsInput]}
          placeholder="Additional Details"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={details}
          onChangeText={setDetails}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  form: {
    padding: 20,
    backgroundColor: "#ffffff",
    margin: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
  },
  dateText: {
    color: "#333",
    fontSize: 16,
  },
  detailsInput: {
    paddingTop: 10,
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateService;
