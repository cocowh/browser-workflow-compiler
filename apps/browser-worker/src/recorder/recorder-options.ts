export const defaultSmokeUrl =
  "data:text/html," +
  encodeURIComponent(`
    <main>
      <label>
        Workflow name
        <input id="workflow-name" name="workflowName" autocomplete="off" />
      </label>
      <button id="record">Record</button>
      <output id="network-result"></output>
      <script>
        document.querySelector("#record").addEventListener("click", () => {
          fetch("https://bwc.local/api/smoke", { headers: { accept: "application/json" } })
            .then((response) => response.json())
            .then((data) => {
              document.querySelector("#network-result").textContent = data.ok ? "ok" : "failed";
              document.body.dataset.bwcSmokeNetwork = "done";
            })
            .catch(() => {
              document.querySelector("#network-result").textContent = "failed";
              document.body.dataset.bwcSmokeNetwork = "done";
            });
        });
      </script>
    </main>
  `);

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
