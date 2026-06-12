
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ServiceRow, Duration, ServiceType, User } from './types';
import { SoldierIcon, PlusIcon, TrashIcon, PrintIcon, ApprovedIcon, UserIcon, LogOutIcon } from './components/icons';
import { ManageUsersModal } from './components/ManageUsersModal';

const CustomDateInput = ({ id, value, onChange, className }: { id?: string, value: string, onChange: (e: any) => void, className?: string }) => {
  const [d, setD] = useState('');
  const [m, setM] = useState('');
  const [y, setY] = useState('');

  React.useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setY(parts[0]);
        setM(parts[1]);
        setD(parts[2]);
      }
    } else {
      setY('');
      setM('');
      setD('');
    }
  }, [value]);

  const triggerChange = (newY: string, newM: string, newD: string) => {
    if (newY.length === 4 && newM.length > 0 && newD.length > 0) {
      const yy = newY.padStart(4, '0');
      const mm = newM.padStart(2, '0');
      const dd = newD.padStart(2, '0');
      onChange({ target: { value: `${yy}-${mm}-${dd}` } });
    } else {
      onChange({ target: { value: '' } });
    }
  };

  const handleD = (e: any) => { 
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setD(val); 
    triggerChange(y, m, val); 
  };
  const handleM = (e: any) => { 
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setM(val); 
    triggerChange(y, val, d); 
  };
  const handleY = (e: any) => { 
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setY(val); 
    triggerChange(val, m, d); 
  };

  const containerClassName = className ? className.replace(/focus:/g, 'focus-within:') : 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md';

  return (
    <div 
      className={`relative flex items-center justify-start font-mono ${containerClassName}`}
      dir="rtl"
    >
      <input id={id} type="text" inputMode="numeric" placeholder="يوم" value={d} onChange={handleD} className="w-8 sm:w-10 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 py-0" />
      <span className="text-gray-400 mx-1">/</span>
      <input type="text" inputMode="numeric" placeholder="شهر" value={m} onChange={handleM} className="w-8 sm:w-10 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 py-0" />
      <span className="text-gray-400 mx-1">/</span>
      <input type="text" inputMode="numeric" placeholder="سنة" value={y} onChange={handleY} className="w-12 sm:w-14 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 py-0" />
      
      <div className="flex-1"></div>
      
      <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input 
          type="date" 
          value={value}
          onChange={(e) => onChange(e)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          aria-label="اختر التاريخ من التقويم"
        />
      </div>
    </div>
  );
};

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

const defaultUsers: User[] = [
  { id: '1', fullName: 'المدير العام', username: 'admin', password: '123', role: 'admin', createdAt: Date.now() },
];

const loadUsers = (): User[] => {
  const usersStr = localStorage.getItem('appUsers');
  if (usersStr) {
    try {
      return JSON.parse(usersStr);
    } catch { }
  }
  return defaultUsers;
};

