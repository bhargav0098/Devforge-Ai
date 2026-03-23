import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured. Add it to your Vercel environment variables.' }, { status: 500 });
  }
  try {
    const { message, toolContext, chatHistory } = await request.json();

    if (!message || !toolContext) {
      return NextResponse.json(
        { error: 'Message and toolContext required' },
        { status: 400 }
      );
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(toolContext);

    // Build conversation
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...chatHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    // Define tools for architecture builder
    const tools = toolContext.tool === 'architecture-builder' ? [{
      functionDeclarations: [
        {
          name: 'add_node',
          description: 'Add a technology node to the architecture canvas',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['frontend', 'backend', 'database', 'service'],
                description: 'The category of the technology node'
              },
              label: {
                type: 'string',
                description: 'EXACT technology name from available list'
              }
            },
            required: ['category', 'label']
          }
        },
        {
          name: 'remove_node',
          description: 'Remove a technology node from the canvas',
          parameters: {
            type: 'object',
            properties: {
              label: {
                type: 'string',
                description: 'Exact technology name to remove'
              }
            },
            required: ['label']
          }
        },
        {
          name: 'update_customization',
          description: 'Update project customizations like features and design',
          parameters: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              description: { type: 'string' },
              features: {
                type: 'array',
                items: { type: 'string' }
              },
              design: {
                type: 'object',
                properties: {
                  theme: { type: 'string' },
                  colors: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  buttonStyle: { type: 'string' },
                  layout: { type: 'string' }
                }
              }
            }
          }
        }
      ]
    }] : undefined;

    // Call Gemini with tools
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY!
        },
        body: JSON.stringify({
          contents: messages,
          tools: tools ? [tools[0]] : undefined, // Fix tools structure
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({ 
          message: '⚠️ I am currently overloaded (Rate Limit). Please wait a minute and try again.' 
        });
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content) {
      // Return a safe fallback if AI returns nothing
      return NextResponse.json({
        message: '⚠️ I processed your request but didn\'t generate a text response. Please check if the action was performed.',
        functionCalls: []
      });
    }

    const content = data.candidates[0].content;

    // Extract function calls
    const functionCalls = content.parts
      ?.filter((part: any) => part.functionCall)
      .map((part: any) => ({
        name: part.functionCall.name,
        args: part.functionCall.args || {}
      })) || [];

    // Extract text
    const textResponse = content.parts
      ?.filter((part: any) => part.text)
      .map((part: any) => part.text)
      .join('') || '';

    // If we have function calls but no text, provide a default confirmation
    const finalMessage = textResponse || (functionCalls.length > 0 
      ? `✅ Processed action(s): ${functionCalls.map((c: any) => c.name).join(', ')}` 
      : 'Done!');

    return NextResponse.json({
      message: finalMessage,
      functionCalls
    });

  } catch (error: any) {
    return NextResponse.json({
      message: `❌ Error: ${error.message || 'Something went wrong try again'}`
    }, { status: 200 }); // Return 200 so UI shows message instead of crashing
  }
}

function buildSystemPrompt(toolContext: any): string {
  const basePrompt = `You are DevForge AI assistant helping with ${toolContext.tool}.

CURRENT STATE:
- Nodes on canvas: ${toolContext.nodes?.length || 0}
- Active tool: ${toolContext.tool}
`;

  if (toolContext.tool === 'architecture-builder') {
    return basePrompt + `
YOU MUST USE FUNCTIONS TO MODIFY THE ARCHITECTURE:

**Available Functions:**
1. add_node(category, label) - Adds technology to canvas
2. remove_node(label) - Removes technology from canvas  
3. update_customization(projectName, description, features, design) - Updates project settings

**Available Technologies:**
Frontend: "React", "Next.js", "Vue", "Angular"
Backend: "Node.js + Express", "Python + FastAPI", "Go + Gin", "Node.js + NestJS"
Database: "PostgreSQL", "MongoDB", "Redis", "MySQL"
Service: "JWT Auth", "Stripe Payments", "AWS S3 Storage"

**CRITICAL RULES:**
- ALWAYS use exact names listed above (case-sensitive)
- When user says "Add Stripe", call add_node({ category: "service", label: "Stripe Payments" })
- When user says "Add PostgreSQL", call add_node({ category: "database", label: "PostgreSQL" })
- After calling function, respond with confirmation like "✅ Added Stripe Payments to your architecture!"

**Examples:**
User: "Add Stripe Payments"
→ Call add_node({ category: "service", label: "Stripe Payments" })
→ Respond: "✅ I've added Stripe Payments to your architecture. This will include payment processing with webhooks and customer management."

User: "I want dark theme with purple gradient"
→ Call update_customization({ design: { theme: "dark", colors: ["#667eea", "#764ba2", "#f093fb"] } })
→ Respond: "✅ Updated to dark theme with purple-pink gradient colors."

User: "Remove MongoDB"
→ Call remove_node({ label: "MongoDB" })
→ Respond: "✅ Removed MongoDB from the architecture."

User: "Add user authentication and payment processing features"
→ Call update_customization({ features: ["User authentication with JWT", "Payment processing with Stripe", "User registration and login", "Protected routes"] })
→ Respond: "✅ Added authentication and payment features to your requirements."

BE CONCISE. Always use functions when user requests changes.
`;
  }

  if (toolContext.tool === 'code-reviewer') {
    return basePrompt + `
Provide helpful explanations about:
- Security vulnerabilities and how to fix them
- Performance optimization techniques
- Code quality best practices
- Alternative solutions

Be clear, educational, and actionable.
`;
  }

  if (toolContext.tool === 'docs-generator') {
    return basePrompt + `
Help improve documentation by:
- Suggesting missing sections
- Simplifying complex explanations
- Adding code examples
- Clarifying technical concepts

Be helpful and constructive.
`;
  }

  return basePrompt + '\nProvide helpful, conversational assistance.';
}
