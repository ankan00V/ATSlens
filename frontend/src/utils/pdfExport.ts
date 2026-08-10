import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  result: any;
  selectedRole?: string;
  elementId?: string;
}

export async function exportEvaluationPdf({ result, selectedRole, elementId }: ExportPdfOptions): Promise<void> {
  // Option A: Attempt server-side PDF generation endpoint first
  try {
    const API_URL = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${API_URL}/api/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ evaluation_data: result }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ATSlens_Evaluation_Report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }
  } catch (err) {
    console.warn('Backend PDF endpoint unavailable, falling back to client-side jsPDF export:', err);
  }

  // Option B: Client-side canvas capture or jsPDF document generation fallback
  try {
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('ATSlens_Evaluation_Report.pdf');
        return;
      }
    }

    // Direct programmatic jsPDF doc generation fallback
    const pdf = new jsPDF('p', 'pt', 'a4');
    let y = 40;

    // Header
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 595, 70, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ATSlens', 40, 42);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Enterprise AI Assessment Report', 555, 42, { align: 'right' });

    y = 100;
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Evaluation Summary', 40, y);

    y += 24;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Target Role: ${selectedRole ? selectedRole.replace(/_/g, ' ').toUpperCase() : 'Software Engineer'}`, 40, y);
    y += 18;
    pdf.text(`Overall ATS Score: ${result.overall_score || 0} / ${result.max_score || 100}`, 40, y);

    // Category scores
    if (result.category_scores) {
      y += 30;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Section Breakdown', 40, y);
      y += 18;

      Object.entries(result.category_scores).forEach(([key, cat]: [string, any]) => {
        if (y > 750) {
          pdf.addPage();
          y = 40;
        }
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const label = key.replace(/_/g, ' ').toUpperCase();
        pdf.text(`${label}: ${cat.score}/${cat.max}`, 40, y);
        y += 14;
        pdf.setFont('helvetica', 'normal');
        const splitText = pdf.splitTextToSize(cat.evidence || '', 515);
        pdf.text(splitText, 50, y);
        y += splitText.length * 12 + 10;
      });
    }

    // Sub-Scores
    if (result.sub_scores) {
      if (y > 720) {
        pdf.addPage();
        y = 40;
      }
      y += 15;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Granular Sub-Scores', 40, y);
      y += 20;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const sub = result.sub_scores;
      pdf.text(`• Work Experience: ${(sub.work_experience ?? 0).toFixed(1)}`, 50, y); y += 14;
      pdf.text(`• Technical Skills: ${(sub.technical_skills ?? 0).toFixed(1)}`, 50, y); y += 14;
      pdf.text(`• Education: ${(sub.education ?? 0).toFixed(1)}`, 50, y); y += 14;
      pdf.text(`• Project Impact: ${(sub.project_impact ?? 0).toFixed(1)}`, 50, y); y += 14;
    }

    pdf.save('ATSlens_Evaluation_Report.pdf');
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    alert('Failed to export PDF report. Please try again.');
  }
}
