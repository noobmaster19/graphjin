import "./globals.js";
import * as _ from "./wasm_exec.js";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const go = new Go();

// Modify the function to accept an fs-like object as a parameter
export default async function(configPath, config, db, customFs = undefined) {
    const fs = customFs || (await import('fs'));  // Use the provided fs-like object, or fall back to Node's fs

    const wasmFile = fs.readFileSync(join(__dirname, "../graphjin.wasm"));
    const inst = await WebAssembly.instantiate(wasmFile, go.importObject);
    go.run(inst.instance);

    // Handle configuration and pass the custom fs object
    if (typeof config === 'string') {
        const conf = { value: config, isFile: true };
        return await createGraphJin(configPath, conf, db, fs);
    } else {
        const conf = { value: JSON.stringify(config), isFile: false };
        return await createGraphJin(configPath, conf, db, fs);
    }
}
