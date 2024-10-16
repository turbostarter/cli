import colors from "picocolors";

export const logger = {
  error(log: string) {
    console.log(colors.red(log));
  },
  warn(log: string) {
    console.log(colors.yellow(log));
  },
  info(log: string) {
    console.log(colors.cyan(log));
  },
  success(log: string) {
    console.log(colors.green(log));
  },
  log(log: string) {
    console.log(log);
  },
  break() {
    console.log("");
  },
};
