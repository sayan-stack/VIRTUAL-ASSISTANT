let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

function speak(text) {
    let textSpeak = new SpeechSynthesisUtterance(text);
    textSpeak.rate = 1;
    textSpeak.pitch = 1;
    textSpeak.volume = 1;
    textSpeak.lang = "en-GB";
    window.speechSynthesis.speak(textSpeak);
}

function wishMe() {
    let hours = new Date().getHours();
    
    if (hours >= 0 && hours < 12) {
        speak("Good Morning, Sir.");
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon, Sir.");
    } else if (hours >= 16 && hours < 20) {
        speak("Good Evening, Sir.");
    } else {
        speak("Good Night, Sir.");
    }

    setTimeout(() => {
        speak("I am Shifra, your virtual assistant. How can I assist you today?");
    }, 2000);
}

// Speech Recognition Setup
let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = "en-GB";

recognition.onstart = function () {
    voice.style.display = "block";
    btn.style.display = "none";
};

recognition.onend = function () {
    voice.style.display = "none";
    btn.style.display = "flex";
};

recognition.onresult = function (event) {
    let transcript = event.results[0][0].transcript.toLowerCase();
    content.innerText = transcript;
    takeCommand(transcript);
};

btn.addEventListener("click", () => recognition.start());

async function takeCommand(message) {
    if (message.includes("wish me")) {
        wishMe();
    } else if (message.includes("hello") || message.includes("hey")) {
        speak("Hello Sir, what can I help you with?");
    } else if (message.includes("who are you")) {
        speak("I am your virtual assistant, created by Sayan.");
    } else if (message.includes("how are you")) {
        speak("I am good, thank you for asking.");
    } else if (message.includes("open youtube")) {
        speak("Opening YouTube...");
        window.open("https://youtube.com", "_blank");
    } else if (message.includes("open google")) {
        speak("Opening Google...");
        window.open("https://google.com", "_blank");
    } else if (message.includes("open whatsapp")) {
        speak("Opening WhatsApp...");
        window.open("https://web.whatsapp.com", "_blank");
    } else if (message.includes("open instagram")) {
        speak("Opening Instagram...");
        window.open("https://www.instagram.com", "_blank");
    } else if (message.includes("time")) {
        let time = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
        speak(`The time is ${time}`);
    } else if (message.includes("date")) {
        let date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "short" });
        speak(`Today's date is ${date}`);
    } else if (message.match(/\d/)) {
        solveMath(message);
    } else if (message.includes("i'm bored") || message.includes("tell me something")) {
        tellFunFact();
    } else if (message.includes("what's the weather today")) {
        getWeather();
    } else if (message.includes("tell me interesting news")) {
        getNews();
    } else if (message.startsWith("play ")) {
        playSong(message);
    } else {
        fetchWikipediaData(message);
    }
}

// ✅ Solve Mathematical Problems (Supports Multiply, Divide, Add, Subtract)
function solveMath(expression) {
    try {
        let cleanExpression = expression
            .replace(/what is|calculate|solve|equals/gi, "")  // Remove unnecessary words
            .replace(/times|multiply/gi, "*")   // Fix multiplication
            .replace(/divided by/gi, "/") // Fix division
            .replace(/plus/gi, "+")   // Fix addition
            .replace(/minus/gi, "-")  // Fix subtraction
            .trim();

        let result = eval(cleanExpression);
        speak(`The answer is ${result}`);
    } catch (error) {
        speak("Sorry, I couldn't calculate that.");
    }
}

// ✅ Play Any Song (Opens YouTube)
function playSong(message) {
    let songName = message.replace("play ", "").trim();
    speak(`Playing ${songName} on YouTube.`);
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(songName)}`, "_blank");
}

// 🎭 Fun Fact Generator
function tellFunFact() {
    let facts = [
        "Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3000 years old and still edible!",
        "A day on Venus is longer than a year on Venus!",
        "Bananas are berries, but strawberries are not!",
        "Octopuses have three hearts, and their blood is blue.",
        "The Eiffel Tower can grow taller during hot weather because metal expands with heat."
    ];
    let randomFact = facts[Math.floor(Math.random() * facts.length)];
    speak(randomFact);
}

// 🌦️ Get Weather Update
async function getWeather() {
    try {
        let response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=28.7041&longitude=77.1025&current_weather=true"); // Example location: Delhi
        let data = await response.json();
        let weather = data.current_weather;
        speak(`The current temperature is ${weather.temperature} degrees Celsius.`);
    } catch (error) {
        speak("Sorry, I couldn't fetch the weather update.");
    }
}

// 📰 Get News Headlines
async function getNews() {
    try {
        let response = await fetch("https://newsapi.org/v2/top-headlines?country=in&apiKey=YOUR_NEWS_API_KEY");
        let data = await response.json();
        if (data.articles.length > 0) {
            let headline = data.articles[0].title;
            speak(`Here is an interesting news headline: ${headline}`);
        } else {
            speak("I couldn't find any interesting news at the moment.");
        }
    } catch (error) {
        speak("Sorry, I couldn't fetch the news update.");
    }
}

// 🌍 Wikipedia Search
async function fetchWikipediaData(query) {
    let searchQuery = query.replace("shifra", "").trim();
    let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;

    try {
        let searchResponse = await fetch(searchUrl);
        let searchData = await searchResponse.json();

        if (searchData.query.search.length > 0) {
            let bestMatchTitle = searchData.query.search[0].title;
            let pageUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatchTitle)}`;

            let pageResponse = await fetch(pageUrl);
            let pageData = await pageResponse.json();

            if (pageData.extract) {
                speak(pageData.extract.split(".").slice(0, 2).join(".") + ".");
            } else {
                speak("I couldn't find relevant information. Let me open Google for you.");
                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
            }
        } else {
            speak("No Wikipedia results found. Opening Google...");
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
        }
    } catch (error) {
        speak("There was an issue fetching the information. Opening Google...");
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
    }
}

