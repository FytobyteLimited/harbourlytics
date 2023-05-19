import isbot from "isbot";
import z from "zod";
import isLocalhost from "../utils/detect/isLocalHost";
import { getLocation } from "../utils/detect/getLocation";
import { browserName, detectOS } from "detect-browser";
import { getDevice } from "../utils/detect/getDevice";
import { getIpAddress } from "../utils/detect/getIpAddress";
import { ApiPostHandler } from "../../../router/type";
import { GenericError } from "../../../error";
import { RootApiTrackerSchema } from "../../schema";



export const SessionPostSchema = RootApiTrackerSchema.merge(z.object({
    data: z.object({
        pathname: z.string(),
        referrer: z.string(),
        screenWidth: z.number(),
        language: z.string(),
        queryParams: z.object({ utm_source: z.string().optional() }).optional(),
        host: z.string(),
    })
}))
export type SessionPostInput = z.infer<typeof SessionPostSchema>


export const sessionPost: ApiPostHandler<SessionPostInput> = async (req, options) => {
    if (isbot(req.headers['user-agent'])) {
        return { message: 'bot', code: 200 }
    }

    //if GDPR compliance is enabled, use ip address as user id
    if (!req.body.userId) {
        req.body.userId = getIpAddress(req) as string
    }
    const body = SessionPostSchema.safeParse(req.body)
    if (body.success) {
        const { sessionId, data, userId } = body.data
        const { referrer, language, queryParams, screenWidth } = data
        const ipAddress = options.environment === "test" ? "155.252.206.205" : getIpAddress(req) as string
        if (!await isLocalhost(ipAddress)) {
            const location = !options.disableLocation ? options.getLocation ? await options.getLocation().catch(() => null) : await getLocation(ipAddress, req).catch(() => null) : { city: null, country: null }
            if (!location && !options.disableLocation) return { message: "Invalid location", code: 400 }
            const { city, country } = location ? location : { city: null, country: null }
            const adapter = options.adapter
            const userAgent = req.headers['user-agent'] as string
            if (!userAgent) return { message: "Invalid user agent", code: 400 }
            const browser = browserName(userAgent);
            const os = detectOS(userAgent);
            const device = os ? getDevice(screenWidth, os) : null;
            try {
                adapter.connect && await adapter.connect()
                const res = await adapter.tracker.createSession({
                    city, country, userId, language, referrer, id: sessionId,
                    browser,
                    device,
                    os,
                    duration: 0,
                    queryParams: JSON.stringify(queryParams),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                adapter.disconnect && await adapter.disconnect()
                return {
                    message: "success",
                    code: 200,
                    data: res
                }
            } catch (e) {
                return {
                    message: "error",
                    code: 400,
                }
            }

        } else {
            return {
                message: "localhost",
                code: 200
            }
        }
    } else {
        throw new GenericError('Invalid request body', { path: "/session" })
    }
}