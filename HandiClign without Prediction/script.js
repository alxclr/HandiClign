// Initializing constants for rotation

const block_rotation = ["NW", "NE","delete", "SE", "space", "SW","pause"]
const NW_rotation = ["E", "S", "A", "R", "I", "N"]
const letter_rotation = [["E", "S", "A", "R", "I", "N"],["T", "U", "L", "O", "M", "D"],[], ["G", "J", "Q", "Z", "Y", "X", "K", "W"], [], ["P", "C", "F", "B", "V", "H"], ["pause"]]
const validation_rotation = ["validate", "cancel"]

// Initializing dynamic variables for rotation

let current_block_index = -1
let current_letter_index = -1
let current_validation_index = 0

let current_word = ""
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
// We then define the main function which will manage our current state: block rotation, letter rotation, validation
async function main() {

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
                // Except in 4 cases (Note: down to 3 cases in this version):

                // If we clicked on block 4 i.e., the space key, we stay on a block movement
                // If we clicked on block 6 i.e., the pause key
                // If we clicked on block 2 i.e., the delete key 

                if (current_block_index == 4) { //space
                    current_word += " ";
                    lenght_last=1 
                    document.getElementById('currentword').innerHTML = current_word.toUpperCase();
                    scrollCurrentWordToBottom()
                    current_block_index = -1;
                }
                else { 
                    if (current_block_index == 2) { //delete
                        current_word= current_word.slice(0, -lenght_last);
                        current_block_index = -1;
                        document.getElementById('currentword').innerHTML = current_word.toUpperCase();
                        scrollCurrentWordToBottom()
                    }
                    else if (current_block_index == 6) { //pause
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
        if (pause) {
            current_block_index=6;
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