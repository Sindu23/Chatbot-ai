import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"; 

export const fetchResponse = async (userInput) => {
  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
    contents: [{ parts: [{ text: userInput }] }], 
    });

    return response.data.candidates[0]?.content?.parts[0]?.text || "No response from AI.";
  } catch (error) {
    console.error("Error fetching response:", error);
    return "Sorry, something went wrong!";
  }
};
