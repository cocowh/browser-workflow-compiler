export const defaultSmokeUrl = "data:text/html,<main><button id='record'>Record</button></main>";

export type BrowserRecorderOptions = {
  apiUrl: string | undefined;
  targetUrl: string;
  headless: boolean;
  sessionName: string;
};

export type BrowserWorkerCliOptions = BrowserRecorderOptions;

export function parseBrowserWorkerCliOptions(argv: string[], env: NodeJS.ProcessEnv): BrowserWorkerCliOptions {
  return {
    apiUrl: getArgValue(argv, "--api") ?? env.BWC_API_URL,
    targetUrl: getArgValue(argv, "--url") ?? env.BWC_TARGET_URL ?? defaultSmokeUrl,
    headless: !hasFlag(argv, "--headed"),
    sessionName: getArgValue(argv, "--session-name") ?? "Browser worker smoke",
  };
}

function getArgValue(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return argv[index + 1];
}

function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(name);
}
