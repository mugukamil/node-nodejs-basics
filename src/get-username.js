import { parseArgs } from "./cli/args.js";

export function getUsername() {
    const parsedArgs = parseArgs();
    let username = "";

    for (let arg of parsedArgs) {
        let vars = Object.entries(arg)[0];
        if (vars[0] === "username") {
            username = vars[1];
        }
    }
    return username;
}
