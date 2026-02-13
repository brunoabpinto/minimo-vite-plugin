import fs from "node:fs";
import path from "node:path";

const EVENTS = new Set(["add", "change", "unlink"]);

const DEFAULT_WATCH = [
  "views/**/*.blade.php",
  "views/**/*.blade.md",
  "views/**/*.md",
  "app/**/*.php",
];

const DEFAULT_MATCHERS = [
  /(^|\/)views\/.*\.(blade\.php|blade\.md|md)$/,
  /(^|\/)app\/.*\.php$/,
  /(^|\/)packages\/minimo-core\/src\/.*\.php$/,
];

const normalizePath = (file = "") => String(file).split(path.sep).join("/");
const trimTrailingSlash = (url) => url.replace(/\/+$/, "");
const resolvePath = (root, p) =>
  path.isAbsolute(p) ? p : path.resolve(root, p);

const defaultShouldReload = (file) => {
  const normalized = normalizePath(file);
  return DEFAULT_MATCHERS.some((re) => re.test(normalized));
};

const resolveDevUrl = (server, explicitUrl) => {
  if (explicitUrl && explicitUrl.trim() !== "") {
    return trimTrailingSlash(explicitUrl.trim());
  }

  const protocol = server.config.server.https ? "https" : "http";
  const hostOption = server.config.server.host;
  const host =
    typeof hostOption === "string" &&
    hostOption !== "" &&
    hostOption !== "0.0.0.0"
      ? hostOption
      : "127.0.0.1";
  const port = server.config.server.port ?? 5173;

  return `${protocol}://${host}:${port}`;
};

export default function minimo(options = {}) {
  const {
    hotFile = "public/hot",
    watch = DEFAULT_WATCH,
    shouldReload = defaultShouldReload,
    devServerUrl,
  } = options;

  let hotFilePath = "";

  const cleanHotFile = () => {
    if (hotFilePath && fs.existsSync(hotFilePath)) {
      fs.unlinkSync(hotFilePath);
    }
  };

  return {
    name: "minimo-vite-plugin",
    apply: "serve",

    configResolved(config) {
      hotFilePath = resolvePath(config.root, hotFile);
      cleanHotFile();
    },

    configureServer(server) {
      hotFilePath ||= resolvePath(server.config.root, hotFile);

      fs.mkdirSync(path.dirname(hotFilePath), { recursive: true });
      fs.writeFileSync(hotFilePath, resolveDevUrl(server, devServerUrl));

      server.watcher.add(
        watch.map((pattern) => resolvePath(server.config.root, pattern)),
      );

      const onWatchEvent = (event, file) => {
        if (!EVENTS.has(event)) return;
        if (!file || !shouldReload(file)) return;
        server.ws.send({ type: "full-reload" });
      };

      server.watcher.on("all", onWatchEvent);

      server.httpServer?.once("close", () => {
        server.watcher.off("all", onWatchEvent);
        cleanHotFile();
      });
    },
  };
}
