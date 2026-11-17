import { warnIfPartsIgnored } from "../Warnings.ts";
import { Word, eq } from "../shell/Word.ts";
import { parse, COMMON_SUPPORTED_ARGS } from "../parse.ts";
import type { Request, RequestUrl, Warnings } from "../parse.ts";

export const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,

  "location",
  "no-location",
  "location-trusted",
  "no-location-trusted",
  "max-redirs",

  "insecure",
  "cert",
  "cert-type",
  "key",
  "key-type",
  "cacert",
  "capath",

  "proxy",
  "proxy-user",
  "noproxy",

  "max-time",
  "connect-timeout",
  "compressed",
  "no-compressed",

  "form",
  "form-string",

  "cookie-jar",
  "include",

  "unix-socket",
  "output",
  "upload-file",

  "ipv4",
  "ipv6",
  "netrc",
  "netrc-optional",
  "http1.0",
  "http1.1",
  "http2",
  "http3",

  "verbose",
  "silent",
  "next",
]);

// https://www.nushell.sh/book/working_with_strings.html
// Single quotes don't have an escape in Nushell, so strings that contain one
// use a raw string with enough '#'s to avoid the closing delimiter.
function escapeDoubleQuoted(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\$/g, "\\$")
    .replace(/\(/g, "\\(");
}

const unprintable = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/;
export function reprStr(s: string): string {
  if (unprintable.test(s)) {
    return (
      '"' +
      escapeDoubleQuoted(s).replace(unprintable, (c: string) => {
        switch (c) {
          case "\x00":
            return "\\0";
          case "\x07":
            return "\\a";
          case "\b":
            return "\\b";
          case "\x1b":
            return "\\e";
          case "\f":
            return "\\f";
          case "\r":
            return "\\r";
        }
        const hex = (c.codePointAt(0) as number).toString(16);
        return "\\u{" + hex + "}";
      }) +
      '"'
    );
  }
  if (s.includes("'")) {
    let hashes = "#";
    while (s.includes("'" + hashes)) {
      hashes += "#";
    }
    return `r${hashes}'${s}'${hashes}`;
  }
  return "'" + s + "'";
}

function envRef(name: string): string {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    return "$env." + name;
  }
  return '$env."' + escapeDoubleQuoted(name) + '"';
}

function warnCommandSubstitution(warnings: Warnings) {
  warnings.push([
    "nu-command-substitution",
    "Nushell subexpressions run Nushell commands, not Bash commands; " +
      "the generated (^...) expression may need to be adjusted",
  ]);
}

export function repr(w: Word, warnings: Warnings): string {
  const tokens = w.tokens;
  if (tokens.length === 1) {
    const t = tokens[0];
    if (typeof t === "string") {
      return reprStr(t);
    }
    if (t.type === "variable") {
      return envRef(t.value);
    }
    warnCommandSubstitution(warnings);
    return "(^" + t.value + ")";
  }

  // Multiple tokens need string interpolation to preserve variables.
  let code = '$"';
  for (const t of tokens) {
    if (typeof t === "string") {
      code += escapeDoubleQuoted(t);
    } else if (t.type === "variable") {
      code += "(" + envRef(t.value) + ")";
    } else {
      warnCommandSubstitution(warnings);
      code += "(^" + t.value + ")";
    }
  }
  return code + '"';
}

const nuMethods: { [key: string]: string } = {
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
  HEAD: "head",
  OPTIONS: "options",
};

function maxTime(w: Word, warnings: Warnings): string | undefined {
  const s = w.toString();
  if (/^\d+(\.\d+)?$/.test(s)) {
    const seconds = Number(s);
    return Number.isInteger(seconds)
      ? seconds + "sec"
      : Math.round(seconds * 1000) + "ms";
  }
  warnings.push([
    "nu-max-time",
    "Nushell's --max-time expects a duration literal, " +
      "so a variable can't be used here: " +
      s,
  ]);
  return undefined;
}

