import { logLib } from "./lib";
import { Config, Internal } from "./types";

declare global {
	interface Window {
		llc: Config;
		lli: Internal;
		logLib: typeof logLib;
	}
}

export { logLib };