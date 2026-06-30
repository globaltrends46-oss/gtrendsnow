import 'dotenv/config';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableCell, TableRow, VerticalAlign, convertInchesToTwip, UnderlineType } from 'docx';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const VAULT_DIR = join(__dirname, '../../web/public/assets/vault');

/**
 * Create vault directory if it doesn't exist
 */
async function ensureVaultDirectory() {
  try {
    await mkdir(VAULT_DIR, { recursive: true });
    logger.info('✅ Vault directory ensured', { path: VAULT_DIR });
  } catch (error) {
    logger.error('❌ Failed to create vault directory', { error: error.message, path: VAULT_DIR });
    throw new Error(`Failed to create vault directory: ${error.message}`);
  }
}

/**
 * Generate Financial_Independence_&_Business_Master.xlsx
 */
async function generateFinancialMasterExcel() {
  logger.info('📊 Generating Financial Independence & Business Master Excel file');

  try {
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Financial Independence Calculator
    const fiSheet = workbook.addWorksheet('FI Calculator');
    fiSheet.columns = [
      { header: 'Parameter', key: 'parameter', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
      { header: 'Notes', key: 'notes', width: 40 },
    ];

    // Style header row
    fiSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    fiSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    fiSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

    // Add data rows
    const fiData = [
      { parameter: 'Current Age', value: 30, notes: 'Your current age' },
      { parameter: 'Retirement Age', value: 50, notes: 'Target retirement age' },
      { parameter: 'Current Annual Income', value: 1000000, notes: 'Annual income in INR' },
      { parameter: 'Annual Expenses', value: 600000, notes: 'Annual living expenses' },
      { parameter: 'Current Savings', value: 5000000, notes: 'Total savings accumulated' },
      { parameter: 'Annual Savings Rate', value: 400000, notes: 'Amount saved per year' },
      { parameter: 'Expected Annual Return %', value: 12, notes: 'Investment return percentage' },
      { parameter: 'Inflation Rate %', value: 6, notes: 'Annual inflation rate' },
    ];

    fiData.forEach((row, index) => {
      const excelRow = fiSheet.addRow(row);
      excelRow.getCell('value').numFmt = '#,##0';
    });

    // Add calculations section
    fiSheet.addRow({});
    const calcHeaderRow = fiSheet.addRow({ parameter: 'CALCULATIONS', value: '', notes: '' });
    calcHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    calcHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: 'FF70AD47' };

    fiSheet.addRow({ parameter: 'Years to Retirement', value: { formula: '=B2-B1' }, notes: 'Calculated years' });
    fiSheet.addRow({ parameter: 'FI Number (25x Annual Expenses)', value: { formula: '=B5*25' }, notes: 'Target corpus needed' });
    fiSheet.addRow({ parameter: 'Monthly Savings Required', value: { formula: '=B7/12' }, notes: 'Monthly savings needed' });

    // Sheet 2: Business Metrics
    const bizSheet = workbook.addWorksheet('Business Metrics');
    bizSheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Month 1', key: 'month1', width: 15 },
      { header: 'Month 2', key: 'month2', width: 15 },
      { header: 'Month 3', key: 'month3', width: 15 },
      { header: 'Average', key: 'average', width: 15 },
    ];

    bizSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    bizSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: 'FF4472C4' };
    bizSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

    const bizMetrics = [
      { metric: 'Revenue', month1: 100000, month2: 120000, month3: 150000 },
      { metric: 'Expenses', month1: 40000, month2: 45000, month3: 50000 },
      { metric: 'Profit', month1: 60000, month2: 75000, month3: 100000 },
      { metric: 'Profit Margin %', month1: 60, month2: 62.5, month3: 66.7 },
      { metric: 'Customer Count', month1: 50, month2: 65, month3: 85 },
      { metric: 'Average Order Value', month1: 2000, month2: 1846, month3: 1765 },
    ];

    bizMetrics.forEach((row, index) => {
      const excelRow = bizSheet.addRow(row);
      excelRow.getCell('average').value = { formula: `=(C${index + 2}+D${index + 2}+E${index + 2})/3` };
      excelRow.getCell('month1').numFmt = '#,##0';
      excelRow.getCell('month2').numFmt = '#,##0';
      excelRow.getCell('month3').numFmt = '#,##0';
      excelRow.getCell('average').numFmt = '#,##0.00';
    });

    // Sheet 3: Investment Portfolio
    const portSheet = workbook.addWorksheet('Portfolio');
    portSheet.columns = [
      { header: 'Asset Class', key: 'asset', width: 25 },
      { header: 'Allocation %', key: 'allocation', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 20 },
      { header: 'Current Value', key: 'value', width: 20 },
      { header: 'Gain/Loss %', key: 'gainloss', width: 15 },
    ];

    portSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    portSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: 'FF4472C4' };
    portSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

    const portfolio = [
      { asset: 'Equity Mutual Funds', allocation: 50, amount: 2500000 },
      { asset: 'Debt Mutual Funds', allocation: 30, amount: 1500000 },
      { asset: 'Real Estate', allocation: 15, amount: 750000 },
      { asset: 'Cash & Fixed Deposits', allocation: 5, amount: 250000 },
    ];

    portfolio.forEach((row, index) => {
      const excelRow = portSheet.addRow(row);
      excelRow.getCell('value').value = { formula: `=C${index + 2}*1.08` }; // Assume 8% growth
      excelRow.getCell('gainloss').value = { formula: `=(D${index + 2}-C${index + 2})/C${index + 2}*100` };
      excelRow.getCell('amount').numFmt = '#,##0';
      excelRow.getCell('value').numFmt = '#,##0';
      excelRow.getCell('gainloss').numFmt = '0.00%';
    });

    // Sheet 4: Retirement Planning
    const retSheet = workbook.addWorksheet('Retirement Planning');
    retSheet.columns = [
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Age', key: 'age', width: 10 },
      { header: 'Annual Contribution', key: 'contribution', width: 20 },
      { header: 'Portfolio Value', key: 'portfolio', width: 20 },
      { header: 'Growth Rate', key: 'growth', width: 15 },
    ];

    retSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    retSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: 'FF4472C4' };

    for (let i = 0; i < 20; i++) {
      const year = 2024 + i;
      const age = 30 + i;
      const contribution = 400000;
      const portfolioValue = 5000000 + (contribution * (i + 1));
      const growth = 12;

      const excelRow = retSheet.addRow({
        year,
        age,
        contribution,
        portfolio: portfolioValue,
        growth,
      });
      excelRow.getCell('contribution').numFmt = '#,##0';
      excelRow.getCell('portfolio').numFmt = '#,##0';
      excelRow.getCell('growth').numFmt = '0.00%';
    }

    const filePath = join(VAULT_DIR, 'Financial_Independence_&_Business_Master.xlsx');
    await workbook.xlsx.writeFile(filePath);
    logger.info('✅ Financial Master Excel file generated', { filePath });
    return filePath;
  } catch (error) {
    logger.error('❌ Failed to generate Financial Master Excel', { error: error.message });
    throw error;
  }
}

