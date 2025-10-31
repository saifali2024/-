import React, { useState, useCallback, useMemo } from 'react';
import { ServiceRow, Duration, ServiceType } from './types.ts';
import { SoldierIcon, PlusIcon, TrashIcon, PrintIcon, ApprovedIcon, SaifAliLogoIcon } from './components/icons.tsx';

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
        return str