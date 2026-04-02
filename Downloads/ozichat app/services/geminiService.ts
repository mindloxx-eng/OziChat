
import { GoogleGenAI, Chat, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import * as backend from './backendService';

let ai: GoogleGenAI | null = null;
let chats: { [contactName: string]: Chat } = {};
let aiAssistantChat: Chat | null = null;

const getAi = (): GoogleGenAI | null => {
    if (ai) return ai;
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return null;
    }
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return ai;
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI:", error);
        return null;
    }
};

// --- Function Declarations for AI Assistant ---
const summarizeChat: FunctionDeclaration = {
  name: 'summarize_chat',
  parameters: {
    type: Type.OBJECT,
    description: 'Summarizes the chat history for a specific contact name.',
    properties: {
      contactName: { type: Type.STRING, description: 'The name of the contact.' },
    },
    required: ['contactName'],
  },
};

const getContactLocation: FunctionDeclaration = {
  name: 'get_contact_location',
  parameters: {
    type: Type.OBJECT,
    description: "Gets the physical location of a contact.",
    properties: {
      contactName: { type: Type.STRING, description: 'The name of the contact.' },
    },
    required: ['contactName'],
  },
};

const getContactsList: FunctionDeclaration = {
  name: 'get_contacts_list',
  parameters: {
    type: Type.OBJECT,
    description: "Gets a list of all contacts in the user's phonebook.",
    properties: {},
  },
};

const getChat = (contactName: string) => {
    if (chats[contactName]) {
        return chats[contactName];
    }

    const currentAi = getAi();
    if (!currentAi) return null;
    
    try {
        const newChat = currentAi.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: `You are ${contactName}, a friendly and helpful friend. Keep your responses casual and concise, like in a text message conversation.`,
                tools: [{googleSearch: {}}],
            },
        });
        chats[contactName] = newChat;
        return newChat;
    } catch (error) {
        console.error("Failed to create chat:", error);
        return null;
    }
};

const formatResponseWithSources = (response: any): string => {
    let text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks && chunks.length > 0) {
        const uniqueLinks = new Map();
        chunks.forEach((chunk: any) => {
            if (chunk.web) {
                uniqueLinks.set(chunk.web.uri, chunk.web.title);
            }
        });

        if (uniqueLinks.size > 0) {
            text += "\n\nSources:";
            let i = 1;
            uniqueLinks.forEach((title, uri) => {
                text += `\n${i}. ${title} - ${uri}`;
                i++;
            });
        }
    }
    return text;
};

export const sendMessageToGemini = async (message: string, contactName: string): Promise<string> => {
    const chat = getChat(contactName);
    if (!chat) return "Chat service is not available.";

    try {
        const response: any = await chat.sendMessage({ message });
        return formatResponseWithSources(response);
    } catch (error) {
        console.error('Gemini API error:', error);
        delete chats[contactName]; 
        return "Sorry, something went wrong while trying to get a response.";
    }
};

export const getAIBriefing = async (weatherData: any): Promise<string> => {
    const currentAi = getAi();
    if (!currentAi) return "Briefing service offline.";

    try {
        const response = await currentAi.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this atmospheric data for a tactical messaging app user: ${JSON.stringify(weatherData)}. Provide a brief (2-3 sentence) "Tactical Briefing" about how these conditions affect security, transmission stability, or outdoor visibility in a futuristic tone.`,
        });
        return response.text || "Analysis complete. Stability nominal.";
    } catch (error) {
        console.error("Briefing error:", error);
        return "Tactical briefing failed. Atmospheric sensors returning raw data only.";
    }
};

const getAIAssistantChat = (): Chat | null => {
    if (aiAssistantChat) {
        return aiAssistantChat;
    }

    const currentAi = getAi();
    if (!currentAi) return null;
    
    try {
        const newChat = currentAi.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: `You are the Ozichat AI Assistant. Your role is to help users manage their messaging experience. 
                You can summarize chats, locate friends, and list contacts. 
                If a user asks for personal info (like location or messages), always inform them you are accessing that data securely.`,
                tools: [{functionDeclarations: [summarizeChat, getContactLocation, getContactsList]}],
            },
        });
        aiAssistantChat = newChat;
        return newChat;
    } catch (error) {
        console.error("Failed to create AI assistant chat:", error);
        return null;
    }
};

export const getAIResponse = async (message: string): Promise<string> => {
    const chat = getAIAssistantChat();
    if (!chat) return "AI service is not available.";

    try {
        let response: any = await chat.sendMessage({ message });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const results = [];
            for (const fc of response.functionCalls) {
                let resultText = "";
                const contacts = backend.getContacts();
                
                if (fc.name === 'get_contacts_list') {
                    resultText = contacts.map(c => `${c.name} (${c.phone})`).join(', ');
                } else if (fc.name === 'summarize_chat') {
                    const cName = fc.args.contactName as string;
                    const contact = contacts.find(c => c.name.toLowerCase() === cName.toLowerCase());
                    if (contact) {
                        const msgs = backend.getChatMessages(contact.id);
                        resultText = msgs.length > 0 
                            ? `Recent activity with ${contact.name}: ${msgs.slice(-5).map(m => `${m.sender}: ${m.text}`).join('; ')}`
                            : `There are no recent messages with ${contact.name}. Their last status was: "${contact.lastMessage}"`;
                    } else {
                        resultText = `I couldn't find a contact named ${cName}.`;
                    }
                } else if (fc.name === 'get_contact_location') {
                    const cName = fc.args.contactName as string;
                    const contact = contacts.find(c => c.name.toLowerCase() === cName.toLowerCase());
                    resultText = (contact && contact.location) 
                        ? `${contact.name} is currently located at latitude ${contact.location.latitude} and longitude ${contact.location.longitude}.`
                        : `Location data is not available for ${cName}.`;
                }

                results.push({
                    id: fc.id,
                    name: fc.name,
                    response: { result: resultText }
                });
            }

            response = await chat.sendToolResponse({ functionResponses: results });
        }

        return formatResponseWithSources(response);
    } catch (error) {
        console.error('Gemini AI Assistant error:', error);
        aiAssistantChat = null; 
        return "I'm having trouble processing that request. Please try again.";
    }
};
