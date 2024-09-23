import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
} from "react-native";
import logo from "../../assets/logo.png"; // Import your logo image
import { useMutation } from "@tanstack/react-query";
import apiRequest from "../api/apiRequest";
import urlType from "../constants/UrlConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";
import { useStateValue } from "../context/GlobalContextProvider";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the eye icon

function Signup({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const signupMutation = useMutation({
    mutationKey: ["user"],
    mutationFn: async (data) => {
      const response = await apiRequest(urlType.BACKEND, {
        method: "post",
        url: `signup`,
        data,
      });
      return response;
    },
    onSuccess: async (e) => {
      if (e.status === 200) {
        await AsyncStorage.setItem("@user", JSON.stringify(e.data.user));
        await AsyncStorage.setItem("@auth_token", e.data.token);
        navigation.navigate("CompleteSignup"); // Navigate to CompleteSignup screen
      } else if (e.response.status === 404) {
        showMessage({
          message: e.response.message,
          type: "danger",
          color: "#fff",
          backgroundColor: "red",
          floating: true,
        });
      } else {
        showMessage({
          message: e.response.message || "An Error occurred",
          type: "danger",
          color: "#fff",
          backgroundColor: "red",
          floating: true,
        });
      }
    },
  });

  const handleSignup = async () => {
    var emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var passwordFormat =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (
      email.length > 0 &&
      username.length > 0 &&
      password.length > 0 &&
      password === confirmPassword
    ) {
      if (email.match(emailFormat)) {
        const data = {
          username: username,
          email: email,
          password: password,
        };
        await signupMutation.mutate(data);
      } else {
        showMessage({
          message: "Invalid Email Format",
          type: "danger",
          color: "#fff",
          backgroundColor: "red",
          floating: true,
        });
      }
    } else if (password !== confirmPassword) {
      showMessage({
        message: "Password does not match",
        type: "danger",
        color: "#fff",
        backgroundColor: "red",
        floating: true,
      });
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
    <SafeAreaView style={styles.container}>
      <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      <Text style={styles.logoText}>KonnectAbilities</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="UserName"
          placeholderTextColor="#999"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            placeholderTextColor="#999"
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            secureTextEntry={!isConfirmPasswordVisible}
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
          />
          <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
            <Ionicons
              name={isConfirmPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={[styles.loginText, { color: "#3897f0", marginLeft: 5 }]}>
            Log In
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 10, // Adjusted for closer spacing
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20, // Reduced space
  },
  inputContainer: {
    width: "80%",
    marginBottom: 10, // Reduced space between input fields
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1, // Reduced border thickness
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 10, // Adjusted space between fields
    fontSize: 16,
    color: "#333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1, // Reduced border thickness
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 10, // Adjusted space between fields
    height: 50,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  signUpButton: {
    backgroundColor: "#007bff",
    borderRadius: 25, // Ensure it matches the input fields
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20, // Ensure the spacing is consistent
  },
  signUpButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  loginText: {
    color: "#999",
    fontSize: 14,
  },
});

export default Signup;
