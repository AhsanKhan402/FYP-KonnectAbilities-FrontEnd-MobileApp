import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import Login from "../screens/Login";
import BottomNavigation from "./BottomNavigation";
import Signup from "../screens/Signup";
import Profile from "../screens/Profile"; // Make sure this path is correct
import Search from "../screens/Search"; // Make sure this path is correct
import Add from "../screens/Add"; // Make sure this path is correct
import Messages from "../screens/Messages"; // Make sure this path is correct
import CompleteSignup from "../screens/CompleteSignup";
import Notifications from "../screens/Notifications";
import Groups from "../screens/Groups";

function AccountNavigation() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        options={{ headerShown: false }}
        name="Login"
        component={Login}
      />
      <Stack.Screen
        name="SignUp"
        component={Signup}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="CompleteSignup"
        component={CompleteSignup}
      />
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Add"
        component={Add}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="BottomNavigation"
        component={BottomNavigation}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Groups"
        component={Groups}
      />
    </Stack.Navigator>
  );
}

export default AccountNavigation;
