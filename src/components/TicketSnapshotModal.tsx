'use client';

import React from 'react';
import { Task, Client } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface TicketSnapshotModalProps {
    task: Task;
    client?: Client | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function TicketSnapshotModal({ task, client, isOpen, onClose }: TicketSnapshotModalProps) {
    const [isGenerating, setIsGenerating] = React.useState<'jpg' | 'pdf' | 'whatsapp' | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    // DRAWING LOGIC CONSOLIDATED
    const drawToCanvas = React.useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scale = 2;
        const width = 800 * scale;
        const height = 1000 * scale;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        };

        // 1. Clear & Background
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        // 2. Header
        ctx.fillStyle = '#0a0a0a';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1 * scale;
        roundedRect(40 * scale, 40 * scale, 720 * scale, 120 * scale, 20 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2563eb';
        roundedRect(65 * scale, 65 * scale, 70 * scale, 70 * scale, 15 * scale);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.fillRect(80 * scale, 85 * scale, 40 * scale, 5 * scale);
        ctx.fillRect(80 * scale, 98 * scale, 40 * scale, 5 * scale);
        ctx.fillRect(80 * scale, 111 * scale, 40 * scale, 5 * scale);

        // Label
        ctx.font = `bold ${12 * scale}px Arial, sans-serif`;
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('PROJECT MATRIX', 160 * scale, 75 * scale);

        // Title (Project Name) - FIXED OVERFLOW
        const maxTitleWidth = 560 * scale;
        let fontSize = 28 * scale;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;

        // Shrink font size if too long
        while (ctx.measureText(task.projectName).width > maxTitleWidth && fontSize > 18 * scale) {
            fontSize -= 2 * scale;
            ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        }

        let displayTitle = task.projectName;
        // If still too long, add ellipsis
        if (ctx.measureText(displayTitle).width > maxTitleWidth) {
            while (ctx.measureText(displayTitle + '...').width > maxTitleWidth && displayTitle.length > 0) {
                displayTitle = displayTitle.slice(0, -1);
            }
            displayTitle += '...';
        }

        ctx.fillStyle = '#fff';
        ctx.fillText(displayTitle, 160 * scale, 108 * scale);

        // Subtitle
        ctx.font = `bold ${10 * scale}px Arial, sans-serif`;
        ctx.fillStyle = '#666';
        ctx.fillText('OFFICIAL BUSINESS RECORD', 160 * scale, 138 * scale);

        // 3. Stats
        const stats = [
            { l: 'PROJECT ID', v: task.projectNo || 'N/A', c: '#3b82f6' },
            { l: 'STATUS', v: task.workStatus, c: '#10b981' },
            { l: 'SCALE', v: `${task.pages} Pages`, c: '#6366f1' },
            { l: 'PAYMENT', v: task.paymentStatus, c: task.paymentStatus === 'Paid' ? '#10b981' : '#f43f5e' }
        ];

        stats.forEach((s, i) => {
            const x = (40 + (i * 185)) * scale;
            const y = 180 * scale;
            ctx.fillStyle = '#0a0a0a';
            ctx.strokeStyle = '#222';
            roundedRect(x, y, 165 * scale, 85 * scale, 15 * scale);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#666';
            ctx.font = `bold ${9 * scale}px Arial, sans-serif`;
            ctx.textBaseline = 'top';
            ctx.fillText(s.l, x + 15 * scale, y + 15 * scale);

            ctx.fillStyle = s.c;
            ctx.font = `bold ${15 * scale}px Arial, sans-serif`;

            const maxStatWidth = 135 * scale;
            let displayStat = s.v || 'N/A';
            if (ctx.measureText(displayStat).width > maxStatWidth) {
                while (ctx.measureText(displayStat + '...').width > maxStatWidth && displayStat.length > 0) {
                    displayStat = displayStat.slice(0, -1);
                }
                displayStat += '...';
            }
            ctx.fillText(displayStat, x + 15 * scale, y + 45 * scale);
        });

        // 4. Detailed Sections
        const drawBox = (x: number, y: number, title: string, items: { l: string, v: string, c?: string }[], large = false) => {
            ctx.fillStyle = '#444';
            ctx.font = `bold ${10 * scale}px Arial, sans-serif`;
            ctx.textBaseline = 'bottom';
            ctx.fillText(title, x, y - 10 * scale);

            const h = (large ? 200 : 160) * scale;
            ctx.fillStyle = '#0a0a0a';
            ctx.strokeStyle = '#222';
            roundedRect(x, y, 345 * scale, h, 20 * scale);
            ctx.fill();
            ctx.stroke();

            items.forEach((item, i) => {
                const iy = y + (i * 55) * scale;
                if (large && i === 2) {
                    ctx.fillStyle = '#1a1111';
                    roundedRect(x + 2 * scale, iy, 341 * scale, 90 * scale, 18 * scale);
                    ctx.fill();
                }

                ctx.fillStyle = '#666';
                ctx.font = `bold ${9 * scale}px Arial, sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.fillText(item.l, x + 20 * scale, iy + 28 * scale);

                ctx.fillStyle = item.c || '#fff';
                const valFontSize = (item.c && i === 2) ? 22 * scale : 12 * scale;
                ctx.font = `bold ${valFontSize}px Arial, sans-serif`;
                ctx.textAlign = 'right';

                const maxValWidth = 200 * scale; // Leave space for labels
                let displayVal = item.v;
                if (ctx.measureText(displayVal).width > maxValWidth) {
                    while (ctx.measureText(displayVal + '...').width > maxValWidth && displayVal.length > 0) {
                        displayVal = displayVal.slice(0, -1);
                    }
                    displayVal += '...';
                }

                ctx.fillText(displayVal, x + 325 * scale, iy + 28 * scale);
                ctx.textAlign = 'left';

                if (i < items.length - 1 && !(large && i === 1)) {
                    ctx.strokeStyle = '#1a1a1a';
                    ctx.beginPath();
                    ctx.moveTo(x + 20 * scale, iy + 55 * scale);
                    ctx.lineTo(x + 325 * scale, iy + 55 * scale);
                    ctx.stroke();
                }
            });
        };

        drawBox(40 * scale, 310 * scale, 'PROJECT INTELLIGENCE', [
            { l: 'CLIENT PARTNER', v: task.clientName || 'N/A' },
            { l: 'PROJECT LEAD', v: task.assigneeName || 'Expert Team' },
            { l: 'DEADLINE', v: new Date(task.submissionDate || '').toLocaleDateString() }
        ]);

        const rem = task.total - task.amountPaid;
        drawBox(415 * scale, 310 * scale, 'FINANCIAL LEDGER', [
            { l: 'CONTRACT VALUE', v: `₹${task.total.toLocaleString()}` },
            { l: 'SETTLED AMOUNT', v: `₹${task.amountPaid.toLocaleString()}`, c: '#10b981' },
            { l: 'OUTSTANDING', v: `₹${rem.toLocaleString()}`, c: '#f43f5e' }
        ], true);

        // 5. Footer
        ctx.strokeStyle = '#222';
        ctx.beginPath();
        ctx.moveTo(40 * scale, 920 * scale);
        ctx.lineTo(760 * scale, 920 * scale);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(55 * scale, 955 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#333';
        ctx.font = `bold ${9 * scale}px Arial, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText('VERIFIED TRANSACTION RECORD', 75 * scale, 955 * scale);

        ctx.textAlign = 'right';
        ctx.fillText(`ID Trace: ${task.id.toUpperCase().substring(0, 16)}`, 750 * scale, 955 * scale);
    }, [task]);

    // Handle Open/Task change
    React.useEffect(() => {
        if (isOpen) {
            // Tiny delay to ensure canvas ref is bound
            const timer = setTimeout(drawToCanvas, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen, drawToCanvas]);

    const handleAction = async (type: 'jpg' | 'pdf' | 'whatsapp') => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsGenerating(type);

        try {
            const data = canvas.toDataURL('image/jpeg', 0.95);
            const name = `${task.projectNo || 'Ticket'}_${task.projectName}`;

            if (type === 'pdf') {
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(data, 'JPEG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${name}.pdf`);
            } else if (type === 'whatsapp') {
                // Convert canvas to blob for native sharing
                canvas.toBlob(async (blob) => {
                    if (!blob) return;

                    // Check if native Web Share API is available (mobile devices)
                    if (navigator.share && navigator.canShare) {
                        try {
                            const file = new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
                            const shareData = {
                                title: `Project: ${task.projectName}`,
                                text: `Hi ${client?.name || 'there'}, here is your ticket for project: ${task.projectName}`,
                                files: [file]
                            };

                            // Check if we can share files
                            if (navigator.canShare(shareData)) {
                                await navigator.share(shareData);
                            } else {
                                // Fallback: share without file
                                await navigator.share({
                                    title: shareData.title,
                                    text: shareData.text
                                });
                            }
                        } catch (err: any) {
                            // User cancelled or share failed
                            if (err.name !== 'AbortError') {
                                // Fallback to WhatsApp web
                                const link = document.createElement('a');
                                link.href = data;
                                link.download = `${name}.jpg`;
                                link.click();

                                if (client?.phone) {
                                    const phone = client.phone.replace(/\D/g, '');
                                    const msg = encodeURIComponent(`Hi ${client.name}, here is your ticket for project: ${task.projectName}. Attached snapshot for your records.`);
                                    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                                }
                            }
                        }
                    } else {
                        // Desktop or unsupported browser - use WhatsApp web
                        const link = document.createElement('a');
                        link.href = data;
                        link.download = `${name}.jpg`;
                        link.click();

                        if (client?.phone) {
                            const phone = client.phone.replace(/\D/g, '');
                            const msg = encodeURIComponent(`Hi ${client.name}, here is your ticket for project: ${task.projectName}. Attached snapshot for your records.`);
                            window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                        }
                    }
                }, 'image/jpeg', 0.95);
            } else {
                // Regular JPG download
                const link = document.createElement('a');
                link.href = data;
                link.download = `${name}.jpg`;
                link.click();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[95vh] bg-[#050505] border-white/10 p-0 overflow-hidden flex flex-col shadow-2xl">
                <DialogHeader className="p-6 border-b border-white/5 bg-[#0a0a0a] shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Share2 size={20} className="text-blue-500" />
                        Professional Distribution Engine
                    </DialogTitle>
                    <DialogDescription className="text-neutral-500">Industry-standard canvas generation for 100% pixel-perfect documents.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        className="max-w-full h-auto border border-white/10 rounded-xl shadow-2xl"
                        style={{ width: '400px' }}
                    />
                </div>

                <div className="p-6 border-t border-white/5 bg-[#0a0a0a] flex flex-wrap gap-4 justify-end shrink-0">
                    <Button variant="outline" className="border-white/10 text-white" onClick={() => handleAction('jpg')} disabled={!!isGenerating}>
                        {isGenerating === 'jpg' ? <Loader2 className="animate-spin mr-2" size={16} /> : <Download size={16} className="mr-2" />}
                        Download JPG
                    </Button>
                    <Button variant="outline" className="border-white/10 text-white" onClick={() => handleAction('pdf')} disabled={!!isGenerating}>
                        {isGenerating === 'pdf' ? <Loader2 className="animate-spin mr-2" size={16} /> : <FileText size={16} className="mr-2" />}
                        Download PDF
                    </Button>
                    <Button onClick={() => handleAction('whatsapp')} disabled={!!isGenerating} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                        {isGenerating === 'whatsapp' ? <Loader2 className="animate-spin mr-2" size={16} /> : <Share2 size={16} className="mr-2" />}
                        WhatsApp Direct
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
