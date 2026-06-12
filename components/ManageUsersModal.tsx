import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { TrashIcon, PlusIcon, EditIcon } from './icons';
import { saveUser, deleteUserDb } from '../firebase';

interface Props {
  users: User[];
  onClose: () => void;
  currentUser: User;
}

export const ManageUsersModal: React.FC<Props> = ({ users, onClose, currentUser }) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newFullName.trim()) return;
    
    if (editingUserId) {
      if (users.some(u => u.username === newUsername.trim() && u.id !== editingUserId)) {
        alert('اسم المستخدم موجود بالفعل');
        return;
      }

      const userToUpdate = users.find(u => u.id === editingUserId);
      if (userToUpdate) {
        await saveUser({
          ...userToUpdate,
          username: newUsername.trim(),
          fullName: newFullName.trim(),
          password: newPassword,
          role: newRole,
        });
      }
      handleCancelEdit();
    } else {
      if (users.some(u => u.username === newUsername.trim())) {
        alert('اسم المستخدم موجود بالفعل');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        username: newUsername.trim(),
        fullName: newFullName.trim(),
        password: newPassword,
        role: newRole,
        createdAt: Date.now()
      };

      await saveUser(newUser);

      setNewUsername('');
      setNewFullName('');
      setNewPassword('');
      setNewRole('user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setNewUsername(user.username);
    setNewFullName(user.fullName || '');
    setNewPassword(user.password || '');
    setNewRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setNewUsername('');
    setNewFullName('');
    setNewPassword('');
    setNewRole('user');
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser.id) {
      alert('لا يمكنك حذف حسابك الحالي');
      return;
    }
    await deleteUserDb(id);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white font-kufi">إدارة المستخدمين</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          {/* Add User Form */}
          <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-100 dark:border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">{editingUserId ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</h3>
              {editingUserId && (
                <button type="button" onClick={handleCancelEdit} className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded">
                  إلغاء التعديل
                </button>
              )}
            </div>
            <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">اسم المستخدم</label>
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={e => setNewUsername(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex-1 focus:ring-2 focus:ring-yellow-500 text-sm dark:text-white"
                  placeholder="اسم الدخول"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">الاسم الثلاثي</label>
                <input 
                  type="text" 
                  value={newFullName} 
                  onChange={e => setNewFullName(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex-1 focus:ring-2 focus:ring-yellow-500 text-sm dark:text-white"
                  placeholder="الاسم كامل"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">كلمة المرور</label>
                <input 
                  type="text" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex-1 focus:ring-2 focus:ring-yellow-500 text-sm dark:text-white"
                  placeholder="كلمة المرور"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">الصلاحية</label>
                <select 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-yellow-500 text-sm dark:text-white outline-none"
                >
                  <option value="user">مستخدم عادي</option>
                  <option value="admin">مسؤول (Admin)</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={!newUsername.trim() || !newPassword.trim() || !newFullName.trim()}
                className={`w-full h-[38px] px-4 text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${editingUserId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
              >
                {editingUserId ? <EditIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                <span>{editingUserId ? 'حفظ التعديلات' : 'إضافة'}</span>
              </button>
            </form>
          </div>

          {/* List Users */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">المستخدمين المسجلين</h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-4 py-3">اسم المستخدم</th>
                    <th scope="col" className="px-4 py-3">الاسم الثلاثي</th>
                    <th scope="col" className="px-4 py-3">كلمة المرور</th>
                    <th scope="col" className="px-4 py-3">الصلاحية</th>
                    <th scope="col" className="px-4 py-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.username}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{u.fullName || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.password}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                          {u.role === 'admin' ? 'مسؤول' : 'عادي'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditUser(u)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="تعديل"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={u.id === currentUser.id}
                            title="حذف"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
