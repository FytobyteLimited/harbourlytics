export type Config = {
	autoTrack: boolean;
	debug: boolean;
	env: "auto" | "test" | "prod" | "dev";
	postInterval: number;
	host: string;
	consent: "granted" | "denied";
};
export type ServerEvents = {
	id: string;
	eventName: string;
	eventType: string;
	payload: Record<string, string>;
	page: string;
};

export interface DomEvent extends Event {
	target: EventTarget & Element & HTMLFormElement;
}

export interface Internal {
	eventsBank: ServerEvents[];
	startTime: number;
	reload: boolean;
	currentUrl: string;
	currentRef: string;
	timeOnPage: number;
	pageId: string;
	sessionId: string;
	sdkVersion: string;
}

export interface InitInfo {
	pathname: string;
	host: string;
	referrer: string;
	queryParams: {
		[k: string]: string;
	};
	screenWidth: number;
	language: string;
}