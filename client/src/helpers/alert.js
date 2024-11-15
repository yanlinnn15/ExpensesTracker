import Swal from 'sweetalert2';

export function showsweetAlert(title, text, icon = 'info', confirmButtonText = 'Okay') {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
  });
}