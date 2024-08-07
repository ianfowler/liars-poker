import { v4 as uuidv4 } from "uuid";

const useUserId = () => {
  const storedUserId = localStorage.getItem("userId");
  if (storedUserId) {
    return storedUserId;
  } else {
    const newUserId = uuidv4();
    localStorage.setItem("userId", newUserId);
    return newUserId;
  }
};

export { useUserId };
