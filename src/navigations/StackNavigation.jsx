import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import Home from "../screens/Home";
import UserProfile from "../screens/UserProfile";
import Notifications from "../screens/Notifications";
import Messages from "../screens/Messages";
import ChatScreen from "../screens/ChatScreen";
import Groups from "../screens/Groups";
import GroupDetails from "../screens/GroupDetails";
import CreateGroup from "../screens/CreateGroups";
import Service from "../screens/Service";
import BottomNavigation from "./BottomNavigation";
import Search from "../screens/Search";
import Profile from "../screens/Profile";
import Add from "../screens/Add";
import CompleteSignup from "../screens/CompleteSignup";
import Signup from "../screens/Signup";
import Login from "../screens/Login";
import Verification from "../screens/Verification";
import EditProfile from "../screens/EditProfile";
function StackNavigation() {
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
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupDetails"
        component={GroupDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Groups"
        component={Groups}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroup}
        options={{ headerShown: true, title: "Create Group" }}
      />

      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={{ title: "Messages" }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Service"
        component={Service}
        options={{ title: "Book a Service" }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Verification"
        component={Verification}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ headerShown: true, title: "Edit Profile" }}
      />
    </Stack.Navigator>
  );
}

export default StackNavigation;
