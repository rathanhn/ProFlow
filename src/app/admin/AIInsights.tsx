
'use client';

import React, { useState } from 'react';
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart as BarChartIcon, Loader2 } from 'lucide-react';
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
            toast({ title: 'Generation Failed', description: 'The AI could not generate a chart. Please try a different query.', variant: 'destructive' });
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
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Ask about your data to get visualizations.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Input
                        placeholder="e.g., 'Show top clients by earnings'"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        disabled={isLoading}
                    />
                    <Button onClick={handleGenerate} className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <BarChartIcon className="mr-2 h-4 w-4" />
                                Generate Visualization
                            </>
                        )}
                    </Button>
                    {renderChart()}
                </div>
            </CardContent>
        </Card>
    );
}
