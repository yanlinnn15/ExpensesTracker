// utils/toast.js
import Swal from 'sweetalert2';

/**
 * @param {string} message 
 * @param {string} icon 
 */
export const showToast = (message, icon = 'success') => {
  Swal.fire({
    toast: true,
    position: 'top', 
    icon,
    title: message,
    showConfirmButton: false,
    timer: 1000,
    iconColor: icon === 'success' ? '#4caf50' : '#f44336',  
    timerProgressBar: true,
    customClass: {
      container: 'toast-container'  
    }
  });
};
