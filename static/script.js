const startButton = document.getElementById('startButton');
const submitButton = document.getElementById('submitButton');
const searchBox = document.getElementById('searchBox');
const synthesis = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();
var  amISpeaking=false;
// const output = document.getElementById('output');
// const audioPlayer = document.getElementById('audioPlayer');
const recognition = new webkitSpeechRecognition();

recognition.lang = 'en-US';

window.onload=()=>{
    chatOutput("Welcome To ChatBot AI, How can I help you sir...");
}

startButton.addEventListener('click', () => {
    amISpeaking=synthesis.speaking;
    if(!amISpeaking){
        recognition.start();
    }
    else{
        document.getElementById("searchBox").placeholder="Wait till your previous input is proccessed."
    }
});

submitButton.addEventListener('click', () => {
    amISpeaking=synthesis.speaking;
    const transcript = document.getElementById('searchBox').value;
    document.getElementById('searchBox').value="";
    document.getElementById("searchBox").placeholder=transcript;
    //output.textContent = output.textContent+"<br /> User: "+transcript;
    if(transcript.trim() == null || transcript.trim() ==""){
        document.getElementById("searchBox").placeholder="Please enter some input before submit or use microphone to speak.";
    }
    else{
        if(!amISpeaking){
            var result=" User: "+transcript;
            var pElement = document.createElement("p")
            pElement.setAttribute('class','User')
            var container =document.querySelector(".Conversation")
            pElement.innerHTML=result
            container.appendChild(pElement)

            // Send data to Python backend
            callBackend(transcript);
        }
        else{
            document.getElementById("searchBox").placeholder="Wait till your previous input is proccessed."
        }
    }
});

searchBox.addEventListener('keypress',(event)=>{
    if(event.key === "Enter"){
        submitButton.click();
    }
});

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("searchBox").placeholder=transcript;
    //output.textContent = output.textContent+"<br /> User: "+transcript;
    var result=" User: "+transcript;
    var pElement = document.createElement("p")
    pElement.setAttribute('class','User')
    var container =document.querySelector(".Conversation")
    pElement.innerHTML=result
    container.appendChild(pElement)

    // Send data to Python backend
    callBackend(transcript);
    
};
function callBackend(transcript) {
    fetch('/process-voice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voiceInput: transcript })
    })
    .then(response => response.json())
    .then(data => {
        if (data.chatResp) {
            chatOutput(data.chatResp);
        }

    });
};

function chatOutput(data){
    // Update audio player source
            // audioPlayer.src = data.audioPath;
            // audioPlayer.play();
            // Set the text you want to convert to speech
    utterance.text = data;

    // Optional: Set speech properties (e.g., voice, rate, pitch, etc.)
    utterance.lang = 'en-US'; // Language
    utterance.volume = 1;     // Volume (0 to 1)
    utterance.rate = 1;       // Speed (0.1 to 10)
    utterance.pitch = 1;      // Pitch (0 to 2)

    // Speak the text
    // output.textContent = output.textContent+"<br /> AI: "+data.chatResp;
    var result_ai=" AI: "+data;
    var pElement = document.createElement("p")
    pElement.setAttribute('class','AI')
    var container =document.querySelector(".Conversation")
    pElement.innerHTML=result_ai
    container.appendChild(pElement)
    synthesis.speak(utterance);
}