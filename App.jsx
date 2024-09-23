import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalContextProvider } from "./src/context/GlobalContextProvider";
import reducer, { initState } from "./src/context/reducer";
import FlashMessage from "react-native-flash-message";
import Main from "./src/Main";

const queryClient = new QueryClient();

export default function App() {
  return (
    
      <View style={styles.container}>
        <StatusBar translucent={false} backgroundColor="#fff" />
        <GlobalContextProvider initialState={initState} reducer={reducer}>
          <QueryClientProvider client={queryClient}>
            <Main />
          </QueryClientProvider>
        </GlobalContextProvider>
        <FlashMessage position="top" duration={5000} hideOnPress={true} />
      </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
