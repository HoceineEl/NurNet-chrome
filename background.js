// Declare a variable to store the blocked websites
let blockedWebsites = null;
let fetchedWebsites = null;
const links = ["https://youtu.be/daKRAN7HQLw?si=hqDvUC3dL0Zu6gGW",
    "https://youtube.com/shorts/JhnwACk7VEU?si=ypo6lOFKbJ9Xg2JF",
    "https://youtube.com/shorts/AqmlDbtBysM?si=C_POdysQUnPS1S6b",
    "https://www.youtube.com/watch?v=sD0YHxAc4mA",
    " https://youtu.be/swhjXT7CD9o?si=JuVg2wSvc3ROSD8Q",
    "https://youtu.be/0zdChdEc73M?si=2Rk4bHNMQxwUuxYy",
    "https://youtu.be/__Zb-bU0zO0?si=NUKi5gUJSqwVMhYc",
    "https://www.youtube.com/watch?v=uywNwKtCYVs",
    "https://www.youtube.com/watch?v=2u5OlVDnMPA",
    "https://www.youtube.com/watch?v=_HKI4GPhU_A",
    "https://youtube.com/shorts/q9fGUEdpjvg?si=dTH4mLwL9hUTBoGa",
    "https://www.youtube.com/shorts/DSUjK5IlwuE",
    "https://www.youtube.com/watch?v=netwWxW8PAI",
    "https://youtu.be/stqOYOPqvKI?si=fJKQeYuso3AMIcGO]"]
let overrideNewTab = true; // Initial state


// Define a function to fetch the blocked websites from a URL
async function fetchBlockedWebsites(blocklistURL) {
    try {
        let response;

        // Check if the URL is a local resource
        if (blocklistURL.startsWith('local://')) {
            // Fetch the resource locally
            const resourceName = blocklistURL.replace('local://', '');
            response = await fetch(chrome.runtime.getURL(resourceName));
        } else {
            // Fetch the resource from an external URL
            response = await fetch(blocklistURL);
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${blocklistURL}`);
        }

        let data = await response.text();
        // Split the data by lines
        const websiteNames = data.split("\n").map((line) => {
            // Remove leading and trailing whitespaces
            return line.trim();
        }).filter(Boolean);

        return websiteNames;
    } catch (error) {
        console.error(error);
        return [];
    }
}
chrome.alarms.create("myAlarm", {
    periodInMinutes: 0.1
});
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "myAlarm") {
        init()
    }
});

async function fetchCustomBlockedWebsites() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("custom_urls", (data) => {
            try {
                const customUrls = data["custom_urls"] || [];
                resolve(customUrls);
            } catch (error) {
                console.error(error);
                reject([]);
            }
        });
    });
}


async function fetchFirstTime() {
    const blocklistURL = "local://list1.txt";

    const blockedWebsites = await fetchBlockedWebsites(blocklistURL);


    chrome.tabs.onUpdated.removeListener(checkwebsite);
    chrome.storage.local.set({ "fetched_urls": blockedWebsites }, () => {
        // Call the init function after updating the storage
        init();
    });
}

async function init() {
    fetchedWebsites = await new Promise((resolve) => {
        chrome.storage.local.get("fetched_urls", (data) => {
            resolve(data["fetched_urls"] || []);
        });
    });

    // Add onUpdated listener
    chrome.tabs.onUpdated.addListener(checkwebsite);

    // Log the current blocked websites for debugging
    // console.log("Blocked Websites:", fetchedWebsites);
}

async function checkwebsite(tabId, changeInfo, tab) {
    blockedWebsites = fetchedWebsites.concat(await fetchCustomBlockedWebsites());

    if (changeInfo.url) {
        let hostname = new URL(changeInfo.url).hostname;
        hostname = hostname.replace(/^www\./, '');

        // Ensure case-sensitive comparison and exact match
        if (blockedWebsites.includes(hostname)) {
            chrome.tabs.remove(tabId);
            chrome.tabs.create({ url: getRandomLink() });
        }
    }
}


function getRandomLink() {
    return links[Math.floor(Math.random() * links.length)];
}
fetchFirstTime();