import Swal from "sweetalert2";
import { toast, TypeOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});
export const Toastify = (type: TypeOptions, msg: string) => {
  toast(msg, {
    type: type,
    theme: 'colored'
  })
}