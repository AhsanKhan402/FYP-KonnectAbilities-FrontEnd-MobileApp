import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AccountNavigation from "./navigations/AccountNavigation";
import { useStateValue } from "./context/GlobalContextProvider";
import { useQuery } from "@tanstack/react-query";
import FlashMessage from "react-native-flash-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import urlType from "./constants/UrlConstants";
import BottomNavigation from "./navigations/BottomNavigation";
import { navigationRef } from './api/RootNavigation';

const Stack = createNativeStackNavigator();
function Main() {
  const [loading, setLoading] = useState(false);
  const [{ isLogin }, dispatch] = useStateValue();
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const result = await apiRequest(urlType.BACKEND, {
        method: "get",
        url: `usersMe`,
      });
      if (result?.status === 200) {
        return result?.data;
      } else {
        return false;
      }
    },
    enabled: false,
  });
  useEffect(() => {
    checkUser();
  }, [isLogin]);

  const checkUser = async () => {
    setLoading(true);
    const userToken = await AsyncStorage.getItem("@auth_token");

    if (userToken) {
      dispatch({
        type: "SET_LOGIN",
        isLogin: true,
      });
      await userQuery.refetch();
      setLoading(false);
    } else {
      dispatch({
        type: "SET_LOGIN",
        isLogin: false,
      });
      setLoading(false);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator animating={true} size={32} />
          </View>
        ) : (
          <Stack.Navigator>
            {isLogin === true ? (
              <Stack.Screen
                options={{ headerShown: false }}
                name="BottomNavigation"
                component={BottomNavigation}
              />
            ) : (
              <Stack.Screen
                options={{ headerShown: false }}
                name="AccountNavigation"
                component={AccountNavigation}
              />
            )}
          </Stack.Navigator>
        )}
      </NavigationContainer>
      <FlashMessage position="top" duration={5000} hideOnPress={true} />
    </View>
  );
}

export default Main;
