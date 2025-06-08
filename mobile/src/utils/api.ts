import axios from "axios";
import ENV from "./constants";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../navigation/RootNavigation";
const api = axios.create({
  baseURL: ENV.API_BASE_URL,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized: reset to Auth stack, Login screen
      navigationRef.current?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth", params: { screen: "Login" } }],
        })
      );
    }
    return Promise.reject(error);
  }
);

export default api;