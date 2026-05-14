import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface IDCardData {
  employeeId: string;
  fullName: string;
  designation: string;
  department: string;
  email: string;
  joinDate: string;
  photoUrl?: string;
}

export async function generateIDCard(data: IDCardData): Promise<jsPDF> {
  // Standard ID card size: 85.6mm x 54mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 54],
  });

  // Background
  doc.setFillColor(15, 23, 41); // #0f1729
  doc.rect(0, 0, 85.6, 54, 'F');

  // Top accent bar
  doc.setFillColor(59, 130, 246); // #3b82f6
  doc.rect(0, 0, 85.6, 8, 'F');

  // Gradient overlay on top bar
  doc.setFillColor(6, 182, 212); // #06b6d4
  doc.rect(50, 0, 35.6, 8, 'F');

  // Company name on top bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('NexaHR', 5, 5.5);

  // ID Badge subtitle
  doc.setFontSize(5);
  doc.setTextColor(200, 220, 255);
  doc.text('EMPLOYEE IDENTITY CARD', 5, 7.2);

  // Left border accent
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 8, 1.5, 46, 'F');

  // Photo placeholder area
  doc.setFillColor(30, 45, 74); // #1e2d4a
  doc.roundedRect(5, 12, 20, 24, 2, 2, 'F');

  // Photo border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.4);
  doc.roundedRect(5, 12, 20, 24, 2, 2, 'S');

  // If photo URL is provided, try to add it
  if (data.photoUrl) {
    try {
      const img = await loadImage(data.photoUrl);
      doc.addImage(img, 'JPEG', 5.5, 12.5, 19, 23, undefined, 'FAST');
    } catch {
      // Photo placeholder text
      doc.setFontSize(6);
      doc.setTextColor(139, 156, 200);
      doc.text('PHOTO', 11.5, 25);
    }
  } else {
    doc.setFontSize(6);
    doc.setTextColor(139, 156, 200);
    doc.text('PHOTO', 11.5, 25);
  }

  // Employee Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(240, 244, 255); // #f0f4ff
  doc.text(data.fullName, 28, 15);

  // Designation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(59, 130, 246);
  doc.text(data.designation, 28, 19);

  // Department
  doc.setFontSize(6);
  doc.setTextColor(139, 156, 200);
  doc.text(`Department: ${data.department}`, 28, 23.5);

  // Employee ID
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(240, 244, 255);
  doc.text(`ID: ${data.employeeId}`, 28, 28);

  // Join Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(139, 156, 200);
  doc.text(`Joined: ${data.joinDate}`, 28, 31.5);

  // Email
  doc.setFontSize(5);
  doc.text(data.email, 28, 35);

  // QR Code
  const qrData = JSON.stringify({
    id: data.employeeId,
    name: data.fullName,
    designation: data.designation,
    email: data.email,
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#f0f4ff',
        light: '#0f1729',
      },
    });
    doc.addImage(qrDataUrl, 'PNG', 64, 12, 18, 18);
  } catch (error) {
    console.error('QR Code generation failed:', error);
  }

  // QR label
  doc.setFontSize(4);
  doc.setTextColor(139, 156, 200);
  doc.text('Scan to verify', 68.5, 32);

  // Bottom border
  doc.setFillColor(30, 45, 74);
  doc.rect(0, 50, 85.6, 4, 'F');

  // Bottom text
  doc.setFontSize(4);
  doc.setTextColor(100, 120, 160);
  doc.text('This card is the property of NexaHR. If found, please return to the HR department.', 42.8, 52.5, { align: 'center' });

  return doc;
}

async function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
