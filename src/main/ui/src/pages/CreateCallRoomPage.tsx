import { apiClient } from "@openapi/zodiosClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCallRoomPage() {
  const [userId, setUserId] = useState<string>("");

  const navigate = useNavigate();

  function createRoom() {
    apiClient.createCallRoom({ userIds: [userId] }).then((resp) => {
      navigate("../call-room/" + resp.id);
    });
  }

  return (
    <div className="flex flex-rox gap-2">
      <div>Create a call room with user id :</div>
      <input value={userId} onChange={(e) => setUserId(e.currentTarget.value)}></input>
      <button onClick={createRoom}>create</button>
    </div>
  );
}
