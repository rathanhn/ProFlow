'use client';

import React from 'react';
import { Client, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Download, FileText, Layout, Mail, Phone, MapPin, ChevronRight, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    const isPendingOnly = tasks.length > 0 && tasks.every(t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial');
    const displayTitle = isPendingOnly && reportTitle === "Statement" ? "Pending Payment Statement" : reportTitle;

    const handleDownloadPDF = async () => {
        const element = document.getElementById('report-content');
        if (!element) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = (await import('jspdf'));

            // Store original styles to restore later
            const originalStyle = element.style.cssText;

            // Prepare element for high-res capture without mobile viewport interference
            element.style.width = '210mm';
            element.style.minWidth = '210mm';
            element.style.maxWidth = '210mm';
            element.style.position = 'relative'; // Change from absolute to relative for better height calculation
            element.style.left = '0';
            element.style.top = '0';
            element.style.backgroundColor = 'white';

            // Capture the canvas with optimized settings
            const canvas = await html2canvas(element, {
                scale: 2.5,
                useCORS: true,
                logging: false,
                width: element.offsetWidth,
                height: element.offsetHeight,
                windowWidth: 1200,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('report-content');
                    if (clonedElement) {
                        clonedElement.style.margin = '0';
                        clonedElement.style.padding = '20mm';
                        clonedElement.style.width = '210mm';
                    }
                }
            });

            // Restore original style
            element.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/jpeg', 0.9);

            // A4 dimensions in mm
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

            const imgProps = pdf.getImageProperties(imgData);
            const totalImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightRemaining = totalImgHeight;
            let position = 0;

            // Add pages until all content is rendered
            while (heightRemaining > 0) {
                // Add the image slice to the current page
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');

                heightRemaining -= pdfHeight;
                position -= pdfHeight;

                // If content remains, add a new page
                if (heightRemaining > 0.5) { // Threshold to avoid empty pages from tiny slivers
                    pdf.addPage();
                }
            }

            // High-precision filename
            const clientName = client ? client.name.replace(/[^a-z0-9]/gi, '_') : 'Global';
            const dateStr = new Date().toISOString().split('T')[0];
            const fileName = isPendingOnly
                ? `Pending_Payment_${clientName}_${dateStr}.pdf`
                : `${clientName}_Project_Report_${dateStr}.pdf`;

            pdf.save(fileName);

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('PDF Transmission Error: Please try again or use Print to Save as PDF.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 md:py-16 px-4 md:px-8 font-sans print:p-0 print:bg-white">
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
                        width: 210mm !important;
                        min-height: 297mm;
                        padding: 20mm !important;
                        margin: 0 auto;
                        box-shadow: none !important;
                        position: relative !important;
                        background: white !important;
                    }
                    tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    thead {
                        display: table-header-group !important;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>

            {/* Toolbar */}
            <div className="max-w-[210mm] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 no-print">
                <Button variant="ghost" onClick={() => router.back()} className="w-full sm:w-auto">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={handleDownloadPDF} className="flex-1 sm:flex-none bg-white text-black border border-black hover:bg-gray-100">
                        <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                    <Button onClick={() => window.print()} className="flex-1 sm:flex-none bg-black text-white hover:bg-gray-800">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            {/* A4 Sheet - Scaled Responsive Container for Mobile */}
            <div className="max-w-full overflow-x-auto pb-4 custom-scrollbar">
                <div className="md:hidden flex items-center justify-center gap-2 mb-4 text-gray-500 animate-pulse no-print">
                    <Maximize2 className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Swipe for full statement</span>
                    <ChevronRight className="h-3 w-3" />
                </div>

                <div className="mx-auto bg-white shadow-2xl relative" style={{ width: '210mm' }}>
                    <div
                        id="report-content"
                        className="print-content bg-white flex flex-col"
                        style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
                    >
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight mb-2 text-black">{displayTitle}</h1>
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
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-bold text-black">{client.name}</h2>
                                        <div className="space-y-0.5 mt-1">
                                            {client.email && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Mail className="h-3 w-3" /> {client.email}
                                                </div>
                                            )}
                                            {client.phone && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Phone className="h-3 w-3" /> {client.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-end">
                                    <h2 className="text-xl font-bold text-black tracking-tighter">GLOBAL LEDGER</h2>
                                    <p className="text-[10px] text-gray-400 font-mono">SECTOR REPORT v4.0</p>
                                </div>
                            )}
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-6 mb-12">
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl print-border text-center">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Total</p>
                                <p className="text-xl font-black text-black">₹{totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-green-50 border border-green-100 rounded-xl print-border text-center">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1">Paid</p>
                                <p className="text-xl font-black text-green-700">₹{totalPaid.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-center">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">BAL</p>
                                <p className="text-xl font-black text-white">₹{totalDue.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Projects Table */}
                        <div className="flex-grow mb-8">
                            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-black uppercase tracking-tight">
                                Project Ledger
                                <span className="text-[10px] font-normal text-gray-400 normal-case bg-gray-50 px-2 py-0.5 rounded-full border">{tasks.length} entries</span>
                            </h3>
                            <div className="w-full overflow-hidden rounded-lg border border-gray-200 print-border">
                                <table className="w-full text-[11px] text-left">
                                    <thead className="bg-gray-100 text-gray-900 font-bold uppercase tracking-tighter">
                                        <tr>
                                            <th className="p-3">Project</th>
                                            <th className="p-3">PRJ#</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3 text-center">STAT</th>
                                            <th className="p-3 text-right text-black">PGS</th>
                                            <th className="p-3 text-right text-black">Rate</th>
                                            <th className="p-3 text-right text-black">Total</th>
                                            <th className="p-3 text-right text-green-700">Paid</th>
                                            <th className="p-3 text-right text-black">BAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {tasks.length > 0 ? tasks.map((task) => {
                                            const balance = task.total - task.amountPaid;
                                            return (
                                                <tr key={task.id} className="hover:bg-gray-50/50">
                                                    <td className="p-3 font-semibold text-black leading-tight">{task.projectName}</td>
                                                    <td className="p-3 font-mono text-gray-400">{task.projectNo || 'N/A'}</td>
                                                    <td className="p-3 text-gray-500 whitespace-nowrap">{formatDate(task.submissionDate)}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={cn(
                                                            "inline-block px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-tighter border",
                                                            task.workStatus === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                task.workStatus === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                        )}>
                                                            {task.workStatus === 'Completed' ? 'DONE' : task.workStatus === 'In Progress' ? 'IP' : 'PEND'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right font-medium text-black">{task.pages}</td>
                                                    <td className="p-3 text-right font-medium text-black">₹{task.rate}</td>
                                                    <td className="p-3 text-right font-bold text-black border-l border-gray-50">₹{task.total.toLocaleString()}</td>
                                                    <td className="p-3 text-right font-bold text-green-600">₹{task.amountPaid.toLocaleString()}</td>
                                                    <td className="p-3 text-right font-black text-black bg-gray-50/50">
                                                        {balance > 0 ? `₹${balance.toLocaleString()}` : '0'}
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={9} className="p-12 text-center text-gray-400 italic">No project units located in current partition.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-900 text-white font-black uppercase tracking-tighter text-[12px]">
                                        <tr>
                                            <td colSpan={6} className="p-4 text-right pr-8">AGGREGATE TOTALS</td>
                                            <td className="p-4 text-right">₹{totalAmount.toLocaleString()}</td>
                                            <td className="p-4 text-right text-green-400">₹{totalPaid.toLocaleString()}</td>
                                            <td className="p-4 text-right text-red-400">₹{totalDue.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Footer Notes */}
                        <div className="pt-8 border-t border-gray-200 text-[10px] text-gray-400 mt-auto flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="font-bold text-gray-600 uppercase tracking-widest">Protocol Intelligence</p>
                                <p>System-generated audit statement. Authorized signature not required.</p>
                                <p>Payment Threshold: {client?.paymentTerms || 'Net 5 Cycles'}</p>
                            </div>
                            <div className="text-right italic font-medium">
                                ProFlow Operations Command
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
