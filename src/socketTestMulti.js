import { io } from "socket.io-client";

// Replace these with the actual MongoDB userIds
const USER_1_ID = "68d29c69020d26315248a02c"; 
const USER_2_ID = "68d29ca4020d26315248a030";

// Connect User 1
const socket1 = io("http://localhost:5000");
socket1.on("connect", () => {
  console.log("✅ User 1 connected with socket id:", socket1.id);
  socket1.emit("join", USER_1_ID);
});
socket1.on("new-interest", (data) => {
  console.log("🔔 User 1 received notification:", data);
});

// Connect User 2
const socket2 = io("http://localhost:5000");
socket2.on("connect", () => {
  console.log("✅ User 2 connected with socket id:", socket2.id);
  socket2.emit("join", USER_2_ID);
});
socket2.on("new-interest", (data) => {
  console.log("🔔 User 2 received notification:", data);
});

// Simulate User 1 adding a new interest after 5 seconds
setTimeout(() => {
  console.log("\n💡 Simulate User 1 adding a new interest nearby User 2...");
  console.log("You now need to POST the interest via Postman or your backend route.");
}, 5000);

// Keep script running
process.stdin.resume();
