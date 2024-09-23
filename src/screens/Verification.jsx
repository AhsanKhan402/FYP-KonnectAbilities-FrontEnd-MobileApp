import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { showMessage } from "react-native-flash-message";
import { useMutation } from "@tanstack/react-query";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

const Verification = ({ navigation }) => {
  const [description, setDescription] = useState("");
  const [medicalReport, setMedicalReport] = useState(null);

  // const pickDocument = async () => {
  //   let result = await DocumentPicker.getDocumentAsync({
  //     type: "application/pdf",
  //   });

  //   if (!result.canceled && result.assets) {
  //     const fileInfo = result.assets[0];
  //     setMedicalReport({
  //       uri: fileInfo.uri,
  //       type: fileInfo.mimeType || "application/pdf", // Default to 'application/pdf'
  //       name: fileInfo.name || "medical-report.pdf", // Default to 'medical-report.pdf'
  //     });
  //   }
  // };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
      base64: true,
    });
    console.log("CHCCC", result);
    if (!result.cancelled) {
      const base64Image = `data:${result.assets[0]?.mimeType};base64,${result?.assets[0]?.base64}`;
      setMedicalReport(base64Image);
    }
  };

  const verificationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: "/user/verification",
        data,
      });
      return response;
    },

    onSuccess: async (e) => {
      if (e && e.status === 200) {
        showMessage({
          message: "Verification details submitted successfully!",
          type: "success",
          color: "#fff",
          backgroundColor: "green",
          floating: true,
        });
        // Optionally, reset the form
        setDescription("");
        setMedicalReport(null);
        navigation.goBack();
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

  // Usage in your handleSubmit function
  const handleSubmit = async () => {
    if (!medicalReport || !description) {
      showMessage({
        message: "Please upload your medical report and provide a description.",
        type: "danger",
        color: "#fff",
        backgroundColor: "red",
        floating: true,
      });
    } else {
      const data = {
        description,
        base64MedicalReport: medicalReport,
      };

      verificationMutation.mutate(data);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Disability Verification</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>
          {medicalReport ? "Change Medical Report" : "Upload Medical Report"}
        </Text>
      </TouchableOpacity>
      {medicalReport && (
        <Text style={styles.fileName}>{`*Image Selected`}</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Describe your disability"
        value={description}
        onChangeText={setDescription}
        multiline={true}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>
          {verificationMutation.isPending ? (
            <ActivityIndicator size={24} color={"#fff"} />
          ) : (
            <Text style={styles.saveButtonText}>Submit</Text>
          )}
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    width: "80%",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  fileName: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginVertical: 20,
    borderRadius: 25,
    backgroundColor: "#fff",
    fontSize: 16,
    height: 150,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    width: "80%",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Verification;
