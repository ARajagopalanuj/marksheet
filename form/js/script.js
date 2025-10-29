// let socket;
// let username = "";

// document.getElementById("joinBtn").addEventListener("click", () => {
//   username = document.getElementById("username").value.trim();
//   if (username !== "") {
//     document.getElementById("login").classList.add("hidden");
//     document.getElementById("chat").classList.remove("hidden");
//     startChat();
//   }
// });

// function startChat() {
//   socket = new WebSocket("ws://localhost:5000");

//   socket.onopen = () => {
//     console.log("Connected to chat server ✅");
//   };

//   socket.onmessage = (event) => {
//     const msgBox = document.getElementById("messages");
//     const data = JSON.parse(event.data);
//     const div = document.createElement("div");
//     div.classList.add("message");
//     if (data.user === username) div.classList.add("my-message");
//     div.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
//     msgBox.appendChild(div);
//     msgBox.scrollTop = msgBox.scrollHeight;
//   };

//   document.getElementById("sendBtn").addEventListener("click", sendMessage);
//   document.getElementById("msgInput").addEventListener("keypress", e => {
//     if (e.key === "Enter") sendMessage();
//   });
// }

// function sendMessage() {
//   const msg = document.getElementById("msgInput").value.trim();
//   if (msg !== "") {
//     const data = { user: username, text: msg };
//     socket.send(JSON.stringify(data));
//     document.getElementById("msgInput").value = "";
//   }
// }

let socket;
let username = "";

document.getElementById("joinBtn").addEventListener("click", () => {
  username = document.getElementById("username").value.trim();

  if (username === "") {
    alert("Please enter a name first!");
    return;
  }

  // connect to backend
  socket = new WebSocket("ws://localhost:5000");

  socket.onopen = () => {
    console.log("✅ Connected to chat server");
    // send join request to backend
    socket.send(JSON.stringify({ type: "join", user: username }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const msgBox = document.getElementById("messages");

    // 1️⃣ Duplicate username case
    if (data.type === "error") {
      alert(data.text); // example: "Username already exists!"
      socket.close();
      return;
    }

    // 2️⃣ User joined notification
    if (data.type === "info" && data.text.includes("joined")) {
      document.getElementById("login").classList.add("hidden");
      document.getElementById("chat").classList.remove("hidden");
    }

    // 3️⃣ Display chat message or info message
    const div = document.createElement("div");
    div.classList.add("message");

    if (data.type === "message") {
      if (data.user === username) {
        div.classList.add("my-message");
      }
      div.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
    } else if (data.type === "info") {
      div.classList.add("info");
      div.textContent = data.text;
    }

    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  };

  socket.onclose = () => {
    console.log("❌ Disconnected from server");
  };

  // send message when click button
  document.getElementById("sendBtn").addEventListener("click", sendMessage);
  // send message on enter key
  document.getElementById("msgInput").addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });
});

function sendMessage() {
  const msg = document.getElementById("msgInput").value.trim();
  if (msg === "") return;

  const data = {
    type: "message",
    user: username,
    text: msg
  };
  socket.send(JSON.stringify(data));
  document.getElementById("msgInput").value = "";
}
