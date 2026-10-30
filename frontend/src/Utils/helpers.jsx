import { toast } from "react-toastify";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.js";
export const authenticate = (data) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("userAuthBearer", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
  }
};
export const getUser = () => {
  if (typeof window !== "undefined")
    return JSON.parse(sessionStorage.getItem("user") || "null");
  return null;
};
export const getToken = () => {
  if (typeof window !== "undefined")
    return sessionStorage.getItem("userAuthBearer");
  return null;
};
export const logout = async () => {
  sessionStorage.removeItem("userAuthBearer");
  sessionStorage.removeItem("user");
  await signOut(auth);
};
const firebaseMessages = {
  "auth/email-already-in-use":
    "This email already has an account. Sign in instead.",
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/operation-not-allowed":
    "Email/password registration is disabled in Firebase Authentication.",
  "auth/network-request-failed":
    "Firebase could not connect. Check your internet connection.",
};
export const errMsg = (error) => {
  const code = error?.code || "";
  const message =
    firebaseMessages[code] ||
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong";
  toast.error(
    message.replace("Firebase: ", "").replace(/ \(auth\/[^)]+\)\.?$/, ""),
    { position: "bottom-right" },
  );
};
export const successMsg = (message) =>
  toast.success(message, { position: "bottom-right" });
if (typeof window !== "undefined")
  onIdTokenChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      sessionStorage.setItem("userAuthBearer", token);
      if (!sessionStorage.getItem("user"))
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            name: user.displayName || user.email?.split("@")[0],
            email: user.email,
            firebaseUid: user.uid,
          }),
        );
    } else {
      sessionStorage.removeItem("userAuthBearer");
      sessionStorage.removeItem("user");
    }
  });
