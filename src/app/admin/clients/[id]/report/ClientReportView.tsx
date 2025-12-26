'use client';

import React from 'react';
import { Client, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ClientReportViewProps {
    client?: Client;
    tasks: Task[];
    reportTitle?: string;
}

export default function ClientReportView({ client, tasks, reportTitle = "Statement" }: ClientReportViewProps) {
    const router = useRouter();
    const totalAmount = tasks.reduce((sum, task) => sum + task.total, 0);
    const totalPaid = tasks.reduce((sum, task) => sum + task.amountPaid, 0);
    const totalDue = totalAmount - totalPaid;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('report-content');
        if (!element) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = (await import('jspdf'));

            // Upscale: scale 4 for high quality
            const canvas = await html2canvas(element, {
                scale: 4,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // A4 dimensions in mm
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            // First page
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Subsequent pages
            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`${client ? client.name : 'Global'}_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans print:p-0 print:bg-white">
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background-color: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    .print-content {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 20mm;
                        margin: 0 auto;
                        box-shadow: none;
                    }
                }
            `}</style>

            {/* Toolbar */}
            <div className="max-w-[210mm] mx-auto flex justify-between items-center mb-8 no-print">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <div className="flex gap-2">
                    <Button onClick={handleDownloadPDF} className="bg-white text-black border border-black hover:bg-gray-100">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                    <Button onClick={() => window.print()} className="bg-black text-white hover:bg-gray-800">
                        <Printer className="mr-2 h-4 w-4" /> Print Report
                    </Button>
                </div>
            </div>

            {/* A4 Sheet */}
            <div
                id="report-content"
                className="print-content bg-white shadow-xl mx-auto flex flex-col"
                style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 text-black">{reportTitle}</h1>
                        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Client Profile Card */}
                    {client ? (
                        <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-xl min-w-[300px] shadow-sm print-border">
                            <Avatar className="h-16 w-16 border-2 border-white shadow-sm bg-white">
                                <AvatarImage src={client.avatar} alt={client.name} />
                                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                    {client.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold leading-none text-black">{client.name}</h2>
                                <div className="text-sm text-gray-500 space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        <span>{client.email}</span>
                                    </div>
                                    {client.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3 w-3" />
                                            <span>{client.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-black">ProFlow Admin</h2>
                            <p className="text-sm text-gray-500">Global Report</p>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 print-border">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Project Value</p>
                        <p className="text-2xl font-bold text-black">₹{totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 bg-green-50/30 print-border">
                        <p className="text-sm font-medium text-green-700 mb-1">Total Paid</p>
                        <p className="text-2xl font-bold text-green-700">₹{totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200 bg-red-50/30 print-border">
                        <p className="text-sm font-medium text-red-700 mb-1">Total Due</p>
                        <p className="text-2xl font-bold text-red-700">₹{totalDue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="flex-grow mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
                        Project History
                        <span className="text-xs font-normal text-gray-500 px-2 py-0.5 rounded-full bg-gray-100 border">
                            {tasks.length} {tasks.length === 1 ? 'Record' : 'Records'}
                        </span>
                    </h3>
                    <div className="w-full overflow-hidden rounded-lg border border-gray-200 print-border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-900 font-semibold">
                                <tr>
                                    <th className="p-3">Project</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Pages</th>
                                    <th className="p-3 text-right">Rate</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3 text-right">Paid</th>
                                    <th className="p-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tasks.length > 0 ? tasks.map((task) => {
                                    const balance = task.total - task.amountPaid;
                                    return (
                                        <tr key={task.id} className="hover:bg-gray-50/50">
                                            <td className="p-3 font-medium text-black">{task.projectName}</td>
                                            <td className="p-3 text-gray-600">{formatDate(task.submissionDate)}</td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium border
                                                    ${task.workStatus === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        task.workStatus === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                    {task.workStatus}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right text-gray-600">{task.pages}</td>
                                            <td className="p-3 text-right text-gray-600">₹{task.rate}</td>
                                            <td className="p-3 text-right font-medium text-black">₹{task.total.toLocaleString()}</td>
                                            <td className="p-3 text-right text-green-600">₹{task.amountPaid.toLocaleString()}</td>
                                            <td className="p-3 text-right font-bold text-gray-900">
                                                {balance > 0 ? `₹${balance.toLocaleString()}` : '-'}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-gray-500">No projects found for this client.</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50 font-semibold text-gray-900">
                                <tr>
                                    <td colSpan={5} className="p-3 text-right">Totals</td>
                                    <td className="p-3 text-right">₹{totalAmount.toLocaleString()}</td>
                                    <td className="p-3 text-right text-green-600">₹{totalPaid.toLocaleString()}</td>
                                    <td className="p-3 text-right text-red-600">₹{totalDue.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="pt-8 border-t border-gray-200 text-sm text-gray-500 mt-auto">
                    <p className="mb-2 font-semibold">Payment Terms: {client?.paymentTerms || 'Net 5'}</p>
                    <p>This is a computer-generated statement. For any queries, please contact support.</p>
                </div>
            </div>
        </div>
    );
}
