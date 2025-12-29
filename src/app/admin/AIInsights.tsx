
'use client';

import React, { useState } from 'react';
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIcon, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChartData, generateChart } from '@/ai/flows/generateChartFlow';
import { Client, Task } from '@/lib/types';

interface AIInsightsProps {
    tasks: Task[];
    clients: Client[];
}

const COLORS = ['#4F46E5', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AIInsights({ tasks, clients }: AIInsightsProps) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const { toast } = useToast();

    // Check if API key is available
    const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

    const handleGenerate = async () => {
        if (!hasApiKey) {
            toast({
                title: 'API Key Missing',
                description: 'Gemini API key is not configured. Please add it to your environment variables.',
                variant: 'destructive'
            });
            return;
        }

        if (!query) {
            toast({ title: "Query is empty", description: "Please enter a query to generate a visualization.", variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        setChartData(null);

        try {
            const result = await generateChart({ query, tasks, clients });
            if (result && result.data.length > 0) {
                setChartData(result);
                toast({ title: "Chart Generated!", description: result.title });
            } else {
                toast({ title: "No Data", description: "The AI couldn't generate a chart from your query or no data was found.", variant: 'destructive' });
            }
        } catch (error) {
            console.error("Failed to generate chart:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            if (errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('FAILED_PRECONDITION')) {
                toast({
                    title: 'API Key Error',
                    description: 'Please configure your Gemini API key in the environment variables.',
                    variant: 'destructive'
                });
            } else {
                toast({ title: 'Generation Failed', description: 'The AI could not generate a chart. Please try a different query.', variant: 'destructive' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderChart = () => {
        if (!chartData) {
            return (
                <div className="mt-4 p-4 border rounded-lg bg-muted/50 text-center text-sm text-muted-foreground min-h-[250px] flex items-center justify-center">
                    <p>Your generated chart will appear here.</p>
                </div>
            );
        }

        return (
            <div className="mt-4">
                <h3 className="font-semibold">{chartData.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{chartData.description}</p>
                <ResponsiveContainer width="100%" height={250}>
                    {chartData.type === 'bar' ? (
                        <BarChart data={chartData.data}>
                            <XAxis dataKey="x" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip
                                contentStyle={{
                                    background: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="y" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={chartData.yLabel} />
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie data={chartData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                {chartData.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <Card className="w-full overflow-hidden border-indigo-500/20 shadow-2xl shadow-indigo-500/10 relative group">
            <div className="absolute top-0 right-0 -m-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
            <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    AI Intelligence
                </CardTitle>
                <CardDescription>Ask Gemini to visualize your business data trends</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="space-y-4">
                    <div className="relative group">
                        <Input
                            placeholder={hasApiKey ? "Ask anything... (e.g., 'Projects by month')" : "API key required - configure in environment"}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            disabled={isLoading || !hasApiKey}
                            className="pr-10 border-indigo-100 bg-indigo-50/30 focus:bg-white transition-all ring-offset-indigo-500"
                        />
                        {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-500" />}
                    </div>
                    <Button
                        onClick={handleGenerate}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                        disabled={isLoading || !hasApiKey}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing Data...
                            </>
                        ) : !hasApiKey ? (
                            <>
                                <BarChartIcon className="mr-2 h-4 w-4" />
                                Setup API Key
                            </>
                        ) : (
                            <>
                                <BarChartIcon className="mr-2 h-4 w-4" />
                                Generate Visual Insight
                            </>
                        )}
                    </Button>
                    {!hasApiKey && (
                        <div className="text-sm text-indigo-600 text-center p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 italic">
                            <p>Unlock the power of AI with a Gemini API key</p>
                        </div>
                    )}
                    {renderChart()}
                </div>
            </CardContent>
        </Card>
    );
}