/**
 * Generate Freelance_Master_Service_Agreement.docx
 */
async function generateFreelanceAgreementDocx() {
  logger.info('📄 Generating Freelance Master Service Agreement DOCX file');

  try {
    const doc = new Document({
      sections: [
        {
          children: [
            // Title
            new Paragraph({
              text: 'FREELANCE MASTER SERVICE AGREEMENT',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              bold: true,
              size: 28,
            }),

            // Introduction
            new Paragraph({
              text: 'This Freelance Master Service Agreement ("Agreement") is entered into as of [DATE] between:',
              spacing: { after: 200 },
              size: 22,
            }),

            // Service Provider Section
            new Paragraph({
              text: 'SERVICE PROVIDER INFORMATION',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: 'Name: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Business Address: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Email: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Phone: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Tax ID / GST Number: _________________________________________________________________',
              spacing: { after: 300 },
              size: 22,
            }),

            // Client Section
            new Paragraph({
              text: 'CLIENT INFORMATION',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: 'Company Name: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Contact Person: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Business Address: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Email: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Phone: _________________________________________________________________',
              spacing: { after: 300 },
              size: 22,
            }),

            // Section 1: Scope of Work
            new Paragraph({
              text: '1. SCOPE OF WORK',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: 'The Service Provider agrees to provide the following services ("Services"):',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• [Detailed description of Service 1]',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• [Detailed description of Service 2]',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• [Detailed description of Service 3]',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• [Detailed description of Service 4]',
              spacing: { after: 300 },
              size: 22,
            }),

            new Paragraph({
              text: 'Deliverables: The Service Provider will deliver the following tangible outputs:',
              spacing: { after: 100 },
              size: 22,
              bold: true,
            }),

            new Paragraph({
              text: '• [Deliverable 1 with specifications]',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• [Deliverable 2 with specifications]',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• [Deliverable 3 with specifications]',
              spacing: { after: 300 },
              size: 22,
            }),

            // Section 2: Payment Terms
            new Paragraph({
              text: '2. PAYMENT TERMS AND CONDITIONS',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: 'Project Fee: ₹ _________________________________________________________________',
              spacing: { after: 200 },
              size: 22,
            }),

            new Paragraph({
              text: 'Payment Schedule:',
              spacing: { after: 100 },
              bold: true,
              size: 22,
            }),

            new Paragraph({
              text: '• 50% (₹ _____________) upon project initiation and signing of this Agreement',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• 50% (₹ _____________) upon project completion and delivery of all deliverables',
              spacing: { after: 200 },
              size: 22,
            }),

            new Paragraph({
              text: 'Payment Method: Bank transfer, UPI, or as mutually agreed upon.',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Late Payment: If payment is not received within 7 days of invoice date, a late fee of 1.5% per month will be charged on the outstanding balance.',
              spacing: { after: 300 },
              size: 22,
            }),

            // Section 3: Intellectual Property
            new Paragraph({
              text: '3. INTELLECTUAL PROPERTY RIGHTS AND TRANSFER',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: `Upon receipt of full payment, all work product, deliverables, and intellectual property rights (including copyrights, trademarks, and patents) shall be transferred to and owned exclusively by the Client. The Service Provider retains the right to use the work as a portfolio sample with Client's written permission.`,
              spacing: { after: 300 },
              size: 22,
            }),

            // Section 4: Dispute Resolution
            new Paragraph({
              text: '4. DISPUTE RESOLUTION',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: 'In the event of any dispute arising from this Agreement, the parties agree to:',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '1. First attempt to resolve the dispute through good faith negotiation within 14 days.',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '2. If negotiation fails, submit to mediation before pursuing legal action.',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '3. Any legal proceedings shall be governed by the laws of [JURISDICTION] and conducted in the courts of [LOCATION].',
              spacing: { after: 300 },
              size: 22,
            }),

            // Section 5: Confidentiality
            new Paragraph({
              text: '5. CONFIDENTIALITY AND NON-DISCLOSURE',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: 'Both parties agree to maintain strict confidentiality of all proprietary information, trade secrets, business strategies, and sensitive data shared during the course of this engagement. This obligation survives termination of the Agreement for a period of 2 years.',
              spacing: { after: 300 },
              size: 22,
            }),

            // Section 6: Termination
            new Paragraph({
              text: '6. TERMINATION AND CANCELLATION',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: 'Either party may terminate this Agreement with 7 days written notice. Upon termination:',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• The Client remains responsible for payment of all work completed up to the termination date.',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• The Service Provider will deliver all work-in-progress materials to the Client.',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: '• Any prepaid fees for uncompleted work will be refunded on a pro-rata basis.',
              spacing: { after: 300 },
              size: 22,
            }),

            // Section 7: Liability
            new Paragraph({
              text: '7. LIABILITY AND INDEMNIFICATION',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: `The Service Provider's total liability under this Agreement shall not exceed the total fees paid by the Client. The Service Provider shall not be liable for indirect, incidental, or consequential damages. The Client agrees to indemnify the Service Provider against any third-party claims arising from the Client's use of the deliverables.`,
              spacing: { after: 300 },
              size: 22,
            }),

            // Section 8: International Compliance
            new Paragraph({
              text: '8. INTERNATIONAL COMPLIANCE AND REGULATIONS',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: 'This Agreement shall comply with all applicable laws and regulations of [COUNTRY]. If any provision is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.',
              spacing: { after: 400 },
              size: 22,
            }),

            // Signature Section
            new Paragraph({
              text: 'SIGNATURES',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 300 },
              bold: true,
              size: 24,
            }),

            new Paragraph({
              text: 'SERVICE PROVIDER:',
              spacing: { after: 100 },
              bold: true,
              size: 22,
            }),

            new Paragraph({
              text: 'Signature: _________________________________ Date: _________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Printed Name: _________________________________________________________________',
              spacing: { after: 300 },
              size: 22,
            }),

            new Paragraph({
              text: 'CLIENT:',
              spacing: { after: 100 },
              bold: true,
              size: 22,
            }),

            new Paragraph({
              text: 'Signature: _________________________________ Date: _________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Printed Name: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),

            new Paragraph({
              text: 'Title: _________________________________________________________________',
              spacing: { after: 100 },
              size: 22,
            }),
          ],
        },
      ],
    });

    const filePath = join(VAULT_DIR, 'Freelance_Master_Service_Agreement.docx');
    const buffer = await Packer.toBuffer(doc);
    await writeFile(filePath, buffer);
    logger.info('✅ Freelance Agreement DOCX file generated', { filePath });
    return filePath;
  } catch (error) {
    logger.error('❌ Failed to generate Freelance Agreement DOCX', { error: error.message });
    throw error;
  }
}

/**
 * Generate The_Cold_Email_Swipe_Vault.docx
 */
async function generateColdEmailVaultDocx() {
  logger.info('📧 Generating Cold Email Swipe Vault DOCX file');

  try {
    const emailTemplates = [
      {
        title: 'TEMPLATE 1: INITIAL OUTREACH - THE CURIOSITY HOOK',
        subject: 'Quick question about [Company Name]',
        body: `Hi [First Name],

I came across [Company Name] and was impressed by [specific achievement/product]. I noticed you're responsible for [their role/responsibility].

I work with [similar companies] to [specific benefit]. Given your focus on [their goal], I thought it might be worth a quick conversation.

Would you be open to a 15-minute call next week?

Best,
[Your Name]
[Your Title]
[Your Company]
[Your Phone]`,
        tips: `Conversion Tips:
• Keep it short (3-5 sentences max)
• Personalize with specific details about their company
• Lead with value, not your pitch
• Include a clear call-to-action
• Use a professional subject line

A/B Testing Suggestions:
• Test different subject lines (question vs. statement)
• Test different opening hooks (curiosity vs. value)
• Test different CTAs (call vs. meeting vs. email response)`,
      },
      {
        title: 'TEMPLATE 2: FOLLOW-UP (NO RESPONSE) - THE SOFT REMINDER',
        subject: 'Following up - [Company Name]',
        body: `Hi [First Name],

I sent an email last week about [topic] but didn't hear back. No worries if it's not relevant right now.

I'm reaching out because [specific reason related to their business]. If you're interested, I'd love to chat.

If not, no problem at all. Best of luck with [their initiative]!

Best,
[Your Name]`,
        tips: `Conversion Tips:
• Acknowledge the lack of response without being pushy
• Provide a new angle or reason to engage
• Make it easy for them to say no
• Keep it brief and friendly
• Don't be aggressive or desperate

A/B Testing Suggestions:
• Test timing of follow-ups (3 days vs. 7 days vs. 14 days)
• Test different reasons for reaching out
• Test different tone (casual vs. professional)`,
      },
      {
        title: 'TEMPLATE 3: VALUE-FIRST APPROACH - THE INSIGHT SHARE',
        subject: '[Specific insight] for [Company Name]',
        body: `Hi [First Name],

I was researching [industry/topic] and found something that might interest you.

[Share specific insight, data point, or opportunity]

I thought you should know about this. Happy to discuss further if helpful.

Best,
[Your Name]`,
        tips: `Conversion Tips:
• Lead with genuine value, not a pitch
• Share specific, actionable insights
• Make it relevant to their business
• Don't ask for anything in return
• Keep it concise and professional

A/B Testing Suggestions:
• Test different types of insights (data vs. trends vs. opportunities)
• Test different industries and niches
• Test different subject line formats`,
      },
      {
        title: 'TEMPLATE 4: REFERRAL-BASED - THE WARM INTRODUCTION',
        subject: '[Mutual Connection] suggested I reach out',
        body: `Hi [First Name],

[Mutual Connection] mentioned you're working on [specific project/goal]. They thought we should connect.

I specialize in [your expertise] and have helped [similar companies] achieve [specific result].

Would love to explore if there's a fit. Let me know!

Best,
[Your Name]`,
        tips: `Conversion Tips:
• Always get permission from the mutual connection first
• Mention the mutual connection early
• Highlight relevant past successes
• Make it about them, not you
• Include a soft CTA

A/B Testing Suggestions:
• Test different ways of mentioning the mutual connection
• Test different success stories
• Test different CTAs (call vs. meeting vs. coffee)`,
      },
      {
        title: 'TEMPLATE 5: PROBLEM-SOLUTION - THE PAIN POINT TRIGGER',
        subject: 'Solving [specific problem] for [Company Name]',
        body: `Hi [First Name],

I've been working with companies in [industry] who struggle with [specific pain point]. It's costing them [specific impact].

We've developed a solution that [specific benefit]. On average, our clients see [specific result].

Would you be open to a quick conversation about how this might apply to [Company Name]?

Best,
[Your Name]`,
        tips: `Conversion Tips:
• Identify a specific pain point in their industry
• Quantify the impact of the problem
• Show proof of your solution
• Make it relevant to their business
• Include specific metrics

A/B Testing Suggestions:
• Test different pain points
• Test different metrics and results
• Test different industries and company sizes`,
      },
      {
        title: 'TEMPLATE 6: SOCIAL PROOF - THE CASE STUDY ANGLE',
        subject: 'How [Similar Company] achieved [specific result]',
        body: `Hi [First Name],

I recently helped [Similar Company] achieve [specific result]. They were facing [specific challenge] and we implemented [solution].

The results: [specific metrics and outcomes]

Given that [Company Name] is also focused on [their goal], I thought this might be relevant. Would you be interested in learning more?

Best,
[Your Name]`,
        tips: `Conversion Tips:
• Use real case studies with permission
• Include specific metrics and results
• Make it relevant to their industry
• Show proof of your expertise
• Include a soft CTA

A/B Testing Suggestions:
• Test different case studies
• Test different metrics and results
• Test different company sizes and industries`,
      },
      {
        title: 'TEMPLATE 7: URGENCY-BASED - THE TIME-SENSITIVE OFFER',
        subject: 'Limited opportunity for [Company Name]',
        body: `Hi [First Name],

We're currently working with [number] companies in [industry] on [specific initiative]. We have [limited spots] available for the next [timeframe].

Given your focus on [their goal], I thought [Company Name] might be a good fit.

Would you be open to a quick conversation to see if this makes sense?

Best,
[Your Name]`,
        tips: `Conversion Tips:
• Create genuine urgency, not false scarcity
• Be specific about the limitation
• Make it relevant to their business
• Don't be pushy or aggressive
• Include a clear CTA

A/B Testing Suggestions:
• Test different timeframes
• Test different numbers of available spots
• Test different urgency triggers`,
      },
      {
        title: 'TEMPLATE 8: QUESTION-BASED - THE CURIOSITY TRIGGER',
        subject: `Question about [Company Name]'s [specific initiative]`,
        body: `Hi [First Name],

I've been following [Company Name]'s work on [specific initiative]. I had a question about [specific aspect].

[Ask a thoughtful, specific question]

Would love to hear your thoughts on this.

Best,
[Your Name]`,
        tips: `Conversion Tips:
• Ask a genuine, thoughtful question
• Show that you've done your research
• Make it easy to respond
• Don't make it a disguised pitch
• Keep it short and friendly

A/B Testing Suggestions:
• Test different types of questions
• Test different levels of specificity
• Test different industries and companies`,
      },
      {
        title: 'TEMPLATE 9: PARTNERSHIP - THE MUTUAL BENEFIT ANGLE',
        subject: 'Partnership opportunity for [Company Name]',
        body: `Hi [First Name],

I've been impressed by [Company Name]'s work in [specific area]. I think there might be a great partnership opportunity.

We could [specific mutual benefit]. This would help both of us reach [shared goal].

Would you be open to exploring this further?

Best,
[Your Name]`,
        tips: `Conversion Tips:
• Focus on mutual benefits, not just your gain
• Be specific about the partnership opportunity
• Show how it helps both parties
• Make it easy to say yes
• Include a clear next step

A/B Testing Suggestions:
• Test different partnership angles
• Test different mutual benefits
• Test different industries and company sizes`,
      },
      {
        title: 'TEMPLATE 10: PERSONALIZED RESEARCH - THE DEEP DIVE',
        subject: `Thoughts on [Company Name]'s [specific initiative]`,
        body: `Hi [First Name],

I spent some time researching [Company Name] and your recent [specific initiative]. I noticed [specific observation].

I think [specific insight or suggestion]. This could help you [specific benefit].

Would you be open to a quick conversation about this?

Best,
[Your Name]`,
        tips: `Conversion Tips:
• Show genuine research and effort
• Provide specific, actionable insights
• Make it about them, not you
• Demonstrate expertise
• Include a soft CTA

A/B Testing Suggestions:
• Test different levels of research depth
• Test different insights and suggestions
• Test different industries and company sizes`,
      },
    ];

    const children = [
      // Title
      new Paragraph({
        text: 'THE COLD EMAIL SWIPE VAULT',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        bold: true,
        size: 28,
      }),

      new Paragraph({
        text: 'Professional Cold Email Templates for B2B Outreach',
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        italics: true,
        size: 22,
      }),

      new Paragraph({
        text: 'Introduction',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
        bold: true,
        size: 24,
      }),

      new Paragraph({
        text: 'This comprehensive vault contains 10 proven cold email templates designed to help you reach decision-makers and generate quality leads. Each template includes subject lines, body copy with placeholders, conversion tips, and A/B testing suggestions.',
        spacing: { after: 300 },
        size: 22,
      }),
    ];

    // Add each email template
    emailTemplates.forEach((template, index) => {
      children.push(
        new Paragraph({
          text: template.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
          bold: true,
          size: 24,
        })
      );

      children.push(
        new Paragraph({
          text: `Subject Line: ${template.subject}`,
          spacing: { after: 100 },
          bold: true,
          size: 22,
        })
      );

      children.push(
        new Paragraph({
          text: template.body,
          spacing: { after: 200 },
          size: 22,
        })
      );

      children.push(
        new Paragraph({
          text: template.tips,
          spacing: { after: 300 },
          size: 20,
          italics: true,
        })
      );

      // Add page break between templates (except after last one)
      if (index < emailTemplates.length - 1) {
        children.push(
          new Paragraph({
            text: '',
            pageBreakBefore: true,
          })
        );
      }
    });

    // Add best practices section
    children.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true,
      })
    );

    children.push(
      new Paragraph({
        text: 'COLD EMAIL BEST PRACTICES',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
        bold: true,
        size: 24,
      })
    );

    const bestPractices = [
      '✓ Keep it short (3-5 sentences max) - Respect their time',
      '✓ Personalize with specific details - Show you did your research',
      '✓ Lead with value, not your pitch - Make it about them',
      '✓ Include a clear call-to-action - Tell them what to do next',
      '✓ Use a professional subject line - Make them want to open it',
      '✓ Follow up 3-5 times with different angles - Persistence pays off',
      '✓ Test and optimize your templates - Data-driven improvements',
      '✓ Segment your audience - Different messages for different people',
      '✓ Use a professional email address - Build credibility',
      '✓ Avoid spam triggers - Don\'t use excessive caps or exclamation marks',
      '✓ Include social proof - Show proof of your expertise',
      '✓ Make it easy to respond - Ask simple yes/no questions',
      '✓ Respect their time - Don\'t ask for too much upfront',
      '✓ Follow up consistently - Most deals close on follow-up',
      '✓ Track your metrics - Monitor open rates, click rates, and conversions',
    ];

    bestPractices.forEach((practice) => {
      children.push(
        new Paragraph({
          text: practice,
          spacing: { after: 100 },
          size: 22,
        })
      );
    });

    const doc = new Document({
      sections: [
        {
          children,
        },
      ],
    });

    const filePath = join(VAULT_DIR, 'The_Cold_Email_Swipe_Vault.docx');
    const buffer = await Packer.toBuffer(doc);
    await writeFile(filePath, buffer);
    logger.info('✅ Cold Email Swipe Vault DOCX file generated', { filePath });
    return filePath;
  } catch (error) {
    logger.error('❌ Failed to generate Cold Email Swipe Vault DOCX', { error: error.message });
    throw error;
  }
}

