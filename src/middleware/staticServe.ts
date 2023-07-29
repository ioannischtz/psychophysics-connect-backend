import express, { RequestHandler } from "express";

type ExpressStaticOptions = {
  index?: boolean | string | string[];
  maxAge?: number | string;
  dotfiles?: "allow" | "deny" | "ignore";
  etag?: boolean;
  extensions?: string[] | false;
  fallthrough?: boolean;
  immutable?: boolean;
  lastModified?: boolean;
  setHeaders?: (res: any, path: string, stat: any) => any;
};

const defaultOptions: ExpressStaticOptions = {
  index: false,
  maxAge: 3600000, // 1 hour in milliseconds
  dotfiles: "ignore",
  etag: true,
  extensions: false,
  fallthrough: true,
  immutable: false,
  lastModified: true,
  setHeaders: undefined,
};

const staticServe = (
  root: string,
  options?: Partial<ExpressStaticOptions>,
): RequestHandler => {
  const mergedOptions: ExpressStaticOptions = {
    ...defaultOptions,
    ...options,
  };
  return express.static(root, mergedOptions);
};

export default staticServe;
