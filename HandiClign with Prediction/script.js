// Initializing constants for rotation

const block_rotation = ["NW", "NE","delete", "PRE1", "PRE2", "SE", "space", "SW","pause"]
const NW_rotation = ["E", "S", "A", "R", "I", "N"]
const letter_rotation = [["E", "S", "A", "R", "I", "N"],["T", "U", "L", "O", "M", "D"], [],[],[], ["G", "J", "Q", "Z", "Y", "X", "K", "W"], [], ["P", "C", "F", "B", "V", "H"], ["pause"]]
const validation_rotation = ["validate", "cancel"]

// Initializing dynamic variables for rotation

let current_block_index = -1
let current_letter_index = -1
let current_validation_index = 0

let current_word = "" // Sentence currently displayed on the screen
let prediction1 = "" // value of prediction #1
let prediction2 = "" // value of prediction #2
let answer="" // value of the API response used in the predictAI function
let answer1="" // value of answer after shortening the reasoning (for certain models)

// Initially, we move the blocks (letter groups) and the other movements are on standby
// So we initialize mvt_block to True

let mvt_block = true 
let mvt_letter = false
let mvt_validation = false
let pause = false

// To be able to delete correctly:

let lenght_last=0

// We retrieve the HTML document

const root = document.documentElement;
const button_color = getComputedStyle(root).getPropertyValue('--color-button');

let blink_color;
let delay_time;
let delay_time_prediction = 100;

//------------------------------------------------------------------------------------------------------------//
// Definition of Cookie functions to save the registered values

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Duration in milliseconds
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    for (let cookie of cookieArr) {
        cookie = cookie.trim(); // Removes spaces
        if (cookie.startsWith(name + '=')) {
            return cookie.substring((name + '=').length);
        }
    }
    return null; // Returns null if the cookie doesn't exist
}

//------------------------------------------------------------------------------------------------------------//
// The following function implements autoscroll on the writing pad

function scrollCurrentWordToBottom() {
    const el = document.getElementById('currentword');
    el.scrollTop = el.scrollHeight;
}

//------------------------------------------------------------------------------------------------------------//
// The following function is used to predict the most likely word based on context using the Together AI API

function predictAI(prefix, context){

    if (context.length>200){ // we avoid making prompts too long to always stay within TogetherAI's free tier
        context=context.slice(-200)
    }
    let prompt = `  Here is what the user previously wrote, the context:"${context}", and the first letters of the word they started writing: the prefix:"${prefix}". Predict the 2 most likely words based on the context and the logic of the sentence. Return ONLY "word1,word2" in your response (THERE MUST BE NOTHING ELSE IN YOUR RESPONSE). Importantly, word1 and word2 must not contain multiple words and must be different. If the prefix is empty, you can predict the next word. Improve predictions for determiners and pronouns, "J" -> "JE", "T"->"TU"...`
    
    const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: 'Bearer '+API_KEY // we retrieve API_KEY from the js file in the folder
        },
        body: JSON.stringify({
          model: MODEL,
          context_length_exceeded_behavior: 'error',
          messages: [
            {
              role: 'system',
              content:''
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000
        })    
    }

    fetch('https://api.together.xyz/v1/chat/completions', options)
        .then(res => res.json())
        .then(res => {
          answer = res.choices[0].message.content;
          answer1 = answer.replace(/<think>[\s\S]*?<\/think>/g, "")
            if (answer1.length<50){
                let list = answer1.split(',');
                prediction1 = list[0].trim() 
                prediction2 = list[1].trim()
            }
            else {
                prediction1=""
                prediction2=""
            }
        })
        .catch(err => {
          console.error(err);
        });
    }

//------------------------------------------------------------------------------------------------------------//
// Function to get the last word of a string

function lastWord(string) {
    const words = string.trim().split(/\s+/); // Splits the string into words
    let last = words[words.length - 1]; // Returns the last word
    if (string[string.length - 1]==" "){
        return ""
    }
    return last
}

