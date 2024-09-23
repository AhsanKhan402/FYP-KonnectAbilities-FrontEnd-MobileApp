import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import Profile from "../screens/Profile"; // Make sure this path is correct
import EditProfile from "../screens/EditProfile";
import Verification from "../screens/Verification";

function ProfileNavigation() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Profile">
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

export default ProfileNavigation;
