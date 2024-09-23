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
import CreateService from "../screens/CreateService";
function HomeNavigation() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Home">
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
        options={{ headerShown: true, title: 'Create Group' }}
      />

      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{  headerShown: false}}
      />
      <Stack.Screen
        name="Service"
        component={Service}
        options={{ title: "Book Services" }}
      />
      <Stack.Screen
        name="CreateService"
        component={CreateService}
        options={{ title: "Book New Service" }}
      />
    </Stack.Navigator>
  );
}

export default HomeNavigation;