/**
 * Generate SEO_Audit_100_Point_Checklist.xlsx
 */
async function generateSeoChecklistExcel() {
  logger.info('🔍 Generating SEO Audit 100-Point Checklist Excel file');

  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('SEO Audit Checklist');

    sheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Item #', key: 'itemNum', width: 10 },
      { header: 'Audit Item', key: 'item', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Notes', key: 'notes', width: 30 },
    ];

    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: 'FF4472C4' };
    sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

    const seoItems = [
      // Technical SEO (1-25)
      { category: 'Technical SEO', itemNum: 1, item: 'Website is mobile-responsive', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 2, item: 'Page load speed < 3 seconds', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 3, item: 'SSL certificate installed (HTTPS)', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 4, item: 'XML sitemap created and submitted', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 5, item: 'Robots.txt file configured', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 6, item: 'Canonical tags implemented', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 7, item: 'No duplicate content issues', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 8, item: 'Structured data markup (Schema.org)', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 9, item: 'Open Graph tags implemented', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 10, item: 'Twitter Card tags added', status: '☐', priority: 'Low' },
      { category: 'Technical SEO', itemNum: 11, item: 'Broken links fixed', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 12, item: 'Redirect chains eliminated', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 13, item: 'Core Web Vitals optimized', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 14, item: 'JavaScript rendering tested', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 15, item: 'CSS/JS files minified', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 16, item: 'Images optimized and compressed', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 17, item: 'CDN implemented', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 18, item: 'Caching strategy implemented', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 19, item: 'Server response time < 200ms', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 20, item: 'No 404 errors on important pages', status: '☐', priority: 'High' },
      { category: 'Technical SEO', itemNum: 21, item: 'Hreflang tags for multi-language', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 22, item: 'AMP pages implemented (if applicable)', status: '☐', priority: 'Low' },
      { category: 'Technical SEO', itemNum: 23, item: 'Security headers configured', status: '☐', priority: 'Medium' },
      { category: 'Technical SEO', itemNum: 24, item: 'Favicon configured', status: '☐', priority: 'Low' },
      { category: 'Technical SEO', itemNum: 25, item: 'Breadcrumb navigation implemented', status: '☐', priority: 'Medium' },

      // On-Page SEO (26-50)
      { category: 'On-Page SEO', itemNum: 26, item: 'Unique meta titles (50-60 chars)', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 27, item: 'Unique meta descriptions (150-160 chars)', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 28, item: 'H1 tag present and unique', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 29, item: 'H2-H6 tags used properly', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 30, item: 'Keyword in first 100 words', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 31, item: 'Keyword density 1-2%', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 32, item: 'LSI keywords included', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 33, item: 'Internal links (3-5 per page)', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 34, item: 'Anchor text optimized', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 35, item: 'Image alt text descriptive', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 36, item: 'Content length > 300 words', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 37, item: 'Content is original and unique', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 38, item: 'Content is well-formatted', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 39, item: 'Call-to-action present', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 40, item: 'URL is SEO-friendly', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 41, item: 'URL length < 75 characters', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 42, item: 'Date published/updated visible', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 43, item: 'Author information included', status: '☐', priority: 'Low' },
      { category: 'On-Page SEO', itemNum: 44, item: 'Related posts linked', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 45, item: 'Table of contents for long content', status: '☐', priority: 'Low' },
      { category: 'On-Page SEO', itemNum: 46, item: 'Video embedded (if applicable)', status: '☐', priority: 'Low' },
      { category: 'On-Page SEO', itemNum: 47, item: 'FAQ schema implemented', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 48, item: 'Product schema (if e-commerce)', status: '☐', priority: 'High' },
      { category: 'On-Page SEO', itemNum: 49, item: 'Review schema (if applicable)', status: '☐', priority: 'Medium' },
      { category: 'On-Page SEO', itemNum: 50, item: 'Readability score > 60', status: '☐', priority: 'Medium' },

      // Off-Page SEO (51-75)
      { category: 'Off-Page SEO', itemNum: 51, item: 'Backlinks from authority sites', status: '☐', priority: 'High' },
      { category: 'Off-Page SEO', itemNum: 52, item: 'No toxic backlinks', status: '☐', priority: 'High' },
      { category: 'Off-Page SEO', itemNum: 53, item: 'Backlink anchor text varied', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 54, item: 'Backlinks from relevant sites', status: '☐', priority: 'High' },
      { category: 'Off-Page SEO', itemNum: 55, item: 'Domain authority > 30', status: '☐', priority: 'High' },
      { category: 'Off-Page SEO', itemNum: 56, item: 'Page authority > 20', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 57, item: 'Social media presence', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 58, item: 'Social signals tracked', status: '☐', priority: 'Low' },
      { category: 'Off-Page SEO', itemNum: 59, item: 'Brand mentions monitored', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 60, item: 'Guest posting strategy', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 61, item: 'Directory submissions', status: '☐', priority: 'Low' },
      { category: 'Off-Page SEO', itemNum: 62, item: 'Local citations (if applicable)', status: '☐', priority: 'High' },
      { category: 'Off-Page SEO', itemNum: 63, item: 'Google My Business optimized', status: '☐', priority: 'High' },
      { category: 'Off-Page SEO', itemNum: 64, item: 'Reviews and ratings managed', status: '☐', priority: 'High' },
      { category: 'Off-Page SEO', itemNum: 65, item: 'Press releases distributed', status: '☐', priority: 'Low' },
      { category: 'Off-Page SEO', itemNum: 66, item: 'Influencer partnerships', status: '☐', priority: 'Low' },
      { category: 'Off-Page SEO', itemNum: 67, item: 'Podcast mentions', status: '☐', priority: 'Low' },
      { category: 'Off-Page SEO', itemNum: 68, item: 'Video backlinks', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 69, item: 'Infographic backlinks', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 70, item: 'Resource page links', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 71, item: 'Competitor backlink analysis', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 72, item: 'Link velocity monitored', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 73, item: 'Disavow file created (if needed)', status: '☐', priority: 'High' },
      { category: 'Off-Page SEO', itemNum: 74, item: 'Referral traffic tracked', status: '☐', priority: 'Medium' },
      { category: 'Off-Page SEO', itemNum: 75, item: 'Brand authority building', status: '☐', priority: 'High' },

      // Content & UX (76-100)
      { category: 'Content & UX', itemNum: 76, item: 'Content calendar maintained', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 77, item: 'Content updated regularly', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 78, item: 'Evergreen content created', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 79, item: 'Seasonal content planned', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 80, item: 'User engagement metrics tracked', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 81, item: 'Bounce rate < 50%', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 82, item: 'Average session duration > 2 min', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 83, item: 'Pages per session > 2', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 84, item: 'Navigation is intuitive', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 85, item: 'Search functionality works', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 86, item: 'Forms are optimized', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 87, item: 'CTA buttons prominent', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 88, item: 'Contact information visible', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 89, item: 'Privacy policy present', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 90, item: 'Terms of service present', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 91, item: 'Accessibility (WCAG) compliant', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 92, item: 'Font sizes readable', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 93, item: 'Color contrast sufficient', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 94, item: 'Analytics properly configured', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 95, item: 'Conversion tracking set up', status: '☐', priority: 'High' },
      { category: 'Content & UX', itemNum: 96, item: 'A/B testing implemented', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 97, item: 'Heatmap analysis done', status: '☐', priority: 'Low' },
      { category: 'Content & UX', itemNum: 98, item: 'User feedback collected', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 99, item: 'Competitor content analysis', status: '☐', priority: 'Medium' },
      { category: 'Content & UX', itemNum: 100, item: 'SEO roadmap created', status: '☐', priority: 'High' },
    ];

    seoItems.forEach((row) => {
      const excelRow = sheet.addRow(row);
      excelRow.alignment = { vertical: 'center' };
    });

    // Add summary section
    sheet.addRow({});
    const summaryRow = sheet.addRow({ category: 'SUMMARY', itemNum: '', item: 'Total Items Completed', status: { formula: 'COUNTIF(D2:D101,"✓")' }, priority: '' });
    summaryRow.font = { bold: true };
    summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: 'FFF2F2F2' };

    const filePath = join(VAULT_DIR, 'SEO_Audit_100_Point_Checklist.xlsx');
    await workbook.xlsx.writeFile(filePath);
    logger.info('✅ SEO Audit Checklist Excel file generated', { filePath });
    return filePath;
  } catch (error) {
    logger.error('❌ Failed to generate SEO Audit Checklist Excel', { error: error.message });
    throw error;
  }
}

