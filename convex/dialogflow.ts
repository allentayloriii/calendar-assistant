"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { SessionsClient } from "@google-cloud/dialogflow";

export const dialogflowDetectIntent = action({
  args: {
    text: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Get Dialogflow credentials from environment variables
      const projectId = process.env.DIALOGFLOW_PROJECT_ID;
      const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL;
      
      if (!projectId || !privateKey || !clientEmail) {
        throw new Error("Missing Dialogflow credentials");
      }
      
      // Create credentials object
      const credentials = {
        private_key: privateKey,
        client_email: clientEmail,
      };
      
      // Create a new session client
      const sessionClient = new SessionsClient({
        projectId,
        credentials,
      });
      
      // Generate session ID if not provided
      const sessionId = args.sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
      
      // The text query request
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: args.text,
            languageCode: 'en-US',
          },
        },
      };
      
      // Send request and get response
      const [response] = await sessionClient.detectIntent(request);
      const result = response.queryResult;
      
      return {
        intent: result?.intent?.displayName || 'Unknown',
        parameters: result?.parameters ? JSON.parse(JSON.stringify(result.parameters)) : {},
        fulfillmentText: result?.fulfillmentText || 'I didn\'t understand that.',
        confidence: result?.intentDetectionConfidence || 0,
      };
    } catch (error) {
      console.error('Dialogflow error:', error);
      return {
        intent: 'fallback',
        parameters: {},
        fulfillmentText: 'Sorry, I encountered an error processing your request.',
        confidence: 0,
      };
    }
  },
});
