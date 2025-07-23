
'use server';

/**
 * @fileOverview An AI flow to generate chart data from natural language.
 *
 * - generateChart: Takes a user query and task/client data to produce chart-compatible JSON.
 * - ChartRequest: The input type for the generateChart function.
 * - ChartData: The return type for the generateChart function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Client, Task } from '@/lib/types';

// Zod schema for the data points in the chart
const DataPointSchema = z.object({
  x: z.string().describe('The label for the x-axis or the name of a pie slice.'),
  y: z.number().describe('The value for the y-axis.'),
  name: z.string().describe('The name of the data point, for legends or tooltips.'),
  value: z.number().describe('The value of the data point, for pie charts.')
}).partial();


// Zod schema for the entire chart data structure
const ChartDataSchema = z.object({
  type: z.enum(['bar', 'pie']).describe('The type of chart to render.'),
  title: z.string().describe('A descriptive title for the chart.'),
  description: z.string().describe('A brief description or summary of what the chart shows.'),
  xLabel: z.string().optional().describe('Label for the X-axis.'),
  yLabel: z.string().optional().describe('Label for the Y-axis.'),
  data: z.array(DataPointSchema).describe('An array of data points for the chart.'),
});
export type ChartData = z.infer<typeof ChartDataSchema>;

// Zod schema for the flow's input
const ChartRequestSchema = z.object({
  query: z.string(),
  tasks: z.any(), // Using any to avoid schema validation for complex nested objects from Firestore
  clients: z.any(),
});
export type ChartRequest = z.infer<typeof ChartRequestSchema>;

// Exported function to be called from the client
export async function generateChart(input: ChartRequest): Promise<ChartData> {
  return generateChartFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateChartPrompt',
    input: { schema: ChartRequestSchema },
    output: { schema: ChartDataSchema },
    prompt: `
        You are an expert data analyst. A user wants to visualize their project management data.
        Your task is to analyze the user's query and the provided JSON data (tasks and clients) to generate a suitable chart.
        You MUST ONLY respond with a valid JSON object that conforms to the output schema.

        Analyze the user's query: "{{query}}"
        
        Here is the data:
        Tasks: {{{json tasks}}}
        Clients: {{{json clients}}}

        Based on the query and the data, decide whether a 'bar' or 'pie' chart is more appropriate.
        - Use 'bar' for comparisons, trends over time, or rankings (e.g., 'earnings per month', 'top clients').
        - Use 'pie' for showing parts of a whole (e.g., 'project status distribution', 'payment status breakdown').

        Construct the 'data' array.
        - For bar charts, map the labels to 'x' and values to 'y'. 'name' should be the legend label.
        - For pie charts, map the labels to 'name' and values to 'value'.
        
        Ensure the 'title' and 'description' are insightful and accurately reflect the chart's content.
        If the query is ambiguous or the data is insufficient to create a meaningful chart, return an empty 'data' array.
        Do not make up data. All chart data must be derived from the provided JSON.
        Calculate earnings, totals, and counts accurately. 'total' is the project value, 'amountPaid' is what the client has paid.
    `,
});

const generateChartFlow = ai.defineFlow(
  {
    name: 'generateChartFlow',
    inputSchema: ChartRequestSchema,
    outputSchema: ChartDataSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }
    return output;
  }
);