/**
 * Main function to generate all vault files
 */
export async function generateVaultFiles() {
  logger.info('🚀 Starting vault files generation');

  try {
    // Ensure vault directory exists
    await ensureVaultDirectory();

    // Generate all files
    const filePaths = {};

    filePaths.financialMaster = await generateFinancialMasterExcel();
    filePaths.freelanceAgreement = await generateFreelanceAgreementDocx();
    filePaths.coldEmailVault = await generateColdEmailVaultDocx();
    filePaths.seoChecklist = await generateSeoChecklistExcel();

    logger.info('✅ All vault files generated successfully', { filePaths });

    return {
      success: true,
      message: 'All vault files generated successfully',
      files: {
        financialMaster: {
          name: 'Financial_Independence_&_Business_Master.xlsx',
          path: filePaths.financialMaster,
        },
        freelanceAgreement: {
          name: 'Freelance_Master_Service_Agreement.docx',
          path: filePaths.freelanceAgreement,
        },
        coldEmailVault: {
          name: 'The_Cold_Email_Swipe_Vault.docx',
          path: filePaths.coldEmailVault,
        },
        seoChecklist: {
          name: 'SEO_Audit_100_Point_Checklist.xlsx',
          path: filePaths.seoChecklist,
        },
      },
      vaultDirectory: VAULT_DIR,
    };
  } catch (error) {
    logger.error('❌ Vault files generation failed', { error: error.message });
    throw error;
  }
}