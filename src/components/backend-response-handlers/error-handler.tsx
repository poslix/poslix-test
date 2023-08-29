import { useEffect, useRef } from 'react';
import { Alert } from 'react-bootstrap';

interface ErrorHandlerProps {
  error: string[];
}

export default function ErrorHandler({ error }: ErrorHandlerProps) {
  if (!error?.length) return null;
  const ref = useRef();

  useEffect(() => {
    // I need it to scroll to be in the center of the view
    // @ts-ignore
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [error]);
  return (
    <Alert variant="danger" ref={ref}>
      <ul>
        {error.map((errorMsg, index) => (
          <li key={index}>{errorMsg}</li>
        ))}
      </ul>
    </Alert>
  );
}