//------------------------------------------------------------------------------------------------------------//
// We then define the main function which will manage our current state: block rotation, letter rotation, validation
async function main() {

    prediction_cycle()
    // We start by retrieving the cookies and setting the user parameters
    const settingsButton = document.getElementById('settingsButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    blink_color = (getCookie("blink color") == null) ? getComputedStyle(root).getPropertyValue('--color-clignotement') : getCookie("blink color")
    delay_time = (getCookie("delay time") == null) ? 1000 : parseInt(getCookie("delay time"))

    // We create the interactive parameters
    settingsButton.addEventListener('click', function () {
        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';  // Hides the menu
        } else {
            dropdownMenu.style.display = 'block'; // Shows the menu
        }
    });
    // The blink color
    const colorInput = document.getElementById('color');
    colorInput.addEventListener('input', function () {
        blink_color = colorInput.value;
        setCookie("blink color", colorInput.value, 30);
    });
    // The rotation delay
    const delayInput = document.getElementById('delay');
    delayInput.addEventListener('input', function () {
        delay_time = delayInput.value
        setCookie('delay time', delayInput.value, 30);
    });

    // We start by rotating the blocks

    rotation_block();

    // We monitor for an Enter key press
    
    document.addEventListener('keydown', function (event) {
        if (event.key == 'Enter') {
            if ((mvt_letter) && (!pause)) {
                // if we were on a letter rotation, we then move to a validation rotation to confirm the chosen letter
                mvt_letter = false;
                mvt_validation = true;
                document.getElementById('currentword').innerHTML = current_word + letter_rotation[current_block_index][current_letter_index];
                scrollCurrentWordToBottom()
                rotation_validation();
            } else if (mvt_block) {
                // If we clicked during a block movement then we switch to a letter movement
                // Except in 4 cases:

                // If we clicked on block 6 i.e., the space key, we stay on a block movement
                // If we clicked on block 3 then we chose prediction1
                // If we clicked on block 4 then we chose prediction2
                // If we clicked on block 8 i.e., the pause key
                // If we clicked on block 2 i.e., the delete key 

                if (current_block_index == 6) { //space
                    current_word += " ";
                    lenght_last=1 
                    document.getElementById('currentword').innerHTML = current_word.toUpperCase();
                    scrollCurrentWordToBottom()
                    let last_word = lastWord(current_word);
                    let context = current_word.slice(0, current_word.length - last_word.length);
                    predictAI(last_word.toLowerCase(),context);
                    current_block_index = -1;
                }
                else { 
                    if (current_block_index == 3) {  //prediction1
                        current_word = document.getElementById("currentword").innerHTML;
                        scrollCurrentWordToBottom()
                        let last_word = lastWord(current_word);
                        if (last_word == current_word) { current_word = prediction1.toUpperCase() + " ";
                        }
                        else {
                            current_word = current_word.slice(0, current_word.length - last_word.length);
                            current_word +=prediction1.toUpperCase() + " ";
                        }
                        lenght_last=prediction1.length+1
                        current_block_index = -1;
                        document.getElementById('currentword').innerHTML = current_word.toUpperCase();
                        scrollCurrentWordToBottom()
                        last_word = lastWord(current_word);
                        let context = current_word.slice(0, current_word.length - last_word.length);
                        predictAI(last_word.toLowerCase(),context);
                    }
                    else if (current_block_index == 4) { //prediction2
                        current_word = document.getElementById("currentword").innerHTML;
                        scrollCurrentWordToBottom()
                        let last_word = lastWord(current_word);
                        if (last_word == current_word) { current_word = prediction2.toUpperCase() + " "; }
                        else {
                            current_word = current_word.slice(0, current_word.length - last_word.length);
                            current_word +=prediction2.toUpperCase() + " ";
                        }
                        lenght_last=prediction2.length+1
                        current_block_index = -1;
                        document.getElementById('currentword').innerHTML = current_word.toUpperCase();
                        scrollCurrentWordToBottom()
                        last_word = lastWord(current_word);
                        let context = current_word.slice(0, current_word.length - last_word.length);
                        predictAI(last_word.toLowerCase(),context);
                    }
                    else if (current_block_index == 2) { //delete
                        current_word= current_word.slice(0, -lenght_last);
                        current_block_index = -1;
                        document.getElementById('currentword').innerHTML = current_word.toUpperCase();
                        scrollCurrentWordToBottom()
                        let last_word = lastWord(current_word);
                        lenght_last=1
                        let context = current_word.slice(0, current_word.length - last_word.length);
                        predictAI(last_word.toLowerCase(),context);
                    }
                    else if (current_block_index == 8) { //pause
                        if (pause) {
                            pause=false;
                        }
                        else {
                            pause=true;
                        }
                    }
                    else { //in this case we switch to a letter rotation movement
                        mvt_block = false;
                        mvt_letter = true;
                        rotation_letter();
                    }
                }

            } else if (!pause) {//we switch to the validation movement
                mvt_validation = false;
                mvt_block = true;
                if (current_validation_index == 0) {
                    current_word += letter_rotation[current_block_index][current_letter_index];
                    document.getElementById('currentword').innerHTML = current_word.toUpperCase();
                    scrollCurrentWordToBottom()
                    let last_word = lastWord(current_word);
                    let context = current_word.slice(0, current_word.length - last_word.length);
                    predictAI(last_word.toLowerCase(),context);
                    lenght_last=1
                    current_block_index = -1;    
                } 
                else {
                    document.getElementById('currentword').innerHTML = current_word;
                    scrollCurrentWordToBottom()
                    current_block_index = current_block_index - 1;
                }
                rotation_block();
            }
        }
    })
}