const LoginScreen: React.FC<{ onLogin: (user: User) => void, users: User[] }> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }
    const user = users.find(u => u.username === username.trim() && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 font-[system-ui]" dir="rtl">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SoldierIcon className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold font-kufi text-gray-800 dark:text-white">تسجيل الدخول</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">نظام احتساب الخدمة العسكرية</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المستخدم</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:text-white"
              placeholder="ادخل اسم المستخدم"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-800"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cuStr = localStorage.getItem('currentUserObj');
    if (cuStr) {
      try {
        return JSON.parse(cuStr);
      } catch {}
    }
    return null;
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('appUsers', JSON.stringify(users));
  }, [users]);

  const handleLogin = (user: User) => {
    localStorage.setItem('currentUserObj', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUserObj');
    setCurrentUser(null);
  };

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

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
    if (endDate < startDate) return null;
  
    const y1 = startDate.getFullYear();
    const m1 = startDate.getMonth() + 1;
    let d1 = startDate.getDate();
    if (d1 === 31) d1 = 30;
    
    const y2 = endDate.getFullYear();
    const m2 = endDate.getMonth() + 1;
    let d2 = endDate.getDate();
    if (d2 === 31) d2 = 30;
    
    let days = d2 - d1;
    let months = m2 - m1;
    let years = y2 - y1;

    if (days < 0) {
      days += 30;
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }

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
        const multiplier = row.serviceType === 'حركات' ? 2 : 1;
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

  const totalServiceInWords = useMemo(() => {
    const { days, months, years } = tableTotalDuration;
    
    const numToArabicMasculine = (n: number) => {
      const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
      const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
      const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      const unit = n % 10;
      const ten = Math.floor(n / 10);
      return (unit > 0 ? units[unit] + ' و' : '') + tens[ten];
    };

    const numToArabicFeminine = (n: number) => {
      const unitsFeminine = ['', 'إحدى', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع'];
      const teensFeminine = ['عشرة', 'إحدى عشرة', 'اثنتا عشرة', 'ثلاث عشرة', 'أربع عشرة', 'خمس عشرة', 'ست عشرة', 'سبع عشرة', 'ثماني عشرة', 'تسع عشرة'];
      const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
      if (n < 10) return unitsFeminine[n];
      if (n < 20) return teensFeminine[n - 10];
      const unit = n % 10;
      const ten = Math.floor(n / 10);
      return (unit > 0 ? unitsFeminine[unit] + ' و' : '') + tens[ten];
    };

    const result = [];
    
    const yearsWords: Record<number, string> = {
      1: 'سنة واحدة', 2: 'سنتان', 3: 'ثلاث سنوات', 4: 'أربع سنوات', 5: 'خمس سنوات',
      6: 'ست سنوات', 7: 'سبع سنوات', 8: 'ثمان سنوات', 9: 'تسع سنوات', 10: 'عشر سنوات'
    };
    if (years > 0) {
      if (years <= 10) result.push(yearsWords[years]);
      else result.push(numToArabicFeminine(years) + ' سنة');
    }

    const monthsWords: Record<number, string> = {
      1: 'شهر واحد', 2: 'شهران', 3: 'ثلاثة أشهر', 4: 'أربعة أشهر', 5: 'خمسة أشهر',
      6: 'ستة أشهر', 7: 'سبعة أشهر', 8: 'ثمانية أشهر', 9: 'تسعة أشهر', 10: 'عشرة أشهر'
    };
    if (months > 0) {
      if (months <= 10) result.push(monthsWords[months]);
      else result.push(numToArabicMasculine(months) + ' شهراً');
    }

    const daysWords: Record<number, string> = {
      1: 'يوم واحد', 2: 'يومان', 3: 'ثلاثة أيام', 4: 'أربعة أيام', 5: 'خمسة أيام',
      6: 'ستة أيام', 7: 'سبعة أيام', 8: 'ثمانية أيام', 9: 'تسعة أيام', 10: 'عشرة أيام'
    };
    if (days > 0) {
      if (days <= 10) result.push(daysWords[days]);
      else result.push(numToArabicMasculine(days) + ' يوماً');
    }

    return result.length > 0 ? 'فقط ( ' + result.join(' و ') + ' ) لا غير' : 'لا توجد خدمة';
  }, [tableTotalDuration]);

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
                      <tr>
                        <td colspan="7" style="text-align: center; font-weight: bold; padding: 0.75rem; color: #1f2937; background-color: #f3f4f6; border: 1px solid #d1d5db;">
                          ${totalServiceInWords}
                        </td>
                      </tr>
                  </tfoot>
              </table>
              <div style="padding: 1rem; margin-top: 2rem;">
                  <div style="text-align: left; margin-bottom: 2rem;">
                      <p>ع/رئيس هيأة التقاعد الوطنية</p>
                      <p style="margin-top: 0.5rem;">مدير هيأة التقاعد الوطنية / فرع البصرة</p>
                      <br />
                  </div>
                  <div style="text-align: right; line-height: 2; margin-bottom: 2rem;">
                      ${rawPensionDeductionAmount > 0 ? `<p>ترتب بذمة المومأ اليه اعلاه مبلغاً قدره (${pensionDeductionAmount} د.ع) فقط (${pensionDeductionAmountInWords}) يسدد لحساب صندوق تقاعد موظفي الدولة وبنسبة ١/٤ (ربع) الراتب التقاعدي الشهري.</p>` : `<p>لا تترتب بذمته اي توقيفات تقاعدية.</p>`}
                  </div>
                  <div class="copy-to-section" style="text-align: right;">
                      <p>نسخة منه الى...</p>
                      <ul style="list-style-type: disc; list-style-position: inside; margin-right: 1rem;">
                          <li>قسم حسابات المتقاعدين/شعبة الاستقطاع</li> <li>فرع هيأة التقاعد الوطنية ،،</li> <li>منظم القرار// ${currentUser?.fullName || currentUser?.username}</li>
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
                      <tr>
                        <td colspan="6" style="text-align: center; font-weight: bold; padding: 0.75rem; color: #1f2937; background-color: #f3f4f6; border: 1px solid #d1d5db;">
                          ${totalServiceInWords}
                        </td>
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
                        <p>${currentUser?.fullName || currentUser?.username}</p>
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

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-[system-ui] pb-10" dir="rtl">
      
      {/* Sticky Top Header Area */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md pb-4 pt-4 px-4 sm:px-8 border-b border-gray-200 dark:border-gray-700/80 shadow-sm">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          
          {/* Right Side (User Info) */}
          <div className="flex-shrink-0 z-50">
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-gray-700/50 rounded-full shadow-sm hover:shadow transition-all border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <div className="w-9 h-9 bg-gradient-to-tr from-yellow-500 to-yellow-400 dark:from-yellow-600 dark:to-yellow-500 rounded-full flex items-center justify-center text-white shadow-inner">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden sm:block pl-3 pr-1 text-right">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">المنظم</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight max-w-[100px] truncate">{currentUser?.fullName || currentUser?.username}</p>
                </div>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 origin-top-right transform transition-all duration-200 scale-100 opacity-100">
                    <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">تم الدخول بحساب</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{currentUser?.fullName || currentUser?.username}</p>
                    </div>
                    <div className="p-1">
                        {currentUser?.role === 'admin' && (
                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsManageUsersOpen(true);
                            }}
                            className="w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors mb-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            <span>إدارة المستخدمين</span>
                          </button>
                        )}
                        <button 
                          onClick={handleLogout}
                          className="w-full text-right px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-3 transition-colors"
                        >
                          <LogOutIcon className="w-4 h-4" />
                          <span>تسجيل خروج</span>
                        </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center (Logo & Title) */}
          <div className="flex-1 flex flex-col items-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1 sm:mt-1">
            <div className="flex flex-col items-center gap-1 sm:gap-1.5">
              <img src="/logo.png" alt="شعار الدائرة" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md" />
              <div className="flex items-center gap-1 sm:gap-1.5">
                <SoldierIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 hidden sm:block"/>
                <h1 className="text-sm sm:text-lg font-bold font-kufi text-yellow-600 dark:text-yellow-400">نظام احتساب الخدمة العسكرية</h1>
              </div>
            </div>
          </div>

          {/* Left Side (Gov Text) */}
          <div className="flex-shrink-0 text-left text-gray-600 dark:text-gray-300 hidden md:block">
            <p className="font-semibold text-[11px] leading-tight mb-0.5">جمهورية العراق / وزارة المالية</p>
            <p className="font-semibold text-[11px] leading-tight">هيأة التقاعد الوطنية - فرع البصرة</p>
          </div>

        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-28 sm:pt-28 z-10 relative">
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ادخل الاسم هنا" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 dark:text-gray-100 placeholder-gray-400" />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المواليد</label>
                <CustomDateInput id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
              </div>
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ التعيين</label>
                <CustomDateInput id="appointmentDate" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
              </div>
              <div>
                <label htmlFor="disengagementDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الانفكاك</label>
                <CustomDateInput id="disengagementDate" value={disengagementDate} onChange={(e) => setDisengagementDate(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
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
                    <option value="حركات">حركات</option>
                  </select>
                  <CustomDateInput value={row.start} onChange={e => handleRowChange(row.id, 'start', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  <CustomDateInput value={row.end} onChange={e => handleRowChange(row.id, 'end', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
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
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col gap-3">
              <div className="flex justify-between items-center text-gray-800 dark:text-gray-200">
                <span className="font-bold text-lg">مجموع الخدمة الإجمالي:</span>
                <div className="flex gap-2 text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                  <span>{toArabicNumerals(tableTotalDuration.days)} <span className="text-xs text-gray-500 dark:text-gray-400">يوم</span></span>
                  <span>{toArabicNumerals(tableTotalDuration.months)} <span className="text-xs text-gray-500 dark:text-gray-400">شهر</span></span>
                  <span>{toArabicNumerals(tableTotalDuration.years)} <span className="text-xs text-gray-500 dark:text-gray-400">سنة</span></span>
                </div>
              </div>
              <div className="text-left w-full border-t border-gray-200 dark:border-gray-600 pt-3 mt-1 text-center">
                <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm sm:text-base px-4 py-2 rounded-lg font-medium w-full shadow-sm border border-blue-200 dark:border-blue-800">
                  {totalServiceInWords}
                </span>
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

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-end gap-6">
            <div className="flex flex-col items-center sm:items-start text-sm order-last sm:order-first">
                <div className="relative mb-2 group cursor-default">
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-md group-hover:bg-yellow-500/30 transition-all duration-300"></div>
                  <img src="/sa-logo.png" alt="شعار المبرمج سيف علي" className="relative w-16 h-16 object-contain drop-shadow-xl" />
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5 tracking-wider uppercase">تصميم وتطوير</p>
                  <p className="font-semibold text-sm bg-gradient-to-l from-yellow-600 to-yellow-500 dark:from-yellow-500 dark:to-yellow-300 bg-clip-text text-transparent drop-shadow-sm">المبرمج سيف علي</p>
                </div>
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

      {isManageUsersOpen && (
        <ManageUsersModal 
          users={users} 
          onClose={() => setIsManageUsersOpen(false)} 
          onUpdateUsers={(newUsers) => setUsers(newUsers)} 
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default App;
