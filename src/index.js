import { getUsername } from "./get-username.js";
import { FileManager } from "./FileManager.js";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const username = getUsername();
const fileManager = new FileManager();

console.log(`Welcome to the File Manager, ${username}!`);
console.log(`You are currently in ${process.cwd()}`);

const rl = readline.createInterface({ input, output });

rl.on("line", async (input) => {
    if (input.trim() === ".exit") {
        rl.close();
        return;
    }

    try {
        await fileManager.executeCommand(input);
    } catch (err) {
        console.log("Operation failed");
    }

    console.log(`You are currently in ${process.cwd()}`);
});

process.on("SIGINT", () => {
    rl.close();
});

rl.on("close", () => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    process.exit(0);
});
