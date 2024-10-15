#!/usr/bin/env node
import { intro, outro } from "@clack/prompts";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

console.log("Hello World");

intro(`turbostarter`);
outro(`You're all set!`);
