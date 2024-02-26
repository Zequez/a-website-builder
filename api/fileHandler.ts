import type { VercelRequest, VercelResponse } from "@vercel/node";
import "dotenv/config";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (!process.env.BASE_HOSTNAME)
    throw "BASE_HOSTNAME environment variable not set";
  if (!request.headers.host) throw "No host?";
  if (!request.url) throw "No URL?";

  const url = new URL(`${request.url}`, `https://${request.headers.host}`);
  console.log(url);

  const subdomain = url.hostname.replace(
    new RegExp(`.${process.env.BASE_HOSTNAME}$`),
    ""
  );

  if (subdomain === url.hostname) {
    return response.status(200).json({ title: `SHOW APP HERE` });
  } else {
    return response
      .status(200)
      .json({ title: `Hello from server ${subdomain} -> ${url.pathname}` });
  }
}
