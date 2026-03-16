import toast, { Toaster } from 'react-hot-toast';

// Initialize the toast object
const toastInstance = toast;

// Toaster component for displaying toasts
const ToastContainer = Toaster;

// Export a service with methods for showing toasts
const toastService = {
  notify: (message: string) => toastInstance(message),
  success: (message: string) => toastInstance.success(message),
  error: (message: string) => toastInstance.error(message),
  // Method to show a loading toast and return its ID
  loading: (loadingMessage: string, options?: any) =>
    toastInstance.loading(loadingMessage, options), // pass position here

  // Method to update a loading toast with success message
  updateLoadingWithSuccess: (toastId: string, successMessage: string) => {
    toastInstance.success(successMessage, {
      id: toastId,
    });
  },
  // Method to show an error toast
  showError: (toastId: string, errorMessage: string,) => {
    toastInstance.error(errorMessage, {
      id: toastId,
      style: {
        background: '#d32f2f',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 16px',
        borderRadius: '8px',
      },
    });
  },
  // Method to dismiss a toast
  dismiss: (toastId: string) => {
    toastInstance.dismiss(toastId);
  },
  // Add more methods for different types of toasts as needed
};

export { toastService, ToastContainer };
