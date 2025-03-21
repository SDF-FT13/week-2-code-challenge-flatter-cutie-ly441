document.addEventListener("DOMContentLoaded", function() {
//your code here
const baseURL = "http://localhost:3000/characters";
let currentCharacter = null; // To store the selected character

// Fetch and display all characters in the character bar
function fetchCharacters() {
    fetch(baseURL)
        .then(response => response.json())
        .then(characters => {
            const characterBar = document.getElementById("character-bar");
            characterBar.innerHTML = ""; // Clear previous content

            characters.forEach(character => {
                const span = document.createElement("span");
                span.textContent = character.name;
                span.style.cursor = "pointer"; // Make it clickable
                span.addEventListener("click", () => displayCharacterDetails(character));
                characterBar.appendChild(span);
            });
        })
        .catch(error => console.error("Error fetching characters:", error));
}

// Display character details in #detailed-info
function displayCharacterDetails(character) {
    currentCharacter = character; // Store the selected character

    const detailedInfo = document.getElementById("detailed-info");
    detailedInfo.innerHTML = `
        <h2>${character.name}</h2>
        <img src="${character.image}" alt="${character.name}" style="max-width: 300px;">
        <p>Votes: <span id="vote-count">${character.votes}</span></p>
        <button id="reset-btn">Reset Votes</button>
    `;

    // Add event listener to the reset votes button
    setTimeout(() => {
        document.getElementById("reset-btn").addEventListener("click", resetVotes);
    }, 0);
    document.getElementById("reset-btn").addEventListener("click", resetVotes);
}

// Handle vote submission
document.getElementById("votes-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const votesInput = document.getElementById("votes");
    const votesToAdd = parseInt(votesInput.value, 10);

    if (!isNaN(votesToAdd) && currentCharacter) {
        const newVotes = currentCharacter.votes + votesToAdd;
        currentCharacter.votes = newVotes;
        document.getElementById("vote-count").textContent = newVotes;

        // Update votes on the server
        fetch(`${baseURL}/${currentCharacter.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ votes: newVotes })
        }).catch(error => console.error("Error updating votes:", error));
    }

    votesInput.value = ""; // Reset input field
});

// Reset votes to 0
function resetVotes() {
    if (currentCharacter) {
        currentCharacter.votes = 0;
        document.getElementById("reset-btn").textContent = "0";

        // Persist reset to backend
        fetch(`${baseURL}/${currentCharacter.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ votes: 0 })
        }).catch(error => console.error("Error resetting votes:", error));
    }
}

// Handle adding a new character
document.getElementById("character-bar").addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("new-name").value.trim();
    const image = document.getElementById("new-image").value.trim();

    if (name && image) {
        const newCharacter = { name, image, votes: 0 };

        // Save new character to backend
        fetch(baseURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCharacter)
        })
        .then(response => response.json())
        .then(character => {
            fetchCharacters(); // Refresh character list
            displayCharacterDetails(character); // Show new character
        })
        .catch(error => console.error("Error adding character:", error));
    }

    document.getElementById("character-bar").reset(); // Clear form fields
});

// Load characters when the page loads
fetchCharacters();
});



    
