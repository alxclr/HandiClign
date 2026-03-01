# HANDICLIGN

**HandiClign** is an adaptive web interface designed for individuals with severe communication disabilities. This tool empowers users who can simulate at least one keyboard entry—such as an eye blink—to compose text and interact with their environment.

---

##  Project Structure: Two Versions

This repository contains two distinct versions of the software to suit different technical needs:

### 1. Predictive AI Version
Uses the **Together AI API** to suggest words in real-time.
* **Key Benefit:** Significantly increases typing speed.
* **Requirements:** Internet connection and a Together AI API key.

### 2. Standard Version (No Prediction)
A lightweight, offline-capable version with no dependencies.
* **Key Benefit:** 100% reliable without internet or API costs.
* **Requirements:** Ready to run out-of-the-box.

---

##  Setup & User Guide

For all instructions regarding installation, API configuration, and model selection, please refer to the **User Guide** section below. It covers:
* How to get and link your Together AI API key.
* How to choose between different AI models (Llama vs. DeepSeek).
* Troubleshooting display and connection issues.

---

##  How It Works

The interface uses a **Nested Rotation System** to navigate the alphabet using a single input (e.g., the `Enter` key):

1. **Block Rotation:** The cursor cycles through four letter quadrants (NW, NE, SE, SW) and function keys (Space, Delete, Pause).
2. **Letter Selection:** Once a block is selected, the cursor cycles through the specific letters in that group.
3. **Validation:** A final "Confirm/Cancel" step ensures accuracy before the letter is printed.

---

##  SETUP AI (Predictive Version Only)

To enable AI predictions, follow these steps:

### 1. Get your API Key
* Create an account at [TogetherAI](https://www.together.ai/).
* In the **"Manage Account"** section of your dashboard, click **"Copy"** next to your **API Key**.

### 2. Configure the Software
* Open the file `API_key.js` in a text editor (like Notepad).
* Paste your key: `const API_KEY = "your_key_here";` and **Save (CTRL+S)**.

### 3. Choosing a Model
You can edit `MODEL_choice.js` to swap models:
* **Llama 3.3 70B Turbo:** Fast & High Quality.
* **Llama 3.3 70B Free:** Free but limited to 1 request/sec.
* **DeepSeek R1 Free:** Excellent quality but slow response.

---

##  Potential Issues

* **Display:** Use the latest version of **Chrome** or **Firefox**.
* **API Errors:** If predictions stop, check your TogetherAI credits or open the browser console (**CTRL+SHIFT+I**) to check for error codes like **404** (model unavailable) or **429** (rate limit).

---

##  Acknowledgements

This project was developed by student groups at **CentraleSupélec** in close collaboration with the **t’Handiquoi Association**. 

Special thanks to **Etienne**, whose specific communication needs inspired the design and logic of this interface. Our goal was to create a tool that is not only functional but truly adaptive to the user's unique environment.