function requestToNushell(
  request: Request,
  url: RequestUrl,
  warnings: Warnings,
): string {
  warnIfPartsIgnored(request, warnings, {
    multipleUrls: true,
    dataReadsFile: true,
  });

  const method = url.method.toString().toUpperCase();
  const nuMethod = nuMethods[method];
  if (!nuMethod) {
    warnings.push([
      "nu-method",
      "Nushell's http command doesn't support the " +
        method +
        " method, using GET instead",
    ]);
  }

  const flags: string[] = [];

  const headers: string[] = [];
  let contentType: string | undefined;
  for (const [name, value] of request.headers) {
    if (eq(name.toLowerCase(), "content-type") && value) {
      contentType = repr(value, warnings);
    } else if (value === null) {
      warnings.push([
        "nu-unset-header",
        "Nushell can't disable the " + name.toString() + " header",
      ]);
    } else {
      headers.push(repr(name, warnings) + ": " + repr(value, warnings));
    }
  }
  if (headers.length) {
    flags.push("--headers { " + headers.join(", ") + " }");
  }
  if (!contentType && request.multipartUploads) {
    contentType = "'multipart/form-data'";
  }
  if (contentType) {
    flags.push("--content-type " + contentType);
  }

  if (url.auth) {
    const [user, password] = url.auth;
    if (request.authType !== "basic" && request.authType !== "none") {
      warnings.push([
        "nu-auth",
        "Nushell's http command only supports basic authentication, not " +
          request.authType,
      ]);
    }
    flags.push("--user " + repr(user, warnings));
    if (password.toBool()) {
      flags.push("--password " + repr(password, warnings));
    }
  }

  if (request.timeout) {
    const duration = maxTime(request.timeout, warnings);
    if (duration) {
      flags.push("--max-time " + duration);
    }
  }
  if (request.connectTimeout) {
    warnings.push([
      "nu-connect-timeout",
      "Nushell's http command has no separate connect timeout",
    ]);
  }
  if (request.insecure) {
    flags.push("--insecure");
  }
  // curl doesn't follow redirects by default, but Nushell does.
  if (!request.followRedirects && !request.followRedirectsTrusted) {
    flags.push("--redirect-mode manual");
  }
  if (request.maxRedirects) {
    warnings.push([
      "nu-max-redirs",
      "Nushell's http command doesn't support limiting the number of redirects",
    ]);
  }
  if (request.unixSocket) {
    flags.push("--unix-socket " + repr(request.unixSocket, warnings));
  }

  let data: string | undefined;
  if (request.multipartUploads) {
    const fields: string[] = [];
    for (const part of request.multipartUploads) {
      if ("contentFile" in part) {
        if (eq(part.contentFile, "-")) {
          warnings.push([
            "nu-multipart-stdin",
            "Nushell's http command can't read multipart fields from stdin",
          ]);
        }
        fields.push(
          repr(part.name, warnings) +
            ": (open --raw " +
            repr(part.contentFile, warnings) +
            ")",
        );
      } else {
        fields.push(
          repr(part.name, warnings) + ": " + repr(part.content, warnings),
        );
      }
    }
    data = "{ " + fields.join(", ") + " }";
  } else if (url.uploadFile) {
    if (eq(url.uploadFile, "-") || eq(url.uploadFile, ".")) {
      warnings.push([
        "nu-upload-stdin",
        "Nushell's http command can't upload from stdin",
      ]);
    }
    data = "(open --raw " + repr(url.uploadFile, warnings) + ")";
  } else if (
    request.dataReadsFile &&
    request.dataArray &&
    request.dataArray.length === 1 &&
    !(request.dataArray[0] instanceof Word) &&
    !request.dataArray[0].name
  ) {
    data = "(open --raw " + reprStr(request.dataReadsFile) + ")";
  } else if (request.data) {
    data = repr(request.data, warnings);
  }

  if (data && !["POST", "PUT", "PATCH"].includes(method)) {
    warnings.push([
      "nu-data-method",
      "Nushell's http " +
        (nuMethod || method.toLowerCase()) +
        " command can't send a request body",
    ]);
    data = undefined;
  }

  // These curl options have no equivalent in Nushell's http commands.
  if (request.proxy || request.proxyAuth || request.noproxy) {
    warnings.push([
      "nu-proxy",
      "Nushell's http command uses the http_proxy/https_proxy environment variables",
    ]);
  }
  if (request.cookieFiles || request.cookieJar) {
    warnings.push([
      "nu-cookie-jar",
      "Nushell's http command doesn't support cookie files",
    ]);
  }
  if (request.cert || request.key || request.cacert || request.capath) {
    warnings.push([
      "nu-client-cert",
      "Nushell's http command doesn't support client certificates or custom CAs",
    ]);
  }
  if (request.include) {
    warnings.push([
      "nu-include",
      "Nushell's http command can return a record with --full, but not raw response headers",
    ]);
  }
  if (request.httpVersion || request.compressed === false) {
    warnings.push([
      "nu-protocol",
      "Nushell's http command doesn't let you choose the HTTP version or disable compression",
    ]);
  }

  const saving = url.output && !eq(url.output, "-");
  if (saving) {
    flags.push("--raw");
  }

  // Nushell has no backslash line continuation, so keep commands on one line.
  const args = [...flags, repr(url.url, warnings)];
  if (data) {
    args.push(data);
  }
  return (
    "http " +
    (nuMethod || "get") +
    " " +
    args.join(" ") +
    (saving ? " | save --force " + repr(url.output as Word, warnings) : "") +
    "\n"
  );
}

export function _toNushell(
  requests: Request[],
  warnings: Warnings = [],
): string {
  const commands: string[] = [];
  for (const request of requests) {
    for (const url of request.urls) {
      commands.push(requestToNushell(request, url, warnings));
    }
  }
  return commands.join("\n\n");
}

export function toNushellWarn(
  curlCommand: string | string[],
  warnings: Warnings = [],
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  return [_toNushell(requests, warnings), warnings];
}

export function toNushell(curlCommand: string | string[]): string {
  return toNushellWarn(curlCommand)[0];
}
