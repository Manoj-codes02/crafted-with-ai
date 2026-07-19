const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

/**
 * Generate a beautiful PDF emergency report
 * @param {Object} assessment Assessment object containing AI response
 * @param {Object} medicalProfile User's medical profile
 * @param {Object} user User's accounts details
 * @param {String} outputPath Path to save the generated PDF
 */
const generateEmergencyReportPdf = async (assessment, medicalProfile, user, outputPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      // Colors
      const primaryColor = '#0f8bf2'; // Medical Blue
      const textColor = '#1e293b'; // Slate 800
      const lightBg = '#f8fafc'; // Slate 50
      const borderTheme = '#e2e8f0'; // Slate 200

      // Risk Colors
      let riskColor = '#22c55e'; // Green (Low)
      if (assessment.riskLevel === 'Moderate') riskColor = '#f59e0b'; // Amber
      if (assessment.riskLevel === 'Critical') riskColor = '#ef4444'; // Red

      // Draw Top Banner
      doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);
      
      // Header Text
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(24)
         .text('ResQAI EMERGENCY REPORT', 50, 30);
         
      doc.fontSize(10)
         .font('Helvetica')
         .text('AI-Powered Emergency Triage & Disaster Response Assistant', 50, 60);

      // Document ID & Date (Right aligned)
      doc.fillColor('#ffffff')
         .fontSize(9)
         .text(`Report ID: ${assessment._id}`, 400, 35, { align: 'right', width: 140 })
         .text(`Date: ${new Date(assessment.createdAt).toLocaleString()}`, 400, 50, { align: 'right', width: 140 });

      // Patient Info Section
      doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text('Patient Information', 50, 120);
      doc.moveTo(50, 138).lineTo(540, 138).strokeColor(borderTheme).stroke();

      // Info Grid
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('Name:', 50, 150);
      doc.font('Helvetica').fillColor(textColor).text(user.name, 110, 150);

      doc.font('Helvetica-Bold').fillColor('#64748b').text('Age / Gender:', 230, 150);
      doc.font('Helvetica').fillColor(textColor).text(`${assessment.age} yrs / ${assessment.gender}`, 310, 150);

      doc.font('Helvetica-Bold').fillColor('#64748b').text('Blood Group:', 410, 150);
      doc.font('Helvetica').fillColor(textColor).text(medicalProfile?.bloodGroup || 'Unknown', 490, 150);

      // Triage Summary Section
      doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text('Triage & Risk Assessment', 50, 185);
      doc.moveTo(50, 203).lineTo(540, 203).strokeColor(borderTheme).stroke();

      // Risk Box
      doc.rect(50, 215, 490, 45).fill(lightBg);
      
      doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('Risk Level:', 65, 230);
      
      // Color coded risk label
      doc.fillColor(riskColor).fontSize(14).font('Helvetica-Bold').text(assessment.riskLevel.toUpperCase(), 135, 228);

      doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(`Priority: ${assessment.aiResponse.estimated_priority || 'N/A'}`, 250, 232);
      doc.text(`Confidence: ${Math.round((assessment.aiResponse.confidence || 0.9) * 100)}%`, 410, 232);

      // Chief Complaint & Symptoms
      doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('Chief Complaint & Symptoms:', 50, 275);
      doc.font('Helvetica').fontSize(10).text(assessment.symptoms, 50, 290, { width: 490 });

      // Possible Conditions
      doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('Possible Clinical Findings:', 50, 325);
      const conditionsText = (assessment.aiResponse.possible_conditions || []).join(', ');
      doc.font('Helvetica').fontSize(10).text(conditionsText || 'None identified', 50, 340, { width: 490 });

      // Medical History & Profile (Static snapshot)
      doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('Active Medical History / Allergies:', 50, 375);
      const allergiesText = medicalProfile?.allergies?.join(', ') || 'No known allergies';
      const historyText = medicalProfile?.chronicDiseases?.join(', ') || 'No chronic diseases reported';
      doc.font('Helvetica').fontSize(10).text(`Allergies: ${allergiesText} | Conditions: ${historyText}`, 50, 390, { width: 490 });

      // First Aid Instructions (Col 1)
      doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold').text('Immediate First Aid Instructions', 50, 420);
      doc.moveTo(50, 435).lineTo(285, 435).strokeColor(borderTheme).stroke();

      let firstAidY = 445;
      (assessment.aiResponse.first_aid || []).forEach((step, idx) => {
        doc.fontSize(9).font('Helvetica').text(`${idx + 1}. ${step}`, 50, firstAidY, { width: 235 });
        firstAidY += doc.heightOfString(`${idx + 1}. ${step}`, { width: 235 }) + 5;
      });

      // Next Actions & Warning Signs (Col 2)
      doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold').text('Warnings & Recommendations', 305, 420);
      doc.moveTo(305, 435).lineTo(540, 435).strokeColor(borderTheme).stroke();

      let recommendY = 445;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(riskColor).text('WARNING SIGNS:', 305, recommendY);
      recommendY += 12;
      (assessment.aiResponse.warning_signs || []).forEach((sign) => {
        doc.font('Helvetica').fontSize(8.5).fillColor(textColor).text(`* ${sign}`, 305, recommendY, { width: 235 });
        recommendY += doc.heightOfString(`* ${sign}`, { width: 235 }) + 4;
      });

      recommendY += 10;
      doc.font('Helvetica-Bold').fillColor(primaryColor).text('RECOMMENDED NEXT STEPS:', 305, recommendY);
      recommendY += 12;
      (assessment.aiResponse.next_steps || []).forEach((step) => {
        doc.font('Helvetica').fontSize(8.5).fillColor(textColor).text(`- ${step}`, 305, recommendY, { width: 235 });
        recommendY += doc.heightOfString(`- ${step}`, { width: 235 }) + 4;
      });

      // Bottom Area: QR Code and Medical Disclaimers
      const bottomY = 630;
      doc.moveTo(50, bottomY - 10).lineTo(540, bottomY - 10).strokeColor(borderTheme).stroke();

      // Generate Emergency QR Code content
      const qrData = {
        name: user.name,
        bloodGroup: medicalProfile?.bloodGroup || 'Unknown',
        allergies: medicalProfile?.allergies || [],
        chronicDiseases: medicalProfile?.chronicDiseases || [],
        medications: medicalProfile?.currentMedications || [],
        policy: medicalProfile?.insurancePolicyNo || 'None'
      };

      try {
        const qrString = JSON.stringify(qrData);
        const qrDataUrl = await QRCode.toDataURL(qrString, { margin: 1, width: 90 });
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, 50, bottomY, { width: 90 });
      } catch (qrErr) {
        console.error('QR code generation failed in PDF:', qrErr.message);
      }

      // QR label
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#64748b')
         .text('SCAN FOR PATIENT PROFILE', 50, bottomY + 95, { align: 'center', width: 90 });

      // Disclaimer on the bottom right
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .fillColor('#94a3b8')
         .text('MEDICAL DISCLAIMER: This report is generated by an artificial intelligence triage service. It is designed to assist emergency staff and first-responders with key info, and does NOT constitute a final medical diagnosis. Always consult physical physicians and call local emergencies immediately in threat-to-life situations.', 160, bottomY + 10, { width: 380, align: 'justify' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateEmergencyReportPdf,
};
