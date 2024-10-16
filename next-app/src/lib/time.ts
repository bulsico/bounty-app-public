const MAX_UNIX_TIMESTAMP = 2147483647;

export const isMaxUnixTimestamp = (timestamp: number | string) => {
  return timestamp.toString() === MAX_UNIX_TIMESTAMP.toString();
};
