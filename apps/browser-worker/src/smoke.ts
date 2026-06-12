import { recordBrowserLifecycle } from "./recorder/browser-recorder.js";
import { parseBrowserWorkerCliOptions } from "./recorder/recorder-options.js";

const options = parseBrowserWorkerCliOptions(process.argv.slice(2), process.env);
const result = await recordBrowserLifecycle(options);

console.log(JSON.stringify(result, null, 2));
