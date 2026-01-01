
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

    // We rely on the Server Action to handle the API key check securely
    const hasApiKey = true; // Assume configured, server action will verify

    const handleGenerate = async () => {
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

            if (errorMessage.includes('429') || errorMessage.includes('Quota') || errorMessage.includes('rate-limit')) {
                toast({
                    title: 'Quota Exceeded',
                    description: 'The AI is currently at its free limit. Please try again in a few minutes or use a different API key.',
                    variant: 'destructive'
                });
            } else if (errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('FAILED_PRECONDITION')) {
                toast({
                    title: 'API Key Error',
                    description: 'Please configure your Gemini API key correctly in the .env file.',
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
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                }}
                                itemStyle={{ color: '#1e1b4b', fontWeight: '800', fontSize: '12px' }}
                                labelStyle={{ color: '#64748b', fontWeight: '600', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
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
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                }}
                                itemStyle={{ color: '#1e1b4b', fontWeight: '800', fontSize: '12px' }}
                                labelStyle={{ color: '#64748b', fontWeight: '600', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
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
                            placeholder="Ask Gemini anything... (e.g., 'Earnings by month')"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            disabled={isLoading || !hasApiKey}
                            className="pr-10 border-indigo-200 bg-white/50 focus:bg-white text-indigo-950 placeholder:text-indigo-300 transition-all ring-offset-indigo-500 font-medium"
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
                        ) : (
                            <>
                                <BarChartIcon className="mr-2 h-4 w-4" />
                                Generate Visual Insight
                            </>
                        )}
                    </Button>
                    {renderChart()}
                </div>
            </CardContent>
        </Card>
    );
}
