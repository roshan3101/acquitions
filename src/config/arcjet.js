import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetMode = process.env.NODE_ENV === 'development' ? 'DRY_RUN' : 'LIVE';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: arcjetMode }),
    detectBot({
      mode: arcjetMode,
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
      ],
      block: ["AUTOMATED"], // Only block automated bots, not API clients
    }),
    slidingWindow({
        mode: arcjetMode,
        interval: '2s',
        max: 5
    })
  ],
});

export default aj;