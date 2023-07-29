import zlib from "zlib";
import bytes from "bytes";
import { Stream } from "stream";
import createHttpError from "http-errors";
import compressible from "compressible";
import { NextFunction, Request, Response } from "express";
import isJSON from "../utils/isJSON.js";
import { Middleware } from "middleware.js";

export type EncodingMethods = {
  gzip: (options?: zlib.ZlibOptions | undefined) => zlib.Gzip;
  deflate: (options?: zlib.ZlibOptions | undefined) => zlib.Deflate;
  br: (options?: zlib.BrotliOptions | undefined) => zlib.BrotliCompress;
  [key: string]: (
    options?: zlib.ZlibOptions | zlib.BrotliOptions | undefined,
  ) => zlib.Gzip | zlib.Deflate | zlib.BrotliCompress;
};

export type EncodingMethodDefaults = {
  gzip: zlib.ZlibOptions;
  deflate: zlib.ZlibOptions;
  br: zlib.BrotliOptions;
  [key: string]: zlib.ZlibOptions | zlib.BrotliOptions;
};

export class Encodings {
  wildcardAcceptEncoding: string[];
  preferredEncodings: string[];
  reDirective: RegExp;
  encodingWeights: Map<string, number>;
  static encodingMethods: EncodingMethods = {
    gzip: zlib.createGzip,
    deflate: zlib.createDeflate,
    br: zlib.createBrotliCompress,
  };
  encodingMethodDefaultOptions: EncodingMethodDefaults = {
    gzip: {},
    deflate: {},
    br: {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
      },
    },
  };

  constructor(options?: {
    wildcardAcceptEncoding?: string[];
    preferredEncodings?: string[];
    reDirective?: RegExp;
  }) {
    this.wildcardAcceptEncoding = options?.wildcardAcceptEncoding || [
      "gzip",
      "defalte",
    ];
    this.preferredEncodings = options?.preferredEncodings || [
      "br",
      "gzip",
      "defalte",
    ];
    this.reDirective = options?.reDirective ||
      /^\s*(gzip|compress|deflate|br|identity|\*)\s*(?:;\s*q\s*=\s*(\d(?:\.\d)?))?\s*$/;

    this.encodingWeights = new Map<string, number>();
  }

  parseAcceptEncoding(acceptEncoding: string = "*") {
    const { encodingWeights, reDirective } = this;

    acceptEncoding.split(",").forEach((directive) => {
      const match = reDirective.exec(directive);
      if (!match) return; // not a supported encoding above

      const encoding = match[1];

      // weight must be in [0, 1]
      let weight = match[2] && !isNaN(Number(match[2]))
        ? parseFloat(match[2])
        : 1;
      weight = Math.max(weight, 0);
      weight = Math.min(weight, 1);

      if (encoding === "*") {
        // set weights for the default encodings
        this.wildcardAcceptEncoding.forEach((enc) => {
          if (!encodingWeights.has(enc)) encodingWeights.set(enc, weight);
        });
        return;
      }
      encodingWeights.set(encoding, weight);
    });
  }

  getPrefferedContentEncoding() {
    const { encodingWeights, preferredEncodings } = this;

    // get ordered list of accepted encodings
    const acceptEncodings = Array.from(encodingWeights.keys())
      //sort by weight
      .sort(
        (a, b) => (encodingWeights.get(b) ?? 0) - (encodingWeights.get(a) ?? 0),
      )
      //filter by supported encodings
      .filter(
        (encoding) =>
          encoding === "identity" ||
          typeof Encodings.encodingMethods[encoding] === "function",
      );

    // group them by weights
    const weightClasses = new Map();
    acceptEncodings.forEach((encoding) => {
      const weight = encodingWeights.get(encoding);
      if (!weightClasses.has(weight)) weightClasses.set(weight, new Set());
      weightClasses.get(weight).add(encoding);
    });

    // search by weight, descending
    const weights = Array.from(weightClasses.keys()).sort((a, b) => b - a);
    for (let i = 0; i < weights.length; i++) {
      // encodings at this weight
      const encodings = weightClasses.get(weights[i]);
      // return the first encoding in the prefered list
      for (let j = 0; j < preferredEncodings.length; j++) {
        const preferredEncoding = preferredEncodings[j];
        if (encodings.has(preferredEncoding)) return preferredEncoding;
      }
    }

    // no encoding matches, check to see if the client set identity, q=0
    if (encodingWeights.get("identity") === 0) {
      throw createHttpError(
        406,
        "Please accept br, gzip, deflate, or identity",
      );
    }

    // by default, return nothing
    return "identity";
  }
}

