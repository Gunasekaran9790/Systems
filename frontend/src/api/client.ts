// const API_URL = import.meta.env.VITE_API_URL

// export async function apiRequest<T>(
//   path: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const response = await fetch(`${API_URL}${path}`, {
//     ...options,
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//   })

//   //const data = await response.json()

//   const text = await response.text();

//   const data = text
//     ? JSON.parse(text)
//     : null;

//   if (!response.ok) {
//     throw new Error(
//       data?.message || 'Something went wrong. Please try again.',
//     );
//   }
//   return data as T
// }



// const API_URL = import.meta.env.VITE_API_URL;

// export async function apiRequest<T>(
//   path: string,
//   options: RequestInit = {},
// ): Promise<T> {
  
//   const response = await fetch(`${API_URL}${path}`, {
//     ...options,
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//   });

//   const text = await response.text();

//   let data: any;

//   try {
//     data = text ? JSON.parse(text) : null;
//   } catch {
//     console.error('Expected JSON but received:', text);

//     throw new Error(
//       `Server returned HTML or invalid JSON (HTTP ${response.status}). Check the API URL and backend routes.`,
//     );
//   }

//   if (!response.ok) {
//     throw new Error(
//       data?.message || 'Something went wrong. Please try again.',
//     );
//   }

//   return data as T;
// }



const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  if (isFormData) {
    // Let the browser automatically set multipart/form-data and its boundary.
    headers.delete('Content-Type');
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
    body: options.body,
  });

  const text = await response.text();

  let data: any;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    console.error('Expected JSON but received:', text);

    throw new Error(
      `Server returned invalid JSON (HTTP ${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || 'Something went wrong. Please try again.',
    );
  }

  return data as T;
}


export async function apiBlobRequest(
  path: string,
  options: RequestInit = {},
): Promise<Blob> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      throw new Error(data?.message || 'Unable to generate PDF');
    } catch (error) {
      if (error instanceof Error && error.message !== 'Unexpected end of JSON input') {
        throw error;
      }

      throw new Error('Unable to generate PDF');
    }
  }

  const blob = await response.blob();

  if (!blob.type.includes('application/pdf')) {
    throw new Error('Server did not return a valid PDF file');
  }

  return blob;
}