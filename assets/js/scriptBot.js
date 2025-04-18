// Función principal que se ejecuta cuando los componentes están listos
function initializeChatBot() {
    const typingArea = document.querySelector(".typing-area");
    typingArea.style.display = "none";

  // Selección de elementos con verificación de existencia
  const typingForm = document.querySelector(".typing-form");
  const chatContainer = document.querySelector(".chat-list");
  const suggestions = document.querySelectorAll(".suggestion");
  const toggleThemeButton = document.querySelector("#theme-toggle-button");
  const deleteChatButton = document.querySelector("#delete-chat-button");

  // Verificar que todos los elementos esenciales existen
  if (
    !typingForm ||
    !chatContainer ||
    !toggleThemeButton ||
    !deleteChatButton
  ) {
    console.error("Error: Elementos esenciales del chat no encontrados");
    return false;
  }

  // State variables
  let userMessage = null;
  let isResponseGenerating = false;
  const SERVICE_URL = "https://startybot-1.onrender.com/chat";
  // Load theme and chat data from local storage on page load
  const loadDataFromLocalstorage = () => {
    const savedChats = localStorage.getItem("saved-chats");
    if (savedChats) {
      typingArea.style.display = "block";
    }
    const isLightMode = localStorage.getItem("themeColor") === "light_mode";

    // Apply the stored theme
    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "light_mode" : "light_mode";

    // Restore saved chats or clear the chat container
    chatContainer.innerHTML = savedChats || "";
    document.body.classList.toggle("hide-header", savedChats);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  };

  // Create a new message element and return it
  const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
  };

  // Show typing effect by displaying words one by one
  const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(" ");
    let currentWordIndex = 0;
    const typingInterval = setInterval(() => {
      textElement.innerText +=
        (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
      incomingMessageDiv.querySelector(".icon")?.classList.add("hide");

      if (currentWordIndex === words.length) {
        clearInterval(typingInterval);
        isResponseGenerating = false;
        incomingMessageDiv.querySelector(".icon")?.classList.remove("hide");
        localStorage.setItem("saved-chats", chatContainer.innerHTML);
      }
      chatContainer.scrollTo(0, chatContainer.scrollHeight);
    }, 75);
  };

  // Fetch response from the API based on user message
  const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try {
      const response = await fetch(SERVICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error en la respuesta");

      const apiResponse = data.response;
      showTypingEffect(apiResponse, textElement, incomingMessageDiv);
    } catch (error) {
      isResponseGenerating = false;
      textElement.innerText = "Error: " + error.message;
      textElement.parentElement.closest(".message").classList.add("error");
    } finally {
      incomingMessageDiv.classList.remove("loading");
    }
  };

  // Show a loading animation while waiting for the API response
  const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                      <img class="avatar" src="./assets/images/starty.png" alt="Gemini avatar">
                      <p class="text"></p>
                  </div>
                  <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;
    const incomingMessageDiv = createMessageElement(
      html,
      "incoming",
      "loading"
    );
    chatContainer.appendChild(incomingMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    generateAPIResponse(incomingMessageDiv);
  };

  // Copy message text to the clipboard
  window.copyMessage = (copyButton) => {
    const messageText =
      copyButton.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyButton.innerText = "done";
    setTimeout(() => (copyButton.innerText = "content_copy"), 1000);
  };

  // Handle sending outgoing chat messages
  const handleOutgoingChat = () => {
    typingArea.style.display = "block";
    userMessage =
      typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if (!userMessage || isResponseGenerating) return;

    isResponseGenerating = true;

    const html = `<div class="message-content">
                      <img class="avatar" src="./assets/images/profile/user-1.jpg" alt="User avatar">
                      <p class="text"></p>
                  </div>`;
    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatContainer.appendChild(outgoingMessageDiv);

    typingForm.reset();
    document.body.classList.add("hide-header");
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showLoadingAnimation, 500);
  };

  // Set up event listeners
  toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem(
      "themeColor",
      isLightMode ? "light_mode" : "light_mode"
    );
    toggleThemeButton.innerText = isLightMode ? "light_mode" : "light_mode";
  });

  deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
      localStorage.removeItem("saved-chats");
      typingArea.style.display = "none";
      loadDataFromLocalstorage();
    }
  });

  suggestions.forEach((suggestion) => {
    suggestion.addEventListener("click", () => {
      userMessage = suggestion.querySelector(".text").innerText;
      typingArea.style.display = "block";
      handleOutgoingChat();
    });
  });

  typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
  });

  // Initial load
  loadDataFromLocalstorage();
  return true;
}

// Esperar a que los componentes estén cargados
document.addEventListener("components-loaded", function () {
  console.log("Componentes cargados, inicializando chat bot...");

  // Intentar inicializar el bot, con reintentos si es necesario
  function initBotWithRetry(attempts = 0) {
    if (initializeChatBot()) {
      console.log("Chat bot inicializado correctamente");
    } else if (attempts < 3) {
      console.log(
        `Reintentando inicialización del bot (intento ${attempts + 1})`
      );
      setTimeout(() => initBotWithRetry(attempts + 1), 300 * (attempts + 1));
    } else {
      console.error(
        "No se pudo inicializar el chat bot después de varios intentos"
      );
    }
  }

  initBotWithRetry();
});

// Función de respaldo en caso de que el evento no se dispare
setTimeout(() => {
  if (!document.querySelector(".typing-form")) {
    console.warn(
      "El evento components-loaded no se disparó, intentando inicializar de todos modos"
    );
    initializeChatBot();
  }
}, 3000);