/**
 * Regex to match no-transform directive in a cache-control header
 */
const NO_TRANSFORM_REGEX = /(?:^|,)\s*?no-transform\s*?(?:,|$)/;

/**
 * empty body statues.
 */
const emptyBodyStatues = new Set([204, 205, 304]);

/**
 * Compress middleware.
 *
 * @param {Object} [options]
 * @return {Function}
 * @api public
 */

// CompressParams interface
export interface CompressParams {
  filter: (mimeType: string) => boolean | undefined;
  threshold: number | string;
  defaultEncoding: string;
}

// CompressAlgorithms interface
export interface CompressAlgorithms {
  br?: boolean;
  gzip?: boolean;
  deflate?: boolean;
}

// CompressOptions interface (combined using intersection &)
export interface CompressOptions extends CompressParams, CompressAlgorithms {
  [key: string]:
    | ((mimeType: string) => boolean | undefined)
    | number
    | string
    | boolean
    | undefined;
}

export default (
  options: CompressOptions = {
    filter: compressible,
    threshold: 1024,
    defaultEncoding: "identity",
  },
): Middleware => {
  let { filter, threshold, defaultEncoding } = options;
  if (typeof threshold === "string") threshold = bytes(threshold);

  const DefaultEncodings = new Encodings();
  // `options.br = false` would remove it as a preferred encoding
  const preferredEncodings = DefaultEncodings.preferredEncodings.filter(
    (encoding) => options[encoding] !== false && options[encoding] !== null,
  );
  const encodingOptions: Partial<EncodingMethodDefaults> = {};
  preferredEncodings.forEach((encoding) => {
    encodingOptions[encoding as keyof EncodingMethodDefaults] = {
      ...DefaultEncodings.encodingMethodDefaultOptions[encoding],
      ...((options[encoding as keyof CompressOptions] as object) || {}),
    };
  });

  Object.assign(compressMiddleware, {
    preferredEncodings,
    encodingOptions,
  });

  return compressMiddleware;

  async function compressMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.vary("Accept-Encoding");

    if (
      // early exit if there's no content body or the body is already encoded
      !req.body ||
      res.headersSent ||
      !res.writable ||
      req.method === "HEAD" ||
      emptyBodyStatues.has(+res.statusCode) ||
      (res.getHeader("Content-Encoding") as string) ||
      // forced compression or implied
      !filter(res.getHeader("Content-type") as string) ||
      // don't compress for cache-control: no-transform
      //https://tools.ietf.org/html/rfc7234#section-5.2.1.6
      NO_TRANSFORM_REGEX.test(res.get("Cache-Control") ?? "") ||
      // don't compress if the current response is below threshold
      (threshold &&
        res.hasHeader("Content-Length") &&
        Number(res.getHeader("Content-Length") as string) < Number(threshold))
    ) {
      next();
    }

    // get the preferred content encoding
    const encodings = new Encodings({ preferredEncodings });
    encodings.parseAcceptEncoding(
      (res.getHeader("Accept-Encoding") as string) || defaultEncoding,
    );
    const encoding = encodings.getPrefferedContentEncoding();

    // if identity === no compression
    if (encoding === "identity") next();

    /** begin compression logic **/

    // json
    if (isJSON(req.body)) req.body = JSON.stringify(req.body);

    res.setHeader("Content-Encoding", encoding);
    res.removeHeader("Content-Length");

    const compress = Encodings.encodingMethods[encoding];
    const stream = compress(encodingOptions[encoding]);
    if (req.body instanceof Stream) {
      req.body.pipe(stream).pipe(res);
      next();
    }
    stream.end(req.body);
    stream.pipe(res);
    next();
  }
};
