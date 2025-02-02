import { useNavigation } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";

export default function NavigationOverlay() {
  const navigation = useNavigation();
  if (navigation.state === "loading") {
    return <LoadingOverlay display />;
  } else {
    return <></>;
  }
}
