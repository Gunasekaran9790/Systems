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



const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const text = await response.text();

  let data: any;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    console.error('Expected JSON but received:', text);

    throw new Error(
      `Server returned HTML or invalid JSON (HTTP ${response.status}). Check the API URL and backend routes.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || 'Something went wrong. Please try again.',
    );
  }

  return data as T;
}
