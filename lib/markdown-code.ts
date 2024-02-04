import { preWrapperPlugin } from "@/lib/markdown/preWrapperPlugin";
import MarkdownIt from "markdown-it";
import {
  createDiffProcessor,
  createFocusProcessor,
  createHighlightProcessor,
  createRangeProcessor,
  defineProcessor,
  getHighlighter,
} from "shiki-processor";

const CurlLogs = `
\`\`\`bash 
curl https://api.vazapay.com/v1/wuuf/logs \\
  -H "Content-Type: application/json" \\
  -H "z-api-key: Bearer $WUUF_API_KEY" \\
`;

const JSLogs = `
\`\`\`js
import requests

url = "https://api.vazapay.com/v1/wuuf/log"

response = requests.request("GET", url)

print(response.text)
\`\`\`
`;

const NodejsLogs = `

\`\`\`js
import requests

url = "https://api.vazapay.com/v1/wuuf/log"

response = requests.request("GET", url)

print(response.text)
\`\`\`
`;

const PythonLogs = `
\`\`\`python
import requests

url = "https://api.vazapay.com/v1/wuuf/log"

response = requests.request("GET", url)

print(response.text)
\`\`\`
`;

const CurlSendMessage = `
\`\`\`bash
curl --request POST \
  --url https://api.vazapay.com/v1/wuuf/message \\ \n \
  --header 'Content-Type: application/json' \\ \n \
  --header 'z-api-key: $WUUF_API_KEY' \\ \n \
  --data '{ 
    "text": "wuuf wuuf 🐶", 
    "to": { 
      "whatsapp": "2347000000000" 
    }
}'
`;

const JSSendMessage = `
\`\`\`js
const options = {
  method: 'POST',
  headers: {'z-api-key': '\${process.env.WUUF_API_KEY}', 'Content-Type': 'application/json'},
  body: '{"text":"wuuf wuuf 🐶", "to":{"whatsapp":"2347000000000"}}'
};

fetch('https://api.vazapay.com/v1/wuuf/message', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
\`\`\`
`;

const NodejsSendMessage = `

\`\`\`js
const options = {
  method: 'POST',
  headers: {'z-api-key': '\${process.env.WUUF_API_KEY}', 'Content-Type': 'application/json'},
  body: '{"text":"wuuf wuuf 🐶", "to":{"whatsapp":"2347000000000"}}'
};

fetch('https://api.vazapay.com/v1/wuuf/message', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
\`\`\`
`;

const PythonSendMessage = `
\`\`\`python
import requests

url = "https://api.vazapay.com/v1/wuuf/message"

payload = {
    "text": "wuuf wuuf 🐶",
    "to": {
        "whatsapp": "2347000000000"
    }
}

headers = {
    "z-api-key": WUUF_API_KEY,
    "Content-Type": "application/json"
}

response = requests.request("POST", url, json=payload, headers=headers)

print(response.text)
\`\`\`
`;

const highlighterConfig = {
  theme: "material-theme-palenight",
  processors: [
    createDiffProcessor(),
    createHighlightProcessor(),
    createFocusProcessor(),
    defineProcessor({
      name: "line",
      handler: createRangeProcessor({
        error: ["highlighted", "error"],
        warning: ["highlighted", "warning"],
      }),
      postProcess: ({ code }) => {
        const modifiedCode = code.replace(
          /(.withlogging)/g,
          '<span class="highlight-word">$1</span>'
        );
        // console.log("code", modifiedCode);
        return modifiedCode;
      },
    }),
  ],
};

const markdownConfig = {
  html: true,
  linkify: true,
  typographer: true,
};

interface CodeResults {
  curl: string;
  js: string;
  nodejs: string;
  python: string;
}

interface Highlighter {
  codeToHtml: (
    code: string,
    options: { lang: string; theme?: string }
  ) => string;
}

let highlighterInstance: Highlighter | null = null;
let markdownItInstance: MarkdownIt | null = null;

async function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await getHighlighter(highlighterConfig);
  }
  return highlighterInstance;
}

async function getMarkdownItInstance(): Promise<MarkdownIt> {
  if (!markdownItInstance) {
    const highlighter = await getHighlighterInstance();

    markdownItInstance = new MarkdownIt({
      ...markdownConfig,
      highlight: (code, lang) => highlighter.codeToHtml(code, { lang }),
    }).use(preWrapperPlugin);
  }

  return markdownItInstance;
}

export async function sendMessageCode(): Promise<CodeResults> {
  const renderer = await getMarkdownItInstance();
  return {
    curl: renderer.render(CurlSendMessage),
    js: renderer.render(JSSendMessage),
    nodejs: renderer.render(NodejsSendMessage),
    python: renderer.render(PythonSendMessage),
  };
}

export async function getLogsCode(): Promise<CodeResults> {
  const renderer = await getMarkdownItInstance();
  return {
    curl: renderer.render(CurlLogs),
    js: renderer.render(JSLogs),
    nodejs: renderer.render(NodejsLogs),
    python: renderer.render(PythonLogs),
  };
}

export async function getSendCode(): Promise<CodeResults> {
  const renderer = await getMarkdownItInstance();
  return {
    curl: renderer.render(CurlSendMessage),
    js: renderer.render(JSSendMessage),
    nodejs: renderer.render(NodejsSendMessage),
    python: renderer.render(PythonSendMessage),
  };
}
