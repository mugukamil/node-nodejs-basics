export const parseArgs = () => {
    let parsedArgs = [];
    let args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        if (args[i].includes("--")) {
            let [key, val] = args[i].split("=");
            parsedArgs.push({ [key.slice(2)]: val });
        }
    }

    return parsedArgs;
};
