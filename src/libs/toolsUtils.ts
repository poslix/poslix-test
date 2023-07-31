export function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function validatePassword(password: string) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])[^/\\]{6,}$/;
    return passwordRegex.test(password);
}
export function validateName(name: string) {
    const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
    return nameRegex.test(name);
}
export function validatePhoneNumber(phoneNumber: string) {
    const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneNumberRegex.test(phoneNumber);
}
export function generateUniqueString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}
export const handleNumberKeyPress = (event) => {
    const keyCode = event.keyCode || event.which;
    const keyValue = String.fromCharCode(keyCode);
    const regex = /^[0-9.]+$/; // Only allow digits (0-9) and backspace (\b)
    if (!regex.test(keyValue)) {
      event.preventDefault();
    }
  };