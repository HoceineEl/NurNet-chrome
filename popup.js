// Get the DOM elements
const submitBtn = document.getElementById("url-submit");
const urlInput = document.getElementById("url-input");
const urlList = document.getElementById("url-list");

// Define a key to store the URLs in the chrome storage
const URL_KEY = "custom_urls";

// Function to save URLs to chrome storage
function saveURLs(urls) {
    chrome.storage.local.set({ [URL_KEY]: urls }, () => {
        // Log a message to confirm the save
        console.log("URLs saved: " + urls.join(", "));
        // Display the updated list
        displayAllURLs();
    });
}

// Function to display a URL in the popup
function displayURL(url) {
    // Create a list item element
    let li = document.createElement("li");
    li.classList.add("url-item");

    // Create a link element
    let p = document.createElement("p");
    // Set the link attributes

    p.textContent = url;
    // Append the link to the list item
    li.appendChild(p);

    // Create a div for buttons
    const buttonDiv = document.createElement('div');

    // Create delete button
    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Delete";
    // Add click event listener to delete button
    deleteBtn.addEventListener("click", () => deleteURL(url));
    // Append delete button to the button div
    buttonDiv.appendChild(deleteBtn);

    // Create edit button
    let editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.textContent = "Edit";
    // Add click event listener to edit button
    editBtn.addEventListener("click", () => editURL(url, li));
    // Append edit button to the button div
    buttonDiv.appendChild(editBtn);

    // Append the button div to the list item
    li.appendChild(buttonDiv);

    // Append the list item to the list
    urlList.appendChild(li);
}

// Function to display all the URLs in the popup
function displayAllURLs() {
    // Clear the existing list
    urlList.innerHTML = "";
    // Get the existing URLs from the storage
    chrome.storage.local.get(URL_KEY, (data) => {
        // If there are URLs, loop through them and display each one
        let urls = data[URL_KEY] || [];
        for (let url of urls) {
            displayURL(url);
        }
    });
}

// Function to delete a URL
function deleteURL(url) {
    // Get the existing URLs from the storage
    chrome.storage.local.get(URL_KEY, (data) => {
        // If there are URLs, filter out the deleted URL
        let urls = data[URL_KEY] || [];
        urls = urls.filter(existingUrl => existingUrl !== url);
        // Save the updated array to the storage
        saveURLs(urls);
    });
}

// Function to edit a URL
function editURL(url, listItem) {
    // Create an input field and submit button for editing
    let editInput = document.createElement("input");
    editInput.type = "url";
    editInput.value = url;
    editInput.classList.add("edit-input");

    let editSubmitBtn = document.createElement("button");
    editSubmitBtn.textContent = "Save";
    editSubmitBtn.classList.add("edit-submit-btn");

    // Handle the click event on the Save button
    editSubmitBtn.addEventListener("click", () => {
        let editedUrl = editInput.value;
        if (editedUrl) {
            // Get the existing URLs from the storage
            chrome.storage.local.get(URL_KEY, (data) => {
                let urls = data[URL_KEY] || [];
                // Find the index of the edited URL
                let index = urls.indexOf(url);
                if (index !== -1) {
                    // Replace the old URL with the edited URL
                    urls[index] = editedUrl;
                    // Save the updated array to the storage
                    saveURLs(urls);
                }
            });
        } else {
            alert("Please enter a valid URL");
        }
    });

    // Replace the content of the list item with the input and Save button
    listItem.innerHTML = "";
    listItem.appendChild(editInput);
    listItem.appendChild(editSubmitBtn);

    // Focus on the editInput field
    editInput.focus();
}

// Add an event listener to the form submit event
submitBtn.addEventListener("click", (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the URL from the input field
    let url = urlInput.value;

    // Validate the URL
    if (isValidUrl(url)) {
        // Save the URL to the storage
        const hostname = new URL(url).hostname;
        chrome.storage.local.get(URL_KEY, (data) => {
            let urls = data[URL_KEY] || [];
            urls.push(hostname);
            saveURLs(urls);
        });

        // Clear the input field
        urlInput.value = "";
    } else {
        // Alert the user if the URL is invalid
        alert("Please enter a valid URL");
    }
});

// Function to validate a URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}


// Call the function to display all the URLs when the popup is loaded
displayAllURLs();
