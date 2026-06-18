import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(t => {
        let icon = '❌';
        if (t.type === 'success') icon = '✅';
        else if (t.type === 'info') icon = 'ℹ️';
        else if (t.type === 'warning') icon = '⚠️';
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{icon}</span>
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );

  return { addToast, ToastContainer };
}
