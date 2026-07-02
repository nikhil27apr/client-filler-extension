document.getElementById("fill").addEventListener("click", async () => {
  const prefix = document.getElementById("prefix").value;
  const indexRaw = document.getElementById("index").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const status = document.getElementById("status");

  status.textContent = "Sending to the page…";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(
      tab.id,
      { type: "fillForm", prefix, indexRaw, phone, email },
      (response) => {
        if (chrome.runtime.lastError) {
          status.textContent =
            "Could not reach the page. Refresh the tab and try again.";
          return;
        }
        status.textContent = response?.message || "Completed.";
      },
    );
  } catch (error) {
    status.textContent = "Unable to communicate with the page.";
  }
});