//------------------------------------------------------------------------------------------------------------//
// Block rotation cycle

async function rotation_block() {
    while (!(mvt_letter || mvt_validation)) {
        current_block_index = (current_block_index + 1) % block_rotation.length; // we don't wait for delay_time and go directly to the next block
        if (current_block_index == 3 && prediction1=="") {} // if the predictions are empty, we don't display them
        else if (current_block_index == 4 && prediction2=="") {}
        else if (pause) {
            current_block_index=8;
            const block = document.getElementById(block_rotation[current_block_index])
            block.style.setProperty('--block-color', blink_color)
            await delay(delay_time);
            block.style.setProperty('--block-color', button_color)
        }
        else {
            const block = document.getElementById(block_rotation[current_block_index])
            block.style.setProperty('--block-color', blink_color)
            await delay(delay_time);
            block.style.setProperty('--block-color', button_color)
        }
    }

    if (mvt_letter || mvt_validation) { mvt_block = false }
}

//------------------------------------------------------------------------------------------------------------//
// Letter rotation cycle

async function rotation_letter() {
    const block = document.getElementById(letter_rotation[current_block_index][0])
    block.style.backgroundColor = blink_color;
    current_letter_index = 0;
    await delay(1.5*delay_time);
    block.style.backgroundColor = " var(--block-color)"; // this start of the code just prevents a display misunderstanding
    while (!(mvt_block || mvt_validation)) {
        current_letter_index = (current_letter_index + 1) % letter_rotation[current_block_index].length;
        const block = document.getElementById(letter_rotation[current_block_index][current_letter_index])
        block.style.backgroundColor = blink_color;
        await delay(delay_time);
        block.style.backgroundColor = " var(--block-color)";
    }
    if (mvt_block || mvt_validation) { mvt_letter = false }
}

//------------------------------------------------------------------------------------------------------------//
// Validation rotation cycle

async function rotation_validation() {
    // await delay(delay_time);
    current_validation_index = 0;
    while (!(mvt_block || mvt_letter)) {
        const block = document.getElementById(validation_rotation[current_validation_index]);
        block.style.backgroundColor = blink_color;
        await delay(delay_time);
        block.style.backgroundColor = button_color;
        current_validation_index = (current_validation_index + 1) % 2
    }
    if (mvt_block || mvt_letter) { mvt_validation = false }
}

//------------------------------------------------------------------------------------------------------------//
// The famous delay function

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//------------------------------------------------------------------------------------------------------------//
// automatic refresh function for the prediction pads

async function prediction_cycle() {
    while (true) {
        await delay(delay_time_prediction)
        document.getElementById('PRE1').innerHTML = prediction1.toUpperCase();
        document.getElementById('PRE2').innerHTML = prediction2.toUpperCase();
    }
}

//------------------------------------------------------------------------------------------------------------//
// Function to save the text

function saveText(btn) {
    let initial_text = getCookie("text");
    // setCookie("text", initial_text + current_word, 30);
    navigator.clipboard.writeText(current_word);
    alert("Text copied to clipboard!")
    btn.blur()
    document.getElementById("currentword") = ""
}

//------------------------------------------------------------------------------------------------------------//
// Function to remove focus from the taskbar buttons

function blurring(btn) {
    btn.blur()
}