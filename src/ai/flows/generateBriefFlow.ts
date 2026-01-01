
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BriefRequestSchema = z.object({
    projectName: z.string(),
    clientName: z.string(),
    existingNotes: z.string().optional(),
});

const BriefResponseSchema = z.object({
    brief: z.string().describe('A professional, concise project brief.'),
});

export async function generateBrief(input: z.infer<typeof BriefRequestSchema>) {
    return generateBriefFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateBriefPrompt',
    input: { schema: BriefRequestSchema },
    output: { schema: BriefResponseSchema },
    prompt: `
    You are a professional project manager. Your task is to write a concise, professional, and clear project brief based on the project title and client name.
    
    Project Title: "{{projectName}}"
    Client: "{{clientName}}"
    Existing Notes: "{{existingNotes}}"
    
    If existing notes are provided, expand upon them and make them sound more professional.
    If no notes are provided, generate a standard professional starting brief that outlines the likely objectives for a project with this title.
    
    Keep the brief under 100 words. Focus on clarity and professionalism.
  `,
});

const generateBriefFlow = ai.defineFlow(
    {
        name: 'generateBriefFlow',
        inputSchema: BriefRequestSchema,
        outputSchema: BriefResponseSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error('AI failed to generate a brief.');
        }
        return output;
    }
);
