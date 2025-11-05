
import React, { useState, useCallback, useMemo } from 'react';
import { ServiceRow, Duration, ServiceType } from './types';
import { SoldierIcon, PlusIcon, TrashIcon, PrintIcon, ApprovedIcon } from './components/icons';

const SALARY_MAP: { [key: string]: string } = {
  'دكتوراه': '429000',
  'ماجستير': '374000',
  'بكالوريوس': '296000',
  'دبلوم': '272000',
  'اعدادية': '260000',
  'متوسطة': '210000',
  'ابتدائية': '170000',
  'بدون شهادة': '170000',
};

const App: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [disengagementDate, setDisengagementDate] = useState<string>('');
  const [education, setEducation] = useState<string>('');
  const [salary, setSalary] = useState<string>('');

  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([{ id: Date.now(), serviceType: '', start: '', end: '', duration: null }]);
  const [error, setError] = useState<string | null>(null);

  const handleEducationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEducation = e.target.value;
    setEducation(newEducation);
    if (SALARY_MAP[newEducation]) {
      setSalary(SALARY_MAP[newEducation]);
    } else {
      setSalary('');
    }
  };

  const calculateSingleDuration = useCallback((startStr: string, endStr: string): Duration | null => {
    if (!startStr || !endStr) return null;

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (endDate < startDate) return null;
  
    let y1 = startDate.getFullYear();
    let m1 = startDate.getMonth() + 1;
    let d1 = startDate.getDate();
    
    let y2 = endDate.getFullYear();
    let m2 = endDate.getMonth() + 1;
    let d2 = endDate.getDate();
    
    d2 += 1;

    if (d2 < d1) {
        d2 += 30;
        m2 -= 1;
    }
    if (m2 < m1) {
        m2 += 12;
        y2 -= 1;
    }

    const days = d2 - d1;
    const months = m2 - m1;
    const years = y2 - y1;

    return { years, months, days };
  }, []);
  
  const handleRowChange = useCallback((id: number, field: keyof Omit<ServiceRow, 'id' | 'duration'>, value: string) => {
    setServiceRows(prevRows => 
      prevRows.map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value as ServiceType };
          if (field === 'start' || field === 'end') {
            const duration = calculateSingleDuration(updatedRow.start, updatedRow.end);
            return { ...updatedRow, duration };
          }
          return updatedRow;
        }
        return row;
      })
    );
  }, [calculateSingleDuration]);

  const addRow = useCallback(() => {
    setServiceRows(prevRows => [...prevRows, { id: Date.now(), serviceType: '', start: '', end: '', duration: null }]);
  }, []);

  const removeRow = useCallback((id: number) => {
    setServiceRows(prevRows => prevRows.filter(p => p.id !== id));
  }, []);

  const validateForPrint = () => {
    setError(null);
    for (const row of serviceRows) {
        if (row.start && row.end) {
            if (new Date(row.end) < new Date(row.start)) {
                setError('تاريخ نهاية الخدمة لا يمكن أن يكون قبل تاريخ البداية.');
                return false;
            }
        }
    }
    if (!name) {
        setError('يرجى إدخال الاسم قبل طباعة المستند.');
        return false;
    }
    return true;
  }
  
  const tableHeaders = useMemo(() => ["نوع الخدمة", "من", "إلى", "يوم", "شهر", "سنة", ""], []);

  const validServiceRows = useMemo(() => serviceRows.filter(r => r.duration && r.serviceType), [serviceRows]);

  const tableTotalDuration = useMemo(() => {
    let totalYears = 0;
    let totalMonths = 0;
    let totalDays = 0;

    for (const row of validServiceRows) {
        const multiplier = row.serviceType === 'عسكرية مضاعفة' ? 2 : 1;
        if (row.duration) {
          totalDays += row.duration.days * multiplier;
          totalMonths += row.duration.months * multiplier;
          totalYears += row.duration.years * multiplier;
        }
    }

    totalMonths += Math.floor(totalDays / 30);
    totalDays %= 30;
    totalYears += Math.floor(totalMonths / 12);
    totalMonths %= 12;

    return { years: totalYears, months: totalMonths, days: totalDays };
  }, [validServiceRows]);
  
  const rawPensionDeductionAmount = useMemo(() => {
    if (!salary || !tableTotalDuration) return 0;
    const salaryNumber = Number(salary.replace(/,/g, '')) || 0;

    // Calculate deduction for full months with 10% rate
    const totalMonths = tableTotalDuration.years * 12 + tableTotalDuration.months;
    const monthsDeduction = (totalMonths * salaryNumber) * 0.1;

    // Calculate deduction for remaining days with 10% rate
    const dailyRate = salaryNumber / 30;
    const daysDeduction = (tableTotalDuration.days * dailyRate) * 0.1;

    // Total deduction is the sum of both parts
    const totalDeduction = monthsDeduction + daysDeduction;

    return Math.round(totalDeduction);
  }, [salary, tableTotalDuration]);
  
  const pensionDeductionAmount = useMemo(() => {
    return rawPensionDeductionAmount.toLocaleString('ar-SA');
  }, [rawPensionDeductionAmount]);

  const pensionDeductionAmountInWords = useMemo(() => {
    const amount = rawPensionDeductionAmount;
    const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];
    const convertChunk = (n: number): string => {
        if (n === 0) return '';
        let str = '';
        if (n >= 100) {
            str += hundreds[Math.floor(n / 100)];
            n %= 100;
            if (n > 0) str += ' و';
        }
        if (n >= 10 && n <= 19) {
            str += teens[n - 10];
        } else if (n >= 20) {
            const unit = n % 10;
            const ten = Math.floor(n / 10);
            if (unit > 0) str += units[unit] + ' و' + tens[ten]; else str += tens[ten];
        } else if (n > 0) str += units[n];
        return str;
    };
    const numberToWordsAr = (number: number): string => {
        if (number === 0) return 'صفر';
        const parts = [];
        if (number >= 1000000) {
            const chunk = Math.floor(number / 1000000);
            if (chunk === 1) parts.push('مليون'); else if (chunk === 2) parts.push('مليونان'); else if (chunk >= 3 && chunk <= 10) parts.push(convertChunk(chunk) + ' ملايين'); else parts.push(convertChunk(chunk) + ' مليون');
            number %= 1000000;
        }
        if (number >= 1000) {
            const chunk = Math.floor(number / 1000);
            if (chunk === 1) parts.push('ألف'); else if (chunk === 2) parts.push('ألفان'); else if (chunk >= 3 && chunk <= 10) parts.push(convertChunk(chunk) + ' آلاف'); else parts.push(convertChunk(chunk) + ' ألف');
            number %= 1000;
        }
        if (number > 0) parts.push(convertChunk(number));
        return parts.join(' و');
    };
    const words = numberToWordsAr(amount);
    let currency = 'ديناراً';
    if (amount === 0) currency = 'دينار'; else if (amount === 1) currency = 'دينار'; else if (amount === 2) currency = 'ديناران'; else if (amount >= 3 && amount <= 10) currency = 'دنانير';
    return `${words} ${currency} فقط لا غير`;
  }, [rawPensionDeductionAmount]);

  const toArabicNumerals = (num: number | string): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
  };
  
  const formatDateWithArabicNumerals = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${toArabicNumerals(year)}/${toArabicNumerals(month)}/${toArabicNumerals(day)}`;
  };

  const openPrintPreview = (content: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.title = title;
        printWindow.document.close();
    }
  };

  const handlePrintDecision = () => {
    if (!validateForPrint()) return;
    
    const decisionHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8"/>
          <title>طباعة قرار</title>
          <style>
              body { background-color: #eee; margin: 0; display: flex; justify-content: center; align-items: flex-start; padding-top: 2rem; padding-bottom: 8rem; }
              .a4-page {
                  background: white;
                  width: 21cm;
                  min-height: 29.7cm;
                  padding: 5cm 2cm 4cm;
                  margin: 0 auto;
                  box-sizing: border-box;
                  box-shadow: 0 0 10px rgba(0,0,0,0.2);
                  font-family: Arial, sans-serif;
                  color: #000;
                  font-size: 16px;
              }
              .copy-to-section { font-size: 12px; }
              .decision-subject { font-family: 'Times New Roman', Times, serif; }
              .decision-total-table { width: 100%; margin: 24px auto; border: 2px solid #000; border-collapse: collapse; text-align: center; font-size: 16px; }
              .decision-total-table th, .decision-total-table td { border: 1px solid #000; padding: 6px 8px; text-align: center; color: #000; }
              .print-controls { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; gap: 1rem; padding: 1rem; background-color: rgba(255, 255, 255, 0.95); border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .print-controls button { font-family: system-ui; font-size: 14px; padding: 8px 20px; border-radius: 8px; border: 1px solid #ccc; cursor: pointer; }
              .print-controls button.print-btn { background-color: #2563eb; color: white; border-color: #2563eb; }
              .print-footer { display: none; }
              @media print {
                  @page { size: A4; margin: 0; }
                  body { background-color: #fff; padding: 0; }
                  .a4-page { margin: 0; padding: 5cm 2cm 4cm !important; box-shadow: none; }
                  .print-controls { display: none !important; }
                  .print-footer {
                      display: block;
                      position: fixed;
                      bottom: 15px;
                      left: 2cm;
                      right: 2cm;
                      text-align: left;
                      font-size: 10px;
                      color: #666;
                      border-top: 1px solid #ccc;
                      padding-top: 5px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="print-controls">
              <button onclick="window.close()">إغلاق</button>
              <button class="print-btn" onclick="window.print()">طباعة</button>
          </div>
          <div class="a4-page">
              <div style="text-align: center; margin-bottom: 1.5rem; padding-top: 1rem;">
                  <p style="font-weight: bold; font-size: 1.125rem;">قرار رقم ( ................ )</p>
                  <br />
                  <p style="font-size: 1.125rem; font-weight: bold; margin-top: 0.5rem; text-decoration: underline;" class="decision-subject">م/ احتساب خدمة</p>
                  <br />
              </div>
              <div style="padding: 0 1rem; text-align: right; line-height: 1.625; margin: 2rem 0;">
                  <p>نظراً لتوفر شروط قانون (٩) لسنة ٢٠١٤ فقد صادقنا على احتساب خدمات السيد ( <span style="font-weight: bold;">${name || '................'}</span> ) والمبينة تفاصيلها ادناه من الخدمات التقاعدية:</p>
              </div>
              <table class="decision-total-table">
                  <thead>
                      <tr>
                          <th style="min-width: 150px;">نوع الخدمة</th> <th style="min-width: 90px;">من</th> <th style="min-width: 90px;">إلى</th> <th>يوم</th> <th>شهر</th> <th>سنة</th> <th>الملاحظات</th>
                      </tr>
                  </thead>
                  <tbody>${validServiceRows.map(row => `
                      <tr>
                          <td>${row.serviceType}</td>
                          <td style="white-space: nowrap;">${formatDateWithArabicNumerals(row.start)}</td>
                          <td style="white-space: nowrap;">${formatDateWithArabicNumerals(row.end)}</td>
                          <td>${toArabicNumerals(row.duration?.days ?? 0)}</td> <td>${toArabicNumerals(row.duration?.months ?? 0)}</td> <td>${toArabicNumerals(row.duration?.years ?? 0)}</td>
                          <td></td>
                      </tr>`).join('')}
                  </tbody>
                  <tfoot>
                      <tr style="background-color: #e0e0e0; font-weight: bold;">
                          <td colspan="3" style="text-align: right; padding: 6px 8px;">المجموع</td>
                          <td>${toArabicNumerals(tableTotalDuration.days)}</td> <td>${toArabicNumerals(tableTotalDuration.months)}</td> <td>${toArabicNumerals(tableTotalDuration.years)}</td> <td></td>
                      </tr>
                  </tfoot>
              </table>
              <div style="padding: 1rem; margin-top: 2rem;">
                  <div style="text-align: left; margin-bottom: 2rem;">
                      <p>ع/ مدير عام صندوق تقاعد موظفي الدولة</p>
                      <p style="margin-top: 0.5rem;">مدير صندوق تقاعد موظفي الدولة/فرع البصرة</p>
                      <br />
                  </div>
                  <div style="text-align: right; line-height: 2; margin-bottom: 2rem;">
                      ${rawPensionDeductionAmount > 0 ? `<p>ترتب بذمة المومأ اليه اعلاه مبلغاً قدره (${pensionDeductionAmount} د.ع) فقط (${pensionDeductionAmountInWords}) يسدد لحساب صندوق تقاعد موظفي الدولة وبنسبة ١/٤ (ربع) الراتب التقاعدي الشهري.</p>` : `<p>لا تترتب بذمته اي توقيفات تقاعدية.</p>`}
                  </div>
                  <div class="copy-to-section" style="text-align: right;">
                      <p>نسخة منه الى...</p>
                      <ul style="list-style-type: disc; list-style-position: inside; margin-right: 1rem;">
                          <li>قسم حسابات المتقاعدين/شعبة الاستقطاع</li> <li>فرع هيأة التقاعد الوطنية ،،</li> <li>منظم القرار// ......................</li>
                      </ul>
                  </div>
              </div>
          </div>
          <div class="print-footer"></div>
          <script>
            const footer = document.querySelector('.print-footer');
            if (footer) {
              const now = new Date();
              const formattedDateTime = now.toLocaleString('ar-IQ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
              footer.textContent = 'تمت الطباعة في: ' + formattedDateTime + ' | ' + document.title;
            }
          <\/script>
      </body>
      </html>`;
    openPrintPreview(decisionHtml, 'طباعة قرار');
  };

  const handlePrintForm = () => {
    if (!validateForPrint()) return;

    const formHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8"/>
          <title>طباعة استمارة احتساب الخدمة</title>
          <style>
              body { background-color: #eee; margin: 0; display: flex; justify-content: center; align-items: flex-start; padding-top: 2rem; padding-bottom: 8rem; }
              .a4-page { background: white; width: 21cm; min-height: 29.7cm; margin: 0 auto; box-sizing: border-box; box-shadow: 0 0 10px rgba(0,0,0,0.2); }
              .print-controls { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; gap: 1rem; padding: 1rem; background-color: rgba(255, 255, 255, 0.95); border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .print-controls button { font-family: system-ui; font-size: 14px; padding: 8px 20px; border-radius: 8px; border: 1px solid #ccc; cursor: pointer; }
              .print-controls button.print-btn { background-color: #2563eb; color: white; border-color: #2563eb; }
              .print-footer { display: none; }
              /* Professional Form Layout Styles */
              .professional-form-layout { font-family: 'Times New Roman', Times, serif; color: #000; background-color: #fff; padding: 1.5cm; padding-top: 4cm; padding-bottom: 4cm; }
              .professional-form-layout .form-header { text-align: center; margin-bottom: 1.5rem; }
              .professional-form-layout .form-header h1 { font-size: 22px; font-weight: 900; }
              .professional-form-layout .personal-info-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0; font-size: 14px; line-height: 1.6; margin-bottom: 2rem; }
              .professional-form-layout .info-cell { border: 1px solid #888; padding: 8px; text-align: center; display: flex; align-items: center; justify-content: center; }
              .professional-form-layout .info-cell-label { background-color: #f2f2f2; font-weight: bold; }
              .professional-form-layout .service-table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 14px; }
              .professional-form-layout .service-table th, .professional-form-layout .service-table td { border: 1px solid #333; padding: 8px; text-align: center; color: #000; }
              .professional-form-layout .service-table th { background-color: #f2f2f2; font-weight: bold; }
              .professional-form-layout .service-table tfoot { font-weight: bold; }
              .professional-form-layout .service-table .summary-total-row { background-color: #e3f2fd; color: #0d47a1; }
              .professional-form-layout .deduction-summary-box { margin-top: 1.5rem; padding: 1rem; background: linear-gradient(to bottom, #f0f0f0, #e0e0e0); border: 1.5px solid #000; border-radius: 4px; text-align: center; font-size: 14px; line-height: 1.8; }
              .professional-form-layout .deduction-summary-box strong { display: block; margin-bottom: 0.5rem; font-size: 15px; color: #000; }
              .professional-form-layout .signature-area { margin-top: 4rem; display: flex; justify-content: space-between; font-size: 14px; text-align: center; }
              .professional-form-layout .signature-area .signer { width: 40%; }
              .professional-form-layout .signature-area .signature-line { border-bottom: 1px dotted #000; height: 2.5rem; margin-bottom: 0.5rem; }
              @media print {
                  @page { size: A4; margin: 0; }
                  body { background-color: #fff; padding: 0; }
                  .a4-page { margin: 0; box-shadow: none; }
                  .print-controls { display: none !important; }
                  .print-footer { display: block; position: fixed; bottom: 15px; left: 1.5cm; right: 1.5cm; text-align: left; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 5px; }
              }
          </style>
      </head>
      <body>
          <div class="print-controls">
              <button onclick="window.close()">إغلاق</button>
              <button class="print-btn" onclick="window.print()">طباعة</button>
          </div>
          <div class="a4-page">
            <div class="professional-form-layout">
                <div class="form-header">
                    <h1>استمارة احتساب الخدمة</h1>
                </div>

                <div class="personal-info-grid" style="margin-top: 2rem;">
                    <div class="info-cell info-cell-label" style="grid-column: span 1;">الاسم الكامل</div>
                    <div class="info-cell" style="grid-column: span 2;">${name || '&nbsp;'}</div>
                    <div class="info-cell info-cell-label" style="grid-column: span 1;">تاريخ الميلاد</div>
                    <div class="info-cell" style="grid-column: span 2;">${formatDateWithArabicNumerals(dateOfBirth) || '&nbsp;'}</div>

                    <div class="info-cell info-cell-label" style="grid-column: span 1;">تاريخ التعيين</div>
                    <div class="info-cell" style="grid-column: span 2;">${formatDateWithArabicNumerals(appointmentDate) || '&nbsp;'}</div>
                    <div class="info-cell info-cell-label" style="grid-column: span 1;">تاريخ الانفكاك</div>
                    <div class="info-cell" style="grid-column: span 2;">${formatDateWithArabicNumerals(disengagementDate) || '&nbsp;'}</div>

                    <div class="info-cell info-cell-label" style="grid-column: span 1;">التحصيل الدراسي</div>
                    <div class="info-cell" style="grid-column: span 2;">${education || '&nbsp;'}</div>
                    <div class="info-cell info-cell-label" style="grid-column: span 1;">مقدار الراتب</div>
                    <div class="info-cell" style="grid-column: span 2;">${salary ? Number(salary).toLocaleString('ar-IQ') + ' د.ع' : '&nbsp;'}</div>
                </div>

                <div class="section-title">تفاصيل الخدمة</div>
                <table class="service-table">
                    <thead>
                        <tr><th>نوع الخدمة</th><th>من</th><th>الى</th><th>يوم</th><th>شهر</th><th>سنة</th></tr>
                    </thead>
                    <tbody>${validServiceRows.map(row => `
                        <tr>
                            <td>${row.serviceType}</td>
                            <td>${formatDateWithArabicNumerals(row.start)}</td>
                            <td>${formatDateWithArabicNumerals(row.end)}</td>
                            <td>${toArabicNumerals(row.duration?.days ?? 0)}</td>
                            <td>${toArabicNumerals(row.duration?.months ?? 0)}</td>
                            <td>${toArabicNumerals(row.duration?.years ?? 0)}</td>
                        </tr>`).join('')}
                    </tbody>
                    <tfoot>
                      <tr class="summary-total-row">
                        <td colspan="3">مجموع الخدمة الصافي</td>
                        <td>${toArabicNumerals(tableTotalDuration.days)}</td>
                        <td>${toArabicNumerals(tableTotalDuration.months)}</td>
                        <td>${toArabicNumerals(tableTotalDuration.years)}</td>
                      </tr>
                    </tfoot>
                </table>

                <div class="deduction-summary-box">
                  ${rawPensionDeductionAmount > 0 ? `
                    <strong>مبلغ التوقيفات التقاعدية المترتبة:</strong> 
                    <span>${pensionDeductionAmount} د.ع - (${pensionDeductionAmountInWords})</span>
                  ` : '<strong>لا تترتب بذمته اي توقيفات تقاعدية.</strong>'}
                </div>

                <div class="signature-area">
                    <div class="signer">
                        <div class="signature-line"></div>
                        <p><strong>اسم وتوقيع المنظم</strong></p>
                    </div>
                    <div class="signer">
                        <div class="signature-line"></div>
                        <p><strong>اسم وتوقيع المدقق</strong></p>
                    </div>
                </div>
            </div>
          </div>
          <div class="print-footer"></div>
          <script>
            const footer = document.querySelector('.print-footer');
            if (footer) {
              const now = new Date();
              const formattedDateTime = now.toLocaleString('ar-IQ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
              footer.textContent = 'تمت الطباعة في: ' + formattedDateTime + ' | ' + document.title;
            }
          <\/script>
      </body>
      </html>`;
    openPrintPreview(formHtml, 'طباعة استمارة احتساب الخدمة');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 font-[system-ui]">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          <header className="flex justify-between items-center">
            <div className="text-right text-gray-800 dark:text-gray-200">
              <p className="font-semibold">صندوق تقاعد موظفي الدولة</p>
              <p className="text-sm">فرع البصرة</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center gap-3 text-gray-700 dark:text-gray-200">
                <SoldierIcon className="w-8 h-8"/>
                <h1 className="text-2xl sm:text-3xl font-bold font-kufi">حاسبة احتساب الخدمة</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                أدخل البيانات المطلوبة لحساب مدة الخدمة الإجمالية.
              </p>
            </div>
            <div className="text-right text-gray-800 dark:text-gray-200 invisible">
              <p className="font-semibold">صندوق تقاعد موظفي الدولة</p>
              <p className="text-sm">فرع البصرة</p>
            </div>
          </header>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ادخل الاسم هنا" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 dark:text-gray-100 placeholder-gray-400" />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المواليد</label>
                <input type="date" id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ التعيين</label>
                <input type="date" id="appointmentDate" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label htmlFor="disengagementDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الانفكاك</label>
                <input type="date" id="disengagementDate" value={disengagementDate} onChange={(e) => setDisengagementDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 dark:text-gray-100" />
              </div>
               <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التحصيل الدراسي</label>
                <select id="education" value={education} onChange={handleEducationChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 dark:text-gray-100">
                  <option value="">اختر التحصيل الدراسي</option>
                  {Object.keys(SALARY_MAP).map(level => (<option key={level} value={level}>{level}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مقدار الراتب (د.ع)</label>
                <input type="text" id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="يتم تحديده تلقائياً أو أدخله يدوياً" readOnly={!!SALARY_MAP[education]} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 dark:text-gray-100 read-only:bg-gray-200 dark:read-only:bg-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">فترات الخدمة</h2>
            <div className="space-y-4">
              <div className="hidden sm:grid grid-cols-[1fr,1fr,1fr,auto,auto,auto,auto] gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 px-2">
                {tableHeaders.slice(0, 6).map(header => <span key={header}>{header}</span>)}
              </div>
              {serviceRows.map((row) => (
                <div key={row.id} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,1fr,auto,auto,auto,auto] gap-2 items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/20 transition-colors duration-200">
                  <select value={row.serviceType} onChange={e => handleRowChange(row.id, 'serviceType', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-gray-100 col-span-2 sm:col-span-1">
                    <option value="">اختر النوع</option>
                    <option value="عسكرية">عسكرية</option>
                    <option value="عسكرية مضاعفة">عسكرية مضاعفة</option>
                  </select>
                  <input type="date" value={row.start} onChange={e => handleRowChange(row.id, 'start', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-gray-100" />
                  <input type="date" value={row.end} onChange={e => handleRowChange(row.id, 'end', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-gray-100" />
                  <div className="col-span-1 sm:col-span-3 grid grid-cols-3 gap-1 text-center font-mono text-sm sm:text-base text-gray-800 dark:text-gray-200">
                    <span className="bg-gray-200 dark:bg-gray-600 p-2 rounded-md">{toArabicNumerals(row.duration?.days ?? 0)}</span>
                    <span className="bg-gray-200 dark:bg-gray-600 p-2 rounded-md">{toArabicNumerals(row.duration?.months ?? 0)}</span>
                    <span className="bg-gray-200 dark:bg-gray-600 p-2 rounded-md">{toArabicNumerals(row.duration?.years ?? 0)}</span>
                  </div>
                  <button onClick={() => removeRow(row.id)} aria-label="حذف الفترة" className="flex justify-center items-center text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50 transition-colors p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" disabled={serviceRows.length === 1}>
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addRow} className="mt-4 flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
              <PlusIcon className="w-5 h-5" />
              إضافة فترة خدمة جديدة
            </button>
          </div>
          
           <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
             <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">النتائج</h2>
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-gray-800 dark:text-gray-200">
                <span className="font-bold text-lg">مجموع الخدمة الإجمالي:</span>
                <div className="flex gap-2 text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                  <span>{toArabicNumerals(tableTotalDuration.days)} <span className="text-xs text-gray-500 dark:text-gray-400">يوم</span></span>
                  <span>{toArabicNumerals(tableTotalDuration.months)} <span className="text-xs text-gray-500 dark:text-gray-400">شهر</span></span>
                  <span>{toArabicNumerals(tableTotalDuration.years)} <span className="text-xs text-gray-500 dark:text-gray-400">سنة</span></span>
                </div>
              </div>
            </div>
            {rawPensionDeductionAmount > 0 && (
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-gray-800 dark:text-gray-200">
                    <span className="font-bold text-lg">مبلغ التوقيفات التقاعدية:</span>
                    <div className="text-lg font-mono font-bold text-green-600 dark:text-green-400">
                      {pensionDeductionAmount}
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">د.ع</span>
                    </div>
                  </div>
                </div>
            )}
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-right text-sm text-gray-500 dark:text-gray-400 order-last sm:order-first">
                <p>تصميم</p>
                <p className="font-semibold font-kufi text-yellow-500 dark:text-yellow-400">المبرمج سيف علي</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button onClick={handlePrintForm} className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-800 transition w-full sm:w-auto">
                  <PrintIcon className="w-5 h-5"/>
                  طباعة استمارة احتساب الخدمة
                </button>
                <button onClick={handlePrintDecision} className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 transition w-full sm:w-auto">
                  <ApprovedIcon className="w-5 h-5"/>
                  طباعة القرار
                </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default App;
