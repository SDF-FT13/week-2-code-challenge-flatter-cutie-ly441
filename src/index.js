document.addEventListener("DOMContentLoaded", function () {
  const baseURL = "http://localhost:3000/characters";
  let currentCharacter = null; // Store the selected character

  // Fetch and display all characters in the character bar
  function fetchCharacters() {
    fetch(baseURL)
      .then((response) => response.json())
      .then((characters) => {
        const characterBar = document.getElementById("character-bar");
        characterBar.innerHTML = ""; // Clear previous content

        characters.forEach((character) => {
          const span = document.createElement("span");
          span.textContent = character.name;
          span.style.cursor = "pointer"; // Make it clickable
          span.addEventListener("click", () =>
            displayCharacterDetails(character)
          );
          characterBar.appendChild(span);
        });
      })
      .catch((error) => console.error("Error fetching characters:", error));
  }

  // Display character details in #detailed-info
  function displayCharacterDetails(character) {
    currentCharacter = character; // Store the selected character

    const detailedInfo = document.getElementById("detailed-info");
    detailedInfo.innerHTML = `
            <p><strong>${character.name}</strong></p>
            <img src="${character.image}" alt="${character.name}" style="max-width: 300px;">
            <h4>Votes: <span id="vote-count">${character.votes}</span></h4>
            <button id="reset-btn">Reset Votes</button>
        `;

    // Add event listener to the reset votes button
    document.getElementById("reset-btn").addEventListener("click", resetVotes);
  }

  // Handle vote submission
  document
    .getElementById("votes-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const votesInput = document.getElementById("votes");
      let votesToAdd = parseInt(votesInput.value, 10); // Ensure number conversion

      if (!isNaN(votesToAdd) && currentCharacter) {
        // Restrict votes between 0 and 100
        votesToAdd = Math.max(0, Math.min(100, votesToAdd));

        // Update the character's votes
        currentCharacter.votes += votesToAdd;

        // Update the vote count in the UI
        document.getElementById("vote-count").textContent =
          currentCharacter.votes;

        // Send updated votes to the server
        fetch(`${baseURL}/${currentCharacter.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ votes: currentCharacter.votes }),
        }).catch((error) => console.error("Error updating votes:", error));

        // Clear input field
        votesInput.value = "";
      } else {
        alert("Please enter a valid number between 0 and 100.");
      }
    });

  // Reset votes to 0
  function resetVotes() {
    if (currentCharacter) {
      currentCharacter.votes = 0;
      document.getElementById("vote-count").textContent = 0;

      // Persist reset to backend
      fetch(`${baseURL}/${currentCharacter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes: 0 }),
      }).catch((error) => console.error("Error resetting votes:", error));
    }
  }

  // Handle adding a new character
  document.getElementById("character-form").addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("name").value;
      const image = document.getElementById("image-url").value;

      if (name && image) {
        const newCharacter = { name, image, votes: 0 };

        // Save new character to backend
        fetch(baseURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCharacter),
        })
          .then((response) => response.json())
          .then((character) => {
            displayCharacterDetails(character);
            fetchCharacters(); // Refresh character bar
          })
          .catch((error) => console.error("Error adding character:", error));

        // Clear form fields
        document.getElementById("name").value = "";
        document.getElementById("image-url").value = "";
      } else {
        alert("Please enter a valid name and image URL.");
      }
    });

  // Load characters when the page loads
  fetchCharacters();
});
