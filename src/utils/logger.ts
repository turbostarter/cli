import colors from "picocolors";

const formatLog = (log: unknown) => {
  if (typeof log === "string") {
    return log;
  }

  return String(log);
};

export const logger = {
  error(log: unknown) {
    console.log(colors.red(formatLog(log)));
  },
  warn(log: unknown) {
    console.log(colors.yellow(formatLog(log)));
  },
  info(log: unknown) {
    console.log(colors.cyan(formatLog(log)));
  },
  success(log: unknown) {
    console.log(colors.green(formatLog(log)));
  },
  log(log: unknown) {
    console.log(formatLog(log));
  },
};
