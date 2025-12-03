const getHeaders = (headers?: HeadersInit): HeadersInit => {
  return {
    ...headers,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

export const httpClient = async <T>(
  path: string,
  options: RequestInit
): Promise<T> => {
  const requestHeaders = getHeaders(options.headers);

  const response = await fetch(path, {
    ...options,
    headers: requestHeaders,
  });

  if (!response.ok) {
    return {
      status: response.status,
      data: null,
      headers: response.headers,
    } as T;
  }

  const data = await response.json();

  return {
    status: response.status,
    data: data,
    headers: response.headers,
  } as T;
};
