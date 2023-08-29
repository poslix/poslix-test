import axios, { AxiosError } from 'axios';

interface ErrorDictionary {
  [key: string]: string[];
}

export function handleAxiosError(
  error: AxiosError<ErrorDictionary> | any,
  errorCallback: (errors: string[]) => void
) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorDictionary>;
    const errorMessages = Object.values(axiosError.response?.data?.error || {});

    if (errorMessages.length > 0) {
      const allErrors = errorMessages.reduce((acc, errors) => [...acc, errors], []);
      errorCallback(allErrors);
    } else {
      errorCallback(['An error occurred.']);
    }
  } else {
    errorCallback(['Network error.']);
  }
}
