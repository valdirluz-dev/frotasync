export const wait = (ms = 140) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
