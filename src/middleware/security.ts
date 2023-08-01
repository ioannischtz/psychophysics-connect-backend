import { deepmerge } from "deepmerge-ts";
import helmet, { HelmetOptions } from "helmet";

const helmetDefaults: HelmetOptions = {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Allowing inline scripts and eval (for development only)
      styleSrc: ["'self'", "'unsafe-inline'"], // Allowing inline styles (for development only)
      imgSrc: ["'self'", "data:", "blob:"], // Allowing images from the same origin and data URIs
      mediaSrc: ["'self'", "data:", "blob:"], // Allowing images from the same origin and data URIs
      fontSrc: ["'self'", "data:"], // Allowing fonts from the same origin and data URIs
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  originAgentCluster: false,
  dnsPrefetchControl: true, // Controls browser DNS prefetching
  frameguard: { action: "sameorigin" }, // Prevent Clickjacking attacks by allowing frames from the same origin
  hidePoweredBy: true, // Remove the 'X-Powered-By' header and set a custom value
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true }, // Enable HTTP Strict Transport Security (HSTS) for one year
  referrerPolicy: { policy: "no-referrer" }, // Reduce the amount of information leaked via the Referer header
  xssFilter: true, // Mitigate the risk of XSS attacks by enabling the XSS Filter
};

type HelmetMiddleware = ReturnType<typeof helmet>;

export default (config: Partial<HelmetOptions> = {}): HelmetMiddleware => {
  const helmetConfig = deepmerge(helmetDefaults, config);
  return helmet(helmetConfig as HelmetOptions);
};
