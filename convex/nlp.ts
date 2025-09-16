"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// User NLP processing with built-in OpenAI
export const processNaturalLanguage = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Use the built-in OpenAI for better NLP processing
      const openai = await import("openai");
      const client = new openai.default({
        baseURL: process.env.CONVEX_OPENAI_BASE_URL,
        apiKey:
          process.env.OPENAI_API_KEY ||
          process.env.VITE_OPENAI_API_KEY ||
          process.env.CONVEX_OPENAI_API_KEY,
      });

      const systemPrompt = `You are a task calendar assistant. Analyze the user's input and determine the intent and extract relevant parameters.

Possible intents:
1. CREATE_TASK - User wants to create a new task/event
2. QUERY_TASKS - User wants to search for existing tasks
3. UPDATE_TASK - User wants to modify an existing task
4. DELETE_TASK - User wants to remove a task
5. UNKNOWN - Intent is unclear

When extracting date or dateRange parameters, always resolve relative words like "today", "tomorrow", "this week", "next week", "yesterday", etc. to their actual date values in YYYY-MM-DD format, using the current date as reference. For example, if the user says "today", set date to today's date in YYYY-MM-DD format. If the user says "tomorrow", set date to tomorrow's date in YYYY-MM-DD format. If the user says "this week", set dateRange to the start and end dates of the current week in YYYY-MM-DD format.

For CREATE_TASK, extract:
- title: The task title
- date: Date in YYYY-MM-DD format (default to today if not specified)
- time: Time in HH:MM format (24-hour)
- duration: Duration in minutes
- description: Any additional details

For QUERY_TASKS, extract:
- query: Search terms
- dateRange: Start and end dates in YYYY-MM-DD format (resolve relative words)
- timeRange: "morning", "afternoon", "evening", or specific time

Respond with JSON only:
{
  "intent": "CREATE_TASK|QUERY_TASKS|UPDATE_TASK|DELETE_TASK|UNKNOWN",
  "confidence": 0.0-1.0,
  "parameters": {
    // extracted parameters based on intent
  },
  "response": "Natural language response to the user"
}`;

      const response = await client.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: args.text },
        ],
        temperature: 0.1,
      });

      console.log("NLP Response:", JSON.stringify(response, null, 2));

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      console.log("NLP Content:", JSON.stringify(content, null, 2));

      try {
        const parsed = JSON.parse(content);
        return parsed;
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          intent: "UNKNOWN",
          confidence: 0.0,
          parameters: {},
          response:
            "I'm not sure what you want to do. Could you please rephrase your request?",
        };
      }
    } catch (error) {
      console.error("NLP processing error:", error);

      // Simple fallback processing
      const text = args.text.toLowerCase();

      if (
        text.includes("create") ||
        text.includes("add") ||
        text.includes("schedule")
      ) {
        return {
          intent: "CREATE_TASK",
          confidence: 0.5,
          parameters: {
            title: args.text,
            date: new Date().toISOString().split("T")[0],
          },
          response:
            "I'll help you create a task. Please provide more details if needed.",
        };
      } else if (
        text.includes("find") ||
        text.includes("show") ||
        text.includes("search") ||
        text.includes("list") ||
        text.includes("what") ||
        text.includes("when") ||
        text.includes("do i have")
      ) {
        return {
          intent: "QUERY_TASKS",
          confidence: 0.5,
          parameters: {
            query: args.text,
          },
          response: "Let me search for your tasks.",
        };
      } else {
        return {
          intent: "UNKNOWN",
          confidence: 0.0,
          parameters: {},
          response:
            "I'm not sure what you want to do. Try saying something like 'Create a meeting tomorrow at 2pm' or 'Show me my tasks for today'.",
        };
      }
    }
  },
});
