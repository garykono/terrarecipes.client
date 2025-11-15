type Level = "debug" | "info" | "warn" | "error";
const rank: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const ENV = import.meta.env.VITE_ENV; // "development" | "production"
const GLOBAL_LEVEL: Level =
    (import.meta.env.VITE_LOG_LEVEL as Level) ||
    (ENV === "production" ? "error" : "debug");

// enable namespaces via localStorage or ?debug=search,auth
function enabledNamespaces() {
    const queryString = new URLSearchParams(location.search).get("debug"); // "search,auth"
    const ls= localStorage.getItem("debug");
    return new Set((queryString ?? ls ?? "").split(",").map(s => s.trim()).filter(Boolean));
}
let ns = enabledNamespaces();

// refreshable at runtime (optional)
window.addEventListener("storage", () => (ns = enabledNamespaces()));

function makeLogger(namespace: string) {
    const prefix = `[${namespace}]`;
    const isNsEnabled = () =>
        ENV === "development" || ns.has("*") || ns.has(namespace);

    const allowed = (lvl: Level) => rank[lvl] >= rank[GLOBAL_LEVEL];

    return {
        debug: (...args: any[]) => allowed("debug") && isNsEnabled() && console.debug(prefix, ...args),
        info:  (...args: any[]) => allowed("info")  && isNsEnabled() && console.info(prefix, ...args),
        warn:  (...args: any[]) => allowed("warn")  && isNsEnabled() && console.warn(prefix, ...args),
        error: (...args: any[]) => allowed("error") && isNsEnabled() && console.error(prefix, ...args),
        group: (title: string) => allowed("debug") && isNsEnabled() && console.groupCollapsed(prefix, title),
        groupEnd: () => allowed("debug") && isNsEnabled() && console.groupEnd(),
        time: (label: string) => allowed("debug") && isNsEnabled() && console.time(`${prefix} ${label}`),
        timeEnd: (label: string) => allowed("debug") && isNsEnabled() && console.timeEnd(`${prefix} ${label}`),
    };
}

export const log = makeLogger("app");
export const logAPI = makeLogger("api");
export const logSearch = makeLogger("search");
export const logAuth = makeLogger("auth");
export const logUI = makeLogger("ui");
export const logRecipe = makeLogger("recipe")