import { ActivityType, PresenceData } from "discord.js";
import { DixtPlugin } from "dixt";

import { name } from "../package.json";

type DynamicPresenceData = PresenceData | (() => PresenceData);

export type DixtPluginPresenceOptions = {
  interval?: number;
  presences?: DynamicPresenceData[];
};

export const optionsDefaults = {
  interval: 15,
  presences: [
    {
      status: "online",
      activities: [
        {
          name: "made with dixt",
          type: ActivityType.Playing,
        },
      ],
    },
    {
      status: "dnd",
      activities: [
        {
          name: "github.com/AntoineKM/dixt",
          type: ActivityType.Watching,
        },
      ],
    },
  ],
};

const DixtPluginPresence: DixtPlugin = (
  instance,
  optionsValue?: DixtPluginPresenceOptions,
) => {
  const options = {
    ...optionsDefaults,
    ...optionsValue,
    ...(optionsValue?.presences && { presences: optionsValue.presences }),
  };

  let presenceIndex = 0;

  if (options.presences && options.presences.length > 0) {
    // every 15 seconds it will change the activity
    setInterval(
      async () => {
        const currentPresence = options.presences[presenceIndex];
        const presence =
          typeof currentPresence === "function"
            ? currentPresence()
            : currentPresence;

        instance.client.user?.setPresence(presence as PresenceData);

        presenceIndex =
          presenceIndex === options.presences.length - 1
            ? 0
            : presenceIndex + 1;
      },
      1000 * (options.interval >= 15 ? options.interval : 15),
    );
  }

  return {
    name,
  };
};

export default DixtPluginPresence;
