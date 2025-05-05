import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createReadStream, createWriteStream } from "node:fs";
import * as os from "node:os";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib";
import { createHash } from "node:crypto";

export class FileManager {
    constructor() {
        process.chdir(os.homedir());
    }

    async executeCommand(input) {
        const [command, ...args] = input.trim().split(" ");

        try {
            switch (command) {
                case "up":
                    this.up();
                    break;
                case "cd":
                    await this.cd(args[0]);
                    break;
                case "ls":
                    await this.ls();
                    break;
                case "cat":
                    await this.cat(args[0]);
                    break;
                case "add":
                    await this.add(args[0]);
                    break;
                case "rn":
                    await this.rename(args[0], args[1]);
                    break;
                case "cp":
                    await this.copy(args[0], args[1]);
                    break;
                case "mv":
                    await this.move(args[0], args[1]);
                    break;
                case "rm":
                    await this.remove(args[0]);
                    break;
                case "os":
                    this.osInfo(args[0]);
                    break;
                case "hash":
                    await this.hash(args[0]);
                    break;
                case "compress":
                    await this.compress(args[0], args[1]);
                    break;
                case "decompress":
                    await this.decompress(args[0], args[1]);
                    break;
                case "mkdir":
                    await this.mkdir(args[0]);
                    break;
                default:
                    console.log("Invalid input");
            }
        } catch (err) {
            console.log("Operation failed");
        }
    }

    up() {
        const currentDir = process.cwd();
        const parentDir = path.dirname(currentDir);
        const rootDir = path.parse(currentDir).root;

        if (currentDir !== rootDir) {
            process.chdir(parentDir);
        }
    }

    async cd(pathTo) {
        const resolvedPath = path.resolve(process.cwd(), pathTo);
        const rootDir = path.parse(resolvedPath).root;

        if (!resolvedPath.startsWith(rootDir)) {
            console.log("Operation failed");
            return;
        }

        await fs.access(resolvedPath);
        process.chdir(resolvedPath);
    }

    async ls() {
        const files = await fs.readdir(process.cwd(), { withFileTypes: true });
        const sorted = files.sort((a, b) => {
            if (a.isDirectory() === b.isDirectory()) {
                return a.name.localeCompare(b.name);
            }
            return a.isDirectory() ? -1 : 1;
        });

        console.log("Type\tName");
        sorted.forEach((entry) => {
            console.log(`${entry.isDirectory() ? "DIR" : "FILE"}\t${entry.name}`);
        });
    }

    async cat(filePath) {
        const readable = createReadStream(filePath);
        readable.pipe(process.stdout);
        return new Promise((resolve, reject) => {
            readable.on("end", resolve);
            readable.on("error", reject);
        });
    }

    async add(filename) {
        await fs.writeFile(filename, "");
    }

    async rename(oldPath, newPath) {
        await fs.rename(oldPath, newPath);
    }

    async copy(sourcePath, destPath) {
        const fileName = path.basename(sourcePath);
        const destinationFile = path.join(destPath, fileName);
        const readable = createReadStream(sourcePath);
        const writable = createWriteStream(destinationFile);

        readable.pipe(writable);
        return new Promise((resolve, reject) => {
            writable.on("finish", resolve);
            writable.on("error", reject);
        });
    }

    async move(sourcePath, destPath) {
        await this.copy(sourcePath, destPath);
        await fs.unlink(sourcePath);
    }

    async remove(filePath) {
        await fs.unlink(filePath);
    }

    osInfo(flag) {
        switch (flag) {
            case "--EOL":
                console.log(JSON.stringify(os.EOL));
                break;
            case "--cpus":
                const cpus = os.cpus();
                console.log(`Overall CPUs: ${cpus.length}`);
                cpus.forEach((cpu, i) => {
                    console.log(`CPU ${i + 1}: ${cpu.model} (${cpu.speed / 1000} GHz)`);
                });
                break;
            case "--homedir":
                console.log(os.homedir());
                break;
            case "--username":
                console.log(os.userInfo().username);
                break;
            case "--architecture":
                console.log(os.arch());
                break;
            default:
                console.log("Invalid OS flag");
        }
    }

    async hash(filePath) {
        const readable = createReadStream(filePath);
        const hash = createHash("sha256");
        readable.pipe(hash);

        return new Promise((resolve, reject) => {
            hash.on("finish", () => {
                console.log(hash.digest("hex"));
                resolve();
            });
            hash.on("error", reject);
        });
    }

    async compress(sourcePath, destPath) {
        const brotli = createBrotliCompress();
        const source = createReadStream(sourcePath);
        const destination = createWriteStream(destPath);

        source.pipe(brotli).pipe(destination);
        return new Promise((resolve, reject) => {
            destination.on("finish", resolve);
            destination.on("error", reject);
        });
    }

    async decompress(sourcePath, destPath) {
        const brotli = createBrotliDecompress();
        const source = createReadStream(sourcePath);
        const destination = createWriteStream(destPath);

        source.pipe(brotli).pipe(destination);
        return new Promise((resolve, reject) => {
            destination.on("finish", resolve);
            destination.on("error", reject);
        });
    }

    async mkdir(dirName) {
        await fs.mkdir(path.join(process.cwd(), dirName));
    }
}
